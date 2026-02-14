# FontStock Data Layer - AI Agent Ruleset

> **Skills Reference**: For detailed patterns, use these skills:
> - [`fontstock-db`](../../skills/fontstock-db/SKILL.md) - **The Source of Truth** for Schema, Tables & Relations.
> - [`drizzle-orm`](../../skills/drizzle-orm/SKILL.md) - Generic syntax for queries and migrations.
> - [`clean-arch`](../../skills/clean-arch/SKILL.md) - Rules for implementing Repositories.

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating or Modifying Tables (`schema.ts`) | `fontstock-db` |
| writing a Repository Implementation | `clean-arch` |
| Writing complex SQL queries (Joins, Aggregations) | `drizzle-orm` |
| Seeding initial data (Brands, Boxes) | `fontstock-db` |

---

## CRITICAL RULES - NON-NEGOTIABLE

### 1. Drizzle ORM & SQLite
- **ALWAYS**: Use `drizzle-orm/expo-sqlite` driver.
- **ALWAYS**: Define IDs as `integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true })`.
- **NEVER**: Use `better-sqlite3` or Node.js specific drivers (won't work on phone).
- **NEVER**: Write raw SQL inside repositories unless strictly necessary for performance. Use the Query Builder.

### 2. Repository Pattern
- **ALWAYS**: Implement interfaces defined in `src/domain/repositories/`.
- **ALWAYS**: Return Domain Entities, NOT Database Models. You must map data before returning.
  - *Example:* `dbProduct` (snake_case) -> `DomainProduct` (camelCase).
- **NEVER**: Return `drizzle` query results directly to the Presentation layer.

### 3. Offline & Async
- **ALWAYS**: All Repository methods must be `async` / `Promise<T>`.
- **ALWAYS**: Handle potential SQLite errors (locked DB, constraint violation) and throw Domain Errors.

---

## DECISION TREES

### Where does the code go?

Is it a Table definition? → src/data/local/schema.ts
Is it the DB connection setup? → src/data/local/database.ts
Is it a Repository Implementation? → src/data/repositories/{Entity}RepositoryImpl.ts
Is it a Data Mapper (DB -> Domain)? → src/data/mappers/{Entity}Mapper.ts


---

## TECH STACK
Drizzle ORM | Expo SQLite (Next) | TypeScript