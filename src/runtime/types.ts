import type { HttpMethod } from "../data/types";

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

export type RuntimeErrorPayload = {
  name: string;
  message: string;
  stack?: string;
  status?: number;
  requestId?: string | null;
  body?: unknown;
};
