"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";

export type SplitProps = {
  /** Primary content, fills the width when there is no pane. */
  children: ReactNode;
  /** Second pane on the end side. Null or undefined closes it with an animation. */
  pane?: ReactNode;
  /** Pane width as a percentage of the container, used until the user drags. */
  defaultSize?: number;
  /** Pane width limits in pixels. The primary side keeps at least minPrimary. */
  minWidth?: number;
  maxWidth?: number;
  minPrimary?: number;
  /** Called on Escape while the pane is open. Wire your close button to the same function. */
  onClose?: () => void;
  /** Persist the dragged size in localStorage under this key. */
  storageKey?: string;
  className?: string;
};

const read = (key?: string) => {
  if (!key) return null;
  try {
    const v = Number(localStorage.getItem(`split:${key}`));
    return v > 0 && v < 100 ? v : null;
  } catch {
    return null;
  }
};

/**
 * Two content slots side by side. The pane can be resized by dragging the divider, within min and
 * max widths, and animates in and out while the primary side resizes to match.
 */
export function Split({ children, pane, defaultSize = 40, minWidth = 280, maxWidth = 720, minPrimary = 320, onClose, storageKey, className }: SplitProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(defaultSize);
  const [dragging, setDragging] = useState(false);
  // The last pane content stays rendered while it fades out.
  const [shown, setShown] = useState<ReactNode>(pane);
  const open = pane !== null && pane !== undefined;

  useEffect(() => {
    const stored = read(storageKey);
    if (stored) setSize(stored);
  }, [storageKey]);

  useEffect(() => {
    if (open) setShown(pane);
  }, [open, pane]);

  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    const move = (ev: PointerEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      // The pane can never push the primary side under its minimum.
      const px = Math.min(maxWidth, rect.width - minPrimary, Math.max(minWidth, rect.right - ev.clientX));
      setSize(Math.min(100, Math.max(0, (px / rect.width) * 100)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDragging(false);
      setSize((s) => {
        try {
          if (storageKey) localStorage.setItem(`split:${storageKey}`, String(s));
        } catch {}
        return s;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={ref}
      className={cx("split", open && "split--open", dragging && "split--dragging", className)}
      style={{ "--split-size": `${size}%`, "--split-min": `${minWidth}px`, "--split-max": `${maxWidth}px`, "--split-min-primary": `${minPrimary}px` } as CSSProperties}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && !open) setShown(null);
      }}
    >
      <div className="split__primary">{children}</div>
      <div className="split__pane" aria-hidden={!open} inert={!open}>
        <div className="split__divider" onPointerDown={onResizeStart} onDoubleClick={() => setSize(50)} aria-hidden />
        <div className="split__pane-content">{open ? pane : shown}</div>
      </div>
    </div>
  );
}
