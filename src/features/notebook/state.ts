import { atom } from "jotai";
import { decodeShare } from "../../share";
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
export const networkOpenAtom = atom(initialSnapshot?.layout.networkOpen ?? false);
export const consoleLogsAtom = atom<ConsoleLog[]>(initialRuntimeSnapshot?.consoleLogs ?? []);
export const networkLogsAtom = atom<NetworkLog[]>(initialRuntimeSnapshot?.networkLogs ?? []);
export const mutationLogsAtom = atom<MutationLog[]>(initialRuntimeSnapshot?.mutationLogs ?? []);
