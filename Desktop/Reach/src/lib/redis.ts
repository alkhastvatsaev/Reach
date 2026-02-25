import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("Upstash Redis credentials missing. Caching is disabled.")
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

/**
 * Cache helper to avoid redundant API calls
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  try {
    return await redis.get<T>(key);
  } catch (e) {
    console.error("Redis Get Error:", e);
    return null;
  }
}

export async function setCachedData(key: string, value: any, expireInSeconds = 86400) {
  if (!process.env.UPSTASH_REDIS_REST_URL) return;
  try {
    await redis.set(key, value, { ex: expireInSeconds });
  } catch (e) {
    console.error("Redis Set Error:", e);
  }
}
