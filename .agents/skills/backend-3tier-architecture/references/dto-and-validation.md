# DTO and Zod Validation Guidelines

Every API endpoint must validate incoming request parameters using Zod schemas.

## 1. Schema Definition Rules

Always define separate schemas for `params`, `query`, and `body` in `<feature>.schema.ts`:

```typescript
import { z } from 'zod';

// MongoDB ObjectId validation helper
export const ObjectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
});

// Query Schema with pagination defaults and coercion
export const ListItemsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  status: z.enum(['active', 'inactive', 'draft']).optional(),
});

// Body Schema with strict validation
export const CreateItemSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  sku: z.string().trim().toUpperCase().min(3).max(50),
  price: z.number().positive('Price must be greater than 0'),
  categories: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
  isActive: z.boolean().default(true),
});

// Partial schema for updates
export const UpdateItemSchema = CreateItemSchema.partial();

// Infer TypeScript types directly
export type ListItemsQuery = z.infer<typeof ListItemsQuerySchema>;
export type CreateItemDto = z.infer<typeof CreateItemSchema>;
export type UpdateItemDto = z.infer<typeof UpdateItemSchema>;
```

---

## 2. Mounting Validation Middleware

In the route file, pass schemas to `validate`:

```typescript
import { validate } from '#middlewares/validate.middleware.js';

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: CreateItemSchema }),
  asyncHandler(itemController.create)
);

router.get(
  '/:id',
  validate({ params: ObjectIdParamSchema }),
  asyncHandler(itemController.getById)
);
```

When validation fails, `validate.middleware.ts` automatically creates an `UnprocessableEntityError` (HTTP 422) with detailed field-level error messages.
