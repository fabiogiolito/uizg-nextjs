import type { ReactNode } from "react";
import { BoardDemo, ComposerDemo, ModalDemo, SplitDemo, TableDemo } from "./demos";
import {
  Attachment, Autocomplete, Avatar, AvatarGroup, Badge, Banner, Blockquote, Button, ButtonGroup, Card, Chat, Checkbox, Choice,
  Citations, Cite, CodeBlock, Collapsible, CollapsibleGroup, ColorPicker, ContextMenu, CopyButton, DataList, Divider,
  Dropdown, DropZone, Frame, HoverCard, Icon, Input, Field, List, ListDivider, ListItem, ListSection, ListText, Questionnaire, Radio,
  ActionBar, type Action, Segmented, Select, Shimmer, Slider, Spinner, Steps, SubMenu, Swatch, Switch, Tabs, TaskList, Text, TextPair, Toaster, toast,
  Textarea, Token, TokenInput, Toolbar, ToolbarGroup, Tooltip, PropsTable, SideNav, type Option,
} from "@/components";
import { VarsTable } from "@/components/VarsTable";
import { iconNames } from "@/components/Icon";
import type { DocEntry } from "./types";
import { jsx, q } from "./code";

const VARIANTS = ["default", "fill", "outline", "flat", "ghost"];
const COLORS = ["default", "primary", "success", "warning", "danger"];
const SIZES = ["sm", "md", "lg"];
const ICONS = iconNames as string[];
const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const bool = (v: unknown) => !!v;
const num = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const opt = <T,>(v: unknown, d: T) => (v === "" || v === undefined ? d : (v as T));

const people: Option[] = ["Ada Lovelace", "Grace Hopper", "Alan Turing", "Katherine Johnson", "Margaret Hamilton"].map((n) => ({ value: n.toLowerCase().replace(" ", "-"), label: n, icon: "user" }));
const menu = (
  <>
    <ListItem icon="copy" label="Duplicate" trailing="⌘D" />
    <ListItem icon="edit" label="Rename" />
    <ListDivider />
    <ListItem icon="trash" label="Delete" danger />
  </>
);
const lorem = "Good design is mostly invisible. You only notice it when it is missing.";

export const registry: DocEntry[] = [
  /* ---------------- Foundations ---------------- */
  {
    slug: "text", name: "Text", group: "Typography", description: "Body, headings and labels from the type scale, all driven by --font-size-base.",
    usage: ["Use size for hierarchy, tone for emphasis; avoid custom font sizes.", "mono switches to the secondary font for code-like values."],
    controls: { children: { type: "text", default: "The quick brown fox jumps over the lazy dog" }, size: { type: "select", options: ["display", "title", "lg", "body", "sm", "label"], default: "body" }, tone: { type: "select", options: ["default", "muted", "subtle"], default: "default" }, weight: { type: "select", options: ["regular", "medium", "bold"], default: "regular" }, mono: { type: "boolean" }, relaxed: { type: "boolean" } },
    extraProps: [{"name": "as", "type": "ElementType", "description": "Tag to render; defaults per size (h1 for display, h2 for title, p otherwise)."}, {"name": "className", "type": "string"}],
    render: (p) => <Text size={opt(p.size, "body")} tone={opt(p.tone, "default")} weight={opt(p.weight, "regular")} mono={bool(p.mono)} relaxed={bool(p.relaxed)}>{str(p.children)}</Text>,
    cssBlocks: ["Text"], related: ["text-pair", "blockquote"],
  },
  {
    slug: "text-pair", name: "TextPair", group: "Typography", description: "A title with a description underneath, closer together than stack spacing.",
    usage: ["Use for any label + explanation: card headers, settings rows, list items, questions.", "Sizes scale both lines together."],
    controls: { title: { type: "text", default: "Notifications" }, description: { type: "text", default: "Choose what you want to be told about." }, size: { type: "select", options: ["sm", "md", "lg", "title"], default: "md" }, align: { type: "select", options: ["start", "center"], default: "start" } },
    extraProps: [{"name": "titleAs", "type": "ElementType", "description": "Tag for the title, e.g. h2 or h3. Defaults to p."}, {"name": "className", "type": "string"}],
    render: (p) => <TextPair title={str(p.title)} description={str(p.description) || undefined} size={opt(p.size, "md")} align={opt(p.align, "start")} />,
    cssBlocks: ["Text pair (title + description, tighter than stack spacing)"], related: ["text"],
  },
  {
    slug: "icon", name: "Icon", group: "Typography", description: "Lucide icons, sized by --icon-size and colored by currentColor. Any name from lucide.dev works, written in camelCase.",
    controls: { name: { type: "select", options: ICONS, default: "settings" }, label: { type: "text", doc: "Accessible label; omit for decorative icons." } },
    extraProps: [{"name": "name", "type": "IconName", "description": "Any Lucide icon in camelCase, e.g. circlePlus. The picker shows a curated subset."}, {"name": "className", "type": "string", "description": "The icon inherits currentColor and --icon-size; size it with a class if needed."}],
    render: (p) => <div className="row">{ICONS.map((n) => <Tooltip key={n} content={n}><span style={{ padding: 6, color: n === p.name ? "var(--color-primary)" : undefined }}><Icon name={n as never} /></span></Tooltip>)}</div>,
    code: (p) => `<Icon name="${str(p.name)}"${p.label ? ` label="${str(p.label)}"` : ""} />`,
    cssBlocks: ["Icon"],
  },
  {
    slug: "blockquote", name: "Blockquote", group: "Typography", description: "Quoted text with a left rule and an optional attribution.",
    controls: { children: { type: "text", default: lorem }, cite: { type: "text", default: "Dieter Rams" }, href: { type: "text" }, size: { type: "select", options: SIZES, default: "md" } },
    extraProps: [{"name": "children", "type": "ReactNode", "description": "The quoted text."}],
    render: (p) => <Blockquote cite={str(p.cite) || undefined} href={str(p.href) || undefined} size={opt(p.size, "md")}>{str(p.children)}</Blockquote>,
    cssBlocks: ["Blockquote"],
  },
  {
    slug: "side-nav", name: "SideNav", group: "Layout", description: "App navigation column: sticky header and footer, a scrolling middle, collapsible and resizable.",
    usage: ["Give it a container with a height; it fills it.", "Put brand, search and primary actions in header; account and secondary actions in footer.", "The body is usually a List; nested ListItems get a guide line."],
    controls: { collapsible: { type: "boolean", default: true }, expandOnHover: { type: "boolean", doc: "When collapsed, hovering the rail peeks the full nav over the page." }, resizable: { type: "boolean", default: true }, border: { type: "boolean", default: true }, footer: { type: "boolean", default: true } },
    extraProps: [{ name: "header / footer / children", type: "ReactNode", description: "Sticky top, sticky bottom, scrolling middle." }, { name: "collapsed / defaultCollapsed / onCollapsedChange", type: "boolean / (collapsed) => void" }, { name: "width / defaultWidth / minWidth / maxWidth / onWidthChange", type: "number / (width) => void", description: "Pixels. Double-click the edge to reset." }],
    render: (p) => (
      <div style={{ height: 520, display: "flex" }}>
        <SideNav
          collapsible={bool(p.collapsible)}
          expandOnHover={bool(p.expandOnHover)}
          resizable={bool(p.resizable)}
          border={bool(p.border)}
          header={<><Text size="title">Email</Text><Input size="sm" icon="search" placeholder="Find message" aria-label="Search" /><Button variant="ghost" block icon="edit">Compose</Button></>}
          footer={bool(p.footer) ? (
            <div className="row">
              <Dropdown side="top" className="grow" trigger={(t) => <Button {...t} variant="ghost" block><Avatar name="Corina McCoy" size="sm" />Corina McCoy</Button>}>
                <ListSection title="Logged in as"><ListText>corina@bytelogic.inc</ListText></ListSection>
                <ListSection><ListItem icon="settings" label="Settings" /><ListItem icon="book" label="Docs" /></ListSection>
                <ListSection><ListItem icon="logOut" label="Log out" danger /></ListSection>
              </Dropdown>
              <Button size="sm" variant="ghost" icon="settings" aria-label="Settings" />
            </div>
          ) : undefined}
        >
          <List>
            <ListItem icon="inbox" label="Inbox" href="#inbox" selected />
            <ListItem icon="tag" label="Tags" collapsible defaultExpanded={false}>
              <ListItem label="Social" href="#social" />
              <ListItem label="Promotions" href="#promotions" />
              <ListItem label="Newsletters" href="#newsletters" />
            </ListItem>
            <ListItem icon="send" label="Outbox" href="#outbox" />
            <ListItem icon="alertTriangle" label="Spam" href="#spam" />
          </List>
        </SideNav>
      </div>
    ),
    code: (p) => `<SideNav${p.collapsible ? " collapsible" : ""}${p.expandOnHover ? " expandOnHover" : ""}${p.resizable ? " resizable" : ""}${p.border ? "" : " border={false}"}\n  header={<><Text size="title">Email</Text><Input size="sm" icon="search" placeholder="Find message" /><Button variant="ghost" block icon="edit">Compose</Button></>}\n${p.footer ? '  footer={<Dropdown side="top" trigger={(t) => <Button {...t} variant="ghost" block><Avatar name="Corina McCoy" size="sm" />Corina McCoy</Button>}>…</Dropdown>}\n' : ""}>\n  <List>\n    <ListItem icon="inbox" label="Inbox" href="/inbox" selected />\n    <ListItem icon="tag" label="Tags" collapsible defaultExpanded={false}>\n      <ListItem label="Social" href="/tags/social" />\n      <ListItem label="Promotions" href="/tags/promotions" />\n    </ListItem>\n    <ListItem icon="send" label="Outbox" href="/outbox" />\n  </List>\n</SideNav>`,
    cssBlocks: ["Side nav"], related: ["list"], previewOn: "surface", previewFlush: true,
  },
  {
    slug: "split", name: "Split", group: "Layout", description: "Primary content with an optional second pane: drag to resize, clamped widths, animated open and close, remembered size.",
    usage: ["Put the page content in children and the detail view in pane; pass null to close it.", "The primary side resizes while the pane fades in, so content can be swapped freely.", "Give it a storageKey to remember the dragged size per screen."],
    controls: { remember: { type: "boolean", default: true, doc: "Persist the size under a storageKey." } },
    extraProps: [{ name: "pane", type: "ReactNode | null", description: "The second pane; null closes it with an animation." }, { name: "defaultSize", type: "number", default: "40", description: "Pane width in percent before any drag." }, { name: "minWidth / maxWidth / minPrimary", type: "number", default: "280 / 720 / 320", description: "Pixel limits for the pane and the primary side. Double-clicking the divider splits the width evenly, within these limits." }, { name: "storageKey", type: "string", description: "localStorage key for the dragged size." }, { name: "onClose", type: "() => void", description: "Called on Escape while the pane is open." }],
    render: (p) => <div style={{ height: 420 }}><SplitDemo p={p} /></div>,
    code: (p) => `<Split${p.remember ? ' storageKey="candidates"' : ""} pane={selected ? <CandidateDetail id={selected} onClose={() => setSelected(null)} /> : null}>\n  <CandidateList onPick={setSelected} />\n</Split>`,
    cssBlocks: ["Split"], related: ["side-nav", "board"], previewOn: "surface", previewFlush: true,
  },
  {
    slug: "board", name: "Board", group: "Layout", description: "Columns of draggable items with fixed headers, scrolling bodies, hover actions and collapsible rails.",
    usage: ["Give the Board a height; columns fill it and their bodies scroll.", "Items drag between columns; handle onMove and update your data.", "Collapsed columns still accept drops, so use them for Archive or Done.", "For a detail view, wrap the Board in a Split and pass the selected item's column to focus; the other columns vanish while the pane opens."],
    controls: { draggable: { type: "boolean", default: true, doc: "Items can be dragged between columns." }, collapsible: { type: "boolean", default: true, doc: "Show the collapse toggle on the first three columns." }, header: { type: "boolean", doc: "Extra header content (a filter) on the first column." } },
    extraProps: [{ name: "Board", type: "{ onMove(itemId, from, to), draggable?, focus?, focusWidth?, children }", description: "draggable defaults to true; items can override it. focus shows one column and animates the rest away; focusWidth caps that column's width." }, { name: "BoardColumn", type: "{ id, title, icon?, count?, actions?, header?, collapsible?, collapsed?, defaultCollapsed?, onCollapsedChange?, children }", description: "actions show at the top right on hover. children are BoardItems, bare or grouped in ListSections; the body spaces them." }, { name: "BoardItem", type: "{ id, leading?, label, description?, trailing?, note?, accent?, selected?, onClick?, draggable? }", description: "A row; onClick opens it, note is an italic line below, accent a bar on the left." }],
    render: (p) => <div style={{ height: 560 }}><BoardDemo p={p} /></div>,
    code: (p) => `<Split pane={selected ? <CandidateDetails id={selected} onClose={close} /> : null} onClose={close}>\n{selected && <Button variant="ghost" icon="arrowLeft" onClick={close}>All columns</Button>}\n<Board onMove={(id, from, to) => moveCandidate(id, from, to)}${p.draggable ? "" : " draggable={false}"} focus={selected ? columnOf(selected) : null}>\n  <BoardColumn id="inbox" icon="inbox" title="Inbox" count={inbox.length}${p.collapsible ? " collapsible" : ""} actions={<Dropdown size="sm" variant="ghost" icon="more" hideChevron>…</Dropdown>}${p.header ? ' header={<Input size="sm" icon="search" placeholder="Filter" />}' : ""}>\n    <List>\n      {inbox.map((c) => (\n        <BoardItem key={c.id} id={c.id} leading={<Avatar name={c.name} size="lg" shape="square" badge={<img src={c.logo} alt="" />} />} label={c.name} description={c.role} trailing={c.age} note={c.note} accent={c.unread} selected={selected === c.id} onClick={() => setSelected(c.id)} />\n      ))}\n    </List>\n  </BoardColumn>\n  <BoardColumn id="interviewing" icon="calendar" title="Interviewing" count={interviewing.length}>\n    <List>\n      <ListSection title="July 15" trailing="Tue">…</ListSection>\n    </List>\n  </BoardColumn>\n  <BoardColumn id="archived" icon="archive" title="Archived" count={archived.length} collapsible defaultCollapsed>…</BoardColumn>\n</Board>\n</Split>`,
    cssBlocks: ["Board"], related: ["card", "list", "avatar"], previewOn: "surface",
  },
  {
    slug: "divider", name: "Divider", group: "Blocks", description: "A horizontal rule, optionally thicker, spaced, or with centered content.",
    controls: { children: { type: "text", default: "" , doc: "Content centered between two lines." }, weight: { type: "select", options: ["default", "thick"], default: "default" }, spacing: { type: "select", options: ["none", "sm", "md", "lg"], default: "none" } },
    states: [{ name: "Plain", props: {} }, { name: "Thick", props: { weight: "thick" } }, { name: "Labeled", props: { children: "March 15, 2026" } }],
    extraProps: [{"name": "className", "type": "string"}],
    render: (p) => <div className="stack"><Text size="sm" tone="muted">Above</Text><Divider weight={opt(p.weight, "default")} spacing={opt(p.spacing, "none")}>{str(p.children) || undefined}</Divider><Text size="sm" tone="muted">Below</Text></div>,
    cssBlocks: ["Divider"],
  },
  {
    slug: "card", name: "Card", group: "Blocks", description: "A box with optional header, body and footer. Also the building block inside a Frame.",
    usage: ["Use title + description for the header; put controls in action.", "Ghost cards carry padding without a box, for content placed on a Frame."],
    controls: { title: { type: "text", default: "Card title" }, description: { type: "text", default: "A short description of what this card holds." }, children: { type: "text", default: "Body content goes here." }, variant: { type: "select", options: ["default", "surface", "elevated", "ghost"], default: "default" }, size: { type: "select", options: SIZES, default: "md" }, sections: { type: "select", options: ["", "column", "row"], default: "", doc: "Nested Cards as divided sections, stacked or side by side." }, action: { type: "boolean", doc: "Show a badge in the header action slot." }, footer: { type: "boolean", doc: "Show footer buttons." } },
    states: [{ name: "Default", props: {} }, { name: "Surface", props: { variant: "surface" } }, { name: "Elevated", props: { variant: "elevated" } }, { name: "With actions", props: { action: true, footer: true } }, { name: "Sections", props: { sections: "column", footer: true }, description: "Nested Cards as divided sections; the middle one grows and scrolls." }, { name: "Row sections", props: { sections: "row" }, description: "Side by side: a fixed pane and a growing surface pane." }],
    extraProps: [{"name": "sizeX / sizeY", "type": "\"sm\" | \"md\" | \"lg\"", "description": "Per-axis padding, overriding size."}, {"name": "grow", "type": "boolean", "description": "Fill a flex parent such as a Frame."}, {"name": "action", "type": "ReactNode", "description": "Right side of the header."}, {"name": "footer", "type": "ReactNode", "description": "Footer row, right-aligned. Any content."}, {"name": "titleSize", "type": "\"sm\" | \"md\" | \"lg\" | \"title\"", "default": "\"lg\"", "description": "TextPair size for the title."}, {"name": "sections", "type": "boolean | \"column\" | \"row\"", "description": "Children are Cards rendered as divided sections, stacked or side by side; a section with grow fills the remaining space. Sections keep their own variant, e.g. surface."}, {"name": "children", "type": "ReactNode", "description": "Body."}],
    render: (p) => str(p.sections) === "row" ? (
      <Card sections="row" variant={opt(p.variant, "default")} size={opt(p.size, "md")} title={str(p.title) || undefined} description={str(p.description) || undefined} action={bool(p.action) ? <Badge color="success" dot>Live</Badge> : undefined} footer={bool(p.footer) ? <><Button variant="ghost">Cancel</Button><Button variant="fill" color="primary">Save</Button></> : undefined}>
        <Card style={{ width: 320 }}>
          <div className="row"><Avatar name="Alex Barnes" size="xl" shape="square" /><TextPair size="lg" title="Alex Barnes" description="Software Engineer" className="grow" /><Badge color="success">95</Badge></div>
          <div className="row"><Button variant="fill" color="primary" icon="checkCircle">Mark done</Button><Button icon="pause">Pause</Button></div>
        </Card>
        <Card grow variant="surface">
          <div className="row"><Text size="label" tone="muted" className="grow">Step 3 · Send SMS</Text><Steps total={5} current={3} /></div>
          <Text as="p">Hello Alex, this is Corina from ByteLogic. I sent you an email about a job position we have open.</Text>
        </Card>
      </Card>
    ) : str(p.sections) === "column" ? (
      <Card sections variant={opt(p.variant, "default")} size={opt(p.size, "md")} title={str(p.title) || undefined} description={str(p.description) || undefined} action={bool(p.action) ? <Badge color="success" dot>Live</Badge> : undefined} footer={bool(p.footer) ? <><Text size="sm" tone="muted" className="grow">3 sections</Text><Button variant="fill" color="primary">Save</Button></> : undefined} style={{ height: 360 }}>
        <Card><Input size="sm" icon="search" placeholder="Filter" aria-label="Filter" /></Card>
        <Card grow><div className="stack stack--tight">{Array.from({ length: 12 }, (_, n) => <Text key={n}>Row {n + 1} scrolls inside the middle section.</Text>)}</div></Card>
        <Card><Text size="sm" tone="muted">12 rows</Text></Card>
      </Card>
    ) : (
      <Card variant={opt(p.variant, "default")} size={opt(p.size, "md")} title={str(p.title) || undefined} description={str(p.description) || undefined} action={bool(p.action) ? <Badge color="success" dot>Live</Badge> : undefined} footer={bool(p.footer) ? <><Button variant="ghost">Cancel</Button><Button variant="fill" color="primary">Save</Button></> : undefined}>{str(p.children) || undefined}</Card>
    ),
    code: (p) => str(p.sections) === "row"
      ? `<Card sections="row">\n  <Card style={{ width: 320 }}>\n    <div className="row"><Avatar name="Alex Barnes" size="xl" shape="square" /><TextPair size="lg" title="Alex Barnes" description="Software Engineer" className="grow" /><Badge color="success">95</Badge></div>\n    <div className="row"><Button variant="fill" color="primary" icon="checkCircle">Mark done</Button><Button icon="pause">Pause</Button></div>\n  </Card>\n  {/* grow fills the remaining width; sections keep their variant. */}\n  <Card grow variant="surface">\n    <div className="row"><Text size="label" tone="muted" className="grow">Step 3 · Send SMS</Text><Steps total={5} current={3} /></div>\n    <Text as="p">Hello Alex…</Text>\n  </Card>\n</Card>`
      : str(p.sections) === "column"
      ? `<Card sections${p.variant !== "default" ? ` variant="${str(p.variant)}"` : ""}${p.size !== "md" ? ` size="${str(p.size)}"` : ""}${str(p.title) ? ` title="${str(p.title)}"` : ""}${str(p.description) ? ` description="${str(p.description)}"` : ""}${p.action ? ' action={<Badge color="success" dot>Live</Badge>}' : ""}${p.footer ? ' footer={<><Text size="sm" tone="muted" className="grow">3 sections</Text><Button variant="fill" color="primary">Save</Button></>}' : ""} style={{ height: 360 }}>\n  {/* Each child Card is a section with a divider between them. */}\n  <Card><Input size="sm" icon="search" placeholder="Filter" /></Card>\n  {/* grow fills the remaining height and scrolls. */}\n  <Card grow>{rows.map((r) => <Text key={r}>{r}</Text>)}</Card>\n  <Card><Text size="sm" tone="muted">12 rows</Text></Card>\n</Card>`
      : jsx("Card", { variant: p.variant !== "default" ? q(str(p.variant)) : undefined, size: p.size !== "md" ? q(str(p.size)) : undefined, title: str(p.title) ? q(str(p.title)) : undefined, description: str(p.description) ? q(str(p.description)) : undefined, action: p.action ? "{<Badge color=\"success\" dot>Live</Badge>}" : undefined, footer: p.footer ? "{<><Button variant=\"ghost\">Cancel</Button><Button variant=\"fill\" color=\"primary\">Save</Button></>}" : undefined }, str(p.children) ? [str(p.children)] : []),
    cssBlocks: ["Card"], related: ["frame", "banner"],
  },
  {
    slug: "frame", name: "Frame", group: "Blocks", description: "A surface that groups cards with a small inset; ghost cards put content straight on it.",
    controls: { direction: { type: "select", options: ["column", "row"], default: "column" }, color: { type: "select", options: ["", "primary", "success", "warning", "danger"], default: "", doc: "Tints the surface with the color at 5%." } },
    extraProps: [{"name": "children", "type": "ReactNode", "description": "Cards. Use variant=\"ghost\" for content directly on the surface, grow to fill a row."}],
    render: (p) => <Frame direction={opt(p.direction, "column")} color={opt(p.color, undefined) as never}><Card variant="ghost"><TextPair size="lg" title="Section header" description="Brief description" /></Card><Card grow><TextPair size="lg" title="Section title" description="Section description" /></Card><Card variant="ghost"><Text tone="muted">Footer</Text></Card></Frame>,
    code: (p) => `<Frame${p.direction === "row" ? ' direction="row"' : ""}${str(p.color) ? ` color="${str(p.color)}"` : ""}>\n  <Card variant="ghost"><TextPair size="lg" title="Section header" description="Brief description" /></Card>\n  <Card grow><TextPair size="lg" title="Section title" description="Section description" /></Card>\n  <Card variant="ghost"><Text tone="muted">Footer</Text></Card>\n</Frame>`,
    cssBlocks: ["Frame"], related: ["card"], previewOn: "raised",
  },
  {
    slug: "swatch", name: "Swatch", group: "Blocks", description: "Color preview on a checkerboard with the code written over it.",
    controls: { color: { type: "text", default: "hsl(226 100% 59% / 0.8)" }, name: { type: "text", default: "--color-primary" }, size: { type: "select", options: SIZES, default: "md" } },
    extraProps: [{"name": "label", "type": "ReactNode", "description": "Text over the color; defaults to the color string. Pass \"\" to hide it."}],
    render: (p) => <Swatch color={str(p.color)} name={str(p.name) || undefined} size={opt(p.size, "md")} />,
    cssBlocks: ["Swatch"], related: ["color-picker"],
  },
  /* ---------------- Actions ---------------- */
  {
    slug: "button", name: "Button", group: "Actions", description: "The primary interactive element. Two axes: variant decides the style, color the accent.",
    usage: ["Default is raised. Use fill + primary for the main action, ghost for secondary actions in dense UI.", "A color on the default variant only tints the label.", "Icon-only buttons need an aria-label."],
    controls: { children: { type: "text", default: "Save changes" }, variant: { type: "select", options: VARIANTS, default: "default" }, color: { type: "select", options: COLORS, default: "default" }, size: { type: "select", options: SIZES, default: "md" }, icon: { type: "select", options: ["", ...ICONS], default: "" }, trailingIcon: { type: "select", options: ["", ...ICONS], default: "" }, trailing: { type: "text", doc: "Content pushed to the end, e.g. a shortcut." }, block: { type: "boolean" }, disabled: { type: "boolean" } },
    states: [{ name: "Default", props: {} }, { name: "Primary", props: { variant: "fill", color: "primary", icon: "check" } }, { name: "Outline", props: { variant: "outline" } }, { name: "Flat danger", props: { variant: "flat", color: "danger", icon: "trash", children: "Delete" } }, { name: "Ghost small", props: { variant: "ghost", size: "sm" } }, { name: "Icon only", props: { children: "", icon: "settings" } }, { name: "Disabled", props: { disabled: true } }],
    extraProps: [{"name": "href", "type": "string", "description": "Render as a link (next/link)."}, {"name": "active", "type": "boolean", "description": "Sets aria-current."}, {"name": "type", "type": "\"button\" | \"submit\"", "description": "Defaults to button."}, {"name": "onClick", "type": "(e) => void"}, {"name": "ref", "type": "Ref<HTMLButtonElement>"}, {"name": "…", "type": "Plus every native attribute of the underlying element (id, name, onChange, aria-*, data-*)."}],
    render: (p) => <Button variant={opt(p.variant, "default")} color={opt(p.color, "default")} size={opt(p.size, "md")} icon={opt(p.icon, undefined) as never} trailingIcon={opt(p.trailingIcon, undefined) as never} trailing={str(p.trailing) || undefined} block={bool(p.block)} disabled={bool(p.disabled)} aria-label={str(p.children) ? undefined : "Button"}>{str(p.children) || undefined}</Button>,
    cssBlocks: ["Button"], related: ["button-group", "copy-button", "dropdown"],
  },
  {
    slug: "button-group", name: "ButtonGroup", group: "Actions", description: "Joins buttons, choices, inputs and selects into one element with shared corners.",
    controls: { block: { type: "boolean" } },
    states: [{ name: "Buttons", props: { kind: "buttons" } }, { name: "Split", props: { kind: "split" } }, { name: "Radios", props: { kind: "radios" } }, { name: "Stepper", props: { kind: "stepper" } }],
    extraProps: [{"name": "children", "type": "ReactNode", "description": "Button, Choice (inline), Input, Select or Dropdown members. Only the outer corners stay rounded."}],
    render: (p) => {
      const kind = str(p.kind, "buttons");
      if (kind === "split") return <ButtonGroup block={bool(p.block)}><Button variant="fill" color="primary">Save</Button><Dropdown variant="fill" color="primary" hideChevron icon="chevronDown" triggerLabel="More" align="right"><ListItem label="Save and close" /><ListItem label="Save as template" /></Dropdown></ButtonGroup>;
      if (kind === "radios") return <ButtonGroup block={bool(p.block)}>{["Day", "Week", "Month"].map((v) => <Choice key={v} inline hideControl type="radio" name="pg-range" value={v} title={v} defaultChecked={v === "Week"} />)}</ButtonGroup>;
      if (kind === "stepper") return <ButtonGroup block={bool(p.block)}><Button icon="minus" aria-label="Decrease" /><Input type="number" defaultValue={2} aria-label="Quantity" style={{ width: 56 }} /><Button icon="plus" aria-label="Increase" /></ButtonGroup>;
      return <ButtonGroup block={bool(p.block)}><Button variant="flat" icon="copy">Copy</Button><Button variant="flat" icon="edit">Cut</Button><Button variant="flat" icon="file">Paste</Button></ButtonGroup>;
    },
    code: (p) => ({
      buttons: `<ButtonGroup>\n  <Button variant="flat" icon="copy">Copy</Button>\n  <Button variant="flat" icon="edit">Cut</Button>\n  <Button variant="flat" icon="file">Paste</Button>\n</ButtonGroup>`,
      split: `<ButtonGroup>\n  <Button variant="fill" color="primary">Save</Button>\n  <Dropdown variant="fill" color="primary" hideChevron icon="chevronDown" align="right">…</Dropdown>\n</ButtonGroup>`,
      radios: `<ButtonGroup>\n  <Choice inline hideControl type="radio" name="range" value="day" title="Day" />\n  …\n</ButtonGroup>`,
      stepper: `<ButtonGroup>\n  <Button icon="minus" aria-label="Decrease" />\n  <Input type="number" value={qty} />\n  <Button icon="plus" aria-label="Increase" />\n</ButtonGroup>`,
    })[str(p.kind, "buttons")] ?? "",
    cssBlocks: ["Button group"], related: ["button", "toolbar"],
  },
  {
    slug: "copy-button", name: "CopyButton", group: "Actions", description: "A Button that copies text, a promise or a function result to the clipboard and confirms.",
    usage: ["value is what gets copied: a string, a promise, or a function returning either.", "The icon switches to a check and the label to copiedLabel for two seconds."],
    controls: { children: { type: "text", default: "Copy link" }, valueKind: { type: "select", options: ["text", "function", "promise"], default: "text", doc: "What kind of value to copy." }, copiedLabel: { type: "text", default: "Copied" }, iconPosition: { type: "select", options: ["leading", "trailing", "none"], default: "leading" }, variant: { type: "select", options: VARIANTS, default: "default" }, size: { type: "select", options: SIZES, default: "md" } },
    render: (p) => { const kind = str(p.valueKind, "text"); const value = kind === "function" ? () => new Date().toISOString() : kind === "promise" ? new Promise<string>((r) => setTimeout(() => r("resolved later"), 300)) : "https://example.com/share/abc"; return <CopyButton value={value} copiedLabel={str(p.copiedLabel)} iconPosition={opt(p.iconPosition, "leading")} variant={opt(p.variant, "default")} size={opt(p.size, "md")} aria-label="Copy">{str(p.children) || undefined}</CopyButton>; },
    code: (p) => { const kind = str(p.valueKind, "text"); const value = kind === "function" ? "{() => buildShareLink()}" : kind === "promise" ? "{fetchShareLink()}" : q("https://example.com/share/abc"); return jsx("CopyButton", { value, copiedLabel: p.copiedLabel !== "Copied" ? q(str(p.copiedLabel)) : undefined, iconPosition: p.iconPosition !== "leading" ? q(str(p.iconPosition)) : undefined, variant: p.variant !== "default" ? q(str(p.variant)) : undefined, size: p.size !== "md" ? q(str(p.size)) : undefined }, str(p.children) || undefined); },
    extraProps: [{ name: "value", type: "string | Promise<string> | (() => string | Promise<string>)", description: "What to copy. Functions are called on click and their result (or resolved value) is copied." }, { name: "onCopied", type: "(text: string) => void" }],
    cssBlocks: ["Button"], related: ["button"],
  },
  {
    slug: "action-bar", name: "ActionBar", group: "Actions", description: "Buttons in a row; the ones that do not fit move into a \"more\" menu.",
    usage: ["Pass actions as data so each one can render as a button or a menu item.", "Order matters: trailing actions are the first to overflow.", "The bar takes its container's width; narrow the preview to see the menu appear."],
    controls: { width: { type: "number", default: 520, min: 120, max: 720, step: 10, doc: "Container width in px, to try the overflow." }, size: { type: "select", options: SIZES, default: "md" }, justify: { type: "select", options: ["start", "end"], default: "start", doc: "Alignment inside the bar, which grows to fill its row." }, icons: { type: "boolean", default: true }, header: { type: "boolean", doc: "Place the bar in a header row next to a title and a Save button." }, pinned: { type: "boolean", doc: "Add two actions with overflow=\"always\" that only ever show in the menu." } },
    states: [{ name: "Default", props: {} }, { name: "In a header row", props: { header: true, justify: "end", width: 720, size: "sm", icons: false }, description: "Next to a title and another button, the bar takes the free space and shows every action that fits." }, { name: "Always in the menu", props: { pinned: true }, description: "Skip and Remove have overflow=\"always\": the menu is always there and they never take inline room." }],
    extraProps: [{ name: "actions", type: "{ key, label, icon?, onClick?, href?, disabled?, danger?, variant?, color?, items?, overflow? }[]", description: "items (ListItems) makes the action a Dropdown inline and a submenu when it overflows. overflow=\"always\" keeps it in the menu even when there is room." }, { name: "moreLabel", type: "string", default: "\"More\"", description: "Accessible label of the overflow trigger." }],
    render: (p) => (
      <div className={bool(p.header) ? "row" : undefined} style={{ width: Number(p.width), maxWidth: "100%", outline: "1px dashed var(--color-border-strong)", outlineOffset: 4 }}>
        {bool(p.header) && <TextPair size="lg" title="Fullstack Engineer" description="ByteLogic · 12 candidates" className="grow" />}
        <ActionBar size={opt(p.size, "md")} justify={opt(p.justify, "start")} actions={[
          { key: "edit", label: "Edit", icon: bool(p.icons) ? "edit" : undefined, variant: "fill", color: "primary" },
          { key: "share", label: "Share", icon: bool(p.icons) ? "send" : undefined },
          { key: "duplicate", label: "Duplicate", icon: bool(p.icons) ? "copy" : undefined },
          { key: "move", label: "Move to", icon: bool(p.icons) ? "inbox" : undefined, items: <><ListItem label="Inbox" /><ListItem label="Archive" /><ListItem label="Trash" /></> },
          { key: "archive", label: "Archive", icon: bool(p.icons) ? "archive" : undefined },
          { key: "delete", label: "Delete", icon: bool(p.icons) ? "trash" : undefined, danger: true },
          ...(bool(p.pinned) ? ([{ key: "skip", label: "Skip this step", icon: bool(p.icons) ? "arrowRight" : undefined, overflow: "always" }, { key: "remove", label: "Remove from pipeline", icon: bool(p.icons) ? "xCircle" : undefined, danger: true, overflow: "always" }] as Action[]) : []),
        ]} />
        {bool(p.header) && <Button size={opt(p.size, "md")} variant="fill" color="primary">Save</Button>}
      </div>
    ),
    code: (p) => `${p.header ? '<div className="row">\n  <TextPair size="lg" title="Fullstack Engineer" className="grow" />\n  ' : ""}<ActionBar${p.size !== "md" ? ` size="${str(p.size)}"` : ""}${p.justify === "end" ? ' justify="end"' : ""} actions={[\n  { key: "edit", label: "Edit", icon: "edit", variant: "fill", color: "primary", onClick: edit },\n  { key: "share", label: "Share", icon: "send", onClick: share },\n  { key: "duplicate", label: "Duplicate", icon: "copy", onClick: duplicate },\n  { key: "move", label: "Move to", icon: "inbox", items: <><ListItem label="Inbox" /><ListItem label="Archive" /></> },\n  { key: "archive", label: "Archive", icon: "archive", onClick: archive },\n  { key: "delete", label: "Delete", icon: "trash", danger: true, onClick: remove },\n${p.pinned ? '  { key: "skip", label: "Skip this step", icon: "arrowRight", overflow: "always", onClick: skip },\n  { key: "remove", label: "Remove from pipeline", icon: "xCircle", danger: true, overflow: "always", onClick: removeFromPipeline },\n' : ""}]} />${p.header ? '\n  <Button variant="fill" color="primary">Save</Button>\n</div>' : ""}`,
    cssBlocks: ["Action bar"], related: ["button", "dropdown", "toolbar"],
  },
  {
    slug: "toolbar", name: "Toolbar", group: "Actions", description: "A raised bar of grouped controls with separators. Members keep their own styles.",
    controls: { variant: { type: "select", options: ["default", "ghost"], default: "default" }, block: { type: "boolean" } },
    extraProps: [{"name": "children", "type": "ReactNode", "description": "ToolbarGroup elements; groups get a separator between them. ToolbarGroup accepts end to push it to the far side; ToolbarSeparator adds a line inside a group."}, {"name": "aria-label", "type": "string"}],
    render: (p) => <Toolbar variant={opt(p.variant, "default")} block={bool(p.block)} aria-label="Formatting"><ToolbarGroup>{(["alignLeft", "alignCenter", "alignRight"] as const).map((i, n) => <Choice key={i} inline hideControl type="radio" name="pg-align" value={i} icon={i} title="" aria-label={i} defaultChecked={n === 0} />)}</ToolbarGroup><ToolbarGroup><Button variant="ghost" icon="dollar" aria-label="Currency" /><Button variant="ghost" icon="percent" aria-label="Percent" /></ToolbarGroup><ToolbarGroup end><Button variant="fill">Save</Button></ToolbarGroup></Toolbar>,
    code: (p) => `<Toolbar${p.variant === "ghost" ? ' variant="ghost"' : ""}${p.block ? " block" : ""} aria-label="Formatting">\n  <ToolbarGroup>\n    <Choice inline hideControl type="radio" name="align" value="left" icon="alignLeft" title="" aria-label="Align left" />\n    …\n  </ToolbarGroup>\n  <ToolbarGroup>\n    <Button variant="ghost" icon="dollar" aria-label="Currency" />\n  </ToolbarGroup>\n  <ToolbarGroup end>\n    <Button variant="fill">Save</Button>\n  </ToolbarGroup>\n</Toolbar>`,
    cssBlocks: ["Toolbar"], related: ["button-group", "composer"],
  },
  /* ---------------- Status ---------------- */
  {
    slug: "steps", name: "Steps", group: "Status", description: "A row of dots showing progress through a fixed number of steps.",
    controls: { total: { type: "number", default: 5, min: 1, max: 12 }, current: { type: "number", default: 3, min: 0, max: 12 } },
    render: (p) => <Steps total={Number(p.total)} current={Number(p.current)} />,
    cssBlocks: ["Steps"], related: ["badge", "questionnaire"],
  },
  {
    slug: "badge", name: "Badge", group: "Status", description: "Small label for status and counts. Same variant and color axes as Button.",
    controls: { children: { type: "text", default: "Active" }, variant: { type: "select", options: VARIANTS, default: "default" }, color: { type: "select", options: COLORS, default: "default" }, dot: { type: "boolean" }, icon: { type: "select", options: ["", ...ICONS], default: "" } },
    states: [{ name: "Default", props: {} }, { name: "Success dot", props: { color: "success", dot: true } }, { name: "Flat warning", props: { variant: "flat", color: "warning", children: "Pending" } }, { name: "Fill danger", props: { variant: "fill", color: "danger", children: "Failed", icon: "x" } }, { name: "Outline", props: { variant: "outline", color: "primary" } }],
    extraProps: [{"name": "children", "type": "ReactNode"}, {"name": "className", "type": "string"}],
    render: (p) => <Badge variant={opt(p.variant, "default")} color={opt(p.color, "default")} dot={bool(p.dot)} icon={opt(p.icon, undefined) as never}>{str(p.children)}</Badge>,
    cssBlocks: ["Badge"], related: ["banner", "token"],
  },
  {
    slug: "banner", name: "Banner", group: "Status", description: "A card-shaped message with an icon, colored like a badge. Flat tint by default.",
    controls: { title: { type: "text", default: "Your trial expires in 3 days." }, description: { type: "text", default: "Upgrade to keep access to all features." }, variant: { type: "select", options: VARIANTS, default: "flat" }, color: { type: "select", options: COLORS, default: "default" }, actions: { type: "boolean" }, dismissible: { type: "boolean" } },
    states: [{ name: "Info", props: { color: "primary", title: "A new software update is available.", description: "" } }, { name: "Success", props: { color: "success", title: "Your changes have been saved.", description: "" } }, { name: "Warning", props: { color: "warning", actions: true } }, { name: "Danger", props: { color: "danger", title: "Payment failed.", description: "Update your billing information to continue.", dismissible: true } }],
    extraProps: [{"name": "icon", "type": "IconName | null", "description": "Defaults to an icon matching the color; null hides it."}, {"name": "actions", "type": "ReactNode", "description": "Buttons or links at the end."}, {"name": "onDismiss", "type": "() => void", "description": "Shows the dismiss button."}],
    render: (p) => <Banner variant={opt(p.variant, "flat")} color={opt(p.color, "default")} title={str(p.title)} description={str(p.description) || undefined} actions={bool(p.actions) ? <Button size="sm" variant="fill" color={opt(p.color, "default") === "default" ? "primary" : (opt(p.color, "primary") as never)}>Upgrade</Button> : undefined} onDismiss={bool(p.dismissible) ? () => {} : undefined} />,
    cssBlocks: ["Banner"], related: ["badge", "toast"],
  },
  {
    slug: "toast", name: "Toast", group: "Status", description: "Temporary messages in a corner. Call toast() from anywhere; mount one Toaster.",
    usage: ["Temporary toasts leave on their own; permanent and urgent ones wait to be dismissed.", "Urgent toasts never stack. Hover the stack to spread it."],
    controls: { title: { type: "text", default: "Brew log saved" }, description: { type: "text", default: "Your notes are in the log." }, color: { type: "select", options: COLORS, default: "success" }, icon: { type: "select", options: ["", ...ICONS], default: "", doc: "Defaults to an icon matching the color." }, mode: { type: "select", options: ["temporary", "permanent", "urgent"], default: "temporary" }, dismissible: { type: "boolean", default: true }, position: { type: "select", options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"], default: "bottom-right" } },
    render: (p) => <div className="row"><Button onClick={() => toast({ title: str(p.title), description: str(p.description) || undefined, color: opt(p.color, "default") as never, icon: opt(p.icon, undefined) as never, mode: opt(p.mode, "temporary") as never, dismissible: bool(p.dismissible) })}>Show toast</Button><Button variant="ghost" onClick={() => toast.clear()}>Clear all</Button><Toaster position={opt(p.position, "bottom-right") as never} /></div>,
    code: (p) => `const id = toast({\n  title: "${str(p.title)}",\n  description: "${str(p.description)}",\n  color: "${str(p.color)}",${str(p.icon) ? `\n  icon: "${str(p.icon)}",` : ""}\n  mode: "${str(p.mode)}",${bool(p.dismissible) ? "" : "\n  dismissible: false,"}\n  // actions: (dismiss) => <Button onClick={dismiss}>Undo</Button>,\n});\n// toast.dismiss(id); toast.clear();\n\n// once, near the root:\n<Toaster position="${str(p.position)}" />`,
    extraProps: [{ name: "actions", type: "(dismiss) => ReactNode", description: "Buttons under the text; call dismiss to close." }, { name: "content", type: "(dismiss) => ReactNode", description: "Replaces the whole body." }, { name: "duration", type: "number", default: "5000", description: "Milliseconds before a temporary toast leaves." }],
    cssBlocks: ["Toast"], related: ["banner"],
  },
  {
    slug: "spinner", name: "Spinner", group: "Status", description: "Rotating arc for loading, sized like an icon.",
    controls: { size: { type: "select", options: SIZES, default: "md" }, label: { type: "text", default: "Loading" } },
    extraProps: [{"name": "className", "type": "string"}],
    render: (p) => <Spinner size={opt(p.size, "md")} label={str(p.label)} />,
    cssBlocks: ["Spinner"], related: ["shimmer"],
  },
  {
    slug: "shimmer", name: "Shimmer", group: "Status", description: "A light sweep across text for things in progress.",
    controls: { children: { type: "text", default: "Thinking about the next step…" }, active: { type: "boolean", default: true } },
    extraProps: [{"name": "as", "type": "ElementType", "description": "Tag to render, defaults to span."}],
    render: (p) => <Shimmer active={bool(p.active)}>{str(p.children)}</Shimmer>,
    cssBlocks: ["Shimmer"], related: ["spinner", "task-list"],
  },
  /* ---------------- Inputs ---------------- */
  {
    slug: "input", name: "Input", group: "Inputs", description: "Text field with icon, prepend/append addons and a trailing slot. Wrap in Field for label and hint.",
    controls: { placeholder: { type: "text", default: "you@example.com" }, size: { type: "select", options: SIZES, default: "md" }, icon: { type: "select", options: ["", ...ICONS], default: "" }, prepend: { type: "text" }, append: { type: "text" }, mono: { type: "boolean" }, disabled: { type: "boolean" }, label: { type: "text", default: "Email", doc: "Field label" }, hint: { type: "text", doc: "Field hint" }, error: { type: "boolean", doc: "Field error state" } },
    states: [{ name: "Plain", props: {} }, { name: "With icon", props: { icon: "search", placeholder: "Search…", label: "" } }, { name: "Addons", props: { prepend: "https://", append: ".com", placeholder: "yoursite", label: "Site" } }, { name: "Error", props: { error: true, hint: "Invalid address.", mono: true } }],
    extraProps: [{"name": "value / defaultValue", "type": "string", "description": "Controlled with onChange, or uncontrolled."}, {"name": "onChange", "type": "(e: ChangeEvent<HTMLInputElement>) => void"}, {"name": "type", "type": "string", "description": "Any input type: text, email, number, password…"}, {"name": "leading / trailing", "type": "ReactNode", "description": "Content inside the field before or after the control (tokens, badges, buttons)."}, {"name": "wrap", "type": "boolean", "description": "Field grows and wraps its leading content (used by TokenInput)."}, {"name": "ref", "type": "Ref<HTMLInputElement>"}, {"name": "…", "type": "Plus every native attribute of the underlying element (id, name, onChange, aria-*, data-*)."}, {"name": "Field", "type": "{ label?, hint?, error?, children }", "description": "Wrapper component that adds the label above and hint below."}],
    render: (p) => <Field label={str(p.label) || undefined} hint={str(p.hint) || undefined} error={bool(p.error)}><Input placeholder={str(p.placeholder)} size={opt(p.size, "md")} icon={opt(p.icon, undefined) as never} prepend={str(p.prepend) || undefined} append={str(p.append) || undefined} mono={bool(p.mono)} disabled={bool(p.disabled)} /></Field>,
    code: (p) => `<Field${p.label ? ` label="${str(p.label)}"` : ""}${p.hint ? ` hint="${str(p.hint)}"` : ""}${p.error ? " error" : ""}>\n  <Input placeholder="${str(p.placeholder)}"${p.size !== "md" ? ` size="${str(p.size)}"` : ""}${p.icon ? ` icon="${str(p.icon)}"` : ""}${p.prepend ? ` prepend="${str(p.prepend)}"` : ""}${p.append ? ` append="${str(p.append)}"` : ""}${p.mono ? " mono" : ""}${p.disabled ? " disabled" : ""} />\n</Field>`,
    cssBlocks: ["Input"], related: ["select", "autocomplete", "token-input"],
  },
  {
    slug: "textarea", name: "Textarea", group: "Inputs", description: "Multi-line Input in the same field frame; grows with content from rows up to a max height.",
    controls: { placeholder: { type: "text", default: "Describe the ideal candidate…" }, rows: { type: "number", default: 3, min: 1, max: 10 }, size: { type: "select", options: SIZES, default: "md" }, mono: { type: "boolean" } },
    extraProps: [{ name: "maxHeight", type: "string | number", default: "240", description: "Stops growing here and scrolls." }, { name: "...textarea props", type: "TextareaHTMLAttributes", description: "value, onChange, disabled and the rest." }],
    render: (p) => <Textarea placeholder={str(p.placeholder)} rows={Number(p.rows)} size={opt(p.size, "md")} mono={bool(p.mono)} />,
    code: (p) => jsx("Textarea", { placeholder: q(str(p.placeholder)), rows: p.rows !== 3 ? `{${Number(p.rows)}}` : undefined, size: p.size !== "md" ? q(str(p.size)) : undefined, mono: bool(p.mono) }),
    cssBlocks: ["Input"], related: ["input", "composer"],
  },
  {
    slug: "select", name: "Select", group: "Inputs", description: "The native select styled as an input or a button. Rich options where the browser supports customizable selects.",
    controls: { look: { type: "select", options: ["input", "button"], default: "input" }, size: { type: "select", options: SIZES, default: "md" }, icon: { type: "select", options: ["", ...ICONS], default: "" }, placeholder: { type: "text" }, disabled: { type: "boolean" } },
    extraProps: [{"name": "options", "type": "{ value, label, icon?, description?, disabled? }[]", "description": "Or pass <option> children."}, {"name": "prepend", "type": "ReactNode", "description": "Label inside the control before the value, e.g. Minimum."}, {"name": "value / defaultValue", "type": "string"}, {"name": "onChange", "type": "(e: ChangeEvent<HTMLSelectElement>) => void"}, {"name": "block", "type": "boolean"}, {"name": "…", "type": "Plus every native attribute of the underlying element (id, name, onChange, aria-*, data-*)."}],
    render: (p) => <Select look={opt(p.look, "input")} size={opt(p.size, "md")} icon={opt(p.icon, undefined) as never} placeholder={str(p.placeholder) || undefined} defaultValue={str(p.placeholder) ? "" : "editor"} disabled={bool(p.disabled)} options={[{ value: "viewer", label: "Viewer", icon: "eye", description: "Can read" }, { value: "editor", label: "Editor", icon: "edit", description: "Can read and write" }, { value: "admin", label: "Admin", icon: "settings", description: "Full access" }]} />,
    code: (p) => jsx("Select", { look: p.look !== "input" ? q(str(p.look)) : undefined, size: p.size !== "md" ? q(str(p.size)) : undefined, icon: str(p.icon) ? q(str(p.icon)) : undefined, placeholder: str(p.placeholder) ? q(str(p.placeholder)) : undefined, value: "{role}", onChange: "{(e) => setRole(e.target.value)}", options: '{[\n    { value: "viewer", label: "Viewer", icon: "eye", description: "Can read" },\n    { value: "editor", label: "Editor", icon: "edit", description: "Can read and write" },\n    { value: "admin", label: "Admin", icon: "settings", description: "Full access" },\n  ]}' }),
    cssBlocks: ["Select"], related: ["input", "dropdown"],
  },
  {
    slug: "checkbox", name: "Checkbox", group: "Inputs", description: "Custom-styled checkbox with label, description and an indeterminate state.",
    controls: { label: { type: "text" }, description: { type: "text" }, defaultChecked: { type: "boolean", doc: "Initial state when uncontrolled." }, size: { type: "select", options: ["sm", "md"], default: "md" }, indeterminate: { type: "boolean" }, disabled: { type: "boolean" } },
    states: [{ name: "Unchecked", props: {} }, { name: "Checked", props: { defaultChecked: true } }, { name: "With label", props: { label: "Email notifications", defaultChecked: true } }, { name: "With description", props: { label: "Email notifications", description: "Get a digest every morning." } }, { name: "Indeterminate", props: { label: "Select all", indeterminate: true } }, { name: "Small", props: { size: "sm" } }],
    extraProps: [{"name": "name", "type": "string"}, {"name": "checked / defaultChecked", "type": "boolean"}, {"name": "onChange", "type": "(e: ChangeEvent<HTMLInputElement>) => void"}, {"name": "value", "type": "string"}, {"name": "…", "type": "Plus every native attribute of the underlying element (id, name, onChange, aria-*, data-*)."}],
    render: (p) => <Checkbox key={String(p.defaultChecked)} label={str(p.label) || undefined} description={str(p.description) || undefined} size={opt(p.size, "md")} indeterminate={bool(p.indeterminate)} disabled={bool(p.disabled)} defaultChecked={bool(p.defaultChecked)} aria-label={str(p.label) ? undefined : "Checkbox"} />,
    cssBlocks: ["Checkbox"], related: ["radio", "switch", "choice"],
  },
  {
    slug: "radio", name: "Radio", group: "Inputs", description: "Single choice within a name group, with label and description.",
    controls: { size: { type: "select", options: ["sm", "md"], default: "md" }, disabled: { type: "boolean" } },
    extraProps: [{"name": "name", "type": "string", "description": "Radios with the same name form one group."}, {"name": "value", "type": "string"}, {"name": "label", "type": "ReactNode"}, {"name": "description", "type": "ReactNode"}, {"name": "checked / defaultChecked", "type": "boolean"}, {"name": "onChange", "type": "(e: ChangeEvent<HTMLInputElement>) => void"}, {"name": "…", "type": "Plus every native attribute of the underlying element (id, name, onChange, aria-*, data-*)."}],
    render: (p) => <div className="stack stack--tight"><Radio name="pg-plan" label="Free" description="For trying things out." size={opt(p.size, "md")} defaultChecked disabled={bool(p.disabled)} /><Radio name="pg-plan" label="Pro" description="For teams that ship." size={opt(p.size, "md")} disabled={bool(p.disabled)} /></div>,
    code: (p) => `<Radio name="plan" label="Free" description="For trying things out."${p.size === "sm" ? ' size="sm"' : ""} defaultChecked />\n<Radio name="plan" label="Pro" description="For teams that ship."${p.size === "sm" ? ' size="sm"' : ""} />`,
    cssBlocks: ["Radio"], related: ["checkbox", "choice"],
  },
  {
    slug: "switch", name: "Switch", group: "Inputs", description: "On/off toggle on a hidden checkbox.",
    controls: { label: { type: "text" }, description: { type: "text" }, defaultChecked: { type: "boolean", doc: "Initial state when uncontrolled." }, size: { type: "select", options: ["sm", "md"], default: "md" }, labelFirst: { type: "boolean" }, disabled: { type: "boolean" } },
    states: [{ name: "Off", props: {} }, { name: "On", props: { defaultChecked: true } }, { name: "With label", props: { label: "Auto-save", defaultChecked: true } }, { name: "With description", props: { label: "Auto-save", description: "Save the brew log after every change." } }, { name: "Label first", props: { label: "Auto-save", labelFirst: true } }, { name: "Small", props: { size: "sm" } }],
    extraProps: [{"name": "name", "type": "string"}, {"name": "checked / defaultChecked", "type": "boolean"}, {"name": "onChange", "type": "(e: ChangeEvent<HTMLInputElement>) => void"}, {"name": "…", "type": "Plus every native attribute of the underlying element (id, name, onChange, aria-*, data-*)."}],
    render: (p) => <Switch key={String(p.defaultChecked)} label={str(p.label) || undefined} description={str(p.description) || undefined} size={opt(p.size, "md")} labelFirst={bool(p.labelFirst)} disabled={bool(p.disabled)} defaultChecked={bool(p.defaultChecked)} aria-label={str(p.label) ? undefined : "Switch"} />,
    cssBlocks: ["Switch"], related: ["checkbox"],
  },
  {
    slug: "choice", name: "Choice", group: "Inputs", description: "A selectable card or tag: the whole surface is the label for a checkbox or radio.",
    controls: { title: { type: "text", default: "Daily backups" }, description: { type: "text", default: "Restore any version from the last 30 days." }, type: { type: "select", options: ["checkbox", "radio"], default: "checkbox" }, variant: { type: "select", options: ["default", "surface", "plain"], default: "default" }, icon: { type: "select", options: ["", ...ICONS], default: "" }, trailing: { type: "text", default: "$5/mo" }, hideControl: { type: "boolean" }, inline: { type: "boolean" }, defaultChecked: { type: "boolean", default: true }, disabled: { type: "boolean" } },
    states: [{ name: "Card", props: {} }, { name: "Surface radio", props: { type: "radio", variant: "surface" } }, { name: "No control", props: { hideControl: true, trailing: "" } }, { name: "Inline tag", props: { inline: true, description: "", trailing: "" } }, { name: "Plain list", props: { variant: "plain", trailing: "", description: "" } }],
    extraProps: [{"name": "name", "type": "string", "description": "Radios with the same name form one group."}, {"name": "value", "type": "string"}, {"name": "checked / defaultChecked", "type": "boolean"}, {"name": "onChange", "type": "(e: ChangeEvent<HTMLInputElement>) => void"}, {"name": "…", "type": "Plus every native attribute of the underlying element (id, name, onChange, aria-*, data-*)."}],
    render: (p) => <Choice type={opt(p.type, "checkbox")} variant={opt(p.variant, "default")} title={str(p.title)} description={str(p.description) || undefined} icon={opt(p.icon, undefined) as never} trailing={str(p.trailing) || undefined} hideControl={bool(p.hideControl)} inline={bool(p.inline)} disabled={bool(p.disabled)} defaultChecked={bool(p.defaultChecked)} key={String(p.defaultChecked)} name="pg-choice" value="a" />,
    code: (p) => jsx("Choice", { type: p.type !== "checkbox" ? q(str(p.type)) : undefined, name: q("addons"), value: q("backups"), title: q(str(p.title)), description: str(p.description) ? q(str(p.description)) : undefined, variant: p.variant !== "default" ? q(str(p.variant)) : undefined, icon: str(p.icon) ? q(str(p.icon)) : undefined, trailing: str(p.trailing) ? q(str(p.trailing)) : undefined, hideControl: bool(p.hideControl), inline: bool(p.inline), defaultChecked: bool(p.defaultChecked), disabled: bool(p.disabled) }),
    cssBlocks: ["Choice (selectable card or tag)"], related: ["checkbox", "radio", "segmented"],
  },
  {
    slug: "slider", name: "Slider", group: "Inputs", description: "Pill track with a round handle. Ticks, detents, dots, tooltip, custom steps, range and gradients.",
    controls: { size: { type: "select", options: ["md", "sm"], default: "md" }, min: { type: "number", default: 0 }, max: { type: "number", default: 100 }, step: { type: "number", default: 1 }, ticks: { type: "boolean" }, tickLabels: { type: "boolean" }, dots: { type: "boolean" }, tooltip: { type: "select", options: ["", "true", "always"], default: "" }, range: { type: "boolean", doc: "Two handles" }, disabled: { type: "boolean" } },
    states: [{ name: "Basic", props: {} }, { name: "Ticks", props: { step: 10, ticks: true, tickLabels: true } }, { name: "Dots + tooltip", props: { step: 10, dots: true, tooltip: "always" } }, { name: "Range", props: { range: true, tooltip: "true" } }, { name: "Small", props: { size: "sm" } }],
    extraProps: [{"name": "value / defaultValue", "type": "number | [number, number]", "description": "A pair makes it a range with two handles."}, {"name": "onChange", "type": "(value) => void", "description": "Same shape as value."}, {"name": "steps", "type": "number[]", "description": "Only these values can be selected, e.g. [0, 2, 4, 8, 16]. Overrides step."}, {"name": "detents", "type": "number[]", "description": "Values the handle snaps to when close."}, {"name": "formatValue", "type": "(v: number) => string", "description": "Tooltip and tick labels."}, {"name": "fill", "type": "string", "description": "CSS color or gradient for the filled part; \"none\" hides it."}, {"name": "background", "type": "string", "description": "CSS color or gradient for the whole track."}, {"name": "aria-label", "type": "string"}],
    code: (p) => jsx("Slider", { value: bool(p.range) ? "{range}" : "{value}", onChange: bool(p.range) ? "{setRange}" : "{setValue}", size: p.size === "sm" ? q("sm") : undefined, min: num(p.min, 0) !== 0 ? `{${num(p.min, 0)}}` : undefined, max: num(p.max, 100) !== 100 ? `{${num(p.max, 100)}}` : undefined, step: num(p.step, 1) !== 1 ? `{${num(p.step, 1)}}` : undefined, ticks: bool(p.ticks), tickLabels: bool(p.tickLabels), dots: bool(p.dots), tooltip: p.tooltip === "always" ? q("always") : p.tooltip === "true" ? true : undefined, disabled: bool(p.disabled), "aria-label": q("Value") }),
    render: (p) => <Slider key={String(p.range)} size={opt(p.size, "md")} min={num(p.min, 0)} max={num(p.max, 100)} step={num(p.step, 1)} ticks={bool(p.ticks)} tickLabels={bool(p.tickLabels)} dots={bool(p.dots)} tooltip={p.tooltip === "always" ? "always" : p.tooltip === "true"} disabled={bool(p.disabled)} defaultValue={bool(p.range) ? ([20, 70] as never) : (40 as never)} aria-label="Value" />,
    cssBlocks: ["Slider"], related: ["color-picker"],
  },
  {
    slug: "color-picker", name: "ColorPicker", group: "Inputs", description: "Dropdown with a color preview and H, S, L and alpha sliders with typed inputs.",
    controls: { label: { type: "text" }, noAlpha: { type: "boolean" }, size: { type: "select", options: SIZES, default: "md" }, disabled: { type: "boolean" } },
    extraProps: [{"name": "value / defaultValue", "type": "{ h, s, l, a }", "description": "Hue 0–360, the rest 0–100."}, {"name": "onChange", "type": "(value: HSLA, css: string) => void", "description": "The object and a ready hsl() string."}, {"name": "align", "type": "\"left\" | \"right\""}],
    render: (p) => <ColorPicker defaultValue={{ h: 226, s: 100, l: 59, a: 100 }} label={str(p.label) || undefined} noAlpha={bool(p.noAlpha)} size={opt(p.size, "md")} disabled={bool(p.disabled)} />,
    cssBlocks: ["Color picker"], related: ["slider", "swatch"],
  },
  {
    slug: "autocomplete", name: "Autocomplete", group: "Inputs", description: "Text input with a suggestion list from a fixed list or an async source. Picks one option.",
    controls: { placeholder: { type: "text", default: "Pick a person" }, openOnFocus: { type: "boolean", default: true }, allowCreate: { type: "boolean" }, icon: { type: "select", options: ["", ...ICONS], default: "" } },
    render: (p) => <Autocomplete options={people} placeholder={str(p.placeholder)} openOnFocus={bool(p.openOnFocus)} allowCreate={bool(p.allowCreate)} icon={opt(p.icon, undefined) as never} />,
    code: (p) => `const people: Option[] = [{ value: "ada", label: "Ada Lovelace", icon: "user" }, …];\n\n` + jsx("Autocomplete", { options: "{people}", value: "{person}", onChange: "{setPerson}", placeholder: q(str(p.placeholder)), openOnFocus: bool(p.openOnFocus), allowCreate: bool(p.allowCreate), icon: str(p.icon) ? q(str(p.icon)) : undefined }),
    extraProps: [{ name: "onChange", type: "(option: Option | null) => void", description: "The picked option, or null when cleared." }, { name: "loadOptions", type: "(query: string) => Promise<Option[]>", description: "Async source instead of options." }, { name: "onCreate", type: "(query: string) => void", description: "Called for the Create row; without it the typed text becomes the value." }],
    cssBlocks: ["Autocomplete"], related: ["token-input", "select"],
  },
  {
    slug: "token-input", name: "TokenInput", group: "Inputs", description: "Collects several options as tokens, with menus per token, create, and drag sorting.",
    controls: { placeholder: { type: "text", default: "Add a person…" }, tokenVariant: { type: "select", options: ["badge", "default", "outline"], default: "badge" }, allowCreate: { type: "boolean" }, sortable: { type: "boolean" } },
    render: (p) => <TokenInput options={people} defaultValue={[people[0], people[1]]} placeholder={str(p.placeholder)} openOnFocus tokenVariant={opt(p.tokenVariant, "badge")} allowCreate={bool(p.allowCreate)} sortable={bool(p.sortable)} />,
    code: (p) => `// Options are plain objects; the label is what is matched and shown.\nconst people: Option[] = [\n  { value: "ada", label: "Ada Lovelace", icon: "user", description: "Head of Brewing" },\n  { value: "grace", label: "Grace Hopper", icon: "user" },\n];\n// The value is an array of the same objects, plus optional meta set by token menus.\nconst [items, setItems] = useState<TokenItem[]>([\n  { value: "ada", label: "Ada Lovelace", meta: { required: true } },\n]);\n\n` + jsx("TokenInput", { options: "{people}", value: "{items}", onChange: "{setItems}", placeholder: q(str(p.placeholder)), openOnFocus: true, tokenVariant: p.tokenVariant === "outline" ? q("outline") : undefined, allowCreate: bool(p.allowCreate), sortable: bool(p.sortable), tokenMenu: '{(item, { update, remove }) => (\n    <ListItem label={item.meta?.required ? "Make optional" : "Make required"} onClick={() => update({ required: !item.meta?.required })} />\n  )}' }),
    extraProps: [
      { name: "options", type: "Option[]", description: "{ value: string; label: string; description?; icon?; disabled? }. Filtered by label as the user types." },
      { name: "loadOptions", type: "(query: string) => Promise<Option[]>", description: "Async source instead of options; results replace the list." },
      { name: "value / defaultValue", type: "TokenItem[]", description: "Selected items: Option plus optional meta ({ required: true } shows a small required note). Controlled with value + onChange, or uncontrolled with defaultValue." },
      { name: "onChange", type: "(items: TokenItem[]) => void", description: "Every selected item, in order, after add, remove, create, menu update or drag." },
      { name: "onCreate", type: "(query: string) => TokenItem | void", description: "Return the item to add for a created value; without it { value: query, label: query } is added." },
      { name: "tokenMenu", type: "(item, { update, remove }) => ReactNode", description: "List items for the chevron menu on each token; update merges into item.meta." },
      { name: "renderToken", type: "(item, { remove, update, dragProps, dragging }) => ReactNode", description: "Full control over a token's markup." },
    ],
    cssBlocks: ["Autocomplete", "Token"], related: ["autocomplete", "token"],
  },
  {
    slug: "token", name: "Token", group: "Inputs", description: "A chip for a selected item with remove and options slots.",
    controls: { label: { type: "text", default: "Name" }, meta: { type: "text", default: "required" }, variant: { type: "select", options: ["badge", "default", "outline"], default: "badge" }, size: { type: "select", options: ["sm", "md"], default: "md" }, icon: { type: "select", options: ["", ...ICONS], default: "" }, icons: { type: "boolean", doc: "Several state icons before the label." }, removable: { type: "boolean", default: true }, menu: { type: "boolean" } },
    render: (p) => <Token label={str(p.label)} meta={str(p.meta) || undefined} variant={opt(p.variant, "badge")} size={opt(p.size, "md")} icon={bool(p.icons) ? ["star", "eyeOff", "checkCheck"] : (opt(p.icon, undefined) as never)} onRemove={bool(p.removable) ? () => {} : undefined} menu={bool(p.menu) ? <ListItem label="Make optional" /> : undefined} />,
    code: (p) => jsx("Token", { label: q(str(p.label)), meta: str(p.meta) ? q(str(p.meta)) : undefined, variant: p.variant !== "badge" ? q(str(p.variant)) : undefined, size: p.size !== "md" ? q(str(p.size)) : undefined, icon: bool(p.icons) ? '{["star", "eyeOff", "checkCheck"]}' : str(p.icon) ? q(str(p.icon)) : undefined, onRemove: bool(p.removable) ? "{() => remove(item)}" : undefined, menu: bool(p.menu) ? '{<ListItem label="Make optional" onClick={() => update(item)} />}' : undefined }),
    extraProps: [{ name: "onRemove", type: "() => void", description: "Shows the X button; called when it is clicked." }, { name: "menu", type: "ReactNode", description: "List items for a dropdown; the whole token opens it." }, { name: "icon", type: "IconName | IconName[]", description: "One or several icons before the label." }],
    cssBlocks: ["Token"], related: ["badge", "token-input"],
  },
  {
    slug: "drop-zone", name: "DropZone", group: "Inputs", description: "Drop files on a dashed area, or wrap any element to make it the target.",
    controls: { title: { type: "text", default: "Drop files here" }, description: { type: "text", default: "or click to browse" }, accept: { type: "text" }, wrap: { type: "boolean", doc: "Wrap a card instead of the standalone area." }, disabled: { type: "boolean" } },
    extraProps: [{"name": "onFiles", "type": "(files: File[]) => void", "description": "Dropped or picked files, filtered by accept."}, {"name": "multiple", "type": "boolean", "description": "Default true."}, {"name": "children", "type": "ReactNode | ({ dragging, open }) => ReactNode", "description": "Wrap an element to make it the target; a function also gets open() for the file picker."}],
    render: (p) => bool(p.wrap) ? <DropZone onFiles={() => {}} accept={str(p.accept) || undefined} disabled={bool(p.disabled)}>{({ open }) => <Card title="Cover image" description="Drop an image here." action={<Button size="sm" icon="image" onClick={open}>Choose</Button>} />}</DropZone> : <DropZone onFiles={() => {}} title={str(p.title)} description={str(p.description)} accept={str(p.accept) || undefined} disabled={bool(p.disabled)} />,
    code: (p) => bool(p.wrap) ? `<DropZone onFiles={handleFiles}>\n  {({ open }) => <Card title="Cover image" action={<Button onClick={open}>Choose</Button>} />}\n</DropZone>` : `<DropZone onFiles={handleFiles} title="${str(p.title)}" description="${str(p.description)}"${p.accept ? ` accept="${str(p.accept)}"` : ""} />`,
    cssBlocks: ["Drop zone"], related: ["attachment", "composer"],
  },
  /* ---------------- Navigation ---------------- */
  {
    slug: "tabs", name: "Tabs", group: "Navigation", description: "Horizontal tabs with an underline. Each tab wraps a ghost button, so other buttons in the row keep their look.",
    controls: { block: { type: "boolean" }, size: { type: "select", options: SIZES, default: "md" }, trailing: { type: "boolean", doc: "Content at the end of the row." } },
    extraProps: [{"name": "items", "type": "{ value, label, icon?, trailing?, disabled? }[]"}, {"name": "value / defaultValue", "type": "string"}, {"name": "onChange", "type": "(value: string) => void"}, {"name": "trailing", "type": "ReactNode", "description": "Content at the end of the row."}, {"name": "children", "type": "ReactNode", "description": "Extra elements inline after the tabs, keeping their own look."}],
    render: (p) => <Tabs block={bool(p.block)} size={opt(p.size, "md")} items={[{ value: "all", label: "All", trailing: <Badge>24</Badge> }, { value: "open", label: "Open", icon: "check" }, { value: "archived", label: "Archived" }]} trailing={bool(p.trailing) ? <Input size="sm" icon="search" placeholder="Search…" /> : undefined} />,
    code: (p) => jsx("Tabs", { value: "{tab}", onChange: "{setTab}", block: bool(p.block), size: p.size !== "md" ? q(str(p.size)) : undefined, items: '{[\n    { value: "all", label: "All", trailing: <Badge>24</Badge> },\n    { value: "open", label: "Open", icon: "check" },\n    { value: "archived", label: "Archived" },\n  ]}', trailing: bool(p.trailing) ? '{<Input size="sm" icon="search" placeholder="Search…" />}' : undefined }),
    cssBlocks: ["Tabs"], related: ["segmented"],
  },
  {
    slug: "segmented", name: "Segmented", group: "Navigation", description: "Segmented selector: ghost options, the active one raised.",
    controls: { size: { type: "select", options: SIZES, default: "md" }, block: { type: "boolean" } },
    extraProps: [{"name": "items", "type": "{ value, label?, icon?, title?, trailing?, disabled? }[]", "description": "Omit label for an icon-only option and pass title."}, {"name": "value / defaultValue", "type": "string"}, {"name": "onChange", "type": "(value: string) => void"}],
    render: (p) => <Segmented size={opt(p.size, "md")} block={bool(p.block)} items={[{ value: "list", label: "List" }, { value: "board", label: "Board" }, { value: "calendar", label: "Calendar" }]} />,
    code: (p) => jsx("Segmented", { value: "{view}", onChange: "{setView}", size: p.size !== "md" ? q(str(p.size)) : undefined, block: bool(p.block), items: '{[\n    { value: "list", label: "List" },\n    { value: "board", label: "Board" },\n    { value: "calendar", label: "Calendar" },\n  ]}' }),
    cssBlocks: ["Segmented control"], related: ["tabs", "choice"],
  },
  {
    slug: "list", name: "List", group: "Navigation", description: "Vertical list of ghost-button items with sections, dividers and nested trees. Also the body of every menu.",
    controls: { bordered: { type: "boolean", default: true }, tree: { type: "boolean", doc: "Show nested items." } },
    extraProps: [{"name": "role", "type": "\"list\" | \"menu\" | \"listbox\""}, {"name": "ListItem", "type": "{ icon?, leading?, label, description?, trailing?, trailingIcon?, selected?, danger?, href?, children?, collapsible?, defaultExpanded?, onClick? }", "description": "Children make a nested tree; collapsible adds a chevron."}, {"name": "ListSection", "type": "{ title?, children }", "description": "Groups items; consecutive sections get a divider."}, {"name": "ListDivider / ListHeading", "type": "", "description": "Manual divider and heading."}],
    render: (p) => <List bordered={bool(p.bordered)}><ListSection title="Workspace"><ListItem icon="user" label="Profile" trailing="⌘P" /><ListItem icon="settings" label="Settings" description="Preferences and team" selected />{bool(p.tree) ? <ListItem icon="copy" label="Projects" collapsible><ListItem label="Brew guides" /><ListItem label="Roasting" /></ListItem> : <ListItem icon="copy" label="Duplicate" />}</ListSection><ListSection><ListItem icon="trash" label="Delete workspace" danger /></ListSection></List>,
    code: (p) => `<List${p.bordered ? " bordered" : ""}>\n  <ListSection title="Workspace">\n    <ListItem icon="user" label="Profile" trailing="⌘P" />\n    <ListItem icon="settings" label="Settings" description="Preferences and team" selected />\n${p.tree ? '    <ListItem icon="copy" label="Projects" collapsible>\n      <ListItem label="Brew guides" />\n    </ListItem>\n' : ""}  </ListSection>\n  <ListSection>\n    <ListItem icon="trash" label="Delete workspace" danger />\n  </ListSection>\n</List>`,
    cssBlocks: ["List (also used as dropdown menu)"], related: ["dropdown", "context-menu"],
  },
  {
    slug: "dropdown", name: "Dropdown", group: "Navigation", description: "Trigger button plus a List as a menu, anchored with CSS anchor positioning. Nest with SubMenu.",
    usage: ["Nest a SubMenu (a Dropdown with a ListItem trigger and side=\"right\") inside the menu for a second level; it opens beside its item and flips when there is no room.", "Pass your own trigger to open the menu from a Token, a row or any button."],
    controls: { label: { type: "text", default: "Actions" }, variant: { type: "select", options: VARIANTS, default: "default" }, color: { type: "select", options: COLORS, default: "default" }, size: { type: "select", options: SIZES, default: "md" }, icon: { type: "select", options: ["", ...ICONS], default: "" }, hideChevron: { type: "boolean" }, align: { type: "select", options: ["left", "right"], default: "left" }, nested: { type: "boolean", doc: "Include a SubMenu: a Dropdown inside the menu that opens beside its item." } },
    extraProps: [{"name": "trigger", "type": "(props, open) => ReactNode", "description": "Render your own trigger with the props spread onto it."}, {"name": "menuClassName", "type": "string", "description": "Class on the portaled menu. className only styles the trigger wrapper."}, {"name": "side", "type": "\"bottom\" | \"top\" | \"right\"", "description": "Right opens beside the trigger, for nested menus."}, {"name": "openOnHover", "type": "boolean"}, {"name": "triggerLabel", "type": "string", "description": "Accessible label for icon-only triggers."}, {"name": "children", "type": "ReactNode", "description": "ListItem, ListSection, ListDivider, SubMenu."}, {"name": "SubMenu", "type": "{ label, icon?, description?, disabled?, children }", "description": "A Dropdown triggered by a list item, opening beside it."}],
    states: [{ name: "Default", props: {} }, { name: "Nested menu", props: { nested: true }, description: "\"Move to\" opens a submenu beside the item." }, { name: "Icon only", props: { label: "", icon: "more", hideChevron: true, variant: "ghost" } }],
    render: (p) => <Dropdown label={str(p.label) || undefined} variant={opt(p.variant, "default")} color={opt(p.color, "default")} size={opt(p.size, "md")} icon={opt(p.icon, undefined) as never} hideChevron={bool(p.hideChevron)} align={opt(p.align, "left")} triggerLabel="Menu">{menu}{bool(p.nested) && <SubMenu icon="arrowRight" label="Move to"><ListItem label="Inbox" /><ListItem label="Archive" /></SubMenu>}</Dropdown>,
    code: (p) => jsx("Dropdown", { label: q(str(p.label)), variant: p.variant !== "default" ? q(str(p.variant)) : undefined, color: p.color !== "default" ? q(str(p.color)) : undefined, size: p.size !== "md" ? q(str(p.size)) : undefined, icon: str(p.icon) ? q(str(p.icon)) : undefined, hideChevron: bool(p.hideChevron), align: p.align === "right" ? q("right") : undefined }, ['<ListItem icon="copy" label="Duplicate" trailing="⌘D" onClick={duplicate} />', '<ListItem icon="edit" label="Rename" />', '<ListDivider />', '<ListItem icon="trash" label="Delete" danger />', ...(bool(p.nested) ? ['<SubMenu icon="arrowRight" label="Move to">\n  <ListItem label="Inbox" />\n  <ListItem label="Archive" />\n</SubMenu>'] : [])]),
    cssBlocks: ["Dropdown", "Submenu"], related: ["list", "context-menu", "select"],
  },
  {
    slug: "context-menu", name: "ContextMenu", group: "Navigation", description: "Opens a menu at the pointer on right-click, anchored to the click point.",
    controls: {},
    extraProps: [{"name": "menu", "type": "ReactNode | (close) => ReactNode", "description": "List items for the menu; a function also gets close()."}, {"name": "children", "type": "ReactNode | ({ onContextMenu }) => ReactNode", "description": "The target. A function lets you put the handler on your own element, e.g. a table cell."}, {"name": "disabled", "type": "boolean"}],
    render: () => <ContextMenu menu={menu}><Card variant="surface" title="Right-click this card" description="The menu opens at the pointer and flips to stay on screen." /></ContextMenu>,
    code: () => `<ContextMenu menu={<><ListItem icon="copy" label="Duplicate" /><ListDivider /><ListItem icon="trash" label="Delete" danger /></>}>\n  <Card title="Right-click this card" />\n</ContextMenu>`,
    cssBlocks: ["Context menu"], related: ["dropdown", "list"],
  },
  {
    slug: "collapsible", name: "Collapsible", group: "Navigation", description: "Expand and collapse content with an animated reveal. Inline row or bordered panel.",
    controls: { title: { type: "text", default: "Advanced options" }, description: { type: "text", default: "Click the row to expand" }, variant: { type: "select", options: ["inline", "panel"], default: "inline" }, icon: { type: "select", options: ["", ...ICONS], default: "" }, defaultOpen: { type: "boolean" } },
    extraProps: [{"name": "open / onOpenChange", "type": "boolean / (open) => void", "description": "Controlled mode."}, {"name": "value", "type": "string", "description": "Identifies the item inside a CollapsibleGroup."}, {"name": "trigger", "type": "({ open, toggle, triggerProps }) => ReactNode", "description": "Custom trigger; spread triggerProps on the element that toggles."}, {"name": "children", "type": "ReactNode"}],
    render: (p) => <Collapsible key={`${p.variant}-${p.defaultOpen}`} title={str(p.title)} description={str(p.description) || undefined} variant={opt(p.variant, "inline")} icon={opt(p.icon, undefined) as never} defaultOpen={bool(p.defaultOpen)}><p className="collapsible__body">Content slides open below the trigger. Any elements can go here.</p></Collapsible>,
    code: (p) => `<Collapsible title="${str(p.title)}"${p.description ? ` description="${str(p.description)}"` : ""}${p.variant === "panel" ? ' variant="panel"' : ""}${p.icon ? ` icon="${str(p.icon)}"` : ""}${p.defaultOpen ? " defaultOpen" : ""}>\n  <p>Content</p>\n</Collapsible>`,
    cssBlocks: ["Collapsible", "Collapsible group (accordion)"], related: ["collapsible-group", "task-list"],
  },
  {
    slug: "collapsible-group", name: "CollapsibleGroup", group: "Navigation", description: "Accordion: only one child Collapsible open at a time.",
    controls: { layout: { type: "select", options: ["list", "stack"], default: "list" }, allowNone: { type: "boolean", default: true } },
    extraProps: [{"name": "value / defaultValue", "type": "string | null", "description": "The open item's value."}, {"name": "onChange", "type": "(value: string | null) => void"}, {"name": "children", "type": "ReactNode", "description": "Collapsible elements, each with a value."}],
    render: (p) => <CollapsibleGroup key={str(p.layout)} layout={opt(p.layout, "list")} allowNone={bool(p.allowNone)} defaultValue="billing"><Collapsible value="account" title="Account" description="Name and email" variant={p.layout === "stack" ? "panel" : "inline"}><p className="collapsible__body">Account settings.</p></Collapsible><Collapsible value="billing" title="Billing" description="Plan and invoices" variant={p.layout === "stack" ? "panel" : "inline"}><p className="collapsible__body">Billing settings.</p></Collapsible></CollapsibleGroup>,
    code: (p) => `<CollapsibleGroup${p.layout === "stack" ? ' layout="stack"' : ""}${p.allowNone ? "" : " allowNone={false}"} defaultValue="billing">\n  <Collapsible value="account" title="Account">…</Collapsible>\n  <Collapsible value="billing" title="Billing">…</Collapsible>\n</CollapsibleGroup>`,
    cssBlocks: ["Collapsible group (accordion)"], related: ["collapsible"],
  },
  /* ---------------- Overlays ---------------- */
  {
    slug: "modal", name: "Modal", group: "Overlays", description: "Native dialog with sizes for alerts, forms, scrolling content, wide layouts and full screen.",
    controls: { title: { type: "text", default: "Invite a teammate" }, description: { type: "text", default: "They will get an email with a link to join." }, size: { type: "select", options: ["sm", "md", "lg", "xl", "full"], default: "md" }, hideClose: { type: "boolean" }, dismissible: { type: "boolean", default: true } },
    extraProps: [{"name": "open", "type": "boolean"}, {"name": "onClose", "type": "() => void", "description": "Called on Escape, backdrop click and the close button."}, {"name": "footer", "type": "ReactNode", "description": "Actions row."}, {"name": "children", "type": "ReactNode", "description": "Body; scrolls inside lg, xl and full sizes."}],
    render: (p) => <ModalDemo p={p} />,
    code: (p) => `<Modal open={open} onClose={() => setOpen(false)} title="${str(p.title)}" description="${str(p.description)}"${p.size !== "md" ? ` size="${str(p.size)}"` : ""}${p.hideClose ? " hideClose" : ""}${p.dismissible ? "" : " dismissible={false}"} footer={<Button variant="fill" color="primary">Send invite</Button>}>\n  …\n</Modal>`,
    cssBlocks: ["Modal"], related: ["toast", "tooltip"],
  },
  {
    slug: "tooltip", name: "Tooltip", group: "Overlays", description: "CSS-only tooltip on hover and focus, anchored so scroll containers never clip it.",
    controls: { content: { type: "text", default: "Open settings" }, side: { type: "select", options: ["top", "bottom", "left", "right"], default: "top" } },
    extraProps: [{"name": "children", "type": "ReactNode", "description": "The trigger. Shown on hover and keyboard focus."}],
    render: (p) => <Tooltip content={str(p.content)} side={opt(p.side, "top")}><Button icon="settings" aria-label="Settings" /></Tooltip>,
    code: (p) => `<Tooltip content="${str(p.content)}"${p.side !== "top" ? ` side="${str(p.side)}"` : ""}>\n  <Button icon="settings" aria-label="Settings" />\n</Tooltip>`,
    cssBlocks: ["Tooltip"], related: ["hover-card"],
  },
  {
    slug: "hover-card", name: "HoverCard", group: "Overlays", description: "A floating panel that opens after a short hover and stays while the pointer is over it.",
    controls: { side: { type: "select", options: ["top", "bottom"], default: "top" }, align: { type: "select", options: ["start", "center", "end"], default: "center" } },
    extraProps: [{"name": "content", "type": "ReactNode", "description": "Panel content."}, {"name": "children", "type": "ReactNode", "description": "The trigger, usually a link."}, {"name": "anchor", "type": "string", "description": "Anchor the panel to another element's anchor-name, e.g. a Table row from rowAnchors. With side=\"bottom\" align=\"end\" (position-area: block-end span-inline-start) the panel aligns to the row's right edge and opens below it."}, {"name": "open", "type": "boolean", "description": "Controlled visibility from a parent's hover logic; the trigger's own hover is ignored."}, {"name": "width", "type": "number | string", "description": "Panel width; defaults to --hover-card-width."}, {"name": "panelClassName", "type": "string", "description": "Class on the portaled panel. className only styles the trigger wrapper."}],
    render: (p) => <Text as="div">Written by <HoverCard side={opt(p.side, "top")} align={opt(p.align, "center")} content={<div className="row"><Avatar name="Ada Lovelace" presence="online" /><TextPair title="Ada Lovelace" description="Head of Brewing" className="grow" /><Button size="sm" variant="ghost" icon="arrowUpRight" aria-label="Open profile" /></div>}><a className="link" href="#">Ada Lovelace</a></HoverCard> this morning.</Text>,
    code: (p) => `<HoverCard${p.side !== "top" ? ` side="${str(p.side)}"` : ""}${p.align !== "center" ? ` align="${str(p.align)}"` : ""} content={<ProfilePreview />}>\n  <a href="#">Ada Lovelace</a>\n</HoverCard>`,
    cssBlocks: ["Hover card"], related: ["tooltip", "avatar"],
  },
  /* ---------------- Data ---------------- */
  {
    slug: "avatar", name: "Avatar", group: "Data", description: "Initials or image with presence, in six sizes. Groups overlap with masked outlines.",
    controls: { name: { type: "text", default: "Ada Lovelace" }, src: { type: "text" }, size: { type: "select", options: ["xs", "sm", "md", "lg", "xl", "2xl"], default: "md" }, shape: { type: "select", options: ["circle", "square"], default: "circle" }, presence: { type: "select", options: ["", "online", "away", "busy", "offline"], default: "" }, group: { type: "boolean", doc: "Show as an AvatarGroup." } },
    extraProps: [{"name": "AvatarGroup", "type": "{ size?, max?, children }", "description": "Overlapping row; max collapses the rest into a +N counter."}],
    render: (p) => bool(p.group) ? <AvatarGroup size={opt(p.size, "md")} max={3}><Avatar name={str(p.name)} src={str(p.src) || undefined} presence={opt(p.presence, undefined) as never} /><Avatar name="Grace Hopper" /><Avatar name="Alan Turing" /><Avatar name="Katherine Johnson" /></AvatarGroup> : <Avatar name={str(p.name)} src={str(p.src) || undefined} size={opt(p.size, "md")} shape={opt(p.shape, "circle")} presence={opt(p.presence, undefined) as never} />,
    code: (p) => bool(p.group) ? `<AvatarGroup${p.size !== "md" ? ` size="${str(p.size)}"` : ""} max={3}>\n  <Avatar name="${str(p.name)}" />\n  <Avatar name="Grace Hopper" />\n  …\n</AvatarGroup>` : `<Avatar name="${str(p.name)}"${p.src ? ` src="${str(p.src)}"` : ""}${p.size !== "md" ? ` size="${str(p.size)}"` : ""}${p.shape === "square" ? ' shape="square"' : ""}${p.presence ? ` presence="${str(p.presence)}"` : ""} />`,
    cssBlocks: ["Avatar", "Avatar group"], related: ["hover-card"],
  },
  {
    slug: "data-list", name: "DataList", group: "Data", description: "Label and value rows on one grid; labels share a column capped by a token.",
    controls: { align: { type: "select", options: ["start", "end"], default: "start" }, size: { type: "select", options: ["sm", "md"], default: "md" }, gap: { type: "select", options: ["sm", "md", "lg"], default: "md" }, divided: { type: "boolean" }, even: { type: "boolean", doc: "Every row the same height, so avatars and badges don't make rows uneven." }, icons: { type: "boolean" } },
    render: (p) => <DataList align={opt(p.align, "start")} size={opt(p.size, "md")} gap={opt(p.gap, "md")} divided={bool(p.divided)} even={bool(p.even)} items={[{ icon: bool(p.icons) ? "user" : undefined, label: "Owner", value: <span className="row"><Avatar name="Ada Lovelace" size="xs" />Ada Lovelace</span> }, { icon: bool(p.icons) ? "calendar" : undefined, label: "Created", value: "March 2, 2021" }, { icon: bool(p.icons) ? "settings" : undefined, label: "Status", value: <Badge color="success" dot>Active</Badge> }]} />,
    code: (p) => jsx("DataList", { align: p.align === "end" ? q("end") : undefined, size: p.size === "sm" ? q("sm") : undefined, gap: p.gap !== "md" ? q(str(p.gap)) : undefined, divided: bool(p.divided), even: bool(p.even), items: `{[\n    { ${p.icons ? 'icon: "user", ' : ""}label: "Owner", value: <span className="row"><Avatar name="Ada Lovelace" size="xs" />Ada Lovelace</span> },\n    { ${p.icons ? 'icon: "calendar", ' : ""}label: "Created", value: "March 2, 2021" },\n    { ${p.icons ? 'icon: "settings", ' : ""}label: "Status", value: <Badge color="success" dot>Active</Badge> },\n  ]}` }),
    extraProps: [{ name: "items", type: "{ label: ReactNode; value: ReactNode; icon?: IconName }[]", description: "Values can be any element: badges, avatars, links." }],
    cssBlocks: ["Data list"], related: ["table"],
  },
  {
    slug: "table", name: "Table", group: "Data", description: "Reorder, resize, edit, sort, hide, select rows, fixed columns, sticky header and footer.",
    controls: { selectable: { type: "boolean", default: true }, reorderable: { type: "boolean", default: true }, resizable: { type: "boolean", default: true }, fill: { type: "boolean", doc: "Stretch to the container; the last non-sticky column (or one with flex) takes the extra width." }, rowAnchors: { type: "boolean", doc: "Rows get an anchor-name; hover a name to see a panel aligned to the whole row." }, columnMenu: { type: "boolean", default: true }, bordered: { type: "boolean" }, compact: { type: "boolean" } },
    render: (p) => <TableDemo p={p} />,
    code: (p) => `type Person = { id: string; name: string; email: string; role: string; commits: number };\n\nconst columns: Column<Person>[] = [\n  { key: "name", header: "Name", width: 160, sticky: "left", editable: true },\n  { key: "email", header: "Email", width: 220, editable: true, mono: true },\n  { key: "role", header: "Role", width: 120, editable: true },\n  { key: "commits", header: "Commits", width: 110, align: "end", mono: true },\n];\nconst [rows, setRows] = useState<Person[]>(people);\n\n` + jsx("Table", { columns: "{columns}", rows: "{rows}", rowKey: "{(row) => row.id}", selectable: bool(p.selectable), reorderable: bool(p.reorderable), resizable: bool(p.resizable), fill: bool(p.fill), rowAnchors: bool(p.rowAnchors), columnMenu: bool(p.columnMenu), bordered: bool(p.bordered), compact: bool(p.compact), maxHeight: "{280}", onCellChange: "{(rowIndex, key, value) =>\n    setRows((r) => r.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row)))\n  }", onSelectionChange: "{(keys) => setSelected(keys)}" }),
    extraProps: [{ name: "columns", type: "Column<Row>[]", description: "key, header, width, minWidth, flex, align, sticky ('left' | 'right'), editable, mono, render(row, i, { anchor }), editor(props), sortValue(row), contextMenu(row, i, { edit }), noMenu." }, { name: "rows", type: "Row[]", description: "Plain objects; cells read row[column.key] unless the column has render." }, { name: "rowAnchors", type: "boolean", description: "Each row gets anchor-name --table-row-<key> (key sanitized to a dashed-ident) and render receives it as { anchor }, for a HoverCard that belongs to the row." }, { name: "rowKey", type: "(row, index) => string" }, { name: "onCellChange", type: "(rowIndex: number, key: string, value: unknown) => void", description: "Index into the original rows, the column key, and the new value (string for the text editor, whatever a custom editor set)." }, { name: "onSelectionChange", type: "(keys: string[]) => void", description: "Row keys currently selected." }, { name: "onColumnsChange", type: "(columns: { key, width, hidden, label? }[]) => void", description: "After reorder, resize, hide or rename." }, { name: "footer", type: "Record<columnKey, ReactNode>", description: "Sticky footer cells by column key." }],
    cssBlocks: ["Table"], related: ["data-list", "checkbox"],
  },
  {
    slug: "attachment", name: "Attachment", group: "Data", description: "Square image thumbnail or 2:1 file card with the format and name.",
    controls: { type: { type: "select", options: ["image", "file"], default: "file" }, name: { type: "text", default: "pour-over-recipe.pdf" }, size: { type: "select", options: ["sm", "md"], default: "md" }, removable: { type: "boolean" } },
    extraProps: [{"name": "attachment", "type": "{ id, type: \"image\" | \"file\", name, url?, size? }"}, {"name": "onRemove", "type": "() => void", "description": "Shows the corner remove button."}, {"name": "onClick", "type": "() => void", "description": "Makes the thumbnail a button."}],
    render: (p) => <Attachment attachment={{ id: "a", type: opt(p.type, "file"), name: str(p.name), url: p.type === "image" ? "https://picsum.photos/seed/coffee1/160" : undefined, size: "120 KB" }} size={opt(p.size, "md")} onRemove={bool(p.removable) ? () => {} : undefined} />,
    code: (p) => `<Attachment attachment={{ id: "a", type: "${str(p.type)}", name: "${str(p.name)}"${p.type === "image" ? ', url: "…"' : ""}, size: "120 KB" }}${p.size === "sm" ? ' size="sm"' : ""}${p.removable ? " onRemove={remove}" : ""} />`,
    cssBlocks: ["Attachment"], related: ["drop-zone", "composer"],
  },
  /* ---------------- Conversation ---------------- */
  {
    slug: "composer", name: "Composer", group: "Conversation", description: "Growing textarea in a box with a ghost toolbar, attachments and a drop target.",
    controls: { placeholder: { type: "text", default: "Message…" }, submitLabel: { type: "text", default: "Send" }, expanded: { type: "boolean" }, attachments: { type: "boolean" }, tools: { type: "boolean", default: true } },
    extraProps: [{"name": "value / onChange", "type": "string / (value) => void"}, {"name": "leading", "type": "ReactNode", "description": "Inline before the textarea, e.g. a sparkle icon."}, {"name": "onAttach / onDictate", "type": "() => void", "description": "Show the attach and dictate (voice-to-text) buttons at the bottom left, as in Chat. onRecord still works as a deprecated alias of onDictate."}, {"name": "onSubmit", "type": "() => void", "description": "Enter or the Send button; Shift+Enter inserts a line."}, {"name": "tools / actions", "type": "ReactNode", "description": "Left and right toolbar slots."}, {"name": "attachments / onRemoveAttachment", "type": "AttachmentData[] / (id) => void"}, {"name": "onFiles / accept", "type": "(files: File[]) => void / string", "description": "Makes the composer a drop target."}, {"name": "allowEmpty", "type": "boolean", "description": "Submit with attachments but no text."}, {"name": "submitIcon / submitIconPosition", "type": "IconName / \"leading\" | \"trailing\""}, {"name": "focus", "type": "boolean", "description": "Focus the textarea when it turns true."}],
    render: (p) => <ComposerDemo p={p} />,
    code: (p) => `<Composer value={draft} onChange={setDraft} onSubmit={send} placeholder="${str(p.placeholder)}"${p.expanded ? " expanded" : ""}${p.attachments ? " attachments={files} onRemoveAttachment={remove}" : ""} onFiles={addFiles}${p.tools ? ' tools={<Button variant="ghost" size="sm" icon="plus" />}' : ""} />`,
    cssBlocks: ["Composer"], related: ["chat", "toolbar", "drop-zone"], previewAlign: "end",
  },
  {
    slug: "chat", name: "Chat", group: "Conversation", description: "Message list with arrivals animating in, hover details, attachments, citations, tasks and a composer.",
    controls: { typing: { type: "boolean" }, composer: { type: "boolean", default: true } },
    render: (p) => <Chat messages={[{ id: "1", direction: "outgoing", author: "You", time: new Date(2026, 8, 4, 9, 12), content: "Why does my pour-over taste sour?" }, { id: "2", direction: "incoming", author: "Barista bot", time: new Date(2026, 8, 4, 9, 12), content: <>Sour usually means under-extraction <Cite title="Extraction basics" />. Try a finer grind first.</>, citations: [{ title: "Extraction basics", source: "baristahustle.com" }] }]} typing={bool(p.typing)} onSend={bool(p.composer) ? () => {} : undefined} maxHeight={320} />,
    code: (p) => `const messages: ChatMessage[] = [\n  { id: "1", direction: "outgoing", author: "You", time: new Date(), content: "Why does my pour-over taste sour?" },\n  {\n    id: "2", direction: "incoming", author: "Barista bot", time: new Date(),\n    content: <>Sour usually means under-extraction <Cite title="Extraction basics" />.</>,\n    citations: [{ title: "Extraction basics", source: "baristahustle.com" }],\n    // attachments: [{ id, type: "image" | "file", name, url?, size? }],\n    // tasks: { title, items: [{ id, label, status: "done" | "active" | "pending" }] },\n  },\n];\n\n` + jsx("Chat", { messages: "{messages}", typing: bool(p.typing), onSend: bool(p.composer) ? "{(text, attachments) => send(text, attachments)}" : undefined, maxHeight: "{320}" }),
    extraProps: [{ name: "grow", type: "boolean", description: "Fill the container height; messages take the remaining space and scroll." }, { name: "messages", type: "ChatMessage[]", description: "id, direction ('incoming' | 'outgoing'), content (ReactNode), author?, time?, attachments?, citations?, tasks?, actions?." }, { name: "onSend", type: "(text: string, attachments: AttachmentData[]) => void", description: "Trimmed text and the draft attachments when the composer submits. Also renders the composer." }, { name: "onCopy / onEdit / onRetry", type: "(message: ChatMessage) => void", description: "Default hover actions." }, { name: "onAttach / onDictate", type: "() => void", description: "Composer attach and dictate buttons; onRecord is a deprecated alias." }, { name: "onFiles", type: "(files: File[]) => void", description: "Files dropped on the composer." }, { name: "panel", type: "ReactNode", description: "Content between the messages and the composer, e.g. a Questionnaire." }],
    cssBlocks: ["Chat", "Citations"], related: ["composer", "citations", "task-list", "questionnaire"],
  },
  {
    slug: "citations", name: "Citations", group: "Conversation", description: "Inline Cite markers numbered by a CSS counter, and a collapsible source list.",
    controls: { defaultOpen: { type: "boolean" } },
    extraProps: [{"name": "items", "type": "{ title, source?, url? }[]", "description": "In reading order, matching the inline Cite markers."}, {"name": "trailing", "type": "ReactNode", "description": "Content inline with the toggle."}, {"name": "Cite", "type": "{ title, url? }", "description": "Inline marker; numbered automatically."}],
    render: (p) => <div className="chat__message stack stack--tight"><Text relaxed>Transformers scale well with data <Cite title="Attention Is All You Need" />, though attention is quadratic in sequence length <Cite title="Efficient Transformers: A Survey" />.</Text><Citations key={String(p.defaultOpen)} defaultOpen={bool(p.defaultOpen)} items={[{ title: "Attention Is All You Need", source: "arxiv.org" }, { title: "Efficient Transformers: A Survey", source: "arxiv.org" }]} /></div>,
    code: (p) => `<p>Transformers scale well <Cite title="Attention Is All You Need" />…</p>\n<Citations${p.defaultOpen ? " defaultOpen" : ""} items={[{ title: "Attention Is All You Need", source: "arxiv.org" }, …]} />`,
    cssBlocks: ["Citations"], related: ["chat"],
  },
  {
    slug: "task-list", name: "TaskList", group: "Conversation", description: "Collapsed task summary with a progress ring that expands to the checklist.",
    controls: { title: { type: "text", default: "Launch the marketing site" }, stage: { type: "select", options: ["planning", "not started", "in progress", "almost", "complete"], default: "in progress" }, defaultOpen: { type: "boolean", default: true } },
    states: [{ name: "Planning", props: { stage: "planning" } }, { name: "Not started", props: { stage: "not started" } }, { name: "In progress", props: { stage: "in progress" } }, { name: "Complete", props: { stage: "complete" } }],
    extraProps: [{"name": "tasks", "type": "{ id, label, status: \"done\" | \"active\" | \"pending\" }[]", "description": "Empty while planning."}, {"name": "open / onOpenChange", "type": "boolean / (open) => void", "description": "Controlled mode."}],
    render: (p) => { const idx = { planning: -2, "not started": -1, "in progress": 1, almost: 4, complete: 5 }[str(p.stage, "in progress")] ?? 1; const tasks = idx === -2 ? [] : ["Scaffold the project", "Build the registry", "Entitlement gating", "Stripe checkout", "Polish the landing page"].map((label, i) => ({ id: `t${i}`, label, status: (i < idx ? "done" : i === idx ? "active" : "pending") as never })); return <TaskList key={str(p.stage)} title={str(p.title)} tasks={tasks} defaultOpen={bool(p.defaultOpen)} />; },
    code: (p) => `<TaskList title="${str(p.title)}" tasks={[{ id: "t1", label: "Scaffold the project", status: "done" }, { id: "t2", label: "Build the registry", status: "active" }, …]}${p.defaultOpen ? " defaultOpen" : ""} />`,
    cssBlocks: ["Task list"], related: ["chat", "shimmer", "spinner"],
  },
  {
    slug: "questionnaire", name: "Questionnaire", group: "Conversation", description: "Step-by-step questions with single-choice answers, an Other field, and a review step.",
    controls: {},
    render: () => <Questionnaire questions={[{ id: "brewer", prompt: "Which brewer are you using?", description: "The device you made this cup with.", options: ["V60", "Kalita Wave", "Chemex"], allowOther: true }, { id: "scale", prompt: "Do you weigh the coffee?", type: "boolean" }, { id: "taste", prompt: "Which describes the cup best?", layout: "list", options: ["Sharp and sour from the first sip", "Sour at first, sweeter as it cools", "Mostly flat"] }]} onSubmit={() => {}} />,
    code: () => `const questions: Question[] = [\n  { id: "brewer", prompt: "Which brewer are you using?", options: ["V60", "Kalita Wave", "Chemex"], allowOther: true },\n  { id: "scale", prompt: "Do you weigh the coffee?", type: "boolean" },\n  { id: "taste", prompt: "Which describes the cup best?", layout: "list", options: ["Sharp and sour", "Sour then sweet", "Mostly flat"] },\n];\n\n` + jsx("Questionnaire", { questions: "{questions}", onSubmit: '{(answers) => {\n    // answers: { brewer: "V60", scale: "Yes", taste: "Sour then sweet" } keyed by question id\n    send(answers);\n  }}', onCancel: "{() => setShowQuestions(false)}" }),
    extraProps: [{ name: "questions", type: "Question[]", description: "id, prompt, description?, type ('choice' | 'boolean'), options?, allowOther?, layout ('inline' | 'list')." }, { name: "onSubmit", type: "(answers: Record<string, string>) => void", description: "Called from the review step with every answer keyed by question id." }, { name: "onCancel", type: "() => void", description: "Shows a dismiss button; called with no arguments when clicked." }, { name: "submitLabel", type: "string", default: '"Send answers"' }],
    cssBlocks: ["Questionnaire"], related: ["chat", "choice"], previewAlign: "end",
  },
  /* ---------------- Docs ---------------- */
  {
    slug: "link", name: "Link", group: "Typography", description: "Inline text link. Use the .link class on an anchor, or Button with href for a button-shaped link.",
    controls: { children: { type: "text", default: "Read the brewing guide" }, href: { type: "text", default: "#" } },
    extraProps: [{"name": "href", "type": "string"}, {"name": "target / rel", "type": "string"}],
    render: (p) => <Text>See <a className="link" href={str(p.href)}>{str(p.children)}</a> for details.</Text>,
    code: (p) => `<a className="link" href="${str(p.href)}">${str(p.children)}</a>`,
    cssBlocks: ["Link"], related: ["text", "button"],
  },
  {
    slug: "code", name: "Code", group: "Typography", description: "Inline code in the secondary font on a surface chip.",
    controls: { children: { type: "text", default: "npm install" } },
    extraProps: [{"name": "children", "type": "ReactNode"}],
    render: (p) => <Text>Run <code className="code">{str(p.children)}</code> to get started.</Text>,
    code: (p) => `<code className="code">${str(p.children)}</code>`,
    cssBlocks: ["Code"], related: ["code-block"],
  },
  {
    slug: "props-table", name: "PropsTable", group: "Docs", description: "Documentation table of a component's props.",
    controls: {},
    extraProps: [{"name": "rows", "type": "{ name, type, default?, description? }[]"}],
    render: () => <PropsTable rows={[{ name: "variant", type: '"default" | "fill" | "outline"', default: '"default"', description: "Style of the button." }, { name: "color", type: '"primary" | "danger"', description: "Accent color." }]} />,
    code: () => `<PropsTable rows={[{ name: "variant", type: '"default" | "fill"', default: '"default"', description: "Style" }]} />`,
    cssBlocks: ["Table"], related: ["table", "vars-table"],
  },
  {
    slug: "vars-table", name: "VarsTable", group: "Docs", description: "Tokens a component reads, with the declared value and the live resolved value.",
    controls: {},
    extraProps: [{"name": "rows", "type": "{ name, value }[]", "description": "Declared values; resolved values are read live."}],
    render: () => <VarsTable rows={[{ name: "--color-primary", value: "hsl(226 100% 59%)" }, { name: "--control-height", value: "var(--space-8)" }]} />,
    code: () => `<VarsTable rows={[{ name: "--color-primary", value: "hsl(226 100% 59%)" }]} />`,
    cssBlocks: ["Table"], related: ["props-table", "swatch"],
  },
  {
    slug: "code-block", name: "CodeBlock", group: "Docs", description: "Monospace code with light highlighting and a copy button.",
    controls: { code: { type: "text", default: '<Button variant="fill" color="primary">Save</Button>' }, language: { type: "select", options: ["tsx", "html", "css", "bash"], default: "tsx" } },
    extraProps: [{"name": "code", "type": "string"}, {"name": "language", "type": "\"tsx\" | \"html\" | \"css\" | \"bash\""}],
    render: (p) => <CodeBlock code={str(p.code)} language={opt(p.language, "tsx")} />,
    cssBlocks: ["Code block"], related: ["copy-button"],
  },
];

export const groups = Array.from(new Set(registry.map((e) => e.group)));
export const bySlug = (slug: string) => registry.find((e) => e.slug === slug);
export type { ReactNode };
