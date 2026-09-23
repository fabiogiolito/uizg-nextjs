import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";

export type HoverCardProps = {
  /** Panel content. */
  content: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  className?: string;
  /** The element that opens the card on hover or focus. */
  children: ReactNode;
};

/**
 * A floating panel that opens after a short hover on its trigger and stays open while the
 * pointer is over the panel. CSS only: the delay is a transition delay, the position is anchored.
 */
export function HoverCard({ content, side = "top", align = "center", className, children }: HoverCardProps) {
  const id = useId();
  const anchorName = `--hover-card-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <span className={cx("hover-card", `hover-card--${side}`, `hover-card--${align}`, className)} style={{ anchorName } as CSSProperties}>
      {children}
      <span role="dialog" id={id} className="hover-card__panel" style={{ positionAnchor: anchorName } as CSSProperties}>
        <span className="hover-card__content">{content}</span>
      </span>
    </span>
  );
}
