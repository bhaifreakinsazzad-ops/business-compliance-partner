/**
 * BCP Commerce & Payment Provider Abstraction
 *
 * Safe monetary calculations in BDT (Bangladesh Taka).
 * Integrates Sandbox payment provider and prepares interfaces for
 * approved bKash, Nagad, and local gateway integrations.
 */

export interface PaymentIntent {
  transactionReference: string;
  orderId: string;
  amountBdt: number;
  currency: "BDT";
  paymentUrl: string;
  provider: "SANDBOX" | "BKASH" | "NAGAD" | "BANK_TRANSFER";
  status: "INITIATED" | "SUCCESSFUL" | "FAILED";
}

export interface PaymentVerificationResult {
  verified: boolean;
  transactionReference: string;
  orderId: string;
  amountBdt: number;
  providerMessage: string;
}

export function toPaisa(bdt: number): number {
  return Math.round(bdt * 100);
}

export function fromPaisa(paisa: number): number {
  return paisa / 100;
}

/**
 * Creates a sandbox payment session for testing the end-to-end order flow
 * without making live financial claims.
 */
export async function createSandboxPaymentSession(
  orderId: string,
  amountBdt: number
): Promise<PaymentIntent> {
  const transactionReference = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    transactionReference,
    orderId,
    amountBdt,
    currency: "BDT",
    paymentUrl: `/portal?payment=sandbox&txn=${transactionReference}&order=${orderId}`,
    provider: "SANDBOX",
    status: "INITIATED",
  };
}

/**
 * Verifies a sandbox transaction server-side
 */
export function verifySandboxPayment(
  transactionReference: string,
  orderId: string,
  amountBdt: number
): PaymentVerificationResult {
  return {
    verified: true,
    transactionReference,
    orderId,
    amountBdt,
    providerMessage: "স্যান্ডবক্স পেমেন্ট সফলভাবে যাচাই করা হয়েছে।",
  };
}
