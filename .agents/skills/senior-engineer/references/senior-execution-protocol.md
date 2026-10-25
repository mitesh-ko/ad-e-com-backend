# Senior Execution Protocol (Detailed Guide)

## 1. Deep Root-Cause Analysis vs. Surface Fixing
When encountering a bug or error:
1. **Reproduce First**: Look at the exact error message, stack trace, and failing test case.
2. **Find the Root Cause**: Ask "Why did this happen?" through the 5-Whys technique:
   - Did the caller provide unexpected input?
   - Did a database query return `null` when a document was assumed?
   - Was a promise not awaited, leading to an unhandled rejection?
   - Was an asynchronous cache write racing with a read?
3. **Fix the System, Not Just the Symptom**:
   - Don't just patch with an `if (x) ...` without considering invariants.
   - Add explicit schema validation if bad data entered.
   - Add a regression test reproducing the exact failure before applying the fix.

---

## 2. Principle of Least Surprise
- Code should behave in the way any senior engineer reading the method signature would expect.
- Method names must be descriptive and honest:
  - `findById` returns the entity or `null`.
  - `getById` returns the entity or throws `NotFoundError`.
  - `existsByEmail` returns a `boolean`.
  - `deleteUser` deletes the record and invalidates cache.
- Functions should do one thing and do it well (Single Responsibility Principle).

---

## 3. Production Readiness Mindset
Every feature or fix must be production-ready on day one:
- **Observability**: Logs must include contextual fields (e.g. `userId`, `correlationId`, `entityId`). Never log raw passwords, access tokens, or sensitive PII.
- **Graceful Degradation**: If an external dependency fails (Redis, payment gateway, email provider), handle the exception gracefully without taking down the entire API server.
- **Resource Cleanup**: Always close database sessions, clear timers, and release Redis connections in test tear-downs and graceful shutdowns.
