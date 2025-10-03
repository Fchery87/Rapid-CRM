export default function LoadingAudit() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse space-y-8">
      <section>
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="rounded border p-3">
            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-16 bg-gray-200 rounded" />
          </div>
          <div className="rounded border p-3">
            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-16 bg-gray-200 rounded" />
          </div>
          <div className="rounded border p-3">
            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </section>

      <section>
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="mt-2 border rounded">
          <div className="h-8 bg-gray-100 border-b" />
          <div className="h-24" />
        </div>
      </section>

      <section>
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <ul className="mt-2 space-y-2">
          <li className="h-4 w-64 bg-gray-200 rounded" />
          <li className="h-4 w-56 bg-gray-200 rounded" />
        </ul>
      </section>
    </div>
  );
}