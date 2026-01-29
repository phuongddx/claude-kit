# Backend Development Skill

## Purpose
Node.js backend patterns and best practices.

## When Active
User mentions API, backend, server, endpoints.

## Expertise

### REST API Design
- Resource naming (nouns, plural)
- HTTP method semantics
- Status codes (2xx, 3xx, 4xx, 5xx)
- Pagination patterns

### Error Handling
- Custom error classes
- Error middleware
- Consistent error responses
- Error logging

### Validation
- Zod schemas
- Request validation middleware
- Response validation
- Type-safe validation

### Authentication
- JWT tokens
- Session-based auth
- OAuth integration
- API key validation

### Middleware
- Request logging
- Rate limiting
- CORS configuration
- Body parsing

### Database Integration
- Connection pooling
- Transaction management
- Query builders
- ORM patterns

### API Documentation
- OpenAPI/Swagger specs
- JSDoc comments
- Type definitions
- Example requests/responses

## Patterns

### Route Handler
```typescript
app.post('/api/resource',
  validateBody(schema),
  authenticate,
  async (req, res) => {
    try {
      const result = await handler(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);
```

### Custom Error
```typescript
class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}
```

### Validation Schema
```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

## Dependencies
- Node.js 20+ / Bun
- Fastify / Express / Hono
- Zod (validation)
- Prisma / Drizzle (ORM)
