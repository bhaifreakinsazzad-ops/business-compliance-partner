import { expect, test } from "@playwright/test";

interface LeadSubmissionPayload {
  name: string;
  mobile: string;
  email: string | null;
  whatsapp: string | null;
  addressArea: string;
  categoryContext: string;
  pillar: string;
  targetSlug: string | null;
  targetTitle: string | null;
  problemDescription: string;
  preferredContact: string;
  consentAccepted: boolean;
  idempotencyKey: string;
  sourcePage: string;
  websiteHoneypot: string;
}

const VALID_PROBLEM_TEXT =
  "আমাদের নতুন কোম্পানির জন্য কর নিবন্ধন ও বার্ষিক রিটার্ন পরামর্শ প্রয়োজন।";

test.describe("Consultancy intake form, validation & API contract", () => {
  test("renders /consultancy with verified Bengali heading, fields & Mode A upload ban", async ({
    page,
  }) => {
    const response = await page.goto("/consultancy");
    expect(response?.status()).toBe(200);

    await expect(page.locator("h1")).toContainText(
      "আপনার ব্যবসার সমস্যাটি জানান",
    );
    await expect(page.locator("form h3")).toContainText(
      "পরামর্শের অনুরোধ ফর্ম",
    );

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="mobile"]')).toBeVisible();
    await expect(page.locator('input[name="addressArea"]')).toBeVisible();
    await expect(page.locator('select[name="categoryContext"]')).toHaveValue(
      "Income Tax ও রিটার্ন",
    );
    await expect(
      page.locator('textarea[name="problemDescription"]'),
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="whatsapp"]')).toBeVisible();
    await expect(
      page.locator('input[type="radio"][name="preferredContact"][value="ANY"]'),
    ).toBeChecked();
    await expect(
      page.locator('input[name="consentAccepted"]'),
    ).not.toBeChecked();
    await expect(page.locator('form button[type="submit"]')).toBeVisible();

    await expect(page.locator("main")).toContainText(
      "সংবেদনশীল নথি আপলোড নিষেধ",
    );
    await expect(page.locator("main")).toContainText(
      "NID নম্বর, ব্যাংক হিসাব বা পাসপোর্ট তথ্য লিখবেন না",
    );
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  });

  test("client-side validation sets aria-invalid, focuses first invalid field, and skips API call", async ({
    page,
  }) => {
    let apiCalled = false;
    await page.route("**/api/leads", async (route) => {
      apiCalled = true;
      await route.abort();
    });

    await page.goto("/consultancy");
    await page.locator('form button[type="submit"]').click();

    expect(apiCalled).toBe(false);
    await expect(page.locator('form [role="alert"]')).toHaveCount(0);

    const nameInput = page.locator('input[name="name"]');
    const mobileInput = page.locator('input[name="mobile"]');
    const addressInput = page.locator('input[name="addressArea"]');
    const problemTextarea = page.locator('textarea[name="problemDescription"]');
    const consentCheckbox = page.locator('input[name="consentAccepted"]');

    await expect(nameInput).toHaveAttribute("aria-invalid", "true");
    await expect(nameInput).toBeFocused();
    await expect(
      page.locator("text=অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।"),
    ).toBeVisible();

    await expect(mobileInput).toHaveAttribute("aria-invalid", "true");
    await expect(addressInput).toHaveAttribute("aria-invalid", "true");
    await expect(problemTextarea).toHaveAttribute("aria-invalid", "true");
    await expect(consentCheckbox).toHaveAttribute("aria-invalid", "true");

    await nameInput.fill("করিম আহমেদ");
    await expect(nameInput).toHaveAttribute("aria-invalid", "false");

    await mobileInput.fill("12345");
    await addressInput.fill("মতিঝিল, ঢাকা");
    await problemTextarea.fill(VALID_PROBLEM_TEXT);
    await consentCheckbox.check();

    await page.locator('form button[type="submit"]').click();

    expect(apiCalled).toBe(false);
    await expect(page.locator('form [role="alert"]')).toHaveCount(0);
    await expect(mobileInput).toHaveAttribute("aria-invalid", "true");
    await expect(mobileInput).toBeFocused();
    await expect(
      page.locator("text=সঠিক মোবাইল নম্বর লিখুন, যেমন 01XXXXXXXXX"),
    ).toBeVisible();
  });

  test("server 422 rejects invalid BD mobile 01012345678, shows [role='alert'] & preserves inputs", async ({
    page,
  }) => {
    const capturedPayloads: LeadSubmissionPayload[] = [];

    await page.route("**/api/leads", async (route) => {
      capturedPayloads.push(
        route.request().postDataJSON() as LeadSubmissionPayload,
      );
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            messageBn: "অনুগ্রহ করে ফর্মের চিহ্নিত ঘরগুলো সঠিকভাবে পূরণ করুন।",
            messageEn: "Please correct the highlighted fields.",
            fieldErrors: {
              mobile: ["সঠিক মোবাইল নম্বর লিখুন, যেমন 01XXXXXXXXX"],
            },
          },
        }),
      });
    });

    await page.goto("/consultancy");

    await page.locator('input[name="name"]').fill("করিম আহমেদ");
    await page.locator('input[name="mobile"]').fill("01012345678");
    await page.locator('input[name="addressArea"]').fill("মতিঝিল, ঢাকা");
    await page
      .locator('select[name="categoryContext"]')
      .selectOption("Income Tax ও রিটার্ন");
    await page
      .locator('textarea[name="problemDescription"]')
      .fill(VALID_PROBLEM_TEXT);
    await page.locator('input[name="consentAccepted"]').check();

    await page.locator('form button[type="submit"]').click();

    const alertBanner = page.locator('form [role="alert"]');
    await expect(alertBanner).toBeVisible();
    await expect(alertBanner).toContainText(
      "অনুগ্রহ করে ফর্মের চিহ্নিত ঘরগুলো সঠিকভাবে পূরণ করুন।",
    );

    expect(capturedPayloads).toHaveLength(1);
    const [payload] = capturedPayloads;
    expect(payload.mobile).toBe("01012345678");
    expect(payload.pillar).toBe("CONSULTANCY");
    expect(payload.sourcePage).toBe("/consultancy");
    expect(payload.websiteHoneypot).toBe("");
    expect(payload.consentAccepted).toBe(true);

    await expect(page.locator('input[name="mobile"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(
      page.locator("text=সঠিক মোবাইল নম্বর লিখুন, যেমন 01XXXXXXXXX"),
    ).toBeVisible();

    await expect(page.locator('input[name="name"]')).toHaveValue("করিম আহমেদ");
    await expect(page.locator('input[name="mobile"]')).toHaveValue(
      "01012345678",
    );
    await expect(page.locator('input[name="addressArea"]')).toHaveValue(
      "মতিঝিল, ঢাকা",
    );
    await expect(
      page.locator('textarea[name="problemDescription"]'),
    ).toHaveValue(VALID_PROBLEM_TEXT);
    await expect(page.locator('input[name="consentAccepted"]')).toBeChecked();

    await expect(page.locator("body")).not.toContainText(/PS-DEMO-/i);
  });

  test("server 503 DATABASE_UNAVAILABLE shows error banner, hides receipt, and preserves all fields", async ({
    page,
  }) => {
    await page.route("**/api/leads", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: {
            code: "DATABASE_UNAVAILABLE",
            messageBn:
              "দুঃখিত, এই মুহূর্তে সার্ভার ডাটাবেজ সংযুক্ত নয়। আপনার তথ্য সংরক্ষণ করা যায়নি—অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
            messageEn:
              "Database storage is not currently connected. Your enquiry was not saved.",
          },
        }),
      });
    });

    await page.goto("/consultancy");

    await page.locator('input[name="name"]').fill("তানভীর হাসান");
    await page.locator('input[name="mobile"]').fill("01712345678");
    await page.locator('input[name="addressArea"]').fill("ধানমন্ডি, ঢাকা");
    await page
      .locator('select[name="categoryContext"]')
      .selectOption("VAT, BIN ও মূসক");
    await page
      .locator('textarea[name="problemDescription"]')
      .fill(VALID_PROBLEM_TEXT);
    await page.locator('input[name="email"]').fill("tanvir@company.bd");
    await page.locator('input[name="whatsapp"]').fill("01812345678");
    await page
      .locator('input[type="radio"][name="preferredContact"][value="WHATSAPP"]')
      .check();
    await page.locator('input[name="consentAccepted"]').check();

    await page.locator('form button[type="submit"]').click();

    const alertBanner = page.locator('form [role="alert"]');
    await expect(alertBanner).toBeVisible();
    await expect(alertBanner).toContainText("সার্ভার ডাটাবেজ সংযুক্ত নয়");
    await expect(page.locator('main [role="status"]')).toHaveCount(0);

    await expect(page.locator('input[name="name"]')).toHaveValue("তানভীর হাসান");
    await expect(page.locator('input[name="mobile"]')).toHaveValue(
      "01712345678",
    );
    await expect(page.locator('input[name="addressArea"]')).toHaveValue(
      "ধানমন্ডি, ঢাকা",
    );
    await expect(page.locator('select[name="categoryContext"]')).toHaveValue(
      "VAT, BIN ও মূসক",
    );
    await expect(
      page.locator('textarea[name="problemDescription"]'),
    ).toHaveValue(VALID_PROBLEM_TEXT);
    await expect(page.locator('input[name="email"]')).toHaveValue(
      "tanvir@company.bd",
    );
    await expect(page.locator('input[name="whatsapp"]')).toHaveValue(
      "01812345678",
    );
    await expect(
      page.locator(
        'input[type="radio"][name="preferredContact"][value="WHATSAPP"]',
      ),
    ).toBeChecked();
    await expect(page.locator('input[name="consentAccepted"]')).toBeChecked();

    await expect(page.locator("body")).not.toContainText(/PS-DEMO-/i);
  });

  test("server 201 displays LeadSuccessReceipt with PS-2026-AB34CD56 and resets form cleanly", async ({
    page,
  }) => {
    const capturedPayloads: LeadSubmissionPayload[] = [];

    await page.route("**/api/leads", async (route) => {
      capturedPayloads.push(
        route.request().postDataJSON() as LeadSubmissionPayload,
      );
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            publicReference: "PS-2026-AB34CD56",
            submittedAt: "2026-11-19T13:00:00.000Z",
            messageBn:
              "আপনার অনুরোধটি গ্রহণ করা হয়েছে। রেফারেন্স: PS-2026-AB34CD56",
          },
        }),
      });
    });

    await page.goto("/consultancy");

    await page.locator('input[name="name"]').fill("করিম আহমেদ");
    await page.locator('input[name="mobile"]').fill("01712345678");
    await page.locator('input[name="addressArea"]').fill("মতিঝিল, ঢাকা");
    await page
      .locator('select[name="categoryContext"]')
      .selectOption("Income Tax ও রিটার্ন");
    await page
      .locator('textarea[name="problemDescription"]')
      .fill(VALID_PROBLEM_TEXT);
    await page.locator('input[name="consentAccepted"]').check();

    await page.locator('form button[type="submit"]').click();

    const receipt = page.locator('main [role="status"]');
    await expect(receipt).toBeVisible();
    await expect(receipt).toContainText(
      "আপনার অনুরোধটি সফলভাবে সংরক্ষিত হয়েছে",
    );
    await expect(receipt).toContainText("PS-2026-AB34CD56");
    await expect(receipt).toContainText(
      /PS-\d{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}/,
    );
    await expect(page.locator("body")).not.toContainText(/PS-DEMO-/i);
    await expect(page.locator("main form")).toHaveCount(0);
    await expect(receipt.locator('a[href="/"]')).toBeVisible();

    expect(capturedPayloads).toHaveLength(1);
    expect(capturedPayloads[0]).toEqual({
      name: "করিম আহমেদ",
      mobile: "01712345678",
      email: null,
      whatsapp: null,
      addressArea: "মতিঝিল, ঢাকা",
      categoryContext: "Income Tax ও রিটার্ন",
      pillar: "CONSULTANCY",
      targetSlug: null,
      targetTitle: null,
      problemDescription: VALID_PROBLEM_TEXT,
      preferredContact: "ANY",
      consentAccepted: true,
      idempotencyKey: expect.stringMatching(/^ps_[a-zA-Z0-9_]{16,}$/),
      sourcePage: "/consultancy",
      websiteHoneypot: "",
    });

    await page.getByRole("button", { name: "আরেকটি অনুরোধ পাঠান" }).click();

    await expect(page.locator('main [role="status"]')).toHaveCount(0);
    await expect(page.locator("main form")).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue("");
    await expect(page.locator('input[name="mobile"]')).toHaveValue("");
    await expect(page.locator('input[name="addressArea"]')).toHaveValue("");
    await expect(
      page.locator('textarea[name="problemDescription"]'),
    ).toHaveValue("");
    await expect(page.locator('input[name="email"]')).toHaveValue("");
    await expect(page.locator('input[name="whatsapp"]')).toHaveValue("");
    await expect(
      page.locator('input[name="consentAccepted"]'),
    ).not.toBeChecked();
  });
});
