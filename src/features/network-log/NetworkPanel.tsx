import { ChevronDown, ChevronUp, History, ListTree, RotateCcw } from "lucide-react";
import {
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { NotebookCell } from "../notebook/types";
import type { MutationLog, NetworkLog } from "../../runtime/types";
import { JsonView } from "../../components/json-view/JsonView";
import styles from "./NetworkPanel.module.css";

type LogTab = "network" | "edit";

type Props = {
  cells: NotebookCell[];
  networkLogs: NetworkLog[];
  mutationLogs: MutationLog[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevert: (log: MutationLog) => void;
  /** Inline size constraints from the resizable layout hook. */
  panelStyle?: CSSProperties;
  /** Pointer handler owned by the layout hook so this panel does not manage global drag listeners. */
  onResizeStart?: (event: ReactPointerEvent<HTMLElement>) => void;
};

const RevertState = ({
  log,
  onRevert,
}: {
  log: MutationLog;
  onRevert: (log: MutationLog) => void;
}) => {
  if (log.revert.status === "available") {
    return (
      <button type="button" onClick={() => onRevert(log)} title="Revert this edit">
        <RotateCcw size={14} />
        Revert
      </button>
    );
  }
  if (log.revert.status === "reverted") {
    return <span className={`${styles.editState} ${styles.editStateOk}`}>reverted</span>;
  }
  if (log.revert.status === "failed") {
    return (
      <span className={`${styles.editState} ${styles.editStateBad}`}>{log.revert.reason}</span>
    );
  }
  return <span className={styles.editState}>{log.revert.reason}</span>;
};

export const NetworkPanel = ({
  cells,
  networkLogs,
  mutationLogs,
  open,
  onOpenChange,
  onRevert,
  panelStyle,
  onResizeStart,
}: Props) => {
  const [tab, setTab] = useState<LogTab>("network");
  const cellsById = useMemo(() => new Map(cells.map((cell) => [cell.id, cell])), [cells]);
  const formatDuration = (durationMs?: number) =>
    typeof durationMs === "number" ? `${durationMs}ms` : "...";

  return (
    <section
      className={`${styles.networkPanel} ${open ? styles.networkPanelOpen : ""}`}
      style={panelStyle}
    >
      {open ? (
        <div
          className={`${styles.panelResizer} ${styles.panelResizerLogs}`}
          role="separator"
          aria-label="Resize logs panel"
          aria-orientation="horizontal"
          onPointerDown={onResizeStart}
        />
      ) : null}
      <div className={styles.networkPanelHead}>
        <button
          className={styles.networkPanelToggle}
          type="button"
          onClick={() => onOpenChange(!open)}
          title={open ? "Hide logs" : "Show logs"}
        >
          {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          Logs
        </button>
        <div className={styles.networkTabs} role="tablist" aria-label="Logs">
          <button
            type="button"
            className={tab === "network" ? styles.activeTab : ""}
            onClick={() => {
              setTab("network");
              onOpenChange(true);
            }}
          >
            <ListTree size={15} />
            Network
            <span>{networkLogs.length}</span>
          </button>
          <button
            type="button"
            className={tab === "edit" ? styles.activeTab : ""}
            onClick={() => {
              setTab("edit");
              onOpenChange(true);
            }}
          >
            <History size={15} />
            Edit Log
            <span>{mutationLogs.length}</span>
          </button>
        </div>
      </div>
      {open ? (
        <div className={styles.networkPanelBody}>
          {tab === "network" ? (
            networkLogs.length ? (
              networkLogs.map((log) => (
                <div className={styles.networkLine} key={`${log.id}-${log.finishedAt ?? "start"}`}>
                  <time>{new Date(log.startedAt).toLocaleTimeString()}</time>
                  <strong>{log.operationId}</strong>
                  <span>{log.method}</span>
                  <span className={log.ok === false ? styles.statusBad : ""}>
                    {log.status ?? (log.error ? "ERR" : "...")}
                  </span>
                  <span>{formatDuration(log.durationMs)}</span>
                  <span>{log.url}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No network calls.</div>
            )
          ) : null}

          {tab === "edit" ? (
            mutationLogs.length ? (
              <div className={styles.editLog}>
                {mutationLogs.map((log) => (
                  <details key={log.id}>
                    <summary>
                      <span>
                        {log.method} {log.operationId}
                      </span>
                      <span>{cellsById.get(log.cellId)?.title ?? "Cell"}</span>
                      <span>{log.status}</span>
                      <RevertState log={log} onRevert={onRevert} />
                    </summary>
                    <div className={styles.editLogBody}>
                      <dl>
                        <div>
                          <dt>URL</dt>
                          <dd>{log.url}</dd>
                        </div>
                        <div>
                          <dt>Request</dt>
                          <dd>
                            <JsonView value={log.request} />
                          </dd>
                        </div>
                        {log.before !== undefined ? (
                          <div>
                            <dt>Before</dt>
                            <dd>
                              <JsonView value={log.before} />
                            </dd>
                          </div>
                        ) : null}
                        {log.response !== undefined ? (
                          <div>
                            <dt>Response</dt>
                            <dd>
                              <JsonView value={log.response} />
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>No edits recorded.</div>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
