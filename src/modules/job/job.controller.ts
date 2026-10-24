import { Request, Response } from 'express';
import { JobDispatcher } from '#shared/jobs/index.js';
import { ApiResponse } from '#shared/utils/api-response.js';
import { NotFoundError } from '#errors/index.js';

export class JobController {
  public static async getStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const status = await JobDispatcher.getStatus(id);

    if (!status) {
      throw new NotFoundError(`Background job with ID '${id}' was not found`);
    }

    ApiResponse.success(res, 'Job status retrieved successfully', status);
  }
}
