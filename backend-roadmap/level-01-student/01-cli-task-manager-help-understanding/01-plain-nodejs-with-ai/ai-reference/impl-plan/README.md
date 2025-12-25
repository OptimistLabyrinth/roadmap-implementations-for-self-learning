# CLI Task Manager - Implementation Plan

A TDD-based implementation plan for building a command-line task manager with JSON persistence.

## Project Overview

| Aspect | Detail |
|--------|--------|
| Language | TypeScript (Node.js ESM) |
| Test Framework | Vitest |
| Project Type | CLI Application |
| Storage | JSON file (tasks.json) |

## How to Use This Plan

Each phase builds upon the previous one. **Complete phases in order** as later phases depend on code from earlier phases.

- **Cumulative Implementation**: Each phase's `index.ts` replaces the previous version
- **Incremental Testing**: Add new test cases to existing test files (don't replace)
- **Backward Compatibility**: API changes maintain compatibility with earlier code

## Phase Overview

| Phase | Title | Description | Key Deliverables |
|-------|-------|-------------|------------------|
| [Phase 0](./phase-00.md) | Project Setup | TDD infrastructure setup | TypeScript, Vitest, project structure |
| [Phase 1](./phase-01.md) | Foundation | Types, CLI parsing, basic commands | Types, argument parser, isValidTaskId, add/list in-memory |
| [Phase 2](./phase-02.md) | Persistence | JSON file storage | loadTasks, saveTasks, file error handling, try-catch save |
| [Phase 3](./phase-03.md) | Full CRUD | Complete CRUD operations | update, delete, status changes |
| [Phase 4](./phase-04.md) | Polish | Advanced features | Search, sort, date validation, formatting |

## Phase Dependencies

> **Legend:** `(NEW)` = file created, `+=` = methods/features added to existing file

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
  │            │           │           │           │
  │            │           │           │           └─ validation.ts += isValidDate, validateDescription
  │            │           │           │              validation.test.ts += date/description tests
  │            │           │           │              format.ts, format.test.ts (NEW)
  │            │           │           │              types.ts += ListOptions
  │            │           │           │              task.ts += searchTasks, sort
  │            │           │           │              task.test.ts += search/sort tests
  │            │           │           │              index.ts += search, formatting
  │            │           │           │
  │            │           │           └─ types.ts += TaskUpdate
  │            │           │              task.ts += updateTask, deleteTask, getTask
  │            │           │              task.test.ts += CRUD tests
  │            │           │              index.ts += update, delete commands (uses isValidTaskId)
  │            │           │              integration.test.ts += CRUD lifecycle tests
  │            │           │
  │            │           └─ storage.ts, storage.test.ts, integration.test.ts (NEW)
  │            │              index.ts += persistence, mark-* commands (uses isValidTaskId)
  │            │              index.ts += try-catch for saveTasks errors
  │            │
  │            └─ types.ts, cli.ts, task.ts (NEW)
  │               types.test.ts, cli.test.ts, task.test.ts (NEW)
  │               validation.ts, validation.test.ts (NEW) - isValidTaskId
  │               task.ts: addTask, listTasks, markStatus, getStore, loadStore
  │               index.ts (basic CLI: add, list, help)
  │
  └─ Project infrastructure (tsconfig, vitest, package.json)
      index.ts (placeholder)
```

## Commands Implemented

| Command | Example | Description |
|---------|---------|-------------|
| `add` | `task add "Buy groceries"` | Add a new task |
| `add --due` | `task add "Report" --due 2025-12-25` | Add task with due date |
| `update` | `task update 1 "New description"` | Update task description |
| `update --due` | `task update 1 "New desc" --due 2025-12-31` | Update with new due date |
| `delete` | `task delete 1` | Delete a task |
| `mark-todo` | `task mark-todo 1` | Reset task status to todo |
| `mark-in-progress` | `task mark-in-progress 1` | Mark task as in-progress |
| `mark-done` | `task mark-done 1` | Mark task as done |
| `list` | `task list` | List all tasks |
| `list <status>` | `task list done` | Filter by status |
| `list --sort-by-due` | `task list --sort-by-due` | Sort by due date |
| `search` | `task search "groceries"` | Search by keyword |
| `help` | `task help` | Show usage information |

## Data Model

```json
{
  "tasks": [
    {
      "id": 1,
      "description": "Buy groceries",
      "status": "todo",
      "dueDate": "2025-12-25",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "nextId": 2
}
```

## Project Structure (Final)

> **Note:** This is the final structure after completing all phases. Files are created progressively:
> - Phase 0: package.json, tsconfig.json, vitest.config.ts, src/index.ts (placeholder), src/setup.test.ts (temporary, deleted after verification)
> - Phase 1: types.ts, types.test.ts, cli.ts, cli.test.ts, task.ts, task.test.ts, validation.ts (isValidTaskId), validation.test.ts, index.ts (basic CLI: add, list, help)
> - Phase 2: storage.ts, storage.test.ts (with write error test), integration.test.ts, index.ts (persistence + mark-* commands + try-catch save errors)
> - Phase 3: types.ts (add TaskUpdate), task.ts (add updateTask, deleteTask, getTask), task.test.ts (add tests), index.ts (add update, delete commands), integration.test.ts (add CRUD tests)
> - Phase 4: validation.ts (add isValidDate, validateDescription), validation.test.ts (add tests), format.ts, format.test.ts, types.ts (add ListOptions), task.ts (add searchTasks, sorting), index.ts (add search + use formatting)

```
01-plain-nodejs-with-ai/
├── src/
│   ├── index.ts           # CLI entry point
│   ├── types.ts           # Type definitions
│   ├── types.test.ts      # Type tests
│   ├── cli.ts             # Argument parsing
│   ├── cli.test.ts        # CLI tests
│   ├── task.ts            # Task operations
│   ├── task.test.ts       # Task tests
│   ├── storage.ts         # JSON file I/O
│   ├── storage.test.ts    # Storage tests
│   ├── validation.ts      # Input validation (Phase 4)
│   ├── validation.test.ts # Validation tests (Phase 4)
│   ├── format.ts          # Output formatting (Phase 4)
│   ├── format.test.ts     # Format tests (Phase 4)
│   └── integration.test.ts # Integration tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── tasks.json             # Runtime data file (created on first use)
```

## Getting Started

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run the CLI
npm run task help
npm run task add "My first task"
npm run task list
```

## TDD Approach

Each feature follows the Red-Green-Refactor cycle:

1. **RED**: Write a failing test
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve code quality

## PRD Reference

This implementation plan is based on:
- [CLI Task Manager PRD](https://github.com/OptimistLabyrinth/roadmaps-for-self-learning/blob/develop/backend-roadmap/level-01-student/01-cli-task-manager-help-understanding.md)

## Review Notes

This implementation plan has been reviewed for:
- Cross-phase consistency of code and tests
- Proper TDD cycle adherence (RED → GREEN → REFACTOR)
- Backward compatibility between phases
- Complete code examples at the end of each phase
- Proper file creation/modification tracking

### Revision History

| Date | Changes |
|------|---------|
| 2025-12-26 | Added `update --due` option, strict ID validation, file write error handling, store validation |
| 2025-12-26 | Code review: Moved `isValidTaskId` to Phase 1, added try-catch for saveTasks in Phase 2/3, added write error test, fixed TaskUpdate import steps |
| 2025-12-26 | Code review round 2: Restored try-catch in Phase 4 final index.ts, separated Windows-incompatible chmod tests with `describe.skipIf(process.platform === 'win32')` |
