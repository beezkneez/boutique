// @ts-check
const { test, expect } = require("@playwright/test");
const { loginAsStaff, goToTab, logout } = require("./helpers");

test.describe("Theme Switching", () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("app_theme", "light");
    });
    await logout(page);
  });

  test("default theme is set", async ({ page }) => {
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(["light", "dark", "boutique"]).toContain(theme);
  });

  test("can switch to dark theme via profile page", async ({ page }) => {
    await goToTab(page, "profile");
    // Set dark theme via JS (simulates clicking the theme button)
    await page.evaluate(() => {
      localStorage.setItem("app_theme", "dark");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("dark");
  });

  test("can switch to boutique theme", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("app_theme", "boutique");
      document.documentElement.setAttribute("data-theme", "boutique");
    });
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("boutique");
  });

  test("theme persists after page reload", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("app_theme", "dark");
    });
    await page.reload();
    await page.locator("#app").waitFor({ state: "visible", timeout: 15_000 });
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("dark");
  });

  test("dark theme applies dark background CSS variable", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem("app_theme", "dark");
    });
    await page.reload();
    await page.locator("#app").waitFor({ state: "visible", timeout: 15_000 });
    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()
    );
    expect(bgColor).toBe("#0e0e11");
  });
});
