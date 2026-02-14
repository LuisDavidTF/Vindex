---
name: zustand-store
description: >
  Guidelines for global state management with Zustand.
  Trigger: When creating global stores, shared UI state, or managing session data.
license: Apache-2.0
metadata:
  author: fontstock-arch
  version: "1.0"
  scope: [ui]
  auto_invoke: "Managing Global App State"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Core Principles

1. **Minimalism**: Store only what needs to be global.
2. **Immutability**: Updates should be immutable (Zustand handles this well, but be careful with nested objects).
3. **Selectors**: Use selectors to prevent unnecessary re-renders.

## CRITICAL RULES

### 1. Store Definition
- **ALWAYS** define stores in `src/presentation/store/`.
- **Predefine** actions inside the store to modify the state.

```typescript
interface BearState {
  bears: number;
  increase: (by: number) => void;
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}));
```

### 2. Logic Separation
- **NEVER** put complex business logic inside the store actions. Call a UseCase, then update the store with the result.
- **Store = UI State** (loading, modal open, current user).
- **Domain = Business Logic**.

### 3. Selectors
- **ALWAYS** select only the state you need in a component.

```typescript
// Good
const bears = useBearStore((state) => state.bears);

// Bad (causes re-render on any change)
const { bears } = useBearStore();
```
