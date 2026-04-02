// @ts-check
const { test, expect } = require("@playwright/test");
const { STAFF_EMAIL, STAFF_PIN, ADMIN_USER, ADMIN_PIN } = require("./helpers");

const BASE = process.env.TEST_URL || "https://demo.kronara.app";

// Admin uses username "admin" to log in, but other API endpoints need
// the actual email address. We resolve it once at the start.
let adminEmail = null;

test.describe("API Endpoints", () => {

  test("GET /api/ping returns ok", async ({ request }) => {
    const res = await request.get(`${BASE}/api/ping`);
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("POST /api/login with valid staff credentials", async ({ request }) => {
    const res = await request.post(`${BASE}/api/login`, {
      data: { email: STAFF_EMAIL, pin: STAFF_PIN },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.user).toBeTruthy();
    expect(body.payPeriods).toBeTruthy();
    expect(body.entries).toBeTruthy();
    expect(body.locations).toBeTruthy();
  });

  test("POST /api/login with valid admin credentials", async ({ request }) => {
    const res = await request.post(`${BASE}/api/login`, {
      data: { email: ADMIN_USER, pin: ADMIN_PIN },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.isAdmin).toBe(true);
    // Save the resolved admin email for other tests
    adminEmail = body.user.email;
  });

  test("POST /api/login rejects bad PIN", async ({ request }) => {
    const res = await request.post(`${BASE}/api/login`, {
      data: { email: STAFF_EMAIL, pin: "0000" },
    });
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test("POST /api/refreshData returns entries", async ({ request }) => {
    const res = await request.post(`${BASE}/api/refreshData`, {
      data: { email: STAFF_EMAIL, pin: STAFF_PIN },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.entries).toBeTruthy();
  });

  test("POST /api/getLocations returns locations", async ({ request }) => {
    // Resolve admin email if not yet done
    if (!adminEmail) {
      const loginRes = await request.post(`${BASE}/api/login`, {
        data: { email: ADMIN_USER, pin: ADMIN_PIN },
      });
      adminEmail = (await loginRes.json()).user.email;
    }
    const res = await request.post(`${BASE}/api/getLocations`, {
      data: { email: adminEmail, pin: ADMIN_PIN },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("POST /api/getStaffList returns staff array", async ({ request }) => {
    if (!adminEmail) {
      const loginRes = await request.post(`${BASE}/api/login`, {
        data: { email: ADMIN_USER, pin: ADMIN_PIN },
      });
      adminEmail = (await loginRes.json()).user.email;
    }
    const res = await request.post(`${BASE}/api/getStaffList`, {
      data: { email: adminEmail, pin: ADMIN_PIN },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.staff)).toBe(true);
    expect(body.staff.length).toBeGreaterThan(0);
  });

  test("POST /api/getFlags returns flags data", async ({ request }) => {
    if (!adminEmail) {
      const loginRes = await request.post(`${BASE}/api/login`, {
        data: { email: ADMIN_USER, pin: ADMIN_PIN },
      });
      adminEmail = (await loginRes.json()).user.email;
    }
    const res = await request.post(`${BASE}/api/getFlags`, {
      data: { email: adminEmail, pin: ADMIN_PIN },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("POST /api/getSupportMessages returns messages", async ({ request }) => {
    if (!adminEmail) {
      const loginRes = await request.post(`${BASE}/api/login`, {
        data: { email: ADMIN_USER, pin: ADMIN_PIN },
      });
      adminEmail = (await loginRes.json()).user.email;
    }
    const res = await request.post(`${BASE}/api/getSupportMessages`, {
      data: { email: adminEmail, pin: ADMIN_PIN },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("staff cannot access admin endpoints", async ({ request }) => {
    const res = await request.post(`${BASE}/api/getStaffList`, {
      data: { email: STAFF_EMAIL, pin: STAFF_PIN },
    });
    const body = await res.json();
    // Staff should be denied
    expect(body.ok).toBe(false);
  });
});
