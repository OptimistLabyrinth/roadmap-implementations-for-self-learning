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
