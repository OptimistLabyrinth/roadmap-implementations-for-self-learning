# Phase 3: Full CRUD Operations

## Objective

Complete all CRUD operations: `update`, `delete`, and complete status management for the CLI Task Manager.

---

## TDD Cycle

```
┌────────────────────────────────────────────────────────┐
│                    TDD Cycle                           │
│                                                        │
│    RED            GREEN          REFACTOR              │
│    Write a         Write minimal   Improve code        │
│    failing test    code to pass    without changing    │
│                                                        │
│         ───────────────────────────────────────►       │
│                     Repeat                             │
└────────────────────────────────────────────────────────┘
```

---

## Steps

### Step 3.1: Implement Update Task

#### RED: Write failing test

**Add to `src/task.test.ts`:**

```typescript
describe('updateTask', () => {
  beforeEach(() => {
    taskManager.addTask('Original description', '2025-12-01');
  });

  it('should update task description', () => {
    const updated = taskManager.updateTask(1, { description: 'New description' });

    expect(updated?.description).toBe('New description');
  });

  it('should update task due date', () => {
    const updated = taskManager.updateTask(1, { dueDate: '2025-12-31' });

    expect(updated?.dueDate).toBe('2025-12-31');
    expect(updated?.description).toBe('Original description'); // Preserved
  });

  it('should update both description and due date', () => {
    const updated = taskManager.updateTask(1, { description: 'New desc', dueDate: '2025-12-31' });

    expect(updated?.description).toBe('New desc');
    expect(updated?.dueDate).toBe('2025-12-31');
  });

  it('should clear due date when set to null', () => {
    const updated = taskManager.updateTask(1, { dueDate: null });

    expect(updated?.dueDate).toBeNull();
  });

  it('should update the updatedAt timestamp', () => {
    const original = taskManager.listTasks()[0];
    const originalDate = new Date(original.updatedAt);

    const updated = taskManager.updateTask(1, { description: 'New description' });

    expect(updated?.updatedAt).toBeDefined();
    const updatedDate = new Date(updated!.updatedAt);
    expect(updatedDate.getTime()).toBeGreaterThanOrEqual(originalDate.getTime());
    expect(updated!.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should preserve other task properties', () => {
    taskManager.markStatus(1, 'in-progress');
    const updated = taskManager.updateTask(1, { description: 'New description' });

    expect(updated?.id).toBe(1);
    expect(updated?.status).toBe('in-progress');
    expect(updated?.dueDate).toBe('2025-12-01'); // Original due date preserved
  });

  it('should return null for non-existent task', () => {
    const result = taskManager.updateTask(999, { description: 'New description' });

    expect(result).toBeNull();
  });

  it('should return null for empty description', () => {
    const result = taskManager.updateTask(1, { description: '' });

    expect(result).toBeNull();
  });

  it('should return null for whitespace-only description', () => {
    const result = taskManager.updateTask(1, { description: '   ' });

    expect(result).toBeNull();
  });

  it('should return null for empty updates object', () => {
    const result = taskManager.updateTask(1, {});

    expect(result).toBeNull();
  });
});
```

#### GREEN: Implement updateTask

**Step 1: Add the TaskUpdate interface to `src/types.ts`:**

> **Note:** Add this after the existing `ParsedArgs` interface.

```typescript
/**
 * Options for updating a task
 */
export interface TaskUpdate {
  description?: string;
  dueDate?: string | null;
}
```

**Step 2: Update the import in `src/task.ts`:**

```typescript
import type { Task, TaskStatus, TaskStore, TaskUpdate } from './types.js';
```

**Step 3: Add the `updateTask` method to `src/task.ts` in createTaskManager:**

```typescript
/**
 * Updates a task's description and/or due date
 * @param id - Task ID to update
 * @param updates - Object with optional description and/or dueDate
 * @returns Updated task or null if not found or invalid
 */
updateTask(id: number, updates: TaskUpdate): Task | null {
  // Validate: at least one field must be provided
  const hasDescription = updates.description !== undefined;
  const hasDueDate = 'dueDate' in updates;

  if (!hasDescription && !hasDueDate) {
    return null;
  }

  // Validate description if provided
  if (hasDescription && (!updates.description || !updates.description.trim())) {
    return null;
  }

  const task = store.tasks.find(t => t.id === id);
  if (!task) {
    return null;
  }

  // Apply updates
  if (hasDescription) {
    task.description = updates.description!.trim();
  }
  if (hasDueDate) {
    task.dueDate = updates.dueDate ?? null;
  }

  task.updatedAt = new Date().toISOString();
  return task;
},
```

**Run test:**

```bash
npm test -- src/task.test.ts
```

---

### Step 3.2: Implement Delete Task

#### RED: Write failing test

**Add to `src/task.test.ts`:**

```typescript
describe('deleteTask', () => {
  beforeEach(() => {
    taskManager.addTask('Task 1');
    taskManager.addTask('Task 2');
    taskManager.addTask('Task 3');
  });

  it('should remove task from list', () => {
    const deleted = taskManager.deleteTask(2);

    expect(deleted).toBe(true);
    expect(taskManager.listTasks()).toHaveLength(2);
  });

  it('should preserve remaining tasks', () => {
    taskManager.deleteTask(2);
    const tasks = taskManager.listTasks();

    expect(tasks.find(t => t.id === 1)).toBeDefined();
    expect(tasks.find(t => t.id === 2)).toBeUndefined();
    expect(tasks.find(t => t.id === 3)).toBeDefined();
  });

  it('should return false for non-existent task', () => {
    const result = taskManager.deleteTask(999);

    expect(result).toBe(false);
  });

  it('should not affect nextId', () => {
    taskManager.deleteTask(3);
    const newTask = taskManager.addTask('Task 4');

    expect(newTask.id).toBe(4); // Not 3!
  });

  it('should handle deleting all tasks', () => {
    taskManager.deleteTask(1);
    taskManager.deleteTask(2);
    taskManager.deleteTask(3);

    expect(taskManager.listTasks()).toHaveLength(0);
    expect(taskManager.getStore().nextId).toBe(4);
  });
});
```

#### GREEN: Implement deleteTask

**Add to `src/task.ts` in createTaskManager:**

```typescript
/**
 * Deletes a task by ID
 * Returns true if deleted, false if not found
 */
deleteTask(id: number): boolean {
  const index = store.tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return false;
  }

  store.tasks.splice(index, 1);
  return true;
},
```

**Run test:**

```bash
npm test -- src/task.test.ts
```

---

### Step 3.3: Implement Get Task by ID

> **Note:** The `getTask` method is a utility function used for:
> - Integration tests to verify task state (Step 3.5)
> - Future features (e.g., `task show <id>` command)
> - Internal lookups in more complex operations
>
> **Important:** Complete this step before Step 3.5, as the integration tests depend on `getTask`.

#### RED: Write failing test

**Add to `src/task.test.ts`:**

```typescript
describe('getTask', () => {
  it('should return task by ID', () => {
    taskManager.addTask('Task 1');
    taskManager.addTask('Task 2');

    const task = taskManager.getTask(1);

    expect(task?.id).toBe(1);
    expect(task?.description).toBe('Task 1');
  });

  it('should return null for non-existent task', () => {
    const task = taskManager.getTask(999);

    expect(task).toBeNull();
  });
});
```

#### GREEN: Implement getTask

**Add to `src/task.ts` in createTaskManager:**

```typescript
/**
 * Gets a task by ID
 */
getTask(id: number): Task | null {
  return store.tasks.find(t => t.id === id) ?? null;
},
```

---

### Step 3.4: Update CLI with Full CRUD

#### GREEN: Update index.ts

**Update `src/index.ts` to include all commands:**

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
      if (!description.trim()) {
        console.error('Error: Description cannot be empty');
        process.exit(1);
      }
      const task = taskManager.addTask(description.trim(), parsed.options.due);
      console.log(`Task added successfully (ID: ${task.id})`);
      shouldSave = true;
      break;
    }

    case 'update': {
      const idStr = parsed.args[0];
      const newDescription = parsed.args[1];

      if (!isValidTaskId(idStr)) {
        console.error('Error: Valid positive task ID is required');
        process.exit(1);
      }

      // Build updates object
      const updates: { description?: string; dueDate?: string | null } = {};

      if (newDescription) {
        updates.description = newDescription;
      }
      if (parsed.options.due !== undefined) {
        updates.dueDate = parsed.options.due || null;
      }

      if (Object.keys(updates).length === 0) {
        console.error('Error: Provide a new description or --due option');
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const task = taskManager.updateTask(id, updates);
      if (!task) {
        console.error(`Error: Task with ID ${id} not found or invalid update`);
        process.exit(1);
      }
      console.log(`Task ${id} updated successfully`);
      shouldSave = true;
      break;
    }

    case 'delete': {
      const idStr = parsed.args[0];
      if (!isValidTaskId(idStr)) {
        console.error('Error: Valid positive task ID is required');
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const deleted = taskManager.deleteTask(id);
      if (!deleted) {
        console.error(`Error: Task with ID ${id} not found`);
        process.exit(1);
      }
      console.log(`Task ${id} deleted successfully`);
      shouldSave = true;
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

    case 'list': {
      const statusFilter = parsed.args[0] as 'todo' | 'in-progress' | 'done' | undefined;

      // Validate status filter if provided
      if (statusFilter && !['todo', 'in-progress', 'done'].includes(statusFilter)) {
        console.error(`Error: Invalid status '${statusFilter}'. Use: todo, in-progress, or done`);
        process.exit(1);
      }

      const tasks = taskManager.listTasks(statusFilter);

      if (tasks.length === 0) {
        if (statusFilter) {
          console.log(`No tasks with status '${statusFilter}'.`);
        } else {
          console.log('No tasks found.');
        }
      } else {
        console.log('\nTasks:');
        console.log('─'.repeat(70));

        for (const task of tasks) {
          const dueStr = task.dueDate ? ` [Due: ${task.dueDate}]` : '';
          const statusIcon = task.status === 'done' ? '✓' : task.status === 'in-progress' ? '→' : '○';
          console.log(`${statusIcon} [${task.id}] ${task.description}${dueStr}`);
          console.log(`     Status: ${task.status} | Created: ${task.createdAt.slice(0, 10)}`);
        }

        console.log('─'.repeat(70));
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

---

### Step 3.5: Integration Tests for CRUD

#### RED: Write failing tests

**Add to `src/integration.test.ts`:**

```typescript
/**
 * Note: This block should be added to the existing integration.test.ts file.
 * Ensure createTaskManager is imported at the top of the file:
 * import { createTaskManager } from './task.js';
 */
describe('Full CRUD Integration', () => {
  let taskManager: ReturnType<typeof createTaskManager>;

  beforeEach(() => {
    if (existsSync(TEST_FILE)) {
      rmSync(TEST_FILE);
    }
    const store = loadTasks(TEST_FILE);
    taskManager = createTaskManager();
    taskManager.loadStore(store);
  });

  afterEach(() => {
    if (existsSync(TEST_FILE)) {
      rmSync(TEST_FILE);
    }
  });

  it('should complete full CRUD lifecycle', () => {
    // Create
    const task1 = taskManager.addTask('Original task');
    saveTasks(TEST_FILE, taskManager.getStore());
    expect(loadTasks(TEST_FILE).tasks).toHaveLength(1);

    // Read
    const loaded = loadTasks(TEST_FILE);
    taskManager.loadStore(loaded);
    expect(taskManager.getTask(1)?.description).toBe('Original task');

    // Update
    taskManager.updateTask(1, { description: 'Updated task' });
    saveTasks(TEST_FILE, taskManager.getStore());
    expect(loadTasks(TEST_FILE).tasks[0].description).toBe('Updated task');

    // Delete
    taskManager.deleteTask(1);
    saveTasks(TEST_FILE, taskManager.getStore());
    expect(loadTasks(TEST_FILE).tasks).toHaveLength(0);
  });

  it('should persist status changes', () => {
    taskManager.addTask('Status test');
    taskManager.markStatus(1, 'in-progress');
    saveTasks(TEST_FILE, taskManager.getStore());

    const loaded = loadTasks(TEST_FILE);
    expect(loaded.tasks[0].status).toBe('in-progress');
  });
});
```

**Run all tests:**

```bash
npm test
```

---

## Complete Task Manager Implementation (Phase 3)

> **Note:** This is the Phase 3 version of `task.ts`. Phase 4 will add `searchTasks` and sorting options.

**`src/task.ts` at end of Phase 3:**

```typescript
import type { Task, TaskStatus, TaskStore, TaskUpdate } from './types.js';

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

---

## Milestone Checklist

| Task | Status |
|------|--------|
| `updateTask` implemented and tested | ☐ |
| `deleteTask` implemented and tested | ☐ |
| `getTask` implemented and tested | ☐ |
| CLI `update` command works | ☐ |
| CLI `delete` command works | ☐ |
| CLI `mark-todo` command works | ☐ |
| CLI `mark-in-progress` command works | ☐ |
| CLI `mark-done` command works | ☐ |
| Full CRUD lifecycle persists correctly | ☐ |
| Proper error messages for all edge cases | ☐ |
| All tests passing | ☐ |

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/task.ts` | Modified | Add updateTask, deleteTask, getTask |
| `src/task.test.ts` | Modified | Add tests for new methods |
| `src/index.ts` | Modified | Add update, delete commands |
| `src/integration.test.ts` | Modified | Add CRUD lifecycle tests |

---

## Manual Testing

```bash
# Add tasks
npm run task add "Task one"
npm run task add "Task two"
npm run task add "Task three"

# List all
npm run task list

# Update task
npm run task update 2 "Updated task two"

# Mark status
npm run task mark-in-progress 1
npm run task mark-done 3
npm run task mark-todo 1

# List by status
npm run task list done
npm run task list in-progress

# Delete task
npm run task delete 2

# Verify final state
npm run task list
cat tasks.json
```

---

## Next Phase

[Phase 4: Polish →](./phase-04.md)
