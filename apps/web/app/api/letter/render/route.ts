import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = process.env.SERVICE_RENDER_TOKEN || "";
    const auth = req.headers.get("authorization") || "";
    if (token) {
      const expected = `Bearer ${token}`;
      // constant-time compare
      const ok = expected.length === auth.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(auth));
      if (!ok) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { reportId, bureau, branding, items, body } = await req.json();

    const title = "Dispute Letter";
    const header = branding?.header || "Rapid — Dispute Letter";
    const footer = branding?.footer || `Report ${reportId}${bureau ? ` — ${bureau}` : ""}`;
    const logo = branding?.logoUrl
      ? `<img src="${branding.logoUrl}" alt="Logo" style="height:32px; margin-right:8px;" />`
      : "";

    const list =
      Array.isArray(items) && items.length
        ? `<h2 style="font-size:16px; font-weight:600; margin-top:16px;">Disputed Items</h2>
           <ol style="padding-left:20px;">
             ${items
               .map(
                 (it: any) =>
                   `<li style="margin-bottom:8px;">
                      <div><strong>${it.account || "Account"}</strong></div>
                      ${it.reason ? `<div>Reason: ${it.reason}</div>` : ""}
                      ${it.details ? `<div>Details: ${it.details}</div>` : ""}
                    </li>`
               )
               .join("")}
           </ol>`
        : "";

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <style>
      @media print {
        .rapid-print-header, .rapid-print-footer { position: fixed; width: 100%; left: 0; right: 0; color: #444; font-size: 10px; }
        .rapid-print-header { top: 0; border-bottom: 1px solid #ddd; padding: 4px 8px;}
        .rapid-print-footer { bottom: 0; border-top: 1px solid #ddd; padding: 4px 8px;}
        body { margin-top: 32px; margin-bottom: 32px; }
      }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif; }
      .container { padding: 24px; }
      .meta { color: #555; font-size: 12px; }
      h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    </style>
  </head>
  <body>
    <div class="rapid-print-header">${header}</div>
    <div class="rapid-print-footer">${footer}</div>
    <div class="container">
      <header style="display:flex; align-items:center; gap:8px; margin-bottom: 12px;">
        ${logo}
        <div>
          <h1>${title}</h1>
          <div class="meta">Date: ${new Date().toLocaleDateString()}</div>
          <div class="meta">To: ${bureau ? bureau + " Bureau" : "Credit Bureau"}</div>
        </div>
      </header>
      ${body ? `<p>${body}</p>` : ""}
      ${list}
      <div class="meta" style="margin-top:24px;">Report ID: ${reportId}${bureau ? " · Bureau: " + bureau : ""}</div>
    </div>
  </body>
</html>`;

    return new NextResponse(html, { headers: { "Content-Type": "text/html", "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}