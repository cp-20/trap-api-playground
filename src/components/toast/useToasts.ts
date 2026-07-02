import { useAtom } from "jotai";
import { useCallback } from "react";
import { createId } from "../../utils/ids";
import type { ToastMessage } from "./ToastViewport";
import { toastsAtom } from "./state";

export const useToasts = () => {
  const [toasts, setToasts] = useAtom(toastsAtom);

  const dismiss = useCallback(
    (id: string) => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
    [setToasts],
  );

  const pushToast = useCallback(
    (message: string, tone: ToastMessage["tone"] = "info") => {
      const id = createId("toast");
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
    },
    [setToasts],
  );

  return { toasts, pushToast, dismissToast: dismiss };
};
