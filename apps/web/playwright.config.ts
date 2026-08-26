import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "https://demo.force42.com";
const useLocalServer = !process.env.PLAYWRIGHT_BASE_URL && !process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: useLocalServer
    ? {
        command: "npm run start",
        url: "http://localhost:3002",
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});
