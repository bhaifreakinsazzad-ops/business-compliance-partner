# Security & Durable Private Storage Audit — BCP V7.0

## 1. Private Document Storage Hardening (`src/lib/storage/private-documents.ts`)

- **Fail-Closed Production Guard:** `assertDurablePrivateStorageConfigured()` throws `StorageConfigurationError` (`503 STORAGE_NOT_CONFIGURED`) in `production` unless `PRIVATE_STORAGE_PROVIDER` is configured as `S3` or `SUPABASE` with all required credentials, or `ALLOW_EPHEMERAL_PRIVATE_STORAGE=true` is explicitly opted in.
- **Magic-Byte Validation:** `verifyDocumentMagicBytes()` inspects raw binary headers (`%PDF-`, `FF D8 FF`, `89 50 4E 47 0D 0A 1A 0A`) and rejects mismatched or spoofed MIME types and empty/oversized payloads (`> 10MB`).
- **Cryptographic Integrity:** SHA-256 digests (`computeBufferSha256`) are persisted on upload and verified upon retrieval; mismatches raise `StorageIntegrityError` (`422`).
- **Path Traversal & Header Injection Defense:**
  - `resolveSafeStoragePath()` rejects traversal attempts (`..`) and resolves canonical containment inside the configured private directory.
  - `buildSafeAttachmentContentDisposition()` strips quotes, CR/LF, and unsafe characters before constructing `attachment; filename="..."`.
- **Quarantine & Soft-Delete Workflow:** Quarantined files return `423` on download (`/api/documents/[ref]`); soft-delete and status review are tracked in `AuditLog`.

## 2. Least-Privilege RBAC (`src/lib/security/rbac.ts`)

| Permission | `ADMIN` | `LEAD_MANAGER` | `EDITOR` |
|---|---|---|---|
| `documents:review` | Yes | Yes | No |
| `documents:download` | Yes | No | No |
| `documents:admin` | Yes | No | No |
| `documents:delete` | Yes | No | No |
| `orders:manage` | Yes | Yes | No |
| `orders:cancel` | Yes | No | No |

## 3. Health Endpoint Information Redaction (`src/app/api/health/route.ts`)

- Unauthenticated `GET /api/health` responds strictly with `{ ok, status, timestamp }` (`200` when DB connected, `503` when degraded), preventing exposure of infrastructure topology, database latency, storage provider names, or sandbox flags.
- Full diagnostic payload (`environment`, `database`, `latencyMs`, `privateStorage`, `sandboxPaymentsEnabled`) is unlocked only via an authenticated `ADMIN` session or timing-safe `HEALTHCHECK_TOKEN` header (`Authorization: Bearer <token>` or `x-healthcheck-token`).

## 4. Verification Evidence

- `tests/unit/v7-hardening.test.ts` (**PASSED**): RBAC boundaries, production fail-closed storage, magic-byte inspection, SHA-256, path traversal rejection, CRLF-safe `Content-Disposition`.
- `tests/integration/v7-security-commerce.test.ts` (**PASSED**): `423` quarantine block, RBAC rejections (`403`), `/api/health` redaction vs token unlock.
- Live `curl http://localhost:3000/api/health`: returned `{"ok":false,"status":"degraded","timestamp":"..."}` (`503`) with zero leaked fields.
