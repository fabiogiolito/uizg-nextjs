import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export type DataItem = { label: ReactNode; value: ReactNode; icon?: IconName };

export type DataListProps = {
  items: DataItem[];
  /** Align values to the end of the row. */
  align?: "start" | "end";
  size?: "sm" | "md";
  /** Space between rows. */
  gap?: "sm" | "md" | "lg";
  /** Divider lines between rows. */
  divided?: boolean;
  /** Every row the same height (a small control), with label and value vertically centered. */
  even?: boolean;
  className?: string;
};

/**
 * Label and value pairs in a grid. The label column is as wide as the longest label, up to
 * --data-label-max-width, and values take the remaining space.
 */
export function DataList({ items, align = "start", size = "md", gap = "md", divided, even, className }: DataListProps) {
  return (
    <dl className={cx("data-list", align === "end" && "data-list--end", size === "sm" && "data-list--sm", gap !== "md" && `data-list--gap-${gap}`, divided && "data-list--divided", even && "data-list--even", className)}>
      {items.map((item, i) => (
        <div key={i} className="data-list__row">
          <dt className="data-list__label">
            {item.icon && <Icon name={item.icon} className="data-list__icon" />}
            {item.label}
          </dt>
          <dd className="data-list__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
