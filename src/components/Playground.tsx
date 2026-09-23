"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "./cx";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { CodeBlock } from "./CodeBlock";
import { Field, Input } from "./Input";
import { Select } from "./Select";
import { Tabs } from "./Tabs";
import { Text } from "./Text";
import { jsxFor, formatHtml } from "@/docs/code";
import { bySlug } from "@/docs/registry";
import type { DocEntry, Props } from "@/docs/types";

const defaults = (entry: DocEntry): Props =>
  Object.fromEntries(Object.entries(entry.controls).map(([k, c]) => [k, "default" in c ? c.default : undefined]));

/**
 * Live preview of a component with a sidebar of controls, a list of states to step through,
 * and the React and HTML code for what is shown.
 */
export function Playground({ slug }: { slug: string }) {
  const entry = bySlug(slug)!;
  return <PlaygroundInner key={slug} entry={entry} />;
}

function PlaygroundInner({ entry }: { entry: DocEntry }) {
  const [props, setProps] = useState<Props>(() => ({ ...defaults(entry), ...(entry.states?.[0]?.props ?? {}) }));
  const [state, setState] = useState<number | null>(entry.states?.length ? 0 : null);
  const [tab, setTab] = useState("react");
  const [html, setHtml] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const set = (key: string, value: unknown) => {
    setProps((p) => ({ ...p, [key]: value }));
    setState(null);
  };
  const applyState = (i: number) => {
    setProps({ ...defaults(entry), ...entry.states![i].props });
    setState(i);
  };
  const next = () => entry.states && applyState(state === null ? 0 : (state + 1) % entry.states.length);

  const code = useMemo(() => (entry.code ? entry.code(props) : jsxFor(entry.name, props, entry.controls)), [entry, props]);

  useEffect(() => {
    if (tab !== "html") return;
    const el = previewRef.current;
    if (el) setHtml(formatHtml(el.innerHTML));
  }, [tab, props]);

  return (
    <div className="playground">
      <div className="playground__main">
        <div className={cx("playground__preview", entry.previewOn === "surface" && "playground__preview--surface", entry.previewAlign === "end" && "playground__preview--end", entry.previewFlush && "playground__preview--flush")}>
          <div ref={previewRef} className="playground__stage">
            {entry.render(props)}
          </div>
        </div>
        {entry.states && entry.states.length > 0 && (
          <div className="playground__states">
            <Text size="label" tone="subtle">States</Text>
            <div className="row">
              {entry.states.map((s, i) => (
                <Button key={s.name} size="sm" variant={state === i ? "fill" : "outline"} onClick={() => applyState(i)}>{s.name}</Button>
              ))}
              <Button size="sm" variant="ghost" trailingIcon="arrowRight" onClick={next}>Next</Button>
            </div>
            {state !== null && entry.states[state].description && <Text size="sm" tone="muted">{entry.states[state].description}</Text>}
          </div>
        )}
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "react", label: "React" },
            { value: "html", label: "HTML" },
          ]}
        />
        {tab === "react" ? <CodeBlock code={code} language="tsx" /> : <CodeBlock code={html} language="html" />}
      </div>
      <aside className="playground__controls">
        <Text size="label" tone="subtle">Props</Text>
        {Object.entries(entry.controls).map(([key, c]) => {
          const value = props[key];
          if (c.type === "boolean") {
            return <Checkbox key={key} label={c.label ?? key} description={c.doc} checked={!!value} onChange={(e) => set(key, e.target.checked)} />;
          }
          if (c.type === "select") {
            return (
              <Field key={key} label={c.label ?? key} hint={c.doc}>
                <Select size="sm" value={String(value ?? "")} onChange={(e) => set(key, e.target.value)} options={c.options.map((o) => ({ value: o, label: o || "(none)" }))} />
              </Field>
            );
          }
          if (c.type === "number") {
            return (
              <Field key={key} label={c.label ?? key} hint={c.doc}>
                <Input size="sm" type="number" mono min={c.min} max={c.max} step={c.step} value={value === undefined ? "" : String(value)} onChange={(e) => set(key, e.target.value === "" ? undefined : Number(e.target.value))} />
              </Field>
            );
          }
          return (
            <Field key={key} label={c.label ?? key} hint={c.doc}>
              <Input size="sm" value={String(value ?? "")} onChange={(e) => set(key, e.target.value)} />
            </Field>
          );
        })}
        {Object.keys(entry.controls).length === 0 && <Badge>No adjustable props</Badge>}
      </aside>
    </div>
  );
}
