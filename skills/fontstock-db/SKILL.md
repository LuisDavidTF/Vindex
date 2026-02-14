---
name: fontstock-db
description: >
  FontStock Database Schema and Seeding.
  Trigger: When defining tables, relations, or initial data.
license: Apache-2.0
metadata:
  author: fontstock-arch
  version: "1.0"
  scope: [data]
  auto_invoke:
    - "Defining Database Schemas (tables)"
    - "Seeding initial data (Brands, Boxes)"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Core Principles
1. **Normalization**: 3NF where possible, but pragmatic for mobile performance.
2. **Offline-First**: Schema must support synchronization indicators (dirty flags, last_updated).

## CRITICAL RULES

### 1. Table Names
- **ALWAYS** use singular nouns for table names in code variables (e.g., `productTable`) but plural in DB if Drizzle default (or consistent with team pref). *Correction: Drizzle often prefers single, but let's stick to what's defined in schema.ts. If unsure, check existing.*

### 2. Common Fields
- **ALWAYS** include `created_at` and `updated_at`.
- **ALWAYS** include `deleted_at` if soft delete is required.

### 3. Foreign Keys
- **ALWAYS** index foreign keys for query performance.