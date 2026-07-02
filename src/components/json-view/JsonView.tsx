import { useState } from "react";
import { cx } from "../../utils/classNames";
import { JsonArrayChunk } from "./JsonArrayChunk";
import { Primitive } from "./Primitive";
import { isRecord, renderSummary } from "./summary";
import type { JsonViewProps } from "./types";
import styles from "./JsonView.module.css";

const CHUNK_SIZE = 100;

export const JsonView = ({
  value,
  depth = 0,
  allowEntity = true,
  allowSummary = true,
  fieldKey,
  suppressedEntityId,
}: JsonViewProps) => {
  const [open, setOpen] = useState(depth === 0);
  const summary = renderSummary({
    value,
    allowEntity,
    allowSummary,
    fieldKey,
    suppressedEntityId,
  });
  if (summary) return summary;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className={styles["json-kind"]}>Array(0)</span>;
    }

    const shouldChunk = value.length > CHUNK_SIZE;
    const chunkCount = shouldChunk ? Math.ceil(value.length / CHUNK_SIZE) : 0;

    return (
      <details
        className={styles["json-node"]}
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary>
          <span className={styles["json-kind"]}>Array({value.length})</span>
        </summary>
        {open &&
          (shouldChunk ? (
            <ol className={styles["json-chunked-list"]}>
              {Array.from({ length: chunkCount }, (_, chunkIndex) => {
                const start = chunkIndex * CHUNK_SIZE;
                return (
                  <JsonArrayChunk
                    key={chunkIndex}
                    source={value}
                    start={start}
                    end={Math.min(start + CHUNK_SIZE, value.length)}
                    depth={depth}
                    allowEntity={allowEntity}
                    allowSummary={allowSummary}
                    fieldKey={fieldKey}
                    suppressedEntityId={suppressedEntityId}
                  />
                );
              })}
            </ol>
          ) : (
            <ol>
              {value.map((item, index) => (
                <li key={index}>
                  <JsonView
                    value={item}
                    depth={depth + 1}
                    allowEntity={allowEntity}
                    allowSummary={allowSummary}
                    fieldKey={fieldKey}
                    suppressedEntityId={suppressedEntityId}
                  />
                </li>
              ))}
            </ol>
          ))}
      </details>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <span className={styles["json-kind"]}>Object(0)</span>;
    }

    return (
      <div className={cx(styles["json-node"], styles["json-node--object"])}>
        {depth > 0 ? <span className={styles["json-kind"]}>Object({entries.length})</span> : null}
        <dl>
          {entries.map(([key, item]) => (
            <div className={styles["json-row"]} key={key}>
              <dt>{key}</dt>
              <dd>
                <JsonView
                  value={item}
                  depth={depth + 1}
                  allowEntity={allowEntity}
                  allowSummary={allowSummary}
                  fieldKey={key}
                  suppressedEntityId={suppressedEntityId}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <Primitive
      value={value}
      allowEntity={allowEntity}
      fieldKey={fieldKey}
      suppressedEntityId={suppressedEntityId}
    />
  );
};
