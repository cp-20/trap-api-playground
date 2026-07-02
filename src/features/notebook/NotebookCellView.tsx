import Editor, { type Monaco } from "@monaco-editor/react";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowDown, ArrowUp, Play, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { memo } from "react";
import type { NotebookCell } from "./types";
import { CellOutput } from "./CellOutput";
import type { MountedEditor } from "./notebookEditor";
import {
  cellsAtom,
  consoleLogsByCellAtom,
  EMPTY_CONSOLE_LOGS,
  moveCellAtom,
  removeCellAtom,
  selectCellAtom,
  selectedCellIdAtom,
  updateCellAtom,
} from "./state";
import styles from "./Notebook.module.css";

type Props = {
  cellId: string;
  /** Position in the visible notebook, used only to disable move controls. */
  index: number;
  /** Number of cells in the visible notebook, used only for move/delete limits. */
  total: number;
  /** App clock tick while a cell is running so elapsed time can update without touching cell data. */
  now: number;
  onRun: (cellId: string) => void;
  /** Monaco setup callback from the notebook editor hook. */
  beforeMount: (monaco: Monaco) => void;
  /** Cell-scoped Monaco mount callback from the notebook editor hook. */
  onEditorMount: (cellId: string) => (editor: MountedEditor, monaco: Monaco) => void;
};

const formatElapsed = (ms: number): string => {
  return `${(ms / 1000).toFixed(1)}s`;
};

type CellToolbarProps = Pick<Props, "index" | "total" | "now" | "onRun"> & {
  cell: NotebookCell;
};

const CellToolbar = ({ cell, index, total, now, onRun }: CellToolbarProps) => {
  const moveCell = useSetAtom(moveCellAtom);
  const removeCell = useSetAtom(removeCellAtom);
  const updateCell = useSetAtom(updateCellAtom);
  const result = cell.result;
  const running = result.status === "running";
  const duration =
    result.status === "success" || result.status === "error" ? result.durationMs : undefined;

  return (
    <div className={styles.cellToolbar}>
      <input
        aria-label="セルのタイトル"
        id={`${cell.id}-title`}
        name={`${cell.id}-title`}
        value={cell.title}
        onChange={(event) => updateCell({ cellId: cell.id, patch: { title: event.target.value } })}
      />
      {running ? (
        <span className={styles.cellRunning}>
          <span className={styles.cellRunningDot} />
          {result.current ?? "実行中"} {formatElapsed(now - result.startedAt)}
        </span>
      ) : duration !== undefined ? (
        <span className={styles.cellDuration}>{formatElapsed(duration)}</span>
      ) : null}
      <button type="button" onClick={() => onRun(cell.id)} title="セルを実行 (Ctrl+Enter)">
        <Play size={15} />
      </button>
      <button
        type="button"
        className={cell.readOnly ? styles.cellReadonlyButton : ""}
        onClick={() => updateCell({ cellId: cell.id, patch: { readOnly: !cell.readOnly } })}
        title={
          cell.readOnly ? "読み取り専用 API モード: 更新系 API をブロック" : "更新系 API を有効化"
        }
      >
        {cell.readOnly ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
      </button>
      <button
        type="button"
        onClick={() => moveCell(cell.id, -1)}
        title="上に移動"
        disabled={index === 0}
      >
        <ArrowUp size={15} />
      </button>
      <button
        type="button"
        onClick={() => moveCell(cell.id, 1)}
        title="下に移動"
        disabled={index === total - 1}
      >
        <ArrowDown size={15} />
      </button>
      <button
        type="button"
        onClick={() => removeCell(cell.id)}
        title="セルを削除"
        disabled={total === 1}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};

type CellEditorProps = Pick<Props, "beforeMount" | "onEditorMount"> & {
  cell: NotebookCell;
};

const CellEditor = ({ cell, beforeMount, onEditorMount }: CellEditorProps) => {
  const updateCell = useSetAtom(updateCellAtom);

  return (
    <div className={styles.editorFrame}>
      <Editor
        beforeMount={beforeMount}
        onMount={onEditorMount(cell.id)}
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
        onChange={(value) => updateCell({ cellId: cell.id, patch: { code: value ?? "" } })}
      />
    </div>
  );
};

const NotebookCellViewComponent = ({
  cellId,
  index,
  total,
  now,
  onRun,
  beforeMount,
  onEditorMount,
}: Props) => {
  const cells = useAtomValue(cellsAtom);
  const selectedCellId = useAtomValue(selectedCellIdAtom);
  const consoleLogsByCell = useAtomValue(consoleLogsByCellAtom);
  const selectCell = useSetAtom(selectCellAtom);
  const cell = cells.find((item) => item.id === cellId);
  if (!cell) return null;

  const selected = cell.id === selectedCellId;
  const consoleLogs = consoleLogsByCell.get(cell.id) ?? EMPTY_CONSOLE_LOGS;

  return (
    <article
      className={`${styles.cell} ${selected ? styles.cellSelected : ""}`}
      onFocus={() => selectCell(cell.id)}
    >
      <CellToolbar cell={cell} index={index} total={total} now={now} onRun={onRun} />
      <CellEditor cell={cell} beforeMount={beforeMount} onEditorMount={onEditorMount} />
      <CellOutput cell={cell} consoleLogs={consoleLogs} />
    </article>
  );
};

export const NotebookCellView = memo(NotebookCellViewComponent, (previous, next) => {
  return (
    previous.cellId === next.cellId &&
    previous.index === next.index &&
    previous.total === next.total &&
    previous.onRun === next.onRun &&
    previous.beforeMount === next.beforeMount &&
    previous.onEditorMount === next.onEditorMount &&
    previous.now === next.now
  );
});
