"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Input, List, ListItem, ListSection, SideNav, Text } from "@/components";

export type NavItem = { href: string; label: string; trailing?: string };
export type NavGroup = { title: string; items: NavItem[] };

/** Documentation navigation: a SideNav with a filter input over sectioned link items. */
export function DocsNav({ groups, title = "Docs" }: { groups: NavGroup[]; title?: string }) {
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  return (
    <SideNav
      aria-label="Documentation"
      className="docs__nav"
      header={
        <>
          <Text size="title" className="docs__nav-title">{title}</Text>
          <Input size="sm" icon="search" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter navigation" />
        </>
      }
    >
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
    </SideNav>
  );
}
