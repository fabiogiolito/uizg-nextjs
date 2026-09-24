"use client";

import { createContext, useContext, useState, type CSSProperties, type DragEvent, type ReactNode } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import { Card } from "./Card";
import { Icon, type IconName } from "./Icon";
import { TextPair } from "./TextPair";

type Drag = { id: string; from: string } | null;
const BoardContext = createContext<{ drag: Drag; setDrag: (d: Drag) => void; onMove?: BoardProps["onMove"]; draggable: boolean; focus: string | null }>({ drag: null, setDrag: () => {}, draggable: true, focus: null });

export type BoardProps = {
  /** Called when an item is dropped on another column. */
  onMove?: (itemId: string, from: string, to: string) => void;
  /** Whether items can be dragged between columns. Items can override this. */
  draggable?: boolean;
  /** Show only this column; the others animate away. Null shows all. */
  focus?: string | null;
  /** Cap on the focused column's width, so it does not stretch across a wide board. Any CSS length or px. */
  focusWidth?: number | string;
  className?: string;
  /** BoardColumn children. */
  children: ReactNode;
};

/** A row of columns that fills its container's height. Items drag between columns; the board reports the move. */
export function Board({ onMove, draggable = true, focus = null, focusWidth, className, children }: BoardProps) {
  const [drag, setDrag] = useState<Drag>(null);
  return (
    <BoardContext.Provider value={{ drag, setDrag, onMove, draggable, focus }}>
      <div className={cx("board", focus && "board--focused", className)} style={focusWidth !== undefined ? ({ "--board-focus-width": typeof focusWidth === "number" ? `${focusWidth}px` : focusWidth } as CSSProperties) : undefined}>
        {children}
      </div>
    </BoardContext.Provider>
  );
}

export type BoardColumnProps = {
  id: string;
  title: ReactNode;
  icon?: IconName;
  count?: number;
  /** Shown at the top right on hover, e.g. a Dropdown "more" menu. */
  actions?: ReactNode;
  /** Extra content under the title row, still fixed above the scrolling body. */
  header?: ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  /** BoardItems, directly or grouped in ListSections (inside a List). Either way they are 4px apart. */
  children?: ReactNode;
};

/** A card column with a fixed header and a scrolling body. Collapses to a narrow rail that still accepts drops. */
export function BoardColumn({ id, title, icon, count, actions, header, collapsible, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, className, children }: BoardColumnProps) {
  const { drag, setDrag, onMove, focus } = useContext(BoardContext);
  const hidden = focus !== null && focus !== id;
  // The focused column is the only one on screen; collapsing it would leave nothing.
  const focused = focus === id;
  const [collapsedState, setCollapsedState] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? collapsedState;
  const [over, setOver] = useState(false);
  const setCollapsed = (v: boolean) => {
    setCollapsedState(v);
    onCollapsedChange?.(v);
  };
  const canDrop = !!drag && drag.from !== id;
  const dropProps = {
    onDragOver: (e: DragEvent) => {
      if (!canDrop) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (!over) setOver(true);
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setOver(false);
      if (drag && drag.from !== id) onMove?.(drag.id, drag.from, id);
      setDrag(null);
    },
  };

  if (collapsed && !focused) {
    return (
      <Card
        className={cx("board__column", "board__column--collapsed", hidden && "board__column--hidden", over && "board__column--over", className)}
        inert={hidden}
        data-board-column={id}
        role="button"
        tabIndex={0}
        aria-label={`Expand ${typeof title === "string" ? title : "column"}`}
        onClick={() => setCollapsed(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setCollapsed(false);
        }}
        {...dropProps}
      >
        {icon && <Icon name={icon} className="board__column-icon" />}
        {count !== undefined && <span className="board__column-count">{count}</span>}
        <span className="board__column-title board__column-title--vertical">{title}</span>
      </Card>
    );
  }

  return (
    <Card sections data-board-column={id} className={cx("board__column", hidden && "board__column--hidden", over && "board__column--over", className)} inert={hidden} {...dropProps}>
      <Card className="board__column-header">
        <div className="board__column-row">
          {icon && <Icon name={icon} className="board__column-icon" />}
          <span className="board__column-title">{title}</span>
          {count !== undefined && <span className="board__column-count">{count}</span>}
          <div className="board__column-actions">
            {actions}
            {collapsible && !focused && <Button size="sm" variant="ghost" icon="chevronsLeft" aria-label="Collapse column" onClick={() => setCollapsed(true)} />}
          </div>
        </div>
        {header}
      </Card>
      <Card grow className="board__column-body">{children}</Card>
    </Card>
  );
}

export type BoardItemProps = {
  id: string;
  /** Element before the text, usually an Avatar. */
  leading?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  /** End of the row, e.g. an age or a small avatar. */
  trailing?: ReactNode;
  /** Italic line under the row, e.g. the last note. */
  note?: ReactNode;
  /** Colored bar on the left, for items that need attention. */
  accent?: boolean;
  selected?: boolean;
  /** Opens the item, e.g. a detail pane. Also makes the row keyboard focusable. */
  onClick?: () => void;
  /** Override the Board's draggable setting for this item. */
  draggable?: boolean;
  className?: string;
};

/** A draggable row in a column: leading element, title and description, trailing meta, and an optional note. */
export function BoardItem({ id, leading, label, description, trailing, note, accent, selected, onClick, draggable: draggableProp, className }: BoardItemProps) {
  const { drag, setDrag, draggable: boardDraggable } = useContext(BoardContext);
  const draggable = draggableProp ?? boardDraggable;
  // The column this item lives in is read from the DOM on drag start, so items need no column prop.
  return (
    <div
      className={cx("board__item", accent && "board__item--accent", selected && "board__item--selected", onClick && "board__item--clickable", drag?.id === id && "board__item--dragging", draggable && "board__item--draggable", className)}
      draggable={draggable}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      onDragStart={(e) => {
        if (!draggable) return e.preventDefault();
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
        const from = (e.currentTarget.closest("[data-board-column]") as HTMLElement | null)?.dataset.boardColumn ?? "";
        setDrag({ id, from });
      }}
      onDragEnd={() => setDrag(null)}
    >
      <div className="board__item-row">
        {leading}
        <TextPair title={label} description={description} className="board__item-text" />
        {trailing && <div className="board__item-trailing">{trailing}</div>}
      </div>
      {note && <div className="board__note">{note}</div>}
    </div>
  );
}
