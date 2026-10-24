import { RedisManager } from '#config/redis.config.js';
import { env } from '#config/env.config.js';
import { logger } from '#config/logger.config.js';


export class CacheService {
  private static get client() {
    return RedisManager.getClient();
  }

  public static async get<T>(key: string): Promise<T | null> {
    const client = this.client;
    if (!client) return null;

    try {
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.warn({ error, key }, 'Cache get failed, continuing without cache');
      return null;
    }
  }

  public static async set(key: string, value: unknown, ttlSeconds = env.REDIS_TTL_SECONDS): Promise<void> {
    const client = this.client;
    if (!client) return;

    try {
      const serialized = JSON.stringify(value);
      await client.set(key, serialized, 'EX', ttlSeconds);
    } catch (error) {
      logger.warn({ error, key }, 'Cache set failed');
    }
  }

  public static async del(key: string): Promise<void> {
    const client = this.client;
    if (!client) return;

    try {
      await client.del(key);
    } catch (error) {
      logger.warn({ error, key }, 'Cache delete failed');
    }
  }

  public static async delByPattern(pattern: string): Promise<void> {
    const client = this.client;
    if (!client) return;

    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      logger.warn({ error, pattern }, 'Cache delete by pattern failed');
    }
  }

  public static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = env.REDIS_TTL_SECONDS
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetchFn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}
