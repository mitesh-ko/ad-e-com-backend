import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.config.js';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enterprise E-Commerce API',
      version: '1.0.0',
      description: 'Production-ready, high-scale 3-Tier Express REST API with TypeScript, MongoDB, and Redis',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
            timestamp: { type: 'string', example: '2026-10-24T20:00:00.000Z' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Validation failed' },
            errorCode: { type: 'string', example: 'VALIDATION_ERROR' },
            errors: { type: 'array', items: { type: 'object' } },
            timestamp: { type: 'string', example: '2026-10-24T20:00:00.000Z' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/modules/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
