"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx";
import { SuggestionMenu } from "./Autocomplete";
import { Input, type InputProps } from "./Input";
import { Token, type TokenProps } from "./Token";
import { useAnchoredMenu, useSuggestions, type Option, type SuggestionSource } from "./useSuggestions";

export type TokenItem = Option & {
  /** Free-form data attached by token menus, e.g. { required: true }. */
  meta?: Record<string, unknown>;
};

export type TokenRenderHelpers = {
  remove: () => void;
  /** Merge changes into the token's meta. */
  update: (meta: Record<string, unknown>) => void;
  dragProps: Record<string, unknown>;
  dragging: boolean;
};

export type TokenInputProps = SuggestionSource &
  Omit<InputProps, "value" | "defaultValue" | "onChange" | "onSelect"> & {
    value?: TokenItem[];
    defaultValue?: TokenItem[];
    onChange?: (items: TokenItem[]) => void;
    onCreate?: (query: string) => TokenItem | void;
    createLabel?: (query: string) => ReactNode;
    /** Look of the default token. Ignored when `renderToken` is given. */
    tokenVariant?: TokenProps["variant"];
    /** Menu content for each token's chevron dropdown. */
    tokenMenu?: (item: TokenItem, helpers: TokenRenderHelpers) => ReactNode;
    /** Full control over how a token looks. */
    renderToken?: (item: TokenItem, helpers: TokenRenderHelpers) => ReactNode;
    /** Drag tokens to reorder. */
    sortable?: boolean;
    emptyText?: ReactNode;
  };

/** Input that collects several options as tokens. */
export function TokenInput({
  options,
  loadOptions,
  openOnFocus,
  allowCreate,
  minQuery,
  value,
  defaultValue,
  onChange,
  onCreate,
  createLabel,
  tokenVariant = "badge",
  tokenMenu,
  renderToken,
  sortable,
  emptyText,
  className,
  size,
  ...inputProps
}: TokenInputProps) {
  const [internal, setInternal] = useState<TokenItem[]>(defaultValue ?? []);
  const items = value ?? internal;
  const setItems = (next: TokenItem[]) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  const s = useSuggestions({ options, loadOptions, openOnFocus, allowCreate, minQuery });
  const anchorRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { menuRef, anchorStyle, menuStyle } = useAnchoredMenu(s.shouldShow, anchorRef);
  const [drag, setDrag] = useState<{ from: number; over: number | null } | null>(null);

  const has = (o: Option) => items.some((i) => i.value === o.value);
  const toggle = (o: Option) => {
    if (o.disabled) return;
    setItems(has(o) ? items.filter((i) => i.value !== o.value) : [...items, o]);
    s.setQuery("");
    inputRef.current?.focus();
  };
  const create = (q: string) => {
    const created = onCreate?.(q) ?? { value: q, label: q };
    if (!has(created)) setItems([...items, created]);
    s.setQuery("");
  };
  const removeAt = (i: number) => setItems(items.filter((_, j) => j !== i));
  const updateAt = (i: number, meta: Record<string, unknown>) =>
    setItems(items.map((item, j) => (j === i ? { ...item, meta: { ...item.meta, ...meta } } : item)));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !s.query && items.length) {
      removeAt(items.length - 1);
      return;
    }
    if (!s.shouldShow) {
      if (e.key === "ArrowDown") s.setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); s.move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); s.move(-1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (s.active < s.results.length) toggle(s.results[s.active]);
      else if (s.canCreate) create(s.query);
    } else if (e.key === "Escape") s.setOpen(false);
  };

  const dragPropsFor = (i: number): Record<string, unknown> =>
    sortable
      ? {
          draggable: true,
          onDragStart: (e: React.DragEvent) => {
            e.dataTransfer.effectAllowed = "move";
            setDrag({ from: i, over: null });
          },
          onDragOver: (e: React.DragEvent) => {
            if (!drag) return;
            e.preventDefault();
            if (drag.over !== i) setDrag({ ...drag, over: i });
          },
          onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            if (drag && drag.from !== i) {
              const next = [...items];
              const [moved] = next.splice(drag.from, 1);
              next.splice(i, 0, moved);
              setItems(next);
            }
            setDrag(null);
          },
          onDragEnd: () => setDrag(null),
        }
      : {};

  const tokens = items.map((item, i) => {
    const helpers: TokenRenderHelpers = {
      remove: () => removeAt(i),
      update: (meta) => updateAt(i, meta),
      dragProps: dragPropsFor(i),
      dragging: drag?.from === i,
    };
    // Dragging forward drops after the target, backward drops before it; the indicator shows which side.
    const dropClass = drag && drag.over === i && drag.from !== i ? (drag.from < i ? "token--drop-after" : "token--drop-before") : undefined;
    if (renderToken) {
      return (
        <span key={item.value} className={cx("token-input__slot", dropClass)} {...helpers.dragProps}>
          {renderToken(item, helpers)}
        </span>
      );
    }
    return (
      <Token
        key={item.value}
        label={item.label}
        icon={item.icon}
        meta={item.meta?.required ? "required" : undefined}
        variant={tokenVariant}
        size={size === "lg" ? "md" : "sm"}
        onRemove={helpers.remove}
        menu={tokenMenu?.(item, helpers)}
        draggable={sortable}
        dragging={helpers.dragging}
        className={dropClass}
        {...helpers.dragProps}
      />
    );
  });

  return (
    <div className={cx("autocomplete", "token-input", className)}>
      <Input
        {...inputProps}
        ref={inputRef}
        size={size}
        wrap
        containerRef={anchorRef}
        containerStyle={anchorStyle}
        leading={tokens.length ? <span className="token-input__tokens">{tokens}</span> : undefined}
        role="combobox"
        aria-expanded={s.shouldShow}
        aria-autocomplete="list"
        autoComplete="off"
        value={s.query}
        onChange={(e) => {
          s.setQuery(e.target.value);
          s.setOpen(true);
        }}
        onFocus={() => s.setOpen(true)}
        onBlur={() => s.setOpen(false)}
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
            isSelected={has}
            onPick={toggle}
            onCreate={create}
            onHover={s.setActive}
            emptyText={emptyText}
          />
        </div>
      )}
    </div>
  );
}
