import type { ReactNode } from "react";
import { cx } from "./cx";

export type ButtonGroupProps = {
  /** Stretch to the container width, sharing it equally. */
  block?: boolean;
  className?: string;
  /** Buttons, Dropdowns or Selects. Only the outer corners stay rounded. */
  children: ReactNode;
};

/** Joins buttons into one element. Inner borders overlap; a thin line separates filled buttons. */
export function ButtonGroup({ block, className, children }: ButtonGroupProps) {
  return (
    <div role="group" className={cx("button-group", block && "button-group--block", className)}>
      {children}
    </div>
  );
}
