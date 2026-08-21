import { test, expect } from "@playwright/test";

test.describe("public tenant site", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toContainText(/raffle|win/i);
  });

  test("raffles listing loads", async ({ page }) => {
    await page.goto("/raffles");
    await expect(page.locator("h1")).toContainText(/raffle/i);
  });

  test("player login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText(/log in/i);
  });
});

test.describe("operator admin", () => {
  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("h1")).toContainText(/operator admin/i);
  });
});
