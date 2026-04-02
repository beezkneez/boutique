// @ts-check
const { test, expect } = require("@playwright/test");
const { loginAsStaff, loginAsAdmin, isTabVisible, logout } = require("./helpers");

test.describe("Role-Based Visibility", () => {

  test("staff cannot see admin tab", async ({ page }) => {
    await loginAsStaff(page);
    const vis = await isTabVisible(page, "admin");
    expect(vis).toBe(false);
    await logout(page);
  });

  test("admin can see admin tab", async ({ page }) => {
    await loginAsAdmin(page);
    const vis = await isTabVisible(page, "admin");
    expect(vis).toBe(true);
    await logout(page);
  });

  test("staff sees home, reports, profile, support tabs", async ({ page }) => {
    await loginAsStaff(page);
    expect(await isTabVisible(page, "home")).toBe(true);
    expect(await isTabVisible(page, "reports")).toBe(true);
    expect(await isTabVisible(page, "profile")).toBe(true);
    expect(await isTabVisible(page, "support")).toBe(true);
    await logout(page);
  });

  test("admin sees home, profile, support, admin tabs", async ({ page }) => {
    await loginAsAdmin(page);
    expect(await isTabVisible(page, "home")).toBe(true);
    expect(await isTabVisible(page, "profile")).toBe(true);
    expect(await isTabVisible(page, "support")).toBe(true);
    expect(await isTabVisible(page, "admin")).toBe(true);
    await logout(page);
  });

  test("staff cannot navigate to admin page directly", async ({ page }) => {
    await loginAsStaff(page);
    const adminVisible = await page.evaluate(() => {
      const pg = document.getElementById("page_admin");
      return pg ? pg.style.display !== "none" : false;
    });
    expect(adminVisible).toBe(false);
    await logout(page);
  });
});
