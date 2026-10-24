import { IJobHandler } from './job.types.js';
import { logger } from '#config/logger.config.js';

export class JobRegistry {
  private static handlers = new Map<string, IJobHandler<any, any>>();

  public static register<TPayload, TResult>(handler: IJobHandler<TPayload, TResult>): void {
    if (this.handlers.has(handler.name)) {
      logger.warn({ jobName: handler.name }, 'Overwriting existing job handler');
    }
    this.handlers.set(handler.name, handler);
    logger.debug({ jobName: handler.name }, 'Registered background job handler');
  }

  public static getHandler<TPayload, TResult>(jobName: string): IJobHandler<TPayload, TResult> | undefined {
    return this.handlers.get(jobName);
  }

  public static hasHandler(jobName: string): boolean {
    return this.handlers.has(jobName);
  }

  public static getRegisteredJobNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  public static clear(): void {
    this.handlers.clear();
  }
}
