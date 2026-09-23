import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";

export type TooltipProps = {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  /** The element that shows the tooltip on hover or focus. */
  children: ReactNode;
};

/**
 * CSS-only tooltip shown on hover and keyboard focus. The bubble is position: fixed and anchored
 * to the trigger, so scroll containers never clip it and it flips when near a viewport edge.
 */
export function Tooltip({ content, side = "top", className, children }: TooltipProps) {
  const id = useId();
  const anchorName = `--tooltip-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <span className={cx("tooltip", `tooltip--${side}`, className)} aria-describedby={id} style={{ anchorName } as CSSProperties}>
      {children}
      <span role="tooltip" id={id} className="tooltip__content" style={{ positionAnchor: anchorName } as CSSProperties}>
        {content}
      </span>
    </span>
  );
}
