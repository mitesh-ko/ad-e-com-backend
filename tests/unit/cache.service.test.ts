import { describe, it, expect, vi } from 'vitest';
import { CacheService } from '#shared/services/cache.service.js';


describe('CacheService (Unit Tests)', () => {
  it('should gracefully return null when cache is empty or Redis is disabled', async () => {
    const result = await CacheService.get('non_existent_key');
    expect(result).toBeNull();
  });

  it('should execute fetchFn in getOrSet when cache miss occurs', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ id: 1, name: 'Product A' });

    const result = await CacheService.getOrSet('test_key_item', fetchMock, 60);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 1, name: 'Product A' });
  });
});
