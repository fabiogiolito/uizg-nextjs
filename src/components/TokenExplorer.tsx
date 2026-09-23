"use client";

import { useMemo, useState } from "react";
import { cx } from "./cx";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ColorPicker, toHsl, type HSLA } from "./ColorPicker";
import { Input } from "./Input";
import { Segmented } from "./Segmented";
import { Swatch } from "./Swatch";
import { Text } from "./Text";
import { TextPair } from "./TextPair";
import { Tooltip } from "./Tooltip";
import { currentTheme, getOverride, isDerived, resetAllTokens, resetToken, resolveToken, setTheme, setToken, useMounted, useTokenVersion } from "@/docs/tokens";
import type { TokenInfo } from "@/docs/css";

export type TokenExplorerProps = { tokens: TokenInfo[]; dark: Record<string, string> };

export const parseHsl = (v: string): HSLA | null => {
  const m = v.match(/^hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%(?:\s*\/\s*([\d.]+))?\s*\)$/);
  return m ? { h: +m[1], s: +m[2], l: +m[3], a: m[4] === undefined ? 100 : Math.round(+m[4] * 100) } : null;
};

/** Every token, grouped, with what it derives from and what uses it. Edits apply to the whole page live. */
export function TokenExplorer({ tokens, dark }: TokenExplorerProps) {
  const version = useTokenVersion();
  const [filter, setFilter] = useState("");
  const [show, setShow] = useState<"all" | "base" | "derived">("all");
  const mounted = useMounted();
  const theme = mounted ? currentTheme() : "light";

  // Client-only reads of computed styles and inline overrides, refreshed whenever a token changes.
  const { resolved, overrides } = useMemo(() => {
    if (!mounted) return { resolved: {} as Record<string, { value: string; hex: string | null }>, overrides: {} as Record<string, string> };
    return {
      resolved: Object.fromEntries(tokens.map((t) => [t.name, resolveToken(t.name)])),
      overrides: Object.fromEntries(tokens.map((t) => [t.name, getOverride(t.name) ?? ""]).filter(([, v]) => v)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, version, mounted, theme]);

  const usedBy = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const t of tokens) for (const r of t.refs) (map[r] ??= []).push(t.name);
    return map;
  }, [tokens]);

  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const out: Record<string, TokenInfo[]> = {};
    for (const t of tokens) {
      if (q && !t.name.includes(q) && !t.value.toLowerCase().includes(q)) continue;
      const derived = isDerived(t.value);
      if (show === "base" && derived) continue;
      if (show === "derived" && !derived) continue;
      (out[t.group] ??= []).push(t);
    }
    return out;
  }, [tokens, filter, show]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const changed = Object.keys(overrides).length;

  return (
    <div className="token-explorer">
      <div className="row">
        <Input size="sm" icon="search" placeholder="Filter tokens…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter tokens" />
        <Segmented size="sm" value={show} onChange={(v) => setShow(v as never)} items={[{ value: "all", label: "All" }, { value: "base", label: "Base" }, { value: "derived", label: "Derived" }]} />
        <Button size="sm" icon={theme === "dark" ? "sun" : "moon"} onClick={toggleTheme}>{theme === "dark" ? "Light" : "Dark"} mode</Button>
        <Button size="sm" variant="ghost" icon="x" disabled={!changed} onClick={resetAllTokens}>Reset{changed ? ` (${changed})` : ""}</Button>
      </div>
      {Object.entries(groups).map(([group, items]) => (
        <section key={group} className="token-group">
          <TextPair title={group} description={`${items.length} tokens`} titleAs="h2" />
          <table className="table token-table">
            <thead>
              <tr>
                <th className="table__head-cell">Token</th>
                <th className="table__head-cell">Value</th>
                <th className="table__head-cell">Resolves to</th>
                <th className="table__head-cell">Relations</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => {
                const res = resolved[t.name];
                // In dark mode the dark block is in charge of these tokens; show its formula, not the light input.
                const darkRuled = theme === "dark" && !!dark[t.name];
                const derived = isDerived(t.value) || darkRuled;
                const value = darkRuled ? dark[t.name] : (overrides[t.name] ?? t.value);
                const uses = usedBy[t.name] ?? [];
                const hsla = darkRuled ? null : parseHsl(value);
                return (
                  <tr key={t.name} className="table__row">
                    <td className="table__cell token-table__name">
                      <div className="row">
                        <code className={cx("token-table__code", overrides[t.name] && "token-table__code--changed")}>{t.name}</code>
                        {derived && <Tooltip content="Derived: computed from other tokens"><Badge variant="ghost">ƒ</Badge></Tooltip>}
                      </div>
                      {t.comment && <div className="token-table__comment">{t.comment}</div>}
                    </td>
                    <td className="table__cell token-table__value">
                      <div className="row">
                        {hsla ? (
                          <ColorPicker size="sm" noAlpha value={hsla} onChange={(v) => setToken(t.name, toHsl(v))} label={value} />
                        ) : darkRuled ? (
                          <code className="code token-table__formula" title="Set by the dark-mode block">{value}</code>
                        ) : (
                          <Input size="sm" mono value={value} onChange={(e) => setToken(t.name, e.target.value)} aria-label={t.name} className="token-table__input" />
                        )}
                        {overrides[t.name] && <Button size="sm" variant="ghost" icon="x" aria-label="Reset" onClick={() => resetToken(t.name)} />}
                      </div>
                      {dark[t.name] && !darkRuled && <div className="token-table__comment">dark: <code>{dark[t.name]}</code></div>}
                      {darkRuled && <div className="token-table__comment">light: <code>{overrides[t.name] ?? t.value}</code></div>}
                    </td>
                    <td className="table__cell token-table__result">
                      {res?.hex ? (
                        <div className="row">
                          <Swatch color={res.hex} size="sm" label="" />
                          <code>{res.hex}</code>
                        </div>
                      ) : (
                        <code title={res?.value}>{res?.value ?? "…"}</code>
                      )}
                    </td>
                    <td className="table__cell token-table__relations">
                      {t.refs.length > 0 && <div className="row"><Text size="sm" tone="subtle" as="span">from</Text>{t.refs.map((r) => <Badge key={r} variant="outline">{r}</Badge>)}</div>}
                      {uses.length > 0 && <div className="row"><Text size="sm" tone="subtle" as="span">used by</Text>{uses.map((r) => <Badge key={r} variant="ghost">{r}</Badge>)}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
