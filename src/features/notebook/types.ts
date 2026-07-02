import type { ConsoleLog, MutationLog, NetworkLog, RuntimeErrorPayload } from "../../runtime/types";

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
