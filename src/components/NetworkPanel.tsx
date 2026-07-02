import {
  ChevronDown,
  ChevronUp,
  History,
  ListTree,
  RotateCcw,
} from "lucide-react";
import {
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { EntityChip } from "../enrichment";
import type { MutationLog, NetworkLog, NotebookCell } from "../types";
import { JsonView } from "./JsonView";

type LogTab = "network" | "edit";

type Props = {
  cells: NotebookCell[];
  networkLogs: NetworkLog[];
  mutationLogs: MutationLog[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resolveChip: (value: unknown, fieldKey?: string) => EntityChip | null;
  onRevert: (log: MutationLog) => void;
  panelStyle?: CSSProperties;
  onResizeStart?: (event: ReactPointerEvent<HTMLElement>) => void;
};

function RevertState({
  log,
  onRevert,
}: {
  log: MutationLog;
  onRevert: (log: MutationLog) => void;
}) {
  if (log.revert.status === "available") {
    return (
      <button
        type="button"
        onClick={() => onRevert(log)}
        title="Revert this edit"
      >
        <RotateCcw size={14} />
        Revert
      </button>
    );
  }
  if (log.revert.status === "reverted") {
    return <span className="edit-state edit-state--ok">reverted</span>;
  }
  if (log.revert.status === "failed") {
    return (
      <span className="edit-state edit-state--bad">{log.revert.reason}</span>
    );
  }
  return <span className="edit-state">{log.revert.reason}</span>;
}

export function NetworkPanel({
  cells,
  networkLogs,
  mutationLogs,
  open,
  onOpenChange,
  resolveChip,
  onRevert,
  panelStyle,
  onResizeStart,
}: Props) {
  const [tab, setTab] = useState<LogTab>("network");
  const cellsById = useMemo(
    () => new Map(cells.map((cell) => [cell.id, cell])),
    [cells],
  );
  const formatDuration = (durationMs?: number) =>
    typeof durationMs === "number" ? `${durationMs}ms` : "...";

  return (
    <section
      className={`network-panel ${open ? "network-panel--open" : ""}`}
      style={panelStyle}
    >
      {open ? (
        <div
          className="panel-resizer panel-resizer--logs"
          role="separator"
          aria-label="Resize logs panel"
          aria-orientation="horizontal"
          onPointerDown={onResizeStart}
        />
      ) : null}
      <div className="network-panel-head">
        <button
          className="network-panel-toggle"
          type="button"
          onClick={() => onOpenChange(!open)}
          title={open ? "Hide logs" : "Show logs"}
        >
          {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          Logs
        </button>
        <div className="network-tabs" role="tablist" aria-label="Logs">
          <button
            type="button"
            className={tab === "network" ? "active" : ""}
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
            className={tab === "edit" ? "active" : ""}
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
        <div className="network-panel-body">
          {tab === "network" ? (
            networkLogs.length ? (
              networkLogs.map((log) => (
                <div
                  className="network-line"
                  key={`${log.id}-${log.finishedAt ?? "start"}`}
                >
                  <time>{new Date(log.startedAt).toLocaleTimeString()}</time>
                  <strong>{log.operationId}</strong>
                  <span>{log.method}</span>
                  <span className={log.ok === false ? "status-bad" : ""}>
                    {log.status ?? (log.error ? "ERR" : "...")}
                  </span>
                  <span>{formatDuration(log.durationMs)}</span>
                  <span>{log.url}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No network calls.</div>
            )
          ) : null}

          {tab === "edit" ? (
            mutationLogs.length ? (
              <div className="edit-log">
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
                    <div className="edit-log-body">
                      <dl>
                        <div>
                          <dt>URL</dt>
                          <dd>{log.url}</dd>
                        </div>
                        <div>
                          <dt>Request</dt>
                          <dd>
                            <JsonView
                              value={log.request}
                              resolveChip={resolveChip}
                            />
                          </dd>
                        </div>
                        {log.before !== undefined ? (
                          <div>
                            <dt>Before</dt>
                            <dd>
                              <JsonView
                                value={log.before}
                                resolveChip={resolveChip}
                              />
                            </dd>
                          </div>
                        ) : null}
                        {log.response !== undefined ? (
                          <div>
                            <dt>Response</dt>
                            <dd>
                              <JsonView
                                value={log.response}
                                resolveChip={resolveChip}
                              />
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="empty-state">No edits recorded.</div>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
