import { useEffect, useRef, type MutableRefObject } from "react";
import type { ToastMessage } from "../../components/toast/ToastViewport";
import type { ConsoleLog, MutationLog, NetworkLog } from "../../runtime/types";
import {
  notebookSnapshotStorage,
  runtimeSnapshotFromState,
  saveRuntimeSnapshot,
  snapshotFromState,
} from "./storage";
import type { NotebookCell } from "./types";

type Options = {
  cells: NotebookCell[];
  cellsRef: MutableRefObject<NotebookCell[]>;
  selectedCellId: string;
  selectedCellIdRef: MutableRefObject<string>;
  networkOpen: boolean;
  consoleLogs: ConsoleLog[];
  networkLogs: NetworkLog[];
  mutationLogs: MutationLog[];
  pushToast: (message: string, tone?: ToastMessage["tone"]) => void;
};

export const useNotebookPersistence = ({
  cells,
  cellsRef,
  selectedCellId,
  selectedCellIdRef,
  networkOpen,
  consoleLogs,
  networkLogs,
  mutationLogs,
  pushToast,
}: Options) => {
  const runtimeStorageWarningShownRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const snapshot = snapshotFromState(cellsRef.current, selectedCellIdRef.current, networkOpen);
      notebookSnapshotStorage.write(snapshot);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [cells, cellsRef, networkOpen, selectedCellId, selectedCellIdRef]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        saveRuntimeSnapshot(
          runtimeSnapshotFromState(cellsRef.current, consoleLogs, networkLogs, mutationLogs),
        );
      } catch (error) {
        if (runtimeStorageWarningShownRef.current) return;
        runtimeStorageWarningShownRef.current = true;
        pushToast(
          error instanceof Error
            ? `Runtime logs were not saved: ${error.message}`
            : "Runtime logs were not saved.",
          "error",
        );
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [cells, cellsRef, consoleLogs, mutationLogs, networkLogs, pushToast]);
};
