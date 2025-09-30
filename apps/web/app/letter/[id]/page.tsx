import PrintLayout from "@/components/PrintLayout";

type LetterData = {
  reportId: string;
  bureau?: string;
  date: string;
  recipient: string;
  body: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function getLetterData(id: string, bureau?: string): Promise<LetterData> {
  // Placeholder letter content until normalized data supports specific items
  return {
    reportId: id,
    bureau,
    date: new Date().toLocaleDateString(),
    recipient: bureau ? `${bureau} Bureau` : "Credit Bureau",
    body:
      "This is a demo dispute letter generated for preview purposes. " +
      "Replace with actual dispute items and consumer information once available."
  };
}

export default async function LetterPage({ params, searchParams }: { params: { id: string }, searchParams: { bureau?: string } }) {
  const data = await getLetterData(params.id, searchParams?.bureau);
  return (
    <PrintLayout title="Dispute Letter" header="Rapid — Dispute Letter" footer={`Report ${data.reportId}${data.bureau ? ` — ${data.bureau}` : ""}`}>
      <section className="prose max-w-none">
        <p className="text-sm text-gray-600">Date: {data.date}</p>
        <p className="text-sm text-gray-600">To: {data.recipient}</p>
        <div className="mt-4">
          <p>{data.body}</p>
        </div>
        <div className="mt-12 text-sm text-gray-600">
          Report ID: {data.reportId} {data.bureau ? `· Bureau: ${data.bureau}` : ""}
        </div>
      </section>
    </PrintLayout>
  );
}