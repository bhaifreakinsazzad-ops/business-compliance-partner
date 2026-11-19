import { expect, test } from "@playwright/test";

test.describe("Paperwork Squad baseline smoke & responsiveness", () => {
  test("homepage renders Bengali-first shell with skip link and zero horizontal overflow", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('a[href="#main-content"]')).toBeAttached();

    const overflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });
    expect(overflow).toBe(false);
  });

  test("/api/health returns valid JSON health status", async ({ request }) => {
    const res = await request.get("/api/health");
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("database");
    expect(body).toHaveProperty("timestamp");
  });

  test("unauthenticated /admin redirects to /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unknown route renders helpful Bengali 404 page", async ({ page }) => {
    const response = await page.goto("/non-existent-phase1-check");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("খুঁজে পাওয়া যায়নি");
  });
});
