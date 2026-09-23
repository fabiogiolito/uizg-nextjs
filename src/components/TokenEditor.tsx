"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { cx } from "./cx";
import { Button } from "./Button";
import { hexToHsl, resolveTokenColor } from "./color";

type Token = { name: string; value: string };
type Resolved = Record<string, { computed: string; hex: string | null }>;

// Order matters: the first matching group wins.
const groups: Array<{ title: string; test: RegExp }> = [
  { title: "Typography", test: /^--(font|title-scale|display-scale|line-height|letter-spacing)/ },
  { title: "Color", test: /^--color/ },
  { title: "Effects", test: /(shadow|focus-ring|opacity)/ },
  { title: "Spacing", test: /^--(space|inline|button|input|stack|section|card|page|text-pair|list)/ },
  { title: "Sizing", test: /^--(icon|control|container|dropdown)/ },
  { title: "Borders", test: /^--(border|radius)/ },
  { title: "Motion", test: /^--(duration|easing)/ },
];

/**
 * Reads every custom property declared on :root (light mode) from the loaded stylesheets.
 * Also walks @supports blocks the browser passes, since the CSS pipeline may wrap modern
 * values in @supports and leave a fallback in the plain rule. Later declarations win, as in CSS.
 */
function readRootTokens(): Token[] {
  const values = new Map<string, string>();
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText === ":root") {
        for (const prop of Array.from(rule.style)) {
          if (prop.startsWith("--")) values.set(prop, rule.style.getPropertyValue(prop).trim());
        }
      } else if (rule instanceof CSSSupportsRule && CSS.supports(rule.conditionText)) {
        visit(rule.cssRules);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // cross-origin sheet
    }
  }
  return [...values].map(([name, value]) => ({ name, value }));
}

function resolveAll(names: string[]): Resolved {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    names.map((n) => [n, { computed: styles.getPropertyValue(n).trim(), hex: resolveTokenColor(n) }]),
  );
}

// Stylesheets don't change at runtime, so the snapshot is read once and cached.
let tokenSnapshot: Token[] | null = null;
const emptySnapshot: Token[] = [];
const subscribe = () => () => {};
const getSnapshot = () => (tokenSnapshot ??= readRootTokens());
const getServerSnapshot = () => emptySnapshot;

/** A token is derived when its value depends on other tokens. Base tokens hold literal values. */
const isDerived = (value: string) => /var\(|calc\(|from |round\(|color-mix\(/.test(value);

type Theme = "light" | "dark";
const getTheme = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ??
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

export function TokenEditor() {
  const tokens = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [showDerived, setShowDerived] = useState(false);

  const names = useMemo(() => tokens.map((t) => t.name), [tokens]);
  const initialResolved = useMemo(() => (names.length ? resolveAll(names) : {}), [names]);
  const values = resolved ?? initialResolved;

  const update = useCallback(
    (name: string, value: string) => {
      document.documentElement.style.setProperty(name, value);
      setOverrides((o) => ({ ...o, [name]: value }));
      setResolved(resolveAll(names));
    },
    [names],
  );

  const reset = useCallback(() => {
    for (const name of Object.keys(overrides)) document.documentElement.style.removeProperty(name);
    setOverrides({});
    setResolved(resolveAll(names));
  }, [overrides, names]);

  const toggleTheme = useCallback(() => {
    const next: Theme = (theme ?? getTheme()) === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    setResolved(resolveAll(names));
  }, [theme, names]);

  const grouped = useMemo(() => {
    const out = groups.map((g) => ({ ...g, items: [] as Token[] }));
    const other = { title: "Other", items: [] as Token[] };
    for (const t of tokens) {
      if (!showDerived && isDerived(t.value)) continue;
      (out.find((g) => g.test.test(t.name)) ?? other).items.push(t);
    }
    return [...out, other].filter((g) => g.items.length);
  }, [tokens, showDerived]);

  const changedCount = Object.keys(overrides).length;
  const isDark = theme === "dark";

  return (
    <div className="token-editor">
      <div className="token-editor__header">
        <h2 className="text text--title">Tokens</h2>
        <div className="row">
          <Button size="sm" variant={showDerived ? "default" : "outline"} onClick={() => setShowDerived((v) => !v)} aria-pressed={showDerived}>
            {showDerived ? "All" : "Base only"}
          </Button>
          <Button size="sm" icon={isDark ? "sun" : "moon"} onClick={toggleTheme} aria-label="Toggle theme" />
          <Button size="sm" icon="x" onClick={reset} disabled={!changedCount}>
            Reset{changedCount ? ` (${changedCount})` : ""}
          </Button>
        </div>
      </div>

      {grouped.map((group) => (
        <div key={group.title} className="token-editor__group">
          <h3 className="token-editor__group-title">{group.title}</h3>
          {group.items.map((token) => {
            const value = overrides[token.name] ?? token.value;
            const info = values[token.name];
            const hint = info?.hex ?? info?.computed;
            const showHint = hint && hint !== value;
            const derived = isDerived(token.value);
            return (
              <div key={token.name} className={cx("token-editor__row", derived && "token-editor__row--derived")}>
                <label
                  htmlFor={token.name}
                  className={cx("token-editor__name", overrides[token.name] && "token-editor__name--changed")}
                  title={derived ? `${token.name} (derived)` : token.name}
                >
                  {token.name}
                </label>
                <div className="token-editor__value">
                  {info?.hex && (
                    <input
                      type="color"
                      className="token-editor__swatch"
                      value={info.hex}
                      onChange={(e) => update(token.name, hexToHsl(e.target.value))}
                      aria-label={`${token.name} color`}
                    />
                  )}
                  <label className="input input--sm input--mono" style={{ flex: 1 }}>
                    <input
                      id={token.name}
                      className="input__control"
                      value={value}
                      onChange={(e) => update(token.name, e.target.value)}
                      spellCheck={false}
                    />
                  </label>
                </div>
                {showHint && (
                  <span className="token-editor__computed" title={info.computed}>
                    = {hint}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
