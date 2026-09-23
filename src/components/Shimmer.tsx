import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";

export type ShimmerProps = {
  as?: ElementType;
  /** Turn the effect off while keeping the markup, e.g. when work finishes. */
  active?: boolean;
  className?: string;
  children: ReactNode;
};

/** Text with a light sweep moving across it, for things that are in progress. */
export function Shimmer({ as: Tag = "span", active = true, className, children }: ShimmerProps) {
  return <Tag className={cx("shimmer", active && "shimmer--active", className)}>{children}</Tag>;
}
