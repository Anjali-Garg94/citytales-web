/**
 * In-memory fixed-window rate limiter.
 *
 * There's no Redis/shared store in this deployment, so this is per-process —
 * fine for a single Next.js server instance, and mainly here to stop a phone
 * number (or an IP) from hammering /auth/sendOtp, not to be a hardened
 * defense. Keyed by whatever the caller passes (phone, or IP, or both joined).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Periodic cleanup so the Map doesn't grow forever across a long-lived server. */
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets, only meaningful when !allowed. */
  retryAfterSeconds?: number;
};

/**
 * @param key identifies who/what is being limited, e.g. `otp:${phone}`
 * @param limit max requests allowed per window
 * @param windowMs window size in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true };
}
