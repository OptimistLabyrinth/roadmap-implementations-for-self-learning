# Phase 2: Persistence

## Objective

Implement JSON file storage to persist tasks across CLI sessions. Create, read, and write to `tasks.json` with proper error handling.

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

### Step 2.1: Implement Storage Module - Read Operations

#### RED: Write failing test

**Create `src/storage.test.ts`:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, rmSync, chmodSync } from 'fs';
import { join } from 'path';
import { loadTasks, saveTasks, DEFAULT_STORE } from './storage.js';
import type { TaskStore } from './types.js';

const TEST_DIR = join(process.cwd(), '.test-data');
const TEST_FILE = join(TEST_DIR, 'tasks.json');

describe('Storage Module', () => {
  beforeEach(() => {
    // Create test directory
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
    // Clean up any existing test file
    if (existsSync(TEST_FILE)) {
      unlinkSync(TEST_FILE);
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('loadTasks', () => {
    it('should return default store when file does not exist', () => {
      const store = loadTasks(TEST_FILE);

      expect(store).toEqual(DEFAULT_STORE);
    });

    it('should load tasks from existing file', () => {
      const existingStore: TaskStore = {
        tasks: [
          {
            id: 1,
            description: 'Existing task',
            status: 'todo',
            dueDate: null,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ],
        nextId: 2
      };
      writeFileSync(TEST_FILE, JSON.stringify(existingStore, null, 2));

      const store = loadTasks(TEST_FILE);

      expect(store.tasks).toHaveLength(1);
      expect(store.tasks[0].description).toBe('Existing task');
      expect(store.nextId).toBe(2);
    });

    it('should return default store when file contains invalid JSON', () => {
      writeFileSync(TEST_FILE, 'not valid json {{{');

      const store = loadTasks(TEST_FILE);

      expect(store).toEqual(DEFAULT_STORE);
    });

    it('should return default store when file is empty', () => {
      writeFileSync(TEST_FILE, '');

      const store = loadTasks(TEST_FILE);

      expect(store).toEqual(DEFAULT_STORE);
    });
  });

  describe('saveTasks', () => {
    it('should save tasks to file', () => {
      const store: TaskStore = {
        tasks: [
          {
            id: 1,
            description: 'New task',
            status: 'in-progress',
            dueDate: '2025-12-25',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-02T00:00:00Z'
          }
        ],
        nextId: 2
      };

      saveTasks(TEST_FILE, store);

      const savedContent = readFileSync(TEST_FILE, 'utf-8');
      const savedStore = JSON.parse(savedContent);
      expect(savedStore.tasks).toHaveLength(1);
      expect(savedStore.tasks[0].description).toBe('New task');
    });

    it('should create file if it does not exist', () => {
      const store: TaskStore = { tasks: [], nextId: 1 };

      saveTasks(TEST_FILE, store);

      expect(existsSync(TEST_FILE)).toBe(true);
    });

    it('should create parent directories if they do not exist', () => {
      const nestedFile = join(TEST_DIR, 'nested', 'dir', 'tasks.json');
      const store: TaskStore = { tasks: [], nextId: 1 };

      saveTasks(nestedFile, store);

      expect(existsSync(nestedFile)).toBe(true);
    });

    it('should overwrite existing file', () => {
      const initialStore: TaskStore = { tasks: [], nextId: 1 };
      saveTasks(TEST_FILE, initialStore);

      const updatedStore: TaskStore = {
        tasks: [
          {
            id: 1,
            description: 'Updated',
            status: 'done',
            dueDate: null,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ],
        nextId: 2
      };
      saveTasks(TEST_FILE, updatedStore);

      const store = loadTasks(TEST_FILE);
      expect(store.tasks).toHaveLength(1);
      expect(store.tasks[0].description).toBe('Updated');
    });
  });

  describe('DEFAULT_STORE', () => {
    it('should be an empty store with nextId 1', () => {
      expect(DEFAULT_STORE).toEqual({
        tasks: [],
        nextId: 1
      });
    });
  });
});
```

#### GREEN: Implement storage module

**Create `src/storage.ts`:**

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { TaskStore } from './types.js';

/**
 * Default empty store structure
 */
export const DEFAULT_STORE: TaskStore = {
  tasks: [],
  nextId: 1
};

/**
 * Loads tasks from a JSON file
 * Returns default store if file doesn't exist or is invalid
 */
export function loadTasks(filePath: string): TaskStore {
  try {
    if (!existsSync(filePath)) {
      return { ...DEFAULT_STORE, tasks: [] };
    }

    const content = readFileSync(filePath, 'utf-8');

    if (!content.trim()) {
      return { ...DEFAULT_STORE, tasks: [] };
    }

    const store = JSON.parse(content) as TaskStore;
    return store;
  } catch (error) {
    // Return default store for any parsing errors
    console.error('Warning: Could not parse tasks.json, starting fresh');
    return { ...DEFAULT_STORE, tasks: [] };
  }
}

/**
 * Saves tasks to a JSON file
 * Creates parent directories if they don't exist
 * Throws with user-friendly message on write failure
 */
export function saveTasks(filePath: string, store: TaskStore): void {
  try {
    const dir = dirname(filePath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const content = JSON.stringify(store, null, 2);
    writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to save tasks: ${message}`);
  }
}
```

**Run test:**

```bash
npm test -- src/storage.test.ts
```

---

### Step 2.2: Integrate Storage with CLI

#### RED: Write failing integration test

**Create `src/integration.test.ts`:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { loadTasks, saveTasks } from './storage.js';
import { createTaskManager } from './task.js';

const TEST_FILE = join(process.cwd(), '.test-tasks.json');

describe('Storage + Task Manager Integration', () => {
  let taskManager: ReturnType<typeof createTaskManager>;

  beforeEach(() => {
    // Clean up test file
    if (existsSync(TEST_FILE)) {
      rmSync(TEST_FILE);
    }

    // Load store and create task manager
    const store = loadTasks(TEST_FILE);
    taskManager = createTaskManager();
    taskManager.loadStore(store);
  });

  afterEach(() => {
    if (existsSync(TEST_FILE)) {
      rmSync(TEST_FILE);
    }
  });

  it('should persist tasks after add', () => {
    // Add task
    taskManager.addTask('Persistent task');

    // Save to file
    saveTasks(TEST_FILE, taskManager.getStore());

    // Load fresh and verify
    const loadedStore = loadTasks(TEST_FILE);
    expect(loadedStore.tasks).toHaveLength(1);
    expect(loadedStore.tasks[0].description).toBe('Persistent task');
    expect(loadedStore.nextId).toBe(2);
  });

  it('should maintain nextId across sessions', () => {
    // Session 1: Add 3 tasks
    taskManager.addTask('Task 1');
    taskManager.addTask('Task 2');
    taskManager.addTask('Task 3');
    saveTasks(TEST_FILE, taskManager.getStore());

    // Session 2: Load and add another task
    const store2 = loadTasks(TEST_FILE);
    const manager2 = createTaskManager();
    manager2.loadStore(store2);

    const newTask = manager2.addTask('Task 4');

    expect(newTask.id).toBe(4);
  });

  it('should preserve task data across sessions', () => {
    // Add task with due date
    const task = taskManager.addTask('Due task', '2025-12-25');
    taskManager.markStatus(task.id, 'in-progress');
    saveTasks(TEST_FILE, taskManager.getStore());

    // Load in new session
    const loadedStore = loadTasks(TEST_FILE);

    expect(loadedStore.tasks[0].dueDate).toBe('2025-12-25');
    expect(loadedStore.tasks[0].status).toBe('in-progress');
  });
});
```

#### GREEN: Update CLI to use persistence

**Update `src/index.ts`:**

```typescript
#!/usr/bin/env node

import { join } from 'path';
import { parseArgs, showHelp } from './cli.js';
import { createTaskManager } from './task.js';
import { loadTasks, saveTasks } from './storage.js';
import { isValidTaskId } from './validation.js';

// Default storage file path
const TASKS_FILE = join(process.cwd(), 'tasks.json');

function main() {
  // Get arguments (skip node and script path)
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);

  // Load existing tasks and create task manager
  const store = loadTasks(TASKS_FILE);
  const taskManager = createTaskManager();
  taskManager.loadStore(store);

  // Track if we need to save
  let shouldSave = false;

  // Handle commands
  switch (parsed.command) {
    case 'add': {
      const description = parsed.args[0];
      if (!description) {
        console.error('Error: Description is required');
        process.exit(1);
      }
      const task = taskManager.addTask(description, parsed.options.due);
      console.log(`Task added successfully (ID: ${task.id})`);
      shouldSave = true;
      break;
    }

    case 'list': {
      const statusFilter = parsed.args[0] as 'todo' | 'in-progress' | 'done' | undefined;
      const tasks = taskManager.listTasks(statusFilter);

      if (tasks.length === 0) {
        console.log('No tasks found.');
      } else {
        console.log('\nTasks:');
        console.log('─'.repeat(60));
        for (const task of tasks) {
          const dueStr = task.dueDate ? ` (Due: ${task.dueDate})` : '';
          console.log(`[${task.id}] [${task.status}] ${task.description}${dueStr}`);
        }
        console.log('─'.repeat(60));
        console.log(`Total: ${tasks.length} task(s)`);
      }
      break;
    }

    case 'mark-todo': {
      const idStr = parsed.args[0];
      if (!isValidTaskId(idStr)) {
        console.error('Error: Valid positive task ID is required');
        process.exit(1);
      }
      const id = parseInt(idStr, 10);
      const task = taskManager.markStatus(id, 'todo');
      if (!task) {
        console.error(`Error: Task with ID ${id} not found`);
        process.exit(1);
      }
      console.log(`Task ${id} marked as todo`);
      shouldSave = true;
      break;
    }

    case 'mark-in-progress': {
      const idStr = parsed.args[0];
      if (!isValidTaskId(idStr)) {
        console.error('Error: Valid positive task ID is required');
        process.exit(1);
      }
      const id = parseInt(idStr, 10);
      const task = taskManager.markStatus(id, 'in-progress');
      if (!task) {
        console.error(`Error: Task with ID ${id} not found`);
        process.exit(1);
      }
      console.log(`Task ${id} marked as in-progress`);
      shouldSave = true;
      break;
    }

    case 'mark-done': {
      const idStr = parsed.args[0];
      if (!isValidTaskId(idStr)) {
        console.error('Error: Valid positive task ID is required');
        process.exit(1);
      }
      const id = parseInt(idStr, 10);
      const task = taskManager.markStatus(id, 'done');
      if (!task) {
        console.error(`Error: Task with ID ${id} not found`);
        process.exit(1);
      }
      console.log(`Task ${id} marked as done`);
      shouldSave = true;
      break;
    }

    case 'help':
      showHelp();
      break;

    case null:
      if (argv.length === 0) {
        showHelp();
      } else {
        console.error(`Error: Unknown command '${argv[0]}'`);
        console.error('Run "task help" for usage information.');
        process.exit(1);
      }
      break;

    default:
      console.log(`Command '${parsed.command}' not yet implemented.`);
      break;
  }

  // Save if changes were made
  if (shouldSave) {
    try {
      saveTasks(TASKS_FILE, taskManager.getStore());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error: ${message}`);
      process.exit(1);
    }
  }
}

main();
```

**Run integration test:**

```bash
npm test -- src/integration.test.ts
```

---

### Step 2.3: Error Handling for File Operations

#### RED: Write failing test for error scenarios

**Add to `src/storage.test.ts`** (inside the existing `describe('Storage Module')` block, after the `describe('DEFAULT_STORE')` block):

```typescript
describe('Storage Error Handling', () => {
  it('should handle corrupted JSON gracefully', () => {
    writeFileSync(TEST_FILE, '{"tasks": [{"id": 1, "incomplete');

    const store = loadTasks(TEST_FILE);

    expect(store).toEqual(DEFAULT_STORE);
  });

  it('should validate store structure', () => {
    // Missing required fields
    writeFileSync(TEST_FILE, '{"tasks": []}');

    const store = loadTasks(TEST_FILE);

    // Should have nextId even if not in file
    expect(store.nextId).toBeDefined();
  });

  it('should filter out invalid task objects', () => {
    const mixedStore = {
      tasks: [
        { id: 1, description: 'Valid task', status: 'todo', dueDate: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
        { id: 'not-a-number', description: 'Invalid id' }, // Invalid: id is string
        { id: 2, description: 123, status: 'todo' }, // Invalid: description is number
        { id: 3, description: 'Invalid status', status: 'invalid', dueDate: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }, // Invalid: bad status
        null, // Invalid: null
        'string task', // Invalid: string instead of object
      ],
      nextId: 10
    };
    writeFileSync(TEST_FILE, JSON.stringify(mixedStore));

    const store = loadTasks(TEST_FILE);

    // Only the first valid task should remain
    expect(store.tasks).toHaveLength(1);
    expect(store.tasks[0].id).toBe(1);
    expect(store.nextId).toBe(10);
  });

  it('should recalculate nextId if invalid or missing', () => {
    const storeWithBadNextId = {
      tasks: [
        { id: 5, description: 'Task', status: 'todo', dueDate: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }
      ],
      nextId: -1 // Invalid
    };
    writeFileSync(TEST_FILE, JSON.stringify(storeWithBadNextId));

    const store = loadTasks(TEST_FILE);

    // Should calculate nextId from max task id + 1
    expect(store.nextId).toBe(6);
  });
});

// Permission-based tests only work reliably on Unix systems
describe.skipIf(process.platform === 'win32')('Storage Write Permissions (Unix-only)', () => {
  it('should throw user-friendly error on write failure', () => {
    // Create a read-only directory to simulate write failure
    const readOnlyDir = join(TEST_DIR, 'readonly');
    mkdirSync(readOnlyDir, { recursive: true });
    const readOnlyFile = join(readOnlyDir, 'tasks.json');

    try {
      const store: TaskStore = { tasks: [], nextId: 1 };

      // First, create the file
      saveTasks(readOnlyFile, store);

      // Make it read-only
      chmodSync(readOnlyFile, 0o444);
      chmodSync(readOnlyDir, 0o555);

      // Try to write again - should throw
      expect(() => saveTasks(readOnlyFile, { tasks: [], nextId: 2 })).toThrow(/Failed to save tasks/);
    } finally {
      // Restore permissions for cleanup
      try {
        chmodSync(readOnlyDir, 0o755);
        chmodSync(readOnlyFile, 0o644);
      } catch {
        // Ignore cleanup errors
      }
    }
  });
});
```

#### GREEN: Add validation

**Replace the entire `src/storage.ts` with this updated version:**

> **Important:** This replaces the previous `loadTasks` implementation to add validation.

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { TaskStore } from './types.js';

/**
 * Default empty store structure
 */
export const DEFAULT_STORE: TaskStore = {
  tasks: [],
  nextId: 1
};

/**
 * Validates a single task object has required fields
 */
function isValidTask(task: unknown): boolean {
  if (!task || typeof task !== 'object') return false;
  const t = task as Record<string, unknown>;
  return (
    typeof t.id === 'number' &&
    typeof t.description === 'string' &&
    typeof t.status === 'string' &&
    ['todo', 'in-progress', 'done'].includes(t.status) &&
    (t.dueDate === null || typeof t.dueDate === 'string') &&
    typeof t.createdAt === 'string' &&
    typeof t.updatedAt === 'string'
  );
}

/**
 * Validates and normalizes a TaskStore
 * Filters out any invalid task objects
 */
function validateStore(data: unknown): TaskStore {
  if (!data || typeof data !== 'object') {
    return { ...DEFAULT_STORE, tasks: [] };
  }

  const obj = data as Record<string, unknown>;

  // Filter to only valid task objects
  const rawTasks = Array.isArray(obj.tasks) ? obj.tasks : [];
  const tasks = rawTasks.filter(isValidTask);

  const nextId = typeof obj.nextId === 'number' && obj.nextId > 0
    ? obj.nextId
    : (tasks.length > 0 ? Math.max(...tasks.map((t: any) => t.id)) + 1 : 1);

  return { tasks, nextId };
}

/**
 * Loads tasks from a JSON file
 * Returns default store if file doesn't exist or is invalid
 */
export function loadTasks(filePath: string): TaskStore {
  try {
    if (!existsSync(filePath)) {
      return { ...DEFAULT_STORE, tasks: [] };
    }

    const content = readFileSync(filePath, 'utf-8');

    if (!content.trim()) {
      return { ...DEFAULT_STORE, tasks: [] };
    }

    const data = JSON.parse(content);
    return validateStore(data);
  } catch (error) {
    console.error('Warning: Could not parse tasks.json, starting fresh');
    return { ...DEFAULT_STORE, tasks: [] };
  }
}

/**
 * Saves tasks to a JSON file
 * Creates parent directories if they don't exist
 * Throws with user-friendly message on write failure
 */
export function saveTasks(filePath: string, store: TaskStore): void {
  try {
    const dir = dirname(filePath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const content = JSON.stringify(store, null, 2);
    writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to save tasks: ${message}`);
  }
}
```

**Run all tests:**

```bash
npm test
```

---

## Milestone Checklist

| Task | Status |
|------|--------|
| `loadTasks` reads from JSON file | ☐ |
| `loadTasks` returns default for missing file | ☐ |
| `loadTasks` handles corrupted JSON | ☐ |
| `saveTasks` writes to JSON file | ☐ |
| `saveTasks` creates parent directories | ☐ |
| CLI integrates with storage | ☐ |
| Tasks persist across sessions | ☐ |
| `nextId` is maintained correctly | ☐ |
| All tests passing | ☐ |

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/storage.ts` | Created | JSON file I/O operations |
| `src/storage.test.ts` | Created | Storage unit tests |
| `src/integration.test.ts` | Created | Storage + Task integration tests |
| `src/index.ts` | Modified | Integrate storage with CLI |

---

## Manual Testing

After completing this phase, verify persistence:

```bash
# Add some tasks
npm run task add "Buy groceries"
npm run task add "Call mom"
npm run task add "Submit report" --due 2025-12-25

# List tasks
npm run task list

# Mark a task
npm run task mark-done 1
npm run task mark-todo 1

# Verify tasks.json was created
cat tasks.json

# Restart and verify persistence
npm run task list
```

---

## Next Phase

[Phase 3: Full CRUD Operations →](./phase-03.md)
