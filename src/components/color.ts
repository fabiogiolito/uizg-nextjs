/** Color helpers for the token editor. Tokens are written in hsl; pickers speak hex. */

export function hexToHsl(hex: string): string {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

const toHex = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0");

/** Parses a computed color string (rgb(), rgba(), color(srgb …)) into hex. Returns null if not a color. */
export function computedToHex(value: string): string | null {
  let m = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (m) return `#${toHex(+m[1] / 255)}${toHex(+m[2] / 255)}${toHex(+m[3] / 255)}`;
  m = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (m) return `#${toHex(+m[1])}${toHex(+m[2])}${toHex(+m[3])}`;
  return null;
}

let probe: HTMLElement | null = null;

/** Resolves a token to a hex color by letting the browser compute it. Returns null if the token isn't a color. */
export function resolveTokenColor(name: string): string | null {
  if (typeof document === "undefined") return null;
  if (!probe) {
    probe = document.createElement("span");
    probe.style.display = "none";
    document.body.appendChild(probe);
  }
  probe.style.backgroundColor = "";
  probe.style.backgroundColor = `var(${name})`;
  const computed = getComputedStyle(probe).backgroundColor;
  if (!computed || computed === "rgba(0, 0, 0, 0)") return null;
  return computedToHex(computed);
}
