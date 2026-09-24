"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { ContextMenu } from "./ContextMenu";
import { Dropdown } from "./Dropdown";
import { ListDivider, ListItem } from "./List";

export type Column<Row> = {
  key: string;
  header: ReactNode;
  /** Initial width in px. */
  width?: number;
  minWidth?: number;
  /** With `fill`, this column absorbs the extra width; its width then acts as a minimum. */
  flex?: boolean;
  align?: "start" | "center" | "end";
  /** Keep this column visible while the table scrolls horizontally. */
  sticky?: "left" | "right";
  /** Cells open an inline editor on click or Enter. */
  editable?: boolean;
  /**
   * Custom editor instead of the text input. Call `setValue` as the value changes; the table
   * commits when focus leaves the cell or Enter is pressed, and cancels on Escape.
   */
  editor?: (props: { row: Row; rowIndex: number; value: unknown; setValue: (value: unknown) => void; commit: () => void; cancel: () => void }) => ReactNode;
  mono?: boolean;
  /** Custom cell renderer. Defaults to the row value at `key`. */
  /** Custom cell content. With `rowAnchors`, the third argument carries the row's anchor name. */
  render?: (row: Row, rowIndex: number, ctx: { anchor?: string }) => ReactNode;
  /** Value used for sorting. Defaults to the row value at `key`. */
  sortValue?: (row: Row) => string | number;
  /** Hide the header menu for this column. */
  noMenu?: boolean;
  /** Right-click menu for cells in this column. `edit` opens the inline editor when the column is editable. */
  contextMenu?: (row: Row, rowIndex: number, actions: { edit: () => void }) => ReactNode;
};

export type TableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string;
  /** Called when an editable cell is committed, with the index in the original `rows`. */
  onCellChange?: (rowIndex: number, key: string, value: unknown) => void;
  /** Called after a reorder, resize, hide or rename, with the visible columns in order. */
  onColumnsChange?: (columns: { key: string; width: number; hidden: boolean; label?: string }[]) => void;
  reorderable?: boolean;
  resizable?: boolean;
  /** Stretch to the container width; the `flex` column (or the last non-sticky one) takes the extra space. */
  fill?: boolean;
  /** Give each row an anchor-name (--table-row-<key>) that cells can hand to a HoverCard, so a panel aligns to the whole row. */
  rowAnchors?: boolean;
  /** Show the hover "more" menu on headers with sort, hide and rename. */
  columnMenu?: boolean;
  /** Footer cells by column key, rendered in a sticky tfoot. */
  footer?: Partial<Record<string, ReactNode>>;
  /** Enables vertical scrolling with a sticky header and footer. Any CSS length. */
  maxHeight?: string | number;
  /** Show a checkbox column. Shift-click selects a range, the header checkbox toggles all. */
  selectable?: boolean;
  /** Controlled selection, as row keys. */
  selected?: string[];
  defaultSelected?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** Borders around every cell. Text is clipped instead of truncated with an ellipsis. */
  bordered?: boolean;
  /** Less cell padding. */
  compact?: boolean;
  className?: string;
};

/** Renders a column's custom editor. A component so the callbacks reach the editor as props. */
function CellEditor<Row>({ editor, ...props }: { editor: NonNullable<Column<Row>["editor"]> } & Parameters<NonNullable<Column<Row>["editor"]>>[0]) {
  return <>{editor(props)}</>;
}

const DEFAULT_WIDTH = 160;
const DEFAULT_MIN_WIDTH = 64;

type ColumnState = { key: string; width: number; hidden: boolean; label?: string };
type Editing = { row: number; key: string; value: unknown } | null;
type Sort = { key: string; dir: "asc" | "desc" } | null;

export function Table<Row extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  onCellChange,
  onColumnsChange,
  reorderable,
  resizable,
  fill,
  rowAnchors,
  columnMenu,
  footer,
  maxHeight,
  selectable,
  selected,
  defaultSelected,
  onSelectionChange,
  bordered,
  compact,
  className,
}: TableProps<Row>) {
  const [state, setState] = useState<ColumnState[]>(() =>
    columns.map((c) => ({ key: c.key, width: c.width ?? DEFAULT_WIDTH, hidden: false })),
  );
  const [editing, setEditing] = useState<Editing>(null);
  // Mirror of the editing state for commit handlers created before the last keystroke (blur after typing).
  const editingRef = useRef<Editing>(null);
  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);
  const [renaming, setRenaming] = useState<{ key: string; value: string } | null>(null);
  const [sort, setSort] = useState<Sort>(null);
  const [drag, setDrag] = useState<{ from: number; over: number | null } | null>(null);
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelected ?? []);
  const selectedKeys = useMemo(() => new Set(selected ?? internalSelected), [selected, internalSelected]);
  const lastClickedRef = useRef<number | null>(null);

  const byKey = useMemo(() => Object.fromEntries(columns.map((c) => [c.key, c])), [columns]);
  // Reconcile stored state with the current column set: drop removed columns, append new ones.
  const reconcile = useCallback(
    (prev: ColumnState[]): ColumnState[] => [
      ...prev.filter((s) => byKey[s.key]),
      ...columns
        .filter((c) => !prev.some((s) => s.key === c.key))
        .map((c) => ({ key: c.key, width: c.width ?? DEFAULT_WIDTH, hidden: false })),
    ],
    [byKey, columns],
  );
  const current = useMemo(() => reconcile(state), [state, reconcile]);
  const visible = useMemo(() => current.filter((s) => !s.hidden), [current]);
  const ordered = useMemo(() => visible.map((s) => ({ ...byKey[s.key], width: s.width, label: s.label })), [visible, byKey]);
  const hiddenCount = current.length - visible.length;

  const commitColumns = useCallback(
    (update: (prev: ColumnState[]) => ColumnState[]) => {
      setState((prev) => {
        const next = update(reconcile(prev));
        onColumnsChange?.(next);
        return next;
      });
    },
    [onColumnsChange, reconcile],
  );

  /* Sorted view keeps the original index so edits map back to `rows`. */
  const view = useMemo(() => {
    const indexed = rows.map((row, index) => ({ row, index }));
    if (!sort) return indexed;
    const col = byKey[sort.key];
    const value = (r: Row) => col?.sortValue?.(r) ?? (r[sort.key] as string | number | undefined) ?? "";
    const dir = sort.dir === "asc" ? 1 : -1;
    return indexed.sort((a, b) => {
      const va = value(a.row);
      const vb = value(b.row);
      return (typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))) * dir;
    });
  }, [rows, sort, byKey]);

  /* ---- Selection ---- */
  const setSelection = (keys: Set<string>) => {
    const list = [...keys];
    if (selected === undefined) setInternalSelected(list);
    onSelectionChange?.(list);
  };
  const allKeys = useMemo(() => rows.map((r, i) => rowKey(r, i)), [rows, rowKey]);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));
  const someSelected = !allSelected && allKeys.some((k) => selectedKeys.has(k));
  /** `viewIndex` is the position in the sorted view, so shift ranges follow what the user sees. */
  const toggleRow = (viewIndex: number, shift: boolean) => {
    const next = new Set(selectedKeys);
    const key = rowKey(view[viewIndex].row, view[viewIndex].index);
    const checked = !next.has(key);
    const from = shift && lastClickedRef.current !== null ? lastClickedRef.current : viewIndex;
    const [a, b] = from < viewIndex ? [from, viewIndex] : [viewIndex, from];
    for (let i = a; i <= b; i++) {
      const k = rowKey(view[i].row, view[i].index);
      if (checked) next.add(k);
      else next.delete(k);
    }
    lastClickedRef.current = viewIndex;
    setSelection(next);
  };
  const toggleAll = () => setSelection(allSelected ? new Set() : new Set(allKeys));
  const selectStickyLeft = selectable && ordered[0]?.sticky === "left";
  const selectWidth = 40;

  /* Sticky offsets: each sticky column is offset by the widths of the sticky columns before it. */
  const offsets = useMemo(() => {
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};
    let acc = selectStickyLeft ? selectWidth : 0;
    for (const c of ordered) if (c.sticky === "left") { left[c.key] = acc; acc += c.width; }
    acc = 0;
    for (const c of [...ordered].reverse()) if (c.sticky === "right") { right[c.key] = acc; acc += c.width; }
    return { left, right };
  }, [ordered, selectStickyLeft]);
  const lastLeft = [...ordered].reverse().find((c) => c.sticky === "left")?.key ?? (selectStickyLeft ? "__select" : undefined);
  const firstRight = ordered.find((c) => c.sticky === "right")?.key;

  /* ---- Resize ---- */
  const resizeRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const onResizeStart = (key: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { key, startX: e.clientX, startWidth: current.find((c) => c.key === key)!.width };
    const move = (ev: PointerEvent) => {
      const r = resizeRef.current;
      if (!r) return;
      const min = byKey[r.key].minWidth ?? DEFAULT_MIN_WIDTH;
      const width = Math.max(min, r.startWidth + ev.clientX - r.startX);
      setState((prev) => reconcile(prev).map((c) => (c.key === r.key ? { ...c, width } : c)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      resizeRef.current = null;
      commitColumns((prev) => prev);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  /* ---- Reorder (native drag and drop on header cells, indexes are into `visible`) ---- */
  const onDrop = (to: number) => {
    if (!drag || drag.from === to) return setDrag(null);
    const fromKey = visible[drag.from].key;
    const toKey = visible[to].key;
    commitColumns((prev) => {
      const next = [...prev];
      const [moved] = next.splice(next.findIndex((c) => c.key === fromKey), 1);
      next.splice(next.findIndex((c) => c.key === toKey) + (drag.from < to ? 1 : 0), 0, moved);
      return next;
    });
    setDrag(null);
  };

  /* ---- Editing ---- */
  const startEdit = (rowIndex: number, col: Column<Row>) => {
    if (!col.editable || (editing?.row === rowIndex && editing.key === col.key)) return;
    const raw = rows[rowIndex][col.key];
    setEditing({ row: rowIndex, key: col.key, value: col.editor ? raw : String(raw ?? "") });
  };
  const setEditValue = (value: unknown) => {
    const prev = editingRef.current;
    if (prev) setEditing({ ...prev, value });
  };
  const cancelEdit = () => setEditing(null);
  const commitEdit = () => {
    const e = editingRef.current;
    if (!e) return;
    onCellChange?.(e.row, e.key, e.value);
    setEditing(null);
  };
  const onCellKey = (e: KeyboardEvent<HTMLTableCellElement>, rowIndex: number, col: Column<Row>) => {
    if (e.key === "Enter" && col.editable && !editing) {
      e.preventDefault();
      startEdit(rowIndex, col);
    }
  };

  /* ---- Column menu actions ---- */
  const hide = (key: string) => commitColumns((prev) => prev.map((c) => (c.key === key ? { ...c, hidden: true } : c)));
  const showAll = () => commitColumns((prev) => prev.map((c) => ({ ...c, hidden: false })));
  const commitRename = () => {
    if (!renaming) return;
    const label = renaming.value.trim();
    commitColumns((prev) => prev.map((c) => (c.key === renaming.key ? { ...c, label: label || undefined } : c)));
    setRenaming(null);
  };

  const cellStyle = (c: Column<Row>): CSSProperties | undefined => {
    if (c.sticky === "left") return { left: offsets.left[c.key] };
    if (c.sticky === "right") return { right: offsets.right[c.key] };
    return undefined;
  };
  const cellClass = (c: Column<Row>, base: string) =>
    cx(
      base,
      c.align && c.align !== "start" && `${base}--${c.align}`,
      c.mono && `${base}--mono`,
      c.sticky && `${base}--sticky ${base}--sticky-${c.sticky}`,
      c.key === lastLeft && `${base}--sticky-edge-left`,
      c.key === firstRight && `${base}--sticky-edge-right`,
    );

  const totalWidth = ordered.reduce((w, c) => w + c.width, 0) + (selectable ? selectWidth : 0);
  // Fill: the table is as wide as its wrapper (never narrower than its columns) and one column has no fixed width.
  const flexKey = fill ? (ordered.find((c) => c.flex) ?? [...ordered].reverse().find((c) => !c.sticky) ?? ordered[ordered.length - 1])?.key : undefined;
  const selectClass = (base: string) =>
    cx(base, `${base}--select`, selectStickyLeft && `${base}--sticky ${base}--sticky-left`, lastLeft === "__select" && `${base}--sticky-edge-left`);
  const selectStyle = selectStickyLeft ? { left: 0 } : undefined;

  return (
    <div
      className={cx("table-wrap", maxHeight !== undefined && "table-wrap--scroll", className)}
      style={maxHeight !== undefined ? { maxHeight } : undefined}
    >
      <table
        className={cx("table", "table--fixed", bordered && "table--bordered", compact && "table--compact")}
        style={fill ? { width: "100%", minWidth: totalWidth } : { width: totalWidth }}
      >
        <colgroup>
          {selectable && <col style={{ width: selectWidth }} />}
          {ordered.map((c) => (
            <col key={c.key} style={c.key === flexKey ? undefined : { width: c.width }} />
          ))}
        </colgroup>
        <thead className="table__head">
          <tr>
            {selectable && (
              <th className={selectClass("table__head-cell")} style={selectStyle}>
                <Checkbox size="sm" checked={allSelected} indeterminate={someSelected} onChange={toggleAll} aria-label="Select all rows" />
              </th>
            )}
            {ordered.map((c, i) => {
              const isRenaming = renaming?.key === c.key;
              const sorted = sort?.key === c.key ? sort.dir : null;
              return (
                <th
                  key={c.key}
                  className={cx(
                    cellClass(c, "table__head-cell"),
                    reorderable && "table__head-cell--draggable",
                    drag?.over === i && drag.from !== i && (drag.from < i ? "table__head-cell--drop-after" : "table__head-cell--drop-before"),
                    drag?.from === i && "table__head-cell--dragging",
                  )}
                  style={cellStyle(c)}
                  aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : undefined}
                  draggable={reorderable && !isRenaming}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    setDrag({ from: i, over: null });
                  }}
                  onDragOver={(e) => {
                    if (!drag) return;
                    e.preventDefault();
                    if (drag.over !== i) setDrag({ ...drag, over: i });
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDrop(i);
                  }}
                  onDragEnd={() => setDrag(null)}
                >
                  <div className="table__head-inner">
                    {isRenaming ? (
                      <input
                        className="table__editor table__editor--header"
                        autoFocus
                        value={renaming.value}
                        onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setRenaming(null);
                        }}
                      />
                    ) : (
                      <span className="table__head-label">{c.label ?? c.header}</span>
                    )}
                    {sorted && <Button size="sm" variant="ghost" icon={sorted === "asc" ? "arrowUp" : "arrowDown"} className="table__head-sort" aria-label="Sorted" onClick={() => setSort(null)} />}
                    {columnMenu && !c.noMenu && !isRenaming && (
                      <Dropdown size="sm" variant="ghost" icon="moreVertical" hideChevron triggerLabel="Column options" align={c.sticky === "right" ? "right" : "left"} className="table__head-menu">
                        <ListItem icon="arrowUp" label="Sort ascending" selected={sorted === "asc"} onClick={() => setSort({ key: c.key, dir: "asc" })} />
                        <ListItem icon="arrowDown" label="Sort descending" selected={sorted === "desc"} onClick={() => setSort({ key: c.key, dir: "desc" })} />
                        <ListDivider />
                        <ListItem icon="edit" label="Rename" onClick={() => setRenaming({ key: c.key, value: typeof (c.label ?? c.header) === "string" ? String(c.label ?? c.header) : "" })} />
                        <ListItem icon="eyeOff" label="Hide column" onClick={() => hide(c.key)} />
                        {hiddenCount > 0 && <ListItem icon="eye" label={`Show ${hiddenCount} hidden`} onClick={showAll} />}
                      </Dropdown>
                    )}
                  </div>
                  {resizable && (
                    <span
                      className="table__resizer"
                      onPointerDown={(e) => onResizeStart(c.key, e)}
                      onDoubleClick={() => commitColumns((prev) => prev.map((s) => (s.key === c.key ? { ...s, width: byKey[s.key].width ?? DEFAULT_WIDTH } : s)))}
                      aria-hidden
                    />
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {view.map(({ row, index }, viewIndex) => {
            const key = rowKey(row, index);
            const isSelected = selectedKeys.has(key);
            // Anchor names are dashed-idents: anything outside [A-Za-z0-9_-] becomes a dash.
            const anchor = rowAnchors ? `--table-row-${key.replace(/[^A-Za-z0-9_-]/g, "-")}` : undefined;
            return (
            <tr key={key} className={cx("table__row", isSelected && "table__row--selected")} aria-selected={selectable ? isSelected : undefined} style={anchor ? ({ anchorName: anchor } as CSSProperties) : undefined}>
              {selectable && (
                <td className={selectClass("table__cell")} style={selectStyle}>
                  <Checkbox
                    size="sm"
                    checked={isSelected}
                    onChange={(e) => toggleRow(viewIndex, (e.nativeEvent as MouseEvent).shiftKey)}
                    // Shift-click would otherwise extend a text selection across the rows.
                    onMouseDown={(e) => e.shiftKey && e.preventDefault()}
                    aria-label="Select row"
                  />
                </td>
              )}
              {ordered.map((c) => {
                const isEditing = editing?.row === index && editing.key === c.key;
                const cell = (trigger?: { onContextMenu: (e: React.MouseEvent) => void }) => (
                  <td
                    key={c.key}
                    className={cx(cellClass(c, "table__cell"), c.editable && "table__cell--editable", isEditing && "table__cell--editing")}
                    style={cellStyle(c)}
                    tabIndex={c.editable ? 0 : undefined}
                    onClick={() => startEdit(index, c)}
                    onKeyDown={(e) => onCellKey(e, index, c)}
                    {...trigger}
                  >
                    {isEditing && c.editor ? (
                      <div
                        className="table__editor-custom"
                        onBlur={(e) => {
                          // Commit when focus leaves the cell entirely (popovers keep focus on the input).
                          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) commitEdit();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") { e.stopPropagation(); setEditing(null); }
                        }}
                      >
                        <CellEditor
                          editor={c.editor}
                          row={row}
                          rowIndex={index}
                          value={editing.value}
                          setValue={setEditValue}
                          commit={commitEdit}
                          cancel={cancelEdit}
                        />
                      </div>
                    ) : isEditing ? (
                      <input
                        className="table__editor"
                        autoFocus
                        value={String(editing.value ?? "")}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit();
                          if (e.key === "Escape") setEditing(null);
                        }}
                      />
                    ) : (
                      <span className="table__value">{c.render ? c.render(row, index, { anchor }) : String(row[c.key] ?? "")}</span>
                    )}
                  </td>
                );
                return c.contextMenu ? (
                  <ContextMenu key={c.key} menu={c.contextMenu(row, index, { edit: () => startEdit(index, c) })}>
                    {(trigger) => cell(trigger)}
                  </ContextMenu>
                ) : (
                  cell()
                );
              })}
            </tr>
            );
          })}
        </tbody>
        {footer && (
          <tfoot className="table__foot">
            <tr>
              {selectable && <td className={selectClass("table__foot-cell")} style={selectStyle} />}
              {ordered.map((c) => (
                <td key={c.key} className={cellClass(c, "table__foot-cell")} style={cellStyle(c)}>
                  {footer[c.key]}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
