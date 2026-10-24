import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '#src/app.js';


describe('Auth Validation & Middleware Integration Tests', () => {
  const app = createApp();

  it('POST /api/v1/auth/register should reject weak password with 422', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'John',
      email: 'john@example.com',
      password: 'weak',
      confirmPassword: 'weak',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/v1/auth/register should reject password mismatch with 422', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password456!',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/auth/login should reject invalid email format with 422', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'not-an-email',
      password: 'anypassword',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('GET /api/v1/users should reject request without Authorization header with 401', async () => {
    const res = await request(app).get('/api/v1/users');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('MISSING_BEARER_TOKEN');
  });
});
