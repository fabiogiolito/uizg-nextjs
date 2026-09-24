import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";

export type HoverCardProps = {
  /** Panel content. */
  content: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  /** Anchor the panel to another element's anchor-name (e.g. a table row) instead of the trigger. */
  anchor?: string;
  /** Controlled visibility from a parent's own hover logic; the trigger's hover is ignored when set. */
  open?: boolean;
  className?: string;
  /** The element that opens the card on hover or focus. */
  children: ReactNode;
};

/**
 * A floating panel that opens after a short hover on its trigger and stays open while the
 * pointer is over the panel. CSS only: the delay is a transition delay, the position is anchored.
 */
export function HoverCard({ content, side = "top", align = "center", anchor, open, className, children }: HoverCardProps) {
  const id = useId();
  const ownAnchor = `--hover-card-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const anchorName = anchor ?? ownAnchor;
  const controlled = open !== undefined;
  return (
    <span
      className={cx("hover-card", `hover-card--${side}`, `hover-card--${align}`, controlled && "hover-card--controlled", open && "hover-card--open", className)}
      style={anchor ? undefined : ({ anchorName: ownAnchor } as CSSProperties)}
    >
      {children}
      <span role="dialog" id={id} className="hover-card__panel" style={{ positionAnchor: anchorName } as CSSProperties}>
        <span className="hover-card__content">{content}</span>
      </span>
    </span>
  );
}
