import { redis } from "@/lib/redis/redis";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
};

function getRateLimitKey(key: string) {
  return `rate-limit:${key}`;
}

export const rateLimitService = {
  async check(options: RateLimitOptions): Promise<RateLimitResult> {
    const redisKey = getRateLimitKey(options.key);

    const currentCount = await redis.incr(redisKey);

    if (currentCount === 1) {
      await redis.expire(redisKey, options.windowSeconds);
    }

    const ttl = await redis.ttl(redisKey);

    const allowed = currentCount <= options.limit;

    return {
      allowed,
      limit: options.limit,
      remaining: Math.max(options.limit - currentCount, 0),
      resetInSeconds: ttl,
    };
  },

  async reset(key: string) {
    const redisKey = getRateLimitKey(key);
    await redis.del(redisKey);
  },
};