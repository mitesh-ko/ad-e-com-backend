# Tier Responsibilities and Layer Contracts

## Layer Interaction Invariants

```
HTTP Request
     │
     ▼
Route Middleware (Auth -> RBAC -> Validate)
     │
     ▼
Controller (Extract DTO -> Call Service -> ApiResponse.success)
     │
     ▼
Service (Business Logic -> Cache Check -> Call Repository -> Cache Write)
     │
     ▼
Repository (Query MongoDB / Mongoose -> Return Lean / Document)
```

## Layer Contracts Summary

| Layer | Input | Output | May Call | Must NOT Call |
| :--- | :--- | :--- | :--- | :--- |
| **Route** | Express Request | Express Pipeline | Middlewares, Controller | Services, Repositories, DB |
| **Controller** | `req.body`, `req.params`, `req.query`, `req.user` | `ApiResponse.success` | Service, `ApiResponse` | Repositories, Mongoose, DB |
| **Service** | Clean DTOs, IDs, User Context | Domain Entities, Paginated Results | Repository, `CacheService`, `TokenService` | Express `req`/`res`, Direct DB queries |
| **Repository** | Filter queries, IDs, Update payloads | Mongoose Documents or Lean Objects | Mongoose Model | Controller, HTTP headers, Cache |

---

## Dependency Injection Pattern

Always use default-parameter constructor injection for testability:

```typescript
// Service
export class OrderService {
  constructor(private orderRepo: OrderRepository = orderRepository) {}
}
export const orderService = new OrderService();

// Controller
export class OrderController {
  constructor(private orderService: OrderService = orderService) {}
}
export const orderController = new OrderController();
```

This allows unit tests to easily pass mock repositories and mock services into constructors without needing monkey patching.
