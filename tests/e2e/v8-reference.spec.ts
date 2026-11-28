import { expect, test } from "@playwright/test";

test.describe("V8.3 Branded Asset Integration & Video-Verified Reference Fidelity", () => {
  test("renders Bunyanum Marsus homepage section sequence, full-bleed coverflow, gateways, 3 pillars, journey, and institutional poster", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // 1. 3D Perspective Coverflow Stage + Compact Bottom CTA Strip + Tagline
    const hero = page.getByRole("region", {
      name: "প্রচারণামূলক ব্যানার স্লাইডার",
    });
    await expect(hero).toBeVisible();
    await expect(hero.locator("[data-coverflow-stage]")).toBeVisible();
    await expect(hero.locator("[data-coverflow-slide]")).toHaveCount(4);
    await expect(hero.locator('[data-hero-cta-strip="ecosystem-overview"]')).toBeVisible();
    await expect(hero).toContainText("01");
    await expect(hero).toContainText("04");
    await expect(hero).toContainText(
      "One Partner · Complete Solutions · Confident Growth",
    );

    // Hero slide image fills 16:9 stage cleanly with branded V8.3 artwork
    const activeHeroImg = hero
      .locator('[data-coverflow-role="active"] img')
      .first();
    await expect(activeHeroImg).toHaveAttribute("src", /hero-brand\.webp/);

    // 2. Unified Compact Periwinkle Gateway Buttons (Courses -> Services -> Books)
    const gateways = page.locator("a[data-flagship-cta]");
    await expect(gateways).toHaveCount(3);
    const gatewayMetrics = await gateways.evaluateAll((els) =>
      els.map((el) => ({
        bg: window.getComputedStyle(el).backgroundColor,
        height: el.getBoundingClientRect().height,
        slug: el.getAttribute("data-flagship-cta"),
      })),
    );
    expect(gatewayMetrics.map((m) => m.slug)).toEqual([
      "courses",
      "services",
      "books",
    ]);
    expect(gatewayMetrics.map((m) => m.bg)).toEqual([
      "rgb(226, 227, 255)",
      "rgb(226, 227, 255)",
      "rgb(226, 227, 255)",
    ]);
    for (const metric of gatewayMetrics) {
      expect(metric.height).toBeLessThanOrEqual(80);
    }

    // 3. Popular Courses interactive category tabs & uniform 16:9 thumbnails
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

    // 4. Services Gateway interactive track tabs switch track artwork cleanly
    const servicesSection = page.locator('section[data-home-pillar="services"]');
    await expect(servicesSection).toContainText("আমাদের পেশাদার সেবাসমূহ");
    await expect(
      servicesSection.locator("img").first(),
    ).toHaveAttribute("src", /service-tax\.webp/);

    const rjscTab = servicesSection.getByRole("tab", {
      name: "Smart RJSC ও কোম্পানি",
    });
    await rjscTab.click();
    await expect(rjscTab).toHaveAttribute("aria-selected", "true");
    await expect(servicesSection).toContainText(
      "কোম্পানি নিবন্ধন ও কর্পোরেট সেক্রেটারিয়াল সেবা",
    );
    await expect(
      servicesSection.locator("img").first(),
    ).toHaveAttribute("src", /service-rjsc\.webp/);
    await expect(servicesSection.locator("form")).toBeVisible();

    // 5. Books E-Commerce Storefront section + category filter tabs
    const booksSection = page.locator('section[data-home-pillar="books"]');
    await expect(booksSection).toContainText("আমাদের সকল বইসমূহ");
    const firstBookTab = booksSection.locator('button[role="tab"]').nth(1);
    await firstBookTab.click();
    await expect(firstBookTab).toHaveAttribute("aria-selected", "true");
    await expect(booksSection.locator("article").first()).toBeVisible();

    // 6. Four-Step Customer Journey Section
    const journeySection = page.locator(
      'section[aria-label="আমাদের কার্যক্রম কীভাবে চলে — ৪ ধাপের যাত্রা"]',
    );
    await expect(journeySection).toBeVisible();
    await expect(journeySection).toContainText("আমাদের কার্যক্রম কীভাবে চলে?");
    await expect(journeySection.locator("[data-journey-step]")).toHaveCount(4);

    // 7. White-to-Periwinkle Institutional Profile Slide 1 (portrait poster) -> Slide 2 (studio visual)
    const profileSection = page.locator(
      'section[aria-label="প্রতিষ্ঠান পরিচিতি — Business Compliance Partner"]',
    );
    await expect(profileSection).toBeVisible();
    await expect(
      profileSection.locator("[data-institutional-profile-frame='periwinkle']"),
    ).toBeVisible();
    await expect(
      profileSection.locator('img[src*="bcp-institutional-poster.webp"]'),
    ).toBeVisible();
    await expect(profileSection).toContainText("Business Compliance Partner");
    await expect(profileSection).toContainText("১");
    await expect(profileSection).toContainText("৪");

    await profileSection
      .getByRole("button", { name: "পরবর্তী পরিচিতি প্যানেল" })
      .click();
    await expect(profileSection).toContainText("02 / 02");
    await expect(
      profileSection.locator('img[src*="bcp-studio-editorial.webp"]'),
    ).toBeVisible();
  });

  test("coverflow carousel renders 3D wing geometry, circular edge arrows, wrap-around, keyboard nav, and pause/resume", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const hero = page.getByRole("region", {
      name: "প্রচারণামূলক ব্যানার স্লাইডার",
    });

    const activeSlide = hero.locator('[data-coverflow-role="active"]');
    const prevWing = hero.locator('[data-coverflow-role="prev"]');
    const nextWing = hero.locator('[data-coverflow-role="next"]');

    await expect(activeSlide).toHaveCount(1);
    await expect(prevWing).toHaveCount(1);
    await expect(nextWing).toHaveCount(1);

    const boxes = await Promise.all([
      activeSlide.boundingBox(),
      prevWing.boundingBox(),
      nextWing.boundingBox(),
    ]);
    expect(boxes[0]).not.toBeNull();
    expect(boxes[1]).not.toBeNull();
    expect(boxes[2]).not.toBeNull();
    expect(boxes[0]!.width).toBeGreaterThan(boxes[1]!.width);
    expect(boxes[0]!.width).toBeGreaterThan(boxes[2]!.width);

    const wingTransform = await nextWing.evaluate(
      (el) => window.getComputedStyle(el).transform,
    );
    expect(wingTransform).not.toBe("none");

    const nextBtn = hero.locator('button[data-carousel-next="true"]');
    const prevBtn = hero.locator('button[data-carousel-prev="true"]');
    await expect(nextBtn).toBeVisible();
    await expect(prevBtn).toBeVisible();

    await prevBtn.click();
    await expect(hero.locator("[data-slide-counter]")).toContainText("04");

    await nextBtn.click();
    await expect(hero.locator("[data-slide-counter]")).toContainText("01");

    await nextBtn.click();
    await nextBtn.click();
    await nextBtn.click();
    await expect(hero.locator("[data-slide-counter]")).toContainText("04");

    await hero.focus();
    await page.keyboard.press("ArrowRight");
    await expect(hero.locator("[data-slide-counter]")).toContainText("01");

    const pauseBtn = hero.getByRole("button", { name: "স্লাইডার থামান" });
    await pauseBtn.click();
    const resumeBtn = hero.getByRole("button", { name: "স্লাইডার চালু করুন" });
    await expect(resumeBtn).toHaveAttribute("aria-pressed", "true");
    await resumeBtn.click();
    await expect(pauseBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("floating conversion dock stacks circular buttons vertically on scroll without mobile overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, 700));
    const dock = page.locator('[data-floating-dock="vertical"]');
    await expect(dock).toBeVisible();

    const flexDir = await dock.evaluate(
      (el) => window.getComputedStyle(el).flexDirection,
    );
    expect(flexDir).toBe("column");

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("reduced-motion coverflow carousel disables transitions cleanly and keeps active slide crisp", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    const hero = page.getByRole("region", {
      name: "প্রচারণামূলক ব্যানার স্লাইডার",
    });
    const nextBtn = hero.locator('button[data-carousel-next="true"]');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await expect(hero.locator("[data-slide-counter]")).toContainText("02");
  });

  test("contact page renders supplied customer support banner, centered Periwinkle header, official WhatsApp, and form", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/contact");

    await expect(page.locator("h1")).toContainText("আমাদের সাথে যোগাযোগ করুন");
    await expect(page.locator('img[src*="customer-support.webp"]')).toBeVisible();
    await expect(page.locator("main")).toContainText("যোগাযোগের তথ্য");
    await expect(page.locator("main")).toContainText("সরাসরি ও দ্রুত যুক্ত থাকুন");
    await expect(page.locator("main form")).toBeVisible();
    await expect(
      page.locator('a[href^="https://wa.me/8801521537864"]').first(),
    ).toBeVisible();
    await expect(page.locator("main")).not.toContainText("চূড়ান্ত ক্লায়েন্ট অনুমোদনের পর");
  });

  test("division empty states render dedicated branded V8.3 illustrations across courses, services, and books", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto("/courses?q=zzzzv83nomatch");
    await expect(
      page.locator('[data-empty-state-variant="courses"] img[src*="courses-empty-state.webp"]'),
    ).toBeVisible();

    await page.goto("/services?q=zzzzv83nomatch");
    await expect(
      page.locator('[data-empty-state-variant="services"] img[src*="services-empty-state.webp"]'),
    ).toBeVisible();

    await page.goto("/books?q=zzzzv83nomatch");
    await expect(
      page.locator('[data-empty-state-variant="books"] img[src*="books-empty-state.webp"]'),
    ).toBeVisible();
  });

  test("V8.3 static artwork renders cleanly with zero broken images, single H1, guarded inactive slides, and paused progress freeze", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("h1")).toHaveCount(1);

    const hero = page.getByRole("region", {
      name: "প্রচারণামূলক ব্যানার স্লাইডার",
    });

    const inactiveSlides = hero.locator('[data-coverflow-slide][aria-hidden="true"]');
    await expect(inactiveSlides).toHaveCount(3);
    const inactiveTabIndexes = await inactiveSlides
      .locator("a")
      .evaluateAll((links) => links.map((a) => a.getAttribute("tabindex")));
    expect(inactiveTabIndexes.every((val) => val === "-1")).toBe(true);

    const pauseBtn = hero.getByRole("button", { name: "স্লাইডার থামান" });
    await pauseBtn.click();
    const activeBarScaleX = await hero
      .locator('[data-slide-progress="ecosystem-overview"]')
      .evaluate((el) => {
        const t = window.getComputedStyle(el).transform;
        if (!t || t === "none") return 0;
        const m = new DOMMatrix(t);
        return m.a;
      });
    expect(activeBarScaleX).toBeLessThan(0.9);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(350);
    const brokenImages = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.getAttribute("src")),
    );
    expect(brokenImages).toEqual([]);
  });
});
