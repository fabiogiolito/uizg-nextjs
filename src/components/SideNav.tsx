"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";
import { Button } from "./Button";

export type SideNavProps = {
  /** Sticky at the top: brand, search, primary actions. The collapse toggle sits at its top right. */
  header?: ReactNode;
  /** Sticky at the bottom: account, secondary actions. */
  footer?: ReactNode;
  /** Scrolls between header and footer. Usually a List. */
  children?: ReactNode;
  /** Show the collapse toggle at the top right. */
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** While collapsed, hovering the rail shows the full nav over the page without pushing content. */
  expandOnHover?: boolean;
  /** Allow dragging the right edge to change the width. */
  resizable?: boolean;
  width?: number;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
  /** Line on the right edge. Off for a nav that sits on the page background. */
  border?: boolean;
  "aria-label"?: string;
  className?: string;
};

const COLLAPSED_WIDTH = 48;

/**
 * App navigation column that fills the height it is given. The header and footer stay put while
 * the middle scrolls. Can collapse to an icon rail (optionally peeking open on hover) and be resized
 * by dragging its right edge.
 */
export function SideNav({ header, footer, children, collapsible, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, expandOnHover, resizable, width: widthProp, defaultWidth = 240, minWidth = 200, maxWidth = 400, onWidthChange, border = true, "aria-label": ariaLabel = "Main", className }: SideNavProps) {
  const [collapsedState, setCollapsedState] = useState(defaultCollapsed);
  const [widthState, setWidthState] = useState(defaultWidth);
  const collapsed = collapsedProp ?? collapsedState;
  const width = widthProp ?? widthState;
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const setCollapsed = (v: boolean) => {
    setCollapsedState(v);
    onCollapsedChange?.(v);
  };
  const setWidth = (w: number) => {
    setWidthState(w);
    onWidthChange?.(w);
  };
  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    drag.current = { startX: e.clientX, startWidth: width };
    setDragging(true);
    const move = (ev: PointerEvent) => {
      if (!drag.current) return;
      setWidth(Math.min(maxWidth, Math.max(minWidth, drag.current.startWidth + ev.clientX - drag.current.startX)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      drag.current = null;
      setDragging(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <nav
      className={cx("side-nav", collapsed && "side-nav--collapsed", collapsed && expandOnHover && "side-nav--peek", !border && "side-nav--borderless", dragging && "side-nav--dragging", className)}
      style={{ "--side-nav-width": `${collapsed ? COLLAPSED_WIDTH : width}px`, "--side-nav-expanded-width": `${width}px` } as CSSProperties}
      aria-label={ariaLabel}
    >
      <div className="side-nav__panel">
      <div className="side-nav__header">
        <div className="side-nav__header-content">{header}</div>
        {collapsible && (
          <Button size="sm" variant="ghost" icon={collapsed ? "chevronsRight" : "chevronsLeft"} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} aria-expanded={!collapsed} className="side-nav__toggle" onClick={() => setCollapsed(!collapsed)} />
        )}
      </div>
      <div className="side-nav__body">{children}</div>
      {footer && <div className="side-nav__footer">{footer}</div>}
      </div>
      {resizable && !collapsed && (
        <div className="side-nav__resizer" onPointerDown={onResizeStart} onDoubleClick={() => setWidth(defaultWidth)} aria-hidden />
      )}
    </nav>
  );
}
