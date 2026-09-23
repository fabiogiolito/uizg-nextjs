"use client";

import type { ReactNode } from "react";
import { cx } from "./cx";
import { Collapsible } from "./Collapsible";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";

export type CitationData = {
  title: string;
  /** Short source name shown after the title, e.g. "arxiv.org". */
  source?: string;
  url?: string;
};

/**
 * Inline citation marker. Numbered automatically with a CSS counter scoped to the surrounding
 * message, so the numbers follow reading order and match the list below.
 */
export function Cite({ title, url, className }: { title: string; url?: string; className?: string }) {
  const marker = <span className={cx("cite", className)} aria-label={`Citation: ${title}`} />;
  return (
    <Tooltip content={title} side="top">
      {url ? (
        <a className="cite__link" href={url} target="_blank" rel="noreferrer">
          {marker}
        </a>
      ) : (
        marker
      )}
    </Tooltip>
  );
}

export type CitationsProps = {
  items: CitationData[];
  defaultOpen?: boolean;
  /** Content shown inline with the toggle, on the same row, e.g. message actions. */
  trailing?: ReactNode;
  className?: string;
};

/** Collapsible numbered list of sources, shown below a message. */
export function Citations({ items, defaultOpen = false, trailing, className }: CitationsProps) {
  if (!items.length) return null;
  return (
    <Collapsible
      className={cx("citations", className)}
      defaultOpen={defaultOpen}
      trigger={({ open, triggerProps }) => (
        <div className="citations__row">
          <button type="button" className="citations__toggle" {...triggerProps}>
            {items.length} {items.length === 1 ? "citation" : "citations"}
            <Icon name="chevronDown" className={cx("citations__chevron", open && "citations__chevron--open")} />
          </button>
          {trailing}
        </div>
      )}
    >
      <ol className="citations__list">
        {items.map((c, i) => (
          <li key={i} className="citations__item">
            <span className="citations__number" aria-hidden />
            <span className="citations__text">
              {c.url ? (
                <a className="citations__title" href={c.url} target="_blank" rel="noreferrer">{c.title}</a>
              ) : (
                <span className="citations__title">{c.title}</span>
              )}
              {c.source && (
                <>
                  <span className="citations__separator" aria-hidden> · </span>
                  <span className="citations__source">{c.source}</span>
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </Collapsible>
  );
}
