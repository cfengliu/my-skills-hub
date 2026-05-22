---
name: engineering-first-principles
description: "Use when designing, implementing, reviewing, refactoring, launching, or debugging a software system or feature and you need to coordinate the engineering-first skill suite. Acts as the orchestrator/router for Problem First, Boundary First, Simplicity First, Change First, Verification First, Failure First, and Security First without replacing those atomic skills."
---

# Engineering First Principles

This is the orchestrator for the engineering-first skill suite.

Use it to decide which atomic engineering skills to apply, in what order, and what combined output to produce. Do not copy every detail from the atomic skills here; route to them when the task needs depth.

## Purpose

Turn an engineering task into a clear, simple, change-tolerant, verifiable, recoverable, and defensible plan.

This skill is useful when the task crosses more than one engineering concern:

- new feature or system design
- architecture review
- implementation planning
- refactor planning
- launch readiness review
- production incident follow-up
- security-sensitive or data-sensitive feature
- external API, payment, auth, AI, file, quota, or background-job flow

## Suite architecture

```txt
task-harness
  -> engineering-first-principles
      -> problem-first
      -> boundary-first
      -> simplicity-first
      -> change-first
      -> verification-first
      -> failure-first
      -> security-first
```

Use `task-harness` before this skill when the user request is vague, delegated to another agent, or needs a repeatable acceptance harness.

Use this skill when the task needs system-level engineering judgment.

Use the atomic skills when the task needs deeper treatment of one concern.

## Atomic skills

| Skill | Use for | Main risk controlled |
|---|---|---|
| `problem-first` | unclear users, goals, success criteria, constraints, MVP | building the wrong thing |
| `boundary-first` | modules, APIs, ownership, state, permissions, external services | tangled responsibilities |
| `simplicity-first` | architecture choice, framework choice, scope control | overengineering |
| `change-first` | likely provider/schema/pricing/prompt/workflow/API changes | scattered future change |
| `verification-first` | tests, type checks, CI, examples, contract checks | unproven correctness |
| `failure-first` | timeouts, retries, idempotency, fallback, observability, recovery | uncontrolled production failure |
| `security-first` | users, data, permissions, files, secrets, external input, abuse | unauthorized access or data/cost leakage |

## Routing matrix

Choose the lightest path that covers the risk.

| Task shape | Recommended path |
|---|---|
| Vague product or feature idea | `problem-first` |
| New normal feature | `problem-first` -> `boundary-first` -> `simplicity-first` -> `verification-first` |
| New high-risk feature | full suite in default order |
| Refactor | `boundary-first` -> `simplicity-first` -> `change-first` -> `verification-first` |
| External API integration | `boundary-first` -> `failure-first` -> `security-first` -> `verification-first` |
| Auth, permissions, data, payment, files, or secrets | `security-first` -> `boundary-first` -> `failure-first` -> `verification-first` |
| Background job or async workflow | `failure-first` -> `boundary-first` -> `verification-first` |
| Bug fix | `verification-first` -> `failure-first` if production behavior is involved |
| Launch review | `verification-first` -> `failure-first` -> `security-first` |
| AI agent task or delegated work | `task-harness` -> relevant engineering skills |

If the user explicitly asks for one atomic skill, use that skill directly. Do not force the full suite.

## Default order

For broad design, implementation planning, or launch review, run the suite in this order:

1. **Problem First** — define the actual problem, users, success criteria, non-goals, constraints, and MVP.
2. **Boundary First** — define modules, ownership, API contracts, state transitions, permission boundaries, and external-service boundaries.
3. **Simplicity First** — choose the smallest boring solution; list what will not be built.
4. **Change First** — isolate likely-and-painful change points; avoid fantasy abstractions.
5. **Verification First** — convert requirements, boundaries, permissions, and failure cases into tests/checks.
6. **Failure First** — define timeout, retry, idempotency, fallback, observability, and recovery.
7. **Security First** — protect assets, trust boundaries, authorization, inputs, secrets, quotas/costs, auditability, and security tests.

## Visible routing behavior

When this skill is used, provide a brief visible routing note before planning or execution, unless the user explicitly asks for a one-line answer or explicitly says to skip routing output.

The routing note should usually be 1-3 lines and mention:

- task shape
- selected concerns or skills
- why those concerns matter

Example:

```md
Engineering route: this looks like external API + storage + runtime risk, so I’m applying boundary / failure / security / verification before implementation.
```

Do not dump a full checklist by default. Use the full route packet only when the task needs visible decision tracking:

- planning mode is active
- the user asks for explicit reasoning
- the task is high-risk
- multiple skills are selected and the tradeoffs matter
- decisions or skipped skills need to be auditable

When the full route packet is needed, use these fields:

```md
# Engineering Route

- task_shape:
- selected_skills:
- skipped_skills_and_why:
- risk_flags:
- decisions_needed:
- verification_strategy:
- next_action:
```

Using this skill only as invisible internal reasoning for non-trivial engineering work counts as non-compliance. The visible note may be short, but it must tell the user what engineering lens is being applied and why.

## Atomic skill loading rule

When an atomic skill is selected for depth, open/read that atomic skill's `SKILL.md` before producing its section.

If the skill is selected only for routing guidance and was not opened/read, mark it as `selected conceptually, not expanded`. If it was opened/read, mark it as `expanded from SKILL.md`.

Do not pretend an atomic skill was applied in depth when only this orchestrator was used.

## Question gate

Before asking the user any question, classify each question as one of:

- `boundary-changing` — the answer changes ownership, API shape, data model, state flow, permissions, or external-service boundary.
- `risk-changing` — the answer changes security, failure, verification, rollout, cost, compliance, or production-risk treatment.
- `implementation-detail-only` — the answer only changes local naming, minor UI copy, internal ordering, or another detail that can be decided during execution.

Ask only `boundary-changing` or `risk-changing` questions upfront. Defer `implementation-detail-only` questions until execution, or choose the simplest boring default and record it in `decisions_needed` or `next_action`.

## Planning-mode behavior

In planning mode, produce the full Engineering Route packet first, then ask only questions that materially change the plan. Do not ask broad implementation questions before exposing the route.

## Required output

Scale the output to the task. Every non-trivial output must include either a brief routing note or a full packet. Full packets must include `next_action`; otherwise the route is only a ritual document.

For small tasks, produce the brief routing note:

```md
Engineering route: <task shape>; applying <selected concerns/skills> because <risk or decision reason>.
```

For meaningful features, planning-mode work, or high-risk work, produce the full route packet before the design sections:

```md
# Engineering Design: <feature/system>

## Route
- task_shape:
- selected_skills:
- skipped_skills_and_why:
- risk_flags:
- decisions_needed:
- verification_strategy:
- next_action:

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
- Boring technology choices:

## 4. Change
- Likely change points:
- Isolated now:
- Not abstracted yet:
- Replacement or migration strategy:

## 5. Verification
- Requirements to tests:
- Happy-path tests:
- Error-path tests:
- Permission/security tests:
- Boundary/edge cases:
- CI checks:
- Regression tests:

## 6. Failure
- Failure modes:
- Timeout policy:
- Retry policy:
- Idempotency:
- Fallback/degradation:
- Observability:
- Recovery/compensation:

## 7. Security
- Assets:
- Trust boundaries:
- Authentication and authorization:
- Input validation:
- Secret management:
- Rate limit / quota / cost controls:
- Audit log:
- Security tests:

## Implementation checklist
- [ ] Build the core happy path first.
- [ ] Keep module/data/state ownership explicit.
- [ ] Add only the abstractions justified by current risk.
- [ ] Add tests/checks from the Verification section.
- [ ] Add failure handling before expanding scope.
- [ ] Add security controls before launch.
```

## Process

1. Classify the task shape.
2. Select the smallest skill route that covers the actual risks.
3. Produce or maintain a visible routing note; use the full route packet when the task needs decision tracking.
4. Apply the question gate before asking the user anything.
5. If one section needs depth, open/read the relevant atomic skill's `SKILL.md`, mark it as `expanded from SKILL.md`, and use its required output.
6. If an atomic skill is only used for routing, mark it as `selected conceptually, not expanded`.
7. Produce the required output for the task size.
8. Before finishing, run the launch checklist if the work affects production users, data, money, permissions, availability, or external systems.

## Composition rules

- Do not duplicate long atomic-skill guidance here.
- Do not run the full suite for tiny changes unless risk justifies it.
- Do not skip `problem-first` when the user goal or success criteria are unclear.
- Do not skip `security-first` when the task touches users, permissions, secrets, payments, files, external input, logs, or cost.
- Do not skip `failure-first` when the task touches production flows, async work, external APIs, retries, jobs, payments, or background processing.
- Do not skip `verification-first` when implementing, reviewing, or fixing software.
- Prefer boring, observable, testable designs over clever abstractions.

## Launch checklist

| Method | Confirm before shipping |
|---|---|
| Problem | Success criteria are met and non-goals did not creep in. |
| Boundary | Module responsibility, data owner, API contract, and state owner are clear. |
| Simplicity | No unnecessary abstraction/service/framework/config remains. |
| Change | Main likely change points are isolated without fantasy abstractions. |
| Verification | Core happy path, error path, permissions, boundaries, and edge cases are tested. |
| Failure | Timeout, retry, idempotency, logs, fallback, and recovery are designed. |
| Security | Authz, data ownership, secrets, input validation, rate limits, audit logs, and security tests are covered. |

## Final check

Before returning, answer:

1. Did this task need the full suite, or only selected atomic skills?
2. Are selected and skipped skills explicit?
3. Is the output directly usable for design, implementation, review, or launch?
4. Is there concrete verification evidence or a plan to create it?
5. Are production, security, and failure risks handled when relevant?
