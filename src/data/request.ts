import createClient from "openapi-fetch";
import type { paths } from "../generated/traq-openapi";
import type { OperationMeta } from "./types";

export type ApiCallInput = {
  path?: Record<string, string | number | boolean>;
  query?: Record<
    string,
    string | number | boolean | null | undefined | Array<string | number | boolean>
  >;
  body?: unknown;
  form?: Record<string, string | Blob>;
};

export type BuiltRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: BodyInit;
};

export type ApiFetch = (request: Request) => Promise<Response>;

export type ApiCallResult = {
  request: BuiltRequest;
  response: Response;
  payload: unknown;
};

const encodePath = (path: string, values: ApiCallInput["path"] = {}): string => {
  return path.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing path parameter: ${key}`);
    }
    return encodeURIComponent(String(value));
  });
};

const appendQuery = (url: URL, query: ApiCallInput["query"] = {}): void => {
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.set(key, String(value));
    }
  }
};

const createFormData = (values: NonNullable<ApiCallInput["form"]>): FormData => {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    form.append(key, value);
  }
  return form;
};

const headersToRecord = (headers: Headers): Record<string, string> =>
  Object.fromEntries(headers.entries());

export const buildRequest = (
  operation: OperationMeta,
  apiBase: string,
  input: ApiCallInput = {},
): BuiltRequest => {
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
};

export const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text.length > 0 ? text : null;
};

export const callTraqApi = async ({
  operation,
  apiBase,
  accessToken,
  input = {},
  fetchRequest,
}: {
  operation: OperationMeta;
  apiBase: string;
  accessToken: string;
  input?: ApiCallInput;
  fetchRequest: ApiFetch;
}): Promise<ApiCallResult> => {
  let capturedRequest: Request | undefined;
  const client = createClient<paths>({
    baseUrl: apiBase,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    fetch: async (request) => {
      capturedRequest = request;
      return fetchRequest(request);
    },
  });

  const body = input.form ? createFormData(input.form) : input.body;
  const result = await client.request(
    operation.method.toLowerCase() as never,
    operation.path as never,
    {
      params: {
        path: input.path,
        query: input.query,
      },
      body,
      bodySerializer: input.form ? (value: unknown) => value : undefined,
    } as never,
  );
  const response = result.response;
  const payload = response.ok ? result.data : result.error;
  const request = (() => {
    const captured = capturedRequest as Request | undefined;
    if (!captured) return buildRequest(operation, apiBase, input);
    return {
      method: captured.method,
      url: captured.url,
      headers: headersToRecord(captured.headers),
      body: buildRequest(operation, apiBase, input).body,
    };
  })();

  return {
    request,
    response,
    payload: payload ?? null,
  };
};
