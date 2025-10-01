import { test, expect } from "@playwright/test";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function getReportId(page) {
  const res = await page.request.get(`${API}/reports`);
  if (!res.ok()) return null;
  const reports = await res.json();
  return Array.isArray(reports) && reports.length ? reports[0].id : null;
}

test.describe("Audit page visual snapshots and responsive behavior", () => {
  test.skip(!!process.env.CI, "Snapshot tests are disabled in CI to avoid baseline drift");

  const breakpoints = [
    { name: "sm", width: 360, height: 800 },
    { name: "md", width: 768, height: 900 },
    { name: "lg", width: 1024, height: 900 }
  ];

  for (const bp of breakpoints) {
    test(`snapshot @${bp.name}`, async ({ page }) => {
      const reportId = await getReportId(page);
      test.skip(!reportId, "No report id available");
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto(`/audit/${reportId}`);

      // KPI grid wrapping — ensure cards render and are visible at this breakpoint
      const kpiCards = page.locator("section >> text=Summary KPIs").locator("..").locator(".grid > div");
      await expect(kpiCards).toHaveCount(3);

      // Negative items table — horizontal scroll expected on small screens
      const table = page.locator("table");
      await expect(table).toBeVisible();
      if (bp.name === "sm") {
        const overflow = await table.evaluate((el) => el.scrollWidth > el.clientWidth);
        expect(overflow).toBeTruthy();
      }

      // Lists readable
      await expect(page.getByRole("heading", { name: /Personal Info Audit/i })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Duplicates Across Bureaus/i })).toBeVisible();

      // Skip link functional on small screens
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: /skip to content/i });
      await expect(skip).toBeVisible();

      // Snapshot
      await expect(page).toHaveScreenshot(`audit-${bp.name}.png`, { fullPage: true });
    });
  }
});