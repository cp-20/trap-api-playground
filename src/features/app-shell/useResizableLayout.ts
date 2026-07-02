import { useAtom } from "jotai";
import {
  useCallback,
  useMemo,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { docsWidthAtom, logsHeightAtom } from "./state";

const DOCS_MIN_WIDTH = 300;
const DOCS_MAX_WIDTH = 760;
const NOTEBOOK_MIN_WIDTH = 380;
const LOGS_MIN_HEIGHT = 140;
const LOGS_MAX_HEIGHT = 520;
const NOTEBOOK_MIN_HEIGHT = 220;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const bindPointerDrag = (
  event: ReactPointerEvent<HTMLElement>,
  orientation: "horizontal" | "vertical",
  onMove: (event: PointerEvent) => void,
): void => {
  event.preventDefault();
  const target = event.currentTarget;
  const orientationClass =
    orientation === "horizontal" ? "is-resizing-panel-horizontal" : "is-resizing-panel-vertical";
  target.dataset.resizing = "true";
  const stop = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
    document.body.classList.remove("is-resizing-panel");
    document.body.classList.remove(orientationClass);
    delete target.dataset.resizing;
  };
  document.body.classList.add("is-resizing-panel");
  document.body.classList.add(orientationClass);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
};

export const useResizableLayout = () => {
  const [docsWidth, setDocsWidth] = useAtom(docsWidthAtom);
  const [logsHeight, setLogsHeight] = useAtom(logsHeightAtom);

  const startDocsResize = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    bindPointerDrag(event, "vertical", (moveEvent) => {
      const max = Math.min(DOCS_MAX_WIDTH, window.innerWidth - NOTEBOOK_MIN_WIDTH);
      setDocsWidth(clamp(window.innerWidth - moveEvent.clientX, DOCS_MIN_WIDTH, max));
    });
  }, []);

  const startLogsResize = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    bindPointerDrag(event, "horizontal", (moveEvent) => {
      const max = Math.min(LOGS_MAX_HEIGHT, window.innerHeight - NOTEBOOK_MIN_HEIGHT);
      setLogsHeight(clamp(window.innerHeight - moveEvent.clientY, LOGS_MIN_HEIGHT, max));
    });
  }, []);

  const workspaceStyle = useMemo(
    () =>
      ({
        "--docs-panel-width": `${docsWidth}px`,
      }) as CSSProperties,
    [docsWidth],
  );
  const logsPanelStyle = useMemo(
    () =>
      ({
        "--logs-panel-height": `${logsHeight}px`,
      }) as CSSProperties,
    [logsHeight],
  );

  return {
    logsPanelStyle,
    startDocsResize,
    startLogsResize,
    workspaceStyle,
  };
};
