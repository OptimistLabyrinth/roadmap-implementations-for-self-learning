/**
 * Validates a task ID string
 * - Must be a positive integer
 * - Must not have leading zeros (e.g., '01' is invalid)
 * - The String(id) === idStr check ensures no leading zeros since Number('01') = 1
 */
export function isValidTaskId(idStr: string): boolean {
  if (!idStr || typeof idStr !== 'string') {
    return false;
  }

  const id = Number(idStr);
  return Number.isInteger(id) && id > 0 && String(id) === idStr;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DESCRIPTION_LENGTH = 200;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validates a date string is in YYYY-MM-DD format and is a valid date
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }

  // Check format
  if (!DATE_REGEX.test(dateStr)) {
    return false;
  }

  // Check if it's a valid date
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Validates a task description
 */
export function validateDescription(description: string): ValidationResult {
  if (!description || !description.trim()) {
    return { valid: false, error: 'Description cannot be empty' };
  }

  const trimmed = description.trim();

  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: true,
      warning: `Description is very long (${trimmed.length} characters)`
    };
  }

  return { valid: true };
}
