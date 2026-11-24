import {
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;
const SALT_BYTES = 16;

function deriveKey(password: string, saltHex: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, saltHex, SCRYPT_KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || plainPassword.length < 12) {
    throw new Error("Password must be at least 12 characters long.");
  }
  const saltHex = randomBytes(SALT_BYTES).toString("hex");
  const key = await deriveKey(plainPassword, saltHex);
  return `scrypt$${saltHex}$${key.toString("hex")}`;
}

export async function verifyPassword(
  plainPassword: string,
  storedHash: string,
): Promise<boolean> {
  if (!plainPassword || !storedHash) return false;
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }
  const [, saltHex, hashHex] = parts;
  if (!saltHex || !hashHex) return false;

  try {
    const derived = await deriveKey(plainPassword, saltHex);
    const expected = Buffer.from(hashHex, "hex");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function hashClientIp(ipAddress: string): string {
  const configuredSecret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!configuredSecret && process.env.NEXT_PUBLIC_APP_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET is required in production");
  }
  const secret = configuredSecret || "bcp-local-ip-salt";
  return createHash("sha256")
    .update(`${secret}:${ipAddress}`)
    .digest("hex")
    .slice(0, 32);
}
