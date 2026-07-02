import { useId, useRef, useState, type CSSProperties } from "react";
import type { EntityChip } from "../../features/entities/types";
import { cx } from "../../utils/classNames";
import { JsonView } from "./JsonView";
import styles from "./JsonView.module.css";

type HoverBridge = CSSProperties | undefined;
type HoverPosition = { left: number; top: number } | undefined;

const entityChipPrefix = (kind: EntityChip["kind"]): string => {
  if (kind === "channel") return "#";
  if (kind === "group") return "@";
  if (kind === "stamp") return ":";
  return "";
};

export const EntityChipView = ({ chip }: { chip: EntityChip }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<HoverPosition>();
  const [bridgeStyle, setBridgeStyle] = useState<HoverBridge>();
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const detailId = useId();
  const prefix = entityChipPrefix(chip.kind);

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
    const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12));
    const desiredTop = rect.bottom + 6;
    const top = desiredTop + 360 > window.innerHeight ? Math.max(12, rect.top - 366) : desiredTop;
    setPosition({ left, top });

    const bridgeLeft = Math.max(0, Math.min(rect.left, left) - 8);
    const bridgeRight = Math.min(window.innerWidth, Math.max(rect.right, left + width) + 8);
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
      className={styles["entity-inline"]}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onFocus={(event) => showDetail(event.currentTarget)}
      onMouseEnter={(event) => scheduleDetail(event.currentTarget)}
      onMouseLeave={closeDetail}
    >
      <span
        aria-describedby={open ? detailId : undefined}
        className={cx(styles["entity-chip"], styles[`entity-chip--${chip.kind}`])}
        tabIndex={0}
      >
        {"imageUrl" in chip ? <img alt="" height={20} src={chip.imageUrl} width={20} /> : null}
        <span>
          {prefix}
          {chip.label}
        </span>
      </span>
      {open && position ? (
        <>
          {bridgeStyle ? (
            <div aria-hidden="true" className={styles["entity-hover-bridge"]} style={bridgeStyle} />
          ) : null}
          <div
            className={styles["entity-inline-body"]}
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
              depth={0}
              allowEntity
              allowSummary={false}
              suppressedEntityId={chip.id}
            />
          </div>
        </>
      ) : null}
    </span>
  );
};
