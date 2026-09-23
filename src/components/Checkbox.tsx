"use client";

import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx";
import { TextPair } from "./TextPair";
import { Icon } from "./Icon";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  /** Shows a dash instead of a check. Used by "select all" when only some rows are selected. */
  indeterminate?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  size?: "sm" | "md";
};

export function Checkbox({ indeterminate, label, description, size = "md", className, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <label className={cx("checkbox", size === "sm" && "checkbox--sm", !label && "checkbox--bare", className)}>
      <input ref={ref} type="checkbox" className="checkbox__input" {...rest} />
      <span className="checkbox__box" aria-hidden>
        <Icon name={indeterminate ? "minus" : "check"} className="checkbox__icon" />
      </span>
      {label && <TextPair title={label} description={description} className="checkbox__text" />}
    </label>
  );
}
