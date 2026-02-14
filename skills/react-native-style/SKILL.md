---
name: react-native-style
description: >
  Guidelines for styling in React Native (Flexbox, StyleSheet).
  Trigger: When styling components, fixing layout issues, or adding visual effects.
license: Apache-2.0
metadata:
  author: fontstock-arch
  version: "1.0"
  scope: [ui]
  auto_invoke: "Managing simple state (loading, errors)"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Core Principles

1. **Performance**: Styles should be created outside the render cycle.
2. **Consistency**: Use a design system or theme hooks.
3. **Responsiveness**: Design for flexible screen sizes.

## CRITICAL RULES

### 1. StyleSheet.create
- **ALWAYS** use `StyleSheet.create({})` to define styles.
- **NEVER** use inline object literals for styles (e.g., `style={{ margin: 10 }}`) as this causes re-renders and strictly hurts performance.

```typescript
// Bad
<View style={{ flex: 1, backgroundColor: 'white' }} />

// Good
<View style={styles.container} />

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
```

### 2. Flexbox
- **ALWAYS** use Flexbox for layout.
- **AVOID** absolute positioning unless creating overlays or specific UI effects.
- **USE** `flex: 1` to fill available space.

### 3. Safe Areas
- **ALWAYS** use `SafeAreaView` (from `react-native-safe-area-context`) for top-level screen containers to handle notches and home indicators.

### 4. Text and Fonts
- **NEVER** put text directly inside a `View` without a `Text` component.
- **ALWAYS** use the theme's typography scale (e.g., `variant="bodyMedium"`).
