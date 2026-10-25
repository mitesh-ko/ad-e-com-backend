# Supertest Integration Testing Patterns

Integration tests verify full HTTP request/response lifecycles against Express app instances.

## 1. Integration Test Anatomy

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '#src/app.js';

describe('User Integration Endpoints', () => {
  const app = createApp();

  describe('GET /api/v1/users', () => {
    it('should return 401 Unauthorized when no Authorization header is provided', async () => {
      const response = await request(app).get('/api/v1/users');

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        statusCode: 401,
        message: expect.any(String),
      });
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should reject malformed IDs with 422 Unprocessable Entity', async () => {
      // Mock valid auth token if required
      const response = await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${testAdminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
    });
  });
});
```

---

## 2. Key Checks in Integration Tests
1. **Status Code**: Assert exact HTTP status code (`200`, `201`, `400`, `401`, `403`, `404`, `422`).
2. **Standard Envelope**: Verify `success: true/false`, `statusCode`, `message`, `data`, and `meta`.
3. **Security Headers**: Ensure `x-request-id`, `content-security-policy`, etc. are emitted properly.
4. **Data Masking**: Verify sensitive properties (e.g. `password`) are never present in the response body.
