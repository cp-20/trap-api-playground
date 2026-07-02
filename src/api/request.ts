import type { OperationMeta } from "../types";

export type ApiCallInput = {
  path?: Record<string, string | number | boolean>;
  query?: Record<string, string | number | boolean | null | undefined | Array<string | number | boolean>>;
  body?: unknown;
  form?: Record<string, string | Blob>;
};

export type BuiltRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: BodyInit;
};

function encodePath(path: string, values: ApiCallInput["path"] = {}): string {
  return path.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing path parameter: ${key}`);
    }
    return encodeURIComponent(String(value));
  });
}

function appendQuery(url: URL, query: ApiCallInput["query"] = {}): void {
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.set(key, String(value));
    }
  }
}

export function buildRequest(
  operation: OperationMeta,
  apiBase: string,
  input: ApiCallInput = {},
): BuiltRequest {
  const url = new URL(`${apiBase.replace(/\/$/, "")}${encodePath(operation.path, input.path)}`);
  appendQuery(url, input.query);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  let body: BodyInit | undefined;

  if (input.form) {
    const form = new FormData();
    for (const [key, value] of Object.entries(input.form)) {
      form.append(key, value);
    }
    body = form;
  } else if (input.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(input.body);
  }

  return {
    method: operation.method,
    url: url.toString(),
    headers,
    body,
  };
}

export async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text.length > 0 ? text : null;
}
