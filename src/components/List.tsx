"use client";

import { Children, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Reveal } from "./Collapsible";
import { cx } from "./cx";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { TextPair } from "./TextPair";

export type ListProps = {
  /** Draw a border and raised background around the list. */
  bordered?: boolean;
  role?: "menu" | "listbox" | "list";
  className?: string;
  children: ReactNode;
};

/** Vertical list of ghost-button items. Used standalone or inside a Dropdown. */
export function List({ bordered, role = "list", className, children }: ListProps) {
  return (
    <div role={role} className={cx("list", bordered && "list--bordered", className)}>
      {children}
    </div>
  );
}

export type ListItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "color"> & {
  icon?: IconName;
  /** Any element before the label, e.g. an Avatar. */
  leading?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  /** Rendered at the end of the row, e.g. a keyboard shortcut. */
  trailing?: ReactNode;
  /** Icon at the end of the row, e.g. a chevron for a submenu. */
  trailingIcon?: IconName;
  /** Render the item as a link. */
  href?: string;
  selected?: boolean;
  danger?: boolean;
  /** Nested ListItems, rendered indented below this one with a guide line. */
  children?: ReactNode;
  /** Show a chevron that expands and collapses the children. */
  collapsible?: boolean;
  defaultExpanded?: boolean;
};

export function ListItem({ icon, leading, label, description, trailing, trailingIcon, selected, danger, children, collapsible, defaultExpanded = true, href, className, onClick, ...rest }: ListItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = children !== undefined && children !== null && children !== false;
  const item = (
    <Button
      variant="ghost"
      block
      icon={icon}
      leading={leading}
      trailingIcon={trailingIcon}
      trailing={
        collapsible && hasChildren ? (
          <>
            {trailing}
            <Icon name="chevronDown" className={cx("list__toggle", expanded && "list__toggle--expanded")} />
          </>
        ) : (
          trailing
        )
      }
      role={href ? undefined : "menuitem"}
      href={href}
      active={selected}
      aria-expanded={collapsible && hasChildren ? expanded : undefined}
      className={cx("list__item", selected && "list__item--selected", danger && "list__item--danger", className)}
      onClick={(e) => {
        if (collapsible && hasChildren) setExpanded((v) => !v);
        onClick?.(e);
      }}
      {...rest}
    >
      {description ? <TextPair title={label} description={description} /> : label}
    </Button>
  );
  if (!hasChildren) return item;
  // Each child gets its own guide segment so the one beside a selected item can be highlighted.
  const rows = Children.map(children, (child) =>
    child ? (
      <div className="list__child">
        <span className="list__guide" aria-hidden />
        <div className="list__child-content">{child}</div>
      </div>
    ) : null,
  );
  const childrenBlock = (
    <div className="list__children" role="group">
      {rows}
    </div>
  );
  return (
    <div className="list__node">
      {item}
      {collapsible ? <Reveal open={expanded}>{childrenBlock}</Reveal> : childrenBlock}
    </div>
  );
}

export type ListSectionProps = {
  /** Optional uppercase heading shown above the items. */
  title?: ReactNode;
  /** Shown at the end of the heading row, e.g. a count or a date. */
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Groups items under a heading. Consecutive sections are separated by a divider automatically. */
export function ListSection({ title, trailing, className, children }: ListSectionProps) {
  return (
    <div role="group" className={cx("list__section", className)}>
      {(title || trailing) && (
        <div className="list__heading">
          <span className="list__heading-text">{title}</span>
          {trailing && <span className="list__heading-trailing">{trailing}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export function ListDivider() {
  return <hr className="list__divider" />;
}

export function ListText({ children }: { children: ReactNode }) {
  return <div className="list__text">{children}</div>;
}

export function ListHeading({ children }: { children: ReactNode }) {
  return <div className="list__heading">{children}</div>;
}
