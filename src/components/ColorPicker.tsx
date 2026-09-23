"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { Input } from "./Input";
import { Slider } from "./Slider";
import { useAnchoredMenu } from "./useSuggestions";

export type HSLA = { h: number; s: number; l: number; a: number };

export const toHsl = ({ h, s, l, a }: HSLA) => (a < 100 ? `hsl(${h} ${s}% ${l}% / ${a / 100})` : `hsl(${h} ${s}% ${l}%)`);

export type ColorPickerProps = {
  value?: HSLA;
  defaultValue?: HSLA;
  onChange?: (value: HSLA, css: string) => void;
  /** Hide the alpha slider. */
  noAlpha?: boolean;
  size?: "sm" | "md" | "lg";
  /** Trigger label. Defaults to the hsl string. */
  label?: string;
  align?: "left" | "right";
  disabled?: boolean;
  className?: string;
};

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const CHECKER = "repeating-conic-gradient(var(--color-border) 0 25%, var(--color-bg) 0 50%) 0 0 / 8px 8px";

/** Dropdown with a color preview and H, S, L and alpha sliders, each with a typed input. */
export function ColorPicker({ value, defaultValue, onChange, noAlpha, size = "md", label, align = "left", disabled, className }: ColorPickerProps) {
  const [internal, setInternal] = useState<HSLA>(defaultValue ?? { h: 226, s: 100, l: 59, a: 100 });
  const color = value ?? internal;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { menuRef, anchorStyle, menuStyle } = useAnchoredMenu(open, triggerRef);
  const id = useId();

  const set = (patch: Partial<HSLA>) => {
    const next = { ...color, ...patch };
    if (value === undefined) setInternal(next);
    onChange?.(next, toHsl(next));
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, menuRef]);

  const css = toHsl(color);
  const opaque = toHsl({ ...color, a: 100 });
  const { h, s, l } = color;

  const channels: Array<{ key: keyof HSLA; label: string; max: number; unit: string; background: string }> = [
    { key: "h", label: "H", max: 360, unit: "°", background: `linear-gradient(90deg, ${[0, 60, 120, 180, 240, 300, 360].map((x) => `hsl(${x} ${s}% ${l}%)`).join(", ")})` },
    { key: "s", label: "S", max: 100, unit: "%", background: `linear-gradient(90deg, hsl(${h} 0% ${l}%), hsl(${h} 100% ${l}%))` },
    { key: "l", label: "L", max: 100, unit: "%", background: `linear-gradient(90deg, hsl(${h} ${s}% 0%), hsl(${h} ${s}% 50%), hsl(${h} ${s}% 100%))` },
    ...(noAlpha ? [] : [{ key: "a" as const, label: "A", max: 100, unit: "%", background: `linear-gradient(90deg, transparent, ${opaque}), ${CHECKER}` }]),
  ];

  return (
    <div ref={rootRef} className={cx("color-picker", className)}>
      <Button
        ref={triggerRef}
        size={size}
        disabled={disabled}
        style={anchorStyle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        icon={undefined}
      >
        <span className="color-picker__swatch" style={{ "--swatch": css } as CSSProperties} aria-hidden />
        <span className="color-picker__label">{label ?? css}</span>
        <Icon name="chevronDown" className={cx("dropdown__chevron", open && "dropdown__chevron--open")} />
      </Button>
      {open && (
        <div ref={menuRef} id={id} role="dialog" aria-label="Color picker" popover="manual" className={cx("dropdown__menu", "color-picker__panel", align === "right" && "dropdown__menu--right")} style={menuStyle}>
          <div className="color-picker__preview" style={{ "--swatch": css } as CSSProperties}>
            <span className="color-picker__value">{css}</span>
          </div>
          <div className="color-picker__channels">
            {channels.map((c) => (
              <div key={c.key} className="color-picker__channel">
                <span className="color-picker__channel-label">{c.label}</span>
                <Slider
                  size="sm"
                  min={0}
                  max={c.max}
                  value={color[c.key]}
                  onChange={(v) => set({ [c.key]: v })}
                  fill="none"
                  background={c.background}
                  aria-label={c.label}
                  className="color-picker__slider"
                />
                <Input
                  size="sm"
                  mono
                  type="number"
                  min={0}
                  max={c.max}
                  value={color[c.key]}
                  onChange={(e) => set({ [c.key]: clamp(Number(e.target.value) || 0, 0, c.max) })}
                  append={c.unit}
                  aria-label={`${c.label} value`}
                  className="color-picker__input"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
