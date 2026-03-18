import { type Page, type APIRequestContext, expect } from "@playwright/test";
import { TEST_CONFIG } from "../playwright.config";

/* ─── Auth helpers ─── */

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder(/email/i).fill(TEST_CONFIG.ADMIN_EMAIL);
  await page.getByPlaceholder(/password/i).fill(TEST_CONFIG.ADMIN_PASSWORD);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForURL("**/admin/dashboard", { timeout: TEST_CONFIG.TIMEOUTS.navigation });
}

export async function loginAsUser(page: Page, email?: string, password?: string) {
  await page.goto("/login");
  await page.getByPlaceholder(/email/i).fill(email || TEST_CONFIG.TEST_USER_EMAIL);
  await page.getByPlaceholder(/password/i).fill(password || TEST_CONFIG.TEST_USER_PASSWORD);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await page.waitForURL(/\/(dashboard|shop|$)/, { timeout: TEST_CONFIG.TIMEOUTS.navigation });
}

export async function registerUser(page: Page) {
  await page.goto("/register");
  await page.getByPlaceholder(/name/i).fill(TEST_CONFIG.TEST_USER_NAME);
  await page.getByPlaceholder(/email/i).fill(TEST_CONFIG.TEST_USER_EMAIL);
  await page.getByPlaceholder(/phone/i).fill(TEST_CONFIG.TEST_USER_PHONE);
  await page.getByPlaceholder(/password/i).first().fill(TEST_CONFIG.TEST_USER_PASSWORD);
  // Some forms have confirm password
  const confirmField = page.getByPlaceholder(/confirm/i);
  if (await confirmField.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmField.fill(TEST_CONFIG.TEST_USER_PASSWORD);
  }
  await page.getByRole("button", { name: /register|sign up|create/i }).click();
}

export async function getAdminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${TEST_CONFIG.API_URL}/auth/login`, {
    data: {
      email: TEST_CONFIG.ADMIN_EMAIL,
      password: TEST_CONFIG.ADMIN_PASSWORD,
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.token;
}

export async function getUserToken(request: APIRequestContext, email?: string, password?: string): Promise<string> {
  const res = await request.post(`${TEST_CONFIG.API_URL}/auth/login`, {
    data: {
      email: email || TEST_CONFIG.TEST_USER_EMAIL,
      password: password || TEST_CONFIG.TEST_USER_PASSWORD,
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.token;
}

/* ─── Navigation helpers ─── */

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: TEST_CONFIG.TIMEOUTS.navigation });
}

export async function navigateAndWait(page: Page, path: string) {
  await page.goto(path);
  await waitForPageLoad(page);
}

/* ─── Admin dashboard helpers ─── */

export async function goToAdminTab(page: Page, tabName: string) {
  // Click sidebar item
  await page.getByRole("button", { name: new RegExp(tabName, "i") }).click();
  await page.waitForTimeout(500);
}

/* ─── Assertion helpers ─── */

export async function expectVisible(page: Page, text: string) {
  await expect(page.getByText(text).first()).toBeVisible({ timeout: TEST_CONFIG.TIMEOUTS.action });
}

export async function expectUrl(page: Page, pattern: string | RegExp) {
  if (typeof pattern === "string") {
    await expect(page).toHaveURL(new RegExp(pattern), { timeout: TEST_CONFIG.TIMEOUTS.navigation });
  } else {
    await expect(page).toHaveURL(pattern, { timeout: TEST_CONFIG.TIMEOUTS.navigation });
  }
}

/* ─── API helpers ─── */

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function apiGet(request: APIRequestContext, path: string, token?: string) {
  return request.get(`${TEST_CONFIG.API_URL}${path}`, {
    headers: token ? authHeader(token) : {},
  });
}

export async function apiPost(request: APIRequestContext, path: string, data: any, token?: string) {
  return request.post(`${TEST_CONFIG.API_URL}${path}`, {
    data,
    headers: token ? authHeader(token) : {},
  });
}

export async function apiPut(request: APIRequestContext, path: string, data: any, token: string) {
  return request.put(`${TEST_CONFIG.API_URL}${path}`, {
    data,
    headers: authHeader(token),
  });
}

export async function apiDelete(request: APIRequestContext, path: string, token: string) {
  return request.delete(`${TEST_CONFIG.API_URL}${path}`, {
    headers: authHeader(token),
  });
}
