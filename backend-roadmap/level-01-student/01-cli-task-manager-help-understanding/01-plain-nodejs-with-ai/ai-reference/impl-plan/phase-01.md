# Phase 1: Foundation

## Objective

Define core types, create the CLI entry point with argument parsing, implement basic `add` and `list` commands with in-memory storage.

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

### Step 1.1: Define Task Types

#### RED: Write failing test

**Create `src/types.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import type { Task, TaskStatus, TaskStore } from './types.js';

describe('Task Types', () => {
  it('should create a valid Task object', () => {
    const task: Task = {
      id: 1,
      description: 'Buy groceries',
      status: 'todo',
      dueDate: null,
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-01-15T10:30:00Z'
    };

    expect(task.id).toBe(1);
    expect(task.description).toBe('Buy groceries');
    expect(task.status).toBe('todo');
    expect(task.dueDate).toBeNull();
  });

  it('should create a valid TaskStore object', () => {
    const store: TaskStore = {
      tasks: [],
      nextId: 1
    };

    expect(store.tasks).toEqual([]);
    expect(store.nextId).toBe(1);
  });

  it('should support all TaskStatus values', () => {
    const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];
    expect(statuses).toHaveLength(3);
  });
});
```

#### GREEN: Implement types

**Create `src/types.ts`:**

```typescript
/**
 * Valid status values for a task
 */
export type TaskStatus = 'todo' | 'in-progress' | 'done';

/**
 * Represents a single task
 */
export interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Storage structure for tasks.json
 */
export interface TaskStore {
  tasks: Task[];
  nextId: number;
}

/**
 * Supported CLI commands
 */
export type Command =
  | 'add'
  | 'update'
  | 'delete'
  | 'mark-todo'
  | 'mark-in-progress'
  | 'mark-done'
  | 'list'
  | 'search'
  | 'help';

/**
 * Parsed CLI arguments
 */
export interface ParsedArgs {
  command: Command | null;
  args: string[];
  options: {
    due?: string;
    sortByDue?: boolean;
  };
}
```

**Run test:**

```bash
npm test -- src/types.test.ts
```

---

### Step 1.2: Implement CLI Argument Parser

#### RED: Write failing test

**Create `src/cli.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { parseArgs } from './cli.js';

describe('CLI Argument Parser', () => {
  describe('parseArgs', () => {
    it('should parse add command with description', () => {
      const result = parseArgs(['add', 'Buy groceries']);

      expect(result.command).toBe('add');
      expect(result.args).toEqual(['Buy groceries']);
    });

    it('should parse add command with --due option', () => {
      const result = parseArgs(['add', 'Submit report', '--due', '2025-12-25']);

      expect(result.command).toBe('add');
      expect(result.args).toEqual(['Submit report']);
      expect(result.options.due).toBe('2025-12-25');
    });

    it('should parse update command with id and description', () => {
      const result = parseArgs(['update', '1', 'Buy almond milk']);

      expect(result.command).toBe('update');
      expect(result.args).toEqual(['1', 'Buy almond milk']);
    });

    it('should parse delete command with id', () => {
      const result = parseArgs(['delete', '1']);

      expect(result.command).toBe('delete');
      expect(result.args).toEqual(['1']);
    });

    it('should parse mark-todo command', () => {
      const result = parseArgs(['mark-todo', '1']);

      expect(result.command).toBe('mark-todo');
      expect(result.args).toEqual(['1']);
    });

    it('should parse mark-in-progress command', () => {
      const result = parseArgs(['mark-in-progress', '1']);

      expect(result.command).toBe('mark-in-progress');
      expect(result.args).toEqual(['1']);
    });

    it('should parse mark-done command', () => {
      const result = parseArgs(['mark-done', '1']);

      expect(result.command).toBe('mark-done');
      expect(result.args).toEqual(['1']);
    });

    it('should parse list command without filter', () => {
      const result = parseArgs(['list']);

      expect(result.command).toBe('list');
      expect(result.args).toEqual([]);
    });

    it('should parse list command with status filter', () => {
      const result = parseArgs(['list', 'done']);

      expect(result.command).toBe('list');
      expect(result.args).toEqual(['done']);
    });

    it('should parse list command with --sort-by-due option', () => {
      const result = parseArgs(['list', '--sort-by-due']);

      expect(result.command).toBe('list');
      expect(result.options.sortByDue).toBe(true);
    });

    it('should parse search command with keyword', () => {
      const result = parseArgs(['search', 'groceries']);

      expect(result.command).toBe('search');
      expect(result.args).toEqual(['groceries']);
    });

    it('should return null command for empty args', () => {
      const result = parseArgs([]);

      expect(result.command).toBeNull();
    });

    it('should return null command for invalid command', () => {
      const result = parseArgs(['invalid-command']);

      expect(result.command).toBeNull();
      expect(result.args).toEqual(['invalid-command']);
    });
  });
});
```

#### GREEN: Implement argument parser

**Create `src/cli.ts`:**

```typescript
import type { Command, ParsedArgs } from './types.js';

const VALID_COMMANDS: Command[] = [
  'add',
  'update',
  'delete',
  'mark-todo',
  'mark-in-progress',
  'mark-done',
  'list',
  'search',
  'help'
];

/**
 * Parses command-line arguments into a structured format
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: null,
    args: [],
    options: {}
  };

  if (argv.length === 0) {
    return result;
  }

  const [commandCandidate, ...rest] = argv;

  // Check if first argument is a valid command
  if (VALID_COMMANDS.includes(commandCandidate as Command)) {
    result.command = commandCandidate as Command;
  } else {
    // Invalid command - put it in args
    result.args = argv;
    return result;
  }

  // Parse remaining arguments and options
  let i = 0;
  while (i < rest.length) {
    const current = rest[i];

    if (current === '--due' && i + 1 < rest.length) {
      result.options.due = rest[i + 1];
      i += 2;
    } else if (current === '--sort-by-due') {
      result.options.sortByDue = true;
      i += 1;
    } else if (!current.startsWith('--')) {
      result.args.push(current);
      i += 1;
    } else {
      // Unknown option, skip
      i += 1;
    }
  }

  return result;
}

/**
 * Displays help text
 */
export function showHelp(): void {
  console.log(`
Task Manager CLI

Usage:
  task <command> [arguments] [options]

Commands:
  add <description> [--due YYYY-MM-DD]  Add a new task
  update <id> [description] [--due YYYY-MM-DD]  Update task description and/or due date
  delete <id>                           Delete a task
  mark-todo <id>                        Mark task as todo (reset status)
  mark-in-progress <id>                 Mark task as in-progress
  mark-done <id>                        Mark task as done
  list [status] [--sort-by-due]         List tasks (optionally filter by status)
  search <keyword>                      Search tasks by keyword
  help                                  Show this help message

Examples:
  task add "Buy groceries"
  task add "Submit report" --due 2025-12-25
  task update 1 "Buy almond milk"
  task update 1 --due 2025-12-31
  task delete 1
  task mark-todo 1
  task mark-done 1
  task list
  task list done
  task list --sort-by-due
  task search groceries
`);
}
```

**Run test:**

```bash
npm test -- src/cli.test.ts
```

---

### Step 1.3: Implement Task Operations (In-Memory)

#### RED: Write failing test

**Create `src/task.test.ts`:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTaskManager } from './task.js';

describe('Task Manager', () => {
  let taskManager: ReturnType<typeof createTaskManager>;

  beforeEach(() => {
    taskManager = createTaskManager();
  });

  describe('addTask', () => {
    it('should add a task with auto-incrementing id', () => {
      const task1 = taskManager.addTask('First task');
      const task2 = taskManager.addTask('Second task');

      expect(task1.id).toBe(1);
      expect(task2.id).toBe(2);
    });

    it('should set initial status to todo', () => {
      const task = taskManager.addTask('New task');

      expect(task.status).toBe('todo');
    });

    it('should set dueDate to null when not provided', () => {
      const task = taskManager.addTask('No due date');

      expect(task.dueDate).toBeNull();
    });

    it('should set dueDate when provided', () => {
      const task = taskManager.addTask('With due date', '2025-12-25');

      expect(task.dueDate).toBe('2025-12-25');
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const task = taskManager.addTask('Timestamped task');

      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
      expect(task.createdAt).toBe(task.updatedAt);
      // Verify ISO 8601 format
      expect(() => new Date(task.createdAt)).not.toThrow();
      expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt);
    });
  });

  describe('listTasks', () => {
    beforeEach(() => {
      taskManager.addTask('Task 1');
      taskManager.addTask('Task 2');
      taskManager.addTask('Task 3');
    });

    it('should list all tasks', () => {
      const tasks = taskManager.listTasks();

      expect(tasks).toHaveLength(3);
    });

    it('should filter tasks by status', () => {
      taskManager.markStatus(1, 'done');
      taskManager.markStatus(2, 'in-progress');

      expect(taskManager.listTasks('todo')).toHaveLength(1);
      expect(taskManager.listTasks('in-progress')).toHaveLength(1);
      expect(taskManager.listTasks('done')).toHaveLength(1);
    });

    it('should return empty array when no tasks match filter', () => {
      const doneTasks = taskManager.listTasks('done');

      expect(doneTasks).toHaveLength(0);
    });
  });

  describe('getStore', () => {
    it('should return the current store state', () => {
      taskManager.addTask('Test task');
      const store = taskManager.getStore();

      expect(store.tasks).toHaveLength(1);
      expect(store.nextId).toBe(2);
    });
  });

  describe('loadStore', () => {
    it('should load tasks from a store object', () => {
      const existingStore = {
        tasks: [
          {
            id: 5,
            description: 'Loaded task',
            status: 'todo' as const,
            dueDate: null,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
          }
        ],
        nextId: 6
      };

      taskManager.loadStore(existingStore);
      const tasks = taskManager.listTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(5);
    });
  });

  describe('markStatus', () => {
    it('should mark task as in-progress', () => {
      taskManager.addTask('Task to progress');
      const updated = taskManager.markStatus(1, 'in-progress');

      expect(updated?.status).toBe('in-progress');
    });

    it('should mark task as done', () => {
      taskManager.addTask('Task to complete');
      const updated = taskManager.markStatus(1, 'done');

      expect(updated?.status).toBe('done');
    });

    it('should update updatedAt timestamp', () => {
      const task = taskManager.addTask('Task to update');
      const originalDate = new Date(task.updatedAt);

      const updated = taskManager.markStatus(1, 'done');

      // Verify updatedAt is a valid ISO timestamp and >= original
      expect(updated?.updatedAt).toBeDefined();
      const updatedDate = new Date(updated!.updatedAt);
      expect(updatedDate.getTime()).toBeGreaterThanOrEqual(originalDate.getTime());
      expect(updated!.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return null for non-existent task', () => {
      const result = taskManager.markStatus(999, 'done');

      expect(result).toBeNull();
    });
  });
});
```

#### GREEN: Implement task manager

**Create `src/task.ts`:**

```typescript
import type { Task, TaskStatus, TaskStore } from './types.js';

/**
 * Creates a task manager with in-memory storage
 */
export function createTaskManager() {
  let store: TaskStore = {
    tasks: [],
    nextId: 1
  };

  return {
    /**
     * Adds a new task
     */
    addTask(description: string, dueDate?: string): Task {
      const now = new Date().toISOString();
      const task: Task = {
        id: store.nextId,
        description: description.trim(),
        status: 'todo',
        dueDate: dueDate ?? null,
        createdAt: now,
        updatedAt: now
      };

      store.tasks.push(task);
      store.nextId += 1;

      return task;
    },

    /**
     * Lists tasks, optionally filtered by status
     */
    listTasks(statusFilter?: TaskStatus): Task[] {
      if (statusFilter) {
        return store.tasks.filter(task => task.status === statusFilter);
      }
      return [...store.tasks];
    },

    /**
     * Marks a task with a new status
     */
    markStatus(id: number, status: TaskStatus): Task | null {
      const task = store.tasks.find(t => t.id === id);
      if (!task) {
        return null;
      }

      task.status = status;
      task.updatedAt = new Date().toISOString();
      return task;
    },

    /**
     * Returns the current store state
     */
    getStore(): TaskStore {
      return {
        tasks: [...store.tasks],
        nextId: store.nextId
      };
    },

    /**
     * Loads a store from external source
     */
    loadStore(externalStore: TaskStore): void {
      store = {
        tasks: [...externalStore.tasks],
        nextId: externalStore.nextId
      };
    }
  };
}

export type TaskManager = ReturnType<typeof createTaskManager>;
```

**Run test:**

```bash
npm test -- src/task.test.ts
```

---

### Step 1.4: Create Basic Validation Utility

> **Note:** This step introduces `isValidTaskId()` early so that all phases use consistent ID validation.

#### RED: Write failing test

**Create `src/validation.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { isValidTaskId } from './validation.js';

describe('Validation', () => {
  describe('isValidTaskId', () => {
    it('should accept positive integers', () => {
      expect(isValidTaskId('1')).toBe(true);
      expect(isValidTaskId('100')).toBe(true);
      expect(isValidTaskId('999999')).toBe(true);
    });

    it('should reject non-positive integers', () => {
      expect(isValidTaskId('0')).toBe(false);
      expect(isValidTaskId('-1')).toBe(false);
      expect(isValidTaskId('-100')).toBe(false);
    });

    it('should reject non-integers', () => {
      expect(isValidTaskId('1.5')).toBe(false);
      expect(isValidTaskId('abc')).toBe(false);
      expect(isValidTaskId('')).toBe(false);
      expect(isValidTaskId('1a')).toBe(false);
    });

    it('should reject leading zeros', () => {
      expect(isValidTaskId('01')).toBe(false);
      expect(isValidTaskId('007')).toBe(false);
      expect(isValidTaskId('0123')).toBe(false);
    });
  });
});
```

#### GREEN: Implement validation

**Create `src/validation.ts`:**

```typescript
/**
 * Validates a task ID string
 * - Must be a positive integer
 * - Must not have leading zeros (e.g., '01' is invalid)
 * - The String(id) === idStr check ensures no leading zeros since Number('01') = 1
 */
export function isValidTaskId(idStr: string): boolean {
  if (!idStr || typeof idStr !== 'string') {
    return false;
  }

  const id = Number(idStr);
  return Number.isInteger(id) && id > 0 && String(id) === idStr;
}
```

**Run test:**

```bash
npm test -- src/validation.test.ts
```

---

### Step 1.5: Create CLI Entry Point

#### GREEN: Implement entry point

**Update `src/index.ts`:**

```typescript
#!/usr/bin/env node

import { parseArgs, showHelp } from './cli.js';
import { createTaskManager } from './task.js';

function main() {
  // Get arguments (skip node and script path)
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);

  // Create task manager (in-memory for now)
  const taskManager = createTaskManager();

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
}

main();
```

**Run manually to verify:**

```bash
npm run task add "Buy groceries"
npm run task list
npm run task help
```

---

## Milestone Checklist

| Task | Status |
|------|--------|
| Task, TaskStore, TaskStatus types defined | ☐ |
| CLI argument parser working for all commands | ☐ |
| Basic validation (isValidTaskId) implemented | ☐ |
| `add` command works (in-memory) | ☐ |
| `list` command works (in-memory) | ☐ |
| `help` command displays usage | ☐ |
| All tests passing | ☐ |

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/types.ts` | Created | Type definitions |
| `src/types.test.ts` | Created | Type verification tests |
| `src/cli.ts` | Created | Argument parsing |
| `src/cli.test.ts` | Created | CLI parser tests |
| `src/task.ts` | Created | Task operations |
| `src/task.test.ts` | Created | Task operation tests |
| `src/validation.ts` | Created | ID validation utility |
| `src/validation.test.ts` | Created | Validation tests |
| `src/index.ts` | Modified | CLI entry point |

---

## Next Phase

[Phase 2: Persistence →](./phase-02.md)
