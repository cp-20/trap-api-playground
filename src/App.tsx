import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { operationsAtom } from "./data/operationsState";
import { beginLogin } from "./features/auth/oauth";
import { AuthGate } from "./features/auth/AuthGate";
import { useOAuthCallback } from "./features/auth/useOAuthCallback";
import { tokenAtom } from "./features/auth/state";
import { DEFAULT_SCOPE, getClientId } from "./config";
import { ToastViewport } from "./components/toast/ToastViewport";
import { useToasts } from "./components/toast/useToasts";
import { TopBar } from "./features/app-shell/TopBar";
import { NotebookWorkspace } from "./features/app-shell/NotebookWorkspace";
import { useAppData } from "./features/app-shell/useAppData";
import { useResizableLayout } from "./features/app-shell/useResizableLayout";
import { entityIndexesAtom } from "./features/entities/state";
import { EMPTY_GLOBALS, type RuntimeGlobals } from "./features/entities/types";
import { useNotebookEditors, type MountedEditor } from "./features/notebook/notebookEditor";
import {
  createCell,
  notebookSnapshotStorage,
  snapshotFromState,
} from "./features/notebook/storage";
import { cellsAtom, networkOpenAtom, selectedCellIdAtom } from "./features/notebook/state";
import { useGlobalShortcuts } from "./features/notebook/useGlobalShortcuts";
import { useNotebookPersistence } from "./features/notebook/useNotebookPersistence";
import { useRunningClock } from "./features/notebook/useRunningClock";
import { useRuntimeWorker } from "./features/notebook/useRuntimeWorker";
import { encodeShare } from "./share";
import type { NotebookCell } from "./features/notebook/types";
import type { ConsoleLog } from "./runtime/types";
import { groupBy } from "./utils/collections";
import styles from "./App.module.css";

const EMPTY_CONSOLE_LOGS: ConsoleLog[] = [];

export const App = () => {
  const [cells, setCells] = useAtom(cellsAtom);
  const [selectedCellId, setSelectedCellId] = useAtom(selectedCellIdAtom);
  const [networkOpen, setNetworkOpen] = useAtom(networkOpenAtom);
  const [operations, setOperations] = useAtom(operationsAtom);
  const [token, setToken] = useAtom(tokenAtom);
  const [entityIndexes, setEntityIndexes] = useAtom(entityIndexesAtom);
  const { toasts, pushToast, dismissToast } = useToasts();
  const cellsRef = useRef(cells);
  const selectedCellIdRef = useRef(selectedCellId);
  const activeCellIdRef = useRef(selectedCellId);
  const tokenRef = useRef(token);
  const operationsRef = useRef(operations);
  const globalsRef = useRef<RuntimeGlobals>(EMPTY_GLOBALS);
  const editorRefs = useRef(new Map<string, MountedEditor>());
  const canRunRef = useRef<() => boolean>(() => false);
  const runCellByIdRef = useRef<(cellId: string) => void | Promise<void>>(() => undefined);
  const runAllCellsRef = useRef<() => void | Promise<void>>(() => undefined);
  const addCellAfterRef = useRef<(cellId: string) => void>(() => undefined);
  const saveNotebookRef = useRef<(showToast?: boolean) => void>(() => undefined);
  const stopAllRef = useRef<() => void>(() => undefined);
  const toggleNetworkRef = useRef<() => void>(() => undefined);
  const { logsPanelStyle, startGlobalsResize, startLogsResize, workspaceStyle } =
    useResizableLayout();
  const { consoleLogs, networkLogs, mutationLogs, runCell, stopAll, resetRuntime, revertMutation } =
    useRuntimeWorker({
      cellsRef,
      operationsRef,
      tokenRef,
      globalsRef,
      setCells,
      pushToast,
    });

  const clientConfigured = getClientId().length > 0;
  const hasRunningCell = useMemo(
    () => cells.some((cell) => cell.result.status === "running"),
    [cells],
  );
  const clock = useRunningClock(hasRunningCell);
  const consoleLogsByCell = useMemo(() => groupBy(consoleLogs, (log) => log.cellId), [consoleLogs]);

  useAppData({ token, setOperations, setEntityIndexes, pushToast });
  useOAuthCallback({ setToken, pushToast });

  useEffect(() => {
    cellsRef.current = cells;
    selectedCellIdRef.current = selectedCellId;
    activeCellIdRef.current = selectedCellId;
    tokenRef.current = token;
    operationsRef.current = operations;
    globalsRef.current = entityIndexes?.globals ?? EMPTY_GLOBALS;
  });

  const selectCell = useCallback((cellId: string) => {
    selectedCellIdRef.current = cellId;
    activeCellIdRef.current = cellId;
    setSelectedCellId(cellId);
  }, []);

  const updateCell = useCallback((cellId: string, patch: Partial<NotebookCell>) => {
    setCells((current) =>
      current.map((cell) => (cell.id === cellId ? { ...cell, ...patch } : cell)),
    );
  }, []);

  const { beforeMount, formatAllEditors, onEditorMount, prepareCodeForRun } = useNotebookEditors({
    cellsRef,
    editorRefs,
    commands: {
      addCellAfterRef,
      canRunRef,
      runAllCellsRef,
      runCellRef: runCellByIdRef,
      saveNotebookRef,
      stopAllRef,
      toggleNetworkRef,
    },
    onSelectCell: selectCell,
    onUpdateCell: updateCell,
  });

  const runCellById = useCallback(
    async (cellId: string) => {
      activeCellIdRef.current = cellId;
      selectedCellIdRef.current = cellId;
      setSelectedCellId(cellId);
      const cell = cellsRef.current.find((item) => item.id === cellId);
      if (!cell || !tokenRef.current) return;
      const code = await prepareCodeForRun(cell.id, cell.code);
      runCell({ ...cell, code });
    },
    [prepareCodeForRun, runCell],
  );

  const runAllCells = useCallback(async () => {
    if (!tokenRef.current) return;
    for (const cell of cellsRef.current) {
      await runCellById(cell.id);
    }
  }, [cellsRef, runCellById]);

  const saveNotebook = useCallback(
    (showToast = false) => {
      const snapshot = snapshotFromState(cellsRef.current, selectedCellIdRef.current, networkOpen);
      notebookSnapshotStorage.write(snapshot);
      if (showToast) pushToast("Notebook saved.", "success");
    },
    [networkOpen, pushToast],
  );

  useNotebookPersistence({
    cells,
    cellsRef,
    selectedCellId,
    selectedCellIdRef,
    networkOpen,
    consoleLogs,
    networkLogs,
    mutationLogs,
    pushToast,
  });

  const updateCellTitle = useCallback(
    (cellId: string, title: string) => {
      updateCell(cellId, { title });
    },
    [updateCell],
  );

  const updateCellCode = useCallback(
    (cellId: string, code: string) => {
      updateCell(cellId, { code });
    },
    [updateCell],
  );

  const updateCellReadOnly = useCallback(
    (cellId: string, readOnly: boolean) => {
      updateCell(cellId, { readOnly });
    },
    [updateCell],
  );

  const shareNotebook = async () => {
    const hash = encodeShare(snapshotFromState(cells, selectedCellId, networkOpen));
    window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
    pushToast("Share URL copied.", "success");
  };

  const addCell = useCallback(
    (index = cellsRef.current.length) => {
      const cell = createCell(
        "// Write TypeScript here\nawait api.getMe()",
        `Cell ${cellsRef.current.length + 1}`,
      );
      setCells((current) => [...current.slice(0, index), cell, ...current.slice(index)]);
      selectCell(cell.id);
    },
    [selectCell],
  );

  const toggleNetwork = useCallback(() => setNetworkOpen((current) => !current), []);

  const removeCell = useCallback(
    (cellId: string) => {
      setCells((current) => {
        if (current.length === 1) return current;
        const next = current.filter((cell) => cell.id !== cellId);
        if (selectedCellIdRef.current === cellId) selectCell(next[0]?.id ?? "");
        return next;
      });
    },
    [selectCell],
  );

  const moveCell = useCallback((cellId: string, direction: -1 | 1) => {
    setCells((current) =>
      (() => {
        const index = current.findIndex((cell) => cell.id === cellId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= current.length) return current;
        const next = [...current];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      })(),
    );
  }, []);

  useGlobalShortcuts({
    cellsRef,
    selectedCellIdRef,
    activeCellIdRef,
    canRunRef,
    runAllCells,
    runCellById,
    addCell,
    toggleNetwork,
    saveNotebook,
    formatAllEditors,
    stopAll,
  });

  canRunRef.current = () => !!tokenRef.current;
  runCellByIdRef.current = runCellById;
  runAllCellsRef.current = runAllCells;
  addCellAfterRef.current = (cellId: string) => {
    const index = cellsRef.current.findIndex((cell) => cell.id === cellId);
    addCell(index < 0 ? cellsRef.current.length : index + 1);
  };
  saveNotebookRef.current = saveNotebook;
  stopAllRef.current = stopAll;
  toggleNetworkRef.current = toggleNetwork;

  return (
    <div className={styles.appShell}>
      <TopBar
        operationCount={operations.length}
        loggedIn={!!token}
        clientConfigured={clientConfigured}
        onLogin={() =>
          void beginLogin(DEFAULT_SCOPE).catch((error) =>
            pushToast(error instanceof Error ? error.message : String(error), "error"),
          )
        }
        onReset={resetRuntime}
        onShare={() => void shareNotebook()}
      />

      {!clientConfigured ? (
        <div className={styles.statusStrip}>Set VITE_TRAQ_CLIENT_ID in .env to enable login.</div>
      ) : null}

      {!token ? (
        <main className={styles.workspace} style={workspaceStyle}>
          <AuthGate
            clientConfigured={clientConfigured}
            onLogin={() =>
              void beginLogin(DEFAULT_SCOPE).catch((error) =>
                pushToast(error instanceof Error ? error.message : String(error), "error"),
              )
            }
          />
        </main>
      ) : (
        <NotebookWorkspace
          cells={cells}
          selectedCellId={selectedCellId}
          clock={clock}
          consoleLogsByCell={consoleLogsByCell}
          emptyConsoleLogs={EMPTY_CONSOLE_LOGS}
          entityIndexes={entityIndexes}
          cellActions={{
            onFocus: selectCell,
            onRun: runCellById,
            onMove: moveCell,
            onRemove: removeCell,
            onTitleChange: updateCellTitle,
            onCodeChange: updateCellCode,
            onReadOnlyChange: updateCellReadOnly,
            onAddCell: addCell,
          }}
          editorBindings={{
            beforeMount,
            onEditorMount,
          }}
          logBindings={{
            networkOpen,
            networkLogs,
            mutationLogs,
            onNetworkOpenChange: setNetworkOpen,
            onRevertMutation: revertMutation,
          }}
          layoutBindings={{
            workspaceStyle,
            logsPanelStyle,
            onGlobalsResizeStart: startGlobalsResize,
            onLogsResizeStart: startLogsResize,
          }}
        />
      )}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
