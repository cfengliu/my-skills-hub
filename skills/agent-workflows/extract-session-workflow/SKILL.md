---
name: extract-session-workflow
description: "Use when a user asks to extract, distill, formalize, document, or productize a reusable workflow from a conversation session, chat transcript, Codex thread, agent run, debugging session, implementation session, review session, or handoff log."
---

# Extract Session Workflow

Turn a messy conversation session into a standalone workflow that another human or AI agent can run from the extracted artifact alone.

Extract the repeatable control flow, decisions, artifacts, checks, and failure handling from the conversation.

A workflow requires executable structure: trigger, inputs, steps, outputs, verification, and evidence.

## Use cases

- Convert a Codex thread into a reusable skill, SOP, runbook, prompt, or template.
- Extract the actual workflow from a successful debugging, implementation, review, research, or planning session.
- Turn a messy back-and-forth into a handoff-ready process.
- Compare what was planned against what actually worked.
- Identify which parts are reusable, project-specific, or require human judgment.

## Workflow unit

Every extracted workflow must include at least:

- trigger: when to run it
- inputs: what must be available before starting
- steps: ordered actions that change the outcome
- outputs: produced artifacts, state changes, or decisions
- verification: checks that prove it worked
- evidence: `Observed`, `Inferred`, `User requirement`, or `Unknown`

When evidence supports only topic clusters, label them as workflow candidates and list the fields needed to prove a reusable workflow.

## Output format

For small or unclear sessions, use compact output:

```md
# Workflow Extraction

## Workflow candidates

| Candidate | Why it may be a workflow | Fields needed |
|---|---|---|

## Extracted workflow

### When to use
### Inputs
### Steps
### Outputs
### Verification
### Evidence / open questions
```

For complex sessions with multiple proven workflows, use one short card per workflow:

```md
# Workflow Extraction

## Workflow map

| Workflow | Trigger | Output | Verification |
|---|---|---|---|

## Workflow: <name>

### Trigger
### Inputs
### Steps
### Outputs
### Verification
### Evidence / open questions
```

Add optional sections only when they change execution: `Decision points`, `Failure modes`, `Recovery`, `Reusable prompt`.

Keep each section short enough to act on. If a section has no evidence, write `Unknown` instead of inventing details.

## Extraction process

1. **Identify the job.**
   - State what reusable outcome the session produced.
   - Name who would run the workflow and who accepts the result.
   - Separate the workflow from one-off session context.

2. **Build a timeline.**
   - List the major turns, commands, files, tools, decisions, and blockers.
   - Collapse repeated attempts into one step only when the retry pattern matters.
   - Mark each item as `Observed`, `Inferred`, or `User requirement`.

3. **Extract the stable workflow.**
   - Keep steps that changed the outcome.
   - Keep false starts and local accidents only when they reveal a failure mode.
   - Preserve required order, gates, and handoff points.

4. **Separate reusable from local.**
   - Reusable: decision logic, artifact shape, verification criteria, prompts, review gates.
   - Local: repo paths, credentials, names, URLs, temporary logs, environment-specific commands.
   - Convert local details into placeholders when the workflow should travel.

5. **Make decisions explicit.**
   - For each branch, write the trigger, choice, and consequence.
   - If a decision depended on missing context, put it in `Open questions`.
   - Surface human approval gates, ownership, and rollback points as explicit steps.

6. **Define verification.**
   - Add checks that prove the workflow’s intended outcome, including artifact inspection or acceptance evidence when command success is insufficient.
   - Include artifact inspection, diff review, tests, acceptance criteria, and rollback checks when relevant.
   - Label skipped checks and why they were skipped.

7. **Package for reuse.**
   - Provide a ready-to-copy checklist or prompt.
   - Include placeholders for project-specific values.
   - Keep the final workflow independent from the original session transcript.

## Evidence rules

Use these labels:

| Label | Meaning |
|---|---|
| `Observed` | Directly visible in the session text, tool output, file diff, command, or user instruction. |
| `Inferred` | Reasonable conclusion derived from observed evidence. |
| `User requirement` | Explicit instruction, constraint, preference, or acceptance criterion from the user. |
| `Unknown` | Important detail absent from the session evidence. |

Keep evidence labels stable. Mark generic best-practice additions as recommendations instead of session evidence.

## Workflow quality bar

A good extracted workflow:

- has a clear trigger and stopping point
- names required inputs and produced artifacts
- preserves human approval and safety gates
- contains observable verification
- distinguishes reusable process from session-specific details
- can be executed by another agent from the extracted artifact alone
- says what is unknown instead of pretending the session proved it

## Extraction checklist

- Extract repeatable decisions, steps, artifacts, and checks.
- Expand each proven workflow into trigger, inputs, steps, outputs, verification, and evidence.
- Mark topic-level groupings as candidates until the session proves a repeatable sequence.
- Collapse noise into outcome-changing actions.
- Label inferred rules and keep local assumptions visible.
- Add checks that prove the workflow’s core invariant.
- Preserve approval gates, ownership, and rollback points.
- Replace project constants with placeholders when the output should travel.

## Completion check

- The workflow can be run from the extracted artifact alone.
- Every major step has a purpose.
- Every branch has a trigger.
- Every claim is labeled by evidence strength when it matters.
- Project-specific details are either placeholders or explicitly scoped.
- Verification proves the intended outcome with evidence beyond command success when needed.
- Open questions list anything that would change execution.
