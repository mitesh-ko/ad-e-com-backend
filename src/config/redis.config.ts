import { Redis } from 'ioredis';
import { env } from './env.config.js';
import { logger } from './logger.config.js';

export class RedisManager {
  private static client: Redis | null = null;
  private static isConnected = false;

  public static getClient(): Redis | null {
    if (!env.REDIS_ENABLED) {
      return null;
    }

    if (!this.client) {
      try {
        const client = new Redis({
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          password: env.REDIS_PASSWORD || undefined,
          db: env.REDIS_DB,
          lazyConnect: true,
          retryStrategy(times: number) {
            const delay = Math.min(times * 200, 3000);
            return delay;
          },
          maxRetriesPerRequest: 3,
        });

        client.on('connect', () => {
          logger.info('Redis connected successfully');
          RedisManager.isConnected = true;
        });

        client.on('error', (err: Error) => {
          logger.warn({ err: err.message }, 'Redis connection warning/error');
          RedisManager.isConnected = false;
        });

        client.on('close', () => {
          RedisManager.isConnected = false;
        });

        this.client = client;
      } catch (err) {
        logger.error({ err }, 'Failed to initialize Redis client');
        this.client = null;
      }
    }

    return this.client;
  }

  public static async connect(): Promise<void> {
    if (!env.REDIS_ENABLED) {
      logger.info('Redis is disabled by configuration');
      return;
    }

    const client = this.getClient();
    if (client) {
      try {
        await client.connect();
      } catch (error) {
        logger.warn({ err: error }, 'Redis connect failed, continuing without cache');
      }
    }
  }

  public static async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis client disconnected gracefully');
      } catch (error) {
        logger.error({ error }, 'Error while disconnecting Redis client');
      }
    }
  }

  public static isRedisEnabled(): boolean {
    return env.REDIS_ENABLED;
  }

  public static async isHealthy(): Promise<boolean> {
    if (!env.REDIS_ENABLED) return true; // consider healthy if disabled intentionally
    if (!this.client || !this.isConnected) return false;
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  public static getConnectionOptions() {
    return {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      maxRetriesPerRequest: null,
    };
  }
}


