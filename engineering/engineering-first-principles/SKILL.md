---
name: engineering-first-principles
description: "Use when designing, implementing, reviewing, or refactoring a software system or feature and you need a complete senior-engineer methodology. Runs the seven methods in order: Problem First, Boundary First, Simplicity First, Change First, Verification First, Failure First, Security First. Useful for architecture docs, implementation plans, feature specs, code reviews, launch checks, and preventing wrong problem, complexity, overengineering, change risk, unverifiable behavior, operational failure, and security abuse."
---

# Engineering First Principles

Use this skill to turn a feature or system into a clear, simple, change-tolerant, verifiable, recoverable, and defensible design.

## Core model

A software system mainly carries seven risks:

| Risk | Method |
|---|---|
| Building the wrong thing | Problem First |
| Uncontrolled complexity | Boundary First |
| Overengineering | Simplicity First |
| Future requirement changes | Change First |
| Human mistakes | Verification First |
| Runtime/operational failures | Failure First |
| Malicious abuse | Security First |

Do not start from "how do I code this?" Start from:

> How do I solve the right problem as a clear, simple, changeable, verifiable, recoverable, and defensible system?

## Workflow

Run these in order. Keep answers short unless the project is high-risk.

1. **Problem First** — define the actual problem, user, success criteria, non-goals, constraints, and MVP.
2. **Boundary First** — cut module, data, API, state, permission, and external-service boundaries.
3. **Simplicity First** — choose the smallest boring solution that solves the known problem; list what not to build.
4. **Change First** — identify likely change points and isolate only the ones worth isolating now.
5. **Verification First** — convert success criteria, permissions, boundaries, and failure cases into tests/checks.
6. **Failure First** — define failure modes, timeout/retry/idempotency/fallback/observability/recovery.
7. **Security First** — define assets, trust boundaries, auth/authz, input validation, secret handling, rate limits, audit logs, and security tests.

## One-page design doc template

Use this as the default output before implementation:

```md
# Design: <feature/system>

## 1. Problem
- User:
- Scenario:
- Problem:
- Desired result:
- Success criteria:
- Non-goals:
- Constraints:
- MVP:

## 2. Boundary
- Modules and responsibilities:
- Data ownership:
- API contracts:
- State transitions:
- Permission boundaries:
- External service boundaries:

## 3. Simplicity
- Smallest viable architecture:
- Things intentionally not built:
- Abstractions intentionally delayed:
- Tech choices and why they are boring/reliable:

## 4. Change
- Likely change points:
- What is isolated now:
- What is not abstracted yet:
- Replacement/migration strategy:

## 5. Verification
- Happy-path tests:
- Error-path tests:
- Permission/security tests:
- Boundary/edge cases:
- CI checks:
- Regression tests needed:

## 6. Failure
- Failure modes:
- Timeout policy:
- Retry policy:
- Idempotency design:
- Fallback/degradation:
- Logs/metrics/traces/alerts:
- Recovery/compensation:

## 7. Security
- Assets to protect:
- Trust boundaries:
- Authentication and authorization rules:
- Input validation:
- Secret management:
- Rate limits/quota/cost controls:
- Audit log:
- Security test cases:
```

## Implementation sequence

1. Write the one-page design doc.
2. Build the core happy path first.
3. Add boundaries and error handling before adding extra features.
4. Add tests from the verification section.
5. Run the launch checklist.

## Launch checklist

| Method | Confirm before shipping |
|---|---|
| Problem | Success criteria are met and non-goals did not creep in. |
| Boundary | Module responsibility, data owner, API contract, and state owner are clear. |
| Simplicity | No unnecessary abstraction/service/framework/config remains. |
| Change | Main likely change points are isolated, without fantasy abstractions. |
| Verification | Core happy path, error path, permissions, and edge cases are tested. |
| Failure | Timeout, retry, idempotency, logs, and recovery are designed. |
| Security | Authz, data ownership, secrets, input validation, and rate limits are covered. |

## Final question set

Ask these seven groups for every meaningful feature:

1. **Problem** — What problem are we actually solving?
2. **Boundary** — Which module owns this, who owns the data, and who can change the state?
3. **Simplicity** — What is the simplest viable solution, and what are we over-designing?
4. **Change** — What will likely change, and is it isolated enough?
5. **Verification** — How do we prove this is correct?
6. **Failure** — How will this break, and how do we recover or observe it?
7. **Security** — How can this be abused, and are permissions/data/secrets/cost protected?
