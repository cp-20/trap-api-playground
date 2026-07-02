import { atom } from "jotai";
import { EMPTY_GLOBALS, type EntityIndexes } from "./types";

export const entityIndexesAtom = atom<EntityIndexes | null>(null);
export const runtimeGlobalsAtom = atom((get) => get(entityIndexesAtom)?.globals ?? EMPTY_GLOBALS);
