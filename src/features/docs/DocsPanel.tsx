import { useMemo, useState } from "react";
import generatedOperations from "../../generated/traq-operations.json";
import type { OperationMeta } from "../operations/types";
import styles from "./DocsPanel.module.css";

const operations = generatedOperations as OperationMeta[];

const scopeDocs = [
  {
    name: "api",
    signature: "api.<operationId>(input?)",
    description:
      "traQ API を呼び出すためのオブジェクトです。path/query/body/form を input に渡すと、認証ヘッダー、URL 組み立て、レスポンスの JSON/Blob 化、Network Log への記録までをまとめて行います。",
    example: `await api.getMessages({
  path: { channelId },
  query: { limit: 20, order: "desc" },
})`,
  },
  {
    name: "util",
    signature: "util.sleep / util.pageAll / util.isUuid / util.now",
    description:
      "ノートブックでよく使う小さな補助関数です。ページング API の全件取得、待機、UUID 判定、ISO 文字列の現在時刻を扱えます。",
    example: `const allMessages = await util.pageAll((page) =>
  api.getMessages({ path: { channelId }, query: page }),
)`,
  },
  {
    name: "globals",
    signature: "me / users / channels / groups",
    description:
      "ログイン時に読み込まれる参照用データです。チャンネルは fullPath を持つため、ID だけでなく階層名から探す用途にも使えます。",
    example: `const general = channels.find((channel) =>
  channel.fullPath.endsWith("/general"),
)`,
  },
] as const;

const methodClassName = (method: OperationMeta["method"]): string => {
  return `${styles.methodBadge} ${styles[`method${method}`] ?? ""}`;
};

const searchableText = (operation: OperationMeta): string => {
  return [
    operation.operationId,
    operation.method,
    operation.path,
    operation.summary,
    operation.description,
    operation.tags.join(" "),
    operation.parameters.map((parameter) => parameter.name).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const DocsPanel = () => {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOperations = useMemo(() => {
    if (!normalizedQuery) return operations;
    return operations.filter((operation) => searchableText(operation).includes(normalizedQuery));
  }, [normalizedQuery]);

  return (
    <aside className={styles.docsPanel} aria-label="リファレンス">
      <div className={styles.paneHeader}>
        <h2>Docs</h2>
        <span>{operations.length} APIs</span>
      </div>
      <div className={styles.docsContent}>
        <section className={styles.scopeSection}>
          <h3>Scope</h3>
          <div className={styles.scopeList}>
            {scopeDocs.map((item) => (
              <article className={styles.scopeItem} key={item.name}>
                <header>
                  <strong>{item.name}</strong>
                  <code>{item.signature}</code>
                </header>
                <p>{item.description}</p>
                <pre>
                  <code>{item.example}</code>
                </pre>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.apiSection}>
          <div className={styles.apiHeader}>
            <h3>API</h3>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="operationId, path, tag"
              aria-label="API を検索"
            />
          </div>
          <div className={styles.apiCount}>{filteredOperations.length} results</div>
          <div className={styles.operationList}>
            {filteredOperations.map((operation) => (
              <article className={styles.operationItem} key={operation.operationId}>
                <header>
                  <span className={methodClassName(operation.method)}>{operation.method}</span>
                  <code>{operation.operationId}</code>
                </header>
                <div className={styles.operationPath}>{operation.path}</div>
                {operation.summary ? <p>{operation.summary}</p> : null}
                <div className={styles.operationMeta}>
                  {operation.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                  {operation.requestBody ? <span>body</span> : null}
                  {operation.parameters.length > 0 ? (
                    <span>{operation.parameters.length} params</span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};
