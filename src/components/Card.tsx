import type { ReactNode } from "react";
import { cx } from "./cx";
import { TextPair } from "./TextPair";

export type CardProps = {
  /** default: raised. surface: surface background. elevated: shadow instead of border. ghost: no box, content sits on whatever is behind. */
  variant?: "default" | "surface" | "elevated" | "ghost";
  /** Padding on all sides. */
  size?: "sm" | "md" | "lg";
  /** Horizontal padding, overrides `size`. */
  sizeX?: "sm" | "md" | "lg";
  /** Vertical padding, overrides `size`. */
  sizeY?: "sm" | "md" | "lg";
  /** Grow to fill a flex parent such as a Frame. */
  grow?: boolean;
  title?: ReactNode;
  /** Shown directly under the title as a text pair. */
  description?: ReactNode;
  /** Rendered on the right side of the header. */
  action?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
};

/** A box with optional header, body and footer. Also the building block inside a Frame. */
export function Card({ variant = "default", size = "md", sizeX, sizeY, grow, title, description, action, footer, className, children }: CardProps) {
  return (
    <div
      className={cx(
        "card",
        variant !== "default" && `card--${variant}`,
        size !== "md" && `card--${size}`,
        sizeX && `card--x-${sizeX}`,
        sizeY && `card--y-${sizeY}`,
        grow && "card--grow",
        className,
      )}
    >
      {(title || action) && (
        <div className="card__header">
          {title && <TextPair size="lg" titleAs="h3" title={title} description={description} className="card__title" />}
          {action}
        </div>
      )}
      {children && <div className="card__body">{children}</div>}
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
}
