import { Prisma } from "@prisma/client";
import type { ApiResponse, LeadSubmissionReceipt } from "@/types/domain";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getLeadNotifier } from "@/lib/notifications/lead-notifier";
import { hashClientIp } from "@/lib/security/password";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { generatePublicReference } from "@/lib/security/reference-id";
import { leadSubmissionSchema } from "@/lib/validation/lead";

const leadRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 10 * 60 * 1000, // 5 submissions per 10 minutes per IP hash
  namespace: "bcp:lead",
});

async function verifyTurnstileIfConfigured(
  token: string | null | undefined,
  remoteIp: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return process.env.NEXT_PUBLIC_APP_ENV !== "production";
  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (remoteIp) form.set("remoteip", remoteIp);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export async function submitPublicLead(
  rawBody: unknown,
  meta: { ipAddress: string | null },
): Promise<{ status: number; body: ApiResponse<LeadSubmissionReceipt> }> {
  // 1. Fail closed & truthfully if PostgreSQL is not configured (NO PS-DEMO fakes).
  if (!isDatabaseConfigured()) {
    return {
      status: 503,
      body: {
        ok: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          messageBn:
            "দুঃখিত, এই মুহূর্তে সার্ভার ডাটাবেজ সংযুক্ত নয়। আপনার তথ্য সংরক্ষণ করা যায়নি—অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
          messageEn:
            "Database storage is not currently connected. Your enquiry was not saved.",
        },
      },
    };
  }

  // 2. Rate limiting per hashed client IP
  let ipHash: string;
  let rateCheck;
  try {
    ipHash = meta.ipAddress ? hashClientIp(meta.ipAddress) : "anonymous";
    rateCheck = await leadRateLimiter.check(ipHash);
  } catch {
    return {
      status: 503,
      body: {
        ok: false,
        error: {
          code: "RATE_LIMIT_UNAVAILABLE",
          messageBn: "নিরাপত্তা যাচাই সাময়িকভাবে অনুপলভ্য। অনুগ্রহ করে পরে চেষ্টা করুন।",
          messageEn: "Security verification is temporarily unavailable.",
        },
      },
    };
  }
  if (!rateCheck.allowed) {
    return {
      status: 429,
      body: {
        ok: false,
        error: {
          code: "RATE_LIMITED",
          messageBn:
            "স্বল্প সময়ে অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে কয়েক মিনিট পর আবার চেষ্টা করুন।",
          messageEn: "Too many submissions. Please try again later.",
        },
      },
    };
  }

  // 3. Strict Zod validation & BD mobile normalization
  const parsed = leadSubmissionSchema.safeParse(rawBody);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      status: 422,
      body: {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          messageBn: "অনুগ্রহ করে ফর্মের চিহ্নিত ঘরগুলো সঠিকভাবে পূরণ করুন।",
          messageEn: "Please correct the highlighted fields.",
          fieldErrors: flat.fieldErrors as Record<string, string[]>,
        },
      },
    };
  }

  const input = parsed.data;

  // 4. Optional Turnstile verification
  const turnstileOk = await verifyTurnstileIfConfigured(
    input.turnstileToken,
    meta.ipAddress,
  );
  if (!turnstileOk) {
    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: "BOT_CHECK_FAILED",
          messageBn: "নিরাপত্তা যাচাই সম্পন্ন হয়নি। আবার চেষ্টা করুন।",
          messageEn: "Security verification failed.",
        },
      },
    };
  }

  // 5. Idempotency check & durable PostgreSQL insert
  try {
    const existing = await prisma.lead.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      select: { publicReference: true, createdAt: true },
    });

    if (existing) {
      return {
        status: 200,
        body: {
          ok: true,
          data: {
            publicReference: existing.publicReference,
            submittedAt: existing.createdAt.toISOString(),
            messageBn: `আপনার অনুরোধটি আগেই গ্রহণ করা হয়েছে। রেফারেন্স: ${existing.publicReference}`,
          },
        },
      };
    }

    const siteSetting = await prisma.siteSetting
      .findUnique({
        where: { id: "default" },
        select: { privacyPolicyVersion: true },
      })
      .catch(() => null);

    let createdLead: {
      publicReference: string;
      createdAt: Date;
      pillar: string;
      categoryContext: string;
    } | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const publicReference = generatePublicReference();
      try {
        createdLead = await prisma.$transaction(async (tx) => {
          return tx.lead.create({
            data: {
              publicReference,
              idempotencyKey: input.idempotencyKey,
              name: input.name,
              mobile: input.mobile,
              email: input.email ?? null,
              whatsapp: input.whatsapp ?? null,
              addressArea: input.addressArea,
              categoryContext: input.categoryContext,
              pillar: input.pillar,
              targetSlug: input.targetSlug ?? null,
              targetTitle: input.targetTitle ?? null,
              problemDescription: input.problemDescription,
              preferredContact: input.preferredContact ?? null,
              consentAt: new Date(),
              privacyPolicyVersion:
                siteSetting?.privacyPolicyVersion ?? "v1.0-2026-11",
              sourcePage: input.sourcePage,
              utmSource: input.utmSource ?? null,
              utmMedium: input.utmMedium ?? null,
              utmCampaign: input.utmCampaign ?? null,
              ipHash,
              status: "NEW",
            },
            select: {
              publicReference: true,
              createdAt: true,
              pillar: true,
              categoryContext: true,
            },
          });
        });
        break;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          // If idempotencyKey raced, fetch and return original safely.
          const raced = await prisma.lead.findUnique({
            where: { idempotencyKey: input.idempotencyKey },
            select: { publicReference: true, createdAt: true },
          });
          if (raced) {
            return {
              status: 200,
              body: {
                ok: true,
                data: {
                  publicReference: raced.publicReference,
                  submittedAt: raced.createdAt.toISOString(),
                  messageBn: `আপনার অনুরোধটি গ্রহণ করা হয়েছে। রেফারেন্স: ${raced.publicReference}`,
                },
              },
            };
          }
          continue;
        }
        throw err;
      }
    }

    if (!createdLead) {
      throw new Error("Could not generate unique publicReference.");
    }

    // 6. Async non-PII staff notification (never fails committed lead)
    void getLeadNotifier()
      .notifyNewLead({
        publicReference: createdLead.publicReference,
        pillar: input.pillar,
        categoryContext: createdLead.categoryContext,
        submittedAt: createdLead.createdAt.toISOString(),
      })
      .catch(() => {
        console.error("[lead-notifier] Notification dispatch failed (non-fatal)");
      });

    return {
      status: 201,
      body: {
        ok: true,
        data: {
          publicReference: createdLead.publicReference,
          submittedAt: createdLead.createdAt.toISOString(),
          messageBn: `আপনার অনুরোধটি গ্রহণ করা হয়েছে। রেফারেন্স: ${createdLead.publicReference}`,
        },
      },
    };
  } catch {
    console.error("[leads] Lead persistence error (details omitted for PII safety)");
    return {
      status: 503,
      body: {
        ok: false,
        error: {
          code: "LEAD_STORAGE_FAILED",
          messageBn:
            "তথ্য সংরক্ষণে সাময়িক সমস্যা হয়েছে। আপনার লেখা তথ্য অক্ষুণ্ণ রয়েছে—অনুগ্রহ করে পুনরায় চেষ্টা করুন।",
          messageEn: "Temporary error saving enquiry. Please retry.",
        },
      },
    };
  }
}
