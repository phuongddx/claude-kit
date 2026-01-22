# Phase 4: Skills Implementation

## Overview
Create 11 core skills that provide domain-specific expertise for AI agents.

## Skill System Architecture

Skills are markdown files containing domain knowledge and best practices.

```
.claude/
└── skills/
    ├── frontend-development/
    │   └── SKILL.md
    ├── backend-development/
    │   └── SKILL.md
    ├── ios-development/
    │   └── SKILL.md
    ├── nextjs/
    │   └── SKILL.md
    ├── shadcn-ui/
    │   └── SKILL.md
    ├── planning/
    │   └── SKILL.md
    ├── research/
    │   └── SKILL.md
    ├── debugging/
    │   └── SKILL.md
    ├── better-auth/
    │   └── SKILL.md
    ├── databases/
    │   └── SKILL.md
    └── docker/
        └── SKILL.md
```

## Skill Template

```markdown
# [Skill Name] Skill

## Purpose
[Brief description of what this skill provides]

## When Active
[Conditions that activate this skill]

## Expertise

### [Category 1]
- [Best practice 1]
- [Best practice 2]

### [Category 2]
- [Best practice 1]
- [Best practice 2]

## Patterns

### Common Pattern 1
```typescript
// Example code
```

### Common Pattern 2
```typescript
// Example code
```

## Dependencies
- [Required tools/libraries]
- [Related skills]

## References
- [Official documentation]
- [Key resources]
```

## Skill Specifications

### 1. Frontend Development Skill

**Path**: `.claude/skills/frontend-development/SKILL.md`

**Purpose**: React/Next.js frontend patterns and best practices

**When Active**: User mentions React, frontend, UI components, hooks

**Content**:
- React hooks patterns (useState, useEffect, useContext, custom hooks)
- Component composition
- State management (Context, Zustand, Redux)
- Performance optimization (memo, useMemo, useCallback)
- TypeScript integration
- Testing (React Testing Library)

**Key Patterns**:
```typescript
// Custom hook pattern
function useFeature() {
  const [state, setState] = useState(null);
  useEffect(() => {
    // fetch/setup
  }, []);
  return { state, actions };
}

// Component pattern
interface Props {
  prop1: string;
  onAction: () => void;
}
export function Component({ prop1, onAction }: Props) {
  // implementation
}
```

---

### 2. Backend Development Skill

**Path**: `.claude/skills/backend-development/SKILL.md`

**Purpose**: Node.js backend patterns and best practices

**When Active**: User mentions API, backend, server, endpoints

**Content**:
- REST API design
- Error handling patterns
- Validation (Zod, Joi)
- Authentication (JWT, sessions)
- Middleware patterns
- Database integration
- API documentation (OpenAPI)

**Key Patterns**:
```typescript
// Route handler pattern
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

// Error handling
class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}
```

---

### 3. iOS Development Skill

**Path**: `.claude/skills/ios-development/SKILL.md`

**Purpose**: Modern iOS development (Swift 6, iOS 18+, SwiftUI, UIKit)

**When Active**: User mentions iOS, Swift, SwiftUI, UIKit, iPhone app, iPad app

**Content**:
- Swift 6 concurrency (async/await, Sendable, actors)
- SwiftUI vs UIKit decision framework
- Architecture patterns (MVVM, TCA)
- State management (@Observable, property wrappers)
- NavigationStack and navigation patterns
- Networking with async URLSession
- SwiftData and persistence strategies
- Testing (XCTest, XCUITest)
- Performance optimization
- SPM dependencies

**Key Patterns**:
```swift
// @Observable (iOS 17+)
@Observable
class ProductsViewModel {
    var products: [Product] = []
    var isLoading = false

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }
        products = try await productService.fetch()
    }
}

// NavigationStack pattern
enum Route: Hashable {
    case product(Product)
    case settings
}

struct AppView: View {
    @State private var path: [Route] = []

    var body: some View {
        NavigationStack(path: $path) {
            HomeView()
                .navigationDestination(for: Route.self) { route in
                    // route handling
                }
        }
    }
}

// Swift 6 concurrency
actor NetworkManager {
    func fetch(_ url: URL) async throws -> Data {
        // Thread-safe networking
    }
}
```

**Tech Stack**:
- iOS 18+ SDK, Swift 6.0+
- SwiftUI (primary), UIKit (fallback)
- SwiftData for persistence
- XCTest/XCUITest for testing

---

### 4. Next.js Skill

**Path**: `.claude/skills/nextjs/SKILL.md`

**Purpose**: Next.js 15 App Router expertise

**When Active**: User mentions Next.js, App Router, Server Components

**Content**:
- App Router structure
- Server vs Client Components
- Server Actions
- Route handlers
- Middleware
- Data fetching patterns
- Image optimization
- Font optimization

**Key Patterns**:
```typescript
// Server Component
export default async function Page() {
  const data = await fetch('...');
  return <div>{data}</div>;
}

// Client Component
'use client';
export function Interactive() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// Server Action
'use server';
export async function createAction(formData: FormData) {
  // server-side logic
}
```

---

### 5. shadcn-ui Skill

**Path**: `.claude/skills/shadcn-ui/SKILL.md`

**Purpose**: Radix UI + Tailwind component patterns

**When Active**: User mentions shadcn, Radix, accessible components

**Content**:
- Component installation
- Component composition
- Theming
- Accessibility
- Form integration
- Dialog/Sheet patterns

**Key Patterns**:
```typescript
// Component usage
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>Content</DialogContent>
    </Dialog>
  );
}

// Form integration
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
```

---

### 6. Planning Skill

**Path**: `.claude/skills/planning/SKILL.md`

**Purpose**: Transform requirements into actionable plans

**When Active**: User uses /plan, asks for implementation plan

**Content**:
- Requirements analysis
- Task breakdown
- Dependency identification
- Risk assessment
- Resource estimation
- Timeline planning

**Planning Framework**:
1. **Understand**: Clarify requirements
2. **Decompose**: Break into smaller tasks
3. **Sequence**: Order tasks by dependency
4. **Estimate**: Time/complexity per task
5. **Identify**: Potential blockers
6. **Document**: Create structured plan

**Output Format**:
```markdown
# Plan: [Feature]

## Overview
[Summary]

## Tasks
1. [Task] - [Estimate]
2. [Task] - [Estimate]

## Dependencies
- [External dependency]
- [Internal dependency]

## Risks
- [Potential risk] - [Mitigation]

## Success Criteria
- [Criteria 1]
- [Criteria 2]
```

---

### 7. Research Skill

**Path**: `.claude/skills/research/SKILL.md`

**Purpose**: Multi-source information gathering and validation

**When Active**: User asks for research, best practices, comparison

**Content**:
- Source evaluation
- Information synthesis
- Cross-validation
- Documentation navigation
- Code example discovery
- Trend analysis

**Research Process**:
1. **Define**: What are we researching?
2. **Search**: Multiple sources (docs, blogs, repos)
3. **Evaluate**: Source credibility and recency
4. **Synthesize**: Combine findings
5. **Validate**: Cross-check across sources
6. **Document**: Organized findings

**Source Priority**:
1. Official documentation (highest)
2. Official examples/tutorials
3. Well-known community resources
4. GitHub repositories with activity
5. Stack Overflow (for specific issues)

---

### 8. Debugging Skill

**Path**: `.claude/skills/debugging/SKILL.md`

**Purpose**: Systematic debugging methodology

**When Active**: User uses /debug, reports errors

**Content**:
- Systematic Debugging Framework
- Log analysis
- Stack trace interpretation
- Reproduction strategies
- Root cause analysis
- Fix validation

**Debugging Framework**:
1. **Understand**: What's the symptom?
2. **Reproduce**: Can you reproduce it?
3. **Isolate**: What's the minimal case?
4. **Analyze**: What's actually happening?
5. **Hypothesize**: What could cause this?
6. **Verify**: Does the fix work?

**Common Patterns**:
```typescript
// Logging for debugging
console.log('[Feature]', { variable, state });

// Error boundaries
class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
}

// Debug mode
const DEBUG = process.env.DEBUG === 'true';
if (DEBUG) console.debug('Debug info');
```

---

### 9. Better Auth Skill

**Path**: `.claude/skills/better-auth/SKILL.md`

**Purpose**: Authentication implementation with better-auth

**When Active**: User mentions auth, login, OAuth, better-auth

**Content**:
- better-auth setup
- Provider configuration (Google, GitHub, email)
- Session management
- Protected routes
- TypeScript integration
- Testing auth

**Key Patterns**:
```typescript
// Auth configuration
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: adapter,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId, clientSecret },
    github: { clientId, clientSecret }
  }
});

// Server-side session check
export async function getSession() {
  return await auth.api.getSession({ headers: headers() });
}

// Protected route
import { auth } from '@/lib/auth';
export const GET = auth((req) => {
  if (!req.user) return new Response('Unauthorized', { status: 401 });
  // handle request
});
```

---

### 10. Databases Skill

**Path**: `.claude/skills/databases/SKILL.md`

**Purpose**: Database design and query optimization

**When Active**: User mentions database, SQL, schema, migration

**Content**:
- Schema design principles
- Indexing strategies
- Query optimization
- Migration patterns
- ORM usage (Prisma, Drizzle)
- Relationship modeling

**Key Patterns**:
```prisma
// Prisma schema pattern
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}
```

**Design Principles**:
- Normalize to 3NF
- Use appropriate indexes
- Consider denormalization for read-heavy workloads
- Use transactions for multi-step operations
- Add foreign keys for referential integrity

---

### 11. Docker Skill

**Path**: `.claude/skills/docker/SKILL.md`

**Purpose**: Containerization for development and deployment

**When Active**: User mentions Docker, container, deployment

**Content**:
- Dockerfile patterns
- Docker Compose
- Multi-stage builds
- Volume management
- Network configuration
- Production optimization

**Key Patterns**:
```dockerfile
# Multi-stage Node.js build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
CMD ["node", "dist/index.js"]
```

```yaml
# Docker Compose for development
version: '3.8'
services:
  app:
    build: .
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
  db:
    image: postgres:15
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret

volumes:
  postgres-data:
```

---

## Files to Create

| Skill File | Lines Estimate | Priority |
|------------|---------------|----------|
| `.claude/skills/frontend-development/SKILL.md` | 150 | P0 |
| `.claude/skills/backend-development/SKILL.md` | 150 | P0 |
| `.claude/skills/ios-development/SKILL.md` | 180 | P0 |
| `.claude/skills/nextjs/SKILL.md` | 180 | P0 |
| `.claude/skills/shadcn-ui/SKILL.md` | 120 | P0 |
| `.claude/skills/planning/SKILL.md` | 100 | P0 |
| `.claude/skills/research/SKILL.md` | 100 | P0 |
| `.claude/skills/debugging/SKILL.md` | 120 | P0 |
| `.claude/skills/better-auth/SKILL.md` | 140 | P0 |
| `.claude/skills/databases/SKILL.md` | 130 | P0 |
| `.claude/skills/docker/SKILL.md` | 110 | P0 |

**Total**: ~1,480 lines across 11 files

## Skill Activation

Skills activate through:
1. **Semantic matching**: Keywords in user prompt
2. **Explicit mention**: User names the skill
3. **Task context**: Description matches skill domain
4. **File analysis**: Related files detected

## Verification

```bash
# Test frontend skill
/cook create a React component with hooks

# Test ios skill
/cook create a SwiftUI view with NavigationStack

# Test nextjs skill
/cook add a server component with data fetching

# Test shadcn-ui skill
/cook create a form with shadcn components

# Test better-auth skill
/cook add Google OAuth authentication

# Test docker skill
/cook create a Dockerfile for production
```

## Future Skills (Not in Phase 4)

### Frontend
- `ui-styling` - Tailwind patterns
- `frontend-design` - UI/UX implementation
- `frontend-design-pro` - Agency-grade UI
- `threejs` - 3D web experiences

### Backend
- `postgresql-psql` - PostgreSQL specific
- `devops` - CI/CD and deployment

### Tools
- `mcp-builder` - Build MCP servers
- `mcp-management` - Use MCP tools
- `skill-creator` - Create custom skills

### Integrations
- `shopify` - Shopify apps
- `payment-integration` - Stripe, PayPal
- `ai-multimodal` - AI vision/audio

### Process
- `systematic-debugging` - Advanced debugging
- `problem-solving` - Problem frameworks
- `code-review` - Code review patterns
- `sequential-thinking` - Chain of thought

### Content
- `copywriting` - Marketing copy
- `document-skills` - Document processing

### Media
- `media-processing` - Audio/video
- `ffmpeg` - Video processing
- `imagemagick` - Image manipulation

### Mobile (Additional)
- `android-development` - Kotlin/Jetpack Compose
- `react-native` - Cross-platform mobile
- `flutter` - Dart-based mobile apps
