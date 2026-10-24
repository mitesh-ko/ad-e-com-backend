import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { PaginationMeta } from '../utils/api-response.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1> | string;
}

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string, projection?: Record<string, number>): Promise<T | null>;
  findOne(filter: FilterQuery<T>, projection?: Record<string, number>): Promise<T | null>;
  find(filter?: FilterQuery<T>, projection?: Record<string, number>, options?: QueryOptions): Promise<T[]>;
  findPaginated(filter?: FilterQuery<T>, pagination?: PaginationOptions): Promise<PaginatedResult<T>>;
  updateById(id: string, update: UpdateQuery<T>): Promise<T | null>;
  deleteById(id: string): Promise<T | null>;
  count(filter?: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
}
