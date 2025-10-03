import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

test("audit page a11y (skip if API not available)", async ({ page }) => {
  // Probe API for a report id
  let reportId: string | null = null;
  try {
    const res = await fetch(`${API}/reports`);
    if (res.ok) {
      const reports = (await res.json()) as any[];
      if (reports.length) reportId = reports[0].id;
    }
  } catch {
    test.skip(true, "API not reachable; skipping audit a11y test");
  }

  test.skip(!reportId, "No report id available; skipping audit a11y test");
  await page.goto(`http://localhost:3000/audit/${reportId}`);

  // Sanity check
  await expect(page.getByRole("heading", { name: "Simple Audit" })).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});