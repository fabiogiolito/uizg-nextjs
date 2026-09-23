import fs from "node:fs";
import path from "node:path";

export type CssBlock = { title: string; vars: string[]; css: string };
export type TokenInfo = { name: string; value: string; group: string; refs: string[]; comment?: string };

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

/** Splits components.css on its "---- Name ----" markers and lists the tokens each block uses. */
export function getCssBlocks(): CssBlock[] {
  const css = read("src/styles/components.css");
  const parts = css.split(/\/\* ---- /);
  const blocks: CssBlock[] = [];
  for (const part of parts.slice(1)) {
    const end = part.indexOf(" ----");
    const title = part.slice(0, end).trim();
    const body = part.slice(end);
    const vars = Array.from(new Set(Array.from(body.matchAll(/var\((--[\w-]+)/g)).map((m) => m[1]))).sort();
    blocks.push({ title, vars, css: prettyCss("/* ---- " + part.trimEnd()) });
  }
  return blocks;
}

/** Expands one-line rules into one declaration per line. */
export function prettyCss(css: string): string {
  return css.replace(/\{([^{}]*)\}/g, (_, body: string) => {
    const decls = body.split(";").map((d) => d.trim()).filter(Boolean);
    if (!decls.length) return "{}";
    return "{\n" + decls.map((d) => "  " + d + ";").join("\n") + "\n}";
  }).replace(/\}\n(?=\S)/g, "}\n");
}

/** Reads the light-mode :root tokens with their group headings and the tokens they reference. */
export function getTokens(): TokenInfo[] {
  const css = read("public/tokens.css");
  const root = css.slice(css.indexOf(":root {") + 7, css.indexOf("\n}\n"));
  const out: TokenInfo[] = [];
  let group = "General";
  let pending: string[] = [];
  for (const raw of root.split("\n")) {
    const line = raw.trim();
    const g = line.match(/^\/\* ---- (.+?) ----/);
    if (g) { group = g[1].trim(); pending = []; continue; }
    if (line.startsWith("/*")) { pending.push(line.replace(/^\/\*\s*|\s*\*\/$/g, "")); continue; }
    const m = line.match(/^(--[\w-]+):\s*(.+?);\s*(?:\/\*\s*(.*?)\s*\*\/)?$/);
    if (!m) continue;
    out.push({ name: m[1], value: m[2], group, refs: Array.from(m[2].matchAll(/var\((--[\w-]+)/g)).map((x) => x[1]), comment: m[3] ?? (pending.join(" ") || undefined) });
    pending = [];
  }
  return out;
}

/** Dark-mode overrides, for the tokens page. */
export function getDarkTokens(): Record<string, string> {
  const css = read("public/tokens.css");
  const i = css.indexOf(':root[data-theme="dark"]');
  const block = css.slice(i, css.indexOf("\n}", i));
  return Object.fromEntries(Array.from(block.matchAll(/(--[\w-]+):\s*(.+?);/g)).map((m) => [m[1], m[2]]));
}
