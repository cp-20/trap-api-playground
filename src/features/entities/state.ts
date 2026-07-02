import { atom } from "jotai";
import type { EntityIndexes } from "./types";

export const entityIndexesAtom = atom<EntityIndexes | null>(null);
