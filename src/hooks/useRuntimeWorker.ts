import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { getApiBase } from "../config";
import type { OAuthToken } from "../auth/oauth";
import type { RuntimeGlobals } from "../enrichment";
import {
  MAX_CONSOLE_LOGS,
  MAX_MUTATION_LOGS,
  MAX_NETWORK_LOGS,
} from "../notebook/storage";
import type {
  ConsoleLog,
  MutationLog,
  NetworkLog,
  NotebookCell,
  OperationMeta,
} from "../types";
import { createId } from "../utils/ids";
import type {
  WorkerInboundMessage,
  WorkerOutboundMessage,
} from "../runtime/messages";

const RUN_TIMEOUT_MS = 45_000;

type Args = {
  cellsRef: MutableRefObject<NotebookCell[]>;
  operationsRef: MutableRefObject<OperationMeta[]>;
  tokenRef: MutableRefObject<OAuthToken | null>;
  globalsRef: MutableRefObject<RuntimeGlobals>;
  setCells: Dispatch<SetStateAction<NotebookCell[]>>;
  pushToast: (message: string, tone?: "info" | "success" | "error") => void;
  initialConsoleLogs?: ConsoleLog[];
  initialNetworkLogs?: NetworkLog[];
  initialMutationLogs?: MutationLog[];
};

function markRunningCellsAsError(
  current: NotebookCell[],
  error: { name: string; message: string },
  finishedAt: number,
): NotebookCell[] {
  return current.map((cell) =>
    cell.result.status === "running"
      ? {
          ...cell,
          result: {
            status: "error",
            error,
            startedAt: cell.result.startedAt,
            finishedAt,
            durationMs: finishedAt - cell.result.startedAt,
          },
        }
      : cell,
  );
}

export function useRuntimeWorker({
  cellsRef,
  operationsRef,
  tokenRef,
  globalsRef,
  setCells,
  pushToast,
  initialConsoleLogs = [],
  initialNetworkLogs = [],
  initialMutationLogs = [],
}: Args) {
  const [consoleLogs, setConsoleLogs] =
    useState<ConsoleLog[]>(initialConsoleLogs);
  const [networkLogs, setNetworkLogs] =
    useState<NetworkLog[]>(initialNetworkLogs);
  const [mutationLogs, setMutationLogs] =
    useState<MutationLog[]>(initialMutationLogs);
  const workerRef = useRef<Worker | null>(null);
  const runningIds = useRef(new Map<string, string>());
  const runTimers = useRef(new Map<string, number>());

  const setCellResult = useCallback(
    (cellId: string, result: NotebookCell["result"]) => {
      setCells((current) =>
        current.map((cell) =>
          cell.id === cellId ? { ...cell, result } : cell,
        ),
      );
    },
    [setCells],
  );

  const clearRunTimer = useCallback((cellId: string) => {
    const timer = runTimers.current.get(cellId);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      runTimers.current.delete(cellId);
    }
  }, []);

  const failRunningCells = useCallback(
    (message: string, name = "RuntimeError") => {
      for (const cellId of runningIds.current.keys()) {
        clearRunTimer(cellId);
      }
      runningIds.current.clear();
      const finishedAt = Date.now();
      setCells((current) =>
        markRunningCellsAsError(current, { name, message }, finishedAt),
      );
    },
    [clearRunTimer, setCells],
  );

  const createWorker = useCallback(() => {
    workerRef.current?.terminate();
    const worker = new Worker(
      new URL("../runtime/worker.ts", import.meta.url),
      {
        type: "module",
      },
    );
    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      const message = event.data;
      if (message.type === "console") {
        setConsoleLogs((current) =>
          [...current, message.log].slice(-MAX_CONSOLE_LOGS),
        );
      } else if (message.type === "warning") {
        const log: ConsoleLog = {
          id: createId("log"),
          cellId: message.cellId,
          level: "warn",
          values: [message.message],
          createdAt: Date.now(),
          kind: "runtime-warning",
        };
        setConsoleLogs((current) => [...current, log].slice(-MAX_CONSOLE_LOGS));
      } else if (message.type === "network") {
        if (!message.log.finishedAt) {
          setCells((current) =>
            current.map((cell) =>
              cell.id === message.log.cellId && cell.result.status === "running"
                ? {
                    ...cell,
                    result: {
                      ...cell.result,
                      current: `api.${message.log.operationId}`,
                    },
                  }
                : cell,
            ),
          );
        }
        setNetworkLogs((current) => {
          const index = current.findIndex((log) => log.id === message.log.id);
          if (index === -1)
            return [...current, message.log].slice(-MAX_NETWORK_LOGS);
          const next = [...current];
          next[index] = { ...next[index], ...message.log };
          return next;
        });
      } else if (message.type === "mutation") {
        setMutationLogs((current) =>
          [message.log, ...current].slice(0, MAX_MUTATION_LOGS),
        );
      } else if (message.type === "success") {
        if (runningIds.current.get(message.cellId) !== message.runId) return;
        runningIds.current.delete(message.cellId);
        clearRunTimer(message.cellId);
        setCells((current) =>
          current.map((cell) => {
            if (cell.id !== message.cellId) return cell;
            const startedAt =
              cell.result.status === "running"
                ? cell.result.startedAt
                : Date.now();
            const finishedAt = Date.now();
            return {
              ...cell,
              result: {
                status: "success",
                value: message.value,
                startedAt,
                finishedAt,
                durationMs: finishedAt - startedAt,
              },
            };
          }),
        );
      } else if (message.type === "error") {
        if (runningIds.current.get(message.cellId) !== message.runId) return;
        runningIds.current.delete(message.cellId);
        clearRunTimer(message.cellId);
        setCells((current) =>
          current.map((cell) => {
            if (cell.id !== message.cellId) return cell;
            const startedAt =
              cell.result.status === "running"
                ? cell.result.startedAt
                : undefined;
            const finishedAt = Date.now();
            return {
              ...cell,
              result: {
                status: "error",
                error: message.error,
                startedAt,
                finishedAt,
                durationMs: startedAt ? finishedAt - startedAt : undefined,
              },
            };
          }),
        );
      }
    };
    worker.onerror = (event) => {
      failRunningCells(
        event.message || "Worker crashed during execution.",
        "WorkerError",
      );
      createWorker();
    };
    worker.onmessageerror = () => {
      failRunningCells(
        "Worker returned an unserializable message.",
        "WorkerMessageError",
      );
      createWorker();
    };
    workerRef.current = worker;
    return worker;
  }, [clearRunTimer, failRunningCells, setCells]);

  useEffect(() => {
    const worker = createWorker();
    return () => worker.terminate();
  }, [createWorker]);

  const runCell = useCallback(
    (cell: NotebookCell) => {
      if (!workerRef.current) createWorker();
      const runId = createId("run");
      runningIds.current.set(cell.id, runId);
      clearRunTimer(cell.id);
      setConsoleLogs((current) =>
        current.filter((log) => log.cellId !== cell.id),
      );
      const timer = window.setTimeout(() => {
        if (runningIds.current.get(cell.id) !== runId) return;
        runningIds.current.delete(cell.id);
        runTimers.current.delete(cell.id);
        const result = cellsRef.current.find(
          (item) => item.id === cell.id,
        )?.result;
        const startedAt =
          result?.status === "running" ? result.startedAt : undefined;
        const finishedAt = Date.now();
        setCellResult(cell.id, {
          status: "error",
          error: {
            name: "TimeoutError",
            message: `Cell execution timed out after ${RUN_TIMEOUT_MS / 1000}s.`,
          },
          startedAt,
          finishedAt,
          durationMs: startedAt ? finishedAt - startedAt : undefined,
        });
      }, RUN_TIMEOUT_MS);
      runTimers.current.set(cell.id, timer);
      setCellResult(cell.id, { status: "running", startedAt: Date.now() });
      const message: WorkerInboundMessage = {
        type: "run",
        runId,
        cellId: cell.id,
        code: cell.code,
        readOnly: cell.readOnly,
        operations: operationsRef.current,
        apiBase: getApiBase(),
        accessToken: tokenRef.current?.accessToken ?? null,
        globals: globalsRef.current,
      };
      workerRef.current!.postMessage(message);
    },
    [
      cellsRef,
      clearRunTimer,
      createWorker,
      globalsRef,
      operationsRef,
      setCellResult,
      tokenRef,
    ],
  );

  const runAll = useCallback(async () => {
    for (const cell of cellsRef.current) runCell(cell);
  }, [cellsRef, runCell]);

  const stopAll = useCallback(() => {
    createWorker();
    for (const cellId of runningIds.current.keys()) {
      clearRunTimer(cellId);
    }
    runningIds.current.clear();
    const finishedAt = Date.now();
    setCells((current) =>
      markRunningCellsAsError(
        current,
        { name: "AbortError", message: "Execution stopped." },
        finishedAt,
      ),
    );
  }, [clearRunTimer, createWorker, setCells]);

  const resetRuntime = useCallback(() => {
    const message: WorkerInboundMessage = { type: "reset" };
    workerRef.current?.postMessage(message);
    for (const cellId of runningIds.current.keys()) {
      clearRunTimer(cellId);
    }
    runningIds.current.clear();
    setConsoleLogs([]);
    setNetworkLogs([]);
    setMutationLogs([]);
    setCells((current) =>
      current.map((cell) => ({ ...cell, result: { status: "idle" } })),
    );
  }, [clearRunTimer, setCells]);

  const revertMutation = useCallback(
    async (log: MutationLog) => {
      const token = tokenRef.current;
      if (!token?.accessToken || log.revert.status !== "available") return;
      try {
        const response = await fetch(log.revert.request.url, {
          method: log.revert.request.method,
          headers: {
            ...log.revert.request.headers,
            Authorization: `Bearer ${token.accessToken}`,
          },
          body: log.revert.request.body,
        });
        if (!response.ok) {
          throw new Error(`Revert failed with HTTP ${response.status}`);
        }
        setMutationLogs((current) =>
          current.map((item) =>
            item.id === log.id
              ? {
                  ...item,
                  revert: { status: "reverted", revertedAt: Date.now() },
                }
              : item,
          ),
        );
        pushToast(`Reverted ${log.operationId}.`, "success");
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        setMutationLogs((current) =>
          current.map((item) =>
            item.id === log.id
              ? { ...item, revert: { status: "failed", reason } }
              : item,
          ),
        );
        pushToast(reason, "error");
      }
    },
    [pushToast, tokenRef],
  );

  return {
    consoleLogs,
    networkLogs,
    mutationLogs,
    runCell,
    runAll,
    stopAll,
    resetRuntime,
    revertMutation,
  };
}
