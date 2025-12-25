import type { Task } from './types.js';

const STATUS_ICONS: Record<string, string> = {
  'todo': '○',
  'in-progress': '→',
  'done': '✓'
};

const STATUS_COLORS: Record<string, string> = {
  'todo': '\x1b[33m',      // Yellow
  'in-progress': '\x1b[34m', // Blue
  'done': '\x1b[32m'        // Green
};

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

/**
 * Formats a single task for display
 */
export function formatTask(task: Task, useColor = true): string {
  const icon = STATUS_ICONS[task.status] || '?';
  const statusColor = useColor ? STATUS_COLORS[task.status] || '' : '';
  const reset = useColor ? RESET : '';
  const dim = useColor ? DIM : '';
  const bold = useColor ? BOLD : '';

  const dueStr = task.dueDate ? ` ${dim}[Due: ${task.dueDate}]${reset}` : '';
  const idStr = `${dim}#${task.id}${reset}`;

  const line1 = `${statusColor}${icon}${reset} ${idStr} ${bold}${task.description}${reset}${dueStr}`;

  return line1;
}

/**
 * Formats a list of tasks for display
 */
export function formatTaskList(tasks: Task[], title = 'Tasks', useColor = true): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  const lines: string[] = [];
  const dim = useColor ? DIM : '';
  const reset = useColor ? RESET : '';

  lines.push('');
  lines.push(title);
  lines.push(`${dim}${'─'.repeat(70)}${reset}`);

  for (const task of tasks) {
    lines.push(formatTask(task, useColor));
  }

  lines.push(`${dim}${'─'.repeat(70)}${reset}`);
  lines.push(`Total: ${tasks.length} task(s)`);

  return lines.join('\n');
}

/**
 * Formats an error message
 */
export function formatError(message: string): string {
  return `\x1b[31mError:\x1b[0m ${message}`;
}

/**
 * Formats a success message
 */
export function formatSuccess(message: string): string {
  return `\x1b[32m✓\x1b[0m ${message}`;
}
