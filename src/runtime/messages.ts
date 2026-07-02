import type {
  ConsoleLog,
  MutationLog,
  NetworkLog,
  OperationMeta,
  RuntimeErrorPayload,
} from "../types";
import type { RuntimeGlobals } from "../enrichment";

export type WorkerRunMessage = {
  type: "run";
  runId: string;
  cellId: string;
  code: string;
  readOnly: boolean;
  operations: OperationMeta[];
  apiBase: string;
  accessToken: string | null;
  globals: RuntimeGlobals;
};

export type WorkerResetMessage = {
  type: "reset";
};

export type WorkerInboundMessage = WorkerRunMessage | WorkerResetMessage;

export type WorkerOutboundMessage =
  | { type: "console"; log: ConsoleLog }
  | { type: "warning"; cellId: string; message: string }
  | { type: "network"; log: NetworkLog }
  | { type: "mutation"; log: MutationLog }
  | { type: "success"; runId: string; cellId: string; value: unknown }
  | {
      type: "error";
      runId: string;
      cellId: string;
      error: RuntimeErrorPayload;
    };
