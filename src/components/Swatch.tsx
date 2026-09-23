import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";

export type SwatchProps = {
  /** Any CSS color. */
  color: string;
  /** Text shown over the color, defaults to the color itself. */
  label?: ReactNode;
  /** Secondary line, e.g. a token name. */
  name?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Color preview on a checkerboard with the code written over it. */
export function Swatch({ color, label, name, size = "md", className }: SwatchProps) {
  return (
    <div className={cx("swatch", size !== "md" && `swatch--${size}`, className)} style={{ "--swatch": color } as CSSProperties}>
      <div className="swatch__color">
        <span className="swatch__label">{label ?? color}</span>
      </div>
      {name && <div className="swatch__name">{name}</div>}
    </div>
  );
}
