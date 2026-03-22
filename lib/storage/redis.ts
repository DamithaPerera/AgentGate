import { Redis } from '@upstash/redis';

// Upstash Redis client (falls back to in-memory if not configured)
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redisClient;
}

// In-memory fallback store
const memoryStore = new Map<string, string>();
const memoryTTL = new Map<string, number>();

export const storage = {
  async get(key: string): Promise<string | null> {
    const redis = getRedis();
    if (redis) {
      const val = await redis.get<unknown>(key);
      if (val === null || val === undefined) return null;
      // Upstash auto-parses JSON — re-serialize if we got an object back
      return typeof val === 'string' ? val : JSON.stringify(val);
    }
    const ttl = memoryTTL.get(key);
    if (ttl && Date.now() > ttl) {
      memoryStore.delete(key);
      memoryTTL.delete(key);
      return null;
    }
    return memoryStore.get(key) ?? null;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const redis = getRedis();
    if (redis) {
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, value);
      } else {
        await redis.set(key, value);
      }
      return;
    }
    memoryStore.set(key, value);
    if (ttlSeconds) {
      memoryTTL.set(key, Date.now() + ttlSeconds * 1000);
    }
  },

  async del(key: string): Promise<void> {
    const redis = getRedis();
    if (redis) {
      await redis.del(key);
      return;
    }
    memoryStore.delete(key);
    memoryTTL.delete(key);
  },

  async keys(pattern: string): Promise<string[]> {
    const redis = getRedis();
    if (redis) {
      return redis.keys(pattern);
    }
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(memoryStore.keys()).filter(k => regex.test(k));
  },

  async incr(key: string): Promise<number> {
    const redis = getRedis();
    if (redis) {
      return redis.incr(key);
    }
    const current = parseInt(memoryStore.get(key) ?? '0', 10);
    const next = current + 1;
    memoryStore.set(key, String(next));
    return next;
  },

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const redis = getRedis();
    if (redis) {
      await redis.expire(key, ttlSeconds);
      return;
    }
    memoryTTL.set(key, Date.now() + ttlSeconds * 1000);
  },

  async lpush(key: string, value: string): Promise<void> {
    const redis = getRedis();
    if (redis) {
      await redis.lpush(key, value);
      return;
    }
    const current = memoryStore.get(key);
    const list: string[] = current ? JSON.parse(current) : [];
    list.unshift(value);
    memoryStore.set(key, JSON.stringify(list));
  },

  async lrange(key: string, start: number, end: number): Promise<string[]> {
    const redis = getRedis();
    if (redis) {
      const items = await redis.lrange<unknown>(key, start, end);
      return items.map(item => typeof item === 'string' ? item : JSON.stringify(item));
    }
    const current = memoryStore.get(key);
    if (!current) return [];
    const list: string[] = JSON.parse(current);
    const actualEnd = end === -1 ? list.length - 1 : end;
    return list.slice(start, actualEnd + 1);
  },
};
