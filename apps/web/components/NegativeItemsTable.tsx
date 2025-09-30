import React from "react";

export type NegativeItem = {
  id: string;
  account: string;
  issue: string;
  priority: "P1" | "P2" | "P3";
  flags: string[];
  bureauDates: { TU?: string; EX?: string; EQ?: string };
};

export default function NegativeItemsTable({ items }: { items: NegativeItem[] }) {
  if (!items.length) return <p className="text-sm text-gray-600">No negative items found.</p>;
  return (
    <div className="overflow-auto">
      <table className="min-w-full border mt-2" role="table">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="text-left p-2 border">
              Account
            </th>
            <th scope="col" className="text-left p-2 border">
              Issue
            </th>
            <th scope="col" className="text-left p-2 border">
              Priority
            </th>
            <th scope="col" className="text-left p-2 border">
              Flags
            </th>
            <th scope="col" className="text-left p-2 border">
              Dates (TU/EX/EQ)
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((n) => (
            <tr key={n.id} className="odd:bg-white even:bg-gray-50">
              <td className="p-2 border">{n.account}</td>
              <td className="p-2 border">{n.issue}</td>
              <td className="p-2 border">{n.priority}</td>
              <td className="p-2 border">{n.flags.join(", ")}</td>
              <td className="p-2 border">
                {[n.bureauDates.TU ?? "—", n.bureauDates.EX ?? "—", n.bureauDates.EQ ?? "—"].join(" / ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}