import type { Monaco } from "@monaco-editor/react";
import { useAtomValue, useSetAtom } from "jotai";
import { GlobalsPanel } from "../globals/GlobalsPanel";
import { NetworkPanel } from "../network-log/NetworkPanel";
import { NotebookCellView } from "../notebook/NotebookCellView";
import type { MountedEditor } from "../notebook/notebookEditor";
import { addCellAtom, cellsAtom } from "../notebook/state";
import { useResizableLayout } from "./useResizableLayout";
import type { MutationLog } from "../../runtime/types";
import styles from "../../App.module.css";

type Props = {
  /** Monotonic UI clock used only for running-cell elapsed labels. */
  clock: number;
  onRunCell: (cellId: string) => void;
  beforeMount: (monaco: Monaco) => void;
  onEditorMount: (cellId: string) => (editor: MountedEditor, monaco: Monaco) => void;
  onRevertMutation: (log: MutationLog) => void;
};

export const NotebookWorkspace = ({
  clock,
  onRunCell,
  beforeMount,
  onEditorMount,
  onRevertMutation,
}: Props) => {
  const cells = useAtomValue(cellsAtom);
  const addCell = useSetAtom(addCellAtom);
  const { logsPanelStyle, startGlobalsResize, startLogsResize, workspaceStyle } =
    useResizableLayout();

  return (
    <main className={styles.workspace} style={workspaceStyle}>
      <section className={styles.notebookPane} aria-label="ノートブックのセル">
        <div className={styles.paneHeader}>
          <h1>ノートブック</h1>
        </div>
        <div className={styles.cells}>
          <button className={styles.addCellButton} type="button" onClick={() => addCell(0)}>
            セルを追加
          </button>
          {cells.map((cell, index) => (
            <div className={styles.cellWithInsert} key={`${cell.id}-${index}`}>
              <NotebookCellView
                cellId={cell.id}
                index={index}
                total={cells.length}
                now={clock}
                onRun={onRunCell}
                beforeMount={beforeMount}
                onEditorMount={onEditorMount}
              />
              <button
                className={styles.addCellButton}
                type="button"
                onClick={() => addCell(index + 1)}
              >
                セルを追加
              </button>
            </div>
          ))}
        </div>
        <NetworkPanel
          onRevert={onRevertMutation}
          panelStyle={logsPanelStyle}
          onResizeStart={startLogsResize}
        />
      </section>
      <div
        className={styles.workspaceResizer}
        role="separator"
        aria-label="Globals パネルの幅を変更"
        aria-orientation="vertical"
        onPointerDown={startGlobalsResize}
      />
      <GlobalsPanel />
    </main>
  );
};
