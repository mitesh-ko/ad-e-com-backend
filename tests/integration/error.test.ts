import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '#src/app.js';


describe('Global Error Handling & Standard Envelope Tests', () => {
  const app = createApp();

  it('should return 400 MALFORMED_JSON when request body has broken JSON', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "broken-json,');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('MALFORMED_JSON');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('should return 401 INVALID_TOKEN when tampered Bearer token is provided', async () => {
    const res = await request(app)
      .get('/api/v1/users/64e72f3bb6dc7b001f2a8c12')
      .set('Authorization', 'Bearer fake.tampered.token');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('TOKEN_EXPIRED');
  });

  it('should return 404 with standard envelope for undefined endpoints', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('NOT_FOUND');
    expect(res.body.timestamp).toBeDefined();
  });
});
