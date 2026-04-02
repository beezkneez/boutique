// @ts-check
const { test, expect } = require("@playwright/test");
const { loginAsStaff, goToTab, logout } = require("./helpers");

test.describe("Entry Management", () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStaff(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("home page shows Log a Class card", async ({ page }) => {
    await expect(page.locator("#logClassCard")).toBeVisible();
    await expect(page.locator("#date")).toBeVisible();
    await expect(page.locator("#location")).toBeVisible();
  });

  test("pay period selector has options", async ({ page }) => {
    const options = page.locator("#payPeriodSelect option");
    await expect(options).not.toHaveCount(0);
  });

  test("pay period summary shows stats", async ({ page }) => {
    await expect(page.locator("#ppSummary")).toBeVisible({ timeout: 5_000 });
    await expect(page.locator("#sumLines")).toBeVisible();
    await expect(page.locator("#sumHours")).toBeVisible();
    await expect(page.locator("#sumTotal")).toBeVisible();
  });

  test("add shift button creates a shift row", async ({ page }) => {
    // There should already be one shift line from bootstrapApp -> addLine()
    // Click "Add another shift" to add a second one
    const addBtn = page.locator("button", { hasText: "Add shift" }).first();
    await addBtn.click();
    await page.waitForTimeout(500);
    // Count lines in #lines div — should have at least 2 now
    const lines = await page.locator("#lines > *").count();
    expect(lines).toBeGreaterThanOrEqual(2);
  });

  test("submit button is present", async ({ page }) => {
    await expect(page.locator("#btnSubmit")).toBeVisible();
    await expect(page.locator("#btnSubmit")).toContainText("Submit");
  });

  test("switching pay periods updates entries", async ({ page }) => {
    const select = page.locator("#payPeriodSelect");
    const options = await select.locator("option").all();
    if (options.length < 2) {
      test.skip();
      return;
    }
    const secondVal = await options[1].getAttribute("value");
    await select.selectOption(secondVal);
    await page.waitForTimeout(2_000);
    await expect(page.locator("#ppSummary")).toBeVisible();
  });

  test("view toggle switches between card and table", async ({ page }) => {
    const cardBtn  = page.locator("#btnViewCard");
    const tableBtn = page.locator("#btnViewTable");

    await expect(cardBtn).toBeVisible();
    await expect(tableBtn).toBeVisible();

    await tableBtn.click();
    await page.waitForTimeout(500);
    await cardBtn.click();
    await page.waitForTimeout(500);
  });

  test("reports tab shows entry data", async ({ page }) => {
    await goToTab(page, "reports");
    await expect(page.locator("#page_reports")).toBeVisible();
  });
});
