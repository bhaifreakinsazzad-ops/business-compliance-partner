# Commerce Integrity & Idempotency Report — BCP V7.0

## 1. Integer Paisa Arithmetic & Client Bundle Safety

- All monetary computations execute in integer paisa (`BDT × 100`) with exact formatting (`formatBdtFromPaisa`) preserving non-zero paisa (e.g., `৳ 1,250.50`) rather than rounding silently.
- Schema additions (`prisma/schema.prisma`, `20261127000000_v7_executive_hardening/migration.sql`) add `*Paisa` integer fields, `currency`, `Order.idempotencyHash`, `Order.reservedUntil`, `Order.cancelledAt`, `Order.cancellationReason`, and `@unique Order.quoteId`.
- `node:crypto` was cleanly isolated out of `src/lib/commerce/payments.ts` into server-only `src/lib/commerce/checkout-rules.ts` so client components (`BookCheckoutPanel.tsx`, `BookCard.tsx`) bundle without Webpack `UnhandledSchemeError`.

## 2. Abuse & Concurrency Guards

1. **Duplicate Book Line-Item Merging (`normalizeAndValidateBookItems`)**:
   - Multiple lines referencing the same `bookId` are summed deterministically BEFORE enforcing `MAX_COPIES_PER_BOOK = 20` and `MAX_TOTAL_COPIES_PER_ORDER = 50`, blocking split-line cap bypass attempts (e.g. `12 + 12 = 24`).
2. **Idempotency Payload Hash Verification (`hashIdempotencyPayload`)**:
   - Book checkout and quote-to-order creation compute a canonical key-sorted SHA-256 digest (`idempotencyHash`) of the request payload. Reusing an idempotency key with altered quantities, shipping details, or quote IDs returns `409 IDEMPOTENCY_KEY_MISMATCH`.
   - `BookCheckoutPanel.tsx` generates a fresh `bko-<uuid>` key per checkout intent.
3. **Atomic Concurrency Guards**:
   - Quote acceptance (`/api/commerce/quotes` / order creation) uses conditional `updateMany` guards on valid status + expiration window, blocking double acceptance or expired quote redemption.
   - Sandbox payment verification (`/api/commerce/payments/sandbox`) enforces `isSandboxGatewayEnabled()` (`NODE_ENV !== "production"` AND `NEXT_PUBLIC_APP_ENV !== "production"` AND `SANDBOX_PAYMENTS_ENABLED === "true"`) and atomic `updateMany` payment status checks.
4. **Order Cancellation & Inventory Restoration (`/api/commerce/orders/[id]/cancel` & `/api/admin/orders/[id]`)**:
   - Transitioning an order to `CANCELLED` is validated against `ORDER_STATUS_TRANSITIONS`, increments book stock inside a single Prisma transaction, creates `BookInventoryMovement` (`ORDER_CANCELLED_RESTORE`), and voids open `DUE` invoices.

## 3. Verification Evidence

- `tests/unit/v7-hardening.test.ts` (**PASSED**), `tests/integration/v7-security-commerce.test.ts` (**PASSED**), `tests/integration/v6-security-commerce.test.ts` (**PASSED**).
