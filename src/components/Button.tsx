import { Children, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import Link from "next/link";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  ref?: Ref<HTMLButtonElement>;
  /** Render as a link. Uses next/link for in-app routes. */
  href?: string;
  /** Marks the current page or item (sets aria-current). */
  active?: boolean;
  /**
   * Style. default: raised. fill: solid color. outline: border only. flat: tinted background.
   * ghost: no background or border. Combine with `color`.
   */
  variant?: "default" | "fill" | "outline" | "flat" | "ghost";
  /** Accent color. On the default variant it colors the label; other variants use it for fill, border or tint. */
  color?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  /** Icon shown before the label, centered on its first line. */
  icon?: IconName;
  /** Icon shown after the label. */
  trailingIcon?: IconName;
  /** Content pushed to the end of the button, e.g. a shortcut hint or a badge. */
  trailing?: ReactNode;
  /** Stretch to the container width and left-align content. */
  block?: boolean;
  children?: ReactNode;
};

export function Button({
  variant = "default",
  color = "default",
  size = "md",
  icon,
  trailingIcon,
  trailing,
  block,
  href,
  active,
  className,
  children,
  ...rest
}: ButtonProps) {
  // Children.toArray drops null, undefined and booleans, so `{maybeLabel}{maybeTrailing}` counts as empty.
  const hasChildren = Children.toArray(children).length > 0;
  const iconOnly = !hasChildren && (icon || trailingIcon);
  const classes = cx(
    "button",
    variant !== "default" && `button--${variant}`,
    color !== "default" && `button--${color}`,
    size !== "md" && `button--${size}`,
    iconOnly && "button--icon-only",
    block && "button--block",
    active && "button--active",
    className,
  );
  const content = (
    <span className="button__content">
      {icon && (
        <span className="button__icon">
          <Icon name={icon} />
        </span>
      )}
      {hasChildren && <span className="button__label">{children}</span>}
      {trailingIcon && (
        <span className="button__icon">
          <Icon name={trailingIcon} />
        </span>
      )}
      {trailing && <span className="button__trailing">{trailing}</span>}
    </span>
  );
  if (href) {
    // Button-only attributes are dropped; the rest apply to the anchor.
    const { ref: _ref, disabled, type: _type, ...anchorRest } = rest as ButtonProps & { type?: string };
    void _ref; void _type;
    return (
      <Link href={href} className={classes} aria-current={active ? "page" : undefined} aria-disabled={disabled || undefined} {...(anchorRest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} aria-current={active || undefined} {...rest}>
      {content}
    </button>
  );
}
