import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_22_AA_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
] as const;

const A11Y_ROUTES = [
  "/",
  "/courses",
  "/courses/complete-income-tax-course-bangladesh",
  "/services",
  "/licensing",
  "/consultancy",
  "/faq",
  "/privacy",
  "/admin/login",
] as const;

const PUBLIC_GOVERNANCE_ROUTES = [
  "/",
  "/courses",
  "/courses/complete-income-tax-course-bangladesh",
  "/services",
  "/licensing",
  "/consultancy",
  "/faq",
  "/privacy",
] as const;

const FORBIDDEN_PATTERNS: ReadonlyArray<{ label: string; regex: RegExp }> = [
  { label: "FIXXER", regex: /fixxer/i },
  { label: "DhandaBuzz", regex: /dhandabuzz/i },
  { label: "NotRealEngine", regex: /notrealengine/i },
  { label: "LeadConnector", regex: /leadconnector/i },
  { label: "PS-DEMO", regex: /ps-demo/i },
  { label: "1XXX-XXXXXX", regex: /1xxx-xxxxxx/i },
  { label: "example.com", regex: /example\.com/i },
];

const FORBIDDEN_CDN_SCRIPT_REGEX =
  /animejs|three|unpkg\.com|jsdelivr|cdnjs|leadconnector/i;

test.describe("WCAG 2.2 AA automated accessibility audit", () => {
  for (const route of A11Y_ROUTES) {
    test(`${route} has zero critical or serious WCAG 2.2 AA violations`, async ({
      page,
    }) => {
      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags([...WCAG_22_AA_TAGS])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      expect(
        blocking,
        `WCAG 2.2 AA violations on ${route}: ${JSON.stringify(
          blocking.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.map((n) => n.target),
          })),
        )}`,
      ).toEqual([]);
    });
  }
});

test.describe("Keyboard accessibility & mobile dialog interactions", () => {
  test("skip link receives focus on Tab, becomes visible, and moves focus to #main-content on Enter", async ({
    page,
  }) => {
    await page.goto("/");

    const skipLink = page.locator('a.skip-link[href="#main-content"]');
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("FAQ <details.ps-disclosure> toggles open with Enter and closed with Space", async ({
    page,
  }) => {
    await page.goto("/faq");

    const firstDetails = page.locator("details.ps-disclosure").first();
    const firstSummary = firstDetails.locator("summary");

    await expect(firstDetails).toHaveJSProperty("open", false);
    await firstSummary.focus();
    await expect(firstSummary).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(firstDetails).toHaveJSProperty("open", true);
    await expect(firstDetails.locator("div p").first()).toBeVisible();

    await page.keyboard.press("Space");
    await expect(firstDetails).toHaveJSProperty("open", false);
  });

  test("mobile navigation <dialog> opens via menu button and closes on Escape (mobile-360)", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-360",
      "Mobile dialog drawer test targets mobile-360 viewport",
    );

    await page.goto("/");

    const openBtn = page.getByRole("button", { name: "মেনু খুলুন" });
    const dialog = page.locator("#ps-mobile-nav-dialog");

    await expect(openBtn).toHaveAttribute("aria-expanded", "false");
    await openBtn.click();

    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("open", "");
    await expect(openBtn).toHaveAttribute("aria-expanded", "true");
    await expect(
      dialog.getByRole("navigation", { name: "মোবাইল নেভিগেশন" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).not.toBeVisible();
    await expect(dialog).not.toHaveAttribute("open", "");
    await expect(openBtn).toHaveAttribute("aria-expanded", "false");
    await expect(openBtn).toBeFocused();
  });
});

test.describe("Language, governance strings & zero external CDN scripts", () => {
  for (const route of PUBLIC_GOVERNANCE_ROUTES) {
    test(`${route} has <html lang="bn">, zero forbidden strings, and zero external CDN scripts`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      await expect(page.locator("html")).toHaveAttribute("lang", "bn");

      const bodyText = await page.locator("body").innerText();
      const htmlContent = await page.content();

      for (const forbidden of FORBIDDEN_PATTERNS) {
        expect(
          forbidden.regex.test(bodyText),
          `Found forbidden visible string ${forbidden.label} on ${route}`,
        ).toBe(false);
        expect(
          forbidden.regex.test(htmlContent),
          `Found forbidden HTML string ${forbidden.label} on ${route}`,
        ).toBe(false);
      }

      const externalScripts = await page
        .locator("script[src]")
        .evaluateAll(
          (scripts, { origin, cdnPattern }) => {
            const cdnRegex = new RegExp(cdnPattern, "i");
            return scripts
              .map((el) => el.getAttribute("src") ?? "")
              .filter((src) => {
                if (!src) return false;
                if (cdnRegex.test(src)) return true;
                try {
                  const resolved = new URL(src, origin);
                  return resolved.origin !== origin;
                } catch {
                  return true;
                }
              });
          },
          {
            origin: new URL(page.url()).origin,
            cdnPattern: FORBIDDEN_CDN_SCRIPT_REGEX.source,
          },
        );

      expect(
        externalScripts,
        `Unexpected external/CDN scripts on ${route}: ${externalScripts.join(", ")}`,
      ).toEqual([]);
    });
  }
});
