// @ts-check
const { test, expect } = require("@playwright/test");
const { loginAsStaff, goToTab, logout } = require("./helpers");

test.describe("Support Page", () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
    await goToTab(page, "support");
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("support page loads", async ({ page }) => {
    await expect(page.locator("#page_support")).toBeVisible();
  });

  test("support page has content", async ({ page }) => {
    const pageText = await page.locator("#page_support").textContent();
    expect(pageText.length).toBeGreaterThan(0);
  });
});
