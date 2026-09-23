import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { DocsNav, type NavGroup } from "@/docs/DocsNav";
import { groups, registry } from "@/docs/registry";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-mono" });

export const metadata: Metadata = { title: "uizg", description: "Design system documentation" };

const navGroups: NavGroup[] = [
  { title: "Foundations", items: [{ href: "/", label: "Overview" }, { href: "/tokens", label: "Design tokens" }, { href: "/colors", label: "Colors" }, { href: "/kitchen-sink", label: "Kitchen sink" }] },
  ...groups.map((g) => ({ title: g, items: registry.filter((e) => e.group === g).map((e) => ({ href: `/components/${e.slug}`, label: e.name })) })),
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <head>
        {/* Served as-is on purpose: the bundler would rewrite hsl() values to hex and drop the background hue. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/tokens.css" />
      </head>
      <body className="antialiased">
        <div className="docs">
          <DocsNav groups={navGroups} title="uizg" />
          <main className="docs__main">{children}</main>
        </div>
      </body>
    </html>
  );
}
