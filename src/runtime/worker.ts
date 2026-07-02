/// <reference lib="webworker" />

import { buildRequest, parseResponse, type ApiCallInput } from "../api/request";
import type {
  ConsoleLog,
  MutationLog,
  NetworkLog,
  OperationMeta,
  RuntimeErrorPayload,
} from "../types";
import type {
  WorkerInboundMessage,
  WorkerOutboundMessage,
  WorkerRunMessage,
} from "./messages";

const ctx = {
  state: {} as Record<string, unknown>,
  scope: Object.create(null) as Record<string, unknown>,
};

const rateState = new Map<string, number>();
const REQUEST_TIMEOUT_MS = 30_000;

function post(message: WorkerOutboundMessage): void {
  self.postMessage(message);
}

function safeValue(value: unknown): unknown {
  try {
    structuredClone(value);
    return value;
  } catch {
    return String(value);
  }
}

function serializeError(error: unknown): RuntimeErrorPayload {
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    return {
      name: typeof record.name === "string" ? record.name : "Error",
      message:
        typeof record.message === "string" ? record.message : String(error),
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
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as { name?: string }).name === "AbortError") {
      throw Object.assign(
        new Error(`Request timed out after ${timeoutMs / 1000}s.`),
        {
          name: "TimeoutError",
        },
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForRateLimit(operation: OperationMeta): Promise<void> {
  const bucket = operation.path.split("/").slice(0, 2).join("/") || "default";
  const now = Date.now();
  const next = rateState.get(bucket) ?? 0;
  const wait = Math.max(0, next - now);
  const spacing = Math.max(100, operation.cost * 160);
  rateState.set(bucket, now + wait + spacing);
  if (wait > 0) await sleep(wait);
}

function isMutation(operation: OperationMeta): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(operation.method);
}

function mutationInput(input: ApiCallInput): MutationLog["request"] {
  return {
    path: input.path,
    query: input.query as Record<string, unknown> | undefined,
    body: safeValue(input.body),
    formKeys: input.form ? Object.keys(input.form) : undefined,
  };
}

function normalizePayload(operation: OperationMeta, payload: unknown): unknown {
  if (operation.operationId === "getChannels" && Array.isArray(payload)) {
    return { public: payload };
  }
  return payload;
}

async function fetchBeforeState(request: {
  url: string;
  headers: Record<string, string>;
}): Promise<unknown> {
  const response = await fetchWithTimeout(request.url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: request.headers.Authorization,
    },
  });
  if (!response.ok) return undefined;
  return safeValue(await parseResponse(response));
}

function createMutationLog(
  message: WorkerRunMessage,
  operation: OperationMeta,
  input: ApiCallInput,
  request: { url: string; headers: Record<string, string> },
  response: Response,
  payload: unknown,
  before: unknown,
): MutationLog {
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
            reason:
              "Previous resource state could not be captured before the edit.",
          },
  };
}

function createApi(
  message: WorkerRunMessage,
): Record<string, (input?: ApiCallInput) => Promise<unknown>> {
  const entries = message.operations.map((operation) => {
    const call = async (input: ApiCallInput = {}) => {
      if (!message.accessToken) {
        throw Object.assign(
          new Error("Login is required before calling traQ API."),
          {
            name: "AuthError",
          },
        );
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
      const request = buildRequest(operation, message.apiBase, input);
      request.headers.Authorization = `Bearer ${message.accessToken}`;
      const before =
        mutation && ["PUT", "PATCH", "DELETE"].includes(operation.method)
          ? await fetchBeforeState(request).catch(() => undefined)
          : undefined;

      const startedAt = Date.now();
      const logBase: NetworkLog = {
        id: crypto.randomUUID(),
        cellId: message.cellId,
        operationId: operation.operationId,
        method: operation.method,
        url: request.url,
        startedAt,
      };
      post({ type: "network", log: logBase });

      try {
        const response = await fetchWithTimeout(request.url, request);
        const rawPayload = await parseResponse(response);
        const payload = response.ok
          ? normalizePayload(operation, rawPayload)
          : rawPayload;
        const requestId = response.headers.get("x-request-id");
        post({
          type: "network",
          log: {
            ...logBase,
            status: response.status,
            ok: response.ok,
            requestId,
            finishedAt: Date.now(),
            durationMs: Date.now() - startedAt,
          },
        });

        if (!response.ok) {
          throw Object.assign(
            new Error(`HTTP ${response.status} from ${operation.operationId}`),
            {
              name: "HttpError",
              status: response.status,
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
              request,
              response,
              payload,
              before,
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
}

function createConsole(
  cellId: string,
): Pick<Console, "log" | "info" | "warn" | "error"> {
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
}

function findLastTopLevelStatementStart(code: string): number {
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
    if (char === "}" || char === ")" || char === "]")
      depth = Math.max(0, depth - 1);
    if ((char === ";" || char === "\n") && depth === 0) start = index + 1;
  }

  return start;
}

function withImplicitReturn(code: string): string {
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
}

function rewriteTopLevelDeclarations(code: string): string {
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
        index +=
          match[1].length + match[0].slice(match[1].length).indexOf(match[2]);
        continue;
      }
    }

    output += char;
    if (char === "{" || char === "(" || char === "[") depth += 1;
    if (char === "}" || char === ")" || char === "]")
      depth = Math.max(0, depth - 1);
  }

  return output;
}

function createScopeProxy(
  scope: Record<string, unknown>,
): Record<PropertyKey, unknown> {
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
}

async function runCell(message: WorkerRunMessage): Promise<void> {
  const AsyncFunction = Object.getPrototypeOf(async function () {})
    .constructor as new (
    ...args: string[]
  ) => (scope: unknown) => Promise<unknown>;

  const api = createApi(message);
  const util = {
    sleep,
    isUuid(value: unknown): boolean {
      return (
        typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value,
        )
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
  }
}

self.addEventListener(
  "message",
  (event: MessageEvent<WorkerInboundMessage>) => {
    if (event.data.type === "reset") {
      ctx.state = {};
      ctx.scope = Object.create(null) as Record<string, unknown>;
      rateState.clear();
      return;
    }
    void runCell(event.data);
  },
);
