---
name: drizzle-orm
description: >
  Guidelines for using Drizzle ORM with SQLite.
  Trigger: When writing SQL queries, migrations, or modifying schema definitions.
license: Apache-2.0
metadata:
  author: fontstock-arch
  version: "1.0"
  scope: [data]
  auto_invoke: "Writing SQL Queries or Migrations"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## CRITICAL RULES

### 1. Schema Definitions
- **ALWAYS** define tables in `src/data/local/schema.ts` (or modular files imported there).
- **ALWAYS** use `integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true })` for IDs in SQLite.
- **ALWAYS** use `text` for dates (ISO 8601 strings) and booleans (0/1 or 'true'/'false' depending on preference, but be consistent).

### 2. Migrations
- **ALWAYS** generate migrations with `drizzle-kit generate` after modifying the schema.
- **NEVER** edit the generated `.sql` files manually unless fixing a specific complex migration issue.

### 3. Queries
- **ALWAYS** use the query builder pattern: `db.select().from(table).where(...)`.
- **PREFER** `db.query.table.findMany(...)` for relation fetching as it's more readable.
- **ALWAYS** await database operations.

```typescript
// Example
const users = await db.select().from(usersTable).where(eq(usersTable.active, true));
```

### 4. Relations
- **ALWAYS** define relations using `relations()` for easier querying, even if strict foreign keys are enforced at the DB level.
