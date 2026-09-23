"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx";
import { List } from "./List";

const supportsAnchor = typeof CSS !== "undefined" && CSS.supports("anchor-name", "--a");

export type ContextMenuTriggerProps = { onContextMenu: (e: MouseEvent) => void };

export type ContextMenuProps = {
  /** ListItem, ListSection, ListDivider and ListHeading content. Receives a close function. */
  menu: ReactNode | ((close: () => void) => ReactNode);
  disabled?: boolean;
  className?: string;
  /**
   * The element(s) that open the menu on right-click. Pass a function to attach the handler to
   * an element you render yourself, e.g. a table cell, so the whole element is the target.
   */
  children: ReactNode | ((props: ContextMenuTriggerProps) => ReactNode);
};

/**
 * Opens a menu at the pointer on right-click. A zero-size fixed element is placed at the click
 * point and the menu is anchored to it with CSS anchor positioning, so it flips to stay in view.
 * The menu is a popover portaled to the body, so it renders in the top layer above dialogs and
 * never sits inside a table row or other element with strict content rules.
 */
export function ContextMenu({ menu, disabled, className, children }: ContextMenuProps) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [fallback, setFallback] = useState<CSSProperties>();
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const anchorName = `--context-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const close = () => setPoint(null);

  const onContextMenu = (e: MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setPoint({ x: e.clientX, y: e.clientY });
  };

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!point || !el) return;
    if (!el.matches(":popover-open")) el.showPopover();
    if (supportsAnchor) return;
    // Fallback placement: flip when the menu would overflow the viewport.
    const { width, height } = el.getBoundingClientRect();
    const x = point.x + width > window.innerWidth ? point.x - width : point.x;
    const y = point.y + height > window.innerHeight ? point.y - height : point.y;
    setFallback({ left: Math.max(0, x), top: Math.max(0, y) });
  }, [point]);

  useEffect(() => {
    if (!point) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onScroll = (e: Event) => {
      if (!(e.target instanceof Node) || !menuRef.current?.contains(e.target)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [point]);

  const overlay =
    point &&
    createPortal(
      <>
        <span className="context-menu__anchor" style={{ left: point.x, top: point.y, anchorName } as CSSProperties} aria-hidden />
        <div
          ref={menuRef}
          popover="manual"
          className="dropdown__menu context-menu__menu"
          style={{ ...fallback, positionAnchor: anchorName } as CSSProperties}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest(".list__item")) close();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <List role="menu">{typeof menu === "function" ? menu(close) : menu}</List>
        </div>
      </>,
      document.body,
    );

  if (typeof children === "function") {
    return (
      <>
        {children({ onContextMenu })}
        {overlay}
      </>
    );
  }
  return (
    <div className={cx("context-menu", className)} onContextMenu={onContextMenu}>
      {children}
      {overlay}
    </div>
  );
}
