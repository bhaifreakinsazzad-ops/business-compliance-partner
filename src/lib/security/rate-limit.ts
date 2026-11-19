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
