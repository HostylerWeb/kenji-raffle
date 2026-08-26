import { test, expect, type Page } from "@playwright/test";

async function fillCheckoutBilling(page: Page) {
  const billing = page.locator(".site-checkout-billing");
  await expect(billing).toBeVisible({ timeout: 20_000 });
  await billing.getByLabel(/^first name$/i).fill("Test");
  await billing.getByLabel(/^last name$/i).fill("Buyer");
  await billing.getByLabel(/phone number/i).fill("+254712345678");
  await billing.getByLabel(/street address/i).fill("123 Kenyatta Avenue");
  await billing.getByLabel(/town \/ city/i).fill("Nairobi");
  await billing.locator("select").selectOption({ index: 1 });
  await expect(page.getByRole("button", { name: /continue to payment/i })).toBeEnabled({
    timeout: 10_000,
  });
}

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
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("mobile nav links present at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    const drawer = page.locator(".site-drawer");
    await expect(drawer.getByRole("link", { name: "Raffles" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Winners" })).toBeVisible();
  });

  test("cart badge visible after add-to-cart", async ({ page }) => {
    await page.goto("/raffles");
    const firstRaffle = page.locator(".site-raffle-card").first();
    await expect(firstRaffle).toBeVisible({ timeout: 15_000 });
    await firstRaffle.click();
    await page.getByRole("button", { name: /add.*ticket.*cart/i }).click();
    const cartBadge = page.locator(".site-header__cart-desktop .site-cart-btn__badge");
    await expect(cartBadge).toBeVisible({ timeout: 10_000 });
    await expect(cartBadge).toHaveText("1");
  });

  test("guest checkout gate shows login tabs", async ({ page }) => {
    await page.goto("/raffles");
    const firstRaffle = page.locator(".site-raffle-card").first();
    await expect(firstRaffle).toBeVisible({ timeout: 15_000 });
    await firstRaffle.click();
    await page.getByRole("button", { name: /add.*ticket.*cart/i }).click();
    await page.waitForURL(/\/cart/, { timeout: 15_000 });

    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout", exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("tab", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Register" })).toBeVisible();
    await expect(page.getByText(/complete your purchase/i)).toBeVisible();
  });

  test("guest checkout login inline then payment form", async ({ page }) => {
    const unique = `inline-${Date.now()}@demo.local`;
    await page.goto("/raffles");
    const firstRaffle = page.locator(".site-raffle-card").first();
    await expect(firstRaffle).toBeVisible({ timeout: 15_000 });
    await firstRaffle.click();
    await page.getByRole("button", { name: /add.*ticket.*cart/i }).click();
    await page.waitForURL(/\/cart/, { timeout: 15_000 });

    await page.goto("/checkout");
    await page.getByRole("tab", { name: "Register" }).click();
    await page.getByLabel(/email/i).first().fill(unique);
    await page.getByLabel(/^password$/i).first().fill("ChangeMe123!");
    await page.getByLabel(/full name/i).fill("Inline Test");
    await page.getByLabel(/county/i).selectOption({ index: 1 });
    await page.getByLabel(/date of birth/i).fill("1990-06-15");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /register & continue/i }).click();
    await fillCheckoutBilling(page);
    await expect(page.getByRole("button", { name: /continue to payment/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test("checkout form visible when logged in", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("player@demo.local");
    await page.getByLabel(/^password$/i).fill("ChangeMe123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/(account|raffles|$)/, { timeout: 15_000 });
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout", exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("mock purchase shows tickets in account", async ({ page }) => {
    const unique = `buyer-${Date.now()}@demo.local`;
    await page.goto("/raffles");
    const firstRaffle = page.locator(".site-raffle-card").first();
    await expect(firstRaffle).toBeVisible({ timeout: 15_000 });
    await firstRaffle.click();
    await page.getByRole("button", { name: /add.*ticket.*cart/i }).click();
    await page.waitForURL(/\/cart/, { timeout: 15_000 });

    await page.goto("/checkout");
    await page.getByRole("tab", { name: "Register" }).click();
    await page.getByLabel(/email/i).first().fill(unique);
    await page.getByLabel(/^password$/i).first().fill("ChangeMe123!");
    await page.getByLabel(/full name/i).fill("Buyer Test");
    await page.getByLabel(/county/i).selectOption({ index: 1 });
    await page.getByLabel(/date of birth/i).fill("1990-06-15");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /register & continue/i }).click();
    await expect(page.getByRole("button", { name: /continue to payment/i })).toBeVisible({
      timeout: 20_000,
    });
    await fillCheckoutBilling(page);

    await page.getByRole("button", { name: /continue to payment/i }).click();
    const payBtn = page.getByRole("button", { name: /pay successfully/i });
    const successHeading = page.getByRole("heading", { name: /you're in/i });
    await expect(payBtn.or(successHeading)).toBeVisible({ timeout: 30_000 });
    if (await payBtn.isVisible()) {
      await payBtn.click();
    }
    await expect(successHeading).toBeVisible({ timeout: 20_000 });

    await page.goto("/account/tickets");
    await expect(page.locator(".site-ticket-pill").first()).toBeVisible({ timeout: 15_000 });
  });

  test("cart badge clears after successful purchase", async ({ page }) => {
    const unique = `cartclear-${Date.now()}@demo.local`;
    const cartBadge = page.locator(".site-header__cart-desktop .site-cart-btn__badge");
    await page.goto("/raffles");
    const firstRaffle = page.locator(".site-raffle-card").first();
    await expect(firstRaffle).toBeVisible({ timeout: 15_000 });
    await firstRaffle.click();
    await page.getByRole("button", { name: /add.*ticket.*cart/i }).click();
    await expect(cartBadge).toBeVisible({ timeout: 10_000 });

    await page.goto("/checkout");
    await page.getByRole("tab", { name: "Register" }).click();
    await page.getByLabel(/email/i).first().fill(unique);
    await page.getByLabel(/^password$/i).first().fill("ChangeMe123!");
    await page.getByLabel(/full name/i).fill("Cart Clear Test");
    await page.getByLabel(/county/i).selectOption({ index: 1 });
    await page.getByLabel(/date of birth/i).fill("1990-06-15");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /register & continue/i }).click();
    await fillCheckoutBilling(page);
    await page.getByRole("button", { name: /continue to payment/i }).click();
    await page.getByRole("button", { name: /pay successfully/i }).click();
    await expect(page.getByRole("heading", { name: /you're in/i })).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/raffles");
    await expect(cartBadge).toHaveCount(0, { timeout: 10_000 });
  });

  test("guest register on checkout tab completes flow", async ({ page }) => {
    const unique = `guest-${Date.now()}@demo.local`;
    await page.goto("/raffles");
    const firstRaffle = page.locator(".site-raffle-card").first();
    await expect(firstRaffle).toBeVisible({ timeout: 15_000 });
    await firstRaffle.click();
    await page.getByRole("button", { name: /add.*ticket.*cart/i }).click();
    await page.waitForURL(/\/cart/, { timeout: 15_000 });

    await page.goto("/checkout");
    await page.getByRole("tab", { name: "Register" }).click();
    await page.getByLabel(/email/i).first().fill(unique);
    await page.getByLabel(/^password$/i).first().fill("ChangeMe123!");
    await page.getByLabel(/full name/i).fill("Guest Test");
    await page.getByLabel(/county/i).selectOption({ index: 1 });
    await page.getByLabel(/date of birth/i).fill("1990-01-15");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /register & continue/i }).click();
    await expect(page.getByRole("button", { name: /continue to payment/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("operator admin", () => {
  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });
});
