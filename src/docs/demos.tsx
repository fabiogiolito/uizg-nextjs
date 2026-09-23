"use client";

import { useState } from "react";
import { Button, Composer, Field, Input, Modal, Table, type Column, type Option } from "@/components";
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
  return <Table columns={columns} rows={rows} rowKey={(r) => r.id} selectable={bool(p.selectable)} reorderable={bool(p.reorderable)} resizable={bool(p.resizable)} columnMenu={bool(p.columnMenu)} bordered={bool(p.bordered)} compact={bool(p.compact)} maxHeight={280} onCellChange={(i, key, value) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: value } : row)))} />;
}
export function ComposerDemo({ p }: { p: Props }) {
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState(bool(p.attachments) ? [{ id: "f1", type: "image" as const, name: "cup.jpg", url: "https://picsum.photos/seed/cup/160" }, { id: "f2", type: "file" as const, name: "brew-log.csv", size: "4 KB" }] : []);
  return <Composer value={draft} onChange={setDraft} onSubmit={() => setDraft("")} placeholder={str(p.placeholder)} submitLabel={str(p.submitLabel)} expanded={bool(p.expanded)} attachments={files} onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))} onFiles={() => {}} allowEmpty tools={bool(p.tools) ? <><Button variant="ghost" size="sm" icon="plus" aria-label="Attach" /><Button variant="ghost" size="sm" icon="mic" aria-label="Record" /></> : undefined} />;
}

