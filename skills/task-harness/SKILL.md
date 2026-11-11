---
name: task-harness
description: "Use when preparing a task for handoff, delegation, repeated execution, or automation and another executor needs explicit context, scope, outputs, and observable acceptance criteria."
---

# Task Harness

Create a runnable task contract so another human or agent can execute and verify the work without reconstructing the conversation.

Use this for handoffs and repeatable work. Ordinary direct execution does not need a separate harness unless the user requests one.

## Workflow

1. Extract the intended outcome, inputs, and accepted constraints from the request and repository evidence.
2. Name the read/write scope, required output, and checks that prove success.
3. Separate accepted decisions from assumptions. Ask only when a missing answer changes scope, risk, or authorization; label safe reversible assumptions.
4. Write the shortest contract that an executor can use. Reuse an existing plan or acceptance list rather than duplicating it.
5. For multi-stage or high-impact work, add owners, checkpoints, failure handling, rollback, and escalation conditions where they change execution.
6. If execution is also requested, carry out the task within the authorized scope and report actual checks separately from planned checks.

## Output

Return one copyable contract; it also serves as the agent prompt. Include commands only when confirmed for the target environment.

```md
# Task: <outcome>

- Goal: <observable result>
- Context and inputs: <facts, source paths, prerequisites>
- Scope: <allowed reads/writes and side-effect boundaries>
- Constraints: <accepted requirements and authorization limits>
- Assumptions: <labeled assumptions or none>

## Execution
1. <action with an observable result>

## Deliverables
- <artifact or state change>

## Acceptance
- <check, expected result, and evidence to return>

## Escalation
- <condition requiring clarification or approval, if applicable>
```

For small handoffs, collapse this to goal, scope, output, and acceptance. Add milestones or recovery only when needed; do not repeat the contract as another prompt and checklist.

## Completion check

- The executor has enough context and access to act.
- Scope and authorization limits are explicit.
- Acceptance criteria are observable and relevant to the goal.
- Assumptions are distinguishable from accepted decisions.
- Planned verification is not reported as completed.
