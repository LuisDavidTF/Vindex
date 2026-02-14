---
name: learning-loop
description: Protocol for QA, error verification, and skill evolution to prevent recurring bugs.
---

# Learning Loop & Quality Assurance

This skill defines the protocol for verifying fixes and updating the knowledge base to prevent future errors.

## 1. Verification Protocol
**Trigger**: Immediately after applying a fix for a reported error (compiler error, runtime crash, logic bug).

**Action**:
1. Ask the User: "Does this fix work?" or "Is the issue resolved?".
2. Wait for confirmation.

## 2. Skill Evolution (The "Clause")
**Trigger**: User confirms the fix worked.

**Action**:
1. Identify the **Root Cause Skill**. (e.g., likely `react-native-style` for layout issues, `typescript-strict` for type errors, or `drizzle-orm` for SQL issues).
2. If no specific skill fits, update the most relevant `AGENTS.md`.
3. **Append** a new rule to the documentation using the strict format below.

### Rule Format (Strict)
You must document **WHY** it failed and **HOW** to solve it correcty.

```markdown
> [!CAUTION]
> **AVOID** [Specific Pattern/Code]
> **BECAUSE** [Reason/Context/Side-effect]
> **CORRECT APPROACH**: [Solution/Best Practice]
```

### Example
If the error was `Text strings must be rendered within a <Text> component`:

**Target File**: `skills/react-native-style/SKILL.md`

**Append**:
```markdown
> [!CAUTION]
> **AVOID** placing raw strings directly inside `<View>` or `<TouchableOpacity>`.
> **BECAUSE** React Native requires all text to be wrapped in `<Text>` components, otherwise it throws a runtime error.
> **CORRECT APPROACH**: Always wrap labels in `<Text>Label</Text>`.
```

## 3. Execution
When you encounter a similar task in the future, **ALWAYS** check the relevant `SKILL.md` for these `[!CAUTION]` blocks before generating code.
