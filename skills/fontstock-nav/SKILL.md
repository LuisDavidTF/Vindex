---
name: fontstock-nav
description: >
  FontStock Navigation guidelines (Expo Router).
  Trigger: When adding routes, links, or configuring layouts.
license: Apache-2.0
metadata:
  author: fontstock-arch
  version: "1.0"
  scope: [ui]
  auto_invoke: "Working on Navigation/Routing"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Core Principles
1. **File-based Routing**: The filesystem defines the routes.
2. **Type Safety**: Strictly typed route parameters.
3. **Deep Linking**: URLs should be meaningful.

## CRITICAL RULES

### 1. Structure
- `app/_layout.tsx`: Root layout (Providers, Theme, Stack).
- `app/(tabs)/`: file group for tab navigation.
- `app/product/[id].tsx`: Dynamic route for product details.

### 2. Linking
- **ALWAYS** use `<Link href="...">` or `router.push(...)`.
- **NEVER** use `React Navigation` props directly unless necessary (use `useRouter` hook).

### 3. Typing
- **ALWAYS** define search parameters interfaces for complex routes.
- **USE** `useLocalSearchParams<Params>()` to retrieve typed params.

### 4. Modals
- **USE** `presentation: 'modal'` in `_layout.tsx` for creation flows (e.g., "Add Product").
