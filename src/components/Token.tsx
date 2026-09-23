"use client";

import type { ReactNode } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { Icon, type IconName } from "./Icon";

export type TokenProps = {
  label: ReactNode;
  /** Small secondary label, e.g. "required". */
  meta?: ReactNode;
  icon?: IconName;
  /** badge: filled pill. outline: bordered, button-like. */
  variant?: "badge" | "outline";
  size?: "sm" | "md";
  onRemove?: () => void;
  /** List content for a chevron dropdown that can change the token. */
  menu?: ReactNode;
  /** Shows a grab cursor and enables drag sorting from the parent. */
  draggable?: boolean;
  dragging?: boolean;
  className?: string;
};

/** A chip representing a selected item, with optional remove button and options menu. */
export function Token({ label, meta, icon, variant = "badge", size = "md", onRemove, menu, draggable, dragging, className, ...rest }: TokenProps & Record<string, unknown>) {
  return (
    <span
      className={cx("token", `token--${variant}`, size === "sm" && "token--sm", draggable && "token--draggable", dragging && "token--dragging", className)}
      draggable={draggable}
      {...rest}
    >
      {icon && <Icon name={icon} className="token__icon" />}
      <span className="token__label">{label}</span>
      {meta && <span className="token__meta">{meta}</span>}
      {menu && (
        <Dropdown size="sm" variant="ghost" icon="chevronDown" hideChevron triggerLabel="Options" className="token__menu">
          {menu}
        </Dropdown>
      )}
      {onRemove && (
        <Button size="sm" variant="ghost" icon="x" aria-label="Remove" className="token__remove" onMouseDown={(e) => e.preventDefault()} onClick={onRemove} />
      )}
    </span>
  );
}
