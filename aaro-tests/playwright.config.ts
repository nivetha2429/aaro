import { defineConfig, devices } from "@playwright/test";

export const TEST_CONFIG = {
  BASE_URL: process.env.TEST_URL || "http://localhost:8000",
  API_URL: process.env.API_URL || "http://localhost:5000/api",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@aaro.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin@1402",
  TEST_USER_EMAIL: `testuser_${Date.now()}@test.com`,
  TEST_USER_PASSWORD: "Test@12345",
  TEST_USER_NAME: "Test User",
  TEST_USER_PHONE: "9876543210",
  TIMEOUTS: {
    navigation: 30_000,
    action: 15_000,
    api: 10_000,
  },
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: TEST_CONFIG.BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    actionTimeout: TEST_CONFIG.TIMEOUTS.action,
    navigationTimeout: TEST_CONFIG.TIMEOUTS.navigation,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "iPad",
      use: { ...devices["iPad (gen 7)"] },
    },
    {
      name: "Pixel 5",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "iPhone 13",
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "Galaxy S21",
      use: {
        viewport: { width: 360, height: 800 },
        userAgent:
          "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
