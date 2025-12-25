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
