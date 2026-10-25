# REST Conventions & Standard Envelope Format

## 1. Response Envelope Format

All API responses conform to the following contract:

### Success Response (HTTP 200/201)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User fetched successfully",
  "data": {
    "id": "64e72f...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Error Response (HTTP 4xx/5xx)
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation Failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```

---

## 2. Status Code Selection Guide
- `200 OK`: Successful read, update, or synchronous delete with message.
- `201 Created`: Successful resource creation.
- `400 Bad Request`: General malformed syntax or illegal request format.
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: Authenticated user does not possess required role or ownership.
- `404 Not Found`: Resource does not exist in the database.
- `409 Conflict`: Unique constraint violation (e.g. duplicate email, SKU).
- `422 Unprocessable Entity`: Semantic validation failure (Zod validation error).
- `500 Internal Server Error`: Unhandled system failure.
