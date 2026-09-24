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
