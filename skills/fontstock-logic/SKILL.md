---
name: fontstock-logic
description: >
  FontStock business logic for inventory (expiry, search indexing).
  Trigger: When calculating dates, validating product inputs, or implementing search filters.
license: Apache-2.0
metadata:
  author: fontstock-arch
  version: "1.0"
  scope: [domain, data]
  auto_invoke: "Calculating Expirations/Alerts"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Core Principles
1. **Accuracy**: Expiration calculations must be precise (time-zone aware).
2. **Performance**: Search indexing should not block the UI.
3. **Validation**: Strict input validation for product data.

## CRITICAL RULES

### 1. Expiration Logic
- **ALWAYS** calculate "Days Remaining" relative to the *start* of the current day.
- **Status Levels**:
  - `> 30 days`: Good
  - `<= 30 days`: Warning
  - `<= 7 days`: Critical
  - `<= 0 days`: Expired

### 2. Barcode Handling
- **ALWAYS** validate EAN-13 or UPC-A checksums if possible.
- **Strip** leading zeros for normalization if beneficial for search.

### 3. Search Indexing
- **Local Search**: When filtering products list, use a normalized string search (lowercase, accent-insensitive).
- **Debounce**: Always debounce search inputs by at least 300ms.
