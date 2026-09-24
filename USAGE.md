# Using uizg in another Next.js project

The package ships TypeScript source, not a build. Next.js compiles it through `transpilePackages`.

## 1. Install from this folder

```sh
npm install ../uizg-nextjs
```

npm creates a symlink in `node_modules/uizg`, so edits here show up in the other project on the next reload. Don't run `npm install` inside the consumer's copy; keep doing dependency and component work in this repo.

## 2. next.config.ts in the consumer

```ts
import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  transpilePackages: ["uizg"],
  // Turbopack only resolves files inside its root. The linked package lives in a sibling folder,
  // so the root has to be the parent of both projects.
  turbopack: { root: path.join(__dirname, "..") },
};
export default config;
```

Verified with Next 16.3.4: the linked source compiles, the CSS loads, and stateful components render without a duplicate React.

## 3. Styles and fonts

In the consumer's global CSS, in this order:

```css
@import "uizg/tokens.css";
@import "uizg/styles.css";
```

Tokens expect the Inter and IBM Plex Mono variables that `src/app/layout.tsx` sets here with `next/font`. Copy those two `next/font` lines into the consumer's root layout and put the same class on `<html>`. The components CSS includes the base reset (box-sizing, body margin, font smoothing), so the consumer needs no Tailwind or other reset.

## 4. Import components

```tsx
import { Board, BoardColumn, BoardItem, SideNav, Split } from "uizg";
```

## Changing a component

Edit it here, check it on the docs site, and the consumer picks it up. Bump `version` in package.json when a change is worth noting. If you ever need a copy that doesn't follow this folder, `npm pack` here and install the tarball instead of the path.

## Changes

### 0.8.3
- Board focus mode: hidden columns are truly 0 wide even when collapsed, and the board drops its gap while focused, so no stray space remains beside the focused column. New `focusWidth` caps the focused column on wide boards.

### 0.8.2
- Tooltips render in the shared portal, like menus and hover cards, so nothing can clip or cover them. Same API.

### 0.8.1
- ActionBar actions take `overflow: "always"` to live in the "more" menu even when there is room; they keep icon, danger and items (as a submenu) and never count toward the inline width.

### 0.8.0
- Frame `color` (primary, success, warning, danger) tints the surface with that color at 5%.

### 0.7.3
- Composer and Chat: the microphone button is "Dictate" (voice-to-text), with `onDictate` replacing `onRecord`. `onRecord` still works as a deprecated alias.

### 0.7.2
- ActionBar grows to fill its flex row (`flex: 1 1 auto`) so it measures the real available width and no longer collapses early beside siblings; `justify="end"` aligns the buttons to the end.

### 0.7.1
- Dropdown docs: a "Nested menu" preset and usage notes for submenus.

### 0.7.0
- New `ActionBar`: buttons in a row that overflow into a "more" menu when the container is too narrow. Actions are data (`{ key, label, icon?, onClick?, href?, disabled?, danger?, variant?, color?, items? }`); an action with `items` is a Dropdown inline and a submenu in the "more" menu.

### 0.6.3
- Layer tokens in tokens.css: `--z-hover-card` 20, `--z-dropdown` 30, `--z-tooltip` 40, `--z-toast` 50, `--z-modal` 100. Hover cards now sit below dropdown menus, and an opening Dropdown closes any open HoverCard.

### 0.6.2
- HoverCard `width` and `panelClassName`, Dropdown `menuClassName`: style the portaled panel or menu, which the wrapper's className no longer reaches.

### 0.6.1
- HoverCard panels render in the shared portal, like Dropdown menus, so a sticky table cell can no longer trap them under later rows. Hover is tracked in JS with a short grace period between trigger and panel; the panel sets its own font so it does not inherit a mono or small cell.

### 0.6.0
- HoverCard `anchor` positions the panel against another element's anchor-name; `open` makes it controlled.
- Table `rowAnchors` gives each row `anchor-name: --table-row-<key>` and passes it to `render(row, i, { anchor })`. A cell's HoverCard with that anchor, `side="bottom"` and `align="end"` aligns to the row's right edge and opens below the row.

### 0.5.1
- Dropdown menus render in a portal at the end of body, so they are never clipped by table cells, sticky columns or scrolling panels. Anchoring, flipping, hover, nesting, outside click and Escape behave as before; Escape now returns focus to the trigger. Tokens and theme come from :root, so portaled menus need no extra setup; if you theme a subtree only, theme :root instead.

### 0.5.0
- Table `fill` stretches the table to its container. A column with `flex` (or the last non-sticky column) absorbs the extra width; other columns keep their pixel widths, and resizing, sticky columns and the column menu work as before.

### 0.4.0
- Composer has `onAttach` and `onRecord`, which show the same attach and record buttons Chat uses; `tools` renders after them.
- Composer `leading` aligns with the first line of text and stays put as the box grows.

### 0.3.4
- Autocomplete options match a small field: sm font, height and inset.

### 0.3.3
- Token menu hover follows the chip's corner radius.

### 0.3.2
- Small Selects have small options: sm font, control height and inset.

### 0.3.1
- Token renders a div (valid around its Dropdown) and the menu hover fills the full chip height.

### 0.3.0
- Token variants mirror Button: `default` is the raised look (what `outline` used to be), `outline` is now transparent with a border, `badge` unchanged. Callers using `variant="outline"` for the raised look should switch to `default`.
- Token `icon` accepts an array; each renders before the label.
- New `Textarea`: the Input frame with a growing textarea (`rows`, `maxHeight`, `size`, `mono`).

### 0.2.1
- Token menu highlight fills the whole chip when there is no remove button.
- ListText has top padding, so it works as a plain-case heading at the top of a menu.

### 0.2.0
- Icons come from Lucide (the `lucide` package, icon data only). Every `icon` prop accepts any Lucide name in camelCase, e.g. `circlePlus`, `squareKanban`. The old names still work; `dollar`, `more` and `refresh` are aliases. `iconNames` exports a curated list for pickers.
- `cx` and `IconName` are exported from the package index.
- `Card` has `titleSize`. `Chat` has `grow`. `Composer` has `leading`. `Select` has `prepend`.
- New token `--color-panel`: true white in light mode, a step above the background in dark mode.
- Split no longer adds horizontal overflow when its pane is closed. Select options are vertically centered.
- A Token with a `menu` is itself the trigger: click anywhere on it except the remove button. The chevron is now just an icon.
