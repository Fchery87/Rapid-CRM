import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

// Resolve a seeded report by calling the API
async function getFirstReportId() {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  const res = await fetch(`${api}/reports`);
  if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`);
  const reports = await res.json();
  if (!Array.isArray(reports) || reports.length === 0) {
    throw new Error("No reports found. Seed data first.");
  }
  return reports[0].id;
}

async function main() {
  const outDir = path.join(process.cwd(), "artifacts");
  fs.mkdirSync(outDir, { recursive: true });

  const id = await getFirstReportId();
  const url = `http://localhost:3000/audit/${id}`;

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "networkidle" });

  // Ensure the main heading is present before printing
  await page.waitForSelector("h1:text(\"Simple Audit\")", { timeout: 15000 });

  const pdfPath = path.join(outDir, "audit-preview.pdf");
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }
  });

  console.log("PDF written to", pdfPath);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});