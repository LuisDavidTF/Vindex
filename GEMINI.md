# Repository Guidelines - FontStock

## How to Use This Guide

- Start here for cross-project norms.
- FontStock follows a **Strict Clean Architecture** pattern.
- Each layer has an `AGENTS.md` file with specific guidelines (e.g., `src/presentation/AGENTS.md`, `src/data/AGENTS.md`).
- Layer docs override this file when guidance conflicts.

## Available Skills

Use these skills for detailed patterns on-demand:

### Generic Skills (Stack)
| Skill | Description | URL |
|-------|-------------|-----|
| `typescript-strict` | Const types, flat interfaces, strict null checks | [.agent/skills/typescript-strict/SKILL.md](.agent/skills/typescript-strict/SKILL.md) |
| `expo-managed` | Expo workflow, config plugins, permissions | [.agent/skills/expo-managed/SKILL.md](.agent/skills/expo-managed/SKILL.md) |
| `react-native-style` | Flexbox patterns, StyleSheet, performance | [.agent/skills/react-native-style/SKILL.md](.agent/skills/react-native-style/SKILL.md) |
| `drizzle-orm` | Schema definitions, migrations, query builders | [.agent/skills/drizzle-orm/SKILL.md](.agent/skills/drizzle-orm/SKILL.md) |
| `clean-arch` | Dependency rules, UseCase patterns, Repo interfaces | [.agent/skills/clean-arch/SKILL.md](.agent/skills/clean-arch/SKILL.md) |
| `zustand-store` | Global state, selectors, middleware | [.agent/skills/zustand-store/SKILL.md](.agent/skills/zustand-store/SKILL.md) |

### FontStock-Specific Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `fontstock-ui` | Paper theme, reusable components, Lucide icons | [.agent/skills/fontstock-ui/SKILL.md](.agent/skills/fontstock-ui/SKILL.md) |
| `fontstock-db` | Specific inventory schemas (Product, Box, Brand) | [.agent/skills/fontstock-db/SKILL.md](.agent/skills/fontstock-db/SKILL.md) |
| `fontstock-logic` | Expiry calculations, search indexing logic | [.agent/skills/fontstock-logic/SKILL.md](.agent/skills/fontstock-logic/SKILL.md) |
| `fontstock-nav` | Expo Router file structure and typing | [.agent/skills/fontstock-nav/SKILL.md](.agent/skills/fontstock-nav/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating/modifying UI Components | `fontstock-ui` |
| Working on Navigation/Routing | `fontstock-nav` |
| Defining Database Schemas (tables) | `fontstock-db` |
| Writing SQL Queries or Migrations | `drizzle-orm` |
| Creating/modifying UseCases (Domain) | `clean-arch` |
| Managing Global App State | `zustand-store` |
| Calculating Expirations/Alerts | `fontstock-logic` |
| Configuring Expo (app.json) | `expo-managed` |
| Writing TypeScript Interfaces | `typescript-strict` |

---

## CRITICAL RULES - NON-NEGOTIABLE

### Clean Architecture Boundaries
- **ALWAYS**: `Presentation` depends on `Domain`. `Data` depends on `Domain`.
- **NEVER**: `Domain` imports from `Presentation` or `Data`.
- **NEVER**: `Presentation` imports directly from `Data` (No DB calls in UI).

### React Native & Expo
- **ALWAYS**: Use `StyleSheet.create` or `react-native-paper` theme hooks.
- **NEVER**: Use inline styles for complex objects.
- **NEVER**: Use HTML tags (`div`, `span`, `img`). ALWAYS use `<View>`, `<Text>`, `<Image>`.
- **NEVER**: Edit `android/` or `ios/` folders directly (Prebuild workflow).

### Database (Offline First)
- **ALWAYS**: Use `drizzle-orm` type-safe queries.
- **NEVER**: Hardcode raw SQL strings outside of migration files.
- **ALWAYS**: Handle async DB operations with try/catch.

---

## DECISION TREES

### Component Placement (Presentation)
Screen (Full Page) → src/presentation/screens/{Feature}/
Reusable UI Element → src/presentation/components/ui/
Feature Specific Component → src/presentation/components/{Feature}/
Logic/State Hook → src/presentation/hooks/


### Logic Placement
Business Rule (Pure) → src/domain/usecases/
Data Fetching/Saving → src/data/repositories/
UI State (Open/Close) → Zustand Store or Local State


---

## TECH STACK

Expo (Managed) | React Native | TypeScript | Drizzle ORM
SQLite (expo-sqlite) | React Native Paper | Zustand | Expo Router

---

## QA CHECKLIST BEFORE COMMIT

- [ ] `npx expo typecheck` passes
- [ ] `npm run lint` passes
- [ ] No direct DB calls in UI files
- [ ] Imports respect Clean Architecture layers
- [ ] New Dependencies added via `npx expo install`