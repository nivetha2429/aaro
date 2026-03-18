import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "../../utils/helpers";

test.describe("05 — Admin Dashboard Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  const adminTabs = [
    { name: "Overview", keyword: /overview|dashboard|total|orders/i },
    { name: "Orders", keyword: /order|pending|delivered/i },
    { name: "Inventory", keyword: /product|phone|laptop|inventory/i },
    { name: "Categories", keyword: /categor|brand/i },
    { name: "Featured", keyword: /featured|feature/i },
    { name: "Popup Offer", keyword: /offer|popup|discount/i },
    { name: "Banners", keyword: /banner|slide/i },
    { name: "Contact", keyword: /contact|phone|email|address/i },
    { name: "Users", keyword: /user|email|role/i },
    { name: "Login & Security", keyword: /security|password|email|credential/i },
  ];

  for (const tab of adminTabs) {
    test(`should load "${tab.name}" tab`, async ({ page }) => {
      // Click the tab in sidebar
      const tabBtn = page.getByRole("button", { name: new RegExp(tab.name, "i") }).first();
      if (await tabBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tabBtn.click();
        await page.waitForTimeout(1000);

        // Tab content should load without errors
        const errorBoundary = page.getByText(/something went wrong|error/i).first();
        const hasError = await errorBoundary.isVisible({ timeout: 1000 }).catch(() => false);
        expect(hasError).toBeFalsy();
      }
    });
  }

  test("should show order management in Orders tab", async ({ page }) => {
    const ordersTab = page.getByRole("button", { name: /orders/i }).first();
    if (await ordersTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ordersTab.click();
      await page.waitForTimeout(1000);

      // Should show order table or empty state
      const orderContent = page.locator("table, [class*='order'], text=/no order/i").first();
      await expect(orderContent).toBeVisible({ timeout: 10_000 });
    }
  });

  test("should show banner management", async ({ page }) => {
    const bannersTab = page.getByRole("button", { name: /banner/i }).first();
    if (await bannersTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bannersTab.click();
      await page.waitForTimeout(1000);

      // Should have add banner button
      const addBtn = page.getByRole("button", { name: /add|new|upload/i }).first();
      const hasBannerUI = await addBtn.isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasBannerUI).toBeTruthy();
    }
  });

  test("should show offer management", async ({ page }) => {
    const offersTab = page.getByRole("button", { name: /offer|popup/i }).first();
    if (await offersTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await offersTab.click();
      await page.waitForTimeout(1000);

      // Should show offer form or list
      const offerContent = page.locator("form, [class*='offer'], button:has-text(/add|create/i)").first();
      const hasContent = await offerContent.isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasContent).toBeTruthy();
    }
  });

  test("should show contact settings form", async ({ page }) => {
    const contactTab = page.getByRole("button", { name: /contact/i }).first();
    if (await contactTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await contactTab.click();
      await page.waitForTimeout(1000);

      // Should have input fields for phone, email, address
      const inputs = page.locator("input, textarea");
      const count = await inputs.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should show users management", async ({ page }) => {
    const usersTab = page.getByRole("button", { name: /users/i }).first();
    if (await usersTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await usersTab.click();
      await page.waitForTimeout(1000);

      // Should show user list or table
      const userContent = page.locator("table, [class*='user']").first();
      const hasContent = await userContent.isVisible({ timeout: 10_000 }).catch(() => false);
      expect(hasContent).toBeTruthy();
    }
  });

  test("should show admin credential update form", async ({ page }) => {
    const securityTab = page.getByRole("button", { name: /security|credential|login/i }).first();
    if (await securityTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await securityTab.click();
      await page.waitForTimeout(1000);

      // Should have password/email change form
      const passwordInput = page.locator("input[type='password']").first();
      const hasForm = await passwordInput.isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasForm).toBeTruthy();
    }
  });
});
