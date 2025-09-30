import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "@axe-core/playwright";

test("login page has no critical a11y violations", async ({ page }) => {
  await page.goto("/login");
  await injectAxe(page);
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
    axeOptions: {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"]
      }
    },
    includedImpacts: ["critical", "serious"]
  });
  // Basic expectations
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});