import { atom } from "jotai";
import type { OperationMeta } from "./types";

export const operationsAtom = atom<OperationMeta[]>([]);
