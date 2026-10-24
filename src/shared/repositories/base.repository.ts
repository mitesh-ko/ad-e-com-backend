import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { IBaseRepository, PaginatedResult, PaginationOptions } from './repository.interface.js';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  public async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document.save() as unknown as Promise<T>;
  }

  public async findById(id: string, projection?: Record<string, number>): Promise<T | null> {
    return this.model.findById(id, projection).exec();
  }

  public async findOne(filter: FilterQuery<T>, projection?: Record<string, number>): Promise<T | null> {
    return this.model.findOne(filter, projection).exec();
  }

  public async find(
    filter: FilterQuery<T> = {},
    projection?: Record<string, number>,
    options?: QueryOptions
  ): Promise<T[]> {
    return this.model.find(filter, projection, options).exec();
  }

  public async findPaginated(
    filter: FilterQuery<T> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, Math.min(100, pagination.limit || 10));
    const skip = (page - 1) * limit;
    const sort = pagination.sort || { createdAt: -1 };

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  public async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  public async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  public async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }
}
