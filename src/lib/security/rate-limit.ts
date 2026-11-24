export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAtMs: number;
}

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult> | RateLimitResult;
}

/**
 * Bounded sliding-window in-memory rate limiter for single-instance runtimes
 * and unit tests. Swap cleanly via the RateLimiter interface for Redis/Upstash
 * in multi-region serverless production.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly maxBuckets: number;

  constructor(options: {
    maxRequests: number;
    windowMs: number;
    maxBuckets?: number;
  }) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
    this.maxBuckets = options.maxBuckets ?? 5000;
  }

  check(key: string, nowMs = Date.now()): RateLimitResult {
    const windowStart = nowMs - this.windowMs;
    const existing = this.buckets.get(key) ?? [];
    const active = existing.filter((ts) => ts > windowStart);

    if (active.length >= this.maxRequests) {
      const oldestInWindow = active[0] ?? nowMs;
      this.buckets.set(key, active);
      return {
        allowed: false,
        remaining: 0,
        resetAtMs: oldestInWindow + this.windowMs,
      };
    }

    active.push(nowMs);
    this.buckets.set(key, active);

    // Opportunistic sweep when map grows large.
    if (this.buckets.size > this.maxBuckets) {
      for (const [bucketKey, timestamps] of this.buckets.entries()) {
        if (timestamps.every((ts) => ts <= windowStart)) {
          this.buckets.delete(bucketKey);
        }
      }
    }

    return {
      allowed: true,
      remaining: Math.max(0, this.maxRequests - active.length),
      resetAtMs: nowMs + this.windowMs,
    };
  }
}

class FailClosedRateLimiter implements RateLimiter {
  constructor(private readonly windowMs: number) {}

  check(): RateLimitResult {
    return { allowed: false, remaining: 0, resetAtMs: Date.now() + this.windowMs };
  }
}

/** Atomic fixed-window limiter over Upstash Redis REST. Credentials remain server-only. */
export class UpstashRateLimiter implements RateLimiter {
  constructor(
    private readonly options: {
      url: string;
      token: string;
      maxRequests: number;
      windowMs: number;
      namespace: string;
    },
  ) {}

  async check(key: string): Promise<RateLimitResult> {
    const redisKey = `${this.options.namespace}:${key}`;
    const script =
      "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; local ttl=redis.call('PTTL',KEYS[1]); return {n,ttl}";
    const response = await fetch(this.options.url.replace(/\/+$/, ""), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        script,
        "1",
        redisKey,
        String(this.options.windowMs),
      ]),
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Distributed rate limiter unavailable");
    const payload = (await response.json()) as { result?: [number, number] };
    const count = Number(payload.result?.[0]);
    const ttl = Number(payload.result?.[1]);
    if (!Number.isFinite(count) || !Number.isFinite(ttl)) {
      throw new Error("Invalid distributed rate limiter response");
    }

    return {
      allowed: count <= this.options.maxRequests,
      remaining: Math.max(0, this.options.maxRequests - count),
      resetAtMs: Date.now() + Math.max(0, ttl),
    };
  }
}

export function createRateLimiter(options: {
  maxRequests: number;
  windowMs: number;
  namespace: string;
}): RateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) {
    return new UpstashRateLimiter({ ...options, url, token });
  }

  if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
    return new FailClosedRateLimiter(options.windowMs);
  }

  return new InMemoryRateLimiter(options);
}
