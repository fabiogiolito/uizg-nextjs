"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx";
import { Input, type InputProps } from "./Input";
import { List, ListItem } from "./List";
import { Text } from "./Text";
import { useAnchoredMenu, useSuggestions, type Option, type SuggestionSource } from "./useSuggestions";

export type SuggestionMenuProps = {
  results: Option[];
  active: number;
  loading: boolean;
  canCreate: boolean;
  query: string;
  /** Render a custom "create" row. */
  createLabel?: (query: string) => ReactNode;
  isSelected?: (option: Option) => boolean;
  onPick: (option: Option) => void;
  onCreate?: (query: string) => void;
  onHover: (index: number) => void;
  emptyText?: ReactNode;
};

/** The suggestion list shared by Autocomplete and TokenInput. */
export function SuggestionMenu({ results, active, loading, canCreate, query, createLabel, isSelected, onPick, onCreate, onHover, emptyText = "No results" }: SuggestionMenuProps) {
  return (
    <List role="listbox" className="autocomplete__list">
      {loading && results.length === 0 && (
        <Text size="sm" tone="subtle" className="autocomplete__status">Loading…</Text>
      )}
      {!loading && results.length === 0 && !canCreate && query && (
        <Text size="sm" tone="subtle" className="autocomplete__status">{emptyText}</Text>
      )}
      {results.map((o, i) => {
        const selected = isSelected?.(o) ?? false;
        return (
          <ListItem
            key={o.value}
            role="option"
            aria-selected={selected}
            icon={o.icon}
            label={o.label}
            description={o.description}
            disabled={o.disabled}
            selected={selected}
            trailing={selected ? "✓" : undefined}
            className={cx("autocomplete__option", i === active && "autocomplete__option--active")}
            onMouseEnter={() => onHover(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(o)}
          />
        );
      })}
      {canCreate && (
        <ListItem
          role="option"
          icon="plus"
          label={createLabel ? createLabel(query) : `Create “${query}”`}
          className={cx("autocomplete__option", "autocomplete__option--create", results.length === active && "autocomplete__option--active")}
          onMouseEnter={() => onHover(results.length)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCreate?.(query)}
        />
      )}
    </List>
  );
}

export type AutocompleteProps = SuggestionSource &
  Omit<InputProps, "value" | "defaultValue" | "onChange" | "onSelect"> & {
    /** Currently selected option (controlled). */
    value?: Option | null;
    /** Initial option when uncontrolled. */
    defaultValue?: Option | null;
    onChange?: (option: Option | null) => void;
    onCreate?: (query: string) => void;
    createLabel?: (query: string) => ReactNode;
    emptyText?: ReactNode;
  };

/** Text input with a suggestion list. Picks one option. */
export function Autocomplete({
  options,
  loadOptions,
  openOnFocus,
  allowCreate,
  minQuery,
  value: valueProp,
  defaultValue,
  onChange,
  onCreate,
  createLabel,
  emptyText,
  className,
  ...inputProps
}: AutocompleteProps) {
  const s = useSuggestions({ options, loadOptions, openOnFocus, allowCreate, minQuery });
  const [internal, setInternal] = useState<Option | null>(defaultValue ?? null);
  const value = valueProp !== undefined ? valueProp : internal;
  const change = (o: Option | null) => {
    if (valueProp === undefined) setInternal(o);
    onChange?.(o);
  };
  const anchorRef = useRef<HTMLLabelElement>(null);
  const { menuRef, anchorStyle, menuStyle } = useAnchoredMenu(s.shouldShow, anchorRef);
  // The visible text and the filter query are separate: focusing shows the current label but an
  // unfiltered list, so other options stay reachable. Typing filters.
  const [typed, setTyped] = useState<string | null>(null);
  const text = typed ?? value?.label ?? "";

  const pick = (o: Option) => {
    if (o.disabled) return;
    const same = o.value === value?.value;
    change(same ? null : o);
    setTyped(null);
    s.setQuery("");
    s.setOpen(false);
  };
  const create = (q: string) => {
    if (onCreate) onCreate(q);
    else change({ value: q, label: q });
    s.setOpen(false);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!s.shouldShow) {
      if (e.key === "ArrowDown") s.setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); s.move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); s.move(-1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (s.active < s.results.length) pick(s.results[s.active]);
      else if (s.canCreate) create(s.query);
    } else if (e.key === "Escape") s.setOpen(false);
  };

  return (
    <div className={cx("autocomplete", className)}>
      <Input
        {...inputProps}
        containerRef={anchorRef}
        containerStyle={anchorStyle}
        role="combobox"
        aria-expanded={s.shouldShow}
        aria-autocomplete="list"
        autoComplete="off"
        value={text}
        onChange={(e) => {
          setTyped(e.target.value);
          s.setQuery(e.target.value);
          s.setOpen(true);
        }}
        onFocus={() => {
          setTyped(null);
          s.setQuery("");
          s.setOpen(true);
        }}
        onBlur={() => {
          setTyped(null);
          s.setOpen(false);
        }}
        onKeyDown={onKeyDown}
      />
      {s.shouldShow && (
        <div ref={menuRef} popover="manual" className="dropdown__menu autocomplete__menu" style={menuStyle}>
          <SuggestionMenu
            results={s.results}
            active={s.active}
            loading={s.loading}
            canCreate={s.canCreate}
            query={s.query}
            createLabel={createLabel}
            isSelected={(o) => o.value === value?.value}
            onPick={pick}
            onCreate={create}
            onHover={s.setActive}
            emptyText={emptyText}
          />
        </div>
      )}
    </div>
  );
}
