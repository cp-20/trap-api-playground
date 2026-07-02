import { useAtomValue } from "jotai";
import { RotateCcw, Share2 } from "lucide-react";
import { operationsAtom } from "../operations/state";
import { tokenAtom } from "../auth/state";
import styles from "./TopBar.module.css";

type Props = {
  onReset: () => void;
  onShare: () => void;
};

export const TopBar = ({ onReset, onShare }: Props) => {
  const operationCount = useAtomValue(operationsAtom).length;
  const loggedIn = !!useAtomValue(tokenAtom);

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <strong>traQit</strong>
        <span>{`${operationCount} operations`}</span>
      </div>
      {loggedIn && (
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
      )}
    </header>
  );
};
