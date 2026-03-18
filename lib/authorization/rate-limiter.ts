import { storage } from '@/lib/storage/redis';

const WINDOW_SECONDS = 60;

export async function getRequestCount(agentId: string): Promise<number> {
  const key = `rate:${agentId}:${Math.floor(Date.now() / (WINDOW_SECONDS * 1000))}`;
  const count = await storage.get(key);
  return count ? parseInt(count, 10) : 0;
}

export async function incrementRequestCount(agentId: string): Promise<number> {
  const key = `rate:${agentId}:${Math.floor(Date.now() / (WINDOW_SECONDS * 1000))}`;
  const count = await storage.incr(key);
  if (count === 1) {
    await storage.expire(key, WINDOW_SECONDS * 2);
  }
  return count;
}
