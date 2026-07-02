import type { EntityChip } from "../../features/entities/types";
import { EntityChipView } from "./EntityChipView";
import type { JsonViewProps } from "./types";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

export const inferChipFromRecord = (
  value: Record<string, unknown>,
  fieldKey?: string,
): EntityChip | null => {
  const id = typeof value.id === "string" ? value.id : undefined;
  const name = typeof value.name === "string" ? value.name : id;
  if (!id || !name) return null;

  if (typeof value.displayName === "string") {
    return {
      kind: "user",
      id,
      username: name,
      displayName: value.displayName,
      label: `${value.displayName} (@${name})`,
      imageUrl: `https://image-proxy.trap.jp/icon/${encodeURIComponent(
        name,
      )}?width=48&height=48&format=webp`,
      detail: value,
    };
  }

  if (
    fieldKey?.toLowerCase().includes("channel") ||
    "parentId" in value ||
    "archived" in value ||
    "topic" in value
  ) {
    const fullPath = typeof value.fullPath === "string" ? value.fullPath : name;
    return {
      kind: "channel",
      id,
      label: fullPath,
      fullPath,
      detail: value,
    };
  }

  if ("members" in value || "admins" in value || fieldKey === "groups") {
    return {
      kind: "group",
      id,
      label: name,
      detail: value,
    };
  }

  return null;
};

export const renderSummary = ({
  value,
  allowEntity = true,
  allowSummary = true,
  fieldKey,
}: JsonViewProps) => {
  if (!allowEntity || !allowSummary) return null;
  if (!isRecord(value) || typeof value.id !== "string") return null;

  const inferredChip = inferChipFromRecord(value, fieldKey);
  return inferredChip ? <EntityChipView chip={inferredChip} /> : null;
};
