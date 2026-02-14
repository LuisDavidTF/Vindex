---
name: fontstock-ui
description: >
  FontStock UI guidelines (Paper theme, reusable components, Lucide icons).
  Trigger: When creating screens, components, or styling UI elements.
license: Apache-2.0
metadata:
  author: fontstock-arch
  version: "1.0"
  scope: [ui]
  auto_invoke:
    - "Creating/modifying UI Components"
    - "Styling a component"
    - "Adding an Icon"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Core Principles
1. **Material Design 3**: Leveraging `react-native-paper` for all core components.
2. **Consistency**: Use the `src/presentation/theme/` definitions.
3. **Icons**: Use `lucide-react-native` for all icons.

## CRITICAL RULES

### 1. Theming
- **ALWAYS** use `useTheme` hook to access colors.
- **NEVER** hardcode colors.

```typescript
const theme = useTheme();
<Text style={{ color: theme.colors.primary }}>Hello</Text>
```

### 2. Components
- **ALWAYS** prefer Paper components (`Button`, `Card`, `TextInput`) over raw React Native ones unless customizing heavily.
- **ALWAYS** place reusable UI components in `src/presentation/components/ui/`.

### 3. Icons
- **ALWAYS** use `lucide-react-native`.
- **Size**: Default to `size={24}` unless specified.
- **Color**: Use theme colors.

```typescript
import { Box } from 'lucide-react-native';
<Box color={theme.colors.onSurface} size={24} />
```

### 4. Layout
- **Spacing**: Use multiples of 4 or 8 (e.g., 4, 8, 16, 24, 32).
- **Typography**: Use standard variants: `displayLarge`, `headlineMedium`, `bodyMedium`, `labelSmall`.
