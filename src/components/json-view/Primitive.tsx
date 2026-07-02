import { Copy } from "lucide-react";
import { useEntityChip } from "../../features/entities/useEntityChip";
import { EntityChipView } from "./EntityChipView";
import type { JsonViewProps } from "./types";
import styles from "./JsonView.module.css";

const isDateField = (fieldKey?: string): boolean =>
  !!fieldKey && /(created|updated|at|date|time)$/i.test(fieldKey);

const CopyStringButton = ({ value }: { value: string }) => (
  <button
    className={styles["json-copy"]}
    type="button"
    title="Copy string"
    onClick={() => void navigator.clipboard?.writeText(value)}
  >
    <Copy size={12} />
  </button>
);

export const Primitive = ({
  value,
  allowEntity = true,
  fieldKey,
  suppressedEntityId,
}: JsonViewProps) => {
  const resolvedChip = useEntityChip(value, fieldKey);
  const suppressOwnId = fieldKey === "id" && value === suppressedEntityId;
  const chip = allowEntity && !suppressOwnId ? resolvedChip : null;

  if (typeof value === "string" && isDateField(fieldKey)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return (
        <span className={styles["json-string-line"]}>
          <time className={styles["json-date"]} dateTime={value}>
            {date.toLocaleString()}
          </time>
          <CopyStringButton value={value} />
        </span>
      );
    }
  }

  if (typeof value === "string") {
    return (
      <span className={styles["json-string-line"]}>
        <span className={styles["json-string"]}>"{value}"</span>
        <CopyStringButton value={value} />
        {chip ? <EntityChipView chip={chip} /> : null}
      </span>
    );
  }

  if (chip) return <EntityChipView chip={chip} />;
  if (typeof value === "number") return <span className={styles["json-number"]}>{value}</span>;
  if (typeof value === "boolean") {
    return <span className={styles["json-boolean"]}>{String(value)}</span>;
  }
  if (value === null) return <span className={styles["json-null"]}>null</span>;
  if (value === undefined) return <span className={styles["json-null"]}>undefined</span>;
  return <span>{String(value)}</span>;
};
