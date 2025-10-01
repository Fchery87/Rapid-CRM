import { test, expect } from "@playwright/test";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Choose a conservative threshold in CI to reduce flakiness
const TTFB_THRESHOLD_MS = process.env.CI ? 1000 : 500;

async function getReportId(request: any) {
  const res = await request.get(`${API}/reports`);
  if (!res.ok()) return null;
  const reports = await res.json();
  return Array.isArray(reports) && reports.length ? reports[0].id : null;
}

test("TTFB budget for /audit/[id]", async ({ page }) => {
  const reportId = await getReportId(page.request);
  test.skip(!reportId, "No report id available; skipping perf test");

  // Navigate and wait for load to get a complete navigation entry
  await page.goto(`/audit/${reportId}`, { waitUntil: "load" });

  // Read Navigation Timing v2 via PerformanceNavigationTiming
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!nav) return null;
    return {
      // responseStart is a good proxy for TTFB (in ms)
      ttfb: nav.responseStart
    };
  });

  test.skip(!timing, "No navigation timing available; skipping perf test");
  const ttfb = timing!.ttfb;
  // eslint-disable-next-line no-console
  console.log(`Measured TTFB: ${Math.round(ttfb)} ms (threshold ${TTFB_THRESHOLD_MS} ms)`);
  expect(ttfb).toBeLessThanOrEqual(TTFB_THRESHOLD_MS);
});