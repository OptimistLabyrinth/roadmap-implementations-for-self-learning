---
name: impl-plan
description: Create TDD-based implementation plans from requirements. Use when converting PRDs, specs, feature requests, user stories, or project ideas into phased implementation plans with test-first development. Triggers on "implementation plan", "impl plan", "create phases", "build plan from", "PRD to plan", "spec to plan", "plan this feature".
allowed-tools: Read, Glob, Grep, Write, Edit
---

# Implementation Plan Generator

Generate phased, TDD-based implementation plans from any requirements source.

## Supported Input Types

| Input Type | Description | Example |
|------------|-------------|---------|
| PRD | Product Requirements Document | Detailed feature specification |
| Spec | Technical specification | API contract, data models |
| User Story | Agile user story | "As a user, I want to..." |
| Feature Request | Brief feature description | GitHub issue, ticket |
| Project Idea | High-level concept | "Build a CLI tool that..." |
| Existing Code | Codebase to extend | Add feature to existing project |

## Core Principles

1. **TDD Cycle**: Every feature follows Red-Green-Refactor
2. **Incremental Phases**: Each phase is independently testable and deployable
3. **Vertical Slices**: Complete features over horizontal layers
4. **Language Agnostic**: Adapt to project's language and tooling
5. **No External Side Effects**: Do not execute commands or modify system state outside plan files
6. **Ask Clarification Questions to Users**: If anything is still undecided, don't just leave it hanging—present a set of recommended options and ask the user directly to make a clear choice.

## Instructions

### Step 1: Detect Project Context

Before generating phases, identify:

| Factor | How to Detect | Default |
|--------|---------------|---------|
| Language | File extensions, package files | Ask user |
| Test Framework | Existing test files, config | Language default |
| Project Type | Structure, entry points | CLI |
| Existing Patterns | Code style, architecture | Clean architecture |

Common detection patterns:

| Files Present | Language | Test Framework | Build Tool |
|---------------|----------|----------------|------------|
| `package.json`, `*.ts` | TypeScript/Node.js | vitest, jest | npm/pnpm |
| `package.json`, `*.js` | JavaScript/Node.js | vitest, jest | npm/pnpm |
| `pyproject.toml`, `*.py` | Python | pytest | pip/poetry |
| `go.mod`, `*.go` | Go | go test | go |
| `Cargo.toml`, `*.rs` | Rust | cargo test | cargo |
| `pom.xml`, `*.java` | Java (Maven) | JUnit | Maven |
| `build.gradle`, `*.java` | Java (Gradle) | JUnit | Gradle |
| `build.gradle.kts`, `*.kt` | Kotlin (Gradle) | JUnit, Kotest | Gradle |
| `build.gradle.kts`, `*.java` | Java (Gradle Kotlin DSL) | JUnit | Gradle |
| `*.rb`, `Gemfile` | Ruby | RSpec | bundler |

### Step 2: Analyze Requirements

- Read the input document completely
- Identify core entities and data models
- List all required commands/endpoints/functions
- Map dependencies between features
- Identify edge cases and error scenarios

### Step 3: Determine Phase Count

| Phase | Purpose | Required |
|-------|---------|----------|
| Phase 0 | Project setup + TDD infrastructure | Always |
| Phase 1 | Foundation - types, entry point, basic structure | Always |
| Phase 2-N | Feature phases (typically 2-4) | Based on scope |
| Final Phase | Polish, error handling, edge cases | Always |

Typical project has 4-6 phases total.

### Step 4: Generate Phase Documents

For each phase, create a **separate markdown file** with zero-padded numbering:
- `phase-00.md` - Project setup + TDD infrastructure
- `phase-01.md` - Foundation phase
- `phase-02.md` to `phase-NN.md` - Feature phases
- Final phase - Polish, error handling, edge cases

For Phase 0, reference [templates/phase-00-setup.md](templates/phase-00-setup.md) for language-specific setup commands.

**Output Structure**:

| Item | Convention |
|------|------------|
| Directory | User-specified path, or `[project-root]/ai-reference/impl-plan/` |
| File naming | `phase-00.md`, `phase-01.md`, `phase-02.md`, ... |
| Index file | Optional `README.md` with phase overview |

Directory preference (in order):
1. User-specified path
2. `[project-root]/ai-reference/impl-plan/`
3. `[project-root]/impl-plan/`
4. `[project-root]/docs/impl-plan/`

**Each phase MUST be a separate file** following the `phase-NN.md` naming convention where NN is zero-padded (00, 01, 02, ...).

## Project Type Adaptations

### CLI Application

| Aspect | Approach |
|--------|----------|
| Entry Point | Single executable, argument parsing |
| Commands | Subcommands with handlers |
| Output | stdout/stderr, exit codes |
| Testing | Mock stdin/stdout, integration tests |

### REST API

| Aspect | Approach |
|--------|----------|
| Entry Point | HTTP server, route definitions |
| Endpoints | Controllers/handlers per resource |
| Output | JSON responses, HTTP status codes |
| Testing | HTTP client tests, mock database |

### Library/Package

| Aspect | Approach |
|--------|----------|
| Entry Point | Public API exports |
| Functions | Pure functions, composable modules |
| Output | Return values, exceptions |
| Testing | Unit tests, property-based tests |

### Full-Stack Application

| Aspect | Approach |
|--------|----------|
| Entry Point | Backend server + frontend build |
| Components | API routes + UI components |
| Output | API responses + rendered UI |
| Testing | E2E tests, component tests, API tests |

## Key Factors to Include

### Per Phase Document

| Factor | Required | Description |
|--------|----------|-------------|
| Objective | Yes | 1-2 sentence goal |
| TDD Diagram | Yes | Visual Red-Green-Refactor cycle |
| Numbered Steps | Yes | Each step has test -> implementation |
| Test Examples | Yes | Complete test code BEFORE implementation |
| Implementation Examples | Yes | Minimum code to pass tests |
| Milestone Checklist | Yes | Verifiable outcomes |
| Files Table | Yes | All files created/modified |
| Next Phase Link | Yes | Navigation to next phase |

### Per Feature/Step

| Factor | Required | Description |
|--------|----------|-------------|
| Test Case | Yes | Descriptive test name and full code |
| Expected Behavior | Yes | What the code should do |
| Edge Cases | Yes | Boundary conditions to test |
| Error Scenarios | Yes | How errors are handled |
| Types/Schemas | When applicable | Type definitions, schemas, contracts |

## Restrictions

### MUST NOT

| Restriction | Rationale |
|-------------|-----------|
| Skip Phase 0 | Setup is always required for TDD |
| Combine unrelated features | Phases must be cohesive |
| Show implementation before tests | Violates TDD principle |
| Include time estimates | Timeframes are unpredictable |
| Execute commands | Planning mode only |
| Assume language/framework | Always detect or ask |
| Modify files outside impl-plan | Scope limitation |

### MUST

| Requirement | Rationale |
|-------------|-----------|
| Show failing test first | TDD discipline |
| Include happy path AND error tests | Complete coverage |
| Keep phases independently verifiable | Incremental progress |
| Use project's existing conventions | Consistency |
| Adapt examples to detected language | Relevance |
| Document all public interfaces | Clear API surface |
| Reference input requirements | Traceability |

## TDD Pattern for Each Feature

```
┌────────────────────────────────────────────────────────┐
│                    TDD Cycle                           │
│                                                        │
│    RED            GREEN          REFACTOR              │
│    Write a         Write minimal   Improve code        │
│    failing test    code to pass    without changing    │
│                                    behavior            │
│                                                        │
│         ───────────────────────────────────►           │
│                     Repeat                             │
└────────────────────────────────────────────────────────┘
```

### Language-Specific Test Commands

| Language | Test Command | Watch Mode |
|----------|--------------|------------|
| TypeScript/Node | `npm test` | `npm test -- --watch` |
| Python | `pytest` | `pytest-watch` or `ptw` |
| Go | `go test ./...` | `go test ./... -v` |
| Rust | `cargo test` | `cargo watch -x test` |
| Java (Maven) | `mvn test` | `mvn test -Dtest=...` |
| Java (Gradle) | `./gradlew test` | `./gradlew test --continuous` |
| Kotlin (Gradle) | `./gradlew test` | `./gradlew test --continuous` |
| Ruby | `rspec` | `guard` |

### Java Build Tool Commands

#### Gradle Commands

| Task | Command | Description |
|------|---------|-------------|
| Run all tests | `./gradlew test` | Execute all unit tests |
| Run specific test | `./gradlew test --tests "ClassName"` | Run single test class |
| Run with filter | `./gradlew test --tests "*Test"` | Run matching tests |
| Continuous testing | `./gradlew test --continuous` | Watch mode |
| Build project | `./gradlew build` | Compile and test |
| Clean build | `./gradlew clean build` | Fresh build |
| Run application | `./gradlew run` | Execute main class |
| Check (lint + test) | `./gradlew check` | Run all checks |
| Generate JAR | `./gradlew jar` | Create JAR file |
| List tasks | `./gradlew tasks` | Show available tasks |

#### Maven Commands

| Task | Command | Description |
|------|---------|-------------|
| Run all tests | `mvn test` | Execute all unit tests |
| Run specific test | `mvn test -Dtest=ClassName` | Run single test class |
| Skip tests | `mvn install -DskipTests` | Build without testing |
| Build project | `mvn package` | Compile and package |
| Clean build | `mvn clean package` | Fresh build |
| Run application | `mvn exec:java` | Execute main class |
| Verify | `mvn verify` | Run integration tests |

### Commit Pattern (Reference Only)

```
RED:      test: add [feature] test
GREEN:    feat: implement [feature]
REFACTOR: refactor: clean up [feature]
```

## Reference

- [templates/phase-00-setup.md](templates/phase-00-setup.md) - Language-specific project setup commands
