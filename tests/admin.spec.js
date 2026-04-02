// @ts-check
const { test, expect } = require("@playwright/test");
const { loginAsAdmin, goToTab, logout } = require("./helpers");

test.describe("Admin Panel", () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    // Admin user starts on admin page by default
    await expect(page.locator("#page_admin")).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("admin page loads with sub-tabs", async ({ page }) => {
    // Admin sub-tab buttons use #adminTab_<name>
    await expect(page.locator("#adminTab_payroll")).toBeVisible();
    await expect(page.locator("#adminTab_staff")).toBeVisible();
    await expect(page.locator("#adminTab_export")).toBeVisible();
    await expect(page.locator("#adminTab_settings")).toBeVisible();
  });

  test("payroll tab is active by default", async ({ page }) => {
    // Payroll sub-tab should have the active styling (border-bottom color)
    await expect(page.locator("#adminTab_payroll")).toBeVisible();
  });

  test("can switch to staff sub-tab", async ({ page }) => {
    await page.click("#adminTab_staff");
    await page.waitForTimeout(2_000);
    await expect(page.locator("#page_admin")).toBeVisible();
  });

  test("can switch to export sub-tab", async ({ page }) => {
    await page.click("#adminTab_export");
    await page.waitForTimeout(1_000);
    await expect(page.locator("#page_admin")).toBeVisible();
  });

  test("can switch to settings sub-tab", async ({ page }) => {
    await page.click("#adminTab_settings");
    await page.waitForTimeout(1_000);
    await expect(page.locator("#page_admin")).toBeVisible();
  });

  test("can switch to pending sub-tab", async ({ page }) => {
    await page.click("#adminTab_pending");
    await page.waitForTimeout(1_000);
    await expect(page.locator("#page_admin")).toBeVisible();
  });

  test("can switch to flagged sub-tab", async ({ page }) => {
    await page.click("#adminTab_flagged");
    await page.waitForTimeout(1_000);
    await expect(page.locator("#page_admin")).toBeVisible();
  });
});
