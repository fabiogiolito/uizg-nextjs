import type { Control, Props } from "./types";

const fmt = (v: unknown) => {
  if (typeof v === "string") return `"${v}"`;
  if (typeof v === "boolean") return v ? "" : "{false}";
  return `{${JSON.stringify(v)}}`;
};

/**
 * Builds a JSX element with every prop on its own line.
 * `attrs` values: a string is emitted verbatim after `=` (pass `"\"text\""` or `{expr}`),
 * `true` emits a bare boolean prop, and undefined/false/"" are skipped.
 */
export function jsx(name: string, attrs: Record<string, string | boolean | undefined>, children?: string | string[], indent = 0): string {
  const pad = "  ".repeat(indent);
  const lines = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== false && v !== "")
    .map(([k, v]) => (v === true ? `${pad}  ${k}` : `${pad}  ${k}=${v}`));
  const body = children === undefined ? [] : (Array.isArray(children) ? children : [children]).filter((c) => c !== "");
  const inner = body.map((c) => (c.includes("\n") || c.startsWith("<") ? c.split("\n").map((l) => `${pad}  ${l}`).join("\n") : `${pad}  ${c}`)).join("\n");
  if (!lines.length) return body.length ? `${pad}<${name}>${body.length === 1 && !body[0].includes("\n") && !body[0].startsWith("<") ? `${body[0]}</${name}>` : `\n${inner}\n${pad}</${name}>`}` : `${pad}<${name} />`;
  const open = `${pad}<${name}\n${lines.join("\n")}\n${pad}`;
  return body.length ? `${open}>\n${inner}\n${pad}</${name}>` : `${open}/>`;
}
export const q = (v: unknown) => `"${String(v)}"`;

/** Builds an element from playground props, omitting defaults, one prop per line. */
export function jsxFor(name: string, props: Props, controls: Record<string, Control>, extra: Record<string, string | boolean | undefined> = {}): string {
  const attrs: Record<string, string | boolean | undefined> = { ...extra };
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    const control = controls[key];
    const def = control && "default" in control ? control.default : undefined;
    if (value === undefined || value === "" || value === def || value === false) continue;
    attrs[key] = typeof value === "boolean" ? true : fmt(value);
  }
  const children = props.children;
  return jsx(name, attrs, children === undefined || children === "" || children === null ? undefined : String(children));
}

/** Pretty-prints an HTML fragment with indentation, one tag per line. */
export function formatHtml(html: string): string {
  const cleaned = html.replace(/\sdata-[\w-]+="[^"]*"/g, "").replace(/\sstyle=""/g, "");
  const tokens = cleaned.replace(/>\s+</g, "><").split(/(?=<)|(?<=>)/g).filter(Boolean);
  const voids = new Set(["input", "img", "br", "hr", "col", "path", "circle", "line", "rect", "polyline", "polygon"]);
  let depth = 0;
  const lines: string[] = [];
  for (const t of tokens) {
    if (t.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      lines.push("  ".repeat(depth) + t);
    } else if (t.startsWith("<")) {
      lines.push("  ".repeat(depth) + t);
      const tag = t.match(/^<([\w-]+)/)?.[1] ?? "";
      if (!t.endsWith("/>") && !voids.has(tag)) depth += 1;
    } else if (t.trim()) {
      lines.push("  ".repeat(depth) + t.trim());
    }
  }
  return lines.join("\n");
}
