/**
 * BCP Commerce & Payment Provider Abstraction
 *
 * Safe monetary calculations in BDT (Bangladesh Taka) using exact integer
 * paisa minor units. Integrates Sandbox payment provider (test/dev gated)
 * and prepares interfaces for approved bKash, Nagad, and local gateways.
 */

export interface PaymentIntent {
  transactionReference: string;
  orderId: string;
  amountPaisa: number;
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
  amountPaisa: number;
  amountBdt: number;
  currency: "BDT";
  providerMessage: string;
}

export function toPaisa(bdt: number): number {
  if (!Number.isFinite(bdt)) return 0;
  return Math.round(bdt * 100);
}

export function fromPaisa(paisa: number): number {
  if (!Number.isFinite(paisa)) return 0;
  return paisa / 100;
}

export function computeLineItemTotalPaisa(
  unitPricePaisa: number,
  quantity: number,
): number {
  if (!Number.isInteger(unitPricePaisa) || unitPricePaisa < 0) {
    throw new Error("INVALID_UNIT_PRICE_PAISA");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("INVALID_QUANTITY");
  }
  return unitPricePaisa * quantity;
}

/**
 * Exact currency formatter in BDT from integer paisa.
 * Preserves fractional paisa (e.g. ৳ 125.50) whenever non-zero rather than
 * silently rounding/truncating customer totals.
 */
export function formatBdtFromPaisa(
  paisa: number,
  locale: "en-US" | "bn-BD" = "en-US",
): string {
  const exactBdt = fromPaisa(paisa);
  const hasFractionalPaisa = Math.abs(paisa % 100) !== 0;
  const formatted = exactBdt.toLocaleString(locale, {
    minimumFractionDigits: hasFractionalPaisa ? 2 : 0,
    maximumFractionDigits: hasFractionalPaisa ? 2 : 0,
  });
  return `৳ ${formatted}`;
}

/**
 * Creates a sandbox payment session for testing the end-to-end order flow
 * without making live financial claims.
 */
export async function createSandboxPaymentSession(
  orderId: string,
  amountBdt: number,
): Promise<PaymentIntent> {
  const amountPaisa = toPaisa(amountBdt);
  const transactionReference = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    transactionReference,
    orderId,
    amountPaisa,
    amountBdt: fromPaisa(amountPaisa),
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
  amountBdt: number,
): PaymentVerificationResult {
  const amountPaisa = toPaisa(amountBdt);
  return {
    verified: true,
    transactionReference,
    orderId,
    amountPaisa,
    amountBdt: fromPaisa(amountPaisa),
    currency: "BDT",
    providerMessage: "স্যান্ডবক্স পেমেন্ট সফলভাবে যাচাই করা হয়েছে।",
  };
}
