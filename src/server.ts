import http from 'http';
import { createApp } from '#src/app.js';
import { env } from '#config/env.config.js';
import { Database } from '#config/database.config.js';
import { RedisManager } from '#config/redis.config.js';
import { logger } from '#config/logger.config.js';

import { JobWorker, JobDispatcher } from '#shared/jobs/index.js';

const startServer = async (): Promise<void> => {
  try {
    // 1. Initialize Database Connection
    await Database.connect();

    // 2. Initialize Redis (if enabled)
    await RedisManager.connect();

    // 3. Initialize Background Job Worker
    await JobWorker.start();

    // 4. Create Express App
    const app = createApp();
    const server = http.createServer(app);

    // 5. Start HTTP Server
    server.listen(env.PORT, env.HOST, () => {
      logger.info(
        {
          port: env.PORT,
          host: env.HOST,
          env: env.NODE_ENV,
          apiDocs: `http://localhost:${env.PORT}/api-docs`,
          health: `http://localhost:${env.PORT}/healthz`,
        },
        `🚀 ${env.APP_NAME} server started successfully`
      );
    });

    // 6. Graceful Shutdown Handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info({ signal }, 'Graceful shutdown initiated...');

      const forceShutdownTimer = setTimeout(() => {
        logger.error('Graceful shutdown timed out. Forcing process exit.');
        process.exit(1);
      }, 10000);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await JobWorker.stop();
          await JobDispatcher.close();
          await Database.disconnect();
          await RedisManager.disconnect();
          clearTimeout(forceShutdownTimer);
          logger.info('All resources cleaned up. Exiting cleanly.');
          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during resource teardown');
          clearTimeout(forceShutdownTimer);
          process.exit(1);
        }
      });
    };


    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 6. Global Unhandled Errors
    process.on('uncaughtException', (err: Error) => {
      logger.fatal({ err: { message: err.message, stack: err.stack } }, 'Uncaught Exception!');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.fatal({ reason }, 'Unhandled Promise Rejection!');
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
