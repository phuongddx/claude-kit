# Databases Skill

## Purpose
Database design and query optimization.

## When Active
User mentions database, SQL, schema, migration.

## Expertise

### Schema Design
- Entity relationships
- Normalization (1NF, 2NF, 3NF)
- Denormalization strategies
- Index selection

### Indexing Strategies
- Primary keys
- Foreign key indexes
- Composite indexes
- Partial indexes
- Covering indexes

### Query Optimization
- EXPLAIN analysis
- Query patterns
- JOIN optimization
- Subquery vs JOIN
- N+1 prevention

### Migration Patterns
- Version control
- Rollback strategies
- Data preservation
- Breaking changes

### ORM Usage
- Prisma patterns
- Drizzle ORM
- Type-safe queries
- Transaction handling

### Relationship Modeling
- One-to-one
- One-to-many
- Many-to-many
- Polymorphic relations

## Patterns

### Prisma Schema
```prisma
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

### Drizzle Schema
```typescript
export const users = pgTable('users', {
  id: text('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Transaction
```typescript
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: {...} });
  await tx.post.create({ data: {...} });
});
```

### Query with Relations
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  include: { posts: true }
});
```

### Migration
```bash
prisma migrate dev --name add_users_table
prisma migrate deploy
```

## Design Principles
- Normalize to 3NF initially
- Add indexes for frequent queries
- Consider denormalization for read-heavy workloads
- Use transactions for multi-step operations
- Foreign keys for referential integrity
- Cascade delete/update with caution

## Dependencies
- PostgreSQL (recommended)
- Prisma or Drizzle ORM
- Migration tools
