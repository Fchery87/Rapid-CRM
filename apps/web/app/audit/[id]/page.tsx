type Audit = {
  id: string;
  accountId: string;
  vendor: string;
  reportDate: string;
  kpis: {
    scores: { TU?: number | null; EX?: number | null; EQ?: number | null };
    counts: { tradelines: number; inquiries: number; publicRecords: number };
  };
  negativeItems: Array<{
    id: string;
    account: string;
    issue: string;
    priority: "P1" | "P2" | "P3";
    flags: string[];
    bureauDates: { TU?: string; EX?: string; EQ?: string };
  }>;
  utilization: {
    overall: { current: number; target: number; delta: number };
    byBureau: { TU?: number; EX?: number; EQ?: number };
  };
  personalInfoIssues: Array<{ field: string; value: string; risk: "low" | "medium" | "high" }>;
  duplicates: Array<{ description: string; bureaus: ("TU" | "EX" | "EQ")[] }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function getAudit(id: string): Promise<Audit> {
  const res = await fetch(`${API_URL}/audit/${id}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to load audit");
  return res.json();
}

export default async function AuditPage({ params }: { params: { id: string } }) {
  const data = await getAudit(params.id);
  const scores = data.kpis.scores;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold">Simple Audit</h1>
        <p className="text-sm text-gray-600">
          Vendor: {data.vendor} · Report date: {new Date(data.reportDate).toLocaleDateString()}
        </p>
      </header>

      <section aria-labelledby="kpis-title">
        <h2 id="kpis-title" className="text-lg font-medium">Summary KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="rounded border p-3">
            <div className="text-xs text-gray-600">TransUnion</div>
            <div className="text-2xl font-semibold">{scores.TU ?? "—"}</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs text-gray-600">Experian</div>
            <div className="text-2xl font-semibold">{scores.EX ?? "—"}</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs text-gray-600">Equifax</div>
            <div className="text-2xl font-semibold">{scores.EQ ?? "—"}</div>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Tradelines: {data.kpis.counts.tradelines} · Inquiries: {data.kpis.counts.inquiries} · Public Records: {data.kpis.counts.publicRecords}
        </div>
      </section>

      <section aria-labelledby="neg-items-title">
        <h2 id="neg-items-title" className="text-lg font-medium">Negative Items</h2>
        {data.negativeItems.length === 0 ? (
          <p className="text-sm text-gray-600">No negative items found.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full border mt-2" role="table">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="text-left p-2 border">Account</th>
                  <th scope="col" className="text-left p-2 border">Issue</th>
                  <th scope="col" className="text-left p-2 border">Priority</th>
                  <th scope="col" className="text-left p-2 border">Flags</th>
                  <th scope="col" className="text-left p-2 border">Dates (TU/EX/EQ)</th>
                </tr>
              </thead>
              <tbody>
                {data.negativeItems.map((n) => (
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
        )}
      </section>

      <section aria-labelledby="util-title">
        <h2 id="util-title" className="text-lg font-medium">Utilization</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="rounded border p-3">
            <div className="text-xs text-gray-600">Overall</div>
            <div className="text-2xl font-semibold">{data.utilization.overall.current}%</div>
            <div className="text-xs text-gray-600">Target {data.utilization.overall.target}% · Delta {data.utilization.overall.delta}%</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs text-gray-600">TransUnion</div>
            <div className="text-2xl font-semibold">{data.utilization.byBureau.TU ?? 0}%</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs text-gray-600">Experian</div>
            <div className="text-2xl font-semibold">{data.utilization.byBureau.EX ?? 0}%</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs text-gray-600">Equifax</div>
            <div className="text-2xl font-semibold">{data.utilization.byBureau.EQ ?? 0}%</div>
          </div>
        </div>
      </section>

      <section aria-labelledby="pii-title">
        <h2 id="pii-title" className="text-lg font-medium">Personal Info Audit</h2>
        {data.personalInfoIssues.length === 0 ? (
          <p className="text-sm text-gray-600">No issues found.</p>
        ) : (
          <ul className="list-disc pl-6">
            {data.personalInfoIssues.map((i, idx) => (
              <li key={idx}>
                <span className="font-medium">{i.field}:</span> {i.value} <span className="text-xs uppercase">({i.risk})</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="dupes-title">
        <h2 id="dupes-title" className="text-lg font-medium">Duplicates Across Bureaus</h2>
        {data.duplicates.length === 0 ? (
          <p className="text-sm text-gray-600">No duplicates detected.</p>
        ) : (
          <ul className="list-disc pl-6">
            {data.duplicates.map((d, idx) => (
              <li key={idx}>
                {d.description} — {d.bureaus.join(", ")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}