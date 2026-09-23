"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { TextPair } from "./TextPair";

export type ToastMode = "temporary" | "permanent" | "urgent";
export type ToastColor = "default" | "primary" | "success" | "warning" | "danger";

export type ToastOptions = {
  title?: ReactNode;
  description?: ReactNode;
  color?: ToastColor;
  icon?: IconName | null;
  /** temporary: leaves on its own. permanent: stays until dismissed. urgent: stays and is never stacked. */
  mode?: ToastMode;
  /** Milliseconds before a temporary toast leaves. */
  duration?: number;
  /** Shows a close button in the top-right corner on hover. */
  dismissible?: boolean;
  /** Buttons rendered under the text in the default body. */
  actions?: (dismiss: () => void) => ReactNode;
  /** Replaces the default body entirely. The frame and close button remain. */
  content?: (dismiss: () => void) => ReactNode;
};

export type ToastData = ToastOptions & { id: string; leaving?: boolean };

/* ---- Store: lives outside React so any module can call toast() ---- */
let toasts: ToastData[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let paused = false;
let seq = 0;
const EXIT_MS = 300;

const emit = () => listeners.forEach((l) => l());
const set = (next: ToastData[]) => {
  toasts = next;
  emit();
};

function remove(id: string) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  set(toasts.filter((t) => t.id !== id));
}

function scheduleLeave(id: string, ms: number) {
  clearTimeout(timers.get(id));
  timers.set(
    id,
    setTimeout(() => {
      // Hovering the stack pauses departures; try again shortly.
      if (paused) return scheduleLeave(id, 800);
      dismiss(id);
    }, ms),
  );
}

/** Starts the exit animation, then removes the toast. */
export function dismiss(id: string) {
  const t = toasts.find((x) => x.id === id);
  if (!t || t.leaving) return;
  clearTimeout(timers.get(id));
  set(toasts.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
  timers.set(id, setTimeout(() => remove(id), EXIT_MS));
}

/** Shows a toast from anywhere. Returns its id. */
export function toast(options: ToastOptions | string): string {
  const opts = typeof options === "string" ? { title: options } : options;
  const id = `toast-${++seq}`;
  const mode = opts.mode ?? "temporary";
  set([...toasts, { dismissible: true, ...opts, id, mode }]);
  if (mode === "temporary") scheduleLeave(id, opts.duration ?? 5000);
  return id;
}
toast.dismiss = dismiss;
toast.clear = () => toasts.forEach((t) => dismiss(t.id));

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => toasts;
const empty: ToastData[] = [];
const getServerSnapshot = () => empty;

/* ---- Toaster ---- */
export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

const defaultIcon: Record<ToastColor, IconName> = { default: "info", primary: "info", success: "checkCircle", warning: "alertTriangle", danger: "xCircle" };

function ToastItem({ t, index, style, itemRef }: { t: ToastData; index: number; style?: CSSProperties; itemRef?: (el: HTMLDivElement | null) => void }) {
  const close = () => dismiss(t.id);
  const color = t.color ?? "default";
  const iconName = t.icon === null ? null : (t.icon ?? defaultIcon[color]);
  return (
    <div
      ref={itemRef}
      role={t.mode === "urgent" || color === "danger" ? "alert" : "status"}
      className={cx("toast", `toast--${color}`, `toast--${t.mode}`, t.leaving && "toast--leaving", index > 0 && "toast--behind")}
      style={{ "--i": index, ...style } as CSSProperties}
    >
      {t.content ? (
        t.content(close)
      ) : (
        <div className="toast__body">
          {iconName && <Icon name={iconName} className="toast__icon" />}
          <div className="toast__text">
            <TextPair title={t.title} description={t.description} />
            {t.actions && <div className="toast__actions">{t.actions(close)}</div>}
          </div>
        </div>
      )}
      {t.dismissible && <Button size="sm" variant="ghost" icon="x" aria-label="Dismiss" className="toast__dismiss" onClick={close} />}
    </div>
  );
}

const GAP = 8;
const PEEK = 8;
const MAX_PEEK = 2;

/** Mount once. Renders the toasts in the chosen corner: a stack that spreads into a list on hover. */
export function Toaster({ position = "bottom-right", className }: { position?: ToastPosition; className?: string }) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [expanded, setExpanded] = useState(false);
  const [layout, setLayout] = useState<{ offsets: Record<string, number>; heights: Record<string, number>; height: number }>({ offsets: {}, heights: {}, height: 0 });
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  useEffect(() => () => { paused = false; }, []);

  const top = position.startsWith("top");
  const urgent = all.filter((t) => t.mode === "urgent");
  const stack = all.filter((t) => t.mode !== "urgent");
  // Age 0 is the newest toast.
  const age = (t: ToastData) => stack.length - 1 - stack.indexOf(t);

  // Stack geometry from measured heights. Collapsed: everything sits on the newest, older ones
  // peeking out behind. Expanded: each toast is offset by the heights of the newer ones plus gaps.
  useLayoutEffect(() => {
    const offsets: Record<string, number> = {};
    const heights: Record<string, number> = {};
    let height = 0;
    const byAge = [...stack].sort((a, b) => age(a) - age(b));
    // Natural content height, independent of any height currently forced on the element.
    const natural = (el: HTMLDivElement | undefined) => (el ? el.scrollHeight + (el.offsetHeight - el.clientHeight) : 0);
    const front = natural(itemRefs.current.get(byAge[0]?.id));
    let run = 0;
    byAge.forEach((t, i) => {
      const h = natural(itemRefs.current.get(t.id));
      if (expanded) {
        heights[t.id] = h;
        offsets[t.id] = run;
        run += h + GAP;
        height = run - GAP;
      } else {
        // Behind the front toast, every toast takes the front one's height so nothing peeks out unevenly.
        heights[t.id] = i === 0 ? h : front;
        offsets[t.id] = Math.min(i, MAX_PEEK) * PEEK;
        if (i === 0) height = h;
      }
    });
    if (!expanded) height += Math.min(Math.max(stack.length - 1, 0), MAX_PEEK) * PEEK;
    setLayout({ offsets, heights, height });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, all]);

  const open = () => { setExpanded(true); paused = true; };
  const close = () => { setExpanded(false); paused = false; };
  const dismissAll = () => stack.forEach((t) => dismiss(t.id));

  const dismissAllButton = stack.length > 1 && (
    <div className={cx("toaster__bar", expanded && "toaster__bar--visible")}>
      <Button size="sm" icon="x" onClick={dismissAll}>Dismiss all</Button>
    </div>
  );

  return (
    <div className={cx("toaster", `toaster--${position}`, expanded && "toaster--expanded", className)} onPointerEnter={open} onPointerLeave={close} onFocus={open} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close(); }}>
      {top && urgent.map((t) => <ToastItem key={t.id} t={t} index={0} />)}
      {stack.length > 0 && (
        <>
          {dismissAllButton}
          <div className="toaster__stack">
            <div className="toaster__rail" style={{ height: layout.height }}>
              {stack.map((t) => (
                <ToastItem
                  key={t.id}
                  t={t}
                  index={age(t)}
                  itemRef={(el) => { if (el) itemRefs.current.set(t.id, el); else itemRefs.current.delete(t.id); }}
                  style={{ "--offset": `${layout.offsets[t.id] ?? 0}px`, height: layout.heights[t.id] } as CSSProperties}
                />
              ))}
            </div>
          </div>
        </>
      )}
      {!top && urgent.map((t) => <ToastItem key={t.id} t={t} index={0} />)}
    </div>
  );
}
