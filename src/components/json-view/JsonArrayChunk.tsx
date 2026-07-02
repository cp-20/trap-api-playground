import { useState } from "react";
import { JsonView } from "./JsonView";
import type { JsonViewProps } from "./types";
import styles from "./JsonView.module.css";

type Props = Required<Pick<JsonViewProps, "allowEntity" | "allowSummary">> &
  Pick<JsonViewProps, "fieldKey" | "suppressedEntityId"> & {
    source: unknown[];
    start: number;
    end: number;
    depth: number;
  };

export const JsonArrayChunk = ({
  source,
  start,
  end,
  depth,
  allowEntity,
  allowSummary,
  fieldKey,
  suppressedEntityId,
}: Props) => {
  const [open, setOpen] = useState(false);
  const last = end - 1;

  return (
    <li className={styles["json-chunk"]}>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {open ? "-" : "+"} {start}-{last}
      </button>
      {open ? (
        <ol start={start}>
          {source.slice(start, end).map((item, index) => {
            const itemIndex = start + index;
            return (
              <li key={itemIndex}>
                <JsonView
                  value={item}
                  depth={depth + 1}
                  allowEntity={allowEntity}
                  allowSummary={allowSummary}
                  fieldKey={fieldKey}
                  suppressedEntityId={suppressedEntityId}
                />
              </li>
            );
          })}
        </ol>
      ) : null}
    </li>
  );
};
