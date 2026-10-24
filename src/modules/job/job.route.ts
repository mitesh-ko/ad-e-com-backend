import { Router } from 'express';
import { JobController } from './job.controller.js';
import { asyncHandler } from '#shared/utils/async-handler.js';
import { authenticate } from '#middlewares/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: Track background job execution status
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status details
 *       404:
 *         description: Job not found
 */
router.get('/:id', authenticate, asyncHandler(JobController.getStatus));

export default router;
