import type { NotebookCell } from "./types";
import type { ConsoleLog } from "../../runtime/types";
import { JsonView } from "../../components/json-view/JsonView";
import { ResultPanel } from "./ResultPanel";
import styles from "./Notebook.module.css";

type Props = {
  cell: NotebookCell;
  consoleLogs: ConsoleLog[];
};

export const CellOutput = ({ cell, consoleLogs }: Props) => {
  const showResult = cell.result.status !== "idle" && cell.result.status !== "running";
  const showConsole = consoleLogs.length > 0;
  const visibleLogs = consoleLogs.slice(-80);
  const omittedLogs = Math.max(0, consoleLogs.length - visibleLogs.length);

  if (!showResult && !showConsole) return null;

  return (
    <div className={styles.cellOutput}>
      <section className={styles.inlinePanel}>
        <h3>結果</h3>
        {showConsole ? (
          <div className={`${styles.inlineLog} ${styles.inlineLogResult}`}>
            {omittedLogs ? (
              <div className={styles.outputOmitted}>
                古い console 出力 {omittedLogs} 件を省略しています
              </div>
            ) : null}
            {visibleLogs.map((log) => (
              <div
                className={`${styles.consoleLine} ${
                  log.level === "warn" ? styles.consoleLineWarn : ""
                } ${log.level === "error" ? styles.consoleLineError : ""} ${
                  log.kind === "runtime-warning" ? styles.consoleLineRuntimeWarning : ""
                }`}
                key={log.id}
              >
                {log.kind === "runtime-warning" ? (
                  <span className={styles.consoleWarningLabel}>読み取り専用モード</span>
                ) : null}
                {log.values.map((value, index) => (
                  <div className={styles.consoleValue} key={index}>
                    <JsonView value={value} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        {showResult ? <ResultPanel result={cell.result} /> : null}
      </section>
    </div>
  );
};
