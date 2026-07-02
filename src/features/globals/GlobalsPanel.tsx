import type { RuntimeGlobals } from "../entities/types";
import { JsonView } from "../../components/json-view/JsonView";
import styles from "./GlobalsPanel.module.css";

type Props = {
  globals: RuntimeGlobals;
};

const sections = [
  { key: "me", title: "me" },
  { key: "users", title: "users" },
  { key: "channels", title: "channels" },
  { key: "groups", title: "groups" },
] as const;

export const GlobalsPanel = ({ globals }: Props) => {
  return (
    <aside className={styles.globalsPanel} aria-label="Preloaded globals">
      <div className={`${styles.paneHeader} ${styles.globalsPanelHeader}`}>
        <h2>Globals</h2>
      </div>
      <div className={styles.globalsList}>
        {sections.map(({ key, title }) => {
          const value = globals[key];
          const count = Array.isArray(value) ? value.length : value ? 1 : 0;
          return (
            <section className={styles.globalsSection} key={key}>
              <header>
                <strong>{title}</strong>
                <span>{count}</span>
              </header>
              <div className={styles.globalsInspector}>
                <JsonView value={value} fieldKey={key} />
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
};
