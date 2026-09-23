import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, CodeBlock, Collapsible, PropsTable, Text, TextPair } from "@/components";
// Docs-only components stay out of the package index.
import { Playground } from "@/components/Playground";
import { VarsTable } from "@/components/VarsTable";
import { getCssBlocks, getTokens } from "@/docs/css";
import { bySlug, registry } from "@/docs/registry";
import type { Control } from "@/docs/types";

export const generateStaticParams = () => registry.map((e) => ({ slug: e.slug }));

const typeOf = (c: Control) => (c.type === "select" ? c.options.filter(Boolean).map((o) => `"${o}"`).join(" | ") : c.type === "text" ? "string" : c.type);
const defaultOf = (c: Control) => ("default" in c && c.default !== undefined && c.default !== "" ? JSON.stringify(c.default) : undefined);

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = bySlug(slug);
  if (!entry) notFound();
  const blocks = getCssBlocks().filter((b) => entry.cssBlocks.includes(b.title));
  const tokens = getTokens();
  const vars = Array.from(new Set(blocks.flatMap((b) => b.vars))).map((name) => ({ name, value: tokens.find((t) => t.name === name)?.value ?? "" }));
  const propRows = [
    ...Object.entries(entry.controls).map(([name, c]) => ({ name, type: typeOf(c), default: defaultOf(c), description: c.doc })),
    ...(entry.extraProps ?? []),
  ];

  return (
    <>
      <header className="docs__header">
        <div className="row">
          <Text size="display">{entry.name}</Text>
          <Badge variant="outline">{entry.group}</Badge>
        </div>
        <Text size="lg" tone="muted" relaxed>{entry.description}</Text>
      </header>

      {entry.usage && (
        <section className="docs__section">
          <h2 className="docs__section-title">Usage</h2>
          <ul className="docs__usage">{entry.usage.map((u) => <li key={u}>{u}</li>)}</ul>
        </section>
      )}

      <section className="docs__section">
        <Playground slug={entry.slug} />
      </section>

      <section className="docs__section">
        <h2 className="docs__section-title">Props</h2>
        {propRows.length ? <PropsTable rows={propRows} /> : <Text size="sm" tone="subtle">This component takes children and callbacks only; see the code above.</Text>}
      </section>

      <section className="docs__section">
        <TextPair title="CSS variables" description="Tokens read by this component's styles, with the declared value and what the browser resolves it to right now. Edit them on the Design tokens page to see this update." titleAs="h2" />
        <VarsTable rows={vars} />
      </section>

      {blocks.length > 0 && (
        <section className="docs__section">
          <Collapsible title="Stylesheet" description={`${blocks.map((b) => b.title).join(", ")} in components.css`}>
            <div className="stack" style={{ paddingTop: "var(--space-2)" }}>
              {blocks.map((b) => <CodeBlock key={b.title} language="css" code={b.css} />)}
            </div>
          </Collapsible>
        </section>
      )}

      {entry.related && entry.related.length > 0 && (
        <section className="docs__section">
          <h2 className="docs__section-title">Related</h2>
          <div className="row">
            {entry.related.map((r) => { const e = bySlug(r); return e ? <Link key={r} href={`/components/${r}`} className="link">{e.name}</Link> : null; })}
          </div>
        </section>
      )}
    </>
  );
}
