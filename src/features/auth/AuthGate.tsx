import { LogIn } from "lucide-react";
import styles from "../../App.module.css";

type Props = {
  onLogin: () => void;
};

export const AuthGate = ({ onLogin }: Props) => {
  return (
    <section className={styles.authGate}>
      <h1>ログインが必要です</h1>
      <p>traQit は OAuth ログイン後に利用できます。</p>
      <button type="button" onClick={onLogin}>
        <LogIn size={16} />
        traQ でログイン
      </button>
    </section>
  );
};
