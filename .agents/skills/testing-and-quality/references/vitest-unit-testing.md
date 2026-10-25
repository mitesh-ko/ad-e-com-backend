# Vitest Unit Testing Patterns

## 1. Unit Test Structure (AAA Pattern)
Always structure tests using **Arrange, Act, Assert**:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '#modules/user/user.service.js';
import { UserRepository } from '#modules/user/user.repository.js';
import { CacheService } from '#shared/services/cache.service.js';
import { NotFoundError } from '#errors/index.js';

describe('UserService', () => {
  let mockUserRepo: Partial<UserRepository>;
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserRepo = {
      findById: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn(),
    };

    service = new UserService(mockUserRepo as UserRepository);
  });

  describe('getUserById', () => {
    it('should return cached user if available in Redis', async () => {
      // Arrange
      const cachedUser = { _id: '123', name: 'John Doe', email: 'john@example.com' };
      vi.spyOn(CacheService, 'get').mockResolvedValue(cachedUser as any);

      // Act
      const result = await service.getUserById('123');

      // Assert
      expect(result).toEqual(cachedUser);
      expect(mockUserRepo.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if user does not exist in cache or database', async () => {
      // Arrange
      vi.spyOn(CacheService, 'get').mockResolvedValue(null);
      (mockUserRepo.findById as any).mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });
});
```

---

## 2. Key Rules for Unit Tests
1. **Never test Mongoose internals in unit tests**: Mock the repository interface instead.
2. **Always test failure paths**: Don't just test the 200/happy path; test invalid input, unauthorized access, not found, duplicate conflicts, and error propagation.
3. **Reset Mocks**: Call `vi.clearAllMocks()` in `beforeEach`.
