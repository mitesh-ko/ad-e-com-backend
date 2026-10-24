import { describe, it, expect, afterAll } from 'vitest';
import { LocalStorageService } from '#shared/services/storage.service.js';
import { BadRequestError } from '#errors/index.js';

import fs from 'fs';
import path from 'path';

describe('LocalStorageService (Unit Tests)', () => {
  const testStorage = new LocalStorageService('test_uploads');
  const createdFiles: string[] = [];

  afterAll(async () => {
    // Cleanup test artifacts
    for (const f of createdFiles) {
      await testStorage.delete(f);
    }
    const testDir = path.resolve(process.cwd(), 'test_uploads');
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should save a valid image buffer to disk and return file metadata', async () => {
    const dummyBuffer = Buffer.from('fake-image-bytes');
    const stored = await testStorage.save(dummyBuffer, 'avatar.png', 'image/png', 'avatars');

    createdFiles.push(stored.path);

    expect(stored.filename).toMatch(/\.png$/);
    expect(stored.mimeType).toBe('image/png');
    expect(stored.sizeBytes).toBe(dummyBuffer.length);
    expect(fs.existsSync(stored.path)).toBe(true);
  });

  it('should reject file exceeding maximum size limit', async () => {
    const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB > 5MB limit

    await expect(
      testStorage.save(oversizedBuffer, 'huge.png', 'image/png')
    ).rejects.toThrow(BadRequestError);
  });

  it('should reject unsupported MIME type', async () => {
    const scriptBuffer = Buffer.from('malicious-payload');

    await expect(
      testStorage.save(scriptBuffer, 'payload.exe', 'application/x-msdownload')
    ).rejects.toThrow(BadRequestError);
  });

  it('should verify file existence and delete file cleanly', async () => {
    const buffer = Buffer.from('file-to-delete');
    const stored = await testStorage.save(buffer, 'temp.jpg', 'image/jpeg');

    expect(await testStorage.exists(stored.path)).toBe(true);
    const deleted = await testStorage.delete(stored.path);
    expect(deleted).toBe(true);
    expect(await testStorage.exists(stored.path)).toBe(false);
  });
});
