"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Input } from "./Input";
import { List, ListItem, ListSection } from "./List";
import { Text } from "./Text";

export type NavItem = { href: string; label: string; trailing?: string };
export type NavGroup = { title: string; items: NavItem[] };

/** Documentation navigation: a filter input over a sectioned List of link items. */
export function SideNav({ groups, title = "Docs" }: { groups: NavGroup[]; title?: string }) {
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  return (
    <nav className="side-nav" aria-label="Documentation">
      <Text size="title" className="side-nav__title">{title}</Text>
      <Input size="sm" icon="search" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter navigation" />
      <List>
        {groups.map((g) => {
          const items = g.items.filter((i) => !query || i.label.toLowerCase().includes(query));
          if (!items.length) return null;
          return (
            <ListSection key={g.title} title={g.title}>
              {items.map((i) => (
                <ListItem key={i.href} href={i.href} label={i.label} trailing={i.trailing} selected={pathname === i.href} />
              ))}
            </ListSection>
          );
        })}
      </List>
    </nav>
  );
}
