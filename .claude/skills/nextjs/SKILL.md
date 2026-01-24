# Next.js Skill

## Purpose
Next.js 15 App Router expertise.

## When Active
User mentions Next.js, App Router, Server Components.

## Expertise

### App Router Structure
- app/ directory organization
- Route groups with ()
- Parallel routes
- Intercepting routes

### Server vs Client Components
- Server components by default
- 'use client' directive
- Server component composition
- Client boundaries

### Server Actions
- 'use server' directive
- Form actions
- Progressive enhancement
- Error handling

### Route Handlers
- route.ts files
- HTTP methods (GET, POST, etc.)
- Response helpers
- CORS configuration

### Data Fetching
- async/await in components
- fetch with caching options
- Static generation
- Dynamic rendering

### Optimization
- Image with next/image
- Font with next/font
- Script loading
- Bundle analysis

### Middleware
- middleware.ts
- Request modification
- Auth redirects
- Locale detection

## Patterns

### Server Component
```typescript
export default async function Page() {
  const data = await fetch('...');
  return <div>{data}</div>;
}
```

### Client Component
```typescript
'use client';
export function Interactive() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Server Action
```typescript
'use server';
export async function createAction(formData: FormData) {
  // server-side logic
}
```

### Route Handler
```typescript
export async function GET() {
  return Response.json({ data: '...' });
}
```

## Dependencies
- Next.js 15+
- React 19+
- TypeScript
