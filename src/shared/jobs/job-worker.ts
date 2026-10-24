import { Worker, Job } from 'bullmq';
import { JobRegistry } from './job-registry.js';
import { RedisManager } from '#config/redis.config.js';
import { logger } from '#config/logger.config.js';

export class JobWorker {
  private static defaultQueueName = 'app-tasks';
  private static worker: Worker | null = null;

  public static async start(): Promise<void> {
    if (!RedisManager.isRedisEnabled()) {
      logger.info('Redis is disabled: Background jobs running in asynchronous in-memory mode');
      return;
    }

    if (this.worker) {
      return;
    }

    try {
      const connection = RedisManager.getConnectionOptions();

      this.worker = new Worker(
        this.defaultQueueName,
        async (job: Job) => {
          const handler = JobRegistry.getHandler(job.name);
          if (!handler) {
            throw new Error(`No registered handler found for job '${job.name}'`);
          }

          return handler.handle(job.data, {
            id: job.id!,
            name: job.name,
            attemptsMade: job.attemptsMade,
            updateProgress: async (percentage: number) => {
              await job.updateProgress(percentage);
            },
          });
        },
        {
          connection,
          concurrency: 5, // Process up to 5 background jobs concurrently
        }
      );

      this.worker.on('completed', (job: Job) => {
        logger.info(
          { jobId: job.id, jobName: job.name, attempts: job.attemptsMade },
          '✅ [BullMQ Worker] Job completed successfully'
        );
      });

      this.worker.on('failed', (job: Job | undefined, err: Error) => {
        logger.error(
          { jobId: job?.id, jobName: job?.name, error: err.message, attempts: job?.attemptsMade },
          '❌ [BullMQ Worker] Job failed'
        );
      });

      this.worker.on('error', (err: Error) => {
        logger.warn({ error: err.message }, '⚠️ [BullMQ Worker] Worker connection warning');
      });

      logger.info({ queue: this.defaultQueueName, concurrency: 5 }, '🚀 BullMQ Worker started successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to start BullMQ worker');
      this.worker = null;
    }
  }

  public static async stop(): Promise<void> {
    if (this.worker) {
      logger.info('Stopping BullMQ worker gracefully...');
      await this.worker.close();
      this.worker = null;
      logger.info('BullMQ worker stopped');
    }
  }
}
