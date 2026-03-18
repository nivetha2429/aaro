import { test, expect } from "@playwright/test";
import { TEST_CONFIG } from "../../playwright.config";
import { navigateAndWait } from "../../utils/helpers";

const uniqueEmail = `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`;

test.describe("03 — Authentication", () => {
  test.describe("Login Page", () => {
    test("should display login form", async ({ page }) => {
      await navigateAndWait(page, "/login");
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();
      await expect(page.getByPlaceholder(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /login|sign in/i })).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await navigateAndWait(page, "/login");
      await page.getByPlaceholder(/email/i).fill("wrong@email.com");
      await page.getByPlaceholder(/password/i).fill("wrongpassword");
      await page.getByRole("button", { name: /login|sign in/i }).click();

      // Should show error toast or message
      const error = page.locator("[data-sonner-toast], [class*='toast'], [class*='error'], [role='alert']").first();
      await expect(error).toBeVisible({ timeout: 5000 });
    });

    test("should have link to register page", async ({ page }) => {
      await navigateAndWait(page, "/login");
      const registerLink = page.getByRole("link", { name: /register|sign up|create account/i }).first();
      await expect(registerLink).toBeVisible();
    });

    test("should have link to forgot password", async ({ page }) => {
      await navigateAndWait(page, "/login");
      const forgotLink = page.getByRole("link", { name: /forgot/i }).first();
      await expect(forgotLink).toBeVisible();
    });
  });

  test.describe("Registration", () => {
    test("should display registration form", async ({ page }) => {
      await navigateAndWait(page, "/register");
      await expect(page.getByPlaceholder(/name/i)).toBeVisible();
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();
      await expect(page.getByPlaceholder(/phone/i)).toBeVisible();
    });

    test("should register a new user", async ({ page }) => {
      await navigateAndWait(page, "/register");
      await page.getByPlaceholder(/name/i).fill("Playwright Test");
      await page.getByPlaceholder(/email/i).fill(uniqueEmail);
      await page.getByPlaceholder(/phone/i).fill("9999888877");

      // Fill password fields
      const passwordFields = page.locator("input[type='password']");
      const count = await passwordFields.count();
      if (count >= 1) await passwordFields.nth(0).fill(TEST_CONFIG.TEST_USER_PASSWORD);
      if (count >= 2) await passwordFields.nth(1).fill(TEST_CONFIG.TEST_USER_PASSWORD);

      await page.getByRole("button", { name: /register|sign up|create/i }).click();

      // Should redirect to dashboard or login after registration
      await page.waitForURL(/\/(dashboard|login|shop|$)/, { timeout: 15_000 });
    });
  });

  test.describe("Admin Login", () => {
    test("should login as admin and redirect to dashboard", async ({ page }) => {
      await navigateAndWait(page, "/login");
      await page.getByPlaceholder(/email/i).fill(TEST_CONFIG.ADMIN_EMAIL);
      await page.getByPlaceholder(/password/i).fill(TEST_CONFIG.ADMIN_PASSWORD);
      await page.getByRole("button", { name: /login|sign in/i }).click();

      await page.waitForURL("**/admin/dashboard", { timeout: 15_000 });
      await expect(page).toHaveURL(/admin\/dashboard/);
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect unauthenticated user from /my-orders", async ({ page }) => {
      await page.goto("/my-orders");
      // Should redirect to login
      await expect(page).toHaveURL(/\/(login|$)/, { timeout: 10_000 });
    });

    test("should redirect unauthenticated user from /profile", async ({ page }) => {
      await page.goto("/profile");
      await expect(page).toHaveURL(/\/(login|$)/, { timeout: 10_000 });
    });

    test("should redirect non-admin from /admin/dashboard", async ({ page }) => {
      await page.goto("/admin/dashboard");
      await expect(page).toHaveURL(/\/(login|$)/, { timeout: 10_000 });
    });
  });

  test.describe("Forgot Password Page", () => {
    test("should display forgot password form", async ({ page }) => {
      await navigateAndWait(page, "/forgot-password");
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    });
  });
});
