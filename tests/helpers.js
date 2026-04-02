// Shared helpers for Playwright tests

const STAFF_EMAIL = "judbeasley@gmail.com";
const STAFF_PIN   = "1212";
const ADMIN_USER  = "admin";
const ADMIN_PIN   = "1212";

/**
 * Log in to the app and wait for the main UI to appear.
 */
async function login(page, email, pin) {
  await page.goto("/");
  // Wait for login card to be visible
  await page.locator("#loginCard").waitFor({ state: "visible", timeout: 15_000 });

  await page.fill("#loginEmail", email);
  await page.fill("#loginPin", pin);
  await page.click("#btnLogin");

  // Wait for app section to appear (login success)
  await page.locator("#app").waitFor({ state: "visible", timeout: 15_000 });
}

async function loginAsStaff(page) {
  await login(page, STAFF_EMAIL, STAFF_PIN);
}

async function loginAsAdmin(page) {
  await login(page, ADMIN_USER, ADMIN_PIN);
}

/**
 * Navigate to a tab. On desktop (>=600px) uses #deskNav links,
 * on mobile uses #tabBar buttons. Falls back to calling go() via JS.
 */
async function goToTab(page, tabName) {
  const capName = tabName.charAt(0).toUpperCase() + tabName.slice(1);

  // Try desktop nav first (visible at >=600px)
  const deskLink = page.locator(`#desk${capName}`);
  if (await deskLink.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await deskLink.click();
  } else {
    // Try mobile tab bar
    const tabBtn = page.locator(`#tab${capName}`);
    if (await tabBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await tabBtn.click();
    } else {
      // Fallback: call go() directly via JS
      await page.evaluate((name) => go(name), tabName);
    }
  }

  await page.locator(`#page_${tabName}`).waitFor({ state: "visible", timeout: 5_000 });
}

/**
 * Check if a tab is present (exists in DOM and not display:none on its element).
 * Works for both desktop nav and mobile tab bar.
 */
async function isTabVisible(page, tabName) {
  const capName = tabName.charAt(0).toUpperCase() + tabName.slice(1);
  // Check desktop nav link or mobile tab button
  const visible = await page.evaluate((cap) => {
    const desk = document.getElementById("desk" + cap);
    const tab  = document.getElementById("tab" + cap);
    // Element is "visible" if it exists and its computed display is not "none"
    function isVis(el) {
      if (!el) return false;
      return window.getComputedStyle(el).display !== "none";
    }
    return isVis(desk) || isVis(tab);
  }, capName);
  return visible;
}

/**
 * Clear session so the next test starts fresh.
 */
async function logout(page) {
  await page.evaluate(() => {
    sessionStorage.removeItem("app_session");
  });
}

module.exports = {
  STAFF_EMAIL,
  STAFF_PIN,
  ADMIN_USER,
  ADMIN_PIN,
  login,
  loginAsStaff,
  loginAsAdmin,
  goToTab,
  isTabVisible,
  logout,
};
