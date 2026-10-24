import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { BadRequestError } from '#errors/index.js';
import { logger } from '#config/logger.config.js';


export interface StoredFile {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  path: string;
  url: string;
}

export interface IStorageService {
  save(buffer: Buffer, originalFilename: string, mimeType: string, subfolder?: string): Promise<StoredFile>;
  delete(filePath: string): Promise<boolean>;
  exists(filePath: string): Promise<boolean>;
}

export class LocalStorageService implements IStorageService {
  private baseDir: string;
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/csv',
  ]);
  private readonly maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  constructor(baseDir = 'uploads') {
    this.baseDir = path.resolve(process.cwd(), baseDir);
    this.ensureDirectoryExists(this.baseDir);
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  public async save(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string,
    subfolder = 'media'
  ): Promise<StoredFile> {
    // 1. Validate file size
    if (buffer.length > this.maxSizeBytes) {
      throw new BadRequestError(
        `File size exceeds maximum limit of ${this.maxSizeBytes / 1024 / 1024}MB`,
        'FILE_TOO_LARGE'
      );
    }

    // 2. Validate MIME type
    if (!this.allowedMimeTypes.has(mimeType)) {
      throw new BadRequestError(
        `File type '${mimeType}' is not supported. Allowed: ${Array.from(this.allowedMimeTypes).join(', ')}`,
        'INVALID_FILE_TYPE'
      );
    }

    // 3. Generate collision-proof, traversal-safe filename
    const ext = path.extname(originalFilename).toLowerCase();
    const safeFilename = `${randomUUID()}${ext}`;

    const targetDir = path.join(this.baseDir, subfolder);
    this.ensureDirectoryExists(targetDir);

    const fullPath = path.join(targetDir, safeFilename);

    // 4. Write file to disk
    await fs.promises.writeFile(fullPath, buffer);

    logger.info({ safeFilename, subfolder, size: buffer.length }, 'File stored successfully');

    return {
      filename: safeFilename,
      originalName: originalFilename,
      mimeType,
      sizeBytes: buffer.length,
      path: fullPath,
      url: `/uploads/${subfolder}/${safeFilename}`,
    };
  }

  public async delete(relativeOrFullPath: string): Promise<boolean> {
    try {
      const fullPath = path.isAbsolute(relativeOrFullPath)
        ? relativeOrFullPath
        : path.join(this.baseDir, relativeOrFullPath);

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        logger.info({ path: fullPath }, 'File deleted from storage');
        return true;
      }
      return false;
    } catch (error) {
      logger.warn({ error, path: relativeOrFullPath }, 'Failed to delete file from storage');
      return false;
    }
  }

  public async exists(relativeOrFullPath: string): Promise<boolean> {
    const fullPath = path.isAbsolute(relativeOrFullPath)
      ? relativeOrFullPath
      : path.join(this.baseDir, relativeOrFullPath);
    return fs.existsSync(fullPath);
  }
}

export const storageService = new LocalStorageService();
