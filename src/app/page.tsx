import Link from "next/link";
import { Badge, Card, CodeBlock, Text, TextPair } from "@/components";
import { groups, registry } from "@/docs/registry";

export default function Overview() {
  return (
    <>
      <header className="docs__header">
        <Text size="display">uizg design system</Text>
        <Text size="lg" tone="muted" relaxed>
          Reusable components on a small set of CSS variables. Every design decision is a token, derived tokens cascade from base ones,
          and classes follow BEM so anything can be restyled. Native HTML and CSS features are preferred over JavaScript.
        </Text>
      </header>
      <section className="docs__section">
        <h2 className="docs__section-title">Start here</h2>
        <div className="color-grid color-grid--wide">
          <Link href="/tokens" style={{ textDecoration: "none", color: "inherit" }}><Card title="Design tokens" description="Every variable, what derives from what, editable live." /></Link>
          <Link href="/colors" style={{ textDecoration: "none", color: "inherit" }}><Card title="Colors" description="Six base colors and everything computed from them, in light and dark." /></Link>
          <Link href="/components/button" style={{ textDecoration: "none", color: "inherit" }}><Card title="Button" description="The variant and color axes most components share." /></Link>
          <Link href="/kitchen-sink" style={{ textDecoration: "none", color: "inherit" }}><Card title="Kitchen sink" description="Everything on one page, composed into realistic examples." /></Link>
        </div>
      </section>
      <section className="docs__section">
        <h2 className="docs__section-title">Principles</h2>
        <ul className="docs__usage">
          <li>Tokens live in <code className="code">public/tokens.css</code>. Base tokens hold literal values; derived tokens reference them with the math inline.</li>
          <li>Two axes on Button, Badge and Banner: <code className="code">variant</code> decides the style, <code className="code">color</code> the accent.</li>
          <li>Slots are named <code className="code">leading</code> and <code className="code">trailing</code>. Inputs also have <code className="code">prepend</code> and <code className="code">append</code> addons.</li>
          <li>Progress reads &ldquo;n of m&rdquo; in a default Badge. Collapsing uses the shared Reveal. Overlays use dialog, popover and CSS anchor positioning.</li>
        </ul>
      </section>
      <section className="docs__section">
        <h2 className="docs__section-title">Getting started</h2>
        <CodeBlock language="tsx" code={`import { Button, Card, TextPair } from "@/components";\n\n<Card title="Welcome" description="Everything is a token.">\n  <Button variant="fill" color="primary" icon="check">Get started</Button>\n</Card>`} />
      </section>
      {groups.map((g) => (
        <section key={g} className="docs__section">
          <h2 className="docs__section-title">{g}</h2>
          <div className="color-grid">
            {registry.filter((e) => e.group === g).map((e) => (
              <Link key={e.slug} href={`/components/${e.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <Card size="sm" title={e.name} description={e.description} />
              </Link>
            ))}
          </div>
        </section>
      ))}
      <section className="docs__section">
        <TextPair title="Live theming" description="Changes made on the Design tokens and Colors pages apply to every page until you reload." />
        <Badge variant="outline">{registry.length} components</Badge>
      </section>
    </>
  );
}
