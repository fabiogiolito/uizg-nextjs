"use client";

import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx";
import { Button, type ButtonProps } from "./Button";
import { Icon } from "./Icon";
import { List } from "./List";

const supportsAnchor = typeof CSS !== "undefined" && CSS.supports("anchor-name", "--a");

/** One shared container at the end of body for every menu, created on first use (client only). */
let portalRoot: HTMLElement | null = null;
function getPortalRoot() {
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.className = "dropdown-portal";
    document.body.appendChild(portalRoot);
  }
  return portalRoot;
}

/** Ids of the dropdowns enclosing this one, so a nested menu's portal counts as inside its parent. */
const ChainContext = createContext<string[]>([]);
const insideChain = (target: EventTarget | null, id: string) => {
  const el = target instanceof Element ? target.closest<HTMLElement>("[data-dropdown-chain]") : null;
  return !!el && el.dataset.dropdownChain!.split(" ").includes(id);
};

/** Renders a custom trigger; a component so the trigger props (including the ref) arrive as props. */
function TriggerSlot({ render, props, open }: { render: NonNullable<DropdownProps["trigger"]>; props: DropdownTriggerProps; open: boolean }) {
  return <>{render(props, open)}</>;
}

export type DropdownTriggerProps = {
  ref: Ref<HTMLButtonElement>;
  style: CSSProperties;
  onClick: (e: MouseEvent) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
};

export type DropdownProps = {
  /** Trigger button label. Omit for an icon-only trigger. */
  label?: ReactNode;
  icon?: ButtonProps["icon"];
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  size?: ButtonProps["size"];
  /** Hide the chevron on the trigger. */
  hideChevron?: boolean;
  /** Which edge of the trigger the menu aligns to. */
  align?: "left" | "right";
  /** Where the menu opens: below the trigger, above it, or beside it (for nested menus). */
  side?: "bottom" | "top" | "right";
  /** Also open while hovering the trigger or the menu. */
  openOnHover?: boolean;
  /** Accessible label for icon-only triggers. */
  triggerLabel?: string;
  /** Render your own trigger (e.g. a ListItem) with the props spread onto it. */
  trigger?: (props: DropdownTriggerProps, open: boolean) => ReactNode;
  className?: string;
  /** ListItem, ListSection, ListDivider, ListHeading and nested Dropdown children. */
  children: ReactNode;
};

/**
 * Trigger plus a List rendered as a menu. The menu is portaled to the end of body, so it is never
 * clipped by overflow or sticky containers, and anchored to the trigger with CSS anchor positioning,
 * which flips it when there is no room. Browsers without anchor support fall back to a measured
 * position. Nest a Dropdown inside a menu, with a ListItem as its trigger and side="right", for a submenu.
 */
export function Dropdown({
  label,
  icon,
  variant,
  color,
  size,
  hideChevron,
  align = "left",
  side = "bottom",
  openOnHover,
  triggerLabel,
  trigger,
  className,
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<CSSProperties>();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Nested menus are always placed by measurement: anchor positioning inside another fixed,
  // animated menu is not reliable across browsers.
  const measured = !supportsAnchor || side === "right";
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();
  const anchorName = `--dropdown-${menuId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const parents = useContext(ChainContext);
  const chain = [...parents, menuId];
  const inside = (target: EventTarget | null) => (target instanceof Node && rootRef.current?.contains(target)) || insideChain(target, menuId);

  useLayoutEffect(() => {
    if (!open || !measured) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gap = 4;
    if (side === "right") {
      const menu = menuRef.current?.getBoundingClientRect();
      const width = menu?.width ?? 0;
      const height = menu?.height ?? 0;
      const fitsRight = rect.right + gap + width <= window.innerWidth;
      const left = fitsRight ? rect.right + gap : Math.max(0, rect.left - gap - width);
      const top = Math.max(0, Math.min(rect.top, window.innerHeight - height - gap));
      setPos({ top, left });
    } else {
      const height = menuRef.current?.getBoundingClientRect().height ?? 0;
      const top = side === "top" ? Math.max(0, rect.top - gap - height) : rect.bottom + gap;
      setPos(align === "right" ? { top, right: window.innerWidth - rect.right } : { top, left: rect.left });
    }
  }, [open, align, side, measured]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!inside(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onScroll = (e: Event) => {
      // Scrolling inside a menu of this chain is fine, anything else moves the trigger away.
      if (!insideChain(e.target, menuId)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const hover = (next: boolean) => {
    if (!openOnHover) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(next), next ? 120 : 200);
  };

  const triggerProps: DropdownTriggerProps = {
    ref: triggerRef,
    style: { anchorName } as CSSProperties,
    onClick: (e) => {
      // A nested trigger lives inside the parent menu; toggling it must not close the parent.
      e.stopPropagation();
      setOpen((o) => !o);
    },
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": menuId,
  };

  // The menu lives in the portal but stays in this React subtree, so clicks still bubble to the
  // parent menu's handlers and the chain context reaches nested dropdowns.
  const menu = open && (
    <ChainContext.Provider value={chain}>
      <div
        id={menuId}
        ref={menuRef}
        data-dropdown-chain={chain.join(" ")}
        className={cx("dropdown__menu", align === "right" && "dropdown__menu--right", side === "right" && "dropdown__menu--side", side === "top" && "dropdown__menu--top", measured && "dropdown__menu--measured")}
        style={{ ...pos, ...(measured ? {} : { positionAnchor: anchorName }) } as CSSProperties}
        onPointerEnter={() => hover(true)}
        onPointerLeave={() => hover(false)}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest(".list__item")) setOpen(false);
        }}
      >
        <List role="menu">{children}</List>
      </div>
    </ChainContext.Provider>
  );

  return (
    <div
      ref={rootRef}
      className={cx("dropdown", side === "right" && "dropdown--side", open && "dropdown--open", className)}
      onPointerEnter={() => hover(true)}
      onPointerLeave={() => hover(false)}
    >
      {trigger ? (
        <TriggerSlot render={trigger} props={triggerProps} open={open} />
      ) : (
        <Button {...triggerProps} variant={variant} color={color} size={size} icon={icon} aria-label={triggerLabel}>
          {label}
          {!hideChevron && <Icon name="chevronDown" className="dropdown__chevron" />}
        </Button>
      )}
      {menu && createPortal(menu, getPortalRoot())}
    </div>
  );
}
