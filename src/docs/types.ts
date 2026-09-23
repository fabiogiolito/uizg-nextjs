import type { ReactNode } from "react";

export type Control =
  | { type: "boolean"; label?: string; default?: boolean; doc?: string }
  | { type: "select"; label?: string; options: string[]; default?: string; doc?: string }
  | { type: "text"; label?: string; default?: string; doc?: string }
  | { type: "number"; label?: string; default?: number; min?: number; max?: number; step?: number; doc?: string };

export type Props = Record<string, unknown>;

export type DocState = { name: string; props: Props; description?: string };

export type DocEntry = {
  slug: string;
  name: string;
  group: string;
  description: string;
  /** How and when to use it, one point per line. */
  usage?: string[];
  /** Controls shown in the playground sidebar. Keys are prop names; "children" maps to children. */
  controls: Record<string, Control>;
  /** Extra props documented but not controlled. */
  extraProps?: { name: string; type: string; default?: string; description?: string }[];
  /** Named presets to step through. */
  states?: DocState[];
  /** Renders the preview for a set of props. */
  render: (props: Props) => ReactNode;
  /** JSX source for a set of props. Defaults to a generated single element. */
  code?: (props: Props) => string;
  /** Titles of components.css blocks this component uses. */
  cssBlocks: string[];
  related?: string[];
  /** Preview background: raised (default) or surface. */
  previewOn?: "raised" | "surface";
  /** Vertical placement in the preview: center (default) or end, for things that usually sit at the bottom. */
  previewAlign?: "center" | "end";
  /** Remove the preview padding so the component touches the edges, for things like a SideNav. */
  previewFlush?: boolean;
};
