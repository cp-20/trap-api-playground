/// <reference lib="webworker" />

import { type ApiCallInput, buildRequest, type BuiltRequest, callTraqApi } from "../data/request";
import type { OperationMeta } from "../features/operations/types";
import type {
  ConsoleLog,
  MutationLog,
  NetworkLog,
  RuntimeErrorPayload,
  RuntimeScopeVariable,
} from "./types";
import type { WorkerInboundMessage, WorkerOutboundMessage, WorkerRunMessage } from "./messages";

const ctx = {
  state: {} as Record<string, unknown>,
  scope: Object.create(null) as Record<string, unknown>,
};

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
  "ctx",
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

const safeValue = (value: unknown): unknown => {
  try {
    structuredClone(value);
    return value;
  } catch {
    return String(value);
  }
};

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
  return Object.entries(ctx.scope)
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

const mutationInput = (input: ApiCallInput): MutationLog["request"] => {
  return {
    path: input.path,
    query: input.query as Record<string, unknown> | undefined,
    body: safeValue(input.body),
    formKeys: input.form ? Object.keys(input.form) : undefined,
  };
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
    request: mutationInput(input),
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

const createApi = (
  message: WorkerRunMessage,
): Record<string, (input?: ApiCallInput) => Promise<unknown>> => {
  const entries = message.operations.map((operation) => {
    const call = async (input: ApiCallInput = {}) => {
      if (!message.accessToken) {
        throw Object.assign(new Error("Login is required before calling traQ API."), {
          name: "AuthError",
        });
      }

      await waitForRateLimit(operation);
      const mutation = isMutation(operation);
      if (message.readOnly && mutation) {
        const warning = `api.${operation.operationId} is blocked in read-only API mode.`;
        post({
          type: "warning",
          cellId: message.cellId,
          message: warning,
        });
        throw Object.assign(new Error(warning), {
          name: "ReadOnlyApiError",
        });
      }
      const requestPreview = buildRequest(operation, message.apiBase, input);
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
    Object.assign(ctx.scope, {
      api,
      util,
      ctx,
      console: createConsole(message.cellId),
      me: message.globals.me,
      users: message.globals.users,
      channels: message.globals.channels,
      groups: message.globals.groups,
    });
    const body = rewriteTopLevelDeclarations(withImplicitReturn(message.code));
    const fn = new AsyncFunction("scope", `with (scope) {\n${body}\n}`);
    const value = await fn(createScopeProxy(ctx.scope));
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
    ctx.state = {};
    ctx.scope = Object.create(null) as Record<string, unknown>;
    rateState.clear();
    postRuntimeScope();
    return;
  }
  void runCell(event.data);
});
