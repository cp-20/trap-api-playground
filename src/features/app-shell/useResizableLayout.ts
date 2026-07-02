import { useAtom } from "jotai";
import {
  useCallback,
  useMemo,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { globalsWidthAtom, logsHeightAtom } from "./state";

const GLOBALS_MIN_WIDTH = 260;
const GLOBALS_MAX_WIDTH = 720;
const NOTEBOOK_MIN_WIDTH = 380;
const LOGS_MIN_HEIGHT = 140;
const LOGS_MAX_HEIGHT = 520;
const NOTEBOOK_MIN_HEIGHT = 220;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const bindPointerDrag = (
  event: ReactPointerEvent<HTMLElement>,
  onMove: (event: PointerEvent) => void,
): void => {
  event.preventDefault();
  const stop = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
    document.body.classList.remove("is-resizing-panel");
  };
  document.body.classList.add("is-resizing-panel");
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
};

export const useResizableLayout = () => {
  const [globalsWidth, setGlobalsWidth] = useAtom(globalsWidthAtom);
  const [logsHeight, setLogsHeight] = useAtom(logsHeightAtom);

  const startGlobalsResize = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    bindPointerDrag(event, (moveEvent) => {
      const max = Math.min(GLOBALS_MAX_WIDTH, window.innerWidth - NOTEBOOK_MIN_WIDTH);
      setGlobalsWidth(clamp(window.innerWidth - moveEvent.clientX, GLOBALS_MIN_WIDTH, max));
    });
  }, []);

  const startLogsResize = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    bindPointerDrag(event, (moveEvent) => {
      const max = Math.min(LOGS_MAX_HEIGHT, window.innerHeight - NOTEBOOK_MIN_HEIGHT);
      setLogsHeight(clamp(window.innerHeight - moveEvent.clientY, LOGS_MIN_HEIGHT, max));
    });
  }, []);

  const workspaceStyle = useMemo(
    () =>
      ({
        "--globals-panel-width": `${globalsWidth}px`,
      }) as CSSProperties,
    [globalsWidth],
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
    startGlobalsResize,
    startLogsResize,
    workspaceStyle,
  };
};
