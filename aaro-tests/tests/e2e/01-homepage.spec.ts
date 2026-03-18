import { test, expect } from "@playwright/test";
import { navigateAndWait, expectVisible } from "../../utils/helpers";

test.describe("01 — Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await navigateAndWait(page, "/");
  });

  test("should load the homepage", async ({ page }) => {
    await expect(page).toHaveTitle(/aaro/i);
  });

  test("should display the navbar with logo", async ({ page }) => {
    const logo = page.locator("nav img[alt*='AARO'], nav img[alt*='aaro'], nav img[alt*='Logo']");
    await expect(logo.first()).toBeVisible();
  });

  test("should display navigation links", async ({ page }) => {
    // Desktop nav links (may be hidden on mobile)
    const navLinks = ["Home", "Phones", "Laptops"];
    for (const link of navLinks) {
      const el = page.getByRole("link", { name: new RegExp(link, "i") }).first();
      // On mobile these may be in a menu, so just check they exist in DOM
      await expect(el).toBeAttached();
    }
  });

  test("should display hero banner section", async ({ page }) => {
    // Banner or hero section should be present
    const banner = page.locator("[class*='banner'], [class*='hero'], [class*='swiper'], [class*='carousel']").first();
    await expect(banner).toBeVisible({ timeout: 10_000 });
  });

  test("should display featured products section", async ({ page }) => {
    // Look for product cards or featured section
    const productSection = page.locator("[class*='product'], [class*='featured']").first();
    await expect(productSection).toBeVisible({ timeout: 10_000 });
  });

  test("should display footer with contact info", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/aaro/i).first()).toBeVisible();
  });

  test("should navigate to shop page", async ({ page }) => {
    const shopLink = page.getByRole("link", { name: /shop|browse/i }).first();
    if (await shopLink.isVisible()) {
      await shopLink.click();
      await expect(page).toHaveURL(/\/shop/);
    }
  });

  test("should navigate to phones page", async ({ page }) => {
    const link = page.getByRole("link", { name: /phones/i }).first();
    if (await link.isVisible()) {
      await link.click();
      await expect(page).toHaveURL(/\/phones/);
    }
  });

  test("should navigate to laptops page", async ({ page }) => {
    const link = page.getByRole("link", { name: /laptops/i }).first();
    if (await link.isVisible()) {
      await link.click();
      await expect(page).toHaveURL(/\/laptops/);
    }
  });

  test("should have working cart icon/link", async ({ page }) => {
    const cartLink = page.locator("a[href*='cart'], button[aria-label*='cart' i]").first();
    await expect(cartLink).toBeAttached();
  });

  test("should display offers popup if active", async ({ page }) => {
    // Offer popup may or may not appear — just check it doesn't crash
    await page.waitForTimeout(2000);
    const popup = page.locator("[class*='popup'], [class*='offer'], [role='dialog']").first();
    // If visible, should have a close button
    if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
      const closeBtn = popup.locator("button").first();
      await expect(closeBtn).toBeVisible();
    }
  });
});
