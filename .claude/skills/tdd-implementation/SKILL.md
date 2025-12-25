---
name: tdd-implementation
description: Implement features following strict TDD cycle (Red-Green-Refactor). Use when user wants to implement code, write a feature, fix a bug with tests, or mentions TDD, test-driven, or "write tests first". Ensures step-by-step implementation with test verification at each step.
---

# TDD Implementation

## Purpose

Implement features following strict Test-Driven Development methodology. Every piece of code is written only after a failing test exists for it.

## Core TDD Cycle

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│    ┌───────┐         ┌───────┐         ┌──────────┐    │
│    │  RED  │ ──────► │ GREEN │ ──────► │ REFACTOR │    │
│    └───────┘         └───────┘         └──────────┘    │
│        │                                     │         │
│        └─────────────────────────────────────┘         │
│                                                        │
└────────────────────────────────────────────────────────┘

RED:      Write a failing test
GREEN:    Write minimal code to pass
REFACTOR: Improve code, keep tests green
```

## Process

### Step 1: Understand the Requirement

Before writing any code:
1. Clarify what needs to be built
2. Break down into small, testable units
3. Identify edge cases
4. Ask clarifying questions if anything is vague

### Step 2: Plan Test Cases

Create a test list before implementation:

```markdown
## Test Cases for [Feature]

### Happy Path
- [ ] Test: [Description of expected behavior]
- [ ] Test: [Another expected behavior]

### Edge Cases
- [ ] Test: [Edge case 1]
- [ ] Test: [Edge case 2]

### Error Cases
- [ ] Test: [Error condition 1]
- [ ] Test: [Error condition 2]
```

### Step 3: RED Phase

1. Write ONE test that describes expected behavior
2. Run the test - it MUST fail
3. Verify it fails for the RIGHT reason (not syntax error, missing import, etc.)

```
Example:
// Test file
describe('calculateTotal', () => {
  it('should sum all items in cart', () => {
    const cart = [{ price: 10 }, { price: 20 }];
    expect(calculateTotal(cart)).toBe(30);
  });
});

// Run test → FAIL: calculateTotal is not defined
// This is the correct failure - function doesn't exist yet
```

### Step 4: GREEN Phase

1. Write the MINIMAL code to make the test pass
2. No optimization, no extra features
3. Hard-coding is acceptable if it passes the test
4. Run the test - it MUST pass now

```
Example:
// Production code - minimal implementation
function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

// Run test → PASS
```

### Step 5: REFACTOR Phase

1. Improve code quality while keeping tests green
2. Look for:
   - Code duplication
   - Poor naming
   - Complex conditionals
   - Long functions
   - Missing abstractions
3. Run ALL tests after each refactoring - they MUST still pass

```
Example:
// Refactored with better naming and type safety
function calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => total + item.price, 0);
}

// Run ALL tests → PASS (no regression)
```

### Step 6: Verify and Proceed

After each TDD cycle:

1. **Run ALL tests** - not just the new one
2. **If ANY test fails**:
   - STOP immediately
   - Fix the failing test(s)
   - Do NOT proceed to next feature
3. **If all tests pass**:
   - Commit the changes (if appropriate)
   - Move to next test case

### Step 7: Handle Missing Requirements

During implementation, if you discover:
- Unclear requirements
- Missing edge cases
- Conflicting requirements
- Technical constraints not considered

**STOP and ask the user for clarification**, suggesting recommended options:

```
Example:
"I found an undefined behavior: What should happen when the cart is empty?
Options:
(a) Return 0 [Recommended]
(b) Throw an error
(c) Return null"
```

## Implementation Checklist

For each task/feature, follow this checklist:

```markdown
## Implementation: [Feature Name]

### Pre-Implementation
- [ ] Requirements understood
- [ ] Test cases listed
- [ ] Edge cases identified

### TDD Cycle 1: [First test case]
- [ ] RED: Test written and failing
- [ ] GREEN: Minimal code passes test
- [ ] REFACTOR: Code improved, tests still pass

### TDD Cycle 2: [Second test case]
- [ ] RED: Test written and failing
- [ ] GREEN: Minimal code passes test
- [ ] REFACTOR: Code improved, tests still pass

### [Continue for all test cases...]

### Post-Implementation
- [ ] All tests pass
- [ ] Code reviewed for quality
- [ ] No TODO comments left
- [ ] Documentation updated if needed
```

## Test Quality Guidelines

### Good Tests
- Test ONE behavior per test
- Have descriptive names
- Follow Arrange-Act-Assert pattern
- Are independent (can run in any order)
- Are fast (unit tests < 100ms)
- Are deterministic (no flaky tests)

### Test Naming Convention
```
// Pattern: should[ExpectedBehavior]When[Condition]

it('should return zero when cart is empty', ...)
it('should throw error when item has negative price', ...)
it('should apply discount when coupon is valid', ...)
```

### Test Structure (AAA Pattern)
```javascript
it('should calculate total with tax', () => {
  // Arrange
  const cart = [{ price: 100 }];
  const taxRate = 0.1;

  // Act
  const result = calculateTotalWithTax(cart, taxRate);

  // Assert
  expect(result).toBe(110);
});
```

## Error Handling in TDD

When tests fail unexpectedly:

1. **Read the error message carefully**
2. **Identify if it's a test issue or production code issue**
3. **Fix ONE thing at a time**
4. **Re-run tests after each fix**
5. **Don't move forward until all tests pass**

## Commands Reference

Common test commands by framework:

| Framework | Run All | Run Single | Watch Mode |
|-----------|---------|------------|------------|
| Jest | `npm test` | `npm test -- -t "test name"` | `npm test -- --watch` |
| Vitest | `npx vitest run` | `npx vitest run -t "test name"` | `npx vitest` |
| pytest | `pytest` | `pytest -k "test_name"` | `pytest-watch` |
| Go | `go test ./...` | `go test -run TestName` | - |
| JUnit (Maven) | `mvn test` | `mvn test -Dtest=TestClass#testMethod` | - |
| JUnit (Gradle) | `./gradlew test` | `./gradlew test --tests "TestClass.testMethod"` | `./gradlew test --continuous` |
| Kotest (Gradle) | `./gradlew test` | `./gradlew test --tests "TestClass"` | `./gradlew test --continuous` |

### Gradle Test Commands (Java/Kotlin)

| Command | Description |
|---------|-------------|
| `./gradlew test` | Run all tests |
| `./gradlew test --tests "com.example.MyTest"` | Run specific test class |
| `./gradlew test --tests "com.example.MyTest.myMethod"` | Run specific test method |
| `./gradlew test --tests "*Test"` | Run tests matching pattern |
| `./gradlew test --continuous` | Watch mode - re-run on file changes |
| `./gradlew test --info` | Verbose output |
| `./gradlew test --rerun-tasks` | Force re-run (ignore cache) |
| `./gradlew cleanTest test` | Clean and run tests |
| `./gradlew test -x integrationTest` | Exclude specific task |

### Maven Test Commands (Java)

| Command | Description |
|---------|-------------|
| `mvn test` | Run all tests |
| `mvn test -Dtest=MyTest` | Run specific test class |
| `mvn test -Dtest=MyTest#myMethod` | Run specific test method |
| `mvn test -Dtest=*Test` | Run tests matching pattern |
| `mvn test -pl module-name` | Run tests in specific module |
| `mvn test -DskipTests=false` | Force run tests |
| `mvn clean test` | Clean and run tests |

## Best Practices

1. **Never skip the RED phase** - If test passes immediately, something is wrong
2. **One test at a time** - Don't write multiple tests before implementing
3. **Smallest step possible** - Each cycle should be 5-15 minutes max
4. **Commit after each GREEN** - Small, atomic commits
5. **Refactor fearlessly** - Tests are your safety net
6. **Delete dead code** - If tests pass without it, remove it
