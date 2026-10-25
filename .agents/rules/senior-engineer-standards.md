# Senior Engineer Standards & Quality Invariants

Every code modification in this repository must satisfy the following senior engineering invariants:

## 1. Architectural Boundaries
- **Controller Layer** (`src/modules/*/*.controller.ts`):
  - Strictly HTTP transport only. Extract `req.body`, `req.query`, `req.params`, and `req.user`.
  - Delegate all business logic to the corresponding Service.
  - Return JSON responses exclusively through `ApiResponse.success(res, message, data, statusCode, meta)`.
  - Never call database queries, Mongoose models, or Redis directly in controllers.
- **Service Layer** (`src/modules/*/*.service.ts`):
  - Pure domain and business logic.
  - Independent of Express: never import or reference `Request`, `Response`, or `NextFunction`.
  - Throw typed `AppError` subclasses (`BadRequestError`, `NotFoundError`, etc.) on failure; do not return error status codes.
  - Coordinate cache read/write/invalidation through `CacheService`.
- **Repository Layer** (`src/modules/*/*.repository.ts`):
  - Extend `BaseRepository<T>`.
  - Encapsulate all database access, queries, transactions, projections, and population.
- **Routing & Validation** (`src/modules/*/*.route.ts` & `*.schema.ts`):
  - Every route must validate incoming data using `validate({ body, query, params })` with Zod schemas.
  - Handlers must be wrapped in `asyncHandler(...)` to ensure errors are forwarded to `next(err)`.

## 2. Type Safety & Imports
- **Subpath Imports**:
  Always use package subpaths:
  - `#src/*`
  - `#config/*`
  - `#constants/*`
  - `#database/*`
  - `#errors/*`
  - `#middlewares/*`
  - `#modules/*`
  - `#shared/*`
  - `#types/*`
- **Zero Any Policy**: No `any` types. Infer types with `z.infer<typeof Schema>` or define explicit TypeScript interfaces/types in `src/@types/` or module schema files.

## 3. Resilience & Security
- **Operational Error Handling**: Centralized error middleware formats all errors into uniform JSON. Operational errors are `AppError` subclasses.
- **NoSQL Injection & Parameter Pollution**: Guarded at app-level via `express-mongo-sanitize` and `hpp`. Ensure search regexes are sanitized against ReDoS.
- **Secrets & Credentials**: Never hardcode secrets. Always read from validated `env` config in `#config/env.config.js`.

## 4. Verification Protocol
Before marking any task as complete:
1. `npm run typecheck` - Must pass with 0 TypeScript errors.
2. `npm run lint` - Must pass with 0 ESLint errors.
3. `npm run test` - All Vitest unit and integration tests must pass.
