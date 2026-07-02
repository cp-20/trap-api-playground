import Editor, { type Monaco } from "@monaco-editor/react";
import {
  ArrowDown,
  ArrowUp,
  Play,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { memo } from "react";
import type { EntityChip } from "../enrichment";
import type { ConsoleLog, NotebookCell } from "../types";
import { CellOutput } from "./CellOutput";
import type { MountedEditor } from "./notebookEditor";

type Props = {
  cell: NotebookCell;
  index: number;
  total: number;
  selected: boolean;
  consoleLogs: ConsoleLog[];
  resolveChip: (value: unknown, fieldKey?: string) => EntityChip | null;
  now: number;
  onFocus: (cellId: string) => void;
  onRun: (cellId: string) => void;
  onMove: (cellId: string, direction: -1 | 1) => void;
  onRemove: (cellId: string) => void;
  onTitleChange: (cellId: string, title: string) => void;
  onCodeChange: (cellId: string, code: string) => void;
  onReadOnlyChange: (cellId: string, readOnly: boolean) => void;
  beforeMount: (monaco: Monaco) => void;
  onEditorMount: (editor: MountedEditor, monaco: Monaco) => void;
};

function formatElapsed(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function NotebookCellViewComponent({
  cell,
  index,
  total,
  selected,
  consoleLogs,
  resolveChip,
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
}: Props) {
  const result = cell.result;
  const running = result.status === "running";
  const duration =
    result.status === "success" || result.status === "error"
      ? result.durationMs
      : undefined;

  return (
    <article
      className={`cell ${selected ? "cell--selected" : ""}`}
      onFocus={() => onFocus(cell.id)}
    >
      <div className="cell-toolbar">
        <input
          aria-label="Cell title"
          id={`${cell.id}-title`}
          name={`${cell.id}-title`}
          value={cell.title}
          onChange={(event) => onTitleChange(cell.id, event.target.value)}
        />
        {running ? (
          <span className="cell-running">
            <span className="cell-running-dot" />
            {result.current ?? "Running"}{" "}
            {formatElapsed(now - result.startedAt)}
          </span>
        ) : duration !== undefined ? (
          <span className="cell-duration">{formatElapsed(duration)}</span>
        ) : null}
        <button
          type="button"
          onClick={() => onRun(cell.id)}
          title="Run cell (Ctrl+Enter)"
        >
          <Play size={15} />
        </button>
        <button
          type="button"
          className={cell.readOnly ? "cell-readonly-button" : ""}
          onClick={() => onReadOnlyChange(cell.id, !cell.readOnly)}
          title={
            cell.readOnly
              ? "Read-only API mode: mutation APIs blocked"
              : "Mutation APIs enabled"
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
      <div className="editor-frame">
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
      <CellOutput
        cell={cell}
        consoleLogs={consoleLogs}
        resolveChip={resolveChip}
      />
    </article>
  );
}

export const NotebookCellView = memo(
  NotebookCellViewComponent,
  (previous, next) => {
    const previousRunning = previous.cell.result.status === "running";
    const nextRunning = next.cell.result.status === "running";
    const sameClockState =
      previousRunning || nextRunning ? previous.now === next.now : true;

    return (
      previous.cell === next.cell &&
      previous.index === next.index &&
      previous.total === next.total &&
      previous.selected === next.selected &&
      previous.consoleLogs === next.consoleLogs &&
      previous.resolveChip === next.resolveChip &&
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
  },
);
