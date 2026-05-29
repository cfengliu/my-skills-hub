<!--
Example file for repo initialization.
Copy to the same path without .example in the filename.
Do not overwrite the repo-owned target file during upgrades.
-->
<!--
Repo-owned file after initialization.
Do not overwrite during template upgrades.
-->
# Epics

Epics are requirement ledgers for large workstreams.

Use an epic when a roadmap item needs child requirements, source tracking, PRD/TDD promotion status, evidence, or multi-session delivery history.

Empty sections and placeholders are `unknown`, not accepted requirement truth. Only accepted child requirements should be promoted into PRD or TDD.

Do not use epics as the priority source. Priority lives in `../roadmap.md`.

Do not use epics as final product or technical truth:

- product behavior and acceptance live in `../prd.md`
- technical design and boundaries live in `../tdd.md`
- operational constants live in `../ops.md`

## Epic File Naming

Use:

```text
E-001-<topic>.md
E-002-<topic>.md
```

Use child requirement IDs that match the parent epic prefix:

```text
E-001-001
E-001-002
```

## Epic File Template

```md
# E-001 <Topic>

## Status

proposed | accepted | in-progress | done | parked | cancelled

## Problem

What problem this workstream exists to solve.

## Desired Outcome

What must be true when this epic is successfully delivered.

## Non-Goals

-

## Current Decisions

-

## Requirements

### E-001-001 <Requirement Title>

- status: not-started | in-progress | partially-done | pending-acceptance | done | parked | cancelled
- type: accepted | needs-clarification | proof-of-concept | technical-research
- summary:
- source:
- PRD: not-promoted | promoted | not-needed
- TDD: not-promoted | promoted | not-needed
- evidence:
- next:

## Open Questions

-

## Closure

- PRD synced:
- TDD synced:
- verification evidence:
- roadmap updated:
```

## Epic Rules

- Roadmap decides whether an epic is Now, Next, Later, Done, or Parked.
- Epics track details; they do not set priority by themselves.
- Only accepted child requirements should be promoted into `../prd.md` or `../tdd.md`.
- Do not mark a child requirement `done` unless implementation and verification evidence both exist.
- If evidence is mixed, use `partially-done` instead of `done`.
