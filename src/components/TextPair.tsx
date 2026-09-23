import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";

export type TextPairProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Controls the type scale of both lines. */
  size?: "sm" | "md" | "lg" | "title";
  align?: "start" | "center";
  /** Tag used for the title, defaults to a paragraph so it fits anywhere. */
  titleAs?: ElementType;
  className?: string;
};

/** Title + description with a tighter gap than regular stack spacing. */
export function TextPair({ title, description, size = "md", align = "start", titleAs, className }: TextPairProps) {
  const Title = titleAs ?? "p";
  return (
    <div
      className={cx("text-pair", size !== "md" && `text-pair--${size}`, align === "center" && "text-pair--center", className)}
    >
      <Title className="text-pair__title">{title}</Title>
      {description && <p className="text-pair__description">{description}</p>}
    </div>
  );
}
