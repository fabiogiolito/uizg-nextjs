import type { ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export type BadgeProps = {
  /**
   * Style, same axis as Button. default: page background with a neutral border. fill: solid color
   * with contrasting text. flat: tinted background, no border. outline: colored border on a
   * transparent background. ghost: text only.
   */
  variant?: "default" | "fill" | "outline" | "flat" | "ghost";
  color?: "default" | "primary" | "success" | "warning" | "danger";
  dot?: boolean;
  icon?: IconName;
  className?: string;
  children: ReactNode;
};

export function Badge({ variant = "default", color = "default", dot, icon, className, children }: BadgeProps) {
  return (
    <span className={cx("badge", variant !== "default" && `badge--${variant}`, color !== "default" && `badge--${color}`, className)}>
      {dot && <span className="badge__dot" />}
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
