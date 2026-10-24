export type JobState = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown';

export interface JobOptions {
  /** Delay in milliseconds before job is processed */
  delay?: number;
  /** Number of retry attempts on failure (default: 3) */
  attempts?: number;
  /** Backoff configuration on retry */
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  } | number;
  /** Priority of job (lower number = higher priority) */
  priority?: number;
  /** Custom unique ID for job */
  jobId?: string;
  /** Remove job on complete after N entries or true */
  removeOnComplete?: boolean | number;
  /** Remove job on fail after N entries or true */
  removeOnFail?: boolean | number;
}

export interface JobStatus<TResult = unknown> {
  id: string;
  name: string;
  state: JobState;
  progress: number;
  data: unknown;
  returnValue?: TResult;
  failedReason?: string;
  attemptsMade: number;
  createdAt: number;
  processedAt?: number;
  finishedAt?: number;
}

export interface JobContext {
  id: string;
  name: string;
  attemptsMade: number;
  updateProgress: (percentage: number) => Promise<void>;
}

export interface IJobHandler<TPayload = unknown, TResult = unknown> {
  name: string;
  handle(payload: TPayload, context: JobContext): Promise<TResult>;
}
