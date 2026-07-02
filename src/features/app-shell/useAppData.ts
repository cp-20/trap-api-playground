import { useEffect, type Dispatch, type SetStateAction } from "react";
import { loadEntityIndexes } from "../entities/indexes";
import { loadOperations } from "../operations/catalog";
import type { OperationMeta } from "../operations/types";
import type { ToastMessage } from "../../components/toast/ToastViewport";
import type { OAuthToken } from "../auth/oauth";
import type { EntityIndexes } from "../entities/types";

type Options = {
  token: OAuthToken | null;
  setOperations: Dispatch<SetStateAction<OperationMeta[]>>;
  setEntityIndexes: Dispatch<SetStateAction<EntityIndexes | null>>;
  pushToast: (message: string, tone?: ToastMessage["tone"]) => void;
};

export const useAppData = ({ token, setOperations, setEntityIndexes, pushToast }: Options) => {
  useEffect(() => {
    void loadOperations()
      .then(setOperations)
      .catch((error) => pushToast(String(error), "error"));
  }, [pushToast, setOperations]);

  useEffect(() => {
    if (!token?.accessToken) {
      setEntityIndexes(null);
      return;
    }
    void loadEntityIndexes(token.accessToken)
      .then(setEntityIndexes)
      .catch(() => setEntityIndexes(null));
  }, [setEntityIndexes, token?.accessToken]);
};
