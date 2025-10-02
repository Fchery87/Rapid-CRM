import Link from "next/link";
import { apiGet } from "@/src/lib/api";

async function getReports() {
  return apiGet("/reports");
}

export default async function ReportsPage() {
  const reports = await getReports();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reports</h1>
      {reports.length === 0 ? (
        <p className="text-sm text-gray-600">No reports yet.</p>
      ) : (
        <ul className="divide-y">
          {reports.map((r: any) => (
            <li key={r.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.accountName}</div>
                <div className="text-xs text-gray-600">
                  {r.vendor} · {new Date(r.reportDate).toLocaleDateString()}
                </div>
              </div>
              <Link className="text-brand-700 underline" href={`/audit/${r.id}`}>
                View audit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}