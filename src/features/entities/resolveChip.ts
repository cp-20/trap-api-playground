import type { EntityChip, EntityIndexes } from "./types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const findEntityChip = (
  indexes: EntityIndexes | null,
  value: unknown,
  fieldKey?: string,
): EntityChip | null => {
  if (!indexes || typeof value !== "string" || !UUID_RE.test(value)) {
    return null;
  }

  const key = fieldKey?.toLowerCase() ?? "";
  if (/(group|member|admin)/.test(key)) {
    return indexes.groups.get(value) ?? indexes.users.get(value) ?? null;
  }
  if (/(stamp|palette)/.test(key)) return indexes.stamps.get(value) ?? null;
  if (/(channel|home|parent)/.test(key)) {
    return indexes.channels.get(value) ?? null;
  }
  if (/(user|creator|author|owner|uploader|developer|bot)/.test(key)) {
    return indexes.users.get(value) ?? null;
  }
  return (
    indexes.users.get(value) ??
    indexes.channels.get(value) ??
    indexes.stamps.get(value) ??
    indexes.groups.get(value) ??
    null
  );
};
