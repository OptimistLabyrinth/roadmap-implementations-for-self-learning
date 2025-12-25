#!/usr/bin/env node

import { join } from 'path';
import { parseArgs, showHelp } from './cli.js';
import { createTaskManager } from './task.js';
import { loadTasks, saveTasks } from './storage.js';
import { isValidDate, isValidTaskId, validateDescription } from './validation.js';
import { formatTaskList, formatError, formatSuccess } from './format.js';

// Default storage file path
const TASKS_FILE = join(process.cwd(), 'tasks.json');

function main() {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);

  const store = loadTasks(TASKS_FILE);
  const taskManager = createTaskManager();
  taskManager.loadStore(store);

  let shouldSave = false;

  switch (parsed.command) {
    case 'add': {
      const description = parsed.args[0];
      const validation = validateDescription(description || '');

      if (!validation.valid) {
        console.error(formatError(validation.error!));
        process.exit(1);
      }

      if (validation.warning) {
        console.warn(`Warning: ${validation.warning}`);
      }

      // Validate due date if provided
      if (parsed.options.due && !isValidDate(parsed.options.due)) {
        console.error(formatError('Invalid date format. Use YYYY-MM-DD'));
        process.exit(1);
      }

      const task = taskManager.addTask(description!, parsed.options.due);
      console.log(formatSuccess(`Task added (ID: ${task.id})`));
      shouldSave = true;
      break;
    }

    case 'update': {
      const idStr = parsed.args[0];
      const newDescription = parsed.args[1];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      // Build updates object
      const updates: { description?: string; dueDate?: string | null } = {};

      if (newDescription) {
        const validation = validateDescription(newDescription);
        if (!validation.valid) {
          console.error(formatError(validation.error!));
          process.exit(1);
        }
        updates.description = newDescription;
      }

      if (parsed.options.due !== undefined) {
        if (parsed.options.due && !isValidDate(parsed.options.due)) {
          console.error(formatError('Invalid date format. Use YYYY-MM-DD'));
          process.exit(1);
        }
        updates.dueDate = parsed.options.due || null;
      }

      if (Object.keys(updates).length === 0) {
        console.error(formatError('Provide a new description or --due option'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const task = taskManager.updateTask(id, updates);

      if (!task) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} updated`));
      shouldSave = true;
      break;
    }

    case 'delete': {
      const idStr = parsed.args[0];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const deleted = taskManager.deleteTask(id);

      if (!deleted) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} deleted`));
      shouldSave = true;
      break;
    }

    case 'mark-todo': {
      const idStr = parsed.args[0];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const task = taskManager.markStatus(id, 'todo');

      if (!task) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} marked as todo`));
      shouldSave = true;
      break;
    }

    case 'mark-in-progress': {
      const idStr = parsed.args[0];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const task = taskManager.markStatus(id, 'in-progress');

      if (!task) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} marked as in-progress`));
      shouldSave = true;
      break;
    }

    case 'mark-done': {
      const idStr = parsed.args[0];

      if (!isValidTaskId(idStr)) {
        console.error(formatError('Valid positive task ID is required'));
        process.exit(1);
      }

      const id = parseInt(idStr, 10);
      const task = taskManager.markStatus(id, 'done');

      if (!task) {
        console.error(formatError(`Task with ID ${id} not found`));
        process.exit(1);
      }

      console.log(formatSuccess(`Task ${id} marked as done`));
      shouldSave = true;
      break;
    }

    case 'list': {
      const statusFilter = parsed.args[0] as 'todo' | 'in-progress' | 'done' | undefined;

      if (statusFilter && !['todo', 'in-progress', 'done'].includes(statusFilter)) {
        console.error(formatError(`Invalid status '${statusFilter}'. Use: todo, in-progress, or done`));
        process.exit(1);
      }

      const tasks = taskManager.listTasks(statusFilter, {
        sortByDue: parsed.options.sortByDue
      });

      const title = statusFilter ? `Tasks (${statusFilter})` : 'All Tasks';
      console.log(formatTaskList(tasks, title));
      break;
    }

    case 'search': {
      const keyword = parsed.args[0];

      if (!keyword || !keyword.trim()) {
        console.error(formatError('Search keyword is required'));
        process.exit(1);
      }

      const tasks = taskManager.searchTasks(keyword);
      console.log(formatTaskList(tasks, `Search results for "${keyword}"`));
      break;
    }

    case 'help':
      showHelp();
      break;

    case null:
      if (argv.length === 0) {
        showHelp();
      } else {
        console.error(formatError(`Unknown command '${argv[0]}'`));
        console.error('Run "task help" for usage information.');
        process.exit(1);
      }
      break;

    default:
      console.error(formatError(`Command '${parsed.command}' not implemented`));
      break;
  }

  if (shouldSave) {
    try {
      saveTasks(TASKS_FILE, taskManager.getStore());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(formatError(message));
      process.exit(1);
    }
  }
}

main();
