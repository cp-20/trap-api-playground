import { useEffect, type MutableRefObject } from "react";
import type { NotebookCell } from "./types";

type Options = {
  cellsRef: MutableRefObject<NotebookCell[]>;
  selectedCellIdRef: MutableRefObject<string>;
  activeCellIdRef: MutableRefObject<string>;
  canRunRef: MutableRefObject<() => boolean>;
  runAllCells: () => void | Promise<void>;
  runCellById: (cellId: string) => void | Promise<void>;
  addCell: (index?: number) => void;
  toggleNetwork: () => void;
  saveNotebook: (showToast?: boolean) => void;
  formatAllEditors: () => Promise<void>;
  stopAll: () => void;
};

export const useGlobalShortcuts = ({
  cellsRef,
  selectedCellIdRef,
  activeCellIdRef,
  canRunRef,
  runAllCells,
  runCellById,
  addCell,
  toggleNetwork,
  saveNotebook,
  formatAllEditors,
  stopAll,
}: Options) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inEditor = target?.closest(".monaco-editor") || target?.tagName === "INPUT";
      const primary = event.metaKey || event.ctrlKey;

      if (inEditor) return;

      if (primary && event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        if (canRunRef.current()) void runAllCells();
      } else if (primary && event.key === "Enter") {
        event.preventDefault();
        const cell =
          cellsRef.current.find((item) => item.id === activeCellIdRef.current) ??
          cellsRef.current.find((item) => item.id === selectedCellIdRef.current) ??
          cellsRef.current[0];
        if (cell && canRunRef.current()) void runCellById(cell.id);
      } else if (primary && event.key.toLowerCase() === "b") {
        event.preventDefault();
        if (canRunRef.current()) addCell(cellsRef.current.length);
      } else if (primary && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleNetwork();
      } else if (primary && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void formatAllEditors().finally(() => saveNotebook(true));
      } else if (event.key === "Escape") {
        stopAll();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeCellIdRef,
    addCell,
    cellsRef,
    formatAllEditors,
    runAllCells,
    runCellById,
    saveNotebook,
    selectedCellIdRef,
    stopAll,
    toggleNetwork,
    canRunRef,
  ]);
};
