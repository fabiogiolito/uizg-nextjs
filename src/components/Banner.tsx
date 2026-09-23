import type { ReactNode } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { TextPair } from "./TextPair";

export type BannerProps = {
  /** Same axes as Badge: variant decides where the color goes, color sets the accent. */
  variant?: "default" | "fill" | "outline" | "flat" | "ghost";
  color?: "default" | "primary" | "success" | "warning" | "danger";
  title: ReactNode;
  description?: ReactNode;
  /** Defaults to an icon matching the color. Pass null to hide it. */
  icon?: IconName | null;
  /** Buttons or links at the end of the banner. */
  actions?: ReactNode;
  onDismiss?: () => void;
  className?: string;
};

const defaultIcon: Record<NonNullable<BannerProps["color"]>, IconName> = {
  default: "info",
  primary: "info",
  success: "checkCircle",
  warning: "alertTriangle",
  danger: "xCircle",
};

/** A card-like message with an icon, title, optional description and actions, colored like a badge. */
export function Banner({ variant = "flat", color = "default", title, description, icon, actions, onDismiss, className }: BannerProps) {
  const iconName = icon === null ? null : (icon ?? defaultIcon[color]);
  return (
    <div
      role={color === "danger" || color === "warning" ? "alert" : "status"}
      className={cx("banner", variant !== "default" && `banner--${variant}`, color !== "default" && `banner--${color}`, className)}
    >
      {iconName && <Icon name={iconName} className="banner__icon" />}
      <TextPair title={title} description={description} className="banner__text" />
      {actions && <div className="banner__actions">{actions}</div>}
      {onDismiss && <Button size="sm" variant="ghost" icon="x" aria-label="Dismiss" className="banner__dismiss" onClick={onDismiss} />}
    </div>
  );
}
