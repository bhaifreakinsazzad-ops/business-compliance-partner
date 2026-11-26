import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const VIEWPORTS = [320, 360, 390, 430, 768, 1024, 1440, 1920] as const;
const WCAG_22_AA_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
] as const;

test.describe("V7.3 Client Revision 01 — Courses -> Services -> Books", () => {
  test("desktop nav, flagship cards, homepage sections, and footer preserve exact Courses -> Services -> Books order and lavender parity", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // 1. Desktop nav pillar order & exact English + Bengali labels
    const navPillars = page.locator("header nav a[data-nav-pillar]");
    await expect(navPillars).toHaveCount(3);
    const navIds = await navPillars.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-nav-pillar")),
    );
    expect(navIds).toEqual(["courses", "services", "books"]);

    await expect(navPillars.nth(0)).toContainText("Courses");
    await expect(navPillars.nth(1)).toContainText("Services");
    await expect(navPillars.nth(2)).toContainText("Books");

    // 2. Flagship CTA cards exact order & identical #DDD6EB Muted Lavender background
    const flagshipCards = page.locator("a[data-flagship-cta]");
    await expect(flagshipCards).toHaveCount(3);
    const flagshipOrder = await flagshipCards.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-flagship-cta")),
    );
    expect(flagshipOrder).toEqual(["courses", "services", "books"]);

    await expect(flagshipCards.nth(0)).toContainText("Courses");
    await expect(flagshipCards.nth(0)).toContainText("আমাদের সকল কোর্সসমূহ");
    await expect(flagshipCards.nth(1)).toContainText("Services");
    await expect(flagshipCards.nth(1)).toContainText("আমাদের সকল সেবাসমূহ");
    await expect(flagshipCards.nth(2)).toContainText("Books");
    await expect(flagshipCards.nth(2)).toContainText("আমাদের সকল বইসমূহ");

    const cardColors = await flagshipCards.evaluateAll((els) =>
      els.map((el) => window.getComputedStyle(el).backgroundColor),
    );
    expect(cardColors).toEqual([
      "rgb(221, 214, 235)",
      "rgb(221, 214, 235)",
      "rgb(221, 214, 235)",
    ]);

    // 3. Homepage primary pillar sections sequence
    const homeSections = page.locator("section[data-home-pillar]");
    await expect(homeSections).toHaveCount(3);
    const sectionOrder = await homeSections.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-home-pillar")),
    );
    expect(sectionOrder).toEqual(["courses", "services", "books"]);

    // 4. Footer commercial pillar order
    const footerPillars = page.locator("footer a[data-footer-pillar]");
    await expect(footerPillars).toHaveCount(3);
    const footerOrder = await footerPillars.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-footer-pillar")),
    );
    expect(footerOrder).toEqual(["courses", "services", "books"]);
  });

  test("mobile drawer leads strictly with 1. Courses, 2. Services, 3. Books", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "মেনু খুলুন" }).click();
    const drawer = page.locator("#ps-mobile-nav-dialog");
    await expect(drawer).toBeVisible();

    const mobilePillars = drawer.locator("a[data-mobile-pillar]");
    await expect(mobilePillars).toHaveCount(3);
    const mobileOrder = await mobilePillars.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-mobile-pillar")),
    );
    expect(mobileOrder).toEqual(["courses", "services", "books"]);

    await expect(mobilePillars.nth(0)).toContainText("Courses");
    await expect(mobilePillars.nth(1)).toContainText("Services");
    await expect(mobilePillars.nth(2)).toContainText("Books");
  });

  test("unified search filters cleanly across All | Courses | Services | Books", async ({
    page,
  }) => {
    await page.goto("/");

    const searchSection = page.locator("#unified-search");
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/catalogue/search") &&
        res.url().includes("q=VAT") &&
        res.status() === 200,
    );

    await searchSection.getByRole("button", { name: "VAT", exact: true }).click();
    await responsePromise;

    await expect(
      searchSection.locator('[data-search-group="courses"]'),
    ).toBeVisible();
    await expect(
      searchSection.locator('[data-search-group="services"]'),
    ).toBeVisible();
    await expect(
      searchSection.locator('[data-search-group="books"]'),
    ).toBeVisible();

    // Filter to Books only
    await searchSection.locator('button[data-search-filter="books"]').click();
    await expect(
      searchSection.locator('[data-search-group="books"]'),
    ).toBeVisible();
    await expect(
      searchSection.locator('[data-search-group="courses"]'),
    ).toHaveCount(0);
    await expect(
      searchSection.locator('[data-search-group="services"]'),
    ).toHaveCount(0);

    // Filter back to All
    await searchSection.locator('button[data-search-filter="all"]').click();
    await expect(
      searchSection.locator('[data-search-group="courses"]'),
    ).toBeVisible();
  });

  test("cross-division journeys connect Course -> Services & Books and Service -> Courses & Books", async ({
    page,
  }) => {
    await page.goto("/courses/complete-income-tax-course-bangladesh");
    await expect(
      page.locator('main a[href^="/services/"]').first(),
    ).toBeVisible();
    await expect(page.locator('main a[href^="/books/"]').first()).toBeVisible();

    await page.goto("/services/etin-individual-corporate-tax-return");
    await expect(
      page.locator('main a[href^="/courses/"]').first(),
    ).toBeVisible();
    await expect(page.locator('main a[href^="/books/"]').first()).toBeVisible();
  });

  for (const width of VIEWPORTS) {
    test(`zero horizontal overflow across homepage at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    });
  }

  for (const route of ["/", "/courses", "/services", "/books"] as const) {
    test(`zero critical or serious WCAG 2.2 AA violations on ${route}`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator("h1").first()).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags([...WCAG_22_AA_TAGS])
        .analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(blocking).toEqual([]);
    });
  }
});
