import { test, expect } from "@playwright/test";
import { navigateAndWait } from "../../utils/helpers";

test.describe("02 — Shop & Category Pages", () => {
  test("should load the shop page with products", async ({ page }) => {
    await navigateAndWait(page, "/shop");
    // Should have at least one product card or "no products" message
    const products = page.locator("[class*='product'], [class*='card']");
    const noProducts = page.getByText(/no products/i);
    const hasProducts = await products.first().isVisible({ timeout: 10_000 }).catch(() => false);
    const hasEmpty = await noProducts.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasProducts || hasEmpty).toBeTruthy();
  });

  test("should load phones page", async ({ page }) => {
    await navigateAndWait(page, "/phones");
    await expect(page.getByText(/phones/i).first()).toBeVisible();
  });

  test("should load laptops page", async ({ page }) => {
    await navigateAndWait(page, "/laptops");
    await expect(page.getByText(/laptops/i).first()).toBeVisible();
  });

  test("should load accessories page", async ({ page }) => {
    await navigateAndWait(page, "/accessories");
    await expect(page.getByText(/accessor/i).first()).toBeVisible();
  });

  test("should load brands page", async ({ page }) => {
    await navigateAndWait(page, "/brands");
    await expect(page.getByText(/brand/i).first()).toBeVisible();
  });

  test("should navigate to product details on card click", async ({ page }) => {
    await navigateAndWait(page, "/shop");
    // Click first product link
    const productLink = page.locator("a[href*='/product/']").first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click();
      await expect(page).toHaveURL(/\/product\//);
    }
  });

  test("should display product details page correctly", async ({ page }) => {
    await navigateAndWait(page, "/shop");
    const productLink = page.locator("a[href*='/product/']").first();
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await productLink.getAttribute("href");
      await navigateAndWait(page, href!);

      // Should show product name, price, and action buttons
      const price = page.locator("text=/₹[\\d,]+/").first();
      await expect(price).toBeVisible({ timeout: 5000 });

      // Should have WhatsApp or Add to Cart button
      const actionBtn = page.locator("button, a").filter({ hasText: /whatsapp|cart|buy/i }).first();
      await expect(actionBtn).toBeVisible();
    }
  });

  test("should load contact page", async ({ page }) => {
    await navigateAndWait(page, "/contact");
    await expect(page.getByText(/contact/i).first()).toBeVisible();
  });

  test("should load community page", async ({ page }) => {
    await navigateAndWait(page, "/community");
    await expect(page).toHaveURL(/\/community/);
  });

  test("should redirect /elite to /community", async ({ page }) => {
    await page.goto("/elite");
    await expect(page).toHaveURL(/\/community/);
  });

  test("should show 404 for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    const notFound = page.getByText(/not found|404|doesn't exist/i).first();
    await expect(notFound).toBeVisible({ timeout: 5000 });
  });

  test("should display product images", async ({ page }) => {
    await navigateAndWait(page, "/shop");
    const images = page.locator("img[alt]").first();
    if (await images.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Image should have valid src
      const src = await images.getAttribute("src");
      expect(src).toBeTruthy();
    }
  });
});
