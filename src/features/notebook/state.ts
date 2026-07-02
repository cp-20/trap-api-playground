import { atom } from "jotai";
import { decodeShare } from "../share/codec";
import { groupBy } from "../../utils/collections";
import type { ConsoleLog, MutationLog, NetworkLog } from "../../runtime/types";
import type { NotebookCell } from "./types";
import {
  cellsFromSnapshot,
  createCell,
  readSavedRuntimeSnapshot,
  readSavedSnapshot,
} from "./storage";

const sharedSnapshot = decodeShare(window.location.hash);
const savedSnapshot = readSavedSnapshot();
export const initialRuntimeSnapshot = sharedSnapshot ? null : readSavedRuntimeSnapshot();

const initialSnapshot = sharedSnapshot ?? savedSnapshot;
const initialCells: NotebookCell[] = initialSnapshot?.cells.length
  ? cellsFromSnapshot(initialSnapshot, initialRuntimeSnapshot)
  : [createCell()];

export const cellsAtom = atom<NotebookCell[]>(initialCells);
export const selectedCellIdAtom = atom(
  initialSnapshot?.selectedCellId ?? initialCells[0]?.id ?? "",
);
export const activeCellIdAtom = atom(initialSnapshot?.selectedCellId ?? initialCells[0]?.id ?? "");
export const networkOpenAtom = atom(initialSnapshot?.layout.networkOpen ?? false);
export const consoleLogsAtom = atom<ConsoleLog[]>(initialRuntimeSnapshot?.consoleLogs ?? []);
export const networkLogsAtom = atom<NetworkLog[]>(initialRuntimeSnapshot?.networkLogs ?? []);
export const mutationLogsAtom = atom<MutationLog[]>(initialRuntimeSnapshot?.mutationLogs ?? []);

export const EMPTY_CONSOLE_LOGS: ConsoleLog[] = [];

export const consoleLogsByCellAtom = atom((get) =>
  groupBy(get(consoleLogsAtom), (log) => log.cellId),
);

type CellUpdate = { cellId: string; patch: Partial<NotebookCell> };

export type NotebookCommands = {
  canRun: () => boolean;
  runAllCells: () => void | Promise<void>;
  runCellById: (cellId: string) => void | Promise<void>;
  toggleNetwork: () => void;
  saveNotebook: (showToast?: boolean) => void;
  formatAllEditors: () => Promise<void>;
  stopAll: () => void;
};

const noopCommands: NotebookCommands = {
  canRun: () => false,
  runAllCells: () => undefined,
  runCellById: () => undefined,
  toggleNetwork: () => undefined,
  saveNotebook: () => undefined,
  formatAllEditors: async () => undefined,
  stopAll: () => undefined,
};

export const notebookCommandsAtom = atom<NotebookCommands>(noopCommands);

export const selectCellAtom = atom<null, [string], void>(null, (_get, set, cellId) => {
  set(selectedCellIdAtom, cellId);
  set(activeCellIdAtom, cellId);
});

export const updateCellAtom = atom<null, [CellUpdate], void>(
  null,
  (_get, set, { cellId, patch }) => {
    set(cellsAtom, (current) =>
      current.map((cell) => (cell.id === cellId ? { ...cell, ...patch } : cell)),
    );
  },
);

export const addCellAtom = atom<null, [number?], string>(
  null,
  (get, set, index = get(cellsAtom).length) => {
    const cells = get(cellsAtom);
    const cell = createCell("", `セル ${cells.length + 1}`);
    set(cellsAtom, [...cells.slice(0, index), cell, ...cells.slice(index)]);
    set(selectedCellIdAtom, cell.id);
    set(activeCellIdAtom, cell.id);
    return cell.id;
  },
);

export const addCellAfterAtom = atom<null, [string], string>(null, (get, set, cellId) => {
  const cells = get(cellsAtom);
  const index = cells.findIndex((cell) => cell.id === cellId);
  return set(addCellAtom, index < 0 ? cells.length : index + 1);
});

export const removeCellAtom = atom<null, [string], void>(null, (get, set, cellId) => {
  const cells = get(cellsAtom);
  if (cells.length === 1) return;
  const next = cells.filter((cell) => cell.id !== cellId);
  set(cellsAtom, next);
  if (get(selectedCellIdAtom) === cellId) {
    const nextCellId = next[0]?.id ?? "";
    set(selectedCellIdAtom, nextCellId);
    set(activeCellIdAtom, nextCellId);
  } else if (get(activeCellIdAtom) === cellId) {
    set(activeCellIdAtom, get(selectedCellIdAtom));
  }
});

export const moveCellAtom = atom<null, [string, -1 | 1], void>(
  null,
  (get, set, cellId, direction) => {
    const cells = get(cellsAtom);
    const index = cells.findIndex((cell) => cell.id === cellId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= cells.length) return;
    const next = [...cells];
    [next[index], next[target]] = [next[target], next[index]];
    set(cellsAtom, next);
  },
);
