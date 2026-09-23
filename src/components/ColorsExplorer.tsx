"use client";

import { useMemo } from "react";
import { Button } from "./Button";
import { ColorPicker, toHsl } from "./ColorPicker";
import { DataList } from "./DataList";
import { Segmented } from "./Segmented";
import { Swatch } from "./Swatch";
import { Text } from "./Text";
import { TextPair } from "./TextPair";
import { parseHsl } from "./TokenExplorer";
import { currentTheme, getOverride, resetAllTokens, resolveToken, setTheme, setToken, useMounted, useTokenVersion } from "@/docs/tokens";
import type { TokenInfo } from "@/docs/css";

const GROUPS: { title: string; description: string; names: string[] }[] = [
  { title: "Light / dark mode page background", description: "The two fixed page backgrounds. --color-bg picks one through light-dark(), and everything neutral derives from that.", names: ["--color-bg-light-mode", "--color-bg-dark-mode"] },
  { title: "Background", description: "The active page background and the surfaces that sit on it.", names: ["--color-bg", "--color-surface", "--color-surface-hover", "--color-raised"] },
  { title: "Border", description: "Edges of boxes and dividers. In dark mode the shadows become a ring in the border color.", names: ["--color-border", "--color-border-strong"] },
  { title: "Text", description: "Three levels of emphasis, derived from the background so they share its hue.", names: ["--color-text", "--color-text-muted", "--color-text-subtle"] },
  { title: "Primary", description: "Brand accent for primary actions, selection and focus.", names: ["--color-primary", "--color-primary-hover", "--color-primary-soft", "--color-primary-soft-hover", "--color-primary-contrast", "--color-focus"] },
  { title: "Success", description: "Positive status.", names: ["--color-success", "--color-success-hover", "--color-success-contrast"] },
  { title: "Warning", description: "Caution status.", names: ["--color-warning", "--color-warning-hover", "--color-warning-contrast"] },
  { title: "Danger", description: "Errors and destructive actions.", names: ["--color-danger", "--color-danger-hover", "--color-danger-contrast"] },
];

/** Turns a token formula into a sentence. */
function describe(v: string): string {
  let m = v.match(/^hsl\(from var\((--[\w-]+)\) h (\S+) calc\(l ([+-]) (\d+)\)\)$/);
  if (m) return `Hue of ${m[1]}, saturation ${m[2] === "s" ? "kept" : m[2].startsWith("min") ? "capped at 12" : m[2]}, lightness ${m[3] === "-" ? "minus" : "plus"} ${m[4]}.`;
  m = v.match(/^hsl\(from var\((--[\w-]+)\) h s calc\(l ([+-]) (\d+)\)\)$/);
  if (m) return `${m[1]} with lightness ${m[2] === "-" ? "minus" : "plus"} ${m[3]}.`;
  m = v.match(/^hsl\(from var\((--[\w-]+)\) h s l \/ ([\d.]+)\)$/);
  if (m) return `${m[1]} at ${Math.round(+m[2] * 100)}% opacity.`;
  m = v.match(/^color-mix\(in srgb, var\((--[\w-]+)\) (\d+)%, var\((--[\w-]+)\)\)$/);
  if (m) return `${m[2]}% of ${m[1]} mixed into ${m[3]}. Opaque, so it hides what scrolls behind it.`;
  m = v.match(/^color-mix\(in hsl, contrast-color\(var\((--[\w-]+)\)\) (\d+)%, var\((--[\w-]+)\)\)$/);
  if (m) return `Black or white, whichever contrasts with ${m[1]}, with ${100 - +m[2]}% of the color mixed in so it is never pure.`;
  m = v.match(/^light-dark\(var\((--[\w-]+)\), var\((--[\w-]+)\)\)$/);
  if (m) return `${m[1]} in light mode, ${m[2]} in dark mode, chosen by the color-scheme.`;
  if (v.startsWith("var(")) return `Same as ${v.slice(4, -1)}.`;
  if (parseHsl(v)) return "Base color. Edit it and everything derived follows.";
  return v;
}

/** Colors grouped by role. Base colors have a picker; every other color shows how it is derived. */
export function ColorsExplorer({ tokens, dark }: { tokens: TokenInfo[]; dark: Record<string, string> }) {
  const version = useTokenVersion();
  const mounted = useMounted();
  const theme = mounted ? currentTheme() : "light";
  const byName = useMemo(() => Object.fromEntries(tokens.map((t) => [t.name, t])), [tokens]);
  const resolved = useMemo<Record<string, string | null>>(
    () => (mounted ? Object.fromEntries(tokens.filter((t) => t.name.startsWith("--color-")).map((t) => [t.name, resolveToken(t.name).hex])) : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokens, version, mounted],
  );
  const listed = new Set(GROUPS.flatMap((g) => g.names));
  const others = tokens.filter((t) => t.name.startsWith("--color-") && !listed.has(t.name));

  return (
    <div className="token-explorer">
      <div className="row">
        <Segmented size="sm" value={theme} onChange={(v) => setTheme(v as never)} items={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
        <Button size="sm" variant="ghost" icon="x" onClick={resetAllTokens}>Reset all</Button>
        <Text size="sm" tone="muted">Edits apply to the whole site until you reload.</Text>
      </div>
      {[...GROUPS, ...(others.length ? [{ title: "Other", description: "Not assigned to a group above.", names: others.map((t) => t.name) }] : [])].map((g) => (
        <section key={g.title} className="token-group">
          <TextPair title={g.title} description={g.description} titleAs="h2" />
          <div className="color-grid color-grid--wide">
            {g.names.map((name) => {
              const t = byName[name];
              if (!t) return null;
              const value = theme === "dark" && dark[name] ? dark[name] : (mounted ? getOverride(name) : null) ?? t.value;
              const hsla = theme === "dark" && dark[name] ? null : parseHsl((mounted ? getOverride(name) : null) ?? t.value);
              return (
                <div key={name} className="stack stack--tight">
                  <Swatch color={resolved[name] ?? "transparent"} label={resolved[name] ?? "…"} name={name.replace("--color-", "")} />
                  {hsla ? (
                    <ColorPicker size="sm" value={hsla} onChange={(v) => setToken(name, toHsl(v))} noAlpha label={toHsl(hsla)} />
                  ) : (
                    <code className="code token-table__formula">{value}</code>
                  )}
                  <Text size="sm" tone="muted" relaxed>{describe(value)}</Text>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <section className="token-group">
        <TextPair title="Dark mode overrides" description="What the dark block changes. Everything else is inherited from the light values." titleAs="h2" />
        <DataList size="sm" divided items={Object.entries(dark).map(([k, v]) => ({ label: k, value: <code className="code">{v}</code> }))} />
      </section>
    </div>
  );
}
