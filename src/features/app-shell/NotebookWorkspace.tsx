import type { Monaco } from "@monaco-editor/react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { GlobalsPanel } from "../globals/GlobalsPanel";
import { NetworkPanel } from "../network-log/NetworkPanel";
import { NotebookCellView } from "../notebook/NotebookCellView";
import type { MountedEditor } from "../notebook/notebookEditor";
import type { NotebookCell } from "../notebook/types";
import { EMPTY_GLOBALS, type EntityIndexes } from "../entities/types";
import type { ConsoleLog, MutationLog, NetworkLog } from "../../runtime/types";
import styles from "../../App.module.css";

type CellActions = {
  onFocus: (cellId: string) => void;
  onRun: (cellId: string) => void;
  onMove: (cellId: string, direction: -1 | 1) => void;
  onRemove: (cellId: string) => void;
  onTitleChange: (cellId: string, title: string) => void;
  onCodeChange: (cellId: string, code: string) => void;
  onReadOnlyChange: (cellId: string, readOnly: boolean) => void;
  onAddCell: (index?: number) => void;
};

type EditorBindings = {
  beforeMount: (monaco: Monaco) => void;
  onEditorMount: (cellId: string) => (editor: MountedEditor, monaco: Monaco) => void;
};

type LogBindings = {
  networkOpen: boolean;
  networkLogs: NetworkLog[];
  mutationLogs: MutationLog[];
  onNetworkOpenChange: (open: boolean) => void;
  onRevertMutation: (log: MutationLog) => void;
};

type LayoutBindings = {
  workspaceStyle: CSSProperties;
  logsPanelStyle: CSSProperties;
  onGlobalsResizeStart: (event: ReactPointerEvent<HTMLElement>) => void;
  onLogsResizeStart: (event: ReactPointerEvent<HTMLElement>) => void;
};

type Props = {
  cells: NotebookCell[];
  selectedCellId: string;
  /** Monotonic UI clock used only for running-cell elapsed labels. */
  clock: number;
  consoleLogsByCell: Map<string, ConsoleLog[]>;
  emptyConsoleLogs: ConsoleLog[];
  entityIndexes: EntityIndexes | null;
  cellActions: CellActions;
  editorBindings: EditorBindings;
  logBindings: LogBindings;
  layoutBindings: LayoutBindings;
};

export const NotebookWorkspace = ({
  cells,
  selectedCellId,
  clock,
  consoleLogsByCell,
  emptyConsoleLogs,
  entityIndexes,
  cellActions,
  editorBindings,
  logBindings,
  layoutBindings,
}: Props) => (
  <main className={styles.workspace} style={layoutBindings.workspaceStyle}>
    <section className={styles.notebookPane} aria-label="Notebook cells">
      <div className={styles.paneHeader}>
        <h1>Notebook</h1>
      </div>
      <div className={styles.cells}>
        <button
          className={styles.addCellButton}
          type="button"
          onClick={() => cellActions.onAddCell(0)}
        >
          Add Cell
        </button>
        {cells.map((cell, index) => (
          <div className={styles.cellWithInsert} key={`${cell.id}-${index}`}>
            <NotebookCellView
              cell={cell}
              index={index}
              total={cells.length}
              selected={cell.id === selectedCellId}
              now={clock}
              consoleLogs={consoleLogsByCell.get(cell.id) ?? emptyConsoleLogs}
              onFocus={cellActions.onFocus}
              onRun={cellActions.onRun}
              onMove={cellActions.onMove}
              onRemove={cellActions.onRemove}
              onTitleChange={cellActions.onTitleChange}
              onCodeChange={cellActions.onCodeChange}
              onReadOnlyChange={cellActions.onReadOnlyChange}
              beforeMount={editorBindings.beforeMount}
              onEditorMount={editorBindings.onEditorMount(cell.id)}
            />
            <button
              className={styles.addCellButton}
              type="button"
              onClick={() => cellActions.onAddCell(index + 1)}
            >
              Add Cell
            </button>
          </div>
        ))}
      </div>
      <NetworkPanel
        cells={cells}
        networkLogs={logBindings.networkLogs}
        mutationLogs={logBindings.mutationLogs}
        open={logBindings.networkOpen}
        onOpenChange={logBindings.onNetworkOpenChange}
        onRevert={logBindings.onRevertMutation}
        panelStyle={layoutBindings.logsPanelStyle}
        onResizeStart={layoutBindings.onLogsResizeStart}
      />
    </section>
    <div
      className={styles.workspaceResizer}
      role="separator"
      aria-label="Resize globals panel"
      aria-orientation="vertical"
      onPointerDown={layoutBindings.onGlobalsResizeStart}
    />
    <GlobalsPanel globals={entityIndexes?.globals ?? EMPTY_GLOBALS} />
  </main>
);
