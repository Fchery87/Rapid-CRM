import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "@axe-core/playwright";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

test.describe("Audit page a11y extended", () => {
  test("axe, keyboard focus, table semantics, contrast", async ({ page }) => {
    // Discover a report id via API
    const res = await page.request.get(`${API}/reports`);
    if (!res.ok()) test.skip(true, "API not reachable; skipping audit a11y extended");
    const reports = await res.json();
    if (!Array.isArray(reports) || !reports.length) test.skip(true, "No reports available; skipping audit a11y extended");
    const reportId = reports[0].id as string;

    await page.goto(`/audit/${reportId}`);

    // Axe — ensure no critical/serious a11y violations (includes color-contrast rule)
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] }
      },
      includedImpacts: ["critical", "serious"]
    });

    // Keyboard navigation — first tab should reveal the skip link with visible focus
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeVisible();
    const outline = await skip.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");

    // Table semantics — negative items table has headers and caption
    const table = page.locator("table", { has: page.getByRole("columnheader", { name: "Account" }) });
    await expect(table).toBeVisible();
    const headers = table.locator("thead th[scope='col']");
    await expect(headers).toHaveCountGreaterThan(0 as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const caption = table.locator("caption");
    await expect(caption).toHaveText(/negative items/i);
  });
});