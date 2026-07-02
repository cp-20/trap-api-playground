import { useAtom } from "jotai";
import { useCallback, useRef } from "react";
import { createId } from "../../utils/ids";
import type { ToastMessage } from "./ToastViewport";
import { toastsAtom } from "./state";

export const useToasts = () => {
  const [toasts, setToasts] = useAtom(toastsAtom);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, tone: ToastMessage["tone"] = "info") => {
      const id = createId("toast");
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      const timer = window.setTimeout(() => dismiss(id), 4200);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  return { toasts, pushToast, dismissToast: dismiss };
};
