import { useId, type Ref, type TextareaHTMLAttributes } from "react";
import { cx } from "./cx";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> & {
  size?: "sm" | "md" | "lg";
  /** Minimum visible lines. */
  rows?: number;
  /** Stops growing here and scrolls. Any CSS length. */
  maxHeight?: string | number;
  mono?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
};

/** Multi-line Input: the same field frame, growing with content from `rows` up to `maxHeight`. */
export function Textarea({ size = "md", rows = 3, maxHeight = 240, mono, className, id, style, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  return (
    <label htmlFor={textareaId} className={cx("input", "input--multiline", size !== "md" && `input--${size}`, mono && "input--mono", className)}>
      <textarea
        id={textareaId}
        className="input__control"
        rows={rows}
        style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight, ...style }}
        {...rest}
      />
    </label>
  );
}
