import { Router } from 'express';
import authRoutes from '#modules/auth/auth.route.js';
import userRoutes from '#modules/user/user.route.js';
import healthRoutes from '#modules/health/health.route.js';
import jobRoutes from '#modules/job/job.route.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);


export default router;
