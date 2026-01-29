# Project Initialization Workflow

## Trigger
User wants to start a new project.

## Steps

### 1. Bootstrap
**Command**: `/bootstrap [project description]`
**Agent**: fullstack-developer
**Output**: New project structure

The developer agent:
- Asks for project type
- Recommends tech stack
- Creates project structure
- Generates initial files
- Sets up configuration

### 2. Initial Commit
**Command**: `/git:cm`
**Agent**: git-manager
**Output**: First commit

## Flow Diagram
```mermaid
graph LR
    A[New Project] --> B[/bootstrap command]
    B --> C[fullstack-developer]
    C --> D[Project created]
    D --> E[/git:cm command]
    E --> F[git-manager]
    F --> G[Initial commit]
```

## Tech Stack Recommendations

### Web Application
- **Framework**: Next.js 15
- **UI**: shadcn-ui
- **Styling**: Tailwind CSS
- **Auth**: better-auth
- **DB**: PostgreSQL + Prisma

### API
- **Runtime**: Node.js/Bun
- **Framework**: Fastify/Hono
- **Validation**: Zod
- **Docs**: OpenAPI

### Library
- **Language**: TypeScript
- **Builder**: tsup/unbuild
- **Test**: Vitest
- **Docs**: TypeDoc

## Initial Files Created
- README.md
- .gitignore
- package.json
- tsconfig.json
- src/
- .claude/ (with ClaudeKit)

## Estimated Time
5-10 minutes
