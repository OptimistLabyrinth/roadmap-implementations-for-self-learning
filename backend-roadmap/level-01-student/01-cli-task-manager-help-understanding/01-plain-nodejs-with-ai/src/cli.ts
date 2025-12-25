import type { Command, ParsedArgs } from './types.js';

const VALID_COMMANDS: Command[] = [
  'add',
  'update',
  'delete',
  'mark-todo',
  'mark-in-progress',
  'mark-done',
  'list',
  'search',
  'help'
];

/**
 * Parses command-line arguments into a structured format
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: null,
    args: [],
    options: {}
  };

  if (argv.length === 0) {
    return result;
  }

  const [commandCandidate, ...rest] = argv;

  // Check if first argument is a valid command
  if (VALID_COMMANDS.includes(commandCandidate as Command)) {
    result.command = commandCandidate as Command;
  } else {
    // Invalid command - put it in args
    result.args = argv;
    return result;
  }

  // Parse remaining arguments and options
  let i = 0;
  while (i < rest.length) {
    const current = rest[i];

    if (current === '--due' && i + 1 < rest.length) {
      result.options.due = rest[i + 1];
      i += 2;
    } else if (current === '--sort-by-due') {
      result.options.sortByDue = true;
      i += 1;
    } else if (!current.startsWith('--')) {
      result.args.push(current);
      i += 1;
    } else {
      // Unknown option, skip
      i += 1;
    }
  }

  return result;
}

/**
 * Displays help text
 */
export function showHelp(): void {
  console.log(`
Task Manager CLI

Usage:
  task <command> [arguments] [options]

Commands:
  add <description> [--due YYYY-MM-DD]  Add a new task
  update <id> [description] [--due YYYY-MM-DD]  Update task description and/or due date
  delete <id>                           Delete a task
  mark-todo <id>                        Mark task as todo (reset status)
  mark-in-progress <id>                 Mark task as in-progress
  mark-done <id>                        Mark task as done
  list [status] [--sort-by-due]         List tasks (optionally filter by status)
  search <keyword>                      Search tasks by keyword
  help                                  Show this help message

Examples:
  task add "Buy groceries"
  task add "Submit report" --due 2025-12-25
  task update 1 "Buy almond milk"
  task update 1 --due 2025-12-31
  task delete 1
  task mark-todo 1
  task mark-done 1
  task list
  task list done
  task list --sort-by-due
  task search groceries
`);
}
