import { Router } from 'express';
import { HealthController } from './health.controller.js';
import { asyncHandler } from '#shared/utils/async-handler.js';


const router = Router();

router.get('/healthz', asyncHandler(HealthController.getHealth));
router.get('/livez', asyncHandler(HealthController.getLiveness));
router.get('/readyz', asyncHandler(HealthController.getReadiness));

export default router;
