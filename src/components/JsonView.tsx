import { Copy } from "lucide-react";
import { useId, useRef, useState, type CSSProperties } from "react";
import type { EntityChip } from "../enrichment";
import "./JsonView.css";

type Props = {
  value: unknown;
  resolveChip: (value: unknown, fieldKey?: string) => EntityChip | null;
  depth?: number;
  allowEntity?: boolean;
  allowSummary?: boolean;
  fieldKey?: string;
};

function EntityChipView({
  chip,
  resolveChip,
}: {
  chip: EntityChip;
  resolveChip: Props["resolveChip"];
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number }>();
  const [bridgeStyle, setBridgeStyle] = useState<CSSProperties>();
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const detailId = useId();
  const prefix =
    chip.kind === "channel" ? "#" : chip.kind === "stamp" ? ":" : "";
  const resolveNestedChip: Props["resolveChip"] = (value, fieldKey) => {
    if (fieldKey === "id" && value === chip.id) return null;
    return resolveChip(value, fieldKey);
  };
  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };
  const clearOpenTimer = () => {
    if (openTimerRef.current === null) return;
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
  };
  const closeDetail = () => {
    clearOpenTimer();
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setBridgeStyle(undefined);
      closeTimerRef.current = null;
    }, 220);
  };
  const showDetail = (target: HTMLElement) => {
    clearCloseTimer();
    const rect = target.getBoundingClientRect();
    const width = Math.min(720, window.innerWidth - 24);
    const left = Math.min(
      Math.max(12, rect.left),
      Math.max(12, window.innerWidth - width - 12),
    );
    const desiredTop = rect.bottom + 6;
    const top =
      desiredTop + 360 > window.innerHeight
        ? Math.max(12, rect.top - 366)
        : desiredTop;
    setPosition({ left, top });
    const bridgeLeft = Math.max(0, Math.min(rect.left, left) - 8);
    const bridgeRight = Math.min(
      window.innerWidth,
      Math.max(rect.right, left + width) + 8,
    );
    if (top >= rect.bottom) {
      setBridgeStyle({
        left: bridgeLeft,
        top: rect.bottom - 2,
        width: bridgeRight - bridgeLeft,
        height: Math.max(14, top - rect.bottom + 4),
        clipPath: `polygon(${rect.left - bridgeLeft}px 0, ${
          rect.right - bridgeLeft
        }px 0, 100% 100%, 0 100%)`,
      });
    } else {
      setBridgeStyle({
        left: bridgeLeft,
        top: Math.max(0, rect.top - 18),
        width: bridgeRight - bridgeLeft,
        height: 20,
        clipPath: `polygon(0 0, 100% 0, ${
          rect.right - bridgeLeft
        }px 100%, ${rect.left - bridgeLeft}px 100%)`,
      });
    }
    setOpen(true);
  };
  const scheduleDetail = (target: HTMLElement) => {
    clearOpenTimer();
    clearCloseTimer();
    openTimerRef.current = window.setTimeout(() => {
      showDetail(target);
      openTimerRef.current = null;
    }, 260);
  };

  return (
    <span
      className="entity-inline"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onFocus={(event) => showDetail(event.currentTarget)}
      onMouseEnter={(event) => scheduleDetail(event.currentTarget)}
      onMouseLeave={closeDetail}
    >
      <span
        aria-describedby={open ? detailId : undefined}
        className={`entity-chip entity-chip--${chip.kind}`}
        tabIndex={0}
      >
        {"imageUrl" in chip ? (
          <img alt="" height={20} src={chip.imageUrl} width={20} />
        ) : null}
        <span>
          {prefix}
          {chip.label}
        </span>
      </span>
      {open && position ? (
        <>
          {bridgeStyle ? (
            <div
              aria-hidden="true"
              className="entity-hover-bridge"
              style={bridgeStyle}
            />
          ) : null}
          <div
            className="entity-inline-body"
            id={detailId}
            role="tooltip"
            style={{ left: position.left, top: position.top }}
            onMouseEnter={() => {
              clearOpenTimer();
              clearCloseTimer();
            }}
            onMouseLeave={closeDetail}
          >
            <JsonView
              value={chip.detail}
              resolveChip={resolveNestedChip}
              depth={0}
              allowEntity
              allowSummary={false}
            />
          </div>
        </>
      ) : null}
    </span>
  );
}

function isDateField(fieldKey?: string): boolean {
  return !!fieldKey && /(created|updated|at|date|time)$/i.test(fieldKey);
}

function CopyStringButton({ value }: { value: string }) {
  return (
    <button
      className="json-copy"
      type="button"
      title="Copy string"
      onClick={() => void navigator.clipboard?.writeText(value)}
    >
      <Copy size={12} />
    </button>
  );
}

function Primitive({
  value,
  resolveChip,
  allowEntity = true,
  fieldKey,
}: Props) {
  const chip = allowEntity ? resolveChip(value, fieldKey) : null;
  if (typeof value === "string" && isDateField(fieldKey)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return (
        <span className="json-string-line">
          <time className="json-date" dateTime={value}>
            {date.toLocaleString()}
          </time>
          <CopyStringButton value={value} />
        </span>
      );
    }
  }
  if (typeof value === "string")
    return (
      <span className="json-string-line">
        <span className="json-string">"{value}"</span>
        <CopyStringButton value={value} />
        {chip ? <EntityChipView chip={chip} resolveChip={resolveChip} /> : null}
      </span>
    );
  if (chip) {
    return <EntityChipView chip={chip} resolveChip={resolveChip} />;
  }
  if (typeof value === "number")
    return <span className="json-number">{value}</span>;
  if (typeof value === "boolean")
    return <span className="json-boolean">{String(value)}</span>;
  if (value === null) return <span className="json-null">null</span>;
  if (value === undefined) return <span className="json-null">undefined</span>;
  return <span>{String(value)}</span>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function renderSummary({
  value,
  resolveChip,
  allowEntity = true,
  allowSummary = true,
  fieldKey,
}: Props) {
  if (!allowEntity || !allowSummary) return null;
  if (isRecord(value) && typeof value.id === "string") {
    const inferredChip = inferChipFromRecord(value, fieldKey);
    if (inferredChip) {
      return <EntityChipView chip={inferredChip} resolveChip={resolveChip} />;
    }
  }
  return null;
}

function inferChipFromRecord(
  value: Record<string, unknown>,
  fieldKey?: string,
): EntityChip | null {
  const id = typeof value.id === "string" ? value.id : undefined;
  const name = typeof value.name === "string" ? value.name : id;
  if (!id || !name) return null;

  if (typeof value.displayName === "string") {
    return {
      kind: "user",
      id,
      username: name,
      displayName: value.displayName,
      label: `${value.displayName} (@${name})`,
      imageUrl: `https://image-proxy.trap.jp/icon/${encodeURIComponent(
        name,
      )}?width=48&height=48&format=webp`,
      detail: value,
    };
  }

  if (
    fieldKey?.toLowerCase().includes("channel") ||
    "parentId" in value ||
    "archived" in value ||
    "topic" in value
  ) {
    const fullPath = typeof value.fullPath === "string" ? value.fullPath : name;
    return {
      kind: "channel",
      id,
      label: fullPath,
      fullPath,
      detail: value,
    };
  }

  if ("members" in value || "admins" in value || fieldKey === "groups") {
    return {
      kind: "group",
      id,
      label: name,
      detail: value,
    };
  }

  return null;
}

function preview(value: unknown): string {
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (isRecord(value)) {
    const entries = Object.entries(value);
    const body = entries
      .slice(0, 4)
      .map(([key, item]) => {
        if (Array.isArray(item)) return `${key}: Array(${item.length})`;
        if (isRecord(item)) return `${key}: Object`;
        if (typeof item === "string") return `${key}: "${item}"`;
        return `${key}: ${String(item)}`;
      })
      .join(", ");
    return `{ ${body}${entries.length > 4 ? ", ..." : ""} }`;
  }
  return String(value);
}

function JsonArrayChunk({
  source,
  start,
  end,
  resolveChip,
  depth,
  allowEntity,
  allowSummary,
  fieldKey,
}: {
  source: unknown[];
  start: number;
  end: number;
  resolveChip: Props["resolveChip"];
  depth: number;
  allowEntity: boolean;
  allowSummary: boolean;
  fieldKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const last = end - 1;

  return (
    <li className="json-chunk">
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {open ? "-" : "+"} {start}-{last}
      </button>
      {open ? (
        <ol start={start}>
          {source.slice(start, end).map((item, index) => {
            const itemIndex = start + index;
            return (
              <li key={itemIndex}>
                <JsonView
                  value={item}
                  resolveChip={resolveChip}
                  depth={depth + 1}
                  allowEntity={allowEntity}
                  allowSummary={allowSummary}
                  fieldKey={fieldKey}
                />
              </li>
            );
          })}
        </ol>
      ) : null}
    </li>
  );
}

export function JsonView({
  value,
  resolveChip,
  depth = 0,
  allowEntity = true,
  allowSummary = true,
  fieldKey,
}: Props) {
  const [open, setOpen] = useState(depth === 0);
  const summary = renderSummary({
    value,
    resolveChip,
    allowEntity,
    allowSummary,
    fieldKey,
  });
  if (summary) return summary;

  if (Array.isArray(value)) {
    const chunkSize = 100;
    const shouldChunk = value.length > chunkSize;
    const chunkCount = shouldChunk ? Math.ceil(value.length / chunkSize) : 0;

    return (
      <details
        className="json-node"
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary>
          <span className="json-kind">Array({value.length})</span>
        </summary>
        {open ? (
          <ol>
            {shouldChunk
              ? Array.from({ length: chunkCount }, (_, chunkIndex) => {
                  const start = chunkIndex * chunkSize;
                  return (
                    <JsonArrayChunk
                      key={chunkIndex}
                      source={value}
                      start={start}
                      end={Math.min(start + chunkSize, value.length)}
                      resolveChip={resolveChip}
                      depth={depth}
                      allowEntity={allowEntity}
                      allowSummary={allowSummary}
                      fieldKey={fieldKey}
                    />
                  );
                })
              : value.map((item, index) => (
                  <li key={index}>
                    <JsonView
                      value={item}
                      resolveChip={resolveChip}
                      depth={depth + 1}
                      allowEntity={allowEntity}
                      allowSummary={allowSummary}
                      fieldKey={fieldKey}
                    />
                  </li>
                ))}
          </ol>
        ) : null}
      </details>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);
    return (
      <div className="json-node json-node--object">
        {depth > 0 ? (
          <span className="json-kind">Object({entries.length})</span>
        ) : null}
        <dl>
          {entries.map(([key, item]) => (
            <div className="json-row" key={key}>
              <dt>{key}</dt>
              <dd>
                <JsonView
                  value={item}
                  resolveChip={resolveChip}
                  depth={depth + 1}
                  allowEntity={allowEntity}
                  allowSummary={allowSummary}
                  fieldKey={key}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <Primitive
      value={value}
      resolveChip={resolveChip}
      allowEntity={allowEntity}
      fieldKey={fieldKey}
    />
  );
}
