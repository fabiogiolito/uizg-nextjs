import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";
import { TextPair } from "./TextPair";

export type ChoiceProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "title"> & {
  /** Checkbox allows many selections, radio allows one per `name`. */
  type?: "checkbox" | "radio";
  title: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  /** Content placed at the end of the card, e.g. a price or a badge. */
  trailing?: ReactNode;
  /** Look of the unselected state, mirroring Card variants. "plain" has no box at all, for lists with dividers. */
  variant?: "default" | "surface" | "plain";
  /** Hide the checkbox or radio control, the card itself shows the state. */
  hideControl?: boolean;
  /** Compact, button-like version for tags and short options. */
  inline?: boolean;
};

/**
 * A selectable card or tag. The whole surface is the click target and the selected state is
 * shown on the card, with an optional checkbox or radio control inside.
 */
export function Choice({
  type = "checkbox",
  title,
  description,
  icon,
  trailing,
  variant = "default",
  hideControl,
  inline,
  className,
  ...rest
}: ChoiceProps) {
  return (
    <label
      className={cx(
        "choice",
        `choice--${type}`,
        variant !== "default" && `choice--${variant}`,
        inline && "choice--inline",
        hideControl && "choice--no-control",
        className,
      )}
    >
      <input type={type} className="choice__input" {...rest} />
      {!hideControl && (
        <span className="choice__control" aria-hidden>
          {type === "checkbox" ? <Icon name="check" className="choice__check" /> : <span className="choice__dot" />}
        </span>
      )}
      {icon && <Icon name={icon} className="choice__icon" />}
      {inline ? (
        // Icon-only toggles pass an empty title; skip the label so nothing adds width.
        title !== "" && title !== null && <span className="choice__title">{title}</span>
      ) : (
        <TextPair title={title} description={description} className="choice__text" />
      )}
      {trailing && <span className="choice__trailing">{trailing}</span>}
    </label>
  );
}
