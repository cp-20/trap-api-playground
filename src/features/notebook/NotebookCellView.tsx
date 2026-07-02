import Editor, { type Monaco } from "@monaco-editor/react";
import { ArrowDown, ArrowUp, Play, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { memo } from "react";
import type { NotebookCell } from "./types";
import type { ConsoleLog } from "../../runtime/types";
import { CellOutput } from "./CellOutput";
import type { MountedEditor } from "./notebookEditor";
import styles from "./Notebook.module.css";

type Props = {
  cell: NotebookCell;
  /** Position in the visible notebook, used only to disable move controls. */
  index: number;
  /** Number of cells in the visible notebook, used only for move/delete limits. */
  total: number;
  selected: boolean;
  consoleLogs: ConsoleLog[];
  /** App clock tick while a cell is running so elapsed time can update without touching cell data. */
  now: number;
  onFocus: (cellId: string) => void;
  onRun: (cellId: string) => void;
  onMove: (cellId: string, direction: -1 | 1) => void;
  onRemove: (cellId: string) => void;
  onTitleChange: (cellId: string, title: string) => void;
  onCodeChange: (cellId: string, code: string) => void;
  onReadOnlyChange: (cellId: string, readOnly: boolean) => void;
  /** Monaco setup callback from the notebook editor hook. */
  beforeMount: (monaco: Monaco) => void;
  /** Cell-scoped Monaco mount callback from the notebook editor hook. */
  onEditorMount: (editor: MountedEditor, monaco: Monaco) => void;
};

const formatElapsed = (ms: number): string => {
  return `${(ms / 1000).toFixed(1)}s`;
};

type CellToolbarProps = Pick<
  Props,
  | "cell"
  | "index"
  | "total"
  | "now"
  | "onRun"
  | "onMove"
  | "onRemove"
  | "onTitleChange"
  | "onReadOnlyChange"
>;

const CellToolbar = ({
  cell,
  index,
  total,
  now,
  onRun,
  onMove,
  onRemove,
  onTitleChange,
  onReadOnlyChange,
}: CellToolbarProps) => {
  const result = cell.result;
  const running = result.status === "running";
  const duration =
    result.status === "success" || result.status === "error" ? result.durationMs : undefined;

  return (
    <div className={styles.cellToolbar}>
      <input
        aria-label="Cell title"
        id={`${cell.id}-title`}
        name={`${cell.id}-title`}
        value={cell.title}
        onChange={(event) => onTitleChange(cell.id, event.target.value)}
      />
      {running ? (
        <span className={styles.cellRunning}>
          <span className={styles.cellRunningDot} />
          {result.current ?? "Running"} {formatElapsed(now - result.startedAt)}
        </span>
      ) : duration !== undefined ? (
        <span className={styles.cellDuration}>{formatElapsed(duration)}</span>
      ) : null}
      <button type="button" onClick={() => onRun(cell.id)} title="Run cell (Ctrl+Enter)">
        <Play size={15} />
      </button>
      <button
        type="button"
        className={cell.readOnly ? styles.cellReadonlyButton : ""}
        onClick={() => onReadOnlyChange(cell.id, !cell.readOnly)}
        title={
          cell.readOnly ? "Read-only API mode: mutation APIs blocked" : "Mutation APIs enabled"
        }
      >
        {cell.readOnly ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
      </button>
      <button
        type="button"
        onClick={() => onMove(cell.id, -1)}
        title="Move up"
        disabled={index === 0}
      >
        <ArrowUp size={15} />
      </button>
      <button
        type="button"
        onClick={() => onMove(cell.id, 1)}
        title="Move down"
        disabled={index === total - 1}
      >
        <ArrowDown size={15} />
      </button>
      <button
        type="button"
        onClick={() => onRemove(cell.id)}
        title="Delete cell"
        disabled={total === 1}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};

type CellEditorProps = Pick<Props, "cell" | "beforeMount" | "onEditorMount" | "onCodeChange">;

const CellEditor = ({ cell, beforeMount, onEditorMount, onCodeChange }: CellEditorProps) => (
  <div className={styles.editorFrame}>
    <Editor
      beforeMount={beforeMount}
      onMount={onEditorMount}
      height="220px"
      defaultLanguage="typescript"
      theme="github-dark-dimmed"
      defaultValue={cell.code}
      path={`${cell.id}.ts`}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        tabSize: 2,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        formatOnPaste: true,
      }}
      onChange={(value) => onCodeChange(cell.id, value ?? "")}
    />
  </div>
);

const NotebookCellViewComponent = ({
  cell,
  index,
  total,
  selected,
  consoleLogs,
  now,
  onFocus,
  onRun,
  onMove,
  onRemove,
  onTitleChange,
  onCodeChange,
  onReadOnlyChange,
  beforeMount,
  onEditorMount,
}: Props) => {
  return (
    <article
      className={`${styles.cell} ${selected ? styles.cellSelected : ""}`}
      onFocus={() => onFocus(cell.id)}
    >
      <CellToolbar
        cell={cell}
        index={index}
        total={total}
        now={now}
        onRun={onRun}
        onMove={onMove}
        onRemove={onRemove}
        onTitleChange={onTitleChange}
        onReadOnlyChange={onReadOnlyChange}
      />
      <CellEditor
        cell={cell}
        beforeMount={beforeMount}
        onEditorMount={onEditorMount}
        onCodeChange={onCodeChange}
      />
      <CellOutput cell={cell} consoleLogs={consoleLogs} />
    </article>
  );
};

export const NotebookCellView = memo(NotebookCellViewComponent, (previous, next) => {
  const previousRunning = previous.cell.result.status === "running";
  const nextRunning = next.cell.result.status === "running";
  const sameClockState = previousRunning || nextRunning ? previous.now === next.now : true;

  return (
    previous.cell === next.cell &&
    previous.index === next.index &&
    previous.total === next.total &&
    previous.selected === next.selected &&
    previous.consoleLogs === next.consoleLogs &&
    previous.onFocus === next.onFocus &&
    previous.onRun === next.onRun &&
    previous.onMove === next.onMove &&
    previous.onRemove === next.onRemove &&
    previous.onTitleChange === next.onTitleChange &&
    previous.onCodeChange === next.onCodeChange &&
    previous.onReadOnlyChange === next.onReadOnlyChange &&
    previous.beforeMount === next.beforeMount &&
    previous.onEditorMount === next.onEditorMount &&
    sameClockState
  );
});
