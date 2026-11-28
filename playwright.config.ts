import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const SYSTEM_CHROMIUM_SHELL =
  "/ms-playwright/chrome-headless-shell-linux64/chrome-headless-shell";
const resolvedExecutablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (fs.existsSync(SYSTEM_CHROMIUM_SHELL) ? SYSTEM_CHROMIUM_SHELL : undefined);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    ...(resolvedExecutablePath
      ? { launchOptions: { executablePath: resolvedExecutablePath } }
      : {}),
  },
  projects: [
    {
      name: "mobile-320",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 320, height: 640 },
      },
    },
    {
      name: "mobile-360",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 360, height: 800 },
      },
    },
    {
      name: "tablet-768",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: "npm run start -- -p 3000 -H 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
