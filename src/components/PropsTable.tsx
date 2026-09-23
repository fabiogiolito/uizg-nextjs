import type { ReactNode } from "react";

export type PropRow = { name: string; type: string; default?: string; description?: ReactNode };

/** Documentation table of a component's props. */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <table className="table props-table">
      <thead>
        <tr>
          <th className="table__head-cell">Prop</th>
          <th className="table__head-cell">Type</th>
          <th className="table__head-cell">Default</th>
          <th className="table__head-cell">Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="table__row">
            <td className="table__cell table__cell--mono">{r.name}</td>
            <td className="table__cell table__cell--mono props-table__type">{r.type}</td>
            <td className="table__cell table__cell--mono">{r.default ?? "—"}</td>
            <td className="table__cell props-table__desc">{r.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
