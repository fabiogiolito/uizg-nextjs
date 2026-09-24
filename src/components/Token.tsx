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
  /** One or several icons before the label, e.g. state flags. */
  icon?: IconName | IconName[];
  /** badge: filled pill. default: raised, like a Button. outline: transparent with a border. */
  variant?: "badge" | "default" | "outline";
  size?: "sm" | "md";
  onRemove?: () => void;
  /** List content for a dropdown; the whole token (minus the remove button) opens it. */
  menu?: ReactNode;
  /** Shows a grab cursor and enables drag sorting from the parent. */
  draggable?: boolean;
  dragging?: boolean;
  className?: string;
};

/** A chip representing a selected item, with optional remove button and options menu. */
export function Token({ label, meta, icon, variant = "badge", size = "md", onRemove, menu, draggable, dragging, className, ...rest }: TokenProps & Record<string, unknown>) {
  const content = (
    <>
      {icon && (Array.isArray(icon) ? icon : [icon]).map((i) => <Icon key={i} name={i} className="token__icon" />)}
      <span className="token__label">{label}</span>
      {meta && <span className="token__meta">{meta}</span>}
    </>
  );
  // A div: the Dropdown inside renders a div, which is not valid inside a span.
  return (
    <div
      className={cx("token", `token--${variant}`, size === "sm" && "token--sm", draggable && "token--draggable", dragging && "token--dragging", className)}
      draggable={draggable}
      {...rest}
    >
      {menu ? (
        <Dropdown className="token__menu" trigger={(t) => <button type="button" {...t} className="token__body">{content}<Icon name="chevronDown" className="token__chevron" /></button>}>
          {menu}
        </Dropdown>
      ) : (
        content
      )}
      {onRemove && (
        <Button size="sm" variant="ghost" icon="x" aria-label="Remove" className="token__remove" onMouseDown={(e) => e.preventDefault()} onClick={onRemove} />
      )}
    </div>
  );
}
