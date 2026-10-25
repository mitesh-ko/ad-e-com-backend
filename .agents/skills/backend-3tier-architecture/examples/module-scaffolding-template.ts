/**
 * Reference Template for a 3-Tier Feature Module
 * Demonstrates the canonical structure of Model, Repository, Service, Controller, and Route.
 */

// 1. MODEL (product.model.ts)
/*
import { Schema, model, Document } from 'mongoose';

export interface IProductDocument extends Document {
  name: string;
  sku: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

export const ProductModel = model<IProductDocument>('Product', ProductSchema);
*/

// 2. REPOSITORY (product.repository.ts)
/*
import { BaseRepository } from '#shared/repositories/base.repository.js';
import { IProductDocument, ProductModel } from './product.model.js';

export class ProductRepository extends BaseRepository<IProductDocument> {
  constructor() {
    super(ProductModel);
  }

  public async findBySku(sku: string): Promise<IProductDocument | null> {
    return this.findOne({ sku: sku.toUpperCase().trim() });
  }
}

export const productRepository = new ProductRepository();
*/

// 3. SERVICE (product.service.ts)
/*
import { productRepository, ProductRepository } from './product.repository.js';
import { IProductDocument } from './product.model.js';
import { CreateProductDto, UpdateProductDto, ListProductsQuery } from './product.schema.js';
import { NotFoundError, ConflictError } from '#errors/index.js';
import { CacheService } from '#shared/services/cache.service.js';
import { PaginatedResult } from '#shared/repositories/repository.interface.js';

export class ProductService {
  constructor(private productRepo: ProductRepository = productRepository) {}

  public async getProductById(id: string): Promise<IProductDocument> {
    const cacheKey = `product:${id}`;
    const cached = await CacheService.get<IProductDocument>(cacheKey);
    if (cached) return cached;

    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundError(`Product '${id}' not found`);

    await CacheService.set(cacheKey, product.toObject(), 300);
    return product;
  }

  public async createProduct(dto: CreateProductDto): Promise<IProductDocument> {
    const existing = await this.productRepo.findBySku(dto.sku);
    if (existing) throw new ConflictError(`Product with SKU '${dto.sku}' already exists`);

    return this.productRepo.create(dto);
  }

  public async updateProduct(id: string, dto: UpdateProductDto): Promise<IProductDocument> {
    const updated = await this.productRepo.updateById(id, dto);
    if (!updated) throw new NotFoundError(`Product '${id}' not found`);

    await CacheService.del(`product:${id}`);
    return updated;
  }
}

export const productService = new ProductService();
*/

// 4. CONTROLLER (product.controller.ts)
/*
import { Request, Response } from 'express';
import { productService, ProductService } from './product.service.js';
import { ApiResponse } from '#shared/utils/api-response.js';
import { CreateProductDto, UpdateProductDto } from './product.schema.js';

export class ProductController {
  constructor(private service: ProductService = productService) {}

  public getById = async (req: Request, res: Response): Promise<void> => {
    const product = await this.service.getProductById(req.params.id);
    ApiResponse.success(res, 'Product retrieved', product);
  };

  public create = async (req: Request, res: Response): Promise<void> => {
    const product = await this.service.createProduct(req.body as CreateProductDto);
    ApiResponse.success(res, 'Product created successfully', product, 201);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const product = await this.service.updateProduct(req.params.id, req.body as UpdateProductDto);
    ApiResponse.success(res, 'Product updated successfully', product);
  };
}

export const productController = new ProductController();
*/
