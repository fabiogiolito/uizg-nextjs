import type { ReactNode } from "react";
import { cx } from "./cx";

export type FrameProps = {
  /** Lay cards out in a row instead of a column. */
  direction?: "column" | "row";
  className?: string;
  children: ReactNode;
};

/** A surface that groups Cards, with a small inset so raised cards sit inside it. Ghost cards put content straight on the surface. */
export function Frame({ direction = "column", className, children }: FrameProps) {
  return <div className={cx("frame", direction === "row" && "frame--row", className)}>{children}</div>;
}
