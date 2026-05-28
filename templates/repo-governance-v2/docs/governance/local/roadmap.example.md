<!--
Example file for repo initialization.
Copy to the same path without .example in the filename.
Do not overwrite the repo-owned target file during upgrades.
-->
<!--
Repo-owned file after initialization.
Do not overwrite during template upgrades.
-->
# Roadmap

This file is the priority dashboard for what to do next.

Roadmap decides sequencing. PRD owns product behavior and acceptance. TDD owns technical design. Epics own large workstream requirement details.

## Current Focus

-

## Now

| ID | Work | Status | Why Now | Next Step | Detail Ref |
|---|---|---|---|---|---|
| `R-001` | `<workstream>` | `in-progress` | `<reason>` | `<next action>` | `epics/E-001-<topic>.md` |

## Next

| ID | Work | Trigger | Detail Ref |
|---|---|---|---|
| `R-002` | `<workstream>` | `<when this becomes next>` | `epics/E-002-<topic>.md` |

## Later

| ID | Work | Why Later | Detail Ref |
|---|---|---|---|
| `R-003` | `<workstream>` | `<reason>` | `<epic path or none>` |

## Done Recently

| ID | Completed Work | Evidence |
|---|---|---|
| `R-000` | `<work>` | `<verification, release, or acceptance evidence>` |

## Cancelled Or Parked

| ID | Work | Reason |
|---|---|---|
| `R-000` | `<work>` | `<reason>` |

## Roadmap Rules

- Keep this file short enough to answer: what is Now, Next, Later, Done, and Parked?
- Do not duplicate PRD or TDD details here.
- Do not duplicate full epic child requirements here.
- If a roadmap item needs 5+ child requirements, multi-phase tracking, or evidence history, create an epic file under `epics/`.
- When roadmap sequencing changes, update this file.
- When accepted product behavior changes, update `prd.md`.
- When accepted technical design changes, update `tdd.md`.
- When a child requirement status, source, promotion, or evidence changes, update the relevant epic file.
