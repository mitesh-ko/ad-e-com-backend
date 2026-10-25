---
name: testing-and-quality
description: >-
  Use this skill when writing unit or integration tests, debugging test failures, checking coverage,
  or running quality assurance routines (TypeScript typechecking, ESLint, Vitest, Supertest).
---

# Testing and Quality Assurance Guide

This skill defines the testing standards and automated quality verification protocols for the repository.

---

## 1. Testing Strategy

The repository follows a 2-tier testing structure in `backend/tests/`:

1. **Unit Tests** (`tests/unit/*.test.ts`):
   - Fast, isolated tests for Services, utility functions, and domain logic.
   - Mock all external dependencies (Repositories, Redis/CacheService, BullMQ workers).
   - Use `vi.spyOn`, `vi.mock`, or inject mock repositories via Service constructors.
2. **Integration Tests** (`tests/integration/*.test.ts`):
   - Full HTTP pipeline tests using **Supertest** against `createApp()`.
   - Validate routing, middleware execution (Auth, RBAC, Rate Limiting, Validation), status codes, and response envelopes.

---

## 2. Test Execution Commands

From `backend/`:

```bash
# Run all tests once
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run tests with code coverage analysis
npm run test:coverage

# TypeScript compile verification
npm run typecheck

# Code formatting and linting
npm run lint

# Automatically fix lint issues
npm run lint:fix
```

---

## 3. Mandatory Quality Gates Before Task Completion

Before presenting any code modification or considering work complete, you MUST execute:

```bash
cd backend && npm run typecheck && npm run lint && npm run test
```

If ANY command fails:
1. Do not ignore or bypass the error.
2. Inspect the failing file, line, and assertion.
3. Fix the underlying issue.
4. Re-run until all 3 checks pass with 0 errors.

---

## Supporting References

- [Vitest Unit Testing Patterns](./references/vitest-unit-testing.md)
- [Supertest Integration Testing Patterns](./references/supertest-integration-testing.md)
- [Verification Checklist](./references/verification-checklist.md)
