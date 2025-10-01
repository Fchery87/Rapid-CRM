"use client";

export default function ErrorAudit({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="space-y-3">
      <h2 className="text-lg font-semibold">Failed to load audit</h2>
      <p className="text-sm text-gray-700">{error.message || "An unexpected error occurred."}</p>
      <button onClick={() => reset()} className="px-3 py-2 border rounded">
        Try again
      </button>
    </div>
  );
}