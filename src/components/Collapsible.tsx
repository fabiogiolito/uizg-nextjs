"use client";

import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";
import { TextPair } from "./TextPair";

export type CollapsibleTriggerProps = {
  onClick: () => void;
  "aria-expanded": boolean;
  "aria-controls": string;
};

/** Animated show/hide of block content using the grid-row trick. Shared by Collapsible and tree lists. */
export function Reveal({ open, id, className, children }: { open: boolean; id?: string; className?: string; children: ReactNode }) {
  return (
    <div id={id} className={cx("reveal", open && "reveal--open", className)} aria-hidden={!open}>
      <div className="reveal__inner">{children}</div>
    </div>
  );
}

type GroupContext = {
  open: string | null;
  setOpen: (value: string | null) => void;
};
const CollapsibleGroupContext = createContext<GroupContext | null>(null);

export type CollapsibleGroupProps = {
  /** Controlled open item. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Allow closing the open item so none are open. */
  allowNone?: boolean;
  /** "list" separates inline items with dividers, "stack" leaves a gap for panels. */
  layout?: "list" | "stack";
  className?: string;
  /** Collapsible children, each with a `value`. */
  children: ReactNode;
};

/** Accordion: only one child Collapsible is open at a time. */
export function CollapsibleGroup({ value, defaultValue = null, onChange, allowNone = true, layout = "list", className, children }: CollapsibleGroupProps) {
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const open = value !== undefined ? value : internal;
  const setOpen = (next: string | null) => {
    if (next === null && !allowNone) return;
    setInternal(next);
    onChange?.(next);
  };
  return (
    <CollapsibleGroupContext.Provider value={{ open, setOpen }}>
      <div className={cx("collapsible-group", `collapsible-group--${layout}`, className)}>{children}</div>
    </CollapsibleGroupContext.Provider>
  );
}

export type CollapsibleProps = {
  /** Identifies this item inside a CollapsibleGroup. */
  value?: string;
  /** Text for the built-in trigger. Ignored when `trigger` is given. */
  title?: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  /**
   * Custom trigger. Receives open state, a toggle function and the a11y props to spread on
   * whatever element should toggle the content (a Button, a row, anything).
   */
  trigger?: (state: { open: boolean; toggle: () => void; triggerProps: CollapsibleTriggerProps }) => ReactNode;
  /**
   * "inline": trigger row above the content.
   * "panel": bordered panel where the whole header is the click target and content expands inside it.
   */
  variant?: "inline" | "panel";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
};

export function Collapsible({
  value,
  title,
  description,
  icon,
  trigger,
  variant = "inline",
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
}: CollapsibleProps) {
  const group = useContext(CollapsibleGroupContext);
  const [internal, setInternal] = useState(defaultOpen);
  const inGroup = group !== null && value !== undefined;
  const isOpen = inGroup ? group.open === value : (open ?? internal);
  const contentId = useId();
  const toggle = () => {
    if (inGroup) {
      group.setOpen(isOpen ? null : value);
    } else {
      setInternal(!isOpen);
    }
    onOpenChange?.(!isOpen);
  };
  const triggerProps: CollapsibleTriggerProps = {
    onClick: toggle,
    "aria-expanded": isOpen,
    "aria-controls": contentId,
  };

  return (
    <div className={cx("collapsible", `collapsible--${variant}`, isOpen && "collapsible--open", className)}>
      {trigger ? (
        trigger({ open: isOpen, toggle, triggerProps })
      ) : (
        <button type="button" className="collapsible__trigger" {...triggerProps}>
          {icon && <Icon name={icon} className="collapsible__icon" />}
          <TextPair title={title} description={description} className="collapsible__summary" />
          <Icon name="chevronDown" className="collapsible__chevron" />
        </button>
      )}
      <Reveal id={contentId} open={isOpen} className="collapsible__content">
        {children}
      </Reveal>
    </div>
  );
}
