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

## 4. Skill Categorization (Modularity)
The protocol does not store everything in a single giant file. By separating content into folders (e.g., `skills/auth/`, `skills/ui/`, `skills/database/`), information is fragmented into digestible pieces.

**Benefit**: I only read the "Skill" relevant to the current task, saving memory and processing time.

## 5. Rule Refactoring
When a list of `[!CAUTION]` blocks becomes too long, the protocol evolves:

**From Rules to Patterns**: If there are 10 distinct errors about handling dates, instead of 10 separate warnings, create a single "Standard Operating Procedure" (SOP) in the `SKILL.md` summarizing the definitive way to work with dates.

**Hierarchy**: Critical rules (system-breaking) remain at the top; subtler ones are archived or integrated into style guides.

## 6. The Project "Brain"
As the project grows, the repository becomes an engineering asset.

**For You**: It serves as an encyclopedia of *why* certain technical decisions were made (historical context).

**For New Developers (or IAs)**: Instead of weeks of training, they simply read the Skills to understand exactly what **NOT** to do.

## 7. Missing Skill Clause
If a problem arises that does not fit into any existing skill, it likely indicates a missing skill category.

**Action**:
1. Identify that the issue requires a new skill.
2. **Consult the User**: Ask for permission before creating a new skill.
3. Upon approval, create the skill and document the error/rule within it.
