# Phase 0: Project Setup + TDD Infrastructure

## Objective

Set up the TypeScript/Node.js project with Vitest for TDD, establishing the foundation for test-driven development of the CLI Task Manager.

---

## TDD Cycle

```
┌────────────────────────────────────────────────────────┐
│                    TDD Cycle                           │
│                                                        │
│    RED            GREEN          REFACTOR              │
│    Write a         Write minimal   Improve code        │
│    failing test    code to pass    without changing    │
│                                    behavior            │
│                                                        │
│         ───────────────────────────────────────►       │
│                     Repeat                             │
└────────────────────────────────────────────────────────┘
```

---

## Steps

### Step 0.1: Initialize Project Structure

**Actions:**

```bash
# Navigate to project directory
cd backend-roadmap/level-01-student/01-cli-task-manager-help-understanding/01-plain-nodejs-with-ai

# Initialize package.json (if not already present)
npm init -y

# Install dependencies
npm install -D typescript @types/node tsx vitest
```

### Step 0.2: Configure TypeScript

**Create/Update `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 0.3: Configure Package Scripts

**Update `package.json`:**

```json
{
  "name": "task-cli",
  "version": "1.0.0",
  "description": "CLI Task Manager with JSON persistence",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "task": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "task": "tsx src/index.ts",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "keywords": ["cli", "task", "manager"],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Step 0.4: Configure Vitest

**Create `vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts']
    }
  }
});
```

### Step 0.5: Create Initial Project Structure

**Directory Structure (Phase 0 only):**

> **Note:** This shows only the files created in Phase 0. Additional source files (types.ts, cli.ts, task.ts, storage.ts, etc.) will be created in subsequent phases.

```
01-plain-nodejs-with-ai/
├── src/
│   └── index.ts           # Entry point (placeholder)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**Create `src/index.ts` (placeholder):**

```typescript
#!/usr/bin/env node

// CLI Task Manager - Entry Point
// This file will be implemented in Phase 1

console.log('CLI Task Manager - Setup complete!');
console.log('Run "npm test" to verify the TDD infrastructure.');
```

### Step 0.6: Verify TDD Setup

**Create `src/setup.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';

describe('TDD Setup Verification', () => {
  it('should run a passing test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve('hello');
    expect(result).toBe('hello');
  });
});
```

**Run tests:**

```bash
npm test
```

**Expected Output:**

```
 ✓ src/setup.test.ts (2)
   ✓ TDD Setup Verification (2)
     ✓ should run a passing test
     ✓ should support async tests

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

### Step 0.7: Clean Up Verification Test

Once tests are verified working, delete the setup test file:

```bash
rm src/setup.test.ts
```

> **Note:** This file was only for verifying the TDD infrastructure. It is not part of the final project.

---

## Milestone Checklist

| Task | Status |
|------|--------|
| TypeScript configured with strict mode | ☐ |
| Vitest installed and configured | ☐ |
| Package scripts working (`npm test`, `npm run task`) | ☐ |
| Initial test file passes | ☐ |
| Project structure created | ☐ |
| Setup test file cleaned up | ☐ |

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modified | Add scripts and dependencies |
| `tsconfig.json` | Created | TypeScript configuration |
| `vitest.config.ts` | Created | Test runner configuration |
| `src/index.ts` | Created | Entry point placeholder |
| `src/setup.test.ts` | Created → Deleted | Verify TDD setup works (temporary) |

---

## Next Phase

[Phase 1: Foundation →](./phase-01.md)
