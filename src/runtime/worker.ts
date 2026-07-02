/// <reference lib="webworker" />

import { type ApiCallInput, buildRequest, type BuiltRequest, callTraqApi } from "../data/request";
import type { OperationMeta } from "../features/operations/types";
import type {
  ApiCallLogInput,
  ConsoleLog,
  MutationLog,
  NetworkLog,
  RuntimeErrorPayload,
  RuntimeScopeVariable,
} from "./types";
import type { WorkerInboundMessage, WorkerOutboundMessage, WorkerRunMessage } from "./messages";

let runtimeScope = Object.create(null) as Record<string, unknown>;

const rateState = new Map<string, number>();
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RUNTIME_VARIABLES = 80;
const MAX_TYPE_DEPTH = 3;
const MAX_ARRAY_SAMPLE = 8;
const MAX_OBJECT_PROPERTIES = 24;
const MAX_TYPE_LENGTH = 900;
const BUILTIN_SCOPE_NAMES = new Set([
  "api",
  "util",
  "console",
  "me",
  "users",
  "channels",
  "groups",
]);
const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/u;

const post = (message: WorkerOutboundMessage): void => {
  self.postMessage(message);
};

/**
 * Converts runtime values into something that can cross the worker boundary.
 * Non-cloneable objects are intentionally reduced to strings so a console log
 * or cell result never breaks message delivery.
 */
const safeValue = (value: unknown): unknown => {
  try {
    structuredClone(value);
    return value;
  } catch {
    return String(value);
  }
};

/** Normalizes thrown values into the structured error payload shown by cells. */
const serializeError = (error: unknown): RuntimeErrorPayload => {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    return {
      name: typeof record.name === "string" ? record.name : "Error",
      message: typeof record.message === "string" ? record.message : String(error),
      stack: typeof record.stack === "string" ? record.stack : undefined,
      status: typeof record.status === "number" ? record.status : undefined,
      requestId:
        typeof record.requestId === "string" || record.requestId === null
          ? record.requestId
          : undefined,
      body: record.body,
    };
  }
  return {
    name: "Error",
    message: String(error),
  };
};

const isValidIdentifier = (name: string): boolean => IDENTIFIER_PATTERN.test(name);

const typeForConstructorName = (name: string): string | null => {
  if (
    [
      "ArrayBuffer",
      "Blob",
      "Date",
      "Error",
      "File",
      "FormData",
      "Headers",
      "ReadableStream",
      "RegExp",
      "Request",
      "Response",
      "URL",
      "URLSearchParams",
    ].includes(name)
  ) {
    return name;
  }
  return null;
};

const unionTypes = (types: string[]): string => {
  const unique = [...new Set(types)];
  if (unique.length === 0) return "unknown";
  if (unique.includes("unknown")) return "unknown";
  if (unique.length > 5) return "unknown";
  return unique.join(" | ");
};

const quoteObjectKey = (key: string): string => {
  return isValidIdentifier(key) ? key : JSON.stringify(key);
};

const limitTypeLength = (typeName: string): string => {
  return typeName.length > MAX_TYPE_LENGTH ? "unknown" : typeName;
};

/**
 * Infers lightweight TypeScript declarations for values created in executed
 * cells. It samples arrays/objects and caps depth/length to keep Monaco extra
 * libs small even when users assign large API responses.
 */
const inferRuntimeType = (value: unknown, depth = 0, seen = new WeakSet<object>()): string => {
  if (value === null) return "null";

  switch (typeof value) {
    case "undefined":
      return "undefined";
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "bigint":
      return "bigint";
    case "symbol":
      return "symbol";
    case "function":
      return "(...args: unknown[]) => unknown";
    case "object":
      break;
  }

  if (depth >= MAX_TYPE_DEPTH) return "unknown";
  if (seen.has(value)) return "unknown";
  seen.add(value);

  if (Array.isArray(value)) {
    const itemType = unionTypes(
      value.slice(0, MAX_ARRAY_SAMPLE).map((item) => inferRuntimeType(item, depth + 1, seen)),
    );
    return limitTypeLength(`${itemType.includes(" | ") ? `(${itemType})` : itemType}[]`);
  }

  if (value instanceof Map) {
    const entries = [...value.entries()].slice(0, MAX_ARRAY_SAMPLE);
    return limitTypeLength(
      `Map<${unionTypes(entries.map(([key]) => inferRuntimeType(key, depth + 1, seen)))}, ${unionTypes(entries.map(([, item]) => inferRuntimeType(item, depth + 1, seen)))}>`,
    );
  }

  if (value instanceof Set) {
    const items = [...value.values()].slice(0, MAX_ARRAY_SAMPLE);
    return limitTypeLength(
      `Set<${unionTypes(items.map((item) => inferRuntimeType(item, depth + 1, seen)))}>`,
    );
  }

  const constructorName = Object.prototype.toString.call(value).slice("[object ".length, -1);
  const builtInType = typeForConstructorName(constructorName);
  if (builtInType) return builtInType;

  const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_OBJECT_PROPERTIES);
  if (entries.length === 0) return "Record<string, unknown>";

  return limitTypeLength(
    `{\n${entries
      .map(([key, item]) => `  ${quoteObjectKey(key)}: ${inferRuntimeType(item, depth + 1, seen)};`)
      .join("\n")}\n}`,
  );
};

const snapshotRuntimeScope = (): RuntimeScopeVariable[] => {
  return Object.entries(runtimeScope)
    .filter(([name]) => {
      if (!isValidIdentifier(name) || BUILTIN_SCOPE_NAMES.has(name)) return false;
      return !(name in globalThis);
    })
    .slice(0, MAX_RUNTIME_VARIABLES)
    .map(([name, value]) => ({
      name,
      typeName: inferRuntimeType(value),
    }));
};

const postRuntimeScope = (): void => {
  post({ type: "runtime-scope", variables: snapshotRuntimeScope() });
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/** Wraps fetch with an AbortController and reports timeouts as regular Errors. */
const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as { name?: string }).name === "AbortError") {
      throw Object.assign(new Error(`Request timed out after ${timeoutMs / 1000}s.`), {
        name: "TimeoutError",
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const fetchRequestWithTimeout = (request: Request): Promise<Response> => fetchWithTimeout(request);

/**
 * Applies a small client-side delay per broad route bucket. This is not a full
 * traQ rate-limit implementation; it just prevents accidental rapid loops from
 * hammering the same API family.
 */
const waitForRateLimit = async (operation: OperationMeta): Promise<void> => {
  const bucket = operation.path.split("/").slice(0, 2).join("/") || "default";
  const now = Date.now();
  const next = rateState.get(bucket) ?? 0;
  const wait = Math.max(0, next - now);
  const spacing = Math.max(100, operation.cost * 160);
  rateState.set(bucket, now + wait + spacing);
  if (wait > 0) await sleep(wait);
};

const isMutation = (operation: OperationMeta): boolean => {
  return !["GET", "HEAD", "OPTIONS"].includes(operation.method);
};

const apiCallLogInput = (input: ApiCallInput): ApiCallLogInput => {
  return {
    path: input.path,
    query: input.query as Record<string, unknown> | undefined,
    body: safeValue(input.body),
    formKeys: input.form ? Object.keys(input.form) : undefined,
  };
};

const API_CALL_PREVIEW_MAX_LENGTH = 700;
const API_CALL_PREVIEW_MAX_DEPTH = 3;
const API_CALL_PREVIEW_MAX_ITEMS = 8;

const formatObjectKey = (key: string): string => {
  return isValidIdentifier(key) ? key : JSON.stringify(key);
};

const formatStringLiteral = (value: string): string => {
  return `'${value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")}'`;
};

const shortenApiCallPreview = (preview: string): string => {
  if (preview.length <= API_CALL_PREVIEW_MAX_LENGTH) return preview;
  return `${preview.slice(0, API_CALL_PREVIEW_MAX_LENGTH - 3)}...`;
};

const formatPreviewValue = (value: unknown, depth = 0, seen = new WeakSet<object>()): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return formatStringLiteral(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "symbol" || typeof value === "function") return String(value);
  if (depth >= API_CALL_PREVIEW_MAX_DEPTH) return "...";

  if (value instanceof Blob) {
    return value instanceof File
      ? `{ file: ${formatStringLiteral(value.name)}, size: ${value.size} }`
      : `{ blob: true, size: ${value.size} }`;
  }

  if (Array.isArray(value)) {
    const items = value
      .slice(0, API_CALL_PREVIEW_MAX_ITEMS)
      .map((item) => formatPreviewValue(item, depth + 1, seen));
    if (value.length > API_CALL_PREVIEW_MAX_ITEMS) items.push("...");
    return `[${items.join(", ")}]`;
  }

  if (typeof value === "object") {
    if (seen.has(value)) return "...";
    seen.add(value);
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, item]) => item !== undefined,
    );
    const items = entries
      .slice(0, API_CALL_PREVIEW_MAX_ITEMS)
      .map(
        ([key, item]) => `${formatObjectKey(key)}: ${formatPreviewValue(item, depth + 1, seen)}`,
      );
    if (entries.length > API_CALL_PREVIEW_MAX_ITEMS) items.push("...");
    return `{ ${items.join(", ")} }`;
  }

  return String(value);
};

const formatApiCallPreview = (operation: OperationMeta, input: ApiCallInput): string => {
  const callInput = {
    path: input.path,
    query: input.query,
    body: input.body,
    form: input.form
      ? Object.fromEntries(Object.entries(input.form).map(([key, value]) => [key, value]))
      : undefined,
  };
  const entries = Object.entries(callInput).filter(([, value]) => value !== undefined);
  const argumentsPreview =
    entries.length > 0 ? formatPreviewValue(Object.fromEntries(entries)) : "";
  return shortenApiCallPreview(`api.${operation.operationId}(${argumentsPreview})`);
};

const normalizePayload = (operation: OperationMeta, payload: unknown): unknown => {
  if (operation.operationId === "getChannels" && Array.isArray(payload)) {
    return { public: payload };
  }
  return payload;
};

const findBeforeOperation = (
  operations: OperationMeta[],
  operation: OperationMeta,
): OperationMeta | null =>
  operations.find((candidate) => candidate.path === operation.path && candidate.method === "GET") ??
  null;

/**
 * Reads the current resource before a mutation so the Network Log can show what
 * changed and, for JSON PUT/PATCH calls, offer an automatic revert request.
 */
const fetchBeforeState = async ({
  operations,
  operation,
  apiBase,
  accessToken,
  input,
}: {
  operations: OperationMeta[];
  operation: OperationMeta;
  apiBase: string;
  accessToken: string;
  input: ApiCallInput;
}): Promise<unknown> => {
  const beforeOperation = findBeforeOperation(operations, operation);
  if (!beforeOperation) return undefined;
  const result = await callTraqApi({
    operation: beforeOperation,
    apiBase,
    accessToken,
    input: {
      path: input.path,
      query: input.query,
    },
    fetchRequest: fetchRequestWithTimeout,
  });
  return result.response.ok ? safeValue(result.payload) : undefined;
};

const createMutationLog = (
  message: WorkerRunMessage,
  operation: OperationMeta,
  input: ApiCallInput,
  request: BuiltRequest,
  response: Response,
  payload: unknown,
  before: unknown,
): MutationLog => {
  const canAutoRevert =
    before !== undefined &&
    (operation.method === "PUT" || operation.method === "PATCH") &&
    !input.form;

  return {
    id: crypto.randomUUID(),
    cellId: message.cellId,
    operationId: operation.operationId,
    method: operation.method,
    url: request.url,
    status: response.status,
    requestId: response.headers.get("x-request-id"),
    request: apiCallLogInput(input),
    before,
    response: safeValue(payload),
    createdAt: Date.now(),
    revert: canAutoRevert
      ? {
          status: "available",
          request: {
            method: operation.method,
            url: request.url,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(before),
          },
        }
      : before !== undefined
        ? {
            status: "manual",
            reason:
              operation.method === "DELETE"
                ? "Deleted resource was captured, but automatic recreation is API-specific."
                : "Automatic revert is only enabled for JSON PUT/PATCH requests.",
          }
        : {
            status: "unavailable",
            reason: "Previous resource state could not be captured before the edit.",
          },
  };
};

/**
 * Builds the notebook-facing api object from operation metadata. Each method is
 * responsible for auth checks, read-only enforcement, rate pacing, network logs,
 * response normalization, and mutation history.
 */
const createApi = (
  message: WorkerRunMessage,
): Record<string, (input?: ApiCallInput) => Promise<unknown>> => {
  const entries = message.operations.map((operation) => {
    const call = async (input: ApiCallInput = {}) => {
      const mutation = isMutation(operation);
      const requestPreview = buildRequest(operation, message.apiBase, input);
      if (message.readOnly && mutation) {
        const request = apiCallLogInput(input);
        const preview = formatApiCallPreview(operation, input);
        const warning = `api.${operation.operationId} was captured as a dry-run in read-only API mode.`;
        post({
          type: "warning",
          cellId: message.cellId,
          message: warning,
          dryRun: preview,
        });
        return {
          dryRun: true,
          call: preview,
          api: `api.${operation.operationId}`,
          operationId: operation.operationId,
          method: operation.method,
          url: requestPreview.url,
          arguments: request,
        };
      }

      if (!message.accessToken) {
        throw Object.assign(new Error("Login is required before calling traQ API."), {
          name: "AuthError",
        });
      }

      await waitForRateLimit(operation);
      requestPreview.headers.Authorization = `Bearer ${message.accessToken}`;
      const before =
        mutation && ["PUT", "PATCH", "DELETE"].includes(operation.method)
          ? await fetchBeforeState({
              operations: message.operations,
              operation,
              apiBase: message.apiBase,
              accessToken: message.accessToken,
              input,
            }).catch(() => undefined)
          : undefined;

      const startedAt = Date.now();
      const logBase: NetworkLog = {
        id: crypto.randomUUID(),
        cellId: message.cellId,
        operationId: operation.operationId,
        method: operation.method,
        url: requestPreview.url,
        startedAt,
      };
      post({ type: "network", log: logBase });

      try {
        const result = await callTraqApi({
          operation,
          apiBase: message.apiBase,
          accessToken: message.accessToken,
          input,
          fetchRequest: fetchRequestWithTimeout,
        });
        const beforeState = before;
        const payload = result.response.ok
          ? normalizePayload(operation, result.payload)
          : result.payload;
        const requestId = result.response.headers.get("x-request-id");
        post({
          type: "network",
          log: {
            ...logBase,
            url: result.request.url,
            status: result.response.status,
            ok: result.response.ok,
            requestId,
            finishedAt: Date.now(),
            durationMs: Date.now() - startedAt,
          },
        });

        if (!result.response.ok) {
          throw Object.assign(
            new Error(`HTTP ${result.response.status} from ${operation.operationId}`),
            {
              name: "HttpError",
              status: result.response.status,
              requestId,
              body: payload,
            },
          );
        }

        if (mutation) {
          post({
            type: "mutation",
            log: createMutationLog(
              message,
              operation,
              input,
              result.request,
              result.response,
              payload,
              beforeState,
            ),
          });
        }

        return payload;
      } catch (error) {
        if ((error as { name?: string }).name !== "HttpError") {
          post({
            type: "network",
            log: {
              ...logBase,
              finishedAt: Date.now(),
              durationMs: Date.now() - startedAt,
              error: serializeError(error).message,
            },
          });
        }
        throw error;
      }
    };
    return [operation.operationId, call] as const;
  });

  return Object.fromEntries(entries);
};

const createConsole = (cellId: string): Pick<Console, "log" | "info" | "warn" | "error"> => {
  const emit =
    (level: ConsoleLog["level"]) =>
    (...values: unknown[]): void => {
      post({
        type: "console",
        log: {
          id: crypto.randomUUID(),
          cellId,
          level,
          values: values.map(safeValue),
          createdAt: Date.now(),
        },
      });
    };
  return {
    log: emit("log"),
    info: emit("info"),
    warn: emit("warn"),
    error: emit("error"),
  };
};

/**
 * Finds the start offset of the final top-level statement without using a full
 * parser. The scanner tracks comments, strings, templates, and bracket depth so
 * implicit returns do not target nested expressions.
 */
const findLastTopLevelStatementStart = (code: string): number => {
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let start = 0;

  for (let index = 0; index < code.length; index += 1) {
    const char = code[index];
    const next = code[index + 1];

    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
        start = index + 1;
      }
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{" || char === "(" || char === "[") depth += 1;
    if (char === "}" || char === ")" || char === "]") {
      depth = Math.max(0, depth - 1);
    }
    if ((char === ";" || char === "\n") && depth === 0) start = index + 1;
  }

  return start;
};

/**
 * Makes notebook cells expression-friendly by returning the final top-level
 * expression when the user did not write an explicit return.
 */
const withImplicitReturn = (code: string): string => {
  if (/\breturn\b/.test(code)) return code;

  const normalized = code.replace(/[\s;]*$/u, "");
  const start = findLastTopLevelStatementStart(normalized);
  const before = normalized.slice(0, start);
  const last = normalized.slice(start).trim();
  if (!last) return code;

  if (
    /^(const|let|var|if|for|while|switch|try|catch|finally|class|function|async\s+function|import|export|throw)\b/.test(
      last,
    )
  ) {
    return code;
  }

  return `${before}\nreturn (${last});`;
};

/**
 * Rewrites top-level variable declarations into assignments against the
 * runtime scope proxy. That lets values survive across cells while leaving
 * nested declarations inside functions/blocks untouched.
 */
const rewriteTopLevelDeclarations = (code: string): string => {
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let output = "";

  for (let index = 0; index < code.length; index += 1) {
    const char = code[index];
    const next = code[index + 1];

    if (lineComment) {
      output += char;
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      output += char;
      if (char === "*" && next === "/") {
        output += next;
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      output += char + next;
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      output += char + next;
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      output += char;
      continue;
    }

    if (depth === 0) {
      const rest = code.slice(index);
      const match = /^(const|let|var)\s+([A-Za-z_$])/.exec(rest);
      const previous = index > 0 ? code[index - 1] : "";
      if (match && !/[A-Za-z0-9_$]/.test(previous)) {
        output += match[2];
        index += match[1].length + match[0].slice(match[1].length).indexOf(match[2]);
        continue;
      }
    }

    output += char;
    if (char === "{" || char === "(" || char === "[") depth += 1;
    if (char === "}" || char === ")" || char === "]") {
      depth = Math.max(0, depth - 1);
    }
  }

  return output;
};

/**
 * Provides the object used by `with (scope)`. Reads fall back to globalThis for
 * browser APIs, while writes land in runtimeScope so later cells and Monaco type
 * inference can see user-created bindings.
 */
const createScopeProxy = (scope: Record<string, unknown>): Record<PropertyKey, unknown> => {
  return new Proxy(scope, {
    has(_target, property) {
      return property !== Symbol.unscopables;
    },
    get(target, property) {
      if (property === Symbol.unscopables) return undefined;
      if (property in target) return target[property as keyof typeof target];
      return (globalThis as Record<PropertyKey, unknown>)[property];
    },
    set(target, property, value) {
      target[property as keyof typeof target] = value;
      return true;
    },
  }) as Record<PropertyKey, unknown>;
};

const runCell = async (message: WorkerRunMessage): Promise<void> => {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
    ...args: string[]
  ) => (scope: unknown) => Promise<unknown>;

  const api = createApi(message);
  const util = {
    sleep,
    isUuid(value: unknown): boolean {
      return (
        typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
      );
    },
    async pageAll<T>(
      fetchPage: (params: { limit: number; offset: number }) => Promise<T[]>,
      pageSize = 100,
    ): Promise<T[]> {
      const items: T[] = [];
      for (let offset = 0; ; offset += pageSize) {
        const page = await fetchPage({ limit: pageSize, offset });
        items.push(...page);
        if (page.length < pageSize) return items;
      }
    },
    now(): string {
      return new Date().toISOString();
    },
  };

  try {
    Object.assign(runtimeScope, {
      api,
      util,
      console: createConsole(message.cellId),
      me: message.globals.me,
      users: message.globals.users,
      channels: message.globals.channels,
      groups: message.globals.groups,
    });
    const body = rewriteTopLevelDeclarations(withImplicitReturn(message.code));
    const fn = new AsyncFunction("scope", `with (scope) {\n${body}\n}`);
    const value = await fn(createScopeProxy(runtimeScope));
    post({
      type: "success",
      runId: message.runId,
      cellId: message.cellId,
      value: safeValue(value),
    });
  } catch (error) {
    post({
      type: "error",
      runId: message.runId,
      cellId: message.cellId,
      error: serializeError(error),
    });
  } finally {
    postRuntimeScope();
  }
};

self.addEventListener("message", (event: MessageEvent<WorkerInboundMessage>) => {
  if (event.data.type === "reset") {
    runtimeScope = Object.create(null) as Record<string, unknown>;
    rateState.clear();
    postRuntimeScope();
    return;
  }
  void runCell(event.data);
});
