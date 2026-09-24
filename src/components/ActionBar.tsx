"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";
import { Button, type ButtonProps } from "./Button";
import { Dropdown } from "./Dropdown";
import type { IconName } from "./Icon";
import { ListItem } from "./List";
import { SubMenu } from "./SubMenu";

export type Action = {
  key: string;
  label: ReactNode;
  icon?: IconName;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
  /** Button styling when shown inline. */
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  /** Menu content (ListItems). Inline the action is a Dropdown button; in the "more" menu it is a submenu. */
  items?: ReactNode;
};

export type ActionBarProps = {
  actions: Action[];
  size?: ButtonProps["size"];
  /** Label for the overflow menu trigger. */
  moreLabel?: string;
  className?: string;
};

/**
 * Buttons in a row. When the container is too narrow for all of them, the trailing ones move
 * into a "more" menu. Widths come from a hidden copy of the full row, so the count is exact.
 */
export function ActionBar({ actions, size = "md", moreLabel = "More", className }: ActionBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(actions.length);

  useLayoutEffect(() => {
    const el = ref.current;
    const measure = measureRef.current;
    if (!el || !measure) return;
    const fit = () => {
      const kids = Array.from(measure.children) as HTMLElement[];
      const more = kids.pop()!;
      const gap = parseFloat(getComputedStyle(measure).columnGap) || 0;
      const available = el.clientWidth;
      const widths = kids.map((k) => k.offsetWidth);
      const total = widths.reduce((a, w, i) => a + w + (i ? gap : 0), 0);
      if (total <= available) return setVisible(kids.length);
      // Leave room for the more button after the last visible one.
      let used = more.offsetWidth;
      let n = 0;
      for (const w of widths) {
        if (used + gap + w > available) break;
        used += gap + w;
        n++;
      }
      setVisible(n);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    ro.observe(measure);
    return () => ro.disconnect();
  }, [actions.length]);

  const button = (a: Action) =>
    a.items ? (
      <Dropdown key={a.key} size={size} variant={a.variant} color={a.color ?? (a.danger ? "danger" : undefined)} icon={a.icon} label={a.label}>
        {a.items}
      </Dropdown>
    ) : (
      <Button key={a.key} size={size} variant={a.variant} color={a.color ?? (a.danger ? "danger" : undefined)} icon={a.icon} href={a.href} disabled={a.disabled} onClick={a.onClick}>
        {a.label}
      </Button>
    );
  const shown = actions.slice(0, visible);
  const overflow = actions.slice(visible);

  return (
    <div ref={ref} className={cx("action-bar", className)}>
      {shown.map(button)}
      {overflow.length > 0 && (
        <Dropdown size={size} icon="more" hideChevron triggerLabel={moreLabel} align="right" className="action-bar__more">
          {overflow.map((a) =>
            a.items ? (
              <SubMenu key={a.key} icon={a.icon} label={a.label} disabled={a.disabled}>
                {a.items}
              </SubMenu>
            ) : (
              <ListItem key={a.key} icon={a.icon} label={a.label} href={a.href} disabled={a.disabled} danger={a.danger} onClick={a.onClick} />
            ),
          )}
        </Dropdown>
      )}
      {/* Hidden full row used only for measuring; the last child is the more button. */}
      <div ref={measureRef} className="action-bar__measure" aria-hidden inert>
        {actions.map(button)}
        <Button size={size} icon="more" aria-label={moreLabel} />
      </div>
    </div>
  );
}
