import { ChevronDown, ChevronUp, History, ListTree, RotateCcw } from "lucide-react";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai";
import {
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { MutationLog } from "../../runtime/types";
import { JsonView } from "../../components/json-view/JsonView";
import { cellsAtom, mutationLogsAtom, networkLogsAtom, networkOpenAtom } from "../notebook/state";
import styles from "./NetworkPanel.module.css";

type LogTab = "network" | "edit";

type Props = {
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
      <button type="button" onClick={() => onRevert(log)} title="この編集を戻す">
        <RotateCcw size={14} />
        戻す
      </button>
    );
  }
  if (log.revert.status === "reverted") {
    return <span className={`${styles.editState} ${styles.editStateOk}`}>戻しました</span>;
  }
  if (log.revert.status === "failed") {
    return (
      <span className={`${styles.editState} ${styles.editStateBad}`}>{log.revert.reason}</span>
    );
  }
  return <span className={styles.editState}>{log.revert.reason}</span>;
};

export const NetworkPanel = ({ onRevert, panelStyle, onResizeStart }: Props) => {
  const cells = useAtomValue(cellsAtom);
  const networkLogs = useAtomValue(networkLogsAtom);
  const mutationLogs = useAtomValue(mutationLogsAtom);
  const [open, setOpen] = useAtom(networkOpenAtom);
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
          aria-label="ログパネルの高さを変更"
          aria-orientation="horizontal"
          onPointerDown={onResizeStart}
        />
      ) : null}
      <div className={styles.networkPanelHead}>
        <button
          className={styles.networkPanelToggle}
          type="button"
          onClick={() => setOpen(!open)}
          title={open ? "ログを閉じる" : "ログを開く"}
        >
          {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          ログ
        </button>
        <div className={styles.networkTabs} role="tablist" aria-label="ログ">
          <button
            type="button"
            className={tab === "network" ? styles.activeTab : ""}
            onClick={() => {
              setTab("network");
              setOpen(true);
            }}
          >
            <ListTree size={15} />
            通信
            <span>{networkLogs.length}</span>
          </button>
          <button
            type="button"
            className={tab === "edit" ? styles.activeTab : ""}
            onClick={() => {
              setTab("edit");
              setOpen(true);
            }}
          >
            <History size={15} />
            編集ログ
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
              <div className={styles.emptyState}>通信ログはありません。</div>
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
                      <span>{cellsById.get(log.cellId)?.title ?? "セル"}</span>
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
                          <dt>リクエスト</dt>
                          <dd>
                            <JsonView value={log.request} />
                          </dd>
                        </div>
                        {log.before !== undefined ? (
                          <div>
                            <dt>変更前</dt>
                            <dd>
                              <JsonView value={log.before} />
                            </dd>
                          </div>
                        ) : null}
                        {log.response !== undefined ? (
                          <div>
                            <dt>レスポンス</dt>
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
              <div className={styles.emptyState}>編集ログはありません。</div>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
