---
name: expo-managed
description: >
  Expo Managed Workflow guidelines.
  Trigger: When configuring app.json, installing native libraries, or dealing with permissions/plugins.
license: Apache-2.0
metadata:
  author: fontstock-arch
  version: "1.0"
  scope: [root]
  auto_invoke: "Configuring Expo (app.json)"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Core Principles

1. **Configuration as Code**: All native configuration goes into `app.json` or Config Plugins.
2. **Prebuild First**: Do not rely on committing `android/` or `ios/` folders.
3. **Expo APIs**: Prefer `expo-*` packages over unmaintained bare react-native libraries.

## CRITICAL RULES

### 1. `app.json` / `app.config.ts`
- **ALWAYS** use `app.json` for static config and `app.config.ts` if you need dynamic environment variables.
- **NEVER** manually edit `Info.plist` or `AndroidManifest.xml` natively. Use `cnal`, `mods`, or config plugins.

### 2. Native Dependencies
- **ALWAYS** install libraries using `npx expo install` to ensure version compatibility.
- **CHECK** if a library requires a config plugin before installing.

### 3. Environment Variables
- **ALWAYS** use `expo-constants` for public keys.
- **NEVER** commit secret keys to the repo.

### 4. Updates & OTA
- **UNDERSTAND** that modifying native code (adding a new library with native code) requires a new Development Build, simply refreshing the bundler won't work.
