import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { ToastMessage } from "../../components/toast/ToastViewport";
import { exchangeCode, parseOAuthCallback } from "./oauth";
import type { OAuthToken } from "./oauth";

type Options = {
  setToken: Dispatch<SetStateAction<OAuthToken | null>>;
  pushToast: (message: string, tone?: ToastMessage["tone"]) => void;
};

export const useOAuthCallback = ({ setToken, pushToast }: Options) => {
  useEffect(() => {
    const callback = parseOAuthCallback(window.location.search);
    if (callback.kind === "none") return;
    if (callback.kind === "error") {
      pushToast(callback.description ?? callback.error, "error");
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
      return;
    }

    void exchangeCode(callback.code, callback.state)
      .then((nextToken) => {
        setToken(nextToken);
        pushToast("ログインしました。", "success");
      })
      .catch((error) => pushToast(error instanceof Error ? error.message : String(error), "error"))
      .finally(() => {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
      });
  }, [pushToast, setToken]);
};
