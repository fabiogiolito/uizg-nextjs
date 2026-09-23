import type { ReactNode } from "react";
import { cx } from "./cx";

export type ToolbarProps = {
  /** default: raised bar. ghost: no box, just the layout and separators. */
  variant?: "default" | "ghost";
  /** Fill the container width. */
  block?: boolean;
  "aria-label"?: string;
  className?: string;
  children: ReactNode;
};

/**
 * A raised bar holding groups of controls. Groups are separated by a thin line. Members keep
 * their own styles, so a group can mix ghost buttons, toggles, a select and a filled button.
 */
export function Toolbar({ variant = "default", block, className, children, ...rest }: ToolbarProps) {
  return (
    <div role="toolbar" aria-label={rest["aria-label"]} className={cx("toolbar", variant === "ghost" && "toolbar--ghost", block && "toolbar--block", className)}>
      {children}
    </div>
  );
}

export type ToolbarGroupProps = {
  /** Push this group (and the ones after it) to the end of the bar. */
  end?: boolean;
  className?: string;
  children: ReactNode;
};

export function ToolbarGroup({ end, className, children }: ToolbarGroupProps) {
  return <div className={cx("toolbar__group", end && "toolbar__group--end", className)}>{children}</div>;
}

/** Explicit separator, for use inside a group. Groups already get one between them. */
export function ToolbarSeparator() {
  return <span role="separator" aria-orientation="vertical" className="toolbar__separator" />;
}
