"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx";
import { getPortalRoot } from "./portal";

const supportsAnchor = typeof CSS !== "undefined" && CSS.supports("anchor-name", "--a");
// True only on the client after hydration, so the portal target exists.
const noop = () => () => {};
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

export type HoverCardProps = {
  /** Panel content. */
  content: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  /** Anchor the panel to another element's anchor-name (e.g. a table row) instead of the trigger. */
  anchor?: string;
  /** Controlled visibility from a parent's own hover logic; the trigger's hover is ignored when set. */
  open?: boolean;
  /** Panel width; a number is pixels. Defaults to --hover-card-width. */
  width?: number | string;
  /** Class for the wrapper around the trigger. */
  className?: string;
  /** Class for the portaled panel, which the wrapper's className and variables do not reach. */
  panelClassName?: string;
  /** The element that opens the card on hover or focus. */
  children: ReactNode;
};

/**
 * A floating panel that opens after a short hover on its trigger and stays open while the pointer
 * is over the panel. The panel is portaled to the end of body so no cell, sticky column or panel can
 * clip or cover it, and anchored to the trigger (or to `anchor`) with CSS anchor positioning.
 */
export function HoverCard({ content, side = "top", align = "center", anchor, open, width, className, panelClassName, children }: HoverCardProps) {
  const id = useId();
  const ownAnchor = `--hover-card-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const anchorName = anchor ?? ownAnchor;
  const controlled = open !== undefined;
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [hover, setHover] = useState(false);
  const mounted = useMounted();
  const [pos, setPos] = useState<CSSProperties>();
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shown = controlled ? open : hover;

  // Leaving the trigger for the panel crosses a small gap; a short grace period keeps it open.
  const enter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHover(true);
  };
  const leave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setHover(false), 150);
  };

  // An opening Dropdown closes hover cards, so a menu never sits under one.
  useEffect(() => {
    if (!hover) return;
    const close = () => setHover(false);
    document.addEventListener("uizg:dropdown-open", close);
    return () => document.removeEventListener("uizg:dropdown-open", close);
  }, [hover]);

  // Without anchor positioning, place the panel from the trigger's rect.
  useLayoutEffect(() => {
    if (!shown || supportsAnchor) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = align === "start" ? { left: rect.left } : align === "end" ? { right: window.innerWidth - rect.right } : { left: rect.left + rect.width / 2, transform: "translateX(-50%)" };
    setPos(side === "top" ? { bottom: window.innerHeight - rect.top, ...x } : { top: rect.bottom, ...x });
  }, [shown, side, align]);

  const panel = (
    <span
      role="dialog"
      id={id}
      className={cx("hover-card__panel", `hover-card__panel--${side}`, `hover-card__panel--${align}`, shown && (controlled ? "hover-card__panel--open" : "hover-card__panel--hover"), panelClassName)}
      style={{ ...(supportsAnchor ? { positionAnchor: anchorName } : pos), ...(width !== undefined ? { "--hover-card-width": typeof width === "number" ? `${width}px` : width } : {}) } as CSSProperties}
      onPointerEnter={enter}
      onPointerLeave={leave}
    >
      <span className="hover-card__content">{content}</span>
    </span>
  );

  return (
    <span
      ref={wrapRef}
      className={cx("hover-card", className)}
      style={anchor ? undefined : ({ anchorName: ownAnchor } as CSSProperties)}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={leave}
    >
      {children}
      {mounted && createPortal(panel, getPortalRoot())}
    </span>
  );
}
