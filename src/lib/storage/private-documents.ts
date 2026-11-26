import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_PRIVATE_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10MB

export type VerifiedDocumentMime =
  | "application/pdf"
  | "image/jpeg"
  | "image/png";

const EXTENSION_BY_MIME: Record<VerifiedDocumentMime, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/**
 * Verifies real binary file headers (magic bytes) independent of client-supplied
 * Content-Type or filename extension. Rejects empty or unrecognized files.
 */
export function verifyDocumentMagicBytes(
  buffer: Buffer,
  declaredMime?: string | null,
): VerifiedDocumentMime | null {
  if (!buffer || buffer.length < 8 || buffer.length > MAX_PRIVATE_DOCUMENT_BYTES) {
    return null;
  }

  let detected: VerifiedDocumentMime | null = null;

  // PDF: %PDF-
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    detected = "application/pdf";
  }
  // JPEG: FF D8 FF
  else if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    detected = "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  else if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    detected = "image/png";
  }

  if (!detected) return null;

  // If client declared a MIME type, require consistency (accept image/jpg alias)
  if (declaredMime) {
    const normalized = declaredMime.toLowerCase().trim();
    const compatDeclared =
      normalized === "image/jpg" ? "image/jpeg" : normalized;
    if (compatDeclared !== detected) {
      return null;
    }
  }

  return detected;
}

/**
 * Resolves the private storage base directory, strictly enforcing that it never
 * sits inside `/public`.
 */
export function resolvePrivateStorageBaseDir(): string {
  const configured = process.env.PRIVATE_STORAGE_DIR?.trim();
  const baseDir = configured
    ? path.resolve(configured)
    : path.resolve(process.cwd(), ".bcp-private-storage");

  const publicDir = path.resolve(process.cwd(), "public");
  if (
    baseDir === publicDir ||
    baseDir.startsWith(`${publicDir}${path.sep}`)
  ) {
    throw new Error(
      "SECURITY_ERROR: Private document storage directory cannot be inside /public.",
    );
  }
  return baseDir;
}

function sanitizeSegment(raw: string, maxLen = 48): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/^_+|_+$/g, "");
  return (cleaned || "doc").slice(0, maxLen);
}

/**
 * Resolves a storage key safely within the private storage base directory,
 * blocking path-traversal attempts.
 */
export function resolveSafeStoragePath(storageKey: string): string {
  const baseDir = resolvePrivateStorageBaseDir();
  if (
    !storageKey ||
    storageKey.includes("\0") ||
    path.isAbsolute(storageKey)
  ) {
    throw new Error("INVALID_STORAGE_KEY");
  }

  const targetPath = path.resolve(baseDir, storageKey);
  if (!targetPath.startsWith(`${baseDir}${path.sep}`)) {
    throw new Error("PATH_TRAVERSAL_BLOCKED");
  }
  return targetPath;
}

export async function savePrivateDocument(params: {
  customerId: string;
  publicReference: string;
  buffer: Buffer;
  verifiedMime: VerifiedDocumentMime;
}): Promise<{ fileKey: string; sizeBytes: number; sha256: string }> {
  const safeCustomerId = sanitizeSegment(params.customerId, 48);
  const safeRef = sanitizeSegment(params.publicReference, 48);
  const ext = EXTENSION_BY_MIME[params.verifiedMime];
  const fileKey = `customers/${safeCustomerId}/${safeRef}.${ext}`;

  const targetPath = resolveSafeStoragePath(fileKey);
  await mkdir(path.dirname(targetPath), { recursive: true, mode: 0o700 });
  await writeFile(targetPath, params.buffer, { mode: 0o600 });

  const sha256 = createHash("sha256").update(params.buffer).digest("hex");
  return {
    fileKey,
    sizeBytes: params.buffer.byteLength,
    sha256,
  };
}

export async function readPrivateDocument(fileKey: string): Promise<Buffer> {
  const targetPath = resolveSafeStoragePath(fileKey);
  return readFile(targetPath);
}

export async function deletePrivateDocument(fileKey: string): Promise<void> {
  try {
    const targetPath = resolveSafeStoragePath(fileKey);
    await unlink(targetPath);
  } catch {
    // Ignore missing/cleanup errors
  }
}
