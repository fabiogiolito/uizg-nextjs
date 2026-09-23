import { useId, type CSSProperties, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  /** Text shown before the control, e.g. "https://". */
  prepend?: ReactNode;
  /** Text shown after the control, e.g. ".com". */
  append?: ReactNode;
  /** Custom element rendered after the control inside the field (a badge, a shortcut hint). */
  trailing?: ReactNode;
  mono?: boolean;
  /** Content rendered before the control inside the field, e.g. tokens. */
  leading?: ReactNode;
  /** Style for the field container (the input itself takes `style`). */
  containerStyle?: CSSProperties;
  containerRef?: Ref<HTMLLabelElement>;
  /** Field grows with wrapped leading content. */
  wrap?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export function Input({ size = "md", icon, prepend, append, trailing, leading, mono, wrap, containerStyle, containerRef, className, id, ...rest }: InputProps) {
  // Explicit association: without htmlFor the label would control its first labelable descendant,
  // which in a token input is the first token's remove button.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label
      ref={containerRef}
      style={containerStyle}
      htmlFor={inputId}
      className={cx("input", size !== "md" && `input--${size}`, mono && "input--mono", wrap && "input--wrap", className)}
    >
      {prepend && <span className="input__addon input__addon--prepend">{prepend}</span>}
      {icon && <Icon name={icon} className="input__icon" />}
      {leading}
      <input id={inputId} className="input__control" {...rest} />
      {trailing}
      {append && <span className="input__addon input__addon--append">{append}</span>}
    </label>
  );
}

export type FieldProps = {
  label?: string;
  hint?: string;
  error?: boolean;
  children: ReactNode;
};

/** Label + control + hint wrapper. */
export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className={cx("field", error && "field--error")}>
      {label && <span className="field__label">{label}</span>}
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  );
}
