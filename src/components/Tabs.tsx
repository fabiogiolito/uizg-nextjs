"use client";

import { useState, type ReactNode } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import type { IconName } from "./Icon";

export type TabItem = {
  value: string;
  label: ReactNode;
  icon?: IconName;
  /** Extra element after the label, e.g. a Badge with a count. */
  trailing?: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  items: TabItem[];
  /** Controlled value. Leave undefined for uncontrolled. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  /** Tabs share the full width equally. */
  block?: boolean;
  /** Content aligned to the end of the tab row, e.g. a search input or actions. */
  trailing?: ReactNode;
  className?: string;
  /** Extra elements rendered inline after the tabs. They keep their own look. */
  children?: ReactNode;
};

/**
 * Horizontal tabs with an underline indicator. Each tab is a wrapper holding a ghost button,
 * so other buttons placed in the row are not styled as tabs.
 */
export function Tabs({ items, value, defaultValue, onChange, size = "md", block, trailing, className, children }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;
  const select = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };
  return (
    <div role="tablist" className={cx("tabs", block && "tabs--block", className)}>
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <div key={item.value} className={cx("tabs__tab", isActive && "tabs__tab--active")}>
            <Button
              variant="ghost"
              size={size}
              icon={item.icon}
              role="tab"
              aria-selected={isActive}
              disabled={item.disabled}
              onClick={() => select(item.value)}
            >
              {item.label}
              {item.trailing}
            </Button>
          </div>
        );
      })}
      {children}
      {trailing && <div className="tabs__trailing">{trailing}</div>}
    </div>
  );
}
