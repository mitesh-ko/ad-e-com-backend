import { Router } from 'express';
import v1Routes from '#src/routes/v1.routes.js';
import healthRoutes from '#modules/health/health.route.js';

const router = Router();

// Version 1 API routes (/api/v1/...)
router.use('/v1', v1Routes);

// General health check on /api/healthz as well
router.use('/', healthRoutes);

export default router;
