---
name: database-and-migrations
description: >-
  Use this skill when creating or modifying Mongoose models, writing database migrations with migrate-mongo,
  adding database indexes, seeding data, executing MongoDB transactions, or managing Redis cache keys.
---

# Database, Migrations, and Caching Guide

This skill governs MongoDB schema design, Mongoose best practices, idempotent schema/data migrations with `migrate-mongo`, seeding, and Redis caching.

---

## 1. Mongoose Model Design Invariants

- **Always enable timestamps**: `{ timestamps: true }`.
- **Index query fields**: Always index fields used in lookups, filters, and sorts (`email`, `sku`, `status`, `createdAt`).
- **Compound indexes**: For multi-field queries, define compound indexes (e.g. `{ tenantId: 1, status: 1 }`).
- **Lean queries for read performance**: Use `.lean()` in repositories when document instance methods or Mongoose hooks are not needed.
- **Sensitive field safety**: Mark passwords as `{ select: false }` by default. Provide explicit repository methods (e.g. `findByEmailWithPassword`) when needed.
- **Transform methods**: Implement `toSafeObject()` or configure `toJSON: { transform(doc, ret) { delete ret.password; return ret; } }`.

---

## 2. Database Migrations with `migrate-mongo`

Never mutate production database collections manually or write ad-hoc schema patches. Always create structured migrations:

```bash
# In backend/
npm run migrate:create <descriptive_migration_name>
```

- Each migration file in `src/database/migrations/` must export `up(db, client)` and `down(db, client)`.
- **Idempotence**: Operations must be safe to run even if partially applied.
- Run migrations: `npm run migrate:up`
- Rollback migrations: `npm run migrate:down`
- Check migration status: `npm run migrate:status`

---

## 3. Database Seeding

- Seeding scripts reside in `src/database/seeds/index.ts`.
- Run seed: `npm run seed`
- Reset and seed: `npm run seed:reset`
- All seed scripts must use realistic test data (e.g. hashed passwords using bcrypt, valid roles).

---

## 4. Redis Caching Standards

- Always access Redis via `CacheService` in `#shared/services/cache.service.js`.
- Key format: `<entity>:<id>` (e.g. `user:64e72f...`).
- TTL: Set appropriate time-to-live (e.g. 300 seconds for user profiles, 60 seconds for listings).
- Invalidation: Any mutating operation (`update`, `delete`, `statusChange`) MUST delete the cache key.
- Graceful resilience: If Redis is offline or errors, `CacheService` catches the error, logs a warning, and returns `null` so the caller falls back to MongoDB.

---

## Supporting References

- [Migration Runbook](./references/migration-runbook.md)
- [Mongoose Best Practices](./references/mongoose-patterns.md)
- [Redis Caching Patterns](./references/caching-and-redis.md)
