import { describe, expect, it } from "vitest";
import {
  createSandboxPaymentSession,
  fromPaisa,
  toPaisa,
  verifySandboxPayment,
} from "@/lib/commerce/payments";

describe("Commerce Engine & Monetary Calculations", () => {
  it("converts BDT to paisa and back with integer precision", () => {
    expect(toPaisa(999)).toBe(99900);
    expect(toPaisa(4999.5)).toBe(499950);
    expect(fromPaisa(499950)).toBe(4999.5);
    expect(toPaisa(0)).toBe(0);
  });

  it("creates and verifies sandbox payment intent safely", async () => {
    const orderId = "ORD-TEST-001";
    const amount = 5000;
    const session = await createSandboxPaymentSession(orderId, amount);

    expect(session.orderId).toBe(orderId);
    expect(session.amountBdt).toBe(amount);
    expect(session.currency).toBe("BDT");
    expect(session.provider).toBe("SANDBOX");
    expect(session.status).toBe("INITIATED");

    const verification = verifySandboxPayment(
      session.transactionReference,
      orderId,
      amount
    );
    expect(verification.verified).toBe(true);
    expect(verification.transactionReference).toBe(session.transactionReference);
    expect(verification.amountBdt).toBe(5000);
  });
});
