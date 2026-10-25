# OpenAPI 3.0 / Swagger Documentation Guide

## 1. Documentation Setup
OpenAPI documentation is served at `/api-docs` using `swagger-ui-express` configured in `src/docs/swagger.ts`.

## 2. Annotating New Endpoints
Add JSDoc Swagger annotations directly above route definitions:

```typescript
/**
 * @openapi
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductDto'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post('/', authenticate, authorize('admin'), validate({ body: CreateProductSchema }), asyncHandler(productController.create));
```

Always ensure the Swagger schemas reflect actual Zod schemas and response envelopes.
