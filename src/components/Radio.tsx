import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import { TextPair } from "./TextPair";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  label?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
};

export function Radio({ label, description, size = "md", className, ...rest }: RadioProps) {
  return (
    <label className={cx("radio", size === "sm" && "radio--sm", !label && "radio--bare", className)}>
      <input type="radio" className="radio__input" {...rest} />
      <span className="radio__box" aria-hidden>
        <span className="radio__dot" />
      </span>
      {label && <TextPair title={label} description={description} className="radio__text" />}
    </label>
  );
}
