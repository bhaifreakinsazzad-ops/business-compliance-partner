import { expect, test } from "@playwright/test";

interface PublicRouteSpec {
  path: string;
  label: string;
  h1Contains: string;
}

const PUBLIC_ROUTES: ReadonlyArray<PublicRouteSpec> = [
  { path: "/", label: "Homepage", h1Contains: "শিখুন, সেবা নিন" },
  {
    path: "/courses",
    label: "Courses catalogue",
    h1Contains: "পেশাদার কোর্স ও ব্যবসায়িক প্রশিক্ষণ",
  },
  {
    path: "/courses/complete-income-tax-course-bangladesh",
    label: "Course detail",
    h1Contains: "সম্পূর্ণ আয়কর (Income Tax) ব্যবহারিক কোর্স",
  },
  {
    path: "/services",
    label: "Services catalogue",
    h1Contains: "পেশাদার ব্যবসায়িক ও কমপ্লায়েন্স সেবাসমূহ",
  },
  {
    path: "/services/etin-individual-corporate-tax-return",
    label: "Service detail",
    h1Contains: "e-TIN ও আয়কর রিটার্ন প্রস্তুতি সহায়তা",
  },
  {
    path: "/licensing",
    label: "Licensing catalogue",
    h1Contains: "ব্যবসায়িক লাইসেন্সিং ও নিবন্ধন সহায়তা",
  },
  {
    path: "/licensing/trade-license-new-renewal",
    label: "Licensing detail",
    h1Contains: "ট্রেড লাইসেন্স (নতুন নিবন্ধন ও নবায়ন) সহায়তা",
  },
  {
    path: "/consultancy",
    label: "Consultancy form",
    h1Contains: "আপনার ব্যবসার সমস্যাটি জানান",
  },
  {
    path: "/about",
    label: "About page",
    h1Contains: "ব্যবসায়িক শিক্ষা ও কমপ্লায়েন্স সহায়তার",
  },
  {
    path: "/faq",
    label: "FAQ page",
    h1Contains: "সচরাচর জিজ্ঞাসা (FAQ)",
  },
  {
    path: "/contact",
    label: "Contact page",
    h1Contains: "যোগাযোগ ও অনুসন্ধান",
  },
  {
    path: "/privacy",
    label: "Privacy policy",
    h1Contains: "গোপনীয়তা নীতি ও তথ্য সুরক্ষা",
  },
  {
    path: "/terms",
    label: "Terms of use",
    h1Contains: "ব্যবহারের শর্তাবলি",
  },
  {
    path: "/disclaimer",
    label: "Disclaimer page",
    h1Contains: "আইনি ও রেগুলেটরি ডিসক্লেইমার",
  },
];

const MODE_A_ROUTES: ReadonlyArray<string> = [
  "/",
  "/courses",
  "/courses/complete-income-tax-course-bangladesh",
  "/services",
  "/services/etin-individual-corporate-tax-return",
  "/licensing",
  "/consultancy",
  "/contact",
];

const AUTHORITY_NOTE_ROUTES: ReadonlyArray<string> = [
  "/",
  "/licensing",
  "/licensing/trade-license-new-renewal",
  "/services/etin-individual-corporate-tax-return",
  "/about",
  "/disclaimer",
];

const FORBIDDEN_CTA_REGEX =
  /\b(buy now|add to cart|checkout|pay now|enroll now)\b|এখনই কিনুন|পেমেন্ট করুন|চেকআউট/i;
const PAYMENT_GATEWAY_URL_REGEX =
  /sslcommerz|bkash|nagad|stripe|aamarpay|shurjopay/i;

test.describe("Business Compliance Partner smoke & responsiveness", () => {
  test("homepage renders Bengali-first shell with skip link and zero horizontal overflow", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("ব্যবসা শুরু থেকে সফল পরিচালনা");
    await expect(page.locator('a[href="#main-content"]')).toBeAttached();
    await expect(page.locator("main#main-content")).toBeVisible();

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
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("database");
    expect(body).toHaveProperty("timestamp");
  });

  test("unauthenticated /admin redirects to /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("/admin/login renders login form cleanly with zero horizontal overflow", async ({
    page,
  }) => {
    const response = await page.goto("/admin/login");
    expect(response?.status()).toBe(200);

    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('form input[type="email"]')).toBeVisible();
    await expect(
      page.locator('form input[autocomplete="current-password"]'),
    ).toBeVisible();
    await expect(page.locator('form button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/"]').first()).toBeVisible();

    const overflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });
    expect(overflow).toBe(false);
  });

  test("unknown route renders helpful Bengali 404 page", async ({ page }) => {
    const response = await page.goto("/non-existent-phase1-check");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("খুঁজে পাওয়া যায়নি");
    await expect(page.locator('main a[href="/"]')).toBeVisible();
  });
});

test.describe("Public routes semantic shell & 4-viewport overflow check", () => {
  for (const route of PUBLIC_ROUTES.filter((r) => r.path !== "/")) {
    test(`${route.label} (${route.path}) renders Bengali shell without horizontal overflow`, async ({
      page,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);

      await expect(page.locator("html")).toHaveAttribute("lang", "bn");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h1")).toContainText(route.h1Contains);
      await expect(page.locator('a[href="#main-content"]')).toBeAttached();
      await expect(page.locator("main#main-content")).toBeVisible();

      const overflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });
      expect(overflow).toBe(false);
    });
  }
});

test.describe("Course category filtering & catalogue search", () => {
  test("filters courses by category and resets back to all categories", async ({
    page,
  }) => {
    await page.goto("/courses");

    const taxCourseLink = page
      .locator('main a[href="/courses/complete-income-tax-course-bangladesh"]')
      .first();
    const vatCourseLink = page
      .locator('main a[href="/courses/complete-vat-mushak-course-bangladesh"]')
      .first();

    await expect(page.locator("main article").first()).toBeVisible();
    await expect(taxCourseLink).toBeVisible();
    await expect(vatCourseLink).toBeVisible();

    const categoryNav = page.locator(
      'div[role="navigation"][aria-label="কোর্স ক্যাটাগরি"]',
    );
    await categoryNav.locator('a[href="/courses?category=income-tax"]').click();
    await expect(page).toHaveURL(/\/courses\?category=income-tax/);
    await expect(taxCourseLink).toBeVisible();
    await expect(vatCourseLink).toHaveCount(0);

    await categoryNav.locator('a[href="/courses"]').click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(vatCourseLink).toBeVisible();
  });

  test("searches courses via #catalogue-search-input and handles empty search reset", async ({
    page,
  }) => {
    await page.goto("/courses");

    const searchInput = page.locator("#catalogue-search-input");
    const searchSubmit = page.locator(
      'form[action="/courses"] button[type="submit"]',
    );

    await searchInput.fill("VAT");
    await searchSubmit.click();
    await expect(page).toHaveURL(/\/courses\?q=VAT/i);
    await expect(
      page
        .locator('main a[href="/courses/complete-vat-mushak-course-bangladesh"]')
        .first(),
    ).toBeVisible();
    await expect(
      page.locator(
        'main a[href="/courses/complete-income-tax-course-bangladesh"]',
      ),
    ).toHaveCount(0);

    await searchInput.fill("xyznonexistent999");
    await searchSubmit.click();
    await expect(page).toHaveURL(/\/courses\?q=xyznonexistent999/i);
    await expect(page.locator("main h3")).toContainText(
      "এই ফিল্টারে প্রকাশিত কোনো কোর্স পাওয়া যায়নি",
    );

    await page
      .locator('main a[href="/courses"]', { hasText: "সব কোর্স দেখুন" })
      .click();
    await expect(page).toHaveURL(/\/courses$/);
    await expect(
      page
        .locator(
          'main a[href="/courses/complete-income-tax-course-bangladesh"]',
        )
        .first(),
    ).toBeVisible();
  });
});

test.describe("Homepage unified search (#unified-search)", () => {
  test("searches RJSC across all 3 pillars and navigates to course detail", async ({
    page,
  }) => {
    await page.goto("/");

    const searchSection = page.locator("#unified-search");
    const input = searchSection.locator("#unified-search-input");
    const submitBtn = searchSection.locator('button[type="submit"]');

    const searchResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/catalogue/search") &&
        res.url().includes("q=RJSC") &&
        res.status() === 200,
    );

    await input.fill("RJSC");
    await submitBtn.click();
    await searchResponsePromise;

    const resultsRegion = searchSection.locator('[aria-live="polite"]');
    const courseResult = resultsRegion.locator(
      'a[href="/courses/company-formation-rjsc-practical-course"]',
    );
    const serviceResult = resultsRegion.locator(
      'a[href="/services/smart-rjsc-company-secretarial-support"]',
    );
    const licensingResult = resultsRegion.locator(
      'a[href="/licensing/rjsc-company-partnership-incorporation"]',
    );

    await expect(courseResult).toBeVisible();
    await expect(serviceResult).toBeVisible();
    await expect(licensingResult).toBeVisible();

    await courseResult.click();
    await expect(page).toHaveURL(
      /\/courses\/company-formation-rjsc-practical-course$/,
    );
    await expect(page.locator("h1")).toBeVisible();
  });

  test("quick chip Fire populates matching licensing result", async ({
    page,
  }) => {
    await page.goto("/");

    const searchSection = page.locator("#unified-search");
    const fireResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/catalogue/search") &&
        res.url().includes("q=Fire") &&
        res.status() === 200,
    );

    await searchSection
      .getByRole("button", { name: "Fire", exact: true })
      .click();
    await fireResponsePromise;

    const resultsRegion = searchSection.locator('[aria-live="polite"]');
    await expect(
      resultsRegion.locator('a[href="/licensing/fire-service-e-fire-licence"]'),
    ).toBeVisible();
  });
});

test.describe("Business Solution Finder", () => {
  test("returns a deterministic explained next step", async ({ page }) => {
    await page.goto("/");
    const finder = page.locator("#solution-finder");
    await finder.locator("select").first().selectOption("start");
    await expect(finder.getByText("ব্যবসা গঠন ও নিবন্ধন সেবা দেখুন")).toBeVisible();
    await expect(finder.getByRole("link", { name: /পরবর্তী ধাপে যান/ })).toHaveAttribute(
      "href",
      "/services?category=business-formation-and-rjsc",
    );
  });
});

test.describe("Detail pages & Mode A enquiry deep-links", () => {
  test("course detail renders syllabus modules and COURSES enquiry CTA", async ({
    page,
  }) => {
    await page.goto("/courses/complete-income-tax-course-bangladesh");

    const disclosures = page.locator("details.ps-disclosure");
    expect(await disclosures.count()).toBeGreaterThan(0);
    await expect(disclosures.first()).toHaveJSProperty("open", true);

    await expect(
      page.locator(
        'a[href^="/consultancy?pillar=COURSES&slug=complete-income-tax-course-bangladesh"]',
      ),
    ).toBeVisible();
  });

  test("service detail renders SERVICES enquiry CTA", async ({ page }) => {
    await page.goto("/services/etin-individual-corporate-tax-return");

    await expect(
      page.locator(
        'a[href^="/consultancy?pillar=SERVICES&slug=etin-individual-corporate-tax-return"]',
      ),
    ).toBeVisible();
  });

  test("licensing detail renders LICENSING enquiry CTA", async ({ page }) => {
    await page.goto("/licensing/trade-license-new-renewal");

    await expect(
      page.locator(
        'a[href^="/consultancy?pillar=LICENSING&slug=trade-license-new-renewal"]',
      ),
    ).toBeVisible();
  });
});

test.describe("Mode A scope boundaries", () => {
  for (const route of MODE_A_ROUTES) {
    test(`${route} enforces Mode A constraints (no uploads, video/audio, checkout CTAs, or gateways)`, async ({
      page,
    }) => {
      await page.goto(route);

      await expect(page.locator('input[type="file"]')).toHaveCount(0);
      await expect(page.locator("video, audio, iframe")).toHaveCount(0);

      const bannedCtas = await page
        .locator("a, button")
        .evaluateAll((elements, patternSource) => {
          const regex = new RegExp(patternSource, "i");
          return elements
            .map((el) => (el.textContent ?? "").trim())
            .filter((text) => regex.test(text));
        }, FORBIDDEN_CTA_REGEX.source);
      expect(bannedCtas).toEqual([]);

      const gatewayAttrs = await page
        .locator("script[src], a[href], form[action]")
        .evaluateAll((elements, patternSource) => {
          const regex = new RegExp(patternSource, "i");
          return elements
            .map(
              (el) =>
                el.getAttribute("src") ??
                el.getAttribute("href") ??
                el.getAttribute("action") ??
                "",
            )
            .filter((val) => regex.test(val));
        }, PAYMENT_GATEWAY_URL_REGEX.source);
      expect(gatewayAttrs).toEqual([]);
    });
  }
});

test.describe("AuthorityNote independent platform disclaimers", () => {
  for (const route of AUTHORITY_NOTE_ROUTES) {
    test(`${route} displays AuthorityNote independent guidance`, async ({
      page,
    }) => {
      await page.goto(route);

      const note = page.locator(
        'aside[aria-label="কর্তৃপক্ষ ও স্বাধীন সহায়তা নির্দেশিকা"]',
      );
      await expect(note).toBeVisible();
      await expect(note).toContainText("স্বাধীন");
    });
  }

  test("service detail AuthorityNote shows NBR authority and official link", async ({
    page,
  }) => {
    await page.goto("/services/etin-individual-corporate-tax-return");

    const note = page.locator(
      'aside[aria-label="কর্তৃপক্ষ ও স্বাধীন সহায়তা নির্দেশিকা"]',
    );
    await expect(note).toBeVisible();
    await expect(note).toContainText("National Board of Revenue (NBR)");
    await expect(
      note.locator('a[href="https://nbr.gov.bd/all-eservices/eng"][target="_blank"]'),
    ).toBeVisible();
  });
});
