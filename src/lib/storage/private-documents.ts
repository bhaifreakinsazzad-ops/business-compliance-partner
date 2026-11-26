import { createHash, createHmac } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_PRIVATE_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10MB

export type VerifiedDocumentMime =
  | "application/pdf"
  | "image/jpeg"
  | "image/png";

export type PrivateStorageProviderKind = "LOCAL" | "S3" | "SUPABASE";

const EXTENSION_BY_MIME: Record<VerifiedDocumentMime, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export class StorageConfigurationError extends Error {
  public readonly statusCode = 503;
  public readonly code = "STORAGE_NOT_CONFIGURED";
  constructor(
    message = "Private document storage is not durably configured for this environment.",
  ) {
    super(message);
    this.name = "StorageConfigurationError";
  }
}

export class StorageIntegrityError extends Error {
  public readonly statusCode = 422;
  public readonly code = "STORAGE_CHECKSUM_MISMATCH";
  constructor(message = "Stored file checksum verification failed.") {
    super(message);
    this.name = "StorageIntegrityError";
  }
}

export function computeBufferSha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

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

export function resolvePrivateStorageProviderKind(): PrivateStorageProviderKind {
  const raw = (process.env.PRIVATE_STORAGE_PROVIDER ?? "local")
    .trim()
    .toUpperCase();
  if (raw === "S3") return "S3";
  if (raw === "SUPABASE") return "SUPABASE";
  return "LOCAL";
}

export function isEphemeralStorageExplicitlyAllowed(): boolean {
  return process.env.ALLOW_EPHEMERAL_PRIVATE_STORAGE?.trim() === "true";
}

export function assertDurablePrivateStorageConfigured(): {
  provider: PrivateStorageProviderKind;
  bucket: string | null;
} {
  const provider = resolvePrivateStorageProviderKind();
  const isProdRuntime =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase() === "production";

  if (provider === "LOCAL") {
    if (isProdRuntime && !isEphemeralStorageExplicitlyAllowed()) {
      throw new StorageConfigurationError(
        "নথি সংরক্ষণের জন্য প্রোডাকশন পরিবেশে স্থায়ী প্রাইভেট অবজেক্ট স্টোরেজ (S3/Supabase) কনফিগার করা বাধ্যতামূলক।",
      );
    }
    return { provider: "LOCAL", bucket: null };
  }

  const bucket = process.env.PRIVATE_STORAGE_BUCKET?.trim() || null;
  const endpoint = process.env.PRIVATE_STORAGE_ENDPOINT?.trim() || null;

  if (provider === "SUPABASE") {
    const key = process.env.PRIVATE_STORAGE_SECRET_KEY?.trim();
    if (!bucket || !endpoint || !key) {
      throw new StorageConfigurationError(
        "Supabase প্রাইভেট স্টোরেজের বাকেট, এন্ডপয়েন্ট বা সার্ভিস কী কনফিগার করা নেই।",
      );
    }
    return { provider: "SUPABASE", bucket };
  }

  // S3-compatible
  const accessKey = process.env.PRIVATE_STORAGE_ACCESS_KEY?.trim();
  const secretKey = process.env.PRIVATE_STORAGE_SECRET_KEY?.trim();
  if (!bucket || !endpoint || !accessKey || !secretKey) {
    throw new StorageConfigurationError(
      "S3 প্রাইভেট স্টোরেজের বাকেট, এন্ডপয়েন্ট বা ক্রেডেনশিয়াল কনফিগার করা নেই।",
    );
  }
  return { provider: "S3", bucket };
}

/**
 * Resolves the private storage base directory for local dev/test mode,
 * strictly enforcing that it never sits inside `/public`.
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

export function sanitizeDownloadFilename(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "document.bin";
}

export function buildSafeAttachmentContentDisposition(
  publicReference: string,
  mimeType: string | null,
): string {
  const ext =
    mimeType === "application/pdf"
      ? "pdf"
      : mimeType === "image/png"
        ? "png"
        : mimeType === "image/jpeg"
          ? "jpg"
          : "bin";
  const safeName = sanitizeDownloadFilename(`${publicReference}.${ext}`);
  return `attachment; filename="${safeName}"`;
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function signS3Request(params: {
  method: "PUT" | "GET" | "DELETE";
  bucket: string;
  key: string;
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  payloadHash: string;
  contentType?: string;
}): { url: string; headers: Record<string, string> } {
  const endpointUrl = new URL(params.endpoint);
  const encodedKey = params.key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const basePath = endpointUrl.pathname.replace(/\/+$/, "");
  const canonicalUri = `${basePath}/${encodeURIComponent(params.bucket)}/${encodedKey}`;
  const fullUrl = `${endpointUrl.origin}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const service = "s3";
  const credentialScope = `${dateStamp}/${params.region}/${service}/aws4_request`;

  const signedHeaderMap: Record<string, string> = {
    host: endpointUrl.host,
    "x-amz-content-sha256": params.payloadHash,
    "x-amz-date": amzDate,
  };
  if (params.contentType) {
    signedHeaderMap["content-type"] = params.contentType;
  }

  const sortedHeaderKeys = Object.keys(signedHeaderMap).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((k) => `${k}:${signedHeaderMap[k]}\n`)
    .join("");
  const signedHeaders = sortedHeaderKeys.join(";");

  const canonicalRequest = [
    params.method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    params.payloadHash,
  ].join("\n");

  const canonicalRequestHash = createHash("sha256")
    .update(canonicalRequest)
    .digest("hex");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join("\n");

  const kDate = hmacSha256(`AWS4${params.secretKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, params.region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning)
    .update(stringToSign)
    .digest("hex");

  return {
    url: fullUrl,
    headers: {
      ...signedHeaderMap,
      Authorization: `AWS4-HMAC-SHA256 Credential=${params.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  };
}

export async function savePrivateDocument(params: {
  customerId: string;
  publicReference: string;
  buffer: Buffer;
  verifiedMime: VerifiedDocumentMime;
}): Promise<{
  fileKey: string;
  sizeBytes: number;
  sha256: string;
  storageProvider: PrivateStorageProviderKind;
  storageBucket: string | null;
}> {
  const { provider, bucket } = assertDurablePrivateStorageConfigured();
  const safeCustomerId = sanitizeSegment(params.customerId, 48);
  const safeRef = sanitizeSegment(params.publicReference, 48);
  const ext = EXTENSION_BY_MIME[params.verifiedMime];
  const fileKey = `customers/${safeCustomerId}/${safeRef}.${ext}`;
  const sha256 = computeBufferSha256(params.buffer);

  if (provider === "LOCAL") {
    const targetPath = resolveSafeStoragePath(fileKey);
    await mkdir(path.dirname(targetPath), { recursive: true, mode: 0o700 });
    await writeFile(targetPath, params.buffer, { mode: 0o600 });
  } else if (provider === "SUPABASE") {
    const endpoint = process.env.PRIVATE_STORAGE_ENDPOINT!.replace(/\/+$/, "");
    const serviceKey = process.env.PRIVATE_STORAGE_SECRET_KEY!;
    const encodedKey = fileKey.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(
      `${endpoint}/storage/v1/object/${encodeURIComponent(bucket!)}/${encodedKey}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          "Content-Type": params.verifiedMime,
          "x-upsert": "true",
        },
        body: new Uint8Array(params.buffer),
      },
    );
    if (!res.ok) {
      throw new Error(`SUPABASE_STORAGE_UPLOAD_FAILED_${res.status}`);
    }
  } else {
    const signed = signS3Request({
      method: "PUT",
      bucket: bucket!,
      key: fileKey,
      endpoint: process.env.PRIVATE_STORAGE_ENDPOINT!,
      region: process.env.PRIVATE_STORAGE_REGION?.trim() || "us-east-1",
      accessKey: process.env.PRIVATE_STORAGE_ACCESS_KEY!,
      secretKey: process.env.PRIVATE_STORAGE_SECRET_KEY!,
      payloadHash: sha256,
      contentType: params.verifiedMime,
    });
    const res = await fetch(signed.url, {
      method: "PUT",
      headers: signed.headers,
      body: new Uint8Array(params.buffer),
    });
    if (!res.ok) {
      throw new Error(`S3_STORAGE_UPLOAD_FAILED_${res.status}`);
    }
  }

  return {
    fileKey,
    sizeBytes: params.buffer.byteLength,
    sha256,
    storageProvider: provider,
    storageBucket: bucket,
  };
}

export async function readPrivateDocument(
  fileKey: string,
  options?: {
    storageProvider?: string | null;
    storageBucket?: string | null;
    expectedSha256?: string | null;
  },
): Promise<Buffer> {
  const provider =
    (options?.storageProvider?.toUpperCase() as PrivateStorageProviderKind) ||
    resolvePrivateStorageProviderKind();

  let buffer: Buffer;

  if (provider === "LOCAL") {
    const targetPath = resolveSafeStoragePath(fileKey);
    buffer = await readFile(targetPath);
  } else if (provider === "SUPABASE") {
    const bucket =
      options?.storageBucket || process.env.PRIVATE_STORAGE_BUCKET?.trim();
    const endpoint = process.env.PRIVATE_STORAGE_ENDPOINT?.replace(/\/+$/, "");
    const serviceKey = process.env.PRIVATE_STORAGE_SECRET_KEY?.trim();
    if (!bucket || !endpoint || !serviceKey) {
      throw new StorageConfigurationError();
    }
    const encodedKey = fileKey.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(
      `${endpoint}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedKey}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
      },
    );
    if (!res.ok) {
      throw new Error(`SUPABASE_STORAGE_READ_FAILED_${res.status}`);
    }
    buffer = Buffer.from(await res.arrayBuffer());
  } else {
    const bucket =
      options?.storageBucket || process.env.PRIVATE_STORAGE_BUCKET?.trim();
    const endpoint = process.env.PRIVATE_STORAGE_ENDPOINT?.trim();
    const accessKey = process.env.PRIVATE_STORAGE_ACCESS_KEY?.trim();
    const secretKey = process.env.PRIVATE_STORAGE_SECRET_KEY?.trim();
    if (!bucket || !endpoint || !accessKey || !secretKey) {
      throw new StorageConfigurationError();
    }
    const emptySha = createHash("sha256").update("").digest("hex");
    const signed = signS3Request({
      method: "GET",
      bucket,
      key: fileKey,
      endpoint,
      region: process.env.PRIVATE_STORAGE_REGION?.trim() || "us-east-1",
      accessKey,
      secretKey,
      payloadHash: emptySha,
    });
    const res = await fetch(signed.url, {
      method: "GET",
      headers: signed.headers,
    });
    if (!res.ok) {
      throw new Error(`S3_STORAGE_READ_FAILED_${res.status}`);
    }
    buffer = Buffer.from(await res.arrayBuffer());
  }

  if (options?.expectedSha256) {
    const actualSha = computeBufferSha256(buffer);
    if (actualSha !== options.expectedSha256) {
      throw new StorageIntegrityError();
    }
  }

  return buffer;
}

export async function deletePrivateDocument(
  fileKey: string,
  options?: {
    storageProvider?: string | null;
    storageBucket?: string | null;
  },
): Promise<void> {
  const provider =
    (options?.storageProvider?.toUpperCase() as PrivateStorageProviderKind) ||
    resolvePrivateStorageProviderKind();

  try {
    if (provider === "LOCAL") {
      const targetPath = resolveSafeStoragePath(fileKey);
      await unlink(targetPath);
    } else if (provider === "SUPABASE") {
      const bucket =
        options?.storageBucket || process.env.PRIVATE_STORAGE_BUCKET?.trim();
      const endpoint = process.env.PRIVATE_STORAGE_ENDPOINT?.replace(/\/+$/, "");
      const serviceKey = process.env.PRIVATE_STORAGE_SECRET_KEY?.trim();
      if (!bucket || !endpoint || !serviceKey) return;
      const encodedKey = fileKey.split("/").map(encodeURIComponent).join("/");
      await fetch(
        `${endpoint}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedKey}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            apikey: serviceKey,
          },
        },
      );
    } else {
      const bucket =
        options?.storageBucket || process.env.PRIVATE_STORAGE_BUCKET?.trim();
      const endpoint = process.env.PRIVATE_STORAGE_ENDPOINT?.trim();
      const accessKey = process.env.PRIVATE_STORAGE_ACCESS_KEY?.trim();
      const secretKey = process.env.PRIVATE_STORAGE_SECRET_KEY?.trim();
      if (!bucket || !endpoint || !accessKey || !secretKey) return;
      const emptySha = createHash("sha256").update("").digest("hex");
      const signed = signS3Request({
        method: "DELETE",
        bucket,
        key: fileKey,
        endpoint,
        region: process.env.PRIVATE_STORAGE_REGION?.trim() || "us-east-1",
        accessKey,
        secretKey,
        payloadHash: emptySha,
      });
      await fetch(signed.url, { method: "DELETE", headers: signed.headers });
    }
  } catch {
    // Ignore missing/cleanup errors
  }
}
