import { LogIn } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadOperations } from "./api/openapi";
import {
  beginLogin,
  exchangeCode,
  parseOAuthCallback,
  readToken,
  type OAuthToken,
} from "./auth/oauth";
import { DEFAULT_SCOPE, getClientId } from "./config";
import {
  findEntityChip,
  loadEntityIndexes,
  type EntityChip,
  type RuntimeGlobals,
} from "./enrichment";
import { GlobalsPanel } from "./components/GlobalsPanel";
import { NotebookCellView } from "./components/NotebookCellView";
import { NetworkPanel } from "./components/NetworkPanel";
import {
  useNotebookEditors,
  type MountedEditor,
} from "./components/notebookEditor";
import { ToastViewport } from "./components/ToastViewport";
import { TopBar } from "./components/TopBar";
import { useResizableLayout } from "./hooks/useResizableLayout";
import { useRuntimeWorker } from "./hooks/useRuntimeWorker";
import { useToasts } from "./hooks/useToasts";
import {
  cellsFromSnapshot,
  createCell,
  NOTEBOOK_STORAGE_KEY,
  readSavedSnapshot,
  readSavedRuntimeSnapshot,
  runtimeSnapshotFromState,
  saveRuntimeSnapshot,
  snapshotFromState,
} from "./notebook/storage";
import { decodeShare, encodeShare } from "./share";
import type { ConsoleLog, NotebookCell, OperationMeta } from "./types";

const EMPTY_GLOBALS: RuntimeGlobals = {
  me: null,
  users: [],
  channels: [],
  groups: [],
};

const EMPTY_CONSOLE_LOGS: ConsoleLog[] = [];

function groupByCell<T extends { cellId: string }>(
  logs: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const log of logs) {
    const bucket = grouped.get(log.cellId);
    if (bucket) {
      bucket.push(log);
    } else {
      grouped.set(log.cellId, [log]);
    }
  }
  return grouped;
}

export function App() {
  const shared = useMemo(() => decodeShare(window.location.hash), []);
  const saved = useMemo(() => readSavedSnapshot(), []);
  const savedRuntime = useMemo(
    () => (shared ? null : readSavedRuntimeSnapshot()),
    [shared],
  );
  const initialSnapshot = shared ?? saved;
  const [cells, setCells] = useState<NotebookCell[]>(
    initialSnapshot?.cells.length
      ? cellsFromSnapshot(initialSnapshot, savedRuntime)
      : [createCell()],
  );
  const [selectedCellId, setSelectedCellId] = useState(
    initialSnapshot?.selectedCellId ?? cells[0]?.id ?? "",
  );
  const [networkOpen, setNetworkOpen] = useState(
    initialSnapshot?.layout.networkOpen ?? false,
  );
  const [operations, setOperations] = useState<OperationMeta[]>([]);
  const [token, setToken] = useState<OAuthToken | null>(() => readToken());
  const [entityIndexes, setEntityIndexes] = useState<Awaited<
    ReturnType<typeof loadEntityIndexes>
  > | null>(null);
  const [clock, setClock] = useState(Date.now());
  const { toasts, pushToast, dismissToast } = useToasts();
  const cellsRef = useRef(cells);
  const selectedCellIdRef = useRef(selectedCellId);
  const activeCellIdRef = useRef(selectedCellId);
  const tokenRef = useRef(token);
  const operationsRef = useRef(operations);
  const globalsRef = useRef<RuntimeGlobals>(EMPTY_GLOBALS);
  const editorRefs = useRef(new Map<string, MountedEditor>());
  const runtimeStorageWarningShownRef = useRef(false);
  const canRunRef = useRef<() => boolean>(() => false);
  const runCellByIdRef = useRef<(cellId: string) => void | Promise<void>>(
    () => undefined,
  );
  const runAllCellsRef = useRef<() => void | Promise<void>>(() => undefined);
  const addCellAfterRef = useRef<(cellId: string) => void>(() => undefined);
  const saveNotebookRef = useRef<(showToast?: boolean) => void>(
    () => undefined,
  );
  const stopAllRef = useRef<() => void>(() => undefined);
  const toggleNetworkRef = useRef<() => void>(() => undefined);
  const {
    logsPanelStyle,
    startGlobalsResize,
    startLogsResize,
    workspaceStyle,
  } = useResizableLayout();
  const {
    consoleLogs,
    networkLogs,
    mutationLogs,
    runCell,
    stopAll,
    resetRuntime,
    revertMutation,
  } = useRuntimeWorker({
    cellsRef,
    operationsRef,
    tokenRef,
    globalsRef,
    setCells,
    pushToast,
    initialConsoleLogs: savedRuntime?.consoleLogs,
    initialNetworkLogs: savedRuntime?.networkLogs,
    initialMutationLogs: savedRuntime?.mutationLogs,
  });

  const clientConfigured = getClientId().length > 0;
  const hasRunningCell = useMemo(
    () => cells.some((cell) => cell.result.status === "running"),
    [cells],
  );
  const consoleLogsByCell = useMemo(
    () => groupByCell(consoleLogs),
    [consoleLogs],
  );

  useEffect(() => {
    cellsRef.current = cells;
    selectedCellIdRef.current = selectedCellId;
    activeCellIdRef.current = selectedCellId;
    tokenRef.current = token;
    operationsRef.current = operations;
    globalsRef.current = entityIndexes?.globals ?? EMPTY_GLOBALS;
  });

  useEffect(() => {
    if (!hasRunningCell) return;
    setClock(Date.now());
    const timer = window.setInterval(() => setClock(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [hasRunningCell]);

  const selectCell = useCallback((cellId: string) => {
    selectedCellIdRef.current = cellId;
    activeCellIdRef.current = cellId;
    setSelectedCellId(cellId);
  }, []);

  const updateCell = useCallback(
    (cellId: string, patch: Partial<NotebookCell>) => {
      setCells((current) =>
        current.map((cell) =>
          cell.id === cellId ? { ...cell, ...patch } : cell,
        ),
      );
    },
    [],
  );

  const { beforeMount, formatAllEditors, onEditorMount, prepareCodeForRun } =
    useNotebookEditors({
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
      const snapshot = snapshotFromState(
        cellsRef.current,
        selectedCellIdRef.current,
        networkOpen,
      );
      localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(snapshot));
      if (showToast) pushToast("Notebook saved.", "success");
    },
    [networkOpen, pushToast],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => saveNotebook(false), 600);
    return () => window.clearTimeout(timer);
  }, [cells, selectedCellId, networkOpen, saveNotebook]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        saveRuntimeSnapshot(
          runtimeSnapshotFromState(
            cellsRef.current,
            consoleLogs,
            networkLogs,
            mutationLogs,
          ),
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

  useEffect(() => {
    void loadOperations()
      .then(setOperations)
      .catch((error) => pushToast(String(error), "error"));
  }, [pushToast]);

  useEffect(() => {
    const callback = parseOAuthCallback(window.location.search);
    if (callback.kind === "none") return;
    if (callback.kind === "error") {
      pushToast(callback.description ?? callback.error, "error");
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.hash}`,
      );
      return;
    }

    void exchangeCode(callback.code, callback.state)
      .then((nextToken) => {
        setToken(nextToken);
        pushToast("Login complete.", "success");
      })
      .catch((error) =>
        pushToast(
          error instanceof Error ? error.message : String(error),
          "error",
        ),
      )
      .finally(() => {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.hash}`,
        );
      });
  }, [pushToast]);

  useEffect(() => {
    if (!token?.accessToken) {
      setEntityIndexes(null);
      return;
    }
    void loadEntityIndexes(token.accessToken)
      .then(setEntityIndexes)
      .catch(() => setEntityIndexes(null));
  }, [token?.accessToken]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inEditor =
        target?.closest(".monaco-editor") || target?.tagName === "INPUT";
      const primary = event.metaKey || event.ctrlKey;

      if (inEditor) return;

      if (primary && event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        if (tokenRef.current) void runAllCells();
      } else if (primary && event.key === "Enter") {
        event.preventDefault();
        const cell =
          cellsRef.current.find(
            (item) => item.id === activeCellIdRef.current,
          ) ??
          cellsRef.current.find(
            (item) => item.id === selectedCellIdRef.current,
          ) ??
          cellsRef.current[0];
        if (cell && tokenRef.current) void runCellById(cell.id);
      } else if (primary && event.key.toLowerCase() === "b") {
        event.preventDefault();
        if (tokenRef.current) addCell(cellsRef.current.length);
      } else if (primary && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setNetworkOpen((current) => !current);
      } else if (primary && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void formatAllEditors().finally(() => saveNotebook(true));
      } else if (event.key === "Escape") {
        stopAll();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const resolveChip = useCallback(
    (value: unknown, fieldKey?: string): EntityChip | null =>
      findEntityChip(entityIndexes, value, fieldKey),
    [entityIndexes],
  );

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
    const hash = encodeShare(
      snapshotFromState(cells, selectedCellId, networkOpen),
    );
    window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
    await navigator.clipboard
      ?.writeText(window.location.href)
      .catch(() => undefined);
    pushToast("Share URL copied.", "success");
  };

  const addCell = useCallback(
    (index = cellsRef.current.length) => {
      const cell = createCell(
        "// Write TypeScript here\nawait api.getMe()",
        `Cell ${cellsRef.current.length + 1}`,
      );
      setCells((current) => [
        ...current.slice(0, index),
        cell,
        ...current.slice(index),
      ]);
      selectCell(cell.id);
    },
    [selectCell],
  );

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

  canRunRef.current = () => !!tokenRef.current;
  runCellByIdRef.current = runCellById;
  runAllCellsRef.current = runAllCells;
  addCellAfterRef.current = (cellId: string) => {
    const index = cellsRef.current.findIndex((cell) => cell.id === cellId);
    addCell(index < 0 ? cellsRef.current.length : index + 1);
  };
  saveNotebookRef.current = saveNotebook;
  stopAllRef.current = stopAll;
  toggleNetworkRef.current = () => setNetworkOpen((current) => !current);

  return (
    <div className="app-shell">
      <TopBar
        operationCount={operations.length}
        loggedIn={!!token}
        clientConfigured={clientConfigured}
        onLogin={() =>
          void beginLogin(DEFAULT_SCOPE).catch((error) =>
            pushToast(
              error instanceof Error ? error.message : String(error),
              "error",
            ),
          )
        }
        onReset={resetRuntime}
        onShare={() => void shareNotebook()}
      />

      {!clientConfigured ? (
        <div className="status-strip">
          Set VITE_TRAQ_CLIENT_ID in .env to enable login.
        </div>
      ) : null}

      <main className="workspace" style={workspaceStyle}>
        {!token ? (
          <section className="auth-gate">
            <h1>Login required</h1>
            <p>traQ API Playground runs only after OAuth login.</p>
            <button
              type="button"
              disabled={!clientConfigured}
              onClick={() =>
                void beginLogin(DEFAULT_SCOPE).catch((error) =>
                  pushToast(
                    error instanceof Error ? error.message : String(error),
                    "error",
                  ),
                )
              }
            >
              <LogIn size={16} />
              Login with traQ
            </button>
          </section>
        ) : (
          <>
            <section className="notebook-pane" aria-label="Notebook cells">
              <div className="pane-header">
                <h1>Notebook</h1>
              </div>
              <div className="cells">
                <button
                  className="add-cell-button"
                  type="button"
                  onClick={() => addCell(0)}
                >
                  Add Cell
                </button>
                {cells.map((cell, index) => (
                  <div className="cell-with-insert" key={`${cell.id}-${index}`}>
                    <NotebookCellView
                      cell={cell}
                      index={index}
                      total={cells.length}
                      selected={cell.id === selectedCellId}
                      now={clock}
                      consoleLogs={
                        consoleLogsByCell.get(cell.id) ?? EMPTY_CONSOLE_LOGS
                      }
                      resolveChip={resolveChip}
                      onFocus={selectCell}
                      onRun={runCellById}
                      onMove={moveCell}
                      onRemove={removeCell}
                      onTitleChange={updateCellTitle}
                      onCodeChange={updateCellCode}
                      onReadOnlyChange={updateCellReadOnly}
                      beforeMount={beforeMount}
                      onEditorMount={onEditorMount(cell.id)}
                    />
                    <button
                      className="add-cell-button"
                      type="button"
                      onClick={() => addCell(index + 1)}
                    >
                      Add Cell
                    </button>
                  </div>
                ))}
              </div>
              <NetworkPanel
                cells={cells}
                networkLogs={networkLogs}
                mutationLogs={mutationLogs}
                open={networkOpen}
                onOpenChange={setNetworkOpen}
                resolveChip={resolveChip}
                onRevert={revertMutation}
                panelStyle={logsPanelStyle}
                onResizeStart={startLogsResize}
              />
            </section>
            <div
              className="workspace-resizer"
              role="separator"
              aria-label="Resize globals panel"
              aria-orientation="vertical"
              onPointerDown={startGlobalsResize}
            />
            <GlobalsPanel
              globals={entityIndexes?.globals ?? EMPTY_GLOBALS}
              resolveChip={resolveChip}
            />
          </>
        )}
      </main>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
