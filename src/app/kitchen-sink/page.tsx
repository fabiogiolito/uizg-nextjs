"use client";

import { useMemo, useState } from "react";
import {
  Attachment,
  type AttachmentData,
  Autocomplete,
  Composer,
  CopyButton,
  Chat,
  type ChatMessage,
  Cite,
  Questionnaire,
  type Question,
  type Answers,
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  Blockquote,
  Collapsible,
  CollapsibleGroup,
  Divider,
  ColorPicker,
  toHsl,
  type HSLA,
  ContextMenu,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Choice,
  Dropdown,
  DropZone,
  Field,
  Frame,
  HoverCard,
  Input,
  List,
  ListDivider,
  ListHeading,
  ListItem,
  ListSection,
  DataList,
  Modal,
  Radio,
  Segmented,
  Select,
  Shimmer,
  Slider,
  SubMenu,
  Switch,
  Table,
  type Column,
  Tabs,
  TaskList,
  Text,
  TextPair,
  Token,
  Toaster,
  toast,
  type ToastPosition,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  TokenEditor,
  TokenInput,
  type Option,
  type TokenItem,
  Tooltip,
} from "@/components";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="showcase__section">
      <h2 className="showcase__section-title">{title}</h2>
      {children}
    </section>
  );
}

type Person = { id: string; name: string; email: string; roles: string[]; team: string; status: string; joined: string; commits: number };

const people: Person[] = [
  ["Ada Lovelace", "ada@example.com", "Engineer", "Platform", "Active", "2021-03-02", 812],
  ["Grace Hopper", "grace@example.com", "Engineer", "Compilers", "Active", "2019-11-14", 1204],
  ["Alan Turing", "alan@example.com", "Researcher", "Theory", "Away", "2020-06-23", 431],
  ["Katherine Johnson", "katherine@example.com", "Analyst", "Trajectory", "Active", "2018-01-09", 97],
  ["Margaret Hamilton", "margaret@example.com", "Lead", "Flight", "Active", "2017-08-30", 1530],
  ["Linus Torvalds", "linus@example.com", "Maintainer", "Kernel", "Busy", "2016-04-17", 9021],
  ["Barbara Liskov", "barbara@example.com", "Researcher", "Languages", "Offline", "2022-02-11", 265],
  ["Dennis Ritchie", "dennis@example.com", "Engineer", "Compilers", "Active", "2015-09-01", 2210],
  ["Radia Perlman", "radia@example.com", "Engineer", "Network", "Away", "2020-12-05", 388],
  ["Tim Berners-Lee", "tim@example.com", "Architect", "Web", "Active", "2019-05-21", 640],
].map(([name, email, role, team, status, joined, commits], i) => ({ id: `p${i}`, name, email, roles: i % 3 === 0 ? [role as string, "Reviewer"] : [role as string], team, status, joined, commits } as Person));

const roleOptions: Option[] = ["Engineer", "Researcher", "Analyst", "Lead", "Maintainer", "Architect", "Reviewer", "Admin"].map((r) => ({ value: r, label: r }));

const statusVariant: Record<string, "success" | "warning" | "danger" | "default"> = { Active: "success", Away: "warning", Busy: "danger", Offline: "default" };

const statuses = ["Active", "Away", "Busy", "Offline"];

/** Columns are built with the status setter in scope so the status cell can update the row. */
const makePersonColumns = (setStatus: (id: string, status: string) => void): Column<Person>[] => [
  { key: "name", header: "Name", width: 180, sticky: "left", editable: true },
  {
    key: "email",
    header: "Email",
    width: 220,
    editable: true,
    mono: true,
    contextMenu: (p, _i, { edit }) => (
      <>
        <ListItem icon="copy" label="Copy email" onClick={() => navigator.clipboard.writeText(p.email)} />
        <ListItem icon="arrowRight" label="Send email" onClick={() => window.open(`mailto:${p.email}`)} />
        <ListDivider />
        <ListItem icon="edit" label="Edit email" onClick={edit} />
      </>
    ),
  },
  {
    key: "roles",
    header: "Roles",
    width: 220,
    editable: true,
    sortValue: (p) => p.roles.join(", "),
    render: (p) => (
      <span className="table__cell-tokens">
        {p.roles.map((r) => (
          <Token key={r} size="sm" label={r} />
        ))}
      </span>
    ),
    editor: ({ value, setValue }) => (
      <TokenInput
        size="sm"
        autoFocus
        openOnFocus
        options={roleOptions}
        placeholder="Add role…"
        value={(value as string[]).map((r) => ({ value: r, label: r }))}
        onChange={(items) => setValue(items.map((i) => i.label))}
      />
    ),
  },
  { key: "team", header: "Team" },
  { key: "status", header: "Status", width: 130, render: (p) => <StatusCell person={p} onChange={(status) => setStatus(p.id, status)} /> },
  { key: "joined", header: "Joined", mono: true },
  { key: "commits", header: "Commits", width: 110, align: "end", mono: true },
  { key: "actions", header: "", width: 56, sticky: "right", align: "center", noMenu: true, render: () => <Button size="sm" variant="ghost" icon="settings" aria-label="Row actions" /> },
];

/** The badge is the dropdown trigger: a ghost button with no chevron. */
function StatusCell({ person, onChange }: { person: Person; onChange: (status: string) => void }) {
  return (
    <Dropdown size="sm" variant="ghost" hideChevron label={<Badge color={statusVariant[person.status]} dot>{person.status}</Badge>} className="table__cell-dropdown">
      {statuses.map((s) => (
        <ListItem key={s} label={s} selected={s === person.status} onClick={() => onChange(s)} />
      ))}
    </Dropdown>
  );
}

const countries: Option[] = ["Argentina", "Australia", "Brazil", "Canada", "Denmark", "France", "Germany", "Iceland", "Japan", "Mexico", "Norway", "Portugal", "Spain", "Sweden"].map((c) => ({ value: c.toLowerCase(), label: c }));
const countryNames = countries.map(({ value, label }) => ({ value, label }));
const languages: Option[] = [
  { value: "ts", label: "TypeScript", icon: "copy", description: "Typed JavaScript" },
  { value: "rs", label: "Rust", icon: "settings", description: "Systems language" },
  { value: "py", label: "Python", icon: "user", description: "General purpose" },
  { value: "go", label: "Go", description: "Simple and fast" },
  { value: "cob", label: "COBOL", description: "Legacy", disabled: true },
];
const fieldOptions: Option[] = ["Name", "Email", "Phone", "Company", "Role", "Country"].map((f) => ({ value: f.toLowerCase(), label: f }));
/** Simulated API: resolves after a delay with people whose name matches. */
const searchPeople = (q: string) =>
  new Promise<Option[]>((resolve) =>
    setTimeout(() => resolve(people.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p) => ({ value: p.id, label: p.name, description: p.email, icon: "user" }))), 500),
  );

/** Turns dropped files into attachment data; images get an object URL for their thumbnail. */
const toAttachments = (files: File[]): AttachmentData[] =>
  files.map((f) => ({
    id: `${f.name}-${f.size}-${f.lastModified}`,
    type: f.type.startsWith("image/") ? "image" : "file",
    name: f.name,
    url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`,
  }));

const at = (h: number, m: number) => { const d = new Date(); d.setHours(h, m, 0, 0); return d; };
const initialChat: ChatMessage[] = [
  { id: "c1", direction: "outgoing", author: "You", time: at(9, 12), content: "Why does my pour-over taste sour even when the beans are fresh?" },
  { id: "c2", direction: "incoming", author: "Barista bot", time: at(9, 12), content: "Sour usually means under-extraction. The water is not pulling enough out of the grounds, so you get the bright acids without the sweetness that comes later." },
  {
    id: "c2b",
    direction: "incoming",
    author: "Barista bot",
    time: at(9, 12),
    content: (
      <>
        Most of the acids dissolve in the first part of the brew and the sugars follow
        <Cite title="Coffee extraction: how flavour develops over time" url="https://example.com/extraction" />, which is why a short or cool
        brew tastes sharp. Water around 93 to 96°C keeps extraction on track for light roasts
        <Cite title="SCA brewing standards" url="https://example.com/sca" />.
      </>
    ),
    citations: [
      { title: "Coffee extraction: how flavour develops over time", source: "baristahustle.com", url: "https://example.com/extraction" },
      { title: "SCA brewing standards", source: "sca.coffee", url: "https://example.com/sca" },
    ],
  },
  {
    id: "c2c",
    direction: "incoming",
    author: "Barista bot",
    time: at(9, 13),
    content: (
      <>
        As one roaster likes to put it:
        <Blockquote cite="Local roaster">Sour is the coffee asking for more time with the water.</Blockquote>
        So the fix is almost always more extraction, not different beans.
      </>
    ),
  },
  { id: "c3", direction: "outgoing", author: "You", time: at(9, 13), content: "So I should grind finer?" },
  { id: "c4", direction: "incoming", author: "Barista bot", time: at(9, 13), content: "That is the first thing to try. Finer grind, hotter water, or a slower pour all push extraction up. Change one at a time so you know what fixed it." },
  { id: "c5", direction: "outgoing", author: "You", time: at(9, 14), content: "One variable at a time. Got it. Here is my setup and the recipe I have been using.", attachments: [
    { id: "a1", type: "image", name: "setup.jpg", url: "https://picsum.photos/seed/coffee1/160" },
    { id: "a2", type: "image", name: "grinder.jpg", url: "https://picsum.photos/seed/coffee2/160" },
    { id: "a3", type: "file", name: "pour-over-recipe.pdf", size: "120 KB" },
  ] },
  { id: "c6", direction: "incoming", author: "Barista bot", time: at(9, 15), content: "Nice grinder. Your recipe uses 92°C water, try 96°C first. I put the adjusted version in a sheet.", attachments: [
    { id: "a4", type: "file", name: "recipe-v2.xlsx", size: "18 KB" },
    { id: "a5", type: "file", name: "extraction-notes.md", size: "3 KB" },
  ] },
  { id: "c7", direction: "outgoing", author: "You", time: at(9, 16), content: "Still sour after the hotter water." },
  {
    id: "c7b",
    direction: "incoming",
    author: "Barista bot",
    time: at(9, 16),
    content: "Here is the plan I am working through.",
    tasks: {
      title: "Fix the sour pour-over",
      items: [
        { id: "t1", label: "Check the grind setting", status: "done" },
        { id: "t2", label: "Raise water temperature to 96°C", status: "done" },
        { id: "t3", label: "Compare brew time against the recipe", status: "active" },
        { id: "t4", label: "Try a slower, pulsed pour", status: "pending" },
        { id: "t5", label: "Taste side by side with the old settings", status: "pending" },
      ],
    },
  },
  { id: "c8", direction: "incoming", author: "Barista bot", time: at(9, 16), content: "Let's try to figure out what the issue is. Answer a few quick questions below." },
];
const brewQuestions: Question[] = [
  { id: "brewer", prompt: "Which brewer are you using?", description: "The dripper or device you made this cup with.", options: ["V60", "Kalita Wave", "Chemex", "Aeropress"], allowOther: true },
  { id: "scale", prompt: "Are you weighing the coffee and water?", type: "boolean", allowOther: true },
  {
    id: "taste",
    prompt: "Which of these describes the cup best?",
    layout: "list",
    options: [
      "Sharp and sour from the first sip, with a thin body",
      "Sour at first but sweeter as it cools down",
      "Sour and also bitter or astringent at the finish",
      "Mostly flat, not much flavor either way",
    ],
    allowOther: true,
  },
  { id: "time", prompt: "How long does the brew take?", description: "From first pour to the last drip.", options: ["Under 2 min", "2 to 3 min", "3 to 4 min", "Over 4 min"], allowOther: true },
];
const replies = [
  "Good instinct. Keep notes on each brew so you can compare.",
  "If it turns bitter instead, you have gone too far. Back off a little.",
  "Fresh beans need a few days of rest after roasting, so that could be part of it too.",
];

export default function Home() {
  const [chat, setChat] = useState(initialChat);
  const [typing, setTyping] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [draftFiles, setDraftFiles] = useState<AttachmentData[]>([]);
  const sampleFiles: AttachmentData[] = [
    { id: "d1", type: "image", name: "cup.jpg", url: "https://picsum.photos/seed/cup/160" },
    { id: "d2", type: "file", name: "brew-log.csv", size: "4 KB" },
    { id: "d3", type: "image", name: "beans.jpg", url: "https://picsum.photos/seed/beans/160" },
  ];
  const addSampleFile = () => setDraftFiles((f) => (f.length < sampleFiles.length ? [...f, sampleFiles[f.length]] : f));
  const [dropped, setDropped] = useState<AttachmentData[]>([]);
  const [standaloneDraft, setStandaloneDraft] = useState("Here are the photos from this morning.");
  const [standaloneFiles, setStandaloneFiles] = useState<AttachmentData[]>(sampleFiles);
  const submitAnswers = (answers: Answers) => {
    setShowQuestions(false);
    const summary = brewQuestions.map((q) => `${typeof q.prompt === "string" ? q.prompt : q.id} ${answers[q.id] ?? "Skipped"}`).join("\n");
    sendChat(summary);
  };
  const sendChat = (text: string, attachments: AttachmentData[] = []) => {
    setChat((c) => [...c, { id: `c${Date.now()}`, direction: "outgoing", author: "You", time: new Date(), content: text || (attachments.length ? "" : text), attachments: attachments.length ? attachments : undefined }]);
    setDraftFiles([]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setChat((c) => [...c, { id: `r${Date.now()}`, direction: "incoming", author: "Barista bot", time: new Date(), content: replies[c.length % replies.length] }]);
    }, 1200);
  };
  const [volume, setVolume] = useState(40);
  const [taskStage, setTaskStage] = useState(2);
  const [toastPosition, setToastPosition] = useState<ToastPosition>("bottom-right");
  const [quantity, setQuantity] = useState(2);
  const [sliderSize, setSliderSize] = useState<"md" | "sm">("md");
  const [price, setPrice] = useState<[number, number]>([200, 650]);
  const [hue, setHue] = useState(200);
  const [brand, setBrand] = useState<HSLA>({ h: 226, s: 100, l: 59, a: 100 });
  const [overlay, setOverlay] = useState<HSLA>({ h: 0, s: 0, l: 0, a: 40 });
  const [country, setCountry] = useState<Option | null>(null);
  const [person, setPerson] = useState<Option | null>(null);
  const [language, setLanguage] = useState<Option | null>(null);
  const [fields, setFields] = useState<TokenItem[]>([
    { value: "name", label: "Name", meta: { required: true } },
    { value: "email", label: "Email" },
  ]);
  const [modal, setModal] = useState<"sm" | "md" | "lg" | "xl" | "full" | null>(null);
  const [rows, setRows] = useState(people);
  const personColumns = useMemo(
    () => makePersonColumns((id, status) => setRows((r) => r.map((row) => (row.id === id ? { ...row, status } : row)))),
    [],
  );
  const [tableVariant, setTableVariant] = useState("default");
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const bulkStatus = (status: string) => setRows((r) => r.map((row) => (selectedPeople.includes(row.id) ? { ...row, status } : row)));
  const bulkDelete = () => {
    setRows((r) => r.filter((row) => !selectedPeople.includes(row.id)));
    setSelectedPeople([]);
  };
  return (
    <main className="showcase">
      <aside className="showcase__column showcase__column--sticky">
        <TokenEditor />
      </aside>

      <div className="showcase__column">
        <Section title="Typography">
          <div className="stack stack--tight">
            <Text size="display">Display heading</Text>
            <Text size="title">Title heading</Text>
            <Text size="lg">Large text, 16px by default.</Text>
            <Text>
              Body text at 14px with 120% line height. Includes a{" "}
              <a className="link" href="#">link</a> and <code className="code">inline code</code>.
            </Text>
            <Text size="sm" tone="muted">Small muted text, 12px.</Text>
            <Text size="label" tone="subtle">Label text</Text>
            <Text mono tone="muted">Secondary font: IBM Plex Mono</Text>
            <Text relaxed tone="muted">
              A relaxed paragraph uses the relaxed line height token. It is useful for longer
              blocks of reading text where 120% would feel cramped.
            </Text>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Divider">
          <div className="stack">
            <Text size="sm" tone="muted">Default weight</Text>
            <Divider />
            <Text size="sm" tone="muted">Thick, twice the border width</Text>
            <Divider weight="thick" />
            <Text size="sm" tone="muted">With medium spacing above and below</Text>
            <Divider spacing="md" />
            <Text size="sm" tone="muted">With centered content</Text>
            <Divider>March 15, 2026</Divider>
            <Divider spacing="sm"><Badge>3 new messages</Badge></Divider>
            <Divider weight="thick">or</Divider>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Text pairs">
          <div className="stack">
            <TextPair size="title" title="Title pair" description="A page or section heading with its subtitle." />
            <TextPair size="lg" title="Large pair" description="Used in card headers." />
            <TextPair title="Default pair" description="A setting name with its explanation." />
            <TextPair size="sm" title="Small pair" description="Compact, used inside list items." />
            <TextPair align="center" title="Centered pair" description="For empty states and dialogs." />
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Buttons">
          <TextPair title="Variants" description="default, fill, outline, flat and ghost, without a color." />
          <div className="row">
            <Button>Default</Button>
            <Button variant="fill">Fill</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="flat">Flat</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
          <TextPair title="Colors" description="Each row is one color across the variants. On the default variant a color only tints the label." />
          {(["primary", "success", "warning", "danger"] as const).map((c) => (
            <div className="row" key={c}>
              <Button color={c}>Default</Button>
              <Button variant="fill" color={c}>Fill</Button>
              <Button variant="outline" color={c}>Outline</Button>
              <Button variant="flat" color={c}>Flat</Button>
              <Button variant="ghost" color={c}>Ghost</Button>
            </div>
          ))}
          <div className="row">
            <Button size="sm" icon="plus">Small</Button>
            <Button icon="plus">Medium</Button>
            <Button size="lg" icon="plus">Large</Button>
            <Button variant="fill" color="primary" trailingIcon="arrowRight">Continue</Button>
          </div>
          <div className="row">
            <Button size="sm" icon="settings" aria-label="Settings" />
            <Button icon="settings" aria-label="Settings" />
            <Button size="lg" icon="settings" aria-label="Settings" />
            <Button variant="fill" color="primary" icon="check" aria-label="Confirm" />
            <Button variant="ghost" icon="trash" aria-label="Delete" />
          </div>
          <TextPair title="Copy button" description="Copies text to the clipboard and confirms with a check for two seconds. The value can be a string or a function." />
          <div className="row">
            <CopyButton value="npm install uizg">Copy command</CopyButton>
            <CopyButton value="sk_live_4f8a…" variant="outline" copiedLabel="Key copied">Copy API key</CopyButton>
            <CopyButton value={() => new Date().toISOString()} variant="ghost" size="sm">Copy timestamp</CopyButton>
            <CopyButton value={new Promise<string>((r) => setTimeout(() => r("resolved later"), 300))} variant="ghost" size="sm">Copy from promise</CopyButton>
            <CopyButton value="https://example.com/share/abc" aria-label="Copy link" />
            <Input readOnly defaultValue="https://example.com/share/abc" trailing={<CopyButton value="https://example.com/share/abc" size="sm" variant="ghost" aria-label="Copy link" />} />
          </div>
          <TextPair title="Toolbar" description="A raised bar of grouped controls with separators between groups. Members keep their own styles: toggles, ghost buttons, a select, a filled button." />
          <Toolbar aria-label="Formatting">
            <ToolbarGroup>
              {(["alignLeft", "alignCenter", "alignRight"] as const).map((icon, i) => (
                <Choice key={icon} inline hideControl type="radio" name="align" value={icon} icon={icon} title="" defaultChecked={i === 0} aria-label={icon} />
              ))}
            </ToolbarGroup>
            <ToolbarGroup>
              <Button variant="ghost" icon="dollar" aria-label="Currency" />
              <Button variant="ghost" icon="percent" aria-label="Percent" />
            </ToolbarGroup>
            <ToolbarGroup>
              <Select look="button" defaultValue="helvetica" options={[{ value: "helvetica", label: "Helvetica" }, { value: "inter", label: "Inter" }, { value: "georgia", label: "Georgia" }]} />
            </ToolbarGroup>
            <ToolbarGroup>
              <Button variant="fill">Save</Button>
            </ToolbarGroup>
          </Toolbar>
          <Toolbar block aria-label="Editor">
            <ToolbarGroup>
              <Choice inline hideControl type="checkbox" name="bold" icon="bold" title="" aria-label="Bold" defaultChecked />
              <Choice inline hideControl type="checkbox" name="italic" icon="italic" title="" aria-label="Italic" />
              <ToolbarSeparator />
              <Button variant="ghost" icon="image" aria-label="Insert image" />
              <Button variant="ghost" icon="file" aria-label="Attach file" />
            </ToolbarGroup>
            <ToolbarGroup end>
              <Badge variant="ghost">Saved</Badge>
              <Button variant="fill" color="primary" icon="send">Publish</Button>
            </ToolbarGroup>
          </Toolbar>
          <TextPair title="Button groups" description="Buttons joined as one element. Works with any variant, with inline choices as a radio group, with a dropdown as the last member for a split button, and with inputs and selects as members." />
          <div className="row">
            <ButtonGroup>
              <Button variant="flat" icon="copy">Copy</Button>
              <Button variant="flat" icon="edit">Cut</Button>
              <Button variant="flat" icon="file">Paste</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="fill" color="primary">Save</Button>
              <Dropdown variant="fill" color="primary" hideChevron icon="chevronDown" triggerLabel="More save options" align="right">
                <ListItem label="Save and close" />
                <ListItem label="Save as template" />
              </Dropdown>
            </ButtonGroup>
            <ButtonGroup>
              <Button icon="arrowLeft" aria-label="Previous" />
              <Button>Today</Button>
              <Button icon="arrowRight" aria-label="Next" />
            </ButtonGroup>
            <ButtonGroup>
              {["Day", "Week", "Month"].map((v) => (
                <Choice key={v} inline hideControl type="radio" name="range" value={v.toLowerCase()} title={v} defaultChecked={v === "Week"} />
              ))}
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="fill" color="danger" icon="trash">Delete</Button>
              <Button variant="fill" color="danger" icon="chevronDown" aria-label="Delete options" />
            </ButtonGroup>
            <ButtonGroup>
              <Button icon="minus" aria-label="Decrease" onClick={() => setQuantity((q) => Math.max(0, q - 1))} />
              <Input type="number" min={0} value={quantity} onChange={(e) => setQuantity(Math.max(0, Number(e.target.value) || 0))} aria-label="Quantity" style={{ width: 48 }} />
              <Button icon="plus" aria-label="Increase" onClick={() => setQuantity((q) => q + 1)} />
            </ButtonGroup>
            <ButtonGroup>
              <Input prepend="$" mono defaultValue="120.00" aria-label="Amount" style={{ width: 96 }} />
              <Select look="button" defaultValue="usd" options={[{ value: "usd", label: "USD" }, { value: "eur", label: "EUR" }, { value: "gbp", label: "GBP" }]} aria-label="Currency" />
            </ButtonGroup>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Inputs">
          <div className="stack">
            <Field label="Email" hint="We will never share it.">
              <Input placeholder="you@example.com" type="email" />
            </Field>
            <Field label="Search">
              <Input icon="search" placeholder="Search…" />
            </Field>
            <Field label="Token" error hint="Invalid token.">
              <Input mono defaultValue="sk_live_…" />
            </Field>
            <Field label="Site" hint="Prepend and append text sit inside the field.">
              <Input prepend="https://" append=".com" placeholder="yoursite" />
            </Field>
            <Field label="Amount">
              <Input prepend="$" append="USD" mono placeholder="0.00" />
            </Field>
            <div className="row">
              <Input size="sm" placeholder="Small" />
              <Input placeholder="Medium" />
              <Input size="lg" placeholder="Large" />
            </div>
            <Field label="Native select" hint="The platform select, styled as an input. Where the browser supports customizable selects, the menu is styled too and options can show icons and descriptions.">
              <div className="row">
                <Select placeholder="Pick a country" defaultValue="" options={countryNames} />
                <Select icon="user" defaultValue="editor" options={[{ value: "viewer", label: "Viewer", icon: "eye", description: "Can read" }, { value: "editor", label: "Editor", icon: "edit", description: "Can read and write" }, { value: "admin", label: "Admin", icon: "settings", description: "Full access" }]} />
                <Select size="sm" defaultValue="v60" options={[{ value: "v60", label: "V60" }, { value: "kalita", label: "Kalita Wave" }, { value: "chemex", label: "Chemex" }]} />
                <Select size="lg" defaultValue="" placeholder="Large" options={countryNames} />
                <Select look="button" defaultValue="fast" options={[{ value: "fast", label: "Model: Fast" }, { value: "balanced", label: "Model: Balanced" }, { value: "thorough", label: "Model: Thorough" }]} />
                <Select disabled defaultValue="x" options={[{ value: "x", label: "Disabled" }]} />
              </div>
            </Field>
            <div className="stack stack--tight">
              <Checkbox label="Email notifications" description="Get a digest of activity every morning." defaultChecked />
              <Checkbox label="Marketing emails" />
              <Checkbox label="Partially selected" indeterminate />
              <Checkbox label="Disabled" disabled />
              <div className="row">
                <Checkbox size="sm" aria-label="Bare small" />
                <Checkbox aria-label="Bare" defaultChecked />
              </div>
            </div>
            <div className="stack stack--tight">
              <Switch label="Auto-save" description="Save the brew log after every change." defaultChecked />
              <Switch label="Notifications" />
              <Switch label="Label first" labelFirst defaultChecked />
              <Switch label="Disabled" disabled />
              <div className="row">
                <Switch size="sm" aria-label="Small switch" defaultChecked />
                <Switch aria-label="Bare switch" />
              </div>
            </div>
            <div className="stack stack--tight">
              <Radio name="plan" label="Free" description="For trying things out." defaultChecked />
              <Radio name="plan" label="Pro" description="For teams that ship." />
              <Radio name="plan" label="Enterprise" disabled />
              <div className="row">
                <Radio name="bare" size="sm" aria-label="Bare small" />
                <Radio name="bare" aria-label="Bare" defaultChecked />
              </div>
            </div>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Slider">
          <div className="stack">
            <Segmented
              size="sm"
              value={sliderSize}
              onChange={(v) => setSliderSize(v as "md" | "sm")}
              items={[{ value: "md", label: "Default" }, { value: "sm", label: "Small" }]}
            />
            <Field label="Basic" hint={`Value: ${volume}`}>
              <Slider size={sliderSize} value={volume} onChange={setVolume} aria-label="Volume" />
            </Field>
            <Field label="Ticks with labels" hint="Step 10, a tick at every step.">
              <Slider size={sliderSize} defaultValue={30} step={10} ticks tickLabels aria-label="Ticks" />
            </Field>
            <Field label="Detents" hint="Step 1, but snaps to 0, 25, 50, 75 and 100 when close.">
              <Slider size={sliderSize} defaultValue={40} detents={[0, 25, 50, 75, 100]} ticks={[0, 25, 50, 75, 100]} tooltip aria-label="Detents" />
            </Field>
            <Field label="Tooltip" hint="Shows the value while dragging or hovering. Second one always.">
              <div className="stack stack--tight">
                <Slider size={sliderSize} defaultValue={65} tooltip formatValue={(v) => `${v}%`} aria-label="Tooltip" />
                <Slider size={sliderSize} defaultValue={65} tooltip="always" formatValue={(v) => `${v}%`} aria-label="Tooltip always" />
              </div>
            </Field>
            <Field label="Steps with dots" hint="Uniform dots at every step of 10, then custom steps: only 0, 2, 4, 8, 16, 32 and 64 can be selected in a 0 to 100 range.">
              <div className="stack stack--tight">
                <Slider size={sliderSize} defaultValue={50} step={10} dots aria-label="Uniform dots" />
                <Slider size={sliderSize} defaultValue={3} min={1} max={5} dots ticks tickLabels formatValue={(v) => ["", "XS", "S", "M", "L", "XL"][v]} aria-label="Sizes" />
                <Slider size={sliderSize} defaultValue={8} steps={[0, 2, 4, 8, 16, 32, 64]} dots ticks tickLabels tooltip aria-label="Custom steps" />
              </div>
            </Field>
            <Field label="Range" hint={`$${price[0]} to $${price[1]}`}>
              <Slider size={sliderSize} value={price} onChange={setPrice} min={0} max={1000} step={10} tooltip formatValue={(v) => `$${v}`} aria-label="Price" />
            </Field>
            <Field label="Custom fill and background" hint="A gradient fill, then a hue spectrum track with no fill.">
              <div className="stack stack--tight">
                <Slider size={sliderSize} defaultValue={70} fill="linear-gradient(90deg, hsl(150 71% 36%), hsl(38 95% 44%), hsl(0 69% 52%))" aria-label="Gradient fill" />
                <Slider size={sliderSize} value={hue} onChange={setHue} max={360} fill="none" background="linear-gradient(90deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))" tooltip formatValue={(v) => `${v}°`} aria-label="Hue" />
              </div>
            </Field>
            <div className="row">
              <Badge color="primary">Hue {hue}°</Badge>
              <span style={{ width: 24, height: 24, borderRadius: "var(--radius-full)", background: `hsl(${hue} 80% 50%)` }} />
            </div>
            <Field label="Disabled">
              <Slider size={sliderSize} defaultValue={60} disabled aria-label="Disabled" />
            </Field>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Color picker">
          <div className="stack">
            <div className="row">
              <ColorPicker value={brand} onChange={setBrand} noAlpha />
              <ColorPicker value={overlay} onChange={setOverlay} label="Overlay" />
              <ColorPicker defaultValue={{ h: 150, s: 71, l: 36, a: 100 }} size="sm" align="right" />
              <ColorPicker defaultValue={{ h: 38, s: 95, l: 44, a: 100 }} disabled label="Disabled" />
            </div>
            <div className="row">
              <span style={{ width: 120, height: 48, borderRadius: "var(--radius)", background: toHsl(brand) }} />
              <span style={{ width: 120, height: 48, borderRadius: "var(--radius)", background: `linear-gradient(${toHsl(overlay)}, ${toHsl(overlay)}), ${toHsl(brand)}` }} />
              <Text size="sm" tone="muted">Brand color and the overlay laid over it. Both update live as you drag or type.</Text>
            </div>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Autocomplete and tokens">
          <div className="stack">
            <Field label="Country" hint={country ? `Selected: ${country.label}` : "Fixed list, opens on focus and filters as you type."}>
              <Autocomplete options={countries} openOnFocus placeholder="Pick a country" value={country} onChange={setCountry} />
            </Field>
            <Field label="Person" hint="Async: nothing until you type, then loads with a delay.">
              <Autocomplete loadOptions={searchPeople} icon="search" placeholder="Search people…" value={person} onChange={setPerson} />
            </Field>
            <Field label="Language" hint="Options with icons and descriptions, plus a create row for unknown values.">
              <Autocomplete
                options={languages}
                openOnFocus
                allowCreate
                placeholder="Type a language"
                value={language}
                onChange={setLanguage}
                onCreate={(q) => setLanguage({ value: q.toLowerCase(), label: q })}
              />
            </Field>
            <Field label="Tags" hint="Multi-select from a fixed list. Badge tokens, Backspace removes the last one.">
              <TokenInput options={countries} openOnFocus placeholder="Add a country…" defaultValue={[countries[2], countries[8]]} />
            </Field>
            <Field label="Form fields" hint="Outline tokens with a menu (make required), create new ones, drag to reorder.">
              <TokenInput
                options={fieldOptions}
                openOnFocus
                allowCreate
                sortable
                tokenVariant="outline"
                placeholder="Add a field…"
                value={fields}
                onChange={setFields}
                tokenMenu={(item, { update, remove }) => (
                  <>
                    <ListItem label={item.meta?.required ? "Make optional" : "Make required"} onClick={() => update({ required: !item.meta?.required })} />
                    <ListDivider />
                    <ListItem label="Remove" danger onClick={remove} />
                  </>
                )}
              />
            </Field>
            <Field label="Reviewers" hint="Async source with a custom token renderer: avatars instead of chips.">
              <TokenInput
                loadOptions={searchPeople}
                icon="search"
                placeholder="Search people…"
                renderToken={(item, { remove }) => (
                  <Token variant="default" size="sm" icon="user" label={item.label} onRemove={remove} />
                )}
              />
            </Field>
            <div className="row">
              <Token label="Badge token" />
              <Token label="With icon" icon="user" onRemove={() => {}} />
              <Token label="Required" meta="required" onRemove={() => {}} />
              <Token variant="default" label="Default" onRemove={() => {}} /><Token variant="outline" label="Outline" onRemove={() => {}} />
              <Token variant="default" label="Default with menu" meta="required" onRemove={() => {}} menu={<ListItem label="Option" />} />
            </div>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Badges">
          <TextPair title="Variants" description="Same axes as buttons: default, fill, flat, outline and ghost, each combined with a color." />
          <div className="row">
            <Badge>Default</Badge>
            <Badge variant="fill">Fill</Badge>
            <Badge variant="flat">Flat</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge icon="check">With icon</Badge>
            <Badge dot>With dot</Badge>
          </div>
          {(["primary", "success", "warning", "danger"] as const).map((c) => (
            <div className="row" key={c}>
              <Badge color={c} dot>Default</Badge>
              <Badge variant="fill" color={c}>Fill</Badge>
              <Badge variant="flat" color={c} dot>Flat</Badge>
              <Badge variant="outline" color={c} dot>Outline</Badge>
              <Badge variant="ghost" color={c} icon="check">Ghost</Badge>
            </div>
          ))}
        </Section>

        <hr className="divider" />

        <Section title="Blockquote">
          <div className="stack">
            <Blockquote>Design is not just what it looks like and feels like. Design is how it works.</Blockquote>
            <Blockquote cite="Steve Jobs">The people who are crazy enough to think they can change the world are the ones who do.</Blockquote>
            <Blockquote size="sm" cite="Dieter Rams" href="https://example.com/rams">Good design is as little design as possible.</Blockquote>
            <Blockquote size="lg" cite="Antoine de Saint-Exupéry">Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.</Blockquote>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Banners">
          <div className="stack">
            <TextPair title="Flat, the default" description="Card-shaped messages using the badge color scheme, with a default icon per color." />
            <div className="stack stack--tight">
              <Banner color="primary" title="A new software update is available." />
              <Banner color="success" title="Your changes have been saved." />
              <Banner color="warning" title="Your trial expires in 3 days." description="Upgrade to keep access to all features." />
              <Banner color="danger" title="Payment failed." description="Update your billing information to continue." />
            </div>
            <TextPair title="With actions and dismiss" description="Actions sit at the end; the dismiss button pulls into the padding." />
            <div className="stack stack--tight">
              <Banner color="warning" title="Your trial expires in 3 days." description="Upgrade to keep access to all features." actions={<Button size="sm" variant="fill" color="warning">Upgrade</Button>} onDismiss={() => {}} />
              <Banner title="Maintenance on Sunday at 02:00 UTC." description="Expect a few minutes of downtime." onDismiss={() => {}} />
            </div>
            <TextPair title="Other variants" description="default, fill, outline and ghost, same as badges." />
            <div className="stack stack--tight">
              <Banner variant="default" color="success" title="Default: page background with a neutral border." />
              <Banner variant="fill" color="danger" title="Fill: solid color with contrasting text." description="Best for one urgent message." />
              <Banner variant="outline" color="primary" title="Outline: colored border on a transparent background." />
              <Banner variant="ghost" color="warning" title="Ghost: just the icon and text." />
            </div>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Frame">
          <div className="stack">
            <TextPair title="Frame" description="A surface that groups cards. Raised cards sit inside it; ghost cards put content straight on the surface." />
            <Frame>
              <Card variant="ghost">
                <TextPair size="lg" title="Section header" description="Brief description about the section" />
              </Card>
              <Card>
                <TextPair size="lg" title="Section title" description="Section description" />
              </Card>
              <Card variant="ghost">
                <Text tone="muted">Footer</Text>
              </Card>
            </Frame>
            <TextPair title="Card sizes and a row layout" description="Card padding comes in sm, md and lg, on all sides or per axis with sizeX and sizeY. Frames can also lay cards out side by side." />
            <Frame direction="row">
              <Card size="sm" grow>
                <TextPair title="Small padding" description="Compact panel" />
              </Card>
              <Card grow>
                <TextPair title="Medium padding" description="The default" />
              </Card>
              <Card size="lg" grow>
                <TextPair title="Large padding" description="Roomy panel" />
              </Card>
            </Frame>
            <Frame>
              <Card variant="ghost" sizeY="sm">
                <div className="row">
                  <TextPair title="Members" description="3 people" className="grow" />
                  <Button size="sm" icon="plus">Invite</Button>
                </div>
              </Card>
              <Card size="sm">
                <List>
                  <ListItem icon="user" label="Ada Lovelace" trailing={<Badge color="primary">Owner</Badge>} />
                  <ListItem icon="user" label="Grace Hopper" trailing="Editor" />
                  <ListItem icon="user" label="Alan Turing" trailing="Viewer" />
                </List>
              </Card>
            </Frame>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Cards">
          <div className="stack">
            <Card
              title="Default card"
              description="Cards have a header, body and footer slot. Each is optional."
              action={<Badge color="success" dot>Live</Badge>}
            />
            <Card
              variant="surface"
              title="Surface card"
              description="Uses the surface color token for its background."
              footer={
                <>
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="fill" color="primary">Save</Button>
                </>
              }
            />
            <Card variant="elevated" title="Elevated card" description="Uses the shadow token instead of a border.">
              Body content goes below the header pair, with regular stack spacing.
            </Card>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Tabs and segmented">
          <div className="stack">
            <Tabs
              block
              items={[
                { value: "all", label: "All", trailing: <Badge>24</Badge> },
                { value: "open", label: "Open", icon: "check", trailing: <Badge color="primary">3</Badge> },
                { value: "archived", label: "Archived" },
                { value: "disabled", label: "Disabled", disabled: true },
              ]}
            />
            <Tabs
              items={[
                { value: "overview", label: "Overview" },
                { value: "members", label: "Members", trailing: <Badge>8</Badge> },
                { value: "billing", label: "Billing" },
                { value: "settings", label: "Settings", icon: "settings" },
              ]}
            />
            <Tabs
              items={[{ value: "a", label: "Overview" }, { value: "b", label: "Activity" }, { value: "c", label: "Settings", icon: "settings" }]}
              trailing={
                <>
                  <Input size="sm" icon="search" placeholder="Search…" />
                  <Button size="sm" variant="fill" color="primary" icon="plus">New</Button>
                </>
              }
            >
              <Button size="sm" variant="ghost" icon="plus" aria-label="Add tab" />
            </Tabs>
            <div className="row">
              <Segmented items={[{ value: "list", label: "List" }, { value: "board", label: "Board" }, { value: "calendar", label: "Calendar" }]} />
              <Segmented
                size="sm"
                items={[
                  { value: "sun", icon: "sun", title: "Light" },
                  { value: "moon", icon: "moon", title: "Dark" },
                ]}
              />
              <Segmented
                size="lg"
                items={[
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month", trailing: <Badge color="success" dot>New</Badge> },
                ]}
              />
            </div>
            <Segmented block items={[{ value: "1", label: "One" }, { value: "2", label: "Two" }, { value: "3", label: "Three" }]} />
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Combinations">
          <div className="stack">
            <div className="row">
              <Button icon="user">
                Inbox <Badge color="primary">12</Badge>
              </Button>
              <Button variant="fill" color="primary" icon="plus">
                Deploy <Badge color="warning" dot>Beta</Badge>
              </Button>
              <Button variant="outline">
                Filters <Badge>3</Badge>
              </Button>
            </div>
            <List bordered>
              <ListItem icon="user" label="Alice" trailing={<Badge color="success" dot>Online</Badge>} />
              <ListItem icon="user" label="Bob" description="Away for 2 hours" trailing={<Badge color="warning" dot>Away</Badge>} />
              <ListItem icon="settings" label="Integrations" trailing={<Badge color="primary">4</Badge>} />
            </List>
            <Input icon="search" placeholder="Search…" trailing={<Badge>⌘K</Badge>} />
            <Input prepend="@" placeholder="username" trailing={<Badge color="success" icon="check">Available</Badge>} />
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Collapsible">
          <div className="stack">
            <Collapsible title="Inline collapsible" description="Click the row to expand" icon="settings">
              <p className="collapsible__body">
                Content slides open below the trigger row. The trigger is the built-in button with a
                text pair and chevron.
              </p>
            </Collapsible>
            <Collapsible variant="panel" title="Panel collapsible" description="The whole header is the target" defaultOpen>
              <div className="stack stack--tight">
                <p className="collapsible__body">Details live inside the bordered panel and expand in place.</p>
                <div className="row">
                  <Badge color="success" dot>Healthy</Badge>
                  <Badge>3 checks</Badge>
                </div>
              </div>
            </Collapsible>
            <TextPair title="Accordion" description="A group where only one item is open at a time." />
            <CollapsibleGroup defaultValue="billing">
              <Collapsible value="account" title="Account" description="Name, email and password">
                <p className="collapsible__body">Only one section of the group can be open. Opening another closes this one.</p>
              </Collapsible>
              <Collapsible value="billing" title="Billing" description="Plan, invoices and payment method">
                <div className="row"><Badge color="primary">Pro</Badge><Badge>Renews Oct 1</Badge></div>
              </Collapsible>
              <Collapsible value="notifications" title="Notifications" description="Email and push preferences">
                <div className="stack stack--tight">
                  <Checkbox label="Product updates" defaultChecked />
                  <Checkbox label="Weekly digest" />
                </div>
              </Collapsible>
            </CollapsibleGroup>
            <CollapsibleGroup layout="stack" defaultValue="one" allowNone={false}>
              <Collapsible value="one" variant="panel" title="Panel one" description="Panels in a stack layout, one always open">
                <p className="collapsible__body">First panel content.</p>
              </Collapsible>
              <Collapsible value="two" variant="panel" title="Panel two" description="Click to switch">
                <p className="collapsible__body">Second panel content.</p>
              </Collapsible>
            </CollapsibleGroup>
            <Collapsible
              trigger={({ open, triggerProps }) => (
                <div className="row">
                  <Button variant="outline" icon="chevronDown" {...triggerProps}>
                    {open ? "Hide" : "Show"} advanced options
                  </Button>
                  <Badge>Custom trigger</Badge>
                </div>
              )}
            >
              <div className="stack" style={{ paddingTop: "var(--space-3)" }}>
                <Field label="Timeout">
                  <Input append="ms" mono defaultValue="3000" />
                </Field>
              </div>
            </Collapsible>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Avatars">
          <div className="stack">
            <div className="row">
              <Avatar name="Ada Lovelace" size="xs" />
              <Avatar name="Ada Lovelace" size="sm" />
              <Avatar name="Grace Hopper" />
              <Avatar name="Alan Turing" size="lg" />
              <Avatar name="Katherine Johnson" shape="square" />
              <Avatar name="Linus Torvalds" src="https://i.pravatar.cc/80?img=12" />
            </div>
            <div className="row">
              <Avatar name="Ada Lovelace" presence="online" />
              <Avatar name="Grace Hopper" presence="away" />
              <Avatar name="Alan Turing" presence="busy" />
              <Avatar name="Katherine Johnson" presence="offline" />
              <Avatar name="Margaret Hamilton" presence="online" size="lg" src="https://i.pravatar.cc/80?img=32" />
            </div>
            <div className="row">
              <AvatarGroup size="xs">
                <Avatar name="Ada Lovelace" />
                <Avatar name="Grace Hopper" />
                <Avatar name="Alan Turing" />
              </AvatarGroup>
              <AvatarGroup size="sm">
                <Avatar name="Ada Lovelace" />
                <Avatar name="Grace Hopper" />
                <Avatar name="Alan Turing" />
              </AvatarGroup>
              <AvatarGroup max={3}>
                <Avatar name="Ada Lovelace" src="https://i.pravatar.cc/80?img=5" />
                <Avatar name="Grace Hopper" />
                <Avatar name="Alan Turing" src="https://i.pravatar.cc/80?img=8" />
                <Avatar name="Katherine Johnson" />
                <Avatar name="Margaret Hamilton" />
              </AvatarGroup>
              <AvatarGroup size="lg">
                <Avatar name="Ada Lovelace" presence="online" />
                <Avatar name="Grace Hopper" presence="away" />
              </AvatarGroup>
            </div>
            <List bordered>
              <ListItem label={<span className="row"><Avatar name="Ada Lovelace" size="sm" presence="online" />Ada Lovelace</span>} trailing={<Badge color="primary">Owner</Badge>} />
              <ListItem label={<span className="row"><Avatar name="Grace Hopper" size="sm" presence="away" />Grace Hopper</span>} trailing="Editor" />
            </List>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Toast">
          <div className="stack">
            <TextPair title="Toasts" description="Call toast() from anywhere. New toasts stack in the corner showing only the latest; hover the stack to spread it into a list. Temporary toasts leave on their own, permanent and urgent ones wait to be dismissed, and urgent ones never stack." />
            <Field label="Position">
              <Segmented
                size="sm"
                value={toastPosition}
                onChange={(v) => setToastPosition(v as ToastPosition)}
                items={["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"].map((p) => ({ value: p, label: p.replace("-", " ") }))}
              />
            </Field>
            <div className="row">
              <Button onClick={() => toast({ title: "Brew log saved", description: "Your notes for today's V60 are in the log.", color: "success" })}>Temporary</Button>
              <Button onClick={() => toast({ title: "Grinder needs cleaning", description: "It has been 30 brews since the last clean.", color: "warning", mode: "permanent" })}>Permanent</Button>
              <Button color="danger" onClick={() => toast({ title: "Water heater offline", description: "Brewing is paused until it reconnects.", color: "danger", mode: "urgent" })}>Urgent</Button>
              <Button
                onClick={() =>
                  toast({
                    title: "Recipe updated",
                    description: "Water temperature changed to 96°C.",
                    color: "primary",
                    mode: "permanent",
                    dismissible: false,
                    actions: (dismiss) => (
                      <>
                        <Button size="sm" variant="fill" color="primary" onClick={dismiss}>Got it</Button>
                        <Button size="sm" variant="ghost" onClick={dismiss}>Undo</Button>
                      </>
                    ),
                  })
                }
              >
                With actions
              </Button>
              <Button
                onClick={() =>
                  toast({
                    mode: "permanent",
                    content: (dismiss) => (
                      <div className="row" style={{ padding: "var(--space-3) var(--card-padding)" }}>
                        <Avatar name="Grace Hopper" presence="online" />
                        <TextPair title="Grace Hopper" description="Just joined the tasting session." className="grow" />
                        <Button size="sm" variant="fill" color="primary" onClick={dismiss}>Join</Button>
                      </div>
                    ),
                  })
                }
              >
                Custom content
              </Button>
              <Button variant="ghost" onClick={() => toast.clear()}>Clear all</Button>
            </div>
          </div>
          <Toaster position={toastPosition} />
        </Section>

        <hr className="divider" />

        <Section title="Modal and tooltip">
          <div className="stack">
            <div className="row">
              <Button onClick={() => setModal("sm")}>Alert <Badge>sm</Badge></Button>
              <Button onClick={() => setModal("md")}>Form <Badge>md</Badge></Button>
              <Button onClick={() => setModal("lg")}>Scrolling <Badge>lg</Badge></Button>
              <Button onClick={() => setModal("xl")}>Wide <Badge>xl</Badge></Button>
              <Button onClick={() => setModal("full")}>Full <Badge>full</Badge></Button>
            </div>
            <div className="row">
              <Tooltip content="Tooltip on top">
                <Button variant="outline">Top</Button>
              </Tooltip>
              <Tooltip content="Tooltip below" side="bottom">
                <Button variant="outline">Bottom</Button>
              </Tooltip>
              <Tooltip content="To the left" side="left">
                <Button variant="outline">Left</Button>
              </Tooltip>
              <Tooltip content="To the right, with a longer text that wraps onto two lines" side="right">
                <Button variant="outline">Right</Button>
              </Tooltip>
              <Tooltip content="Settings">
                <Button icon="settings" aria-label="Settings" />
              </Tooltip>
              <Tooltip content="Ada Lovelace, online">
                <Avatar name="Ada Lovelace" presence="online" />
              </Tooltip>
            </div>
          </div>
          <Modal
            open={modal === "sm"}
            onClose={() => setModal(null)}
            size="sm"
            title="Delete workspace?"
            description="This cannot be undone."
            hideClose
            footer={
              <>
                <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
                <Button variant="fill" color="danger" icon="trash" onClick={() => setModal(null)}>Delete</Button>
              </>
            }
          />
          <Modal
            open={modal === "md"}
            onClose={() => setModal(null)}
            title="Invite a teammate"
            description="They will get an email with a link to join."
            footer={
              <>
                <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
                <Button variant="fill" color="primary" onClick={() => setModal(null)}>Send invite</Button>
              </>
            }
          >
            <div className="stack">
              <Field label="Email">
                <Input type="email" placeholder="name@company.com" />
              </Field>
              <Field label="Role">
                <Segmented block items={[{ value: "viewer", label: "Viewer" }, { value: "editor", label: "Editor" }, { value: "admin", label: "Admin" }]} />
              </Field>
            </div>
          </Modal>
          <Modal
            open={modal === "lg"}
            onClose={() => setModal(null)}
            size="lg"
            title="Terms of service"
            description="Scroll to read everything."
            footer={<Button variant="fill" color="primary" onClick={() => setModal(null)}>I agree</Button>}
          >
            <div className="stack">
              {Array.from({ length: 12 }, (_, i) => (
                <p key={i}>
                  Section {i + 1}. Body text inside a large modal scrolls within the modal while the header
                  and footer stay fixed. This keeps the actions reachable however long the content is.
                </p>
              ))}
            </div>
          </Modal>
          <Modal
            open={modal === "xl"}
            onClose={() => setModal(null)}
            size="xl"
            title="Wide modal"
            description="Room for two columns."
            footer={<Button variant="fill" color="primary" onClick={() => setModal(null)}>Done</Button>}
          >
            <div className="showcase" style={{ padding: 0, minHeight: 0 }}>
              <List bordered>
                <ListItem icon="user" label="Profile" selected />
                <ListItem icon="settings" label="Settings" />
                <ListItem icon="copy" label="Duplicate" />
              </List>
              <div className="stack">
                <Field label="Name">
                  <Input defaultValue="Ada Lovelace" />
                </Field>
                <Field label="Handle">
                  <Input prepend="@" defaultValue="ada" />
                </Field>
              </div>
            </div>
          </Modal>
          <Modal open={modal === "full"} onClose={() => setModal(null)} size="full" title="Full size" description="Takes most of the viewport.">
            <div className="stack">
              <p>Useful for editors, previews and anything that needs room.</p>
              <List bordered>
                <ListItem icon="user" label="Profile" />
                <ListItem icon="settings" label="Settings" />
              </List>
            </div>
          </Modal>
        </Section>

        <hr className="divider" />

        <Section title="Chat">
          <TextPair title="Conversation" description="Outgoing messages are bubbles on the right, incoming are plain text on the left. Hover a message for time and actions; the row is always reserved so nothing shifts. Send a message to see arrivals animate in." />
          <Chat
            messages={chat}
            typing={typing}
            onSend={sendChat}
            maxHeight={420}
            placeholder="Ask the barista…"
            draftAttachments={draftFiles}
            onRemoveDraftAttachment={(id) => setDraftFiles((f) => f.filter((a) => a.id !== id))}
            onFiles={(files) => setDraftFiles((f) => [...f, ...toAttachments(files)])}
            onAttach={addSampleFile}
            panel={showQuestions && <Questionnaire questions={brewQuestions} onSubmit={submitAnswers} onCancel={() => setShowQuestions(false)} />}
          />
        </Section>

        <hr className="divider" />

        <Section title="Task list">
          <TextPair title="Task breakdown" description="A task with its sub-tasks. Click through the states: planning shows the title on a surface background with a spinner and cannot expand; once the breakdown exists, hover the header for the chevron and click to collapse or expand. The active item and the title shimmer while work is in progress. The chat above has one inline." />
          <div className="row">
            {["Planning", "Not started", "Step 1", "Step 3", "Last step", "Complete"].map((label, i) => (
              <Button key={label} size="sm" variant={taskStage === i ? "fill" : "outline"} onClick={() => setTaskStage(i)}>{label}</Button>
            ))}
          </div>
          <TaskList
            title="Launch the marketing site"
            defaultOpen
            tasks={
              taskStage === 0
                ? []
                : ["Scaffold the project structure", "Build the component registry", "Implement entitlement gating", "Wire up Stripe checkout", "Polish the landing page"].map((label, i) => {
                    const activeIndex = [-1, -1, 0, 2, 4, 5][taskStage];
                    return { id: `s${i}`, label, status: i < activeIndex ? "done" : i === activeIndex ? "active" : "pending" };
                  })
            }
          />
          <div className="row">
            <Shimmer>Thinking about the next step…</Shimmer>
            <Text size="sm" tone="muted"><Shimmer>Standalone shimmer on muted text</Shimmer></Text>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Drop zone">
          <div className="stack">
            <TextPair title="Standalone" description="A dashed area you can drop files on or click to browse. Dropped files show below as attachments." />
            <DropZone onFiles={(files) => setDropped((d) => [...d, ...toAttachments(files)])} />
            {dropped.length > 0 && (
              <div className="row">
                {dropped.map((a) => (
                  <Attachment key={a.id} attachment={a} onRemove={() => setDropped((d) => d.filter((x) => x.id !== a.id))} />
                ))}
              </div>
            )}
            <TextPair title="Any element as the target" description="Wrap an element and it becomes the drop target with an overlay while dragging. Images only here." />
            <DropZone accept="image/*" onFiles={(files) => setDropped((d) => [...d, ...toAttachments(files)])}>
              {({ open }) => (
                <Card title="Cover image" description="Drop an image onto this card, or use the button." action={<Button size="sm" icon="image" onClick={open}>Choose</Button>} />
              )}
            </DropZone>
            <Text size="sm" tone="subtle">The chat composer and the standalone composer below are drop targets too.</Text>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Composer with attachments">
          <TextPair title="Standalone composer" description="Attachments show as thumbnails above the toolbar, each removable. Drop files anywhere on the composer to attach them. Custom tools go on the left, custom actions on the right next to Send." />
          <Composer
            value={standaloneDraft}
            onChange={setStandaloneDraft}
            onSubmit={() => { setStandaloneDraft(""); setStandaloneFiles([]); }}
            placeholder="Write a message…"
            attachments={standaloneFiles}
            onRemoveAttachment={(id) => setStandaloneFiles((f) => f.filter((a) => a.id !== id))}
            onFiles={(files) => setStandaloneFiles((f) => [...f, ...toAttachments(files)])}
            allowEmpty
            tools={
              <>
                <Button variant="ghost" size="sm" icon="plus" aria-label="Attach" onClick={() => setStandaloneFiles((f) => (f.length < sampleFiles.length ? [...f, sampleFiles[f.length]] : f))} />
                <Button variant="ghost" size="sm" icon="mic" aria-label="Record" />
              </>
            }
            actions={
              <>
                <Badge variant="ghost">Draft saved</Badge>
                <Button variant="ghost" size="sm" icon="calendar">Schedule</Button>
              </>
            }
          />
        </Section>

        <hr className="divider" />

        <Section title="Hover card">
          <div className="stack">
            <Text as="div" relaxed>
              The extraction notes were written by{" "}
              <HoverCard
                content={
                  <div className="stack stack--tight">
                    <div className="row">
                      <Avatar name="Ada Lovelace" size="lg" presence="online" />
                      <TextPair title="Ada Lovelace" description="Head of Brewing, Analytical Coffee Co." />
                    </div>
                    <Text size="sm" tone="muted" relaxed>
                      Runs the sensory lab and writes most of the extraction guides. Joined in 2021, based in London.
                    </Text>
                    <div className="row">
                      <Badge color="success" dot>Online</Badge>
                      <Badge>12 guides</Badge>
                    </div>
                  </div>
                }
              >
                <a className="link" href="#">Ada Lovelace</a>
              </HoverCard>{" "}
              and reviewed by{" "}
              <HoverCard
                side="bottom"
                content={
                  <div className="row">
                    <Avatar name="Grace Hopper" presence="away" />
                    <TextPair title="Grace Hopper" description="Roaster · Away until 3 PM" className="grow" />
                    <Tooltip content="Open profile">
                      <Button size="sm" variant="ghost" icon="arrowUpRight" aria-label="Open profile" />
                    </Tooltip>
                  </div>
                }
              >
                <a className="link" href="#">Grace Hopper</a>
              </HoverCard>
              , who both keep tabs on the brew logs.
            </Text>
            <Text size="sm" tone="subtle">Hover a name for half a second. You can move onto the card without it closing.</Text>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Data list">
          <div className="stack">
            <TextPair title="Label and value rows" description="Labels share one column sized by the longest label, capped by a token; values fill the rest." />
            <DataList
              items={[
                { label: "Status", value: <Badge color="success" dot>Active</Badge> },
                { label: "Owner", value: <span className="row"><Avatar name="Ada Lovelace" size="xs" />Ada Lovelace</span> },
                { label: "Created", value: "March 2, 2021" },
                { label: "Repository", value: <a className="link" href="#">analytical-coffee/brew-guides</a> },
                { label: "A much longer label that gets capped", value: "The label column stops at its max width and wraps." },
              ]}
            />
            <TextPair title="Values aligned to the end, divided rows" description="Useful for totals and figures." />
            <Card>
              <DataList
                align="end"
                divided
                items={[
                  { label: "Subtotal", value: "$128.00" },
                  { label: "Shipping", value: "$9.50" },
                  { label: "Tax", value: "$11.00" },
                  { label: <strong>Total</strong>, value: <strong>$148.50</strong> },
                ]}
              />
            </Card>
            <TextPair title="Small" description="Compact rows for sidebars and cards." />
            <DataList
              size="sm"
              items={[
                { label: "Brewer", value: "V60" },
                { label: "Dose", value: "15 g" },
                { label: "Water", value: "250 g at 96°C" },
                { label: "Time", value: "2:45" },
              ]}
            />
            <TextPair title="Icons and a larger gap" description="Labels can carry an icon; the gap between rows has small, medium and large steps." />
            <DataList
              gap="lg"
              items={[
                { icon: "user", label: "Assignee", value: <span className="row"><Avatar name="Grace Hopper" size="xs" />Grace Hopper</span> },
                { icon: "calendar", label: "Due", value: "Friday, March 20" },
                { icon: "file", label: "Attachments", value: "3 files" },
                { icon: "settings", label: "Priority", value: <Badge color="warning" dot>High</Badge> },
              ]}
            />
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Context menu">
          <div className="stack">
            <ContextMenu
              menu={
                <>
                  <ListSection title="File">
                    <ListItem icon="copy" label="Duplicate" trailing="⌘D" />
                    <ListItem icon="edit" label="Rename" trailing="↵" />
                  </ListSection>
                  <ListSection>
                    <ListItem icon="trash" label="Delete" danger trailing="⌫" />
                  </ListSection>
                </>
              }
            >
              <Card variant="surface" title="Right-click this card" description="The menu opens at the pointer and flips to stay on screen. Try it near the edges." />
            </ContextMenu>
            <div className="row">
              {["Ada Lovelace", "Grace Hopper", "Alan Turing"].map((name) => (
                <ContextMenu
                  key={name}
                  menu={(close) => (
                    <>
                      <ListHeading>{name}</ListHeading>
                      <ListItem icon="user" label="View profile" />
                      <ListItem icon="arrowRight" label="Message" />
                      <ListDivider />
                      <ListItem label="Close menu" onClick={close} />
                    </>
                  )}
                >
                  <Avatar name={name} presence="online" />
                </ContextMenu>
              ))}
              <Text size="sm" tone="subtle">Right-click an avatar. The email column in the table also has one.</Text>
            </div>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Lists and dropdowns">
          <div className="stack">
            <List bordered>
              <ListSection title="Workspace">
                <ListItem icon="user" label="Profile" trailing="⌘P" />
                <ListItem icon="settings" label="Settings" description="Preferences, billing and team" selected />
                <ListItem icon="copy" label="Duplicate" trailing="⌘D" />
              </ListSection>
              <ListSection title="Danger zone">
                <ListItem icon="trash" label="Delete workspace" danger />
              </ListSection>
            </List>
            <List bordered>
              <ListHeading>Tree</ListHeading>
              <ListItem icon="copy" label="Option A">
                <ListItem label="Option A.1" />
                <ListItem label="Option A.2" selected />
              </ListItem>
              <ListItem icon="copy" label="Option B" />
              <ListItem icon="copy" label="Option C" collapsible>
                <ListItem label="Option C.1" />
                <ListItem label="Option C.2" collapsible defaultExpanded={false}>
                  <ListItem label="Option C.2.a" />
                  <ListItem label="Option C.2.b" />
                </ListItem>
              </ListItem>
            </List>
            <List bordered>
              <ListHeading>Manual heading</ListHeading>
              <ListItem label="Item one" />
              <ListItem label="Item two" />
              <ListDivider />
              <ListItem label="After a manual divider" />
            </List>
            <div className="row">
              <Dropdown label="Actions">
                <ListItem icon="copy" label="Duplicate" trailing="⌘D" />
                <ListItem icon="settings" label="Settings" />
                <ListDivider />
                <ListItem icon="trash" label="Delete" danger />
              </Dropdown>
              <Dropdown label="Primary" variant="fill" color="primary" icon="plus">
                <ListItem label="New file" description="Start from scratch" />
                <ListItem label="From template" description="Pick a starting point" />
              </Dropdown>
              <Dropdown label="Nested">
                <ListItem icon="copy" label="Duplicate" />
                <SubMenu icon="arrowRight" label="Move to">
                  <ListItem label="Inbox" />
                  <ListItem label="Archive" />
                  <SubMenu label="Projects">
                    <ListItem label="Brew guides" />
                    <ListItem label="Roasting" />
                    <ListItem label="Sensory lab" />
                  </SubMenu>
                </SubMenu>
                <SubMenu icon="user" label="Share with">
                  <ListItem label="Ada Lovelace" />
                  <ListItem label="Grace Hopper" />
                  <ListDivider />
                  <ListItem label="Everyone" />
                </SubMenu>
                <ListDivider />
                <ListItem icon="trash" label="Delete" danger />
              </Dropdown>
              <Dropdown icon="settings" triggerLabel="More" hideChevron align="right">
                <ListSection title="Account">
                  <ListItem icon="user" label="Profile" />
                  <ListItem icon="settings" label="Preferences" />
                </ListSection>
                <ListSection>
                  <ListItem label="Sign out" />
                </ListSection>
              </Dropdown>
            </div>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Selectable cards">
          <div className="stack">
            <TextPair title="Checkbox cards" description="Default card style when unselected, many can be selected." />
            <div className="stack stack--tight">
              <Choice name="addons" value="backups" title="Daily backups" description="Restore any version from the last 30 days." icon="copy" trailing="$5/mo" defaultChecked />
              <Choice name="addons" value="sso" title="Single sign-on" description="SAML and OIDC with your identity provider." icon="user" trailing="$20/mo" />
              <Choice name="addons" value="audit" title="Audit log" description="Every action, exportable." icon="settings" trailing={<Badge color="warning" dot>Beta</Badge>} />
            </div>
            <TextPair title="Radio cards" description="Surface style when unselected, one can be selected." />
            <div className="stack stack--tight">
              <Choice type="radio" name="region" value="us" variant="surface" title="United States" description="us-east-1" defaultChecked />
              <Choice type="radio" name="region" value="eu" variant="surface" title="Europe" description="eu-west-1" />
              <Choice type="radio" name="region" value="ap" variant="surface" title="Asia Pacific" description="ap-southeast-1" disabled />
            </div>
            <TextPair title="Without a control" description="The card alone shows the state." />
            <div className="row">
              <Choice type="radio" name="size" value="s" hideControl title="Small" description="1 vCPU, 2 GB" defaultChecked />
              <Choice type="radio" name="size" value="m" hideControl title="Medium" description="2 vCPU, 4 GB" />
              <Choice type="radio" name="size" value="l" hideControl title="Large" description="4 vCPU, 8 GB" />
            </div>
            <TextPair title="Inline tags" description="Button-sized checkboxes for picking several." />
            <div className="row">
              {["Design", "Engineering", "Marketing", "Sales", "Support", "Research"].map((tag, i) => (
                <Choice key={tag} inline name="tags" value={tag} title={tag} defaultChecked={i < 2} />
              ))}
            </div>
            <TextPair title="Inline radios" description="With icons, and a version without the control." />
            <div className="row">
              <Choice inline type="radio" name="view" value="list" icon="copy" title="List" defaultChecked />
              <Choice inline type="radio" name="view" value="board" icon="settings" title="Board" />
              <Choice inline type="radio" name="view" value="calendar" icon="sun" title="Calendar" />
            </div>
            <div className="row">
              {["XS", "S", "M", "L", "XL"].map((size, i) => (
                <Choice key={size} inline hideControl type="radio" name="tshirt" value={size} title={size} defaultChecked={i === 2} />
              ))}
            </div>
          </div>
        </Section>

        <hr className="divider" />

        <Section title="Table">
          <div className="row">
            <TextPair
              title="Advanced table"
              description="Drag headers to reorder, drag a header edge to resize, click a Name, Email or Roles cell to edit (Roles opens a token list), hover a header for its menu. Name is fixed left, actions fixed right, header and footer stay put while scrolling."
            />
          </div>
          <Segmented
            size="sm"
            value={tableVariant}
            onChange={setTableVariant}
            items={[{ value: "default", label: "Default" }, { value: "bordered", label: "Bordered" }, { value: "compact", label: "Compact" }, { value: "both", label: "Bordered + compact" }]}
          />
          {selectedPeople.length > 0 ? (
            <Toolbar aria-label="Bulk actions">
              <ToolbarGroup>
                <Text size="sm" tone="subtle" className="toolbar__text">{selectedPeople.length} selected</Text>
              </ToolbarGroup>
              <ToolbarGroup>
                <Dropdown size="sm" variant="ghost" label="Set status">
                  {statuses.map((s) => (
                    <ListItem key={s} label={s} onClick={() => bulkStatus(s)} />
                  ))}
                </Dropdown>
                <Button size="sm" variant="ghost" color="danger" icon="trash" onClick={bulkDelete}>Delete</Button>
              </ToolbarGroup>
              <ToolbarGroup>
                <Button size="sm" variant="ghost" icon="x" onClick={() => setSelectedPeople([])}>Clear</Button>
              </ToolbarGroup>
            </Toolbar>
          ) : (
            <Text size="sm" tone="subtle">Select rows to see bulk actions. Shift-click selects a range.</Text>
          )}
          <Table
            columns={personColumns}
            rows={rows}
            rowKey={(p) => p.id}
            reorderable
            resizable
            columnMenu
            selectable
            selected={selectedPeople}
            onSelectionChange={setSelectedPeople}
            maxHeight={300}
            bordered={tableVariant === "bordered" || tableVariant === "both"}
            compact={tableVariant === "compact" || tableVariant === "both"}
            footer={{
              name: `${rows.length} people`,
              commits: rows.reduce((n, p) => n + p.commits, 0).toLocaleString(),
              status: `${rows.filter((p) => p.status === "Active").length} active`,
            }}
            onCellChange={(i, key, value) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: value } : row)))}
          />
          <TextPair title="Plain table" description="The same classes work on a hand-written table." />
          <table className="table">
            <thead>
              <tr>
                <th className="table__head-cell">Name</th>
                <th className="table__head-cell">Status</th>
                <th className="table__head-cell">ID</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Alpha", "success", "Active", "a1f9"],
                ["Beta", "warning", "Pending", "b7c2"],
                ["Gamma", "danger", "Failed", "c3e8"],
              ].map(([name, variant, status, id]) => (
                <tr key={id} className="table__row">
                  <td className="table__cell">{name}</td>
                  <td className="table__cell">
                    <Badge color={variant as "success" | "warning" | "danger"} dot>{status}</Badge>
                  </td>
                  <td className="table__cell table__cell--mono">{id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </main>
  );
}
