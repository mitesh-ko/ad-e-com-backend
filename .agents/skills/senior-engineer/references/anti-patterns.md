# Senior Engineering Anti-Patterns to Avoid

Avoid these junior and mid-level anti-patterns in this codebase:

---

## 1. Fat Controllers (Leaky Abstraction)
❌ **Anti-Pattern**:
```typescript
// BAD: Controller calling Mongoose model directly and containing business logic
export const updateUser = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  user.name = req.body.name;
  await user.save();
  return res.json(user);
};
```
✅ **Senior Pattern**:
```typescript
// GOOD: Controller only adapts HTTP to Service call
export const updateUser = async (req: Request, res: Response) => {
  const updated = await userService.updateUser(
    req.params.id,
    req.body as UpdateUserDto,
    req.user as AuthenticatedUserPayload
  );
  ApiResponse.success(res, 'User updated successfully', updated);
};
```

---

## 2. Unhandled Promise Rejections & Swallowed Errors
❌ **Anti-Pattern**:
```typescript
// BAD: Empty catch block hides critical errors
try {
  await doImportantWork();
} catch (e) {
  // Silent fail
}
```
✅ **Senior Pattern**:
```typescript
// GOOD: Propagate typed AppError or log structured error context
try {
  await doImportantWork();
} catch (error) {
  logger.error({ error, context: 'doImportantWork' }, 'Failed to execute important work');
  throw new InternalServerError('Failed to execute operation due to internal error');
}
```

---

## 3. Stringly-Typed Errors & Magic Status Codes
❌ **Anti-Pattern**:
```typescript
// BAD: Generic string errors or magic numbers
throw new Error('User not found');
res.status(404).send('Not found');
```
✅ **Senior Pattern**:
```typescript
// GOOD: Explicit typed domain error class
throw new NotFoundError(`User with ID '${id}' was not found`);
```

---

## 4. Cache Desynchronization (Stale Data Leaks)
❌ **Anti-Pattern**:
```typescript
// BAD: Updating data without invalidating the cache
await userRepo.updateById(id, dto);
// Client will continue reading stale data from Redis!
```
✅ **Senior Pattern**:
```typescript
// GOOD: Invalidate or update cache upon write
const updatedUser = await this.userRepo.updateById(id, dto);
await CacheService.del(`user:${id}`);
```

---

## 5. Brittle Relative Imports
❌ **Anti-Pattern**:
```typescript
import { BaseRepository } from '../../../../shared/repositories/base.repository.js';
```
✅ **Senior Pattern**:
```typescript
import { BaseRepository } from '#shared/repositories/base.repository.js';
```

---

## 6. Fake Completion Without Automated Verification
❌ **Anti-Pattern**:
Claiming "I have implemented the feature and it works properly" without running tests, linter, or compiler.
✅ **Senior Pattern**:
Run `npm run typecheck`, `npm run lint`, and `npm run test`. Provide the passing output as verification evidence.
