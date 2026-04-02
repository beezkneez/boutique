// @ts-check
const { test, expect } = require("@playwright/test");
const { STAFF_EMAIL, STAFF_PIN, ADMIN_USER, ADMIN_PIN, loginAsStaff, loginAsAdmin, isTabVisible, logout } = require("./helpers");

test.describe("Authentication", () => {

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("shows login card on initial load", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#loginCard")).toBeVisible();
    await expect(page.locator("#app")).toBeHidden();
  });

  test("rejects empty email", async ({ page }) => {
    await page.goto("/");
    await page.fill("#loginPin", "1234");
    await page.click("#btnLogin");
    await expect(page.locator("#loginMsg")).toContainText("Email or username is required");
  });

  test("rejects empty PIN", async ({ page }) => {
    await page.goto("/");
    await page.fill("#loginEmail", "test@test.com");
    await page.click("#btnLogin");
    await expect(page.locator("#loginMsg")).toContainText("PIN is required");
  });

  test("rejects wrong credentials", async ({ page }) => {
    await page.goto("/");
    await page.fill("#loginEmail", "fake@notreal.com");
    await page.fill("#loginPin", "9999");
    await page.click("#btnLogin");
    await expect(page.locator("#loginMsg")).toContainText(/Invalid|failed/i, { timeout: 10_000 });
  });

  test("staff login with email succeeds", async ({ page }) => {
    await loginAsStaff(page);
    await expect(page.locator("#app")).toBeVisible();
    await expect(page.locator("#loginCard")).toBeHidden();
    // Pay period selector should be populated
    await expect(page.locator("#payPeriodSelect option")).not.toHaveCount(0);
  });

  test("admin login with username succeeds", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator("#app")).toBeVisible();
    // Admin tab should be visible (check via JS since bottom tab bar hidden on desktop)
    const adminVis = await isTabVisible(page, "admin");
    expect(adminVis).toBe(true);
  });

  test("session persists on page refresh", async ({ page }) => {
    await loginAsStaff(page);
    await expect(page.locator("#app")).toBeVisible();
    await page.reload();
    await page.locator("#app").waitFor({ state: "visible", timeout: 15_000 });
    await expect(page.locator("#app")).toBeVisible();
  });

  test("logout returns to login screen", async ({ page }) => {
    await loginAsStaff(page);
    await expect(page.locator("#app")).toBeVisible();
    await page.evaluate(() => {
      sessionStorage.removeItem("app_session");
    });
    await page.reload();
    await page.locator("#loginCard").waitFor({ state: "visible", timeout: 15_000 });
    await expect(page.locator("#loginCard")).toBeVisible();
  });
});
