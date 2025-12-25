---
name: requirements-clarification
description: Clarify project requirements by creating PRD, Spec, or User Stories. Use when user mentions requirements, PRD, specification, user story, feature request, new project, or needs help defining what to build. Asks comprehensive clarifying questions about company context, project scope, users, and technical constraints.
allowed-tools: Read, Grep, Glob, WebSearch, WebFetch, AskUserQuestion
---

# Requirements Clarification

## Purpose

Help users define clear, complete requirements by asking comprehensive clarifying questions and producing structured documentation (PRD, Spec, or User Story).

## Process

### Step 1: Determine Output Format

Ask the user which format they need:
- **PRD (Product Requirements Document)**: For product managers, stakeholders, comprehensive feature definition
- **Technical Specification**: For developers, detailed technical requirements and architecture
- **User Story**: For agile teams, focused on user value and acceptance criteria

### Step 2: Gather Context Through Questions

Ask clarifying questions in these categories. Always suggest recommended options when applicable.

#### Business Context
- What is your company size? (Startup/SMB/Enterprise)
- What industry are you in?
- What is the business goal this project serves?
- What problem are you solving?
- What happens if this problem isn't solved?

#### Project Scope
- Is this a new project or enhancement to existing system?
- What is the project scale? (Small feature/Medium feature/Large system)
- Are there existing systems this needs to integrate with?
- What is the expected timeline or urgency?
- What is the budget or resource constraint?

#### Target Users
- Who are the primary users?
- What is the expected user base size?
- What is the user's technical proficiency?
- Are there different user roles/personas?
- What are the user's main pain points?

#### Functional Requirements
- What are the must-have features?
- What are the nice-to-have features?
- What should the system explicitly NOT do?
- Are there specific workflows to support?
- What are the success criteria?

#### Non-Functional Requirements
- Performance requirements (response time, throughput)?
- Availability requirements (uptime, SLA)?
- Security requirements (authentication, authorization, compliance)?
- Scalability expectations (users, data volume)?
- Accessibility requirements (WCAG level)?

#### Technical Constraints
- Are there mandated technologies or platforms?
- Are there legacy systems to consider?
- What are the deployment requirements?
- Are there regulatory or compliance requirements?

### Step 3: Identify Gaps

After gathering initial answers, identify and ask about:
- Ambiguous requirements that could be interpreted multiple ways
- Missing edge cases
- Conflicting requirements
- Unstated assumptions
- Dependencies not mentioned

### Step 4: Produce Documentation

Based on the chosen format, create:

#### PRD Template
```markdown
# Product Requirements Document

## Overview
- Product Name:
- Version:
- Date:
- Author:

## Problem Statement
[What problem are we solving?]

## Goals and Success Metrics
[How do we measure success?]

## User Personas
[Who are the users?]

## Requirements
### Must Have (P0)
### Should Have (P1)
### Nice to Have (P2)

## User Flows
[Key user journeys]

## Non-Functional Requirements
[Performance, security, etc.]

## Out of Scope
[What we're explicitly not doing]

## Open Questions
[Unresolved items]

## Timeline
[Phases and milestones]
```

#### Technical Spec Template
```markdown
# Technical Specification

## Overview
[Brief description]

## Architecture
[System design]

## API Design
[Endpoints, contracts]

## Data Model
[Database schema]

## Security Considerations
[Auth, permissions, threats]

## Performance Requirements
[SLAs, benchmarks]

## Dependencies
[External systems, libraries]

## Testing Strategy
[Test levels, coverage]

## Deployment Plan
[Rollout strategy]

## Monitoring
[Observability, alerts]
```

#### User Story Template
```markdown
# User Story

## Title
[Brief descriptive title]

## Story
As a [user type],
I want to [action],
So that [benefit].

## Acceptance Criteria
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

## Technical Notes
[Implementation hints]

## Dependencies
[Blockers, related stories]

## Story Points
[Estimate]
```

## Best Practices

1. **Ask one category at a time** - Don't overwhelm with all questions at once
2. **Suggest options** - For each question, provide 2-4 recommended options when possible
3. **Validate understanding** - Summarize and confirm before moving to next category
4. **Flag risks early** - If answers reveal potential issues, raise them immediately
5. **Be thorough but practical** - Adjust depth based on project complexity
