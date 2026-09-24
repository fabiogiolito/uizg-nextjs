"use client";

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx";
import { getPortalRoot } from "./portal";

const supportsAnchor = typeof CSS !== "undefined" && CSS.supports("anchor-name", "--a");
const noop = () => () => {};
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

export type TooltipProps = {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  /** The element that shows the tooltip on hover or focus. */
  children: ReactNode;
};

/**
 * Tooltip shown on hover and keyboard focus. The bubble is portaled to the end of body and anchored
 * to the trigger, so no container can clip or cover it, and it flips when near a viewport edge.
 */
export function Tooltip({ content, side = "top", className, children }: TooltipProps) {
  const id = useId();
  const anchorName = `--tooltip-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  const [pos, setPos] = useState<CSSProperties>();
  const mounted = useMounted();

  // Without anchor positioning, place the bubble from the trigger's rect.
  useLayoutEffect(() => {
    if (!shown || supportsAnchor) return;
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    setPos(
      side === "top" ? { left: cx, bottom: window.innerHeight - r.top, transform: "translateX(-50%)" }
      : side === "bottom" ? { left: cx, top: r.bottom, transform: "translateX(-50%)" }
      : side === "left" ? { right: window.innerWidth - r.left, top: cy, transform: "translateY(-50%)" }
      : { left: r.right, top: cy, transform: "translateY(-50%)" },
    );
  }, [shown, side]);

  const bubble = (
    <span
      role="tooltip"
      id={id}
      className={cx("tooltip__content", `tooltip__content--${side}`, shown && "tooltip__content--visible")}
      style={(supportsAnchor ? { positionAnchor: anchorName } : pos) as CSSProperties}
    >
      {content}
    </span>
  );

  return (
    <span
      ref={wrapRef}
      className={cx("tooltip", className)}
      aria-describedby={id}
      style={{ anchorName } as CSSProperties}
      onPointerEnter={() => setShown(true)}
      onPointerLeave={() => setShown(false)}
      onFocus={() => setShown(true)}
      onBlur={() => setShown(false)}
    >
      {children}
      {mounted && createPortal(bubble, getPortalRoot())}
    </span>
  );
}
