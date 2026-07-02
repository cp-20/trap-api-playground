import { CircleAlert, LoaderCircle } from "lucide-react";
import type { CellResult } from "./types";
import { JsonView } from "../../components/json-view/JsonView";
import styles from "./Notebook.module.css";

type Props = {
  result: CellResult;
};

export const ResultPanel = ({ result }: Props) => {
  if (result.status === "idle") {
    return <div className={styles.emptyState}>まだ結果はありません。</div>;
  }
  if (result.status === "running") {
    return (
      <div className={styles.resultState}>
        <LoaderCircle className={styles.spin} size={18} />
        セルを実行中...
      </div>
    );
  }
  if (result.status === "error") {
    return (
      <div className={styles.errorView}>
        <div className={styles.resultState}>
          <CircleAlert size={18} />
          {result.error.name}: {result.error.message}
        </div>
        {result.error.status ? <p>HTTP ステータス: {result.error.status}</p> : null}
        {result.error.body !== undefined ? <JsonView value={result.error.body} /> : null}
        {result.error.stack ? <pre>{result.error.stack}</pre> : null}
      </div>
    );
  }

  return (
    <div className={styles.resultSuccess}>
      <JsonView value={result.value} />
    </div>
  );
};
