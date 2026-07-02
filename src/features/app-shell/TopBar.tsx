import { useAtomValue } from "jotai";
import { LogIn, RotateCcw, Share2 } from "lucide-react";
import { operationsAtom } from "../operations/state";
import { tokenAtom } from "../auth/state";
import styles from "./TopBar.module.css";

type Props = {
  onLogin: () => void;
  onReset: () => void;
  onShare: () => void;
};

export const TopBar = ({ onLogin, onReset, onShare }: Props) => {
  const operationCount = useAtomValue(operationsAtom).length;
  const loggedIn = !!useAtomValue(tokenAtom);

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <strong>traQ API Playground</strong>
        <span>{operationCount ? `${operationCount} operations` : "OpenAPI を読み込み中..."}</span>
      </div>
      {loggedIn ? (
        <>
          <button type="button" onClick={onReset} title="実行状態をリセット">
            <RotateCcw size={16} />
            リセット
          </button>
          <button type="button" onClick={onShare} title="ノートブックを共有">
            <Share2 size={16} />
            共有
          </button>
        </>
      ) : (
        <button type="button" onClick={onLogin} title="OAuth PKCE でログイン">
          <LogIn size={16} />
          ログイン
        </button>
      )}
    </header>
  );
};
