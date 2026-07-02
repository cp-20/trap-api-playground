import type {
  CellResult,
  NotebookCell,
  NotebookSnapshot,
  RuntimeLogSnapshot,
} from "../types";
import { createId } from "../utils/ids";

export const NOTEBOOK_STORAGE_KEY = "trap-playground:notebook";
export const RUNTIME_LOG_STORAGE_KEY = "trap-playground:runtime-logs";

export const MAX_CONSOLE_LOGS = 600;
export const MAX_NETWORK_LOGS = 300;
export const MAX_MUTATION_LOGS = 120;
export const MAX_CELL_RESULTS = 120;

const DEFAULT_CODE = `const me = await api.getMe()
console.log("me", me)
me`;

export function createCell(code = DEFAULT_CODE, title?: string): NotebookCell {
  return {
    id: createId("cell"),
    title: title ?? "Cell",
    code,
    readOnly: true,
    result: { status: "idle" },
  };
}

export function snapshotFromState(
  cells: NotebookCell[],
  selectedCellId: string,
  networkOpen: boolean,
): NotebookSnapshot {
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
}

export function cellsFromSnapshot(
  snapshot: NotebookSnapshot,
  runtimeSnapshot?: RuntimeLogSnapshot | null,
): NotebookCell[] {
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
}

export function readSavedSnapshot(): NotebookSnapshot | null {
  const raw = localStorage.getItem(NOTEBOOK_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as NotebookSnapshot;
    return parsed.version === 1 && Array.isArray(parsed.cells) ? parsed : null;
  } catch {
    return null;
  }
}

function sanitizeResultForRestore(result?: CellResult): CellResult {
  if (!result || result.status === "running") return { status: "idle" };
  return result;
}

export function runtimeSnapshotFromState(
  cells: NotebookCell[],
  consoleLogs: RuntimeLogSnapshot["consoleLogs"],
  networkLogs: RuntimeLogSnapshot["networkLogs"],
  mutationLogs: RuntimeLogSnapshot["mutationLogs"],
): RuntimeLogSnapshot {
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
}

export function saveRuntimeSnapshot(snapshot: RuntimeLogSnapshot): void {
  localStorage.setItem(RUNTIME_LOG_STORAGE_KEY, JSON.stringify(snapshot));
}

export function readSavedRuntimeSnapshot(): RuntimeLogSnapshot | null {
  const raw = localStorage.getItem(RUNTIME_LOG_STORAGE_KEY);
  if (!raw) return null;
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
      cellResults: parsed.cellResults
        .slice(-MAX_CELL_RESULTS)
        .map((item) => ({
          cellId: item.cellId,
          result: sanitizeResultForRestore(item.result),
        })),
    };
  } catch {
    return null;
  }
}
