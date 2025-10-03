import React from "react";

export type PersonalIssue = { field: string; value: string; risk: "low" | "medium" | "high" };

export default function PersonalInfoIssuesList({ items }: { items: PersonalIssue[] }) {
  if (!items.length) return <p className="text-sm text-gray-600">No issues found.</p>;
  const badge = (risk: PersonalIssue["risk"]) =>
    risk === "high" ? "bg-red-100 text-red-800" : risk === "medium" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800";
  return (
    <ul className="list-disc pl-6">
      {items.map((i, idx) => (
        <li key={idx}>
          <span className="font-medium">{i.field}:</span> {i.value}{" "}
          <span className={`text-2xs uppercase px-1 py-0.5 rounded ${badge(i.risk)}`}>({i.risk})</span>
        </li>
      ))}
    </ul>
  );
}