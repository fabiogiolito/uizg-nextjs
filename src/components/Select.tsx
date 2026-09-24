"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type SelectHTMLAttributes } from "react";
import { cx } from "./cx";
import { Icon, iconSvg, type IconName } from "./Icon";

export type SelectOption = { value: string; label: string; icon?: IconName; description?: string; disabled?: boolean };

// Rich option markup is only valid with customizable selects. It is rendered on the client, after
// hydration, and only where supported; the server and other browsers get plain text.
const subscribe = () => () => {};
const supportsRich = () => typeof CSS !== "undefined" && CSS.supports("appearance", "base-select");
const useRichOptions = () => useSyncExternalStore(subscribe, supportsRich, () => false);

const escape = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const optionHtml = (o: SelectOption) =>
  (o.icon ? iconSvg(o.icon, "select__option-icon") : "") +
  `<span class="select__option-text"><span class="select__option-label">${escape(o.label)}</span>` +
  (o.description ? `<span class="select__option-description">${escape(o.description)}</span>` : "") +
  `</span>`;

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  /** Options, or pass <option> elements as children. */
  options?: SelectOption[];
  /** Shown as a disabled first option when no value is selected. */
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  /** Label inside the control before the value, like Input's prepend. */
  prepend?: ReactNode;
  /** "input" looks like a text field, "button" like a raised button. */
  look?: "input" | "button";
  block?: boolean;
  children?: ReactNode;
};

/**
 * The native select, styled as an input or a button. In browsers with `appearance: base-select`
 * the picker is styled too and options can carry icons and descriptions; elsewhere the platform
 * menu opens and options fall back to their text.
 */
export function Select({ options, placeholder, size = "md", icon, prepend, look = "input", block, className, children, ...rest }: SelectProps) {
  const rich = useRichOptions();
  const ref = useRef<HTMLSelectElement>(null);
  const prependRef = useRef<HTMLSpanElement>(null);
  const [prependWidth, setPrependWidth] = useState(0);
  // The prepend floats over the control, so the control pads itself by the measured width.
  useLayoutEffect(() => {
    setPrependWidth(prependRef.current?.offsetWidth ?? 0);
  }, [prepend]);

  // With appearance: base-select the closed control is a <button><selectedcontent> inside the select,
  // mirroring the chosen option's markup. React refuses that nesting, so it is inserted directly
  // into the DOM after mount, only where supported. React never manages this node.
  useEffect(() => {
    const el = ref.current;
    if (!rich || !el || el.querySelector(":scope > button")) return;
    el.insertAdjacentHTML("afterbegin", '<button type="button" class="select__button"><selectedcontent class="select__selected"></selectedcontent></button>');
  }, [rich]);

  return (
    <span className={cx("select", `select--${look}`, size !== "md" && `select--${size}`, block && "select--block", className)}>
      {icon && <Icon name={icon} className="select__icon" />}
      {prepend && <span ref={prependRef} className="select__prepend">{prepend}</span>}
      <select ref={ref} className="select__control" style={prependWidth ? ({ "--select-prepend": `${prependWidth}px` } as CSSProperties) : undefined} {...rest}>
        {placeholder && (
          <option value="" disabled hidden={rest.value !== undefined && rest.value !== ""}>
            {placeholder}
          </option>
        )}
        {options?.map((o) =>
          rich ? (
            <option key={o.value} value={o.value} disabled={o.disabled} className="select__option" dangerouslySetInnerHTML={{ __html: optionHtml(o) }} />
          ) : (
            <option key={o.value} value={o.value} disabled={o.disabled} className="select__option">
              {o.label}
            </option>
          ),
        )}
        {children}
      </select>
      <Icon name="chevronDown" className="select__chevron" />
    </span>
  );
}
