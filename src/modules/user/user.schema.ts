import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const UserIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid User ID format. Must be a 24-character hexadecimal string'),
});

export const ListUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().trim().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  profile: z
    .array(
      z.object({
        type: z.string().optional(),
        url: z.string().url('Must be a valid URL'),
      })
    )
    .optional(),
});

export type UserIdParam = z.infer<typeof UserIdParamSchema>;
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
