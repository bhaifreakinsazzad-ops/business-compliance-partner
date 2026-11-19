import { z } from "zod";
import {
  BD_MOBILE_ERROR_BN,
  normalizeBangladeshMobile,
} from "@/lib/validation/phone";

export const PILLAR_ENUM = z.enum([
  "COURSES",
  "SERVICES",
  "LICENSING",
  "CONSULTANCY",
]);

export const PREFERRED_CONTACT_ENUM = z.enum([
  "PHONE",
  "WHATSAPP",
  "EMAIL",
  "ANY",
]);

const optionalTrimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null));

export const leadSubmissionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।")
      .max(120, "নাম ১২০ অক্ষরের মধ্যে রাখুন।"),
    mobile: z
      .string()
      .trim()
      .min(11, BD_MOBILE_ERROR_BN)
      .max(24, BD_MOBILE_ERROR_BN)
      .transform((val, ctx) => {
        const normalized = normalizeBangladeshMobile(val);
        if (!normalized) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: BD_MOBILE_ERROR_BN,
          });
          return z.NEVER;
        }
        return normalized;
      }),
    email: z
      .string()
      .trim()
      .max(160)
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val.toLowerCase() : null))
      .refine((val) => val === null || z.string().email().safeParse(val).success, {
        message: "সঠিক ইমেইল ঠিকানা লিখুন অথবা ঘরটি খালি রাখুন।",
      }),
    whatsapp: z
      .string()
      .trim()
      .max(24)
      .optional()
      .nullable()
      .transform((val, ctx) => {
        if (!val || val.length === 0) return null;
        const normalized = normalizeBangladeshMobile(val);
        if (!normalized) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "হোয়াটসঅ্যাপ নম্বরের ক্ষেত্রে সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।",
          });
          return z.NEVER;
        }
        return normalized;
      }),
    addressArea: z
      .string()
      .trim()
      .min(3, "আপনার এলাকা বা ঠিকানা লিখুন।")
      .max(240, "ঠিকানা ২৪০ অক্ষরের মধ্যে রাখুন।"),
    categoryContext: z
      .string()
      .trim()
      .min(2, "বিষয় বা বিভাগ নির্বাচন করুন।")
      .max(120),
    pillar: PILLAR_ENUM.default("CONSULTANCY"),
    targetSlug: optionalTrimmedString(160),
    targetTitle: optionalTrimmedString(220),
    problemDescription: z
      .string()
      .trim()
      .min(10, "আপনার প্রয়োজন বা সমস্যা সম্পর্কে অন্তত ১০ অক্ষরে সংক্ষেপে লিখুন।")
      .max(2500, "বিবরণ ২৫০০ অক্ষরের মধ্যে রাখুন।"),
    preferredContact: PREFERRED_CONTACT_ENUM.optional().nullable().default(null),
    consentAccepted: z.literal(true, {
      errorMap: () => ({
        message: "অনুরোধ পাঠানোর আগে তথ্য ব্যবহার ও গোপনীয়তা নীতিতে সম্মতি দিন।",
      }),
    }),
    idempotencyKey: z
      .string()
      .trim()
      .min(16, "অবৈধ অনুরোধ শনাক্তকরণ কী।")
      .max(128)
      .regex(/^[a-zA-Z0-9_-]+$/),
    sourcePage: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .refine((val) => val.startsWith("/"), "Invalid internal source path"),
    utmSource: optionalTrimmedString(80),
    utmMedium: optionalTrimmedString(80),
    utmCampaign: optionalTrimmedString(80),
    // Honeypot must remain empty for real human submissions.
    websiteHoneypot: z
      .string()
      .optional()
      .nullable()
      .refine((val) => !val || val.trim().length === 0, {
        message: "Invalid submission payload.",
      }),
    turnstileToken: optionalTrimmedString(2048),
  })
  .strict();

export type ParsedLeadSubmission = z.infer<typeof leadSubmissionSchema>;
