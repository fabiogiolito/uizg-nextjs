"use client";

import { useState } from "react";
import { Avatar, Board, BoardColumn, BoardItem, Button, Composer, Dropdown, Field, HoverCard, Input, List, ListItem, ListSection, Modal, Split, Table, Text, TextPair, type Column, type Option } from "@/components";
import type { Props } from "./types";

const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const bool = (v: unknown) => !!v;
const opt = <T,>(v: unknown, d: T) => (v === "" || v === undefined ? d : (v as T));
const people: Option[] = ["Ada Lovelace", "Grace Hopper", "Alan Turing", "Katherine Johnson", "Margaret Hamilton"].map((n) => ({ value: n.toLowerCase().replace(" ", "-"), label: n, icon: "user" }));

export function ModalDemo({ p }: { p: Props }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title={str(p.title)} description={str(p.description) || undefined} size={opt(p.size, "md")} hideClose={bool(p.hideClose)} dismissible={bool(p.dismissible)} footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="fill" color="primary" onClick={() => setOpen(false)}>Send invite</Button></>}>
        <Field label="Email"><Input type="email" placeholder="name@company.com" /></Field>
      </Modal>
    </>
  );
}
type Person = { id: string; name: string; email: string; role: string; commits: number };
const columns: Column<Person>[] = [
  { key: "name", header: "Name", width: 160, sticky: "left", editable: true },
  { key: "email", header: "Email", width: 220, editable: true, mono: true },
  { key: "role", header: "Role", width: 120, editable: true },
  { key: "commits", header: "Commits", width: 110, align: "end", mono: true },
];
export function TableDemo({ p }: { p: Props }) {
  const [rows, setRows] = useState<Person[]>(people.map((x, i) => ({ id: x.value, name: x.label, email: `${x.value}@example.com`, role: ["Engineer", "Researcher", "Lead"][i % 3], commits: 120 * (i + 1) })));
  // With row anchors, the name cell's hover panel aligns to the row's right edge and opens below the row.
  const cols = bool(p.rowAnchors)
    ? columns.map((c) => (c.key === "name" ? { ...c, editable: false, render: (row: Person, _i: number, { anchor }: { anchor?: string }) => <HoverCard anchor={anchor} side="bottom" align="end" content={<div className="row"><Avatar name={row.name} /><TextPair title={row.name} description={`${row.role} · ${row.commits} commits`} className="grow" /></div>}><a className="link" href="#">{row.name}</a></HoverCard> } : c))
    : columns;
  return <Table columns={cols} rowAnchors={bool(p.rowAnchors)} rows={rows} rowKey={(r) => r.id} selectable={bool(p.selectable)} reorderable={bool(p.reorderable)} resizable={bool(p.resizable)} fill={bool(p.fill)} columnMenu={bool(p.columnMenu)} bordered={bool(p.bordered)} compact={bool(p.compact)} maxHeight={280} onCellChange={(i, key, value) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: value } : row)))} />;
}
export function ComposerDemo({ p }: { p: Props }) {
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState(bool(p.attachments) ? [{ id: "f1", type: "image" as const, name: "cup.jpg", url: "https://picsum.photos/seed/cup/160" }, { id: "f2", type: "file" as const, name: "brew-log.csv", size: "4 KB" }] : []);
  return <Composer value={draft} onChange={setDraft} onSubmit={() => setDraft("")} placeholder={str(p.placeholder)} submitLabel={str(p.submitLabel)} expanded={bool(p.expanded)} attachments={files} onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))} onFiles={() => {}} allowEmpty tools={bool(p.tools) ? <><Button variant="ghost" size="sm" icon="plus" aria-label="Attach" /><Button variant="ghost" size="sm" icon="mic" aria-label="Record" /></> : undefined} />;
}


type Candidate = { id: string; name: string; role: string; age: string; note?: string; accent?: boolean; badge?: string };
const initialColumns: Record<string, Candidate[]> = {
  inbox: [
    { id: "c1", name: "Patricia Sanders", role: "Software Engineer", age: "3d", note: "Asked about day-to-day, team and process.", accent: true, badge: "T" },
    { id: "c2", name: "Dennis Callis", role: "Software Engineer", age: "3d", note: "Asked about role details and comp info.", accent: true, badge: "A" },
    { id: "c3", name: "David Elson", role: "Software Engineer", age: "5d", badge: "G" },
    { id: "c4", name: "Kimberly Mastrangelo", role: "Software Engineer", age: "5d", badge: "a" },
    { id: "c5", name: "Alex Buckmaster", role: "Software Engineer", age: "10d", badge: "S" },
  ],
  interested: [
    { id: "c6", name: "Paula Mora", role: "Software Engineer", age: "3d", note: "Asked about day-to-day, team and process.", accent: true, badge: "P" },
    { id: "c7", name: "Iva Ryan", role: "Software Engineer", age: "5d", badge: "c" },
    { id: "c8", name: "James Hall", role: "Software Engineer", age: "5d", badge: "@" },
  ],
  interviewing: [
    { id: "c9", name: "Kurt Bates", role: "10:30am – 11:00am", age: "5d" },
    { id: "c10", name: "Katie Sims", role: "11:00am – 11:30am", age: "3d", note: "Asked to push meeting to tomorrow.", accent: true },
  ],
  archived: [{ id: "c11", name: "Eddie Lake", role: "Veridian Dynamics", age: "5d" }],
  hired: [],
};

export function BoardDemo({ p }: { p: Props }) {
  const [columns, setColumns] = useState(initialColumns);
  const [selected, setSelected] = useState<string | null>(null);
  const move = (id: string, from: string, to: string) =>
    setColumns((c) => {
      const item = c[from].find((i) => i.id === id);
      if (!item) return c;
      return { ...c, [from]: c[from].filter((i) => i.id !== id), [to]: [...c[to], item] };
    });
  const item = (c: Candidate) => (
    <BoardItem
      key={c.id}
      id={c.id}
      leading={<Avatar name={c.name} size="lg" shape="square" badge={c.badge ? <span className="board-demo__logo">{c.badge}</span> : undefined} />}
      label={c.name}
      description={c.role}
      trailing={<Text size="sm" tone="subtle" className={c.age === "10d" ? "board-demo__late" : undefined}>{c.age}</Text>}
      note={c.note}
      accent={c.accent}
      selected={selected === c.id}
      onClick={() => setSelected(c.id)}
    />
  );
  const more = (
    <Dropdown size="sm" variant="ghost" icon="more" hideChevron triggerLabel="Column actions">
      <ListItem icon="check" label="Mark all as read" />
      <ListItem icon="archive" label="Archive all" />
    </Dropdown>
  );
  const all = Object.values(columns).flat();
  const current = all.find((c) => c.id === selected) ?? null;
  const focusColumn = selected ? (Object.keys(columns).find((k) => columns[k].some((c) => c.id === selected)) ?? null) : null;
  const close = () => setSelected(null);
  return (
    <Split
      onClose={close}
      pane={current ? (
        <div className="stack" style={{ padding: "var(--space-4)", minHeight: "100%", background: "var(--color-raised)" }}>
          <div className="row"><Avatar name={current.name} size="lg" shape="square" /><TextPair size="lg" title={current.name} description={current.role} className="grow" /><Button size="sm" variant="ghost" icon="x" aria-label="Close" onClick={close} /></div>
          {current.note && <Text>{current.note}</Text>}
          <Text tone="muted">Click another card in this column to switch; Escape or the X closes the details.</Text>
        </div>
      ) : null}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", height: "100%" }}>
        {focusColumn && <div><Button variant="ghost" icon="arrowLeft" onClick={close}>All columns</Button></div>}
        <div style={{ flex: 1, minHeight: 0 }}>
    <Board onMove={move} draggable={bool(p.draggable)} focus={focusColumn}>
      <BoardColumn id="inbox" icon="inbox" title="Inbox" count={columns.inbox.length} actions={more} collapsible={bool(p.collapsible)} header={bool(p.header) ? <Input size="sm" icon="search" placeholder="Filter" aria-label="Filter inbox" /> : undefined}>
        <List>{columns.inbox.map(item)}</List>
      </BoardColumn>
      <BoardColumn id="interested" icon="messageSquare" title="Interested" count={columns.interested.length} actions={more} collapsible={bool(p.collapsible)}>
        <List>{columns.interested.map(item)}</List>
      </BoardColumn>
      <BoardColumn id="interviewing" icon="calendar" title="Interviewing" count={columns.interviewing.length} actions={more} collapsible={bool(p.collapsible)}>
        <List>
          <ListSection title="July 15" trailing="Tue">{columns.interviewing.map(item)}</ListSection>
          <ListSection title="Interviewed" trailing={String(columns.archived.length)}>{columns.archived.slice(0, 1).map(item)}</ListSection>
        </List>
      </BoardColumn>
      <BoardColumn id="archived" icon="archive" title="Archived" count={columns.archived.length} collapsible defaultCollapsed>
        <List>{columns.archived.map(item)}</List>
      </BoardColumn>
      <BoardColumn id="hired" icon="userCheck" title="Hired" count={columns.hired.length} collapsible defaultCollapsed>
        <List>{columns.hired.map(item)}</List>
      </BoardColumn>
    </Board>
        </div>
      </div>
    </Split>
  );
}

export function SplitDemo({ p }: { p: Props }) {
  const [open, setOpen] = useState(true);
  const [picked, setPicked] = useState("Patricia Sanders");
  const names = ["Patricia Sanders", "Dennis Callis", "David Elson"];
  return (
    <Split
      storageKey={bool(p.remember) ? "docs-split" : undefined}
      pane={open ? (
        <div className="stack" style={{ padding: "var(--space-4)", minHeight: "100%", background: "var(--color-raised)" }}>
          <div className="row"><TextPair size="lg" title={picked} description="Software Engineer" className="grow" /><Button size="sm" variant="ghost" icon="x" aria-label="Close" onClick={() => setOpen(false)} /></div>
          <Text>Details for {picked}. Drag the divider to resize; double-click it to reset.</Text>
        </div>
      ) : null}
    >
      <div className="stack" style={{ padding: "var(--space-4)" }}>
        <div className="row"><TextPair size="lg" title="Candidates" className="grow" /><Button size="sm" onClick={() => setOpen((o) => !o)}>{open ? "Close pane" : "Open pane"}</Button></div>
        <List>
          {names.map((n) => (
            <ListItem key={n} leading={<Avatar name={n} size="sm" />} label={n} description="Software Engineer" selected={open && picked === n} onClick={() => { setPicked(n); setOpen(true); }} />
          ))}
        </List>
      </div>
    </Split>
  );
}
