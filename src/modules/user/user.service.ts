import { userRepository, UserRepository } from './user.repository.js';
import { IUserDocument } from './user.model.js';
import { ListUsersQuery, UpdateUserDto } from './user.schema.js';
import { NotFoundError, ForbiddenError } from '#errors/index.js';
import { CacheService } from '#shared/services/cache.service.js';
import { PaginatedResult } from '#shared/repositories/repository.interface.js';
import { AuthenticatedUserPayload } from '#types/express.js';
import { FilterQuery } from 'mongoose';


export class UserService {
  private userRepo: UserRepository;

  constructor(userRepo = userRepository) {
    this.userRepo = userRepo;
  }

  public async getUserById(id: string): Promise<IUserDocument> {
    const cacheKey = `user:${id}`;
    const cached = await CacheService.get<IUserDocument>(cacheKey);
    if (cached) return cached;

    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' was not found`);
    }

    await CacheService.set(cacheKey, user.toSafeObject(), 300); // 5 min TTL
    return user;
  }

  public async listUsers(query: ListUsersQuery): Promise<PaginatedResult<IUserDocument>> {
    const filter: FilterQuery<IUserDocument> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.userRepo.findPaginated(filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: -1 },
    });
  }

  public async updateUser(
    id: string,
    dto: UpdateUserDto,
    currentUser: AuthenticatedUserPayload
  ): Promise<IUserDocument> {
    // Only admins or the account owner can update
    if (currentUser.role !== 'admin' && currentUser.userId !== id) {
      throw new ForbiddenError('You can only update your own user profile');
    }

    const updatedUser = await this.userRepo.updateById(id, dto);
    if (!updatedUser) {
      throw new NotFoundError(`User with ID '${id}' was not found`);
    }

    // Invalidate cached user
    await CacheService.del(`user:${id}`);

    return updatedUser;
  }

  public async deleteUser(id: string, currentUser: AuthenticatedUserPayload): Promise<void> {
    // Only admins or the account owner can delete
    if (currentUser.role !== 'admin' && currentUser.userId !== id) {
      throw new ForbiddenError('You do not have permission to delete this account');
    }

    const deleted = await this.userRepo.deleteById(id);
    if (!deleted) {
      throw new NotFoundError(`User with ID '${id}' was not found`);
    }

    // Invalidate cached user
    await CacheService.del(`user:${id}`);
  }
}

export const userService = new UserService();
