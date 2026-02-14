# FontStock Presentation Layer - AI Agent Ruleset

> **Skills Reference**: For detailed patterns, use these skills:
> - [`fontstock-ui`](../../skills/fontstock-ui/SKILL.md) - **Design System**, Colors, Typography & Icons.
> - [`zustand-store`](../../skills/zustand-store/SKILL.md) - Global UI State (Modals, Filters).
> - [`clean-arch`](../../skills/clean-arch/SKILL.md) - ViewModels & UseCase connections.
> - [`expo-managed`](../../skills/expo-managed/SKILL.md) - Navigation & Safe Areas.

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating a new Screen (`.tsx`) | `fontstock-ui` |
| Styling a component | `fontstock-ui` |
| Adding an Icon | `fontstock-ui` |
| Managing simple state (loading, errors) | `react-native-style` |
| Connecting UI to Business Logic | `clean-arch` |

---

## CRITICAL RULES - NON-NEGOTIABLE

### 1. Zero Business Logic in UI
- **ALWAYS**: Pass actions to a Custom Hook (ViewModel) or a Zustand store.
- **NEVER**: Write `useEffect` with complex calculations or data filtering inside a generic Component.
- **NEVER**: Import `drizzle-orm` or DB repositories directly here. UI only speaks to Domain.

### 2. React Native Paper & Theming
- **ALWAYS**: Use `useTheme()` from `react-native-paper`.
- **NEVER**: Hardcode Hex colors (e.g., `#FFFFFF`) in styles. Use `theme.colors.surface`.
- **ALWAYS**: Use `<Text variant="...">` for typography consistency.

### 3. Folder Structure (Feature-First)
- **Screens**: `src/presentation/screens/{FeatureName}/`
- **Components**: `src/presentation/components/{FeatureName}/` (if specific) or `src/presentation/components/ui/` (if generic).
- **Hooks/ViewModels**: `src/presentation/hooks/`

### 4. Responsiveness
- **ALWAYS**: Wrap top-level screens in `<SafeAreaView>` (from `react-native-safe-area-context`).
- **ALWAYS**: Use `KeyboardAvoidingView` for forms.

---

## DECISION TREES

### Component Composition
Is it a full page? → Screen (src/presentation/screens/)
Is it a reusable button/card? → Component (src/presentation/components/ui/)
Is it a complex list item (ProductCard)? → Component (src/presentation/components/inventory/)


### State Management
Is it form data? → React Hook Form
Is it global (User Preferences, Filter Mode)? → Zustand
Is it local (Accordion open/close)? → useState