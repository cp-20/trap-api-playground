export type JsonViewProps = {
  value: unknown;
  /** Current nesting level. Top-level values start expanded and nested values render compact labels. */
  depth?: number;
  /** Enables rendering known UUID/string values as traQ entity chips. */
  allowEntity?: boolean;
  /** Enables replacing whole records with a compact inferred entity chip when the shape is obvious. */
  allowSummary?: boolean;
  /** Object key for the current value, used as a hint for dates and entity type inference. */
  fieldKey?: string;
  /** Prevents a hovered entity detail from turning its own id field into a recursive chip. */
  suppressedEntityId?: string;
};
