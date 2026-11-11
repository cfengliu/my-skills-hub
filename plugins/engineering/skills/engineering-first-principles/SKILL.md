---
name: engineering-first-principles
description: "Use when software design, implementation, debugging, refactoring, or launch work spans multiple engineering concerns and needs coordinated problem, boundary, simplicity, change, verification, failure, or security judgment."
---

# Engineering First Principles

Select the smallest set of engineering concerns that covers the task's risks. Use the atomic skills for depth; this entrypoint coordinates them without repeating their checklists.

## Routing

| Concern | Read when needed | Decision to resolve |
|---|---|---|
| Problem | `../problem-first/SKILL.md` | Who needs what outcome, success criteria, constraints, and MVP? |
| Boundary | `../boundary-first/SKILL.md` | Who owns modules, data, APIs, permissions, and state transitions? |
| Simplicity | `../simplicity-first/SKILL.md` | What is the smallest sufficient solution and what can wait? |
| Change | `../change-first/SKILL.md` | Which likely, painful changes justify isolation or migration now? |
| Verification | `../verification-first/SKILL.md` | Which checks prove the intended behavior and catch regressions? |
| Failure | `../failure-first/SKILL.md` | How do failures remain bounded, observable, and recoverable? |
| Security | `../security-first/SKILL.md` | How are authorization, inputs, secrets, user data, and costs protected? |

Typical routes:

- Unclear goal: problem, then the concerns exposed by the clarified scope.
- Normal feature: problem, boundary, simplicity, verification.
- Refactor: boundary, simplicity, change, verification.
- External API: boundary, failure, security, verification.
- Auth, payments, files, or sensitive data: security, boundary, failure, verification.
- Async work: failure, boundary, verification.
- Bug fix: verification; include failure for production behavior.
- Launch: verification, failure, security.

An explicitly requested atomic skill can be used directly. A handoff or repeatable task may benefit from a task harness, but this plugin does not require a separately installed skill.

## Workflow

1. Identify the goal, known constraints, and observable success criteria. Clarify the problem before choosing architecture when these are missing.
2. Select relevant concerns. For non-trivial work, briefly state the chosen route and why it matters.
3. Before accepting a design, pressure-test its assumptions, ownership, expensive-to-reverse decisions, and simpler alternatives. Show only findings that change a decision or expose a material risk.
4. Read an atomic skill before claiming to apply its detailed procedure. Distinguish a conceptual concern from a skill actually read.
5. Ask upfront only when an answer changes boundaries, accepted behavior, material risk, or authorization. Choose reasonable reversible implementation details during execution.
6. Produce the design, implementation, or review requested by the user. Reuse the existing plan rather than creating a separate report for each concern.
7. Verify against success criteria. For production changes, check error handling, recovery, authorization, data ownership, and rollout risks before claiming readiness.

## Output

For small work, report the result and relevant verification. For non-trivial work, use a short route note followed by the requested deliverable. When decisions need a reviewable record, use:

```md
## Engineering decisions
- Goal and success criteria:
- Selected concerns and why:
- Material assumptions or structural findings:
- Design decisions and alternatives deferred:
- Verification performed or planned:
- Remaining risks and next action:
```

Add only sections relevant to the task. Expand a concern using its atomic skill's output when the decision needs that detail.

## Completion check

- The route covers actual risks without forcing the full suite.
- Module, data, and state ownership are explicit where changed.
- Likely change points are isolated only when justified.
- Implementation and fixes have concrete verification evidence; planned checks are labeled as planned.
- Relevant production failures, retries, idempotency, recovery, permissions, secrets, external inputs, and cost controls are addressed.
- Applied skills and unresolved assumptions are represented accurately.
