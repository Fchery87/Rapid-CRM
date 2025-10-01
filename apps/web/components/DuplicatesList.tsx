import React from "react";

export type Duplicate = { description: string; bureaus: Array<"TU" | "EX" | "EQ"> };

export default function DuplicatesList({ items }: { items: Duplicate[] }) {
  if (!items.length) return <p className="text-sm text-gray-600">No duplicates detected.</p>;
  return (
    <ul className="list-disc pl-6">
      {items.map((d, idx) => (
        <li key={idx}>
          {d.description} — {d.bureaus.join(", ")}
        </li>
      ))}
    </ul>
  );
}