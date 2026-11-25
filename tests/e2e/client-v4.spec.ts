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
    const pauseBtn = carousel.getByRole("button", {
      name: "স্লাইডার অটোপ্লে থামান",
    });

    await expect(nextBtn).toBeVisible();
    await expect(prevBtn).toBeVisible();
    await expect(pauseBtn).toBeVisible();

    await nextBtn.click();
    await expect(carousel).toContainText("Tax, VAT, e-GP, E-commerce ও RJSC");

    await prevBtn.click();
    await expect(carousel).toContainText("ব্যবসা শুরু থেকে সফল পরিচালনা");

    await pauseBtn.click();
    await expect(pauseBtn).toHaveAttribute("aria-pressed", "true");

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

  test("services page renders category cards, licensing/consultancy gateway, and resolves legacy slugs", async ({
    page,
  }) => {
    await page.goto("/services?category=business-formation-and-rjsc");

    await expect(page.locator('main a[href="/licensing"]').first()).toBeVisible();
    await expect(page.locator('main a[href="/consultancy"]').first()).toBeVisible();

    const categoryNav = page.locator(
      'div[role="navigation"][aria-label="সেবা ক্যাটাগরি"]',
    );
    await expect(categoryNav.locator("a[data-category-card]")).toHaveCount(11);

    // Legacy slug from BusinessSolutionFinder must resolve to real published services
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

  test("quick-search dialog opens from header, searches catalogue, and closes on Escape", async ({
    page,
  }) => {
    await page.goto("/courses");

    const trigger = page
      .locator("button[data-quick-search-trigger]:visible")
      .first();
    await trigger.click();

    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();

    const searchResPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/catalogue/search") &&
        res.url().includes("q=VAT") &&
        res.status() === 200,
    );
    await dialog.getByRole("button", { name: "VAT", exact: true }).click();
    await searchResPromise;
    await expect(dialog).toContainText("ভ্যাট");

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("course detail SyllabusExplorer toggles modules and service detail DocumentReadinessWidget updates progress", async ({
    page,
  }) => {
    await page.goto("/courses/complete-income-tax-course-bangladesh");
    const toggleAllBtn = page.getByRole("button", {
      name: /সব মডিউল খুলুন|সব সংকুচিত করুন/,
    });
    await expect(toggleAllBtn).toBeVisible();
    await toggleAllBtn.click();

    await page.goto("/services/etin-individual-corporate-tax-return");
    const firstCheckbox = page
      .locator('main input[type="checkbox"]')
      .first();
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.check();
    await expect(page.locator("main")).toContainText("প্রস্তুতি: 1 /");
  });

  test("FAQ page filters interactively by pillar", async ({ page }) => {
    await page.goto("/faq");
    const coursesTab = page.getByRole("tab", { name: "কোর্স" });
    await expect(coursesTab).toBeVisible();
    await coursesTab.click();
    await expect(coursesTab).toHaveAttribute("aria-selected", "true");
  });

  test("customer portal and admin routes remain protected", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);

    const portalRes = await page.goto("/portal");
    expect(portalRes?.status()).toBe(200);
  });
});
