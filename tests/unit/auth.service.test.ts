import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '#modules/auth/auth.service.js';
import { UserRepository } from '#modules/user/user.repository.js';
import { ConflictError, UnauthorizedError } from '#errors/index.js';

import bcrypt from 'bcryptjs';

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;
  let mockUserRepo: Partial<UserRepository>;

  beforeEach(() => {
    mockUserRepo = {
      existsByEmail: vi.fn(),
      create: vi.fn(),
      findByEmailWithPassword: vi.fn(),
      findById: vi.fn(),
    };
    authService = new AuthService(mockUserRepo as UserRepository);
  });

  describe('register', () => {
    it('should throw ConflictError if user already exists', async () => {
      vi.mocked(mockUserRepo.existsByEmail!).mockResolvedValue(true);

      await expect(
        authService.register({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          role: 'user',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should register a new user and return tokens', async () => {
      vi.mocked(mockUserRepo.existsByEmail!).mockResolvedValue(false);

      const mockUser = {
        _id: '64e72f3bb6dc7b001f2a8c12',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user' as const,
        status: 'active' as const,
        toSafeObject: () => ({
          _id: '64e72f3bb6dc7b001f2a8c12',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user' as const,
          status: 'active' as const,
        }),
      };

      vi.mocked(mockUserRepo.create!).mockResolvedValue(mockUser as any);

      const result = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'user',
      });

      expect(result.user.email).toBe('john@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedError when user is not found', async () => {
      vi.mocked(mockUserRepo.findByEmailWithPassword!).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'notfound@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when password does not match', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
      const mockUser = {
        _id: '64e72f3bb6dc7b001f2a8c12',
        email: 'john@example.com',
        password: hashedPassword,
        status: 'active',
        toSafeObject: vi.fn(),
      };
      vi.mocked(mockUserRepo.findByEmailWithPassword!).mockResolvedValue(mockUser as any);

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'WrongPassword123!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should log in successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const mockUser = {
        _id: '64e72f3bb6dc7b001f2a8c12',
        email: 'john@example.com',
        password: hashedPassword,
        status: 'active',
        role: 'user',
        toSafeObject: () => ({
          _id: '64e72f3bb6dc7b001f2a8c12',
          email: 'john@example.com',
          role: 'user',
          status: 'active',
        }),
      };
      vi.mocked(mockUserRepo.findByEmailWithPassword!).mockResolvedValue(mockUser as any);

      const result = await authService.login({
        email: 'john@example.com',
        password: 'Password123!',
      });

      expect(result.tokens.accessToken).toBeDefined();
      expect(result.user.email).toBe('john@example.com');
    });
  });
});
