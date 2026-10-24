import { IJobHandler, JobContext } from '../job.types.js';
import { logger } from '#config/logger.config.js';

export interface SendWelcomeEmailPayload {
  to: string;
  name: string;
  userId: string;
}

export interface SendPasswordResetPayload {
  to: string;
  name: string;
  resetToken: string;
}

export class WelcomeEmailHandler implements IJobHandler<SendWelcomeEmailPayload, { messageId: string }> {
  public readonly name = 'email:send-welcome';

  public async handle(payload: SendWelcomeEmailPayload, context: JobContext): Promise<{ messageId: string }> {
    logger.info(
      { jobId: context.id, to: payload.to, userId: payload.userId },
      '📧 [Worker] Processing welcome email job...'
    );

    await context.updateProgress(25);

    // In production, integrate with nodemailer, SendGrid, Resend, AWS SES, etc.
    // Simulating email dispatch processing:
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await context.updateProgress(100);

    logger.info(
      { jobId: context.id, to: payload.to, messageId },
      '✅ [Worker] Welcome email dispatched successfully'
    );

    return { messageId };
  }
}

export class PasswordResetEmailHandler implements IJobHandler<SendPasswordResetPayload, { messageId: string }> {
  public readonly name = 'email:send-password-reset';

  public async handle(payload: SendPasswordResetPayload, context: JobContext): Promise<{ messageId: string }> {
    logger.info(
      { jobId: context.id, to: payload.to },
      '📧 [Worker] Processing password reset email job...'
    );

    await context.updateProgress(50);

    const messageId = `reset_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await context.updateProgress(100);

    logger.info(
      { jobId: context.id, to: payload.to, messageId },
      '✅ [Worker] Password reset email dispatched successfully'
    );

    return { messageId };
  }
}
