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

Roadmap decides sequencing. PRD owns product behavior and acceptance. TDD owns technical design. Security owns security/privacy constraints. Epics own large workstream requirement details.

Empty sections and placeholders are `unknown`, not accepted priority truth. Add only sequencing decisions that have been accepted by the user or maintainer.

## Current Focus

-

## Now

| ID | Work | Why Now | Detail Ref |
|---|---|---|---|
| `E-001A` | `<delivery slice or requirement>` | `<reason>` | `epics/E-001-<topic>.md` |

## Next

| ID | Work | Trigger | Detail Ref |
|---|---|---|---|
| `E-001B` | `<delivery slice or requirement>` | `<when this becomes next>` | `epics/E-001-<topic>.md` |

## Later

| ID | Work | Why Later | Detail Ref |
|---|---|---|---|
| `E-002A` | `<delivery slice or requirement>` | `<reason>` | `<epic path or none>` |

## Done Recently

| ID | Completed Work | Evidence Ref |
|---|---|---|
| `E-001A` | `<work>` | `epics/E-001-<topic>.md#requirement-list` |

## Cancelled Or Parked

| ID | Work | Reason |
|---|---|---|
| `E-002A` | `<work>` | `<reason>` |

## Roadmap Rules

- Keep this file short enough to answer: what is Now, Next, Later, Done, and Parked?
- Do not duplicate PRD, TDD, or Security details here.
- Do not duplicate full epic child requirements here.
- Roadmap IDs may point to delivery slices (`E-001A`) or requirements (`E-001-001`).
- If a roadmap item needs 5+ child requirements, multi-phase tracking, or evidence history, create an epic file under `epics/`.
- When roadmap sequencing changes, update this file.
- When accepted product behavior changes, update `prd.md`.
- When accepted technical design changes, update `tdd.md`.
- When accepted security, privacy, PII, auth, audit, retention, secrets, or abuse-control policy changes, update `security.md`.
- When a child requirement status, source, promotion, or evidence changes, update the relevant epic file.
