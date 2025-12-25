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
