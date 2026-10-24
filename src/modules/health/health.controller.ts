import { Request, Response } from 'express';
import { HealthService } from './health.service.js';
import { ApiResponse } from '#shared/utils/api-response.js';
import { HttpStatus } from '#constants/http-status.js';


export class HealthController {
  public static async getHealth(_req: Request, res: Response): Promise<void> {
    const health = await HealthService.getHealth();
    const statusCode = health.status === 'unhealthy' ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;
    ApiResponse.success(res, `System is ${health.status}`, health, statusCode);
  }

  public static async getLiveness(_req: Request, res: Response): Promise<void> {
    ApiResponse.success(res, 'Application process is alive', { status: 'alive' });
  }

  public static async getReadiness(_req: Request, res: Response): Promise<void> {
    const health = await HealthService.getHealth();
    if (health.status === 'unhealthy') {
      ApiResponse.error(res, 'System is not ready to receive traffic', HttpStatus.SERVICE_UNAVAILABLE, 'NOT_READY', health);
      return;
    }
    ApiResponse.success(res, 'System is ready to receive traffic', health);
  }
}
