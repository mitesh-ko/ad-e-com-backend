import mongoose from 'mongoose';
import { env } from './env.config.js';
import { logger } from './logger.config.js';

export class Database {
  private static isConnected = false;
  private static reconnectTimer: NodeJS.Timeout | null = null;
  private static listenersRegistered = false;

  private static setupEventListeners(): void {
    if (this.listenersRegistered) return;

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
      this.isConnected = true;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err: err.message }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      this.isConnected = false;
      this.scheduleReconnect();
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.isConnected = true;
    });

    this.listenersRegistered = true;
  }

  private static scheduleReconnect(): void {
    if (this.reconnectTimer || this.isConnected) return;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.isConnected) return;
      try {
        await mongoose.connect(env.MONGO_URI, {
          maxPoolSize: env.MONGO_MAX_POOL_SIZE,
          minPoolSize: env.MONGO_MIN_POOL_SIZE,
          serverSelectionTimeoutMS: 3000,
          socketTimeoutMS: 45000,
          autoIndex: false,
        });
        this.isConnected = true;
        logger.info('MongoDB connected successfully on background retry');
      } catch {
        this.scheduleReconnect();
      }
    }, 5000);
  }

  public static async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('MongoDB is already connected');
      return;
    }

    this.setupEventListeners();

    try {
      await mongoose.connect(env.MONGO_URI, {
        maxPoolSize: env.MONGO_MAX_POOL_SIZE,
        minPoolSize: env.MONGO_MIN_POOL_SIZE,
        serverSelectionTimeoutMS: 4000,
        socketTimeoutMS: 45000,
        autoIndex: env.NODE_ENV !== 'production',
      });

      this.isConnected = true;
    } catch (error) {
      const errMsg = (error as Error).message;
      logger.warn(
        { err: errMsg },
        'Initial MongoDB connection failed. Ensure MongoDB is running (e.g. `docker compose up -d mongo`). Retrying in background...'
      );

      if (env.NODE_ENV === 'production') {
        throw error;
      }

      // Schedule background reconnection in dev/test
      this.scheduleReconnect();
    }
  }

  public static async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (!this.isConnected && mongoose.connection.readyState === 0) return;

    try {
      await mongoose.connection.close(false);
      this.isConnected = false;
      logger.info('MongoDB connection closed gracefully');
    } catch (error) {
      logger.error({ error }, 'Error while closing MongoDB connection');
    }
  }

  public static async isHealthy(): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 1) return false;
      const adminDb = mongoose.connection.db?.admin();
      if (!adminDb) return false;
      const ping = await adminDb.ping();
      return !!ping?.ok;
    } catch {
      return false;
    }
  }
}
