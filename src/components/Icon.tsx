import { createElement } from "react";
import * as lucide from "lucide";
import { cx } from "./cx";

type IconNode = [string, Record<string, string | number>][];

/** Old uizg names that Lucide spells differently. */
const aliases = { dollar: "DollarSign", more: "Ellipsis", refresh: "RefreshCw" } as const;

/** Any Lucide icon, written in camelCase: "circlePlus" for CirclePlus. See https://lucide.dev/icons. */
export type IconName = Uncapitalize<Exclude<keyof typeof lucide, "createElement" | "createIcons" | "icons">> | keyof typeof aliases;

/** A curated set for docs and pickers; any Lucide name works with the components. */
export const iconNames: IconName[] = [
  "plus", "minus", "circlePlus", "check", "checkCheck", "checkCircle", "x", "xCircle", "info", "alertTriangle",
  "search", "settings", "settings2", "slidersHorizontal", "wrench", "more", "moreVertical",
  "arrowUp", "arrowDown", "arrowLeft", "arrowRight", "arrowUpRight", "chevronDown", "chevronRight", "chevronsLeft", "chevronsRight", "chevronsUpDown", "trendingUp",
  "alignLeft", "alignCenter", "alignRight", "bold", "italic", "list", "layoutList", "table", "squareKanban", "chartPie",
  "user", "users", "userCheck", "circleUserRound", "building2", "briefcaseBusiness", "graduationCap", "trophy", "star", "sparkle",
  "inbox", "mails", "messageSquare", "send", "megaphone", "bell", "phone", "mic", "calendar", "clock", "hourglass", "history", "mapPin",
  "file", "image", "copy", "edit", "trash", "archive", "book", "tag", "eye", "eyeOff", "refresh", "pause", "logOut", "dollar", "percent", "sun", "moon", "home",
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function iconNode(name: IconName): IconNode | undefined {
  const key = (aliases as Record<string, string>)[name] ?? cap(name);
  return (lucide as unknown as Record<string, IconNode | undefined>)[key];
}

const svgAttrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/** The icon as an HTML string, for places React cannot render into (Select options). */
export function iconSvg(name: IconName, className?: string): string {
  const node = iconNode(name);
  if (!node) return "";
  const body = node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
  return `<svg class="${cx("icon", className)}" ${svgAttrs} aria-hidden="true">${body}</svg>`;
}

export type IconProps = {
  name: IconName;
  className?: string;
  /** Accessible label. Omit for decorative icons. */
  label?: string;
};

/** Inline Lucide icon sized by --icon-size and colored by currentColor. */
export function Icon({ name, className, label }: IconProps) {
  const node = iconNode(name);
  return (
    <svg
      className={cx("icon", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {node?.map(([tag, attrs], i) => createElement(tag, { ...attrs, key: i }))}
    </svg>
  );
}
