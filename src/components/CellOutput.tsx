import type { EntityChip } from "../enrichment";
import type { ConsoleLog, NotebookCell } from "../types";
import { JsonView } from "./JsonView";
import { ResultPanel } from "./ResultPanel";

type Props = {
  cell: NotebookCell;
  consoleLogs: ConsoleLog[];
  resolveChip: (value: unknown, fieldKey?: string) => EntityChip | null;
};

export function CellOutput({ cell, consoleLogs, resolveChip }: Props) {
  const showResult =
    cell.result.status !== "idle" && cell.result.status !== "running";
  const showConsole = consoleLogs.length > 0;
  const visibleLogs = consoleLogs.slice(-80);
  const omittedLogs = Math.max(0, consoleLogs.length - visibleLogs.length);

  if (!showResult && !showConsole) return null;

  return (
    <div className="cell-output">
      <section className="inline-panel">
        <h3>Result</h3>
        {showConsole ? (
          <div className="inline-log inline-log--result">
            {omittedLogs ? (
              <div className="output-omitted">
                {omittedLogs} older console entries hidden
              </div>
            ) : null}
            {visibleLogs.map((log) => (
              <div
                className={`console-line console-line--${log.level} ${
                  log.kind === "runtime-warning"
                    ? "console-line--runtime-warning"
                    : ""
                }`}
                key={log.id}
              >
                {log.kind === "runtime-warning" ? (
                  <span className="console-warning-label">Read-only mode</span>
                ) : null}
                {log.values.map((value, index) => (
                  <div className="console-value" key={index}>
                    <JsonView value={value} resolveChip={resolveChip} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        {showResult ? (
          <ResultPanel result={cell.result} resolveChip={resolveChip} />
        ) : null}
      </section>
    </div>
  );
}
