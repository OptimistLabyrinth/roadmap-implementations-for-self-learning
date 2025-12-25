---
name: code-review
description: Perform comprehensive code reviews following language-specific best practices. Use when user asks for code review, PR review, merge request review, code quality check, or mentions reviewing code changes. Evaluates functionality, readability, security, performance, testing, and architecture with actionable feedback.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch
---

# Code Review

## Purpose

Perform thorough, constructive code reviews following best practices for each language, framework, and environment. Provide balanced feedback that considers real-world trade-offs rather than demanding theoretical perfection.

## Core Philosophy

1. **Pragmatic over Perfect** - Consider overall situations; trade-offs are acceptable
2. **Constructive Feedback** - Offer specific, actionable suggestions
3. **Context-Aware** - Understand the codebase before judging
4. **Balanced Perspective** - Acknowledge what works well, not just what needs fixing
5. **Mentorship Mindset** - Reviews are learning opportunities for both parties

## Review Process

### Step 1: Understand Context

Before reviewing, gather context:
1. What is the purpose of these changes?
2. What problem is being solved?
3. What are the project's existing patterns and conventions?
4. What constraints exist (time, resources, legacy code)?

```markdown
## Context Questions
- What feature/bug does this address?
- Are there related changes elsewhere?
- What testing has been done?
- Any known limitations or tech debt?
```

### Step 2: Review Checklist

#### Functionality
- [ ] Code achieves its intended purpose
- [ ] Requirements are met
- [ ] Edge cases are handled appropriately
- [ ] Error scenarios are considered
- [ ] Integration with existing code is seamless

#### Readability & Maintainability
- [ ] Code is self-documenting with clear naming
- [ ] Complex logic is broken into smaller functions
- [ ] No unnecessary complexity or over-engineering
- [ ] Consistent with codebase patterns
- [ ] Comments explain "why" not "what" (when needed)

#### Security
- [ ] User inputs are validated and sanitized
- [ ] No hardcoded credentials or secrets
- [ ] Authentication/authorization properly implemented
- [ ] No SQL injection, XSS, or OWASP top 10 vulnerabilities
- [ ] Sensitive data handled securely

#### Performance
- [ ] No obvious performance bottlenecks
- [ ] Resource allocations managed (no leaks)
- [ ] Efficient algorithms for the use case
- [ ] Database queries are optimized (N+1, missing indexes)
- [ ] Appropriate use of caching when beneficial

#### Testing
- [ ] Unit tests cover new functionality
- [ ] Edge cases are tested
- [ ] Tests are readable and maintainable
- [ ] No flaky tests introduced
- [ ] Integration tests where appropriate

#### Architecture
- [ ] Changes fit the existing architecture
- [ ] No unintended coupling introduced
- [ ] Dependencies are appropriate
- [ ] SOLID principles followed where applicable
- [ ] Scalability considerations addressed

### Step 3: Provide Feedback

#### Feedback Format

Use severity levels:

| Level | Emoji | Meaning | Action |
|-------|-------|---------|--------|
| Critical | 🔴 | Must fix before merge | Blocks approval |
| Suggestion | 🟡 | Recommended improvement | Discuss if unclear |
| Nitpick | 🟢 | Minor style/preference | Optional |
| Praise | 👍 | Good practice | Acknowledge |
| Question | ❓ | Need clarification | Explain reasoning |

#### Example Feedback

```markdown
## Code Review: [Feature/PR Name]

### Summary
[Brief overview of changes and overall assessment]

### Critical Issues 🔴
1. **Security: SQL Injection Risk** (file.ts:42)
   - Issue: User input directly concatenated in query
   - Suggestion: Use parameterized queries
   - Example:
     ```typescript
     // Before
     query(`SELECT * FROM users WHERE id = ${userId}`)
     // After
     query('SELECT * FROM users WHERE id = $1', [userId])
     ```

### Suggestions 🟡
1. **Performance: N+1 Query** (service.ts:78)
   - Issue: Querying in a loop
   - Consider: Batch query or eager loading
   - Trade-off: Acceptable if data volume is always small

### Nitpicks 🟢
1. **Style: Variable naming** (utils.ts:15)
   - `d` could be more descriptive like `daysDifference`
   - Note: Optional, current name is clear in context

### Praise 👍
- Excellent error handling pattern
- Good test coverage for edge cases
- Clean separation of concerns
```

## Language-Specific Guidelines

### JavaScript/TypeScript
- Prefer `const` over `let`, avoid `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Avoid `any` type in TypeScript (use `unknown` if needed)
- Check for memory leaks in event listeners/subscriptions
- Verify proper async/await error handling

### Python
- Follow PEP 8 style guidelines
- Use type hints for function signatures
- Prefer list comprehensions over loops when readable
- Check for proper exception handling (avoid bare `except`)
- Verify context managers for resource handling (`with`)

### Java
- Check for null safety and Optional usage
- Verify proper exception handling hierarchy
- Review for thread safety in concurrent code
- Check resource cleanup (try-with-resources)
- Validate equals/hashCode contract

### Kotlin
- Leverage null safety (avoid `!!` when possible)
- Use data classes for DTOs
- Check for proper coroutine scope management
- Prefer immutable collections
- Review extension function placement

### Go
- Check for proper error handling (don't ignore errors)
- Verify goroutine/channel management
- Review for race conditions
- Check for proper resource cleanup (defer)
- Validate interface implementations

### SQL
- Check for SQL injection vulnerabilities
- Review query performance (indexes, JOINs)
- Validate proper transaction handling
- Check for N+1 query patterns
- Review for proper constraint usage

## Trade-off Considerations

Not every "best practice" applies in every situation. Consider:

### When Perfection Isn't Required
- Prototype/proof-of-concept code
- One-time scripts/migrations
- Time-critical hotfixes (with follow-up ticket)
- Low-traffic internal tools

### Document Trade-offs
```markdown
## Trade-off Accepted
- **Issue**: Using simple linear search instead of binary search
- **Reason**: Dataset is always < 50 items; O(n) is negligible
- **Impact**: None measurable
- **Revisit if**: Data volume increases significantly
```

### Acknowledge Tech Debt
```markdown
## Tech Debt Noted
- **Issue**: Duplicate validation logic
- **Reason**: Refactoring would delay critical deadline
- **Ticket**: Created JIRA-1234 for cleanup
```

## Anti-Patterns to Avoid (As Reviewer)

1. **Nitpicking to Death** - Don't block PRs over trivial style issues
2. **Demanding Perfection** - Real-world constraints matter
3. **Being Vague** - "This is wrong" without explanation
4. **Ignoring Context** - Not understanding why decisions were made
5. **Personal Preference as Rule** - "I would do it differently" ≠ "This is wrong"
6. **Delayed Reviews** - Stale PRs are expensive
7. **Drive-by Comments** - Comment without following up

## Review Output Template

```markdown
# Code Review: [Title]

**Reviewer:** [Name/AI]
**Date:** [Date]
**Files Reviewed:** [Count]
**Overall Assessment:** [Approve/Request Changes/Comment]

## Summary
[2-3 sentence overview]

## Critical Issues (Must Fix) 🔴
[List or "None"]

## Suggestions (Recommended) 🟡
[List or "None"]

## Nitpicks (Optional) 🟢
[List or "None"]

## What's Working Well 👍
[List positives - always include at least one]

## Questions ❓
[Any clarifications needed]

## Trade-offs Acknowledged
[Document any accepted compromises]
```

## Best Practices Summary

1. **Review code, not the author** - Focus on the work, not the person
2. **Ask questions** - "Why this approach?" opens dialogue
3. **Suggest, don't dictate** - "Consider..." vs "You must..."
4. **Keep PRs small** - Easier to review thoroughly
5. **Be timely** - Review within 24 hours when possible
6. **Follow up** - Ensure feedback is understood
7. **Learn together** - Both parties gain from good reviews
