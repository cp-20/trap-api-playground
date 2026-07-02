import { CircleAlert, LoaderCircle } from "lucide-react";
import type { CellResult } from "../types";
import type { EntityChip } from "../enrichment";
import { JsonView } from "./JsonView";

type Props = {
  result: CellResult;
  resolveChip: (value: unknown, fieldKey?: string) => EntityChip | null;
};

export function ResultPanel({ result, resolveChip }: Props) {
  if (result.status === "idle") {
    return <div className="empty-state">No result yet.</div>;
  }
  if (result.status === "running") {
    return (
      <div className="result-state">
        <LoaderCircle className="spin" size={18} />
        Running cell...
      </div>
    );
  }
  if (result.status === "error") {
    return (
      <div className="error-view">
        <div className="result-state">
          <CircleAlert size={18} />
          {result.error.name}: {result.error.message}
        </div>
        {result.error.status ? <p>HTTP status: {result.error.status}</p> : null}
        {result.error.body !== undefined ? (
          <JsonView value={result.error.body} resolveChip={resolveChip} />
        ) : null}
        {result.error.stack ? <pre>{result.error.stack}</pre> : null}
      </div>
    );
  }

  return (
    <div className="result-success">
      <JsonView value={result.value} resolveChip={resolveChip} />
    </div>
  );
}
