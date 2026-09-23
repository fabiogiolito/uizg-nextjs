"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { IconName } from "./Icon";

export type Option = {
  value: string;
  label: string;
  description?: ReactNode;
  icon?: IconName;
  disabled?: boolean;
};

export type SuggestionSource = {
  /** Fixed list, filtered by label as the user types. */
  options?: Option[];
  /** Async source, called with the query after a short debounce. Replaces `options` results. */
  loadOptions?: (query: string) => Promise<Option[]>;
  /** Show suggestions as soon as the input is focused, even with an empty query. */
  openOnFocus?: boolean;
  /** Offer a "Create …" item for a query that matches nothing. */
  allowCreate?: boolean;
  /** Minimum query length before async loading starts. */
  minQuery?: number;
};

const supportsAnchor = typeof CSS !== "undefined" && CSS.supports("anchor-name", "--a");

/** Shared state for Autocomplete and TokenInput: query, filtered or loaded results, loading, open, active item. */
export function useSuggestions({ options, loadOptions, openOnFocus, allowCreate, minQuery = 1 }: SuggestionSource) {
  const [query, setQueryState] = useState("");
  const [open, setOpen] = useState(false);
  // Async results are stored with the query they answer, so "loading" is derived: the current query has no answer yet.
  const [loaded, setLoaded] = useState<{ query: string; options: Option[] } | null>(null);
  const [activeState, setActive] = useState(0);
  const requestRef = useRef(0);

  const setQuery = (q: string) => {
    setQueryState(q);
    setActive(0);
  };

  const wantsLoad = !!loadOptions && open && query.length >= minQuery;
  const loading = wantsLoad && loaded?.query !== query;

  // Debounced fetch; state is only set inside the async callback, and stale responses are ignored.
  useEffect(() => {
    if (!wantsLoad || !loading) return;
    const id = ++requestRef.current;
    const t = setTimeout(() => {
      loadOptions!(query).then((result) => {
        if (requestRef.current === id) setLoaded({ query, options: result });
      });
    }, 200);
    return () => clearTimeout(t);
  }, [wantsLoad, loading, query, loadOptions]);

  const q = query.trim().toLowerCase();
  const results = loadOptions
    ? (query.length >= minQuery && loaded?.query === query ? loaded.options : [])
    : (options ?? []).filter((o) => !q || o.label.toLowerCase().includes(q));
  const exact = results.some((o) => o.label.toLowerCase() === q);
  const canCreate = !!allowCreate && q.length > 0 && !exact;
  const count = results.length + (canCreate ? 1 : 0);
  const active = count ? Math.min(activeState, count - 1) : 0;
  const shouldShow = open && (q.length > 0 || openOnFocus || loading) && (count > 0 || loading || q.length > 0);

  return {
    query, setQuery, open, setOpen, loading, results, canCreate, count, active, setActive, shouldShow,
    move: (delta: number) => setActive(count ? (active + delta + count) % count : 0),
  };
}

/** Anchors a popover menu to an element with CSS anchor positioning, measuring as a fallback. */
export function useAnchoredMenu(open: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const id = useId();
  const anchorName = `--anchor-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  const menuRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState<CSSProperties>();

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!open || !el) return;
    if (!el.matches(":popover-open")) el.showPopover();
    if (supportsAnchor) return;
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const height = el.getBoundingClientRect().height;
    const below = rect.bottom + 4 + height <= window.innerHeight;
    setFallback({ left: rect.left, width: rect.width, top: below ? rect.bottom + 4 : rect.top - 4 - height });
  }, [open, anchorRef]);

  return {
    menuRef,
    anchorStyle: { anchorName } as CSSProperties,
    menuStyle: { ...fallback, positionAnchor: anchorName } as CSSProperties,
  };
}
