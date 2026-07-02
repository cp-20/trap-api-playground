import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { findEntityChip } from "./resolveChip";
import { entityIndexesAtom } from "./state";
import type { EntityChip } from "./types";

export type ResolveEntityChip = (value: unknown, fieldKey?: string) => EntityChip | null;

export const useEntityChipResolver = (): ResolveEntityChip => {
  const entityIndexes = useAtomValue(entityIndexesAtom);
  return useCallback(
    (value: unknown, fieldKey?: string) => findEntityChip(entityIndexes, value, fieldKey),
    [entityIndexes],
  );
};

export const useEntityChip = (value: unknown, fieldKey?: string): EntityChip | null => {
  const resolveEntityChip = useEntityChipResolver();
  return resolveEntityChip(value, fieldKey);
};
