"use client";

import { useMemo } from "react";
import { Swatch } from "./Swatch";
import { Text } from "./Text";
import { resolveToken, useMounted, useTokenVersion } from "@/docs/tokens";

export type VarRow = { name: string; value: string };

/** CSS variables a component uses, with the declared value and what the browser resolves it to. Updates live. */
export function VarsTable({ rows }: { rows: VarRow[] }) {
  const version = useTokenVersion();
  const mounted = useMounted();
  // Resolved on the client only (reads computed styles), recomputed when tokens change.
  const resolved = useMemo<Record<string, { value: string; hex: string | null }>>(
    () => (mounted ? Object.fromEntries(rows.map((r) => [r.name, resolveToken(r.name)])) : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, version, mounted],
  );
  if (!rows.length) return <Text size="sm" tone="subtle">This component does not read any design tokens directly.</Text>;
  return (
    <table className="table vars-table">
      <thead>
        <tr>
          <th className="table__head-cell">Variable</th>
          <th className="table__head-cell">Value</th>
          <th className="table__head-cell">Resolves to</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const res = resolved[r.name];
          return (
            <tr key={r.name} className="table__row">
              <td className="table__cell table__cell--mono">{r.name}</td>
              <td className="table__cell table__cell--mono vars-table__value">{r.value || <span className="text--subtle">not declared</span>}</td>
              <td className="table__cell vars-table__resolved">
                {res?.hex ? (
                  <span className="row">
                    <Swatch color={res.hex} size="sm" label="" />
                    <code className="code">{res.hex}</code>
                  </span>
                ) : (
                  <code className="code">{res?.value || "—"}</code>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
