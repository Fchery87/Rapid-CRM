import React from "react";

export default function KPICard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-2xl font-semibold" aria-live="polite">
        {value}
      </div>
    </div>
  );
}