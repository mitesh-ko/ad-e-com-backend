# Security Hardening Runbook

## 1. Authentication & JWT Rotation
- Access tokens have short TTLs (15 minutes).
- Refresh tokens are stored in the database or Redis and rotated on each renewal.
- Passwords must be hashed using `bcryptjs` with a cost factor of at least 10 salt rounds.
- Never store raw passwords anywhere (logs, cache, or database).

---

## 2. Authorization (RBAC) & Ownership Checks
Two levels of authorization:
1. **Role-Based**: Checked via `authorize('admin')` middleware.
2. **Resource-Ownership**: Checked inside the Service layer:
   ```typescript
   if (currentUser.role !== 'admin' && currentUser.userId !== resource.ownerId) {
     throw new ForbiddenError('You do not have permission to modify this resource');
   }
   ```

---

## 3. Defense Against Injection & Pollution
- **NoSQL Injection**: Express Mongo Sanitize strips keys starting with `$` or containing `.`.
- **Parameter Pollution**: `hpp()` middleware prevents attacks passing multiple query parameters with the same name.
- **Cross-Site Scripting (XSS)**: Handled via Helmet CSP headers and JSON output encoding.
- **Regex Denial of Service (ReDoS)**: Always sanitize and escape regex special characters before using user input in `$regex` filters.
