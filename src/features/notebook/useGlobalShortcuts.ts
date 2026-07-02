import { useSetAtom, useStore } from "jotai";
import { useEffect } from "react";
import {
  activeCellIdAtom,
  addCellAtom,
  cellsAtom,
  notebookCommandsAtom,
  selectedCellIdAtom,
} from "./state";

export const useGlobalShortcuts = () => {
  const store = useStore();
  const addCell = useSetAtom(addCellAtom);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inEditor = target?.closest(".monaco-editor") || target?.tagName === "INPUT";
      const primary = event.metaKey || event.ctrlKey;
      const commands = store.get(notebookCommandsAtom);

      if (inEditor) return;

      if (primary && event.shiftKey && event.key === "Enter") {
        event.preventDefault();
        if (commands.canRun()) void commands.runAllCells();
      } else if (primary && event.key === "Enter") {
        event.preventDefault();
        const cells = store.get(cellsAtom);
        const activeCellId = store.get(activeCellIdAtom);
        const selectedCellId = store.get(selectedCellIdAtom);
        const cell =
          cells.find((item) => item.id === activeCellId) ??
          cells.find((item) => item.id === selectedCellId) ??
          cells[0];
        if (cell && commands.canRun()) void commands.runCellById(cell.id);
      } else if (primary && event.key.toLowerCase() === "b") {
        event.preventDefault();
        if (commands.canRun()) addCell(store.get(cellsAtom).length);
      } else if (primary && event.key.toLowerCase() === "k") {
        event.preventDefault();
        commands.toggleNetwork();
      } else if (primary && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void commands.formatAllEditors().finally(() => commands.saveNotebook(true));
      } else if (event.key === "Escape") {
        commands.stopAll();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addCell, store]);
};
