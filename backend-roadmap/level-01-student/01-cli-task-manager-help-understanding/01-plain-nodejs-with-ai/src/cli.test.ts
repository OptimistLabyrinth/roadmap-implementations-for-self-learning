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
