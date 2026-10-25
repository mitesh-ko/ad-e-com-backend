# Redis Caching Patterns

## 1. The Cache-Aside Pattern
Always follow Cache-Aside (Lazy Loading):

```
Application -> Check Redis Cache
                 ├── [Cache HIT]  -> Return cached JSON directly
                 └── [Cache MISS] -> Query MongoDB
                                     -> Save to Redis with TTL
                                     -> Return result
```

Implementation in Service:
```typescript
const cacheKey = `product:${id}`;
const cached = await CacheService.get<IProductDocument>(cacheKey);
if (cached) return cached;

const product = await this.productRepo.findById(id);
if (!product) throw new NotFoundError('Product not found');

await CacheService.set(cacheKey, product.toSafeObject ? product.toSafeObject() : product, 300);
return product;
```

---

## 2. Invalidation Strategy
- Never rely solely on TTL expiration for updated entities.
- Every mutating Service action must immediately call `CacheService.del(key)`.
- If a collection or list cache exists (e.g. `products:page:1`), invalidate the collection cache prefix or pattern upon insert or status change.

---

## 3. Safe Failure Guarantee
`CacheService` must never cause request failure if Redis is unavailable:
- Read failure -> logs warning, returns `null` (caller reads from DB).
- Write failure -> logs warning, continues normally.
- Invalidation failure -> logs error so operations team is alerted.
