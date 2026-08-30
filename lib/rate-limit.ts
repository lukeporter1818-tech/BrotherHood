type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export type RateLimitBucket = "post" | "goose";

const LIMITS: Record<RateLimitBucket, { max: number; windowMs: number }> = {
  post: { max: 10, windowMs: 60_000 },
  goose: { max: 20, windowMs: 60_000 },
};

export function checkRateLimit(
  userId: string,
  bucket: RateLimitBucket,
): { allowed: boolean } {
  const key = `${userId}:${bucket}`;
  const now = Date.now();
  const limit = LIMITS[bucket];
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + limit.windowMs });
    return { allowed: true };
  }
  if (entry.count >= limit.max) {
    return { allowed: false };
  }
  entry.count++;
  return { allowed: true };
}
