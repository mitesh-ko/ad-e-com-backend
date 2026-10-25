---
name: api-security-and-docs
description: >-
  Use this skill when designing RESTful API endpoints, configuring JWT authentication, RBAC authorization,
  rate limiting, security headers, input sanitization, or generating/updating OpenAPI 3.0 / Swagger documentation.
---

# API Security and Documentation Guide

This skill governs API contract design, REST conventions, OpenAPI documentation, and production security hardening.

---

## 1. RESTful Design Conventions

- **Resource URIs**: Use plural nouns in lowercase (e.g. `/api/v1/orders`, `/api/v1/products`).
- **HTTP Methods & Status Codes**:
  - `GET /items`: 200 OK (Paginated list)
  - `GET /items/:id`: 200 OK (Single item)
  - `POST /items`: 201 Created (Created resource)
  - `PUT /items/:id`: 200 OK (Updated resource)
  - `DELETE /items/:id`: 200 OK (Success envelope) or 204 No Content
- **Uniform Response Envelopes**:
  Every response must use `ApiResponse.success(res, message, data, statusCode, meta)`.

---

## 2. Security Hardening Invariants

- **Authentication**:
  - Use `authenticate` middleware from `#middlewares/auth.middleware.js`.
  - Attaches verified payload to `req.user`.
- **Authorization (RBAC)**:
  - Use `authorize('admin', 'manager')` from `#middlewares/rbac.middleware.js`.
  - Never allow regular users to access administrative endpoints or delete accounts without ownership verification.
- **Rate Limiting**:
  - Global limiter applied to `/api`.
  - Auth rate limiter applied to `/api/v1/auth/login` and `/api/v1/auth/register` to prevent brute-force credential stuffing.
- **Sanitization & Attack Prevention**:
  - `express-mongo-sanitize` prevents NoSQL injection attacks.
  - `hpp` prevents HTTP Parameter Pollution.
  - `helmet` sets hardened HTTP security headers.

---

## 3. OpenAPI 3.0 Documentation

- Interactive Swagger UI is hosted at `/api-docs`.
- When adding or modifying routes, document the endpoint using JSDoc OpenAPI annotations or keep `openapi.yaml` synchronized.
- Document status codes (200, 201, 400, 401, 403, 404, 422, 500) and schemas.

---

## Supporting References

- [REST API Conventions & Envelope Standards](./references/rest-conventions.md)
- [Security Hardening Runbook](./references/security-hardening.md)
- [OpenAPI Specification Guide](./references/openapi-specification.md)
