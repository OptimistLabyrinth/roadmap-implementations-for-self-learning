import { describe, it, expect } from 'vitest';
import { isValidTaskId, isValidDate, validateDescription } from './validation.js';

describe('Validation', () => {
  describe('isValidTaskId', () => {
    it('should accept positive integers', () => {
      expect(isValidTaskId('1')).toBe(true);
      expect(isValidTaskId('100')).toBe(true);
      expect(isValidTaskId('999999')).toBe(true);
    });

    it('should reject non-positive integers', () => {
      expect(isValidTaskId('0')).toBe(false);
      expect(isValidTaskId('-1')).toBe(false);
      expect(isValidTaskId('-100')).toBe(false);
    });

    it('should reject non-integers', () => {
      expect(isValidTaskId('1.5')).toBe(false);
      expect(isValidTaskId('abc')).toBe(false);
      expect(isValidTaskId('')).toBe(false);
      expect(isValidTaskId('1a')).toBe(false);
    });

    it('should reject leading zeros', () => {
      expect(isValidTaskId('01')).toBe(false);
      expect(isValidTaskId('007')).toBe(false);
      expect(isValidTaskId('0123')).toBe(false);
    });
  });

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
      expect(validateDescription('Cafe ☕')).toEqual({ valid: true });
    });

    it('should warn for very long descriptions', () => {
      const longDesc = 'a'.repeat(300);
      const result = validateDescription(longDesc);
      expect(result.valid).toBe(true);
      expect(result.warning).toBe('Description is very long (300 characters)');
    });
  });
});
