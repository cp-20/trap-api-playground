import type { EntityChip, RuntimeGlobals } from "../enrichment";
import { JsonView } from "./JsonView";

type Props = {
  globals: RuntimeGlobals;
  resolveChip: (value: unknown, fieldKey?: string) => EntityChip | null;
};

const sections = [
  { key: "me", title: "me" },
  { key: "users", title: "users" },
  { key: "channels", title: "channels" },
  { key: "groups", title: "groups" },
] as const;

export function GlobalsPanel({ globals, resolveChip }: Props) {
  return (
    <aside className="globals-panel" aria-label="Preloaded globals">
      <div className="pane-header globals-panel-header">
        <h2>Globals</h2>
      </div>
      <div className="globals-list">
        {sections.map(({ key, title }) => {
          const value = globals[key];
          const count = Array.isArray(value) ? value.length : value ? 1 : 0;
          return (
            <section className="globals-section" key={key}>
              <header>
                <strong>{title}</strong>
                <span>{count}</span>
              </header>
              <div className="globals-inspector">
                <JsonView
                  value={value}
                  resolveChip={resolveChip}
                  fieldKey={key}
                />
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
