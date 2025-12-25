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
