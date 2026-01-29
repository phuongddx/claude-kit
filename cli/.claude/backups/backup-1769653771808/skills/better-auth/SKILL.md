# Better Auth Skill

## Purpose
Authentication implementation with better-auth.

## When Active
User mentions auth, login, OAuth, better-auth.

## Expertise

### Setup
- Installation
- Database adapter
- Environment configuration
- Base URL configuration

### Providers
- Google OAuth
- GitHub OAuth
- Email/password
- Magic links
- Multi-provider setup

### Session Management
- Session creation
- Session validation
- Session refresh
- Session termination

### Protected Routes
- Server-side checks
- Client-side checks
- Middleware protection
- API route guards

### TypeScript Integration
- Type-safe session
- User types
- Provider types
- Schema inference

### Testing Auth
- Mock session
- Test user creation
- Provider mocks
- Protected route tests

## Patterns

### Auth Configuration
```typescript
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: adapter,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId, clientSecret },
    github: { clientId, clientSecret }
  }
});
```

### Server-side Session Check
```typescript
export async function getSession() {
  return await auth.api.getSession({ headers: headers() });
}
```

### Protected Route
```typescript
import { auth } from '@/lib/auth';
export const GET = auth((req) => {
  if (!req.user) return new Response('Unauthorized', { status: 401 });
  // handle request
});
```

### Client-side Auth Hook
```typescript
import { useSession } from '@/lib/auth';

export function UserProfile() {
  const { data: session } = useSession();
  if (!session) return <LoginButton />;
  return <Welcome user={session.user} />;
}
```

### Sign In Handler
```typescript
import { auth } from '@/lib/auth';

app.post('/api/sign-in', async (req) => {
  const session = await auth.api.signInEmail({
    body: req.body
  });
  return session;
});
```

## Dependencies
- better-auth
- Database adapter (Prisma, Drizzle)
- OAuth provider credentials
