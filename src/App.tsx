import { useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { operationsAtom } from "./features/operations/state";
import { beginLogin } from "./features/auth/oauth";
import { AuthGate } from "./features/auth/AuthGate";
import { useOAuthCallback } from "./features/auth/useOAuthCallback";
import { tokenAtom } from "./features/auth/state";
import { DEFAULT_SCOPE } from "./config";
import { ToastViewport } from "./components/toast/ToastViewport";
import { useToasts } from "./components/toast/useToasts";
import { TopBar } from "./features/app-shell/TopBar";
import { NotebookWorkspace } from "./features/app-shell/NotebookWorkspace";
import { useAppData } from "./features/app-shell/useAppData";
import { entityIndexesAtom } from "./features/entities/state";
import { useNotebookEditors, type MountedEditor } from "./features/notebook/notebookEditor";
import { notebookSnapshotStorage, snapshotFromState } from "./features/notebook/storage";
import {
  cellsAtom,
  networkOpenAtom,
  notebookCommandsAtom,
  selectCellAtom,
  selectedCellIdAtom,
} from "./features/notebook/state";
import { useGlobalShortcuts } from "./features/notebook/useGlobalShortcuts";
import { useNotebookPersistence } from "./features/notebook/useNotebookPersistence";
import { useRunningClock } from "./features/notebook/useRunningClock";
import { useRuntimeWorker } from "./features/notebook/useRuntimeWorker";
import { encodeShare } from "./features/share/codec";
import styles from "./App.module.css";

export const App = () => {
  const store = useStore();
  const cells = useAtomValue(cellsAtom);
  const selectedCellId = useAtomValue(selectedCellIdAtom);
  const [networkOpen, setNetworkOpen] = useAtom(networkOpenAtom);
  const setOperations = useSetAtom(operationsAtom);
  const [token, setToken] = useAtom(tokenAtom);
  const setEntityIndexes = useSetAtom(entityIndexesAtom);
  const selectCellAction = useSetAtom(selectCellAtom);
  const setNotebookCommands = useSetAtom(notebookCommandsAtom);
  const { toasts, pushToast, dismissToast } = useToasts();
  const editorRefs = useRef(new Map<string, MountedEditor>());
  const { runtimeScopeVariables, runCell, stopAll, resetRuntime, revertMutation } =
    useRuntimeWorker({ pushToast });

  const hasRunningCell = useMemo(
    () => cells.some((cell) => cell.result.status === "running"),
    [cells],
  );
  const clock = useRunningClock(hasRunningCell);

  useAppData({ token, setOperations, setEntityIndexes, pushToast });
  useOAuthCallback({ setToken, pushToast });

  const login = useCallback(() => {
    void beginLogin(DEFAULT_SCOPE).catch((error) =>
      pushToast(error instanceof Error ? error.message : String(error), "error"),
    );
  }, [pushToast]);

  const { beforeMount, formatAllEditors, onEditorMount, prepareCodeForRun } = useNotebookEditors({
    editorRefs,
    runtimeScopeVariables,
  });

  const runCellById = useCallback(
    async (cellId: string) => {
      selectCellAction(cellId);
      const cell = store.get(cellsAtom).find((item) => item.id === cellId);
      if (!cell || !store.get(tokenAtom)) return;
      const code = await prepareCodeForRun(cell.id, cell.code);
      runCell({ ...cell, code });
    },
    [prepareCodeForRun, runCell, selectCellAction, store],
  );

  const runAllCells = useCallback(async () => {
    if (!store.get(tokenAtom)) return;
    for (const cell of store.get(cellsAtom)) {
      await runCellById(cell.id);
    }
  }, [runCellById, store]);

  const saveNotebook = useCallback(
    (showToast = false) => {
      const snapshot = snapshotFromState(
        store.get(cellsAtom),
        store.get(selectedCellIdAtom),
        store.get(networkOpenAtom),
      );
      notebookSnapshotStorage.write(snapshot);
      if (showToast) pushToast("ノートブックを保存しました。", "success");
    },
    [pushToast, store],
  );

  useNotebookPersistence({ pushToast });

  const shareNotebook = async () => {
    const hash = encodeShare(snapshotFromState(cells, selectedCellId, networkOpen));
    window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
    await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
    pushToast("共有 URL をコピーしました。", "success");
  };

  const toggleNetwork = useCallback(() => setNetworkOpen((current) => !current), []);

  useGlobalShortcuts();

  useEffect(() => {
    setNotebookCommands({
      canRun: () => !!store.get(tokenAtom),
      runAllCells,
      runCellById,
      toggleNetwork,
      saveNotebook,
      formatAllEditors,
      stopAll,
    });
  }, [
    formatAllEditors,
    runAllCells,
    runCellById,
    saveNotebook,
    setNotebookCommands,
    stopAll,
    store,
    toggleNetwork,
  ]);

  return (
    <div className={styles.appShell}>
      <TopBar onLogin={login} onReset={resetRuntime} onShare={() => void shareNotebook()} />
      {!token ? (
        <main className={styles.workspace}>
          <AuthGate onLogin={login} />
        </main>
      ) : (
        <NotebookWorkspace
          clock={clock}
          onRunCell={runCellById}
          beforeMount={beforeMount}
          onEditorMount={onEditorMount}
          onRevertMutation={revertMutation}
        />
      )}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
