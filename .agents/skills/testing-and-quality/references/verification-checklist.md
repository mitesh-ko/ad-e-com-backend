# Quality Assurance Verification Checklist

Execute this verification sequence whenever finishing any coding work:

```bash
cd backend
npm run typecheck
npm run lint
npm run test
```

## Checklist

- [ ] `npm run typecheck` completed with `exit code 0` and 0 TypeScript compilation errors.
- [ ] `npm run lint` completed with `exit code 0` (no unignored files, no syntax errors, no style warnings).
- [ ] `npm run test` completed with all test suites passing.
- [ ] Edge cases covered:
  - [ ] Non-existent IDs (404)
  - [ ] Unauthenticated requests (401)
  - [ ] Unauthorized roles (403)
  - [ ] Malformed or missing fields (422)
  - [ ] Duplicate unique keys (409)
- [ ] No regression introduced to existing tests.
