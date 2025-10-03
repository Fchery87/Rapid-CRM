import React from "react";

export type Utilization = {
  current: number;
  target: number;
  delta: number;
};

export default function UtilizationCard({ title = "Overall", value }: { title?: string; value: Utilization }) {
  const status =
    value.current <= value.target ? "text-green-700" : value.current - value.target <= 10 ? "text-amber-700" : "text-red-700";
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-gray-600">{title}</div>
      <div className={`text-2xl font-semibold ${status}`} aria-live="polite">
        {value.current}%
      </div>
      <div className="text-xs text-gray-600">Target {value.target}% · Delta {value.delta}%</div>
    </div>
  );
}