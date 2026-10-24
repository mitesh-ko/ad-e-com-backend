import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { corsOptions } from '#config/cors.config.js';
import { requestIdMiddleware } from '#middlewares/request-id.middleware.js';
import { requestLoggerMiddleware } from '#middlewares/request-logger.middleware.js';
import { apiRateLimiter } from '#middlewares/rate-limiter.middleware.js';
import { errorHandler } from '#middlewares/error.middleware.js';
import { NotFoundError } from '#errors/index.js';
import apiRouter from '#src/routes/index.js';
import healthRoutes from '#modules/health/health.route.js';
import { swaggerSpec } from '#src/docs/swagger.js';

export const createApp = (): Application => {
  const app = express();

  // 1. Trust Reverse Proxy (Cloudflare, AWS ALB, Nginx, Docker)
  app.set('trust proxy', 1);

  // 2. Security HTTP Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // 3. Cross-Origin Resource Sharing (CORS)
  app.use(cors(corsOptions));

  // 4. Request Correlation ID Tracking
  app.use(requestIdMiddleware);

  // 5. Structured HTTP Request Logging
  app.use(requestLoggerMiddleware);

  // 6. Body Parsers with Controlled Limits (prevents memory exhaustion DoS)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 7. Prevent HTTP Parameter Pollution attacks (?id=1&id=2)
  app.use(hpp());

  // 8. Prevent NoSQL Query Injection attacks ({ "$gt": "" })
  app.use(mongoSanitize());

  // 9. Static Assets (Public Uploads) with client-side caching
  app.use(
    '/uploads',
    express.static(path.resolve(process.cwd(), 'uploads'), {
      maxAge: '7d',
      immutable: true,
    })
  );

  // 10. API Throttling / Rate Limiting
  app.use('/api', apiRateLimiter);

  // 11. Interactive OpenAPI / Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Enterprise E-Commerce API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  // 12. Root-Level Health Checks (Kubernetes & Load Balancers)
  app.use('/', healthRoutes);

  // 13. Mount Modular API Routes (/api/v1/...)
  app.use('/api', apiRouter);

  // 14. 404 Handler for Unhandled Routes
  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // 15. Centralized Global Error Handler
  app.use(errorHandler);

  return app;
};
