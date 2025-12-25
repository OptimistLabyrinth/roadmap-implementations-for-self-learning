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
});
