// @ts-check
const { test, expect } = require("@playwright/test");
const { loginAsStaff, loginAsAdmin, goToTab, isTabVisible, logout } = require("./helpers");

test.describe("Tab Navigation — Staff", () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("home page is active by default after login", async ({ page }) => {
    await expect(page.locator("#page_home")).toBeVisible();
  });

  test("can navigate to Reports tab", async ({ page }) => {
    await goToTab(page, "reports");
    await expect(page.locator("#page_reports")).toBeVisible();
    await expect(page.locator("#page_home")).toBeHidden();
  });

  test("can navigate to Profile tab", async ({ page }) => {
    await goToTab(page, "profile");
    await expect(page.locator("#page_profile")).toBeVisible();
  });

  test("can navigate to Support tab", async ({ page }) => {
    await goToTab(page, "support");
    await expect(page.locator("#page_support")).toBeVisible();
  });

  test("admin tab is hidden for staff", async ({ page }) => {
    const adminVis = await isTabVisible(page, "admin");
    expect(adminVis).toBe(false);
  });
});

test.describe("Tab Navigation — Admin", () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("admin tab is visible for admin users", async ({ page }) => {
    const adminVis = await isTabVisible(page, "admin");
    expect(adminVis).toBe(true);
  });

  test("admin starts on admin page", async ({ page }) => {
    // Pure admin defaults to admin tab on login
    await expect(page.locator("#page_admin")).toBeVisible();
  });

  test("can navigate to Home tab", async ({ page }) => {
    await goToTab(page, "home");
    await expect(page.locator("#page_home")).toBeVisible();
  });
});
