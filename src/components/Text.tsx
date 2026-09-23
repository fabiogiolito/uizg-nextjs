import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";

export type TextProps = {
  as?: ElementType;
  size?: "display" | "title" | "lg" | "body" | "sm" | "label";
  tone?: "default" | "muted" | "subtle";
  mono?: boolean;
  relaxed?: boolean;
  weight?: "regular" | "medium" | "bold";
  className?: string;
  children: ReactNode;
};

const defaultTag: Record<NonNullable<TextProps["size"]>, ElementType> = {
  display: "h1",
  title: "h2",
  lg: "p",
  body: "p",
  sm: "p",
  label: "span",
};

export function Text({
  as,
  size = "body",
  tone = "default",
  mono,
  relaxed,
  weight,
  className,
  children,
}: TextProps) {
  const Tag = as ?? defaultTag[size];
  return (
    <Tag
      className={cx(
        "text",
        `text--${size}`,
        tone !== "default" && `text--${tone}`,
        mono && "text--mono",
        relaxed && "text--relaxed",
        weight && weight !== "regular" && `text--${weight}`,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
