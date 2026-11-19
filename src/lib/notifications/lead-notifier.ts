import type { Pillar } from "@/types/domain";

export interface LeadNotificationEvent {
  publicReference: string;
  pillar: Pillar;
  categoryContext: string;
  submittedAt: string;
}

export interface LeadNotifier {
  notifyNewLead(event: LeadNotificationEvent): Promise<void>;
}

/**
 * Logs only non-PII operational metadata in dev/staging.
 * Never logs customer name, mobile, email, address, or problem text.
 */
export class ConsoleLeadNotifier implements LeadNotifier {
  async notifyNewLead(event: LeadNotificationEvent): Promise<void> {
    console.info(
      JSON.stringify({
        event: "lead.created",
        publicReference: event.publicReference,
        pillar: event.pillar,
        categoryContext: event.categoryContext,
        submittedAt: event.submittedAt,
      }),
    );
  }
}

/**
 * Production notification adapter via Resend HTTP API. Sends ONLY non-PII
 * reference & category summary directing staff to sign in to /admin/leads.
 */
export class ResendLeadNotifier implements LeadNotifier {
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly toEmail: string;

  constructor(config: { apiKey: string; fromEmail: string; toEmail: string }) {
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail;
    this.toEmail = config.toEmail;
  }

  async notifyNewLead(event: LeadNotificationEvent): Promise<void> {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "";
    const adminInboxUrl = `${baseUrl}/admin/leads?q=${encodeURIComponent(event.publicReference)}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [this.toEmail],
        subject: `[Paperwork Squad] New ${event.pillar} Enquiry (${event.publicReference})`,
        text: [
          `A new enquiry has been recorded.`,
          `Reference: ${event.publicReference}`,
          `Pillar: ${event.pillar}`,
          `Category: ${event.categoryContext}`,
          `Recorded At: ${event.submittedAt}`,
          ``,
          `Sign in to review full details securely: ${adminInboxUrl}`,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend notification failed with status ${response.status}`);
    }
  }
}

export function getLeadNotifier(): LeadNotifier {
  const provider = process.env.NOTIFICATION_PROVIDER?.trim().toLowerCase();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL?.trim();
  const toEmail = process.env.NOTIFICATION_TO_EMAIL?.trim();

  if (provider === "resend" && apiKey && fromEmail && toEmail) {
    return new ResendLeadNotifier({ apiKey, fromEmail, toEmail });
  }

  return new ConsoleLeadNotifier();
}
