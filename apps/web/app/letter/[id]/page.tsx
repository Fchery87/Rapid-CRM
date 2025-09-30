import PrintLayout from "@/components/PrintLayout";

type LetterItem = {
  account?: string;
  reason?: string;
  details?: string;
};

type Branding = {
  header?: string;
  footer?: string;
  logoUrl?: string;
};

type LetterData = {
  reportId: string;
  bureau?: string;
  date: string;
  recipient: string;
  body?: string;
  items?: LetterItem[];
  branding?: Branding;
};

function parseDataParam(param?: string): Partial<LetterData> | undefined {
  if (!param) return undefined;
  try {
    const json = Buffer.from(param, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}

async function getLetterData(id: string, bureau?: string, dataParam?: string): Promise<LetterData> {
  const override = parseDataParam(dataParam);
  const base: LetterData = {
    reportId: id,
    bureau: bureau || override?.bureau,
    date: new Date().toLocaleDateString(),
    recipient: bureau ? `${bureau} Bureau` : "Credit Bureau",
    body:
      "This is a demo dispute letter generated for preview purposes. " +
      "Replace with actual dispute items and consumer information once available.",
    items: []
  };
  const merged: LetterData = {
    ...base,
    ...override,
    branding: override?.branding || undefined
  };
  return merged;
}

export default async function LetterPage({ params, searchParams }: { params: { id: string }, searchParams: { bureau?: string, data?: string } }) {
  const data = await getLetterData(params.id, searchParams?.bureau, searchParams?.data);
  const branding = data.branding || {};
  return (
    <PrintLayout
      title="Dispute Letter"
      header={branding.header || "Rapid — Dispute Letter"}
      footer={branding.footer || `Report ${data.reportId}${data.bureau ? ` — ${data.bureau}` : ""}`}
    >
      <section className="prose max-w-none">
        <div className="flex items-center gap-3">
          {branding.logoUrl ? <img src={branding.logoUrl} alt="Logo" style={{ height: 32 }} /> : null}
          <div>
            <p className="text-sm text-gray-600">Date: {data.date}</p>
            <p className="text-sm text-gray-600">To: {data.recipient}</p>
          </div>
        </div>

        {data.body ? <div className="mt-4"><p>{data.body}</p></div> : null}

        {data.items && data.items.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-lg font-medium">Disputed Items</h2>
            <ol className="list-decimal pl-6">
              {data.items.map((it, idx) => (
                <li key={idx} className="mb-2">
                  <div><span className="font-medium">{it.account || "Account"}</span></div>
                  {it.reason ? <div>Reason: {it.reason}</div> : null}
                  {it.details ? <div>Details: {it.details}</div> : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="mt-12 text-sm text-gray-600">
          Report ID: {data.reportId} {data.bureau ? `· Bureau: ${data.bureau}` : ""}
        </div>
      </section>
    </PrintLayout>
  );
}