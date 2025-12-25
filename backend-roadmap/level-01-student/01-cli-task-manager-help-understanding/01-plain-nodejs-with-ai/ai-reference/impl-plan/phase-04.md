# Phase 4: Polish

## Objective

Add advanced features: due date validation and sorting, keyword search, input validation, improved output formatting, and comprehensive error handling.

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

### Step 4.1: Due Date and Description Validation

> **Note:** The `isValidTaskId()` function was already created in Phase 1. This step extends `validation.ts` with additional validation functions.

#### RED: Write failing test

**Add to `src/validation.test.ts`** (append to existing file):

```typescript
// Add these imports if not already present
import { isValidDate, validateDescription } from './validation.js';

describe('isValidDate', () => {
  it('should accept valid YYYY-MM-DD format', () => {
    expect(isValidDate('2025-12-25')).toBe(true);
    expect(isValidDate('2025-01-01')).toBe(true);
    expect(isValidDate('2024-02-29')).toBe(true); // Leap year (2024 is leap year)
  });

  it('should reject invalid date formats', () => {
    expect(isValidDate('12-25-2025')).toBe(false); // Wrong order
    expect(isValidDate('2025/12/25')).toBe(false); // Wrong separator
    expect(isValidDate('25-12-2025')).toBe(false); // DD-MM-YYYY
    expect(isValidDate('Dec 25, 2025')).toBe(false); // Text format
  });

  it('should reject invalid dates', () => {
    expect(isValidDate('2025-13-01')).toBe(false); // Invalid month
    expect(isValidDate('2025-02-30')).toBe(false); // Invalid day
    expect(isValidDate('2025-02-29')).toBe(false); // Non-leap year (2025 is not leap)
    expect(isValidDate('2025-00-01')).toBe(false); // Zero month
  });

  it('should reject empty or null values', () => {
    expect(isValidDate('')).toBe(false);
    expect(isValidDate(null as unknown as string)).toBe(false);
    expect(isValidDate(undefined as unknown as string)).toBe(false);
  });
});

describe('validateDescription', () => {
  it('should accept valid descriptions', () => {
    expect(validateDescription('Buy groceries')).toEqual({ valid: true });
    expect(validateDescription('Call mom!')).toEqual({ valid: true });
    expect(validateDescription('Task with "quotes"')).toEqual({ valid: true });
  });

  it('should reject empty descriptions', () => {
    const result = validateDescription('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Description cannot be empty');
  });

  it('should reject whitespace-only descriptions', () => {
    const result = validateDescription('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Description cannot be empty');
  });

  it('should accept unicode characters', () => {
    expect(validateDescription('买菜')).toEqual({ valid: true });
    expect(validateDescription('Café ☕')).toEqual({ valid: true });
  });

  it('should warn for very long descriptions', () => {
    const longDesc = 'a'.repeat(300);
    const result = validateDescription(longDesc);
    expect(result.valid).toBe(true);
    expect(result.warning).toBe('Description is very long (300 characters)');
  });
});
```

#### GREEN: Extend validation module

**Update `src/validation.ts`** (add to existing file):

```typescript
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DESCRIPTION_LENGTH = 200;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validates a date string is in YYYY-MM-DD format and is a valid date
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }

  // Check format
  if (!DATE_REGEX.test(dateStr)) {
    return false;
  }

  // Check if it's a valid date
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Validates a task description
 */
export function validateDescription(description: string): ValidationResult {
  if (!description || !description.trim()) {
    return { valid: false, error: 'Description cannot be empty' };
  }

  const trimmed = description.trim();

  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: true,
      warning: `Description is very long (${trimmed.length} characters)`
    };
  }

  return { valid: true };
}
```

**Run test:**

```bash
npm test -- src/validation.test.ts
```

---

### Step 4.2: Search Functionality

#### RED: Write failing test

**Add to `src/task.test.ts`:**

```typescript
describe('searchTasks', () => {
  beforeEach(() => {
    taskManager.addTask('Buy groceries for dinner');
    taskManager.addTask('Call mom about birthday');
    taskManager.addTask('Submit quarterly report');
    taskManager.addTask('Buy birthday gift');
  });

  it('should find tasks by keyword', () => {
    const results = taskManager.searchTasks('birthday');

    expect(results).toHaveLength(2);
  });

  it('should be case-insensitive', () => {
    const results1 = taskManager.searchTasks('GROCERIES');
    const results2 = taskManager.searchTasks('groceries');

    expect(results1).toHaveLength(1);
    expect(results2).toHaveLength(1);
    expect(results1[0].id).toBe(results2[0].id);
  });

  it('should return empty array when no matches', () => {
    const results = taskManager.searchTasks('nonexistent');

    expect(results).toHaveLength(0);
  });

  it('should match partial words', () => {
    const results = taskManager.searchTasks('report');

    expect(results).toHaveLength(1);
    expect(results[0].description).toContain('report');
  });

  it('should handle empty search term', () => {
    const results = taskManager.searchTasks('');

    expect(results).toHaveLength(0);
  });
});
```

#### GREEN: Implement searchTasks

**Add to `src/task.ts` in createTaskManager:**

```typescript
/**
 * Searches tasks by keyword (case-insensitive)
 */
searchTasks(keyword: string): Task[] {
  if (!keyword || !keyword.trim()) {
    return [];
  }

  const lowerKeyword = keyword.toLowerCase().trim();
  return store.tasks.filter(task =>
    task.description.toLowerCase().includes(lowerKeyword)
  );
},
```

---

### Step 4.3: Sort by Due Date

#### RED: Write failing test

**Add to `src/task.test.ts`:**

```typescript
describe('listTasks with sorting', () => {
  beforeEach(() => {
    // Add tasks with different due dates (out of order)
    taskManager.addTask('Task C', '2025-12-30');
    taskManager.addTask('Task A', '2025-12-10');
    taskManager.addTask('Task B'); // No due date
    taskManager.addTask('Task D', '2025-12-20');
  });

  it('should sort by due date when requested', () => {
    const tasks = taskManager.listTasks(undefined, { sortByDue: true });

    // Tasks with due dates should come first, sorted ascending
    // Tasks without due dates should come last
    expect(tasks[0].dueDate).toBe('2025-12-10');
    expect(tasks[1].dueDate).toBe('2025-12-20');
    expect(tasks[2].dueDate).toBe('2025-12-30');
    expect(tasks[3].dueDate).toBeNull();
  });

  it('should not sort when sortByDue is false', () => {
    const tasks = taskManager.listTasks(undefined, { sortByDue: false });

    // Should be in insertion order
    expect(tasks[0].description).toBe('Task C');
    expect(tasks[1].description).toBe('Task A');
  });

  it('should work without options (backward compatible)', () => {
    // This ensures existing code calling listTasks() still works
    const tasks = taskManager.listTasks();
    expect(tasks).toHaveLength(4);

    const todoTasks = taskManager.listTasks('todo');
    expect(todoTasks).toHaveLength(4);
  });

  it('should combine filter and sort', () => {
    taskManager.markStatus(1, 'done'); // Task C
    taskManager.markStatus(2, 'done'); // Task A

    const tasks = taskManager.listTasks('done', { sortByDue: true });

    expect(tasks).toHaveLength(2);
    expect(tasks[0].dueDate).toBe('2025-12-10'); // Task A
    expect(tasks[1].dueDate).toBe('2025-12-30'); // Task C
  });
});
```

#### GREEN: Update listTasks to support sorting

> **Important:** The second parameter has a default value `{}`, ensuring backward compatibility with all existing calls to `listTasks()` from Phase 2 and Phase 3.

**Step 1: Add the `ListOptions` interface to `src/types.ts`:**

> **Note:** Add this after the existing `ParsedArgs` interface.

```typescript
/**
 * Options for listing tasks
 */
export interface ListOptions {
  sortByDue?: boolean;
}
```

> **Note:** Ensure the interface is exported (using `export` keyword) so it can be imported in `task.ts`.

**Step 2: Update the import in `src/task.ts`:**

```typescript
import type { Task, TaskStatus, TaskStore, ListOptions } from './types.js';
```

**Step 3: Modify the `listTasks` method in `src/task.ts`:**

```typescript
// ... inside createTaskManager:

/**
 * Lists tasks, optionally filtered by status and sorted
 * @param statusFilter - Optional status to filter by
 * @param options - Optional sorting/filtering options (default: {})
 */
listTasks(statusFilter?: TaskStatus, options: ListOptions = {}): Task[] {
  let tasks = statusFilter
    ? store.tasks.filter(task => task.status === statusFilter)
    : [...store.tasks];

  if (options.sortByDue) {
    tasks = tasks.sort((a, b) => {
      // Tasks without due dates go to the end
      if (!a.dueDate && !b.dueDate) return a.id - b.id; // Stable sort by id
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      // Sort by due date ascending, then by id for stability
      const dateCompare = a.dueDate.localeCompare(b.dueDate);
      return dateCompare !== 0 ? dateCompare : a.id - b.id;
    });
  }

  return tasks;
},
```

---

### Step 4.4: Improved Output Formatting

#### Create formatting utility

**Create `src/format.ts`:**

```typescript
import type { Task } from './types.js';

const STATUS_ICONS: Record<string, string> = {
  'todo': '○',
  'in-progress': '→',
  'done': '✓'
};

const STATUS_COLORS: Record<string, string> = {
  'todo': '\x1b[33m',      // Yellow
  'in-progress': '\x1b[34m', // Blue
  'done': '\x1b[32m'        // Green
};

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

/**
 * Formats a single task for display
 */
export function formatTask(task: Task, useColor = true): string {
  const icon = STATUS_ICONS[task.status] || '?';
  const statusColor = useColor ? STATUS_COLORS[task.status] || '' : '';
  const reset = useColor ? RESET : '';
  const dim = useColor ? DIM : '';
  const bold = useColor ? BOLD : '';

  const dueStr = task.dueDate ? ` ${dim}[Due: ${task.dueDate}]${reset}` : '';
  const idStr = `${dim}#${task.id}${reset}`;

  const line1 = `${statusColor}${icon}${reset} ${idStr} ${bold}${task.description}${reset}${dueStr}`;

  return line1;
}

/**
 * Formats a list of tasks for display
 */
export function formatTaskList(tasks: Task[], title = 'Tasks', useColor = true): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  const lines: string[] = [];
  const dim = useColor ? DIM : '';
  const reset = useColor ? RESET : '';

  lines.push('');
  lines.push(title);
  lines.push(`${dim}${'─'.repeat(70)}${reset}`);

  for (const task of tasks) {
    lines.push(formatTask(task, useColor));
  }

  lines.push(`${dim}${'─'.repeat(70)}${reset}`);
  lines.push(`Total: ${tasks.length} task(s)`);

  return lines.join('\n');
}

/**
 * Formats an error message
 */
export function formatError(message: string): string {
  return `\x1b[31mError:\x1b[0m ${message}`;
}

/**
 * Formats a success message
 */
export function formatSuccess(message: string): string {
  return `\x1b[32m✓\x1b[0m ${message}`;
}
```

**Create `src/format.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { formatTask, formatTaskList, formatError, formatSuccess } from './format.js';
import type { Task } from './types.js';

describe('Formatting', () => {
  const sampleTask: Task = {
    id: 1,
    description: 'Buy groceries',
    status: 'todo',
    dueDate: '2025-12-25',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  describe('formatTask', () => {
    it('should include task id and description', () => {
      const output = formatTask(sampleTask, false);

      expect(output).toContain('#1');
      expect(output).toContain('Buy groceries');
    });

    it('should include due date when present', () => {
      const output = formatTask(sampleTask, false);

      expect(output).toContain('Due: 2025-12-25');
    });

    it('should not include due date when null', () => {
      const taskNoDue = { ...sampleTask, dueDate: null };
      const output = formatTask(taskNoDue, false);

      expect(output).not.toContain('Due:');
    });

    it('should show different icons for different statuses', () => {
      const todo = formatTask({ ...sampleTask, status: 'todo' }, false);
      const inProgress = formatTask({ ...sampleTask, status: 'in-progress' }, false);
      const done = formatTask({ ...sampleTask, status: 'done' }, false);

      expect(todo).toContain('○');
      expect(inProgress).toContain('→');
      expect(done).toContain('✓');
    });
  });

  describe('formatTaskList', () => {
    it('should show "No tasks found" for empty list', () => {
      const output = formatTaskList([], 'Tasks', false);

      expect(output).toBe('No tasks found.');
    });

    it('should show task count', () => {
      const tasks = [sampleTask, { ...sampleTask, id: 2 }];
      const output = formatTaskList(tasks, 'Tasks', false);

      expect(output).toContain('Total: 2 task(s)');
    });
  });

  describe('formatError', () => {
    it('should format error message with red color code', () => {
      const output = formatError('Something went wrong');

      expect(output).toContain('Error:');
      expect(output).toContain('Something went wrong');
    });
  });

  describe('formatSuccess', () => {
    it('should format success message with checkmark', () => {
      const output = formatSuccess('Task completed');

      expect(output).toContain('✓');
      expect(output).toContain('Task completed');
    });
  });
});
```

---

### Step 4.5: Update CLI with All Features

**Final `src/index.ts`:**

```typescript
#!/usr/bin/env node

import { join } from 'path';
import { parseArgs, showHelp } from './cli.js';
import { createTaskManager } from './task.js';
import { loadTasks, saveTasks } from './storage.js';
import { isValidDate, isValidTaskId, validateDescription } from './validation.js';
import { formatTaskList, formatError, formatSuccess } from './format.js';

// Default storage file path
const TASKS_FILE = join(process.cwd(), 'tasks.json');

function main() {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);

  const store = loadTasks(TASKS_FILE);
  const taskManager = createTaskManager();
  taskManager.loadStore(store);

  let shouldSave = false;

  switch (parsed.command) {
    case 'add': {
      const description = parsed.args[0];
      const validation = validateDescription(description || '');

      if (!validation.valid) {
        console.error(formatError(validation.error!));
        process.exit(1);
      }

      if (validation.warning) {
        console.warn(`Warning: ${validation.warning}`);
      }

      // Validate due date if provided
      if (parsed.options.due && !isValidDate(parsed.options.due)) {
        console.error(formatError('Invalid date format. Use YYYY-MM-DD'));
        process.exit(1);
      }

      const task = taskManager.addTask(description!, parsed.options.due);
      console.log(formatSuccess(`Task added (ID: ${task.id})`));
      shouldSave = true;
      break;
    }

    case 'update': {
      const idStr = parsed.args[0];
      const newDescription = parsed.args[1];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      // Build updates object
      const updates: { description?: string; dueDate?: string | null } = {};

      if (newDescription) {
        const validation = validateDescription(newDescription);
        if (!validation.valid) {
          console.error(formatError(validation.error!));
          process.exit(1);
        }
        updates.description = newDescription;
      }

      if (parsed.options.due !== undefined) {
        if (parsed.options.due && !isValidDate(parsed.options.due)) {
          console.error(formatError('Invalid date format. Use YYYY-MM-DD'));
          process.exit(1);
        }
        updates.dueDate = parsed.options.due || null;
      }

      if (Object.keys(updates).length === 0) {
        console.error(formatError('Provide a new description or --due option'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const task = taskManager.updateTask(id, updates);

      if (!task) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} updated`));
      shouldSave = true;
      break;
    }

    case 'delete': {
      const idStr = parsed.args[0];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const deleted = taskManager.deleteTask(id);

      if (!deleted) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} deleted`));
      shouldSave = true;
      break;
    }

    case 'mark-todo': {
      const idStr = parsed.args[0];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const task = taskManager.markStatus(id, 'todo');

      if (!task) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} marked as todo`));
      shouldSave = true;
      break;
    }

    case 'mark-in-progress': {
      const idStr = parsed.args[0];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const task = taskManager.markStatus(id, 'in-progress');

      if (!task) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} marked as in-progress`));
      shouldSave = true;
      break;
    }

    case 'mark-done': {
      const idStr = parsed.args[0];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const task = taskManager.markStatus(id, 'done');

      if (!task) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} marked as done`));
      shouldSave = true;
      break;
    }

    case 'list': {
      const statusFilter = parsed.args[0] as 'todo' | 'in-progress' | 'done' | undefined;

      if (statusFilter && !['todo', 'in-progress', 'done'].includes(statusFilter)) {
        console.error(formatError(`Invalid status '${statusFilter}'. Use: todo, in-progress, or done`));
        process.exit(1);
      }

      const tasks = taskManager.listTasks(statusFilter, {
        sortByDue: parsed.options.sortByDue
      });

      const title = statusFilter ? `Tasks (${statusFilter})` : 'All Tasks';
      console.log(formatTaskList(tasks, title));
      break;
    }

    case 'search': {
      const keyword = parsed.args[0];

      if (!keyword || !keyword.trim()) {
        console.error(formatError('Search keyword is required'));
        process.exit(1);
      }

      const tasks = taskManager.searchTasks(keyword);
      console.log(formatTaskList(tasks, `Search results for "${keyword}"`));
      break;
    }

    case 'help':
      showHelp();
      break;

    case null:
      if (argv.length === 0) {
        showHelp();
      } else {
        console.error(formatError(`Unknown command '${argv[0]}'`));
        console.error('Run "task help" for usage information.');
        process.exit(1);
      }
      break;

    default:
      console.error(formatError(`Command '${parsed.command}' not implemented`));
      break;
  }

  if (shouldSave) {
    try {
      saveTasks(TASKS_FILE, taskManager.getStore());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(formatError(message));
      process.exit(1);
    }
  }
}

main();
```

---

## Milestone Checklist

| Task | Status |
|------|--------|
| Date validation (YYYY-MM-DD) | ☐ |
| Task ID validation (already in Phase 1) | ✓ |
| Description validation (non-empty) | ☐ |
| Search by keyword (case-insensitive) | ☐ |
| Sort by due date | ☐ |
| Colored/formatted output | ☐ |
| Error messages with proper formatting | ☐ |
| All edge cases handled | ☐ |
| All tests passing | ☐ |

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/types.ts` | Modified | Add ListOptions interface |
| `src/validation.ts` | Modified | Add isValidDate, validateDescription (isValidTaskId from Phase 1) |
| `src/validation.test.ts` | Modified | Add date and description validation tests |
| `src/format.ts` | Created | Output formatting utilities |
| `src/format.test.ts` | Created | Formatting tests |
| `src/task.ts` | Modified | Add search and sort options |
| `src/task.test.ts` | Modified | Add search and sort tests |
| `src/index.ts` | Modified | Integrate all features |

---

## Final Manual Testing

```bash
# Test validation
npm run task add ""                           # Should error
npm run task add "Test" --due 2025-13-01      # Should error (invalid date)
npm run task add "Test" --due 2025-12-25      # Should work

# Test search
npm run task add "Buy groceries"
npm run task add "Call mom"
npm run task add "Grocery shopping"
npm run task search grocery                    # Should find 2 tasks

# Test sorting
npm run task add "Task A" --due 2025-12-30
npm run task add "Task B" --due 2025-12-10
npm run task add "Task C"                      # No due date
npm run task list --sort-by-due               # Should be sorted

# Verify final state
npm run task list
```

---

## Testing Checklist from PRD

| Test | Status |
|------|--------|
| Add task with normal description | ☐ |
| Add task with spaces and special characters | ☐ |
| Multiple tasks get incrementing IDs | ☐ |
| List shows all tasks | ☐ |
| Update changes description | ☐ |
| Delete removes task | ☐ |
| Status changes work | ☐ |
| Tasks persist after restart | ☐ |
| Search finds matching tasks | ☐ |
| Empty description → reject | ☐ |
| Negative task ID → error | ☐ |
| Unicode characters → should work | ☐ |
| Delete non-existent ID → error message | ☐ |
| Invalid date format → helpful error | ☐ |

---

## Complete Task Manager Implementation (Phase 4 Final)

> **Note:** This is the final version of `task.ts` after Phase 4, including `searchTasks` and updated `listTasks` with sorting.

**`src/task.ts` at end of Phase 4:**

```typescript
import type { Task, TaskStatus, TaskStore, TaskUpdate, ListOptions } from './types.js';

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
     * Updates a task's description and/or due date
     */
    updateTask(id: number, updates: TaskUpdate): Task | null {
      const hasDescription = updates.description !== undefined;
      const hasDueDate = 'dueDate' in updates;

      if (!hasDescription && !hasDueDate) {
        return null;
      }

      if (hasDescription && (!updates.description || !updates.description.trim())) {
        return null;
      }

      const task = store.tasks.find(t => t.id === id);
      if (!task) {
        return null;
      }

      if (hasDescription) {
        task.description = updates.description!.trim();
      }
      if (hasDueDate) {
        task.dueDate = updates.dueDate ?? null;
      }

      task.updatedAt = new Date().toISOString();
      return task;
    },

    /**
     * Deletes a task by ID
     */
    deleteTask(id: number): boolean {
      const index = store.tasks.findIndex(t => t.id === id);
      if (index === -1) {
        return false;
      }

      store.tasks.splice(index, 1);
      return true;
    },

    /**
     * Gets a task by ID
     */
    getTask(id: number): Task | null {
      return store.tasks.find(t => t.id === id) ?? null;
    },

    /**
     * Lists tasks, optionally filtered by status and sorted
     * @param statusFilter - Optional status to filter by
     * @param options - Optional sorting/filtering options (default: {})
     */
    listTasks(statusFilter?: TaskStatus, options: ListOptions = {}): Task[] {
      let tasks = statusFilter
        ? store.tasks.filter(task => task.status === statusFilter)
        : [...store.tasks];

      if (options.sortByDue) {
        tasks = tasks.sort((a, b) => {
          // Tasks without due dates go to the end
          if (!a.dueDate && !b.dueDate) return a.id - b.id; // Stable sort by id
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;

          // Sort by due date ascending, then by id for stability
          const dateCompare = a.dueDate.localeCompare(b.dueDate);
          return dateCompare !== 0 ? dateCompare : a.id - b.id;
        });
      }

      return tasks;
    },

    /**
     * Searches tasks by keyword (case-insensitive)
     */
    searchTasks(keyword: string): Task[] {
      if (!keyword || !keyword.trim()) {
        return [];
      }

      const lowerKeyword = keyword.toLowerCase().trim();
      return store.tasks.filter(task =>
        task.description.toLowerCase().includes(lowerKeyword)
      );
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

---

## Complete Types (Phase 4 Final)

**`src/types.ts` at end of Phase 4:**

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

/**
 * Options for updating a task
 */
export interface TaskUpdate {
  description?: string;
  dueDate?: string | null;
}

/**
 * Options for listing tasks
 */
export interface ListOptions {
  sortByDue?: boolean;
}
```

---

## Project Complete!

You have successfully implemented a CLI Task Manager with:

- Full CRUD operations
- JSON persistence
- Due date support with sorting
- Search functionality
- Input validation
- Formatted output
- Comprehensive test coverage

The project follows TDD principles and is ready for production use.
