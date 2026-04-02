// @ts-check
const { test, expect } = require("@playwright/test");
const { loginAsStaff, goToTab, logout } = require("./helpers");

test.describe("Profile Page", () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
    await goToTab(page, "profile");
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("profile page shows user info", async ({ page }) => {
    await expect(page.locator("#page_profile")).toBeVisible();
    const profileText = await page.locator("#page_profile").textContent();
    expect(profileText.length).toBeGreaterThan(0);
  });

  test("change PIN section exists", async ({ page }) => {
    // Look for any PIN-related text on the profile page
    const pageText = await page.locator("#page_profile").textContent();
    expect(pageText.toLowerCase()).toContain("pin");
  });

  test("theme selector exists on profile page", async ({ page }) => {
    const pageText = await page.locator("#page_profile").textContent();
    expect(pageText.toLowerCase()).toContain("theme");
  });
});
