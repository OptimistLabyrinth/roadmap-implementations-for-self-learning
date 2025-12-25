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
