export type HttpMethod =
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type OperationParameter = {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  description?: string;
  schema?: unknown;
};

export type OperationMeta = {
  operationId: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: OperationParameter[];
  requestBody?: {
    required: boolean;
    contentTypes: string[];
  };
  responseStatus: string[];
  cost: number;
};

export type ConsoleLog = {
  id: string;
  cellId: string;
  level: "log" | "info" | "warn" | "error";
  values: unknown[];
  createdAt: number;
  kind?: "runtime-warning";
};

export type NetworkLog = {
  id: string;
  cellId: string;
  operationId: string;
  method: HttpMethod;
  url: string;
  status?: number;
  ok?: boolean;
  requestId?: string | null;
  startedAt: number;
  finishedAt?: number;
  durationMs?: number;
  error?: string;
};

export type RevertRequest = {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
};

export type MutationLog = {
  id: string;
  cellId: string;
  operationId: string;
  method: HttpMethod;
  url: string;
  status: number;
  requestId?: string | null;
  request: {
    path?: Record<string, string | number | boolean>;
    query?: Record<string, unknown>;
    body?: unknown;
    formKeys?: string[];
  };
  before?: unknown;
  response?: unknown;
  createdAt: number;
  revert:
    | { status: "available"; request: RevertRequest }
    | { status: "manual"; reason: string }
    | { status: "unavailable"; reason: string }
    | { status: "reverted"; revertedAt: number }
    | { status: "failed"; reason: string };
};

export type CellResult =
  | { status: "idle" }
  | { status: "running"; startedAt: number; current?: string }
  | {
      status: "success";
      value: unknown;
      startedAt: number;
      finishedAt: number;
      durationMs: number;
    }
  | {
      status: "error";
      error: RuntimeErrorPayload;
      startedAt?: number;
      finishedAt: number;
      durationMs?: number;
    };

export type RuntimeErrorPayload = {
  name: string;
  message: string;
  stack?: string;
  status?: number;
  requestId?: string | null;
  body?: unknown;
};

export type NotebookCell = {
  id: string;
  title: string;
  code: string;
  readOnly: boolean;
  result: CellResult;
};

export type NotebookSnapshot = {
  version: 1;
  cells: Pick<NotebookCell, "id" | "title" | "code" | "readOnly">[];
  selectedCellId: string;
  layout: {
    networkOpen: boolean;
  };
};

export type RuntimeLogSnapshot = {
  version: 1;
  consoleLogs: ConsoleLog[];
  networkLogs: NetworkLog[];
  mutationLogs: MutationLog[];
  cellResults: Array<{
    cellId: string;
    result: CellResult;
  }>;
};
