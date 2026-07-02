import { deflateRaw, inflateRaw } from "pako";
import type { NotebookSnapshot } from "../notebook/types";

const SHARE_PREFIX = "share=";

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const base64UrlToBytes = (value: string): Uint8Array => {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

export const encodeShare = (snapshot: NotebookSnapshot): string => {
  const safeSnapshot: NotebookSnapshot = {
    ...snapshot,
    cells: snapshot.cells.map((cell) => ({
      id: cell.id,
      title: cell.title,
      code: cell.code,
      readOnly: cell.readOnly,
    })),
  };
  const encoded = new TextEncoder().encode(JSON.stringify(safeSnapshot));
  return `#${SHARE_PREFIX}${bytesToBase64Url(deflateRaw(encoded))}`;
};

export const decodeShare = (hash: string): NotebookSnapshot | null => {
  const value = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!value.startsWith(SHARE_PREFIX)) return null;

  try {
    const bytes = base64UrlToBytes(value.slice(SHARE_PREFIX.length));
    const json = new TextDecoder().decode(inflateRaw(bytes));
    const parsed = JSON.parse(json) as NotebookSnapshot;
    if (
      parsed.version !== 1 ||
      !Array.isArray(parsed.cells) ||
      typeof parsed.selectedCellId !== "string" ||
      typeof parsed.layout?.networkOpen !== "boolean"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};
