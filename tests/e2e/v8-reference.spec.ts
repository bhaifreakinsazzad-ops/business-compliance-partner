import { expect, test } from "@playwright/test";

test.describe("V8.0 Reference-Faithful AKIJ Periwinkle Transformation", () => {
  test("renders Bunyanum Marsus homepage section sequence with AKIJ Periwinkle colors", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // 1. Segmented hero slider indicator (01 — 04) + tagline divider
    const hero = page.getByRole("region", {
      name: "প্রচারণামূলক ব্যানার স্লাইডার",
    });
    await expect(hero).toBeVisible();
    await expect(hero).toContainText("01");
    await expect(hero).toContainText("04");
    await expect(hero).toContainText(
      "One Partner · Complete Solutions · Confident Growth",
    );

    // 2. Unified Periwinkle gateway buttons (Courses -> Services -> Books)
    const gateways = page.locator("a[data-flagship-cta]");
    await expect(gateways).toHaveCount(3);
    const bgColors = await gateways.evaluateAll((els) =>
      els.map((el) => window.getComputedStyle(el).backgroundColor),
    );
    expect(bgColors).toEqual([
      "rgb(226, 227, 255)",
      "rgb(226, 227, 255)",
      "rgb(226, 227, 255)",
    ]);

    // 3. Popular Courses interactive category tabs & 4-col grid
    const coursesSection = page.locator('section[data-home-pillar="courses"]');
    await expect(coursesSection).toContainText("আমাদের জনপ্রিয় কোর্সসমূহ");
    const firstCategoryTab = coursesSection
      .locator('button[role="tab"]')
      .nth(1);
    await firstCategoryTab.click();
    await expect(firstCategoryTab).toHaveAttribute("aria-selected", "true");
    await expect(
      coursesSection.locator("[data-popular-course-card]").first(),
    ).toBeVisible();

    // 4. Services Gateway interactive track tabs + ConsultancyForm
    const servicesSection = page.locator('section[data-home-pillar="services"]');
    await expect(servicesSection).toContainText("আমাদের পেশাদার সেবাসমূহ");
    const rjscTab = servicesSection.getByRole("tab", {
      name: "Smart RJSC ও কোম্পানি",
    });
    await rjscTab.click();
    await expect(rjscTab).toHaveAttribute("aria-selected", "true");
    await expect(servicesSection).toContainText(
      "কোম্পানি নিবন্ধন ও কর্পোরেট সেক্রেটারিয়াল সেবা",
    );
    await expect(servicesSection.locator("form")).toBeVisible();

    // 5. Books E-Commerce Storefront section + category filter tabs
    const booksSection = page.locator('section[data-home-pillar="books"]');
    await expect(booksSection).toContainText("আমাদের সকল বইসমূহ");
    const firstBookTab = booksSection.locator('button[role="tab"]').nth(1);
    await firstBookTab.click();
    await expect(firstBookTab).toHaveAttribute("aria-selected", "true");
    await expect(booksSection.locator("article").first()).toBeVisible();

    // 6. Institutional Profile 2-col section (without fake mentor person)
    const profileSection = page.locator(
      'section[aria-label="প্রতিষ্ঠান পরিচিতি — Business Compliance Partner"]',
    );
    await expect(profileSection).toBeVisible();
    await expect(profileSection).toContainText("Business Compliance Partner");
    await expect(profileSection).toContainText("১");
    await expect(profileSection).toContainText("৪");
  });

  test("contact page renders centered Periwinkle header, official WhatsApp, #202D72 connect box, and form", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/contact");

    await expect(page.locator("h1")).toContainText("আমাদের সাথে যোগাযোগ করুন");
    await expect(page.locator("main")).toContainText("যোগাযোগের তথ্য");
    await expect(page.locator("main")).toContainText("সরাসরি ও দ্রুত যুক্ত থাকুন");
    await expect(page.locator("main form")).toBeVisible();
    await expect(
      page.locator('a[href^="https://wa.me/8801521537864"]').first(),
    ).toBeVisible();
  });
});
