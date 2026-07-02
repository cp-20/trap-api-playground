import type { CellResult, NotebookCell, NotebookSnapshot, RuntimeLogSnapshot } from "./types";
import { createLocalStorageValue } from "../../storage/localStorage";
import { createId } from "../../utils/ids";

export const NOTEBOOK_STORAGE_KEY = "traq-it:notebook";
export const RUNTIME_LOG_STORAGE_KEY = "traq-it:runtime-logs";

export const MAX_CONSOLE_LOGS = 600;
export const MAX_NETWORK_LOGS = 300;
export const MAX_MUTATION_LOGS = 120;
export const MAX_CELL_RESULTS = 120;

const DEFAULT_CODE = `// traQit へようこそ！
// ここでは TypeScript を書いて、traQ API をその場で試せます。
// 左の Docs から API を探し、Ctrl+Enter でこのセルを実行してください。
//
// 使えるもの:
// - api: api.getMe() のように traQ API を呼び出すオブジェクト

console.log("ログインユーザー", await api.getMe())

// - util: util.pageAll(), util.sleep(), util.now() などの補助関数

console.log("現在時刻", util.now())

// - me / users / channels / groups: ログイン時に読み込まれた参照データ

console.log("読み込み済みデータ", {
  me,
  users,
  channels,
  groups,
})

// 初期状態は読み取り専用 API モードです。POST/PATCH/DELETE などは
// dry-run として記録されるため、実際に更新したいときだけ盾アイコンで切り替えてください。

if (me.homeChannel !== null) {
  await api.setChannelSubscribeLevel({
    path: { channelId: me.homeChannel },
    body: { level: 2 },
  })
}
`;

const parseNotebookSnapshot = (raw: string): NotebookSnapshot | null => {
  try {
    const parsed = JSON.parse(raw) as NotebookSnapshot;
    return parsed.version === 1 && Array.isArray(parsed.cells) ? parsed : null;
  } catch {
    return null;
  }
};

const parseRuntimeSnapshot = (raw: string): RuntimeLogSnapshot | null => {
  try {
    const parsed = JSON.parse(raw) as RuntimeLogSnapshot;
    if (
      parsed.version !== 1 ||
      !Array.isArray(parsed.consoleLogs) ||
      !Array.isArray(parsed.networkLogs) ||
      !Array.isArray(parsed.mutationLogs) ||
      !Array.isArray(parsed.cellResults)
    ) {
      return null;
    }
    return {
      version: 1,
      consoleLogs: parsed.consoleLogs.slice(-MAX_CONSOLE_LOGS),
      networkLogs: parsed.networkLogs.slice(-MAX_NETWORK_LOGS),
      mutationLogs: parsed.mutationLogs.slice(0, MAX_MUTATION_LOGS),
      cellResults: parsed.cellResults.slice(-MAX_CELL_RESULTS).map((item) => ({
        cellId: item.cellId,
        result: sanitizeResultForRestore(item.result),
      })),
    };
  } catch {
    return null;
  }
};

export const notebookSnapshotStorage = createLocalStorageValue<NotebookSnapshot>({
  key: NOTEBOOK_STORAGE_KEY,
  serialize: (snapshot) => JSON.stringify(snapshot),
  deserialize: parseNotebookSnapshot,
});

export const runtimeSnapshotStorage = createLocalStorageValue<RuntimeLogSnapshot>({
  key: RUNTIME_LOG_STORAGE_KEY,
  serialize: (snapshot) => JSON.stringify(snapshot),
  deserialize: parseRuntimeSnapshot,
});

export const createCell = (code = DEFAULT_CODE, title?: string): NotebookCell => {
  return {
    id: createId("cell"),
    title: title ?? "セル",
    code,
    readOnly: true,
    result: { status: "idle" },
  };
};

export const snapshotFromState = (
  cells: NotebookCell[],
  selectedCellId: string,
  networkOpen: boolean,
): NotebookSnapshot => {
  return {
    version: 1,
    selectedCellId,
    layout: { networkOpen },
    cells: cells.map(({ id, title, code, readOnly }) => ({
      id,
      title,
      code,
      readOnly,
    })),
  };
};

export const cellsFromSnapshot = (
  snapshot: NotebookSnapshot,
  runtimeSnapshot?: RuntimeLogSnapshot | null,
): NotebookCell[] => {
  const resultsByCell = new Map(
    runtimeSnapshot?.cellResults.map((item) => [item.cellId, item.result]),
  );
  return snapshot.cells.map((cell) => ({
    id: cell.id,
    title: cell.title,
    code: cell.code,
    readOnly: cell.readOnly ?? true,
    result: sanitizeResultForRestore(resultsByCell.get(cell.id)),
  }));
};

export const readSavedSnapshot = (): NotebookSnapshot | null => notebookSnapshotStorage.read();

const sanitizeResultForRestore = (result?: CellResult): CellResult => {
  if (!result || result.status === "running") return { status: "idle" };
  return result;
};

export const runtimeSnapshotFromState = (
  cells: NotebookCell[],
  consoleLogs: RuntimeLogSnapshot["consoleLogs"],
  networkLogs: RuntimeLogSnapshot["networkLogs"],
  mutationLogs: RuntimeLogSnapshot["mutationLogs"],
): RuntimeLogSnapshot => {
  const cellResults = cells
    .filter((cell) => cell.result.status !== "idle")
    .slice(-MAX_CELL_RESULTS)
    .map((cell) => ({
      cellId: cell.id,
      result: sanitizeResultForRestore(cell.result),
    }));

  return {
    version: 1,
    consoleLogs: consoleLogs.slice(-MAX_CONSOLE_LOGS),
    networkLogs: networkLogs.slice(-MAX_NETWORK_LOGS),
    mutationLogs: mutationLogs.slice(0, MAX_MUTATION_LOGS),
    cellResults,
  };
};

export const saveRuntimeSnapshot = (snapshot: RuntimeLogSnapshot): void => {
  runtimeSnapshotStorage.write(snapshot);
};

export const readSavedRuntimeSnapshot = (): RuntimeLogSnapshot | null =>
  runtimeSnapshotStorage.read();
