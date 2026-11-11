---
name: task-harness
description: "Use when preparing a task for handoff, delegation, repeated execution, or automation and another executor needs explicit context, scope, outputs, and acceptance criteria."
---

# Task Harness

Produce a task contract another person or agent can execute and verify without reconstructing the conversation. Use it for handoffs and repeatable work; ordinary direct execution needs no separate contract unless requested.

## Workflow

1. Extract the intended outcome, prerequisites, accepted constraints, and allowed side effects from the request and repository evidence.
2. Define deliverables and checks that distinguish success from merely producing output. Include commands only when confirmed for the target environment.
3. Separate assumptions from accepted decisions. Clarify missing information when it changes scope, material risk, or authorization; label reasonable reversible assumptions.
4. Reuse an existing plan or acceptance list when sufficient. Add owners, checkpoints, rollback, or escalation conditions only when they change how execution proceeds.
5. If execution is also requested, carry it out within the authorized scope and distinguish actual verification from planned checks.

## Contract

Return one copyable contract that also serves as the agent prompt:

```md
# Task: <observable outcome>
- Context / inputs: <facts, source paths, prerequisites>
- Scope / constraints: <allowed reads, writes, side effects, and requirements>
- Assumptions: <unconfirmed premises that affect execution, if any>

## Execution
1. <action with an observable result>

## Deliverables and acceptance
- <artifact or state change; check, expected result, and evidence to return>

## Escalation
- <condition that requires clarification, approval, or stopping, if applicable>
```

For a small handoff, collapse to goal, scope, output, and acceptance. Omit inapplicable fields rather than adding empty sections or repeating the contract as another prompt and checklist.

## Completion check

- The executor has sufficient context, prerequisites, and an actionable scope.
- Acceptance criteria test the intended outcome, and authorization limits remain explicit.
- No assumption or unperformed check is presented as an accepted decision or completed verification.
