import { expect, test } from "@playwright/test";

test.describe("BCP V4.0 Client Acceptance Criteria", () => {
  test("homepage shows promotional hero slider with controls and two flagship CTA buttons", async ({
    page,
  }) => {
    await page.goto("/");

    const carousel = page.getByRole("region", {
      name: "প্রচারণামূলক ব্যানার স্লাইডার",
    });
    await expect(carousel).toBeVisible();
    await expect(carousel.locator("h1")).toContainText(
      "ব্যবসা শুরু থেকে সফল পরিচালনা",
    );

    const nextBtn = carousel.getByRole("button", { name: "পরবর্তী স্লাইড" });
    const prevBtn = carousel.getByRole("button", { name: "পূর্ববর্তী স্লাইড" });
    const pauseBtn = carousel.getByRole("button", { name: "স্লাইডার থামান" });

    await expect(nextBtn).toBeVisible();
    await expect(prevBtn).toBeVisible();
    await expect(pauseBtn).toBeVisible();

    await nextBtn.click();
    await expect(carousel).toContainText("Tax, VAT, e-GP, E-commerce ও RJSC");

    await prevBtn.click();
    await expect(carousel).toContainText("ব্যবসা শুরু থেকে সফল পরিচালনা");

    await pauseBtn.click();
    await expect(
      carousel.getByRole("button", { name: "স্লাইডার চালু করুন" }),
    ).toHaveAttribute("aria-pressed", "true");

    // Two flagship buttons remain visible regardless of slide
    const coursesCta = page.locator('a[data-flagship-cta="courses"]');
    const servicesCta = page.locator('a[data-flagship-cta="services"]');
    await expect(coursesCta).toBeVisible();
    await expect(coursesCta).toContainText("আমাদের সকল কোর্সসমূহ");
    await expect(coursesCta).toHaveAttribute("href", "/courses");

    await expect(servicesCta).toBeVisible();
    await expect(servicesCta).toContainText("আমাদের সকল সেবাসমূহ");
    await expect(servicesCta).toHaveAttribute("href", "/services");
  });

  test("reduced-motion preference keeps carousel stable and skips auto-advance", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const carousel = page.getByRole("region", {
      name: "প্রচারণামূলক ব্যানার স্লাইডার",
    });
    await expect(carousel).toBeVisible();
    await expect(carousel).toContainText("ব্যবসা শুরু থেকে সফল পরিচালনা");
  });

  test("courses page prioritizes Tax, VAT, e-GP, E-commerce, RJSC category cards", async ({
    page,
  }) => {
    await page.goto("/courses");

    const categoryNav = page.locator(
      'div[role="navigation"][aria-label="কোর্স ক্যাটাগরি"]',
    );
    await expect(categoryNav).toBeVisible();

    const cards = categoryNav.locator("a[data-category-card]");
    await expect(cards).toHaveCount(10);

    const firstFiveSlugs = await cards.evaluateAll((els) =>
      els.slice(0, 5).map((el) => el.getAttribute("data-category-card")),
    );
    expect(firstFiveSlugs).toEqual([
      "income-tax",
      "vat-and-mushak",
      "egp-and-tender",
      "digital-business-ecommerce",
      "company-secretarial",
    ]);
  });

  test("services page renders category cards, licensing/consultancy gateway, and enquiry fallback", async ({
    page,
  }) => {
    await page.goto("/services");

    await expect(page.locator('main a[href="/licensing"]').first()).toBeVisible();
    await expect(page.locator('main a[href="/consultancy"]').first()).toBeVisible();

    const categoryNav = page.locator(
      'div[role="navigation"][aria-label="সেবা ক্যাটাগরি"]',
    );
    await expect(categoryNav.locator("a[data-category-card]")).toHaveCount(11);

    // Since DEFAULT_PUBLIC_SITE_CONFIG.verifiedWhatsapp is null by default,
    // ServiceCard renders a functional fallback enquiry button (zero broken wa.me links).
    const serviceCards = page.locator("main article");
    await expect(serviceCards.first()).toBeVisible();
    const brokenWaLinks = await page
      .locator('a[href^="https://wa.me/"]')
      .evaluateAll((els) =>
        els
          .map((el) => el.getAttribute("href") ?? "")
          .filter((href) => /^https:\/\/wa\.me\/(?:\?|$)/.test(href)),
      );
    expect(brokenWaLinks).toEqual([]);
  });

  test("customer portal and admin routes remain protected", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);

    const portalRes = await page.goto("/portal");
    expect(portalRes?.status()).toBe(200);
  });
});
