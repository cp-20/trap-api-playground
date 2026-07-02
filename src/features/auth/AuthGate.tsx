import { LogIn } from "lucide-react";
import styles from "../../App.module.css";

type Props = {
  clientConfigured: boolean;
  onLogin: () => void;
};

export const AuthGate = ({ clientConfigured, onLogin }: Props) => (
  <section className={styles.authGate}>
    <h1>Login required</h1>
    <p>traQ API Playground runs only after OAuth login.</p>
    <button type="button" disabled={!clientConfigured} onClick={onLogin}>
      <LogIn size={16} />
      Login with traQ
    </button>
  </section>
);
