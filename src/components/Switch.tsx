import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import { TextPair } from "./TextPair";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
  /** Put the label before the switch. */
  labelFirst?: boolean;
};

/** On/off toggle on a hidden checkbox input. */
export function Switch({ label, description, size = "md", labelFirst, className, ...rest }: SwitchProps) {
  return (
    <label className={cx("switch", size === "sm" && "switch--sm", !label && "switch--bare", labelFirst && "switch--label-first", className)}>
      <input type="checkbox" role="switch" className="switch__input" {...rest} />
      <span className="switch__track" aria-hidden>
        <span className="switch__thumb" />
      </span>
      {label && <TextPair title={label} description={description} className="switch__text" />}
    </label>
  );
}
