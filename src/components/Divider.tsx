import type { ReactNode } from "react";
import { cx } from "./cx";

export type DividerProps = {
  /** Line weight: default border width, or twice it. */
  weight?: "default" | "thick";
  /** Vertical margin around the line. */
  spacing?: "none" | "sm" | "md" | "lg";
  /** Content centered between two lines, e.g. a date or "or". */
  children?: ReactNode;
  className?: string;
};

/** Horizontal rule, optionally with centered content. */
export function Divider({ weight = "default", spacing = "none", children, className }: DividerProps) {
  const classes = cx("divider", weight === "thick" && "divider--thick", spacing !== "none" && `divider--spacing-${spacing}`, className);
  if (children === undefined || children === null || children === false) {
    return <hr className={classes} />;
  }
  return (
    <div role="separator" className={cx(classes, "divider--labeled")}>
      <span className="divider__label">{children}</span>
    </div>
  );
}
