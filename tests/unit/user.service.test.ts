import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '#modules/user/user.service.js';
import { UserRepository } from '#modules/user/user.repository.js';
import { NotFoundError, ForbiddenError } from '#errors/index.js';


describe('UserService (Unit Tests)', () => {
  let userService: UserService;
  let mockUserRepo: Partial<UserRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findById: vi.fn(),
      findPaginated: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn(),
    };
    userService = new UserService(mockUserRepo as UserRepository);
  });

  describe('getUserById', () => {
    it('should throw NotFoundError if user does not exist', async () => {
      vi.mocked(mockUserRepo.findById!).mockResolvedValue(null);

      await expect(userService.getUserById('64e72f3bb6dc7b001f2a8c12')).rejects.toThrow(NotFoundError);
    });

    it('should return user when found', async () => {
      const mockUser = {
        _id: '64e72f3bb6dc7b001f2a8c12',
        name: 'Jane Doe',
        email: 'jane@example.com',
        toSafeObject: () => ({ _id: '64e72f3bb6dc7b001f2a8c12', name: 'Jane Doe' }),
      };
      vi.mocked(mockUserRepo.findById!).mockResolvedValue(mockUser as any);

      const result = await userService.getUserById('64e72f3bb6dc7b001f2a8c12');
      expect(result.name).toBe('Jane Doe');
    });
  });

  describe('updateUser', () => {
    it('should forbid regular user from updating another user account', async () => {
      const regularUserPayload = {
        userId: '64e72f3bb6dc7b001f2a8c12',
        email: 'user1@example.com',
        role: 'user' as const,
      };

      await expect(
        userService.updateUser('64e72f3bb6dc7b001f2a8c99', { name: 'Hacked' }, regularUserPayload)
      ).rejects.toThrow(ForbiddenError);
    });

    it('should allow admin to update any user account', async () => {
      const adminPayload = {
        userId: '64e72f3bb6dc7b001f2a8c00',
        email: 'admin@example.com',
        role: 'admin' as const,
      };

      const mockUpdated = {
        _id: '64e72f3bb6dc7b001f2a8c99',
        name: 'Updated Name',
      };
      vi.mocked(mockUserRepo.updateById!).mockResolvedValue(mockUpdated as any);

      const result = await userService.updateUser('64e72f3bb6dc7b001f2a8c99', { name: 'Updated Name' }, adminPayload);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('deleteUser', () => {
    it('should throw ForbiddenError when non-admin tries to delete another user', async () => {
      const regularUserPayload = {
        userId: '64e72f3bb6dc7b001f2a8c12',
        email: 'user1@example.com',
        role: 'user' as const,
      };

      await expect(
        userService.deleteUser('64e72f3bb6dc7b001f2a8c99', regularUserPayload)
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
