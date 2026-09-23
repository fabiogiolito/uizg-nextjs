"use client";

import { useState, type ReactNode } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import type { IconName } from "./Icon";

export type SegmentedItem = {
  value: string;
  /** Omit for an icon-only option; pass `title` for accessibility. */
  label?: ReactNode;
  icon?: IconName;
  title?: string;
  trailing?: ReactNode;
  disabled?: boolean;
};

export type SegmentedProps = {
  items: SegmentedItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  className?: string;
};

/** Segmented selector. Options are ghost buttons; the active one is a raised default button. */
export function Segmented({ items, value, defaultValue, onChange, size = "md", block, className }: SegmentedProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;
  const select = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };
  return (
    <div
      role="radiogroup"
      className={cx("segmented", size !== "md" && `segmented--${size}`, block && "segmented--block", className)}
    >
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <Button
            key={item.value}
            variant={isActive ? "default" : "ghost"}
            size={size}
            icon={item.icon}
            role="radio"
            aria-checked={isActive}
            aria-label={item.title}
            title={item.title}
            disabled={item.disabled}
            className={cx("segmented__option", isActive && "segmented__option--active")}
            onClick={() => select(item.value)}
          >
            {item.label}
            {item.trailing}
          </Button>
        );
      })}
    </div>
  );
}
