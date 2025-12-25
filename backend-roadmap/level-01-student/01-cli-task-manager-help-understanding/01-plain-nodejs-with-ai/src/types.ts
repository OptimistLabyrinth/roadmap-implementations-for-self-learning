/**
 * Valid status values for a task
 */
export type TaskStatus = 'todo' | 'in-progress' | 'done';

/**
 * Represents a single task
 */
export interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Storage structure for tasks.json
 */
export interface TaskStore {
  tasks: Task[];
  nextId: number;
}

/**
 * Supported CLI commands
 */
export type Command =
  | 'add'
  | 'update'
  | 'delete'
  | 'mark-todo'
  | 'mark-in-progress'
  | 'mark-done'
  | 'list'
  | 'search'
  | 'help';

/**
 * Parsed CLI arguments
 */
export interface ParsedArgs {
  command: Command | null;
  args: string[];
  options: {
    due?: string;
    sortByDue?: boolean;
  };
}

/**
 * Options for updating a task
 */
export interface TaskUpdate {
  description?: string;
  dueDate?: string | null;
}

/**
 * Options for listing tasks
 */
export interface ListOptions {
  sortByDue?: boolean;
}
