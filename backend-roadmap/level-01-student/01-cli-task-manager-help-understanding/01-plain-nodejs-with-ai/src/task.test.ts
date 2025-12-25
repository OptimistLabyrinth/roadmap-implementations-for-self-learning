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
});
