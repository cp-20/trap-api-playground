import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import type { ToastMessage } from "../../components/toast/ToastViewport";
import {
  notebookSnapshotStorage,
  runtimeSnapshotFromState,
  saveRuntimeSnapshot,
  snapshotFromState,
} from "./storage";
import {
  cellsAtom,
  consoleLogsAtom,
  mutationLogsAtom,
  networkLogsAtom,
  networkOpenAtom,
  selectedCellIdAtom,
} from "./state";

type Options = {
  pushToast: (message: string, tone?: ToastMessage["tone"]) => void;
};

export const useNotebookPersistence = ({ pushToast }: Options) => {
  const cells = useAtomValue(cellsAtom);
  const selectedCellId = useAtomValue(selectedCellIdAtom);
  const networkOpen = useAtomValue(networkOpenAtom);
  const consoleLogs = useAtomValue(consoleLogsAtom);
  const networkLogs = useAtomValue(networkLogsAtom);
  const mutationLogs = useAtomValue(mutationLogsAtom);
  const runtimeStorageWarningShownRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const snapshot = snapshotFromState(cells, selectedCellId, networkOpen);
      notebookSnapshotStorage.write(snapshot);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [cells, networkOpen, selectedCellId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        saveRuntimeSnapshot(
          runtimeSnapshotFromState(cells, consoleLogs, networkLogs, mutationLogs),
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
  }, [cells, consoleLogs, mutationLogs, networkLogs, pushToast]);
};
