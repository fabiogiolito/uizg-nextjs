"use client";

import { useSyncExternalStore } from "react";

export type TokenDef = { name: string; value: string; group: string; refs: string[] };

const EVENT = "uizg:tokens-changed";
const listeners = new Set<() => void>();
let version = 0;

/*
  Overrides are written into an injected `:root { … }` rule rather than inline styles. Inline
  styles would beat every stylesheet rule, including the dark-mode block that remaps --color-bg,
  so dark mode would stop working once a token was edited. A :root rule has the same specificity
  as the light values and loses to `:root[data-theme="dark"]`, exactly like the file it edits.
*/
const overrides = new Map<string, string>();
let styleEl: HTMLStyleElement | null = null;
function render() {
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "uizg-token-overrides";
  }
  // Always last in <head>: React can (re)insert the tokens.css link after us, and at equal
  // specificity the later rule wins, which would silently undo the overrides.
  document.head.appendChild(styleEl);
  styleEl.textContent = overrides.size ? `:root {\n${[...overrides].map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}` : "";
}

/** Applies a token override live to the whole page and notifies subscribers. */
export function setToken(name: string, value: string) {
  overrides.set(name, value);
  render();
  bump();
}
export function resetToken(name: string) {
  overrides.delete(name);
  render();
  bump();
}
export function resetAllTokens() {
  overrides.clear();
  render();
  bump();
}
export function getOverride(name: string): string | null {
  return overrides.get(name) ?? null;
}
// Test hook: lets scripts drive the store (e.g. headless checks of the docs pages).
if (typeof window !== "undefined") (window as unknown as { __uizgTokens: unknown }).__uizgTokens = { setToken, resetToken, resetAllTokens, resolveToken, setTheme };
function bump() {
  if (styleEl && styleEl !== document.head.lastElementChild) document.head.appendChild(styleEl);
  version += 1;
  listeners.forEach((l) => l());
  window.dispatchEvent(new Event(EVENT));
}
// Theme changes also change what tokens resolve to, so they bump the version like an edit does.
let watching = false;
function watchTheme() {
  if (watching || typeof document === "undefined") return;
  watching = true;
  new MutationObserver(() => bump()).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => bump());
}
const subscribe = (l: () => void) => {
  watchTheme();
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Current effective theme, from data-theme or the system preference. */
export function currentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const set = document.documentElement.dataset.theme;
  if (set === "dark" || set === "light") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
export function setTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
}
/** Re-renders when any token override changes. */
export const useTokenVersion = () => useSyncExternalStore(subscribe, () => version, () => 0);
/** False during server render and hydration, true once on the client. */
export const useMounted = () => useSyncExternalStore(() => () => {}, () => true, () => false);

let probe: HTMLElement | null = null;
const toHex = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0");
function computedToHex(value: string): string | null {
  let m = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?/);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return `#${toHex(+m[1] / 255)}${toHex(+m[2] / 255)}${toHex(+m[3] / 255)}${a < 1 ? toHex(a) : ""}`;
  }
  m = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?/);
  if (m) {
    const a = m[4] === undefined ? 1 : parseFloat(m[4]);
    return `#${toHex(+m[1])}${toHex(+m[2])}${toHex(+m[3])}${a < 1 ? toHex(a) : ""}`;
  }
  return null;
}

/** Resolves a token to what the browser actually uses: a hex color, or the substituted value. */
export function resolveToken(name: string): { value: string; hex: string | null } {
  if (typeof document === "undefined") return { value: "", hex: null };
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!probe) {
    probe = document.createElement("span");
    probe.style.display = "none";
    document.body.appendChild(probe);
  }
  probe.style.backgroundColor = "";
  probe.style.backgroundColor = `var(${name})`;
  const bg = getComputedStyle(probe).backgroundColor;
  const hex = bg && bg !== "rgba(0, 0, 0, 0)" ? computedToHex(bg) : null;
  return { value, hex };
}

export const refsIn = (value: string) => Array.from(value.matchAll(/var\((--[\w-]+)/g)).map((m) => m[1]);
export const isDerived = (value: string) => /var\(|calc\(|from |round\(|color-mix\(|min\(|max\(|light-dark\(/.test(value);
