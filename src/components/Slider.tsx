"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { cx } from "./cx";

type Single = number;
type Range = [number, number];

export type SliderProps<V extends Single | Range = Single> = {
  value?: V;
  defaultValue?: V;
  onChange?: (value: V) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Only these values can be selected, e.g. [0, 2, 4, 8, 16, 32, 64]. Overrides `step`. */
  steps?: number[];
  /** Values the handle snaps to when dragged close, on top of `step`. */
  detents?: number[];
  /** Tick marks under the track: `true` at every step, or specific values. */
  ticks?: boolean | number[];
  /** Show the value under each tick. */
  tickLabels?: boolean;
  /** Dots on the track: `true` at every step, or specific values. */
  dots?: boolean | number[];
  /** Value bubble on the handle: while dragging or focused, or always. */
  tooltip?: boolean | "always";
  formatValue?: (value: number) => string;
  /** CSS color or gradient for the filled part of the track. "none" hides it. */
  fill?: string;
  /** CSS color or gradient for the whole track, e.g. a hue spectrum. */
  background?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
};

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const round = (n: number, step: number) => Math.round(n / step) * step;
const fixed = (n: number, step: number) => Number(n.toFixed((String(step).split(".")[1] ?? "").length));

export function Slider<V extends Single | Range = Single>({
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  steps,
  detents,
  ticks,
  tickLabels,
  dots,
  tooltip,
  formatValue = (v) => String(v),
  fill,
  background,
  size = "md",
  disabled,
  className,
  ...rest
}: SliderProps<V>) {
  const isRange = Array.isArray(value ?? defaultValue);
  const [internal, setInternal] = useState<V>(() => (value ?? defaultValue ?? (isRange ? ([min, max] as Range) : min)) as V);
  const current = (value ?? internal) as V;
  const values: number[] = Array.isArray(current) ? current : [current];
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const commit = useCallback(
    (next: number[]) => {
      const v = (isRange ? ([Math.min(...next), Math.max(...next)] as Range) : next[0]) as V;
      if (value === undefined) setInternal(v);
      onChange?.(v);
    },
    [isRange, onChange, value],
  );

  /** Position as a 0 to 1 fraction; CSS maps it onto the track minus the handle size. */
  const frac = (v: number) => (v - min) / (max - min);
  const pos = (v: number) => ({ "--pos": frac(v) }) as CSSProperties;

  const sortedSteps = useMemo(() => (steps ? [...steps].sort((a, b) => a - b) : null), [steps]);

  /** Snaps a raw value to the nearest allowed step (or the step grid) and, if close enough, to a detent. */
  const snap = useCallback(
    (raw: number) => {
      if (sortedSteps) return sortedSteps.reduce((best, cur) => (Math.abs(cur - raw) < Math.abs(best - raw) ? cur : best), sortedSteps[0]);
      let v = clamp(fixed(round(raw, step), step), min, max);
      if (detents?.length) {
        const threshold = (max - min) * 0.03;
        const near = detents.find((d) => Math.abs(d - raw) <= threshold);
        if (near !== undefined) v = near;
      }
      return v;
    },
    [sortedSteps, step, min, max, detents],
  );

  /** The handle center travels from handleSize/2 to width - handleSize/2, so the pointer maps onto that inner range. */
  const valueFromPointer = (clientX: number) => {
    const track = trackRef.current!;
    const rect = track.getBoundingClientRect();
    const handle = parseFloat(getComputedStyle(track).getPropertyValue("--slider-handle-size")) || 0;
    const ratio = clamp((clientX - rect.left - handle / 2) / (rect.width - handle), 0, 1);
    return snap(min + ratio * (max - min));
  };

  const setHandle = (index: number, v: number) => {
    const next = [...values];
    next[index] = v;
    commit(next);
  };

  const onTrackPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault(); // no text selection starts from here
    const v = valueFromPointer(e.clientX);
    // Move the nearest handle to the pointer, then keep dragging it.
    const index = values.reduce((best, cur, i) => (Math.abs(cur - v) < Math.abs(values[best] - v) ? i : best), 0);
    setHandle(index, v);
    startDrag(index, e);
  };

  const startDrag = (index: number, e: PointerEvent) => {
    setActive(index);
    const target = trackRef.current!;
    target.setPointerCapture(e.pointerId);
    const move = (ev: globalThis.PointerEvent) => setHandle(index, valueFromPointer(ev.clientX));
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
      setActive(null);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };

  const onKeyDown = (index: number, e: KeyboardEvent) => {
    if (disabled) return;
    if (sortedSteps) {
      const i = sortedSteps.indexOf(values[index]);
      const stepMap: Record<string, number | undefined> = {
        ArrowRight: sortedSteps[Math.min(i + 1, sortedSteps.length - 1)],
        ArrowUp: sortedSteps[Math.min(i + 1, sortedSteps.length - 1)],
        ArrowLeft: sortedSteps[Math.max(i - 1, 0)],
        ArrowDown: sortedSteps[Math.max(i - 1, 0)],
        Home: sortedSteps[0],
        End: sortedSteps[sortedSteps.length - 1],
      };
      const next = stepMap[e.key];
      if (next === undefined) return;
      e.preventDefault();
      setHandle(index, next);
      return;
    }
    const big = step * 10;
    const map: Record<string, number | undefined> = {
      ArrowRight: values[index] + step,
      ArrowUp: values[index] + step,
      ArrowLeft: values[index] - step,
      ArrowDown: values[index] - step,
      PageUp: values[index] + big,
      PageDown: values[index] - big,
      Home: min,
      End: max,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setHandle(index, clamp(fixed(next, step), min, max));
  };

  const stepValues = useMemo(() => {
    if (sortedSteps) return sortedSteps;
    // Steps that fit inside the range, plus max itself when the last step falls short of it.
    const count = Math.floor((max - min) / step + 1e-9);
    if (count > 100) return [];
    const values = Array.from({ length: count + 1 }, (_, i) => fixed(min + i * step, step));
    if (values[values.length - 1] < max) values.push(max);
    return values;
  }, [min, max, step, sortedSteps]);
  const tickValues: number[] = ticks === true ? stepValues : Array.isArray(ticks) ? ticks : [];
  const dotValues: number[] = dots === true ? stepValues : Array.isArray(dots) ? dots : [];

  const lo = isRange ? frac(values[0]) : 0;
  const hi = frac(isRange ? values[1] : values[0]);
  const style = {
    "--slider-lo": lo,
    "--slider-hi": hi,
    ...(fill ? { "--slider-fill": fill } : {}),
    ...(background ? { "--slider-track-bg": background } : {}),
  } as CSSProperties;

  return (
    <div
      className={cx("slider", size === "sm" && "slider--sm", isRange && "slider--range", disabled && "slider--disabled", tickValues.length > 0 && "slider--ticks", tickLabels && "slider--labels", className)}
      style={style}
    >
      <div ref={trackRef} className="slider__track" onPointerDown={onTrackPointerDown}>
        {fill !== "none" && <div className="slider__fill" />}
        {dotValues.map((v) => (
          <span key={v} className={cx("slider__dot", (isRange ? v >= values[0] && v <= values[1] : v <= values[0]) && "slider__dot--filled")} style={pos(v)} />
        ))}
        {values.map((v, i) => (
          <div
            key={i}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={v}
            aria-valuetext={formatValue(v)}
            aria-label={rest["aria-label"] ? (isRange ? `${rest["aria-label"]} ${i === 0 ? "minimum" : "maximum"}` : rest["aria-label"]) : undefined}
            aria-disabled={disabled || undefined}
            className={cx("slider__handle", active === i && "slider__handle--active")}
            style={pos(v)}
            onPointerDown={(e) => {
              if (disabled) return;
              e.preventDefault();
              e.stopPropagation();
              (e.currentTarget as HTMLElement).focus();
              startDrag(i, e);
            }}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onKeyDown={(e) => onKeyDown(i, e)}
          >
            {tooltip && (
              <span className={cx("slider__tooltip", (tooltip === "always" || active === i || hover === i) && "slider__tooltip--visible")}>
                {formatValue(v)}
              </span>
            )}
          </div>
        ))}
      </div>
      {tickValues.length > 0 && (
        <div className="slider__ticks" aria-hidden>
          {tickValues.map((v) => (
            <span key={v} className="slider__tick" style={pos(v)}>
              {tickLabels && <span className="slider__tick-label">{formatValue(v)}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
