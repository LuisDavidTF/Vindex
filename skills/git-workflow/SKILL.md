---
name: git-workflow
description: Professional standards for Git version control, branching, and commit messages.
---

# Git Workflow Standards

Follow these guidelines to maintain a clean, professional history.

## 1. Commit Messages (Conventional Commits)
Format: `type(scope): subject`

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Example
```bash
git commit -m "feat(auth): implement login screen validation"
git commit -m "fix(db): resolve foreign key constraint error in products table"
```

## 2. Branching Strategy
- **`main`**: Production-ready code.
- **`develop`** (Optional): Integration branch.
- **Feature Branches**: `feature/short-description`
- **Bugfix Branches**: `fix/short-description` or `bugfix/short-description`

### Workflow
1. **Pull** latest changes: `git pull origin main`
2. **Create** branch: `git checkout -b feature/new-product-card`
3. **Work** & **Commit** often.
4. **Push**: `git push origin feature/new-product-card`
5. **PR**: Create Pull Request with description of changes.

## 3. Pull Request Template

```markdown
## Summary
[Brief description of changes]

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactor

## How was this tested?
- [ ] Manual verification
- [ ] Unit tests passed

## Screenshots (if UI change)
[Insert Screenshots]
```

## 4. Critical Rules
- **NEVER** commit secrets (.env files).
- **ALWAYS** run `npm run lint` or `npx expo typecheck` before committing.
- **SQUASH** or **REBASE** if history is messy before merging (collaborative projects).
