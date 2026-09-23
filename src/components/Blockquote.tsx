import type { ReactNode } from "react";
import { cx } from "./cx";

export type BlockquoteProps = {
  /** Who said it, shown under the quote. */
  cite?: ReactNode;
  /** Source link for the citation. */
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
};

/** Quoted text with a left rule and an optional attribution. Works standalone or inside a message. */
export function Blockquote({ cite, href, size = "md", className, children }: BlockquoteProps) {
  return (
    <figure className={cx("blockquote", size !== "md" && `blockquote--${size}`, className)}>
      <blockquote className="blockquote__text" cite={href}>
        {children}
      </blockquote>
      {cite && (
        <figcaption className="blockquote__cite">
          {href ? (
            <a href={href} target="_blank" rel="noreferrer" className="blockquote__link">{cite}</a>
          ) : (
            cite
          )}
        </figcaption>
      )}
    </figure>
  );
}
