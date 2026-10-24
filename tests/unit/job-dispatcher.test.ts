import { describe, it, expect } from 'vitest';
import { JobDispatcher, JobRegistry, IJobHandler } from '#shared/jobs/index.js';


describe('JobDispatcher & Background Task System (Unit Tests)', () => {
  it('should successfully dispatch a job and process it asynchronously in the background', async () => {
    let processed = false;
    let receivedPayload: any = null;

    const mockHandler: IJobHandler<{ to: string }> = {
      name: 'test:async-task',
      handle: async (payload, context) => {
        receivedPayload = payload;
        await context.updateProgress(50);
        processed = true;
        return { status: 'ok' };
      },
    };

    JobRegistry.register(mockHandler);

    const jobId = await JobDispatcher.dispatch('test:async-task', { to: 'user@example.com' });

    expect(jobId).toBeDefined();
    expect(typeof jobId).toBe('string');

    // Allow event loop tick for async worker
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(processed).toBe(true);
    expect(receivedPayload).toEqual({ to: 'user@example.com' });

    const status = await JobDispatcher.getStatus(jobId);
    expect(status).not.toBeNull();
    expect(status?.state).toBe('completed');
    expect(status?.progress).toBe(100);
    expect(status?.returnValue).toEqual({ status: 'ok' });
  });

  it('should record failure state when job handler throws an error', async () => {
    const failingHandler: IJobHandler<any> = {
      name: 'test:failing-task',
      handle: async () => {
        throw new Error('Simulated SMTP connection failure');
      },
    };

    JobRegistry.register(failingHandler);

    const jobId = await JobDispatcher.dispatch('test:failing-task', { attempt: 1 });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const status = await JobDispatcher.getStatus(jobId);
    expect(status?.state).toBe('failed');
    expect(status?.failedReason).toBe('Simulated SMTP connection failure');
  });

  it('should mark job as failed if no handler is registered', async () => {
    const jobId = await JobDispatcher.dispatch('unregistered:random-job', {});

    await new Promise((resolve) => setTimeout(resolve, 50));

    const status = await JobDispatcher.getStatus(jobId);
    expect(status?.state).toBe('failed');
    expect(status?.failedReason).toContain('No handler registered');
  });
});
