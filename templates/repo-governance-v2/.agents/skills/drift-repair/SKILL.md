---
name: drift-repair
description: Use when governance docs have drifted or the user asks to repair/reconcile roadmap, epic, PRD, TDD, or ops documentation inconsistencies after planning, implementation, verification, or priority changes.
---

# Drift Repair

## Purpose

Repair drift between governance local truth files without inventing new product, technical, operational, or priority decisions.

This skill changes documentation alignment. It does not choose strategy, approve completion, or replace verifier.

It may validate evidence references, but it does not audit feature completeness.

## Policy Sources

- Doc sync matrix and stale-doc handling: `docs/governance/managed/doc-sync.md`
- Source ownership and canonical lookup: `docs/governance/managed/process.md`
- Completion evidence standard: `docs/governance/managed/verification.md`
- Local priority truth: `docs/governance/local/roadmap.md`
- Local workstream detail: `docs/governance/local/epics/`
- Product, technical, and ops owners when relevant: `docs/governance/local/prd.md`, `docs/governance/local/tdd.md`, `docs/governance/local/ops.md`

## Default Scope

Repair only governance drift.

Default editable files:

- `docs/governance/local/roadmap.md`
- `docs/governance/local/epics/*.md`

Edit `prd.md`, `tdd.md`, or `ops.md` only when the user explicitly asks or the drift is a mechanical stale marker that preserves the domain owner rule.

## Evidence Boundary

Use evidence to repair doc drift, not to create completion claims.

Concrete evidence may include:

- implementation paths named by roadmap or epic evidence
- test paths named by roadmap or epic evidence
- recorded command results
- verifier output
- PRD/TDD/Ops references that contain the claimed promoted truth

Do not treat file existence as proof of completion. Completion evidence requires an explicit verification result, verifier output, or a command result that validates the relevant invariant.

## Source Code Boundary

Read source code only when roadmap or epic evidence names concrete paths, or when the user explicitly asks for evidence reconciliation.

Treat code inspection as evidence-reference validation, not feature verification.

## Output

```yaml
status: repaired | proposed | blocked | no-drift-found
scope:
  roadmap: checked | missing | not-needed
  epics:
    - "path or none"
  prd: checked | not-needed | missing
  tdd: checked | not-needed | missing
  ops: checked | not-needed | missing
repairs:
  - file: "path"
    change: "short concrete change"
    reason: "drift repaired"
blocked_items:
  - "missing evidence, missing file, or human decision needed"
remaining_risk:
  - "risk or none"
next_required_check: verifier | human-decision | none
```

## Procedure

1. Load `docs/governance/managed/doc-sync.md` and the smallest local truth set needed for the drift claim.
2. Read `roadmap.md` if it exists.
3. Read only epic files referenced by roadmap or named by the user.
4. If roadmap references missing epic files, report `blocked` or repair the reference only when the intended existing file is obvious.
5. Compare roadmap sequencing with epic status, delivery slices, requirement list, evidence, gaps, and closure fields.
6. Compare epic PRD/TDD/Ops claims with domain owner files only when the epic references promotion, accepted behavior, technical design, commands, release, migration, or environment details.
7. Repair mechanical drift directly when concrete evidence references are present and not obviously stale or missing.
8. Do not infer accepted priorities, accepted requirements, architecture, commands, release targets, or completion evidence from vibes or recent chat alone.
9. If evidence is insufficient, output a proposed repair and the exact human decision or evidence needed.
10. After editing, report whether verifier is still required before any meaningful completion claim.

## Drift Checks

Check these cases:

- Roadmap `Now`, `Next`, `Later`, `Done Recently`, or `Cancelled Or Parked` conflicts with epic status.
- Roadmap points to an epic path that is missing, renamed, or too vague.
- Epic says `done` but requirement evidence or verification evidence is missing.
- Epic has `gaps` or `next` work but roadmap treats the slice as done.
- Epic delivery slice status conflicts with covered requirement statuses.
- Requirement `PRD` or `TDD` promotion status conflicts with actual local PRD/TDD content.
- Roadmap duplicates full child requirement detail instead of pointing to epic detail.
- Done work appears in epic closure but not roadmap `Done Recently`.
- Parked or cancelled work still appears in roadmap `Now` or `Next`.
- Ops-sensitive statements in roadmap or epic conflict with `ops.md`.

## Repair Rules

- Prefer lowering overclaiming statuses to `partially-done` or `pending-acceptance` when evidence is mixed.
- Move roadmap items to `Done Recently` only when the epic records concrete implementation evidence and concrete verification evidence, and those references are not obviously stale or missing.
- Move roadmap items to `Cancelled Or Parked` only when the epic status or explicit user instruction says parked or cancelled.
- Add or update epic `gaps`, `next`, and `Closure` fields when they explain why roadmap and epic differ.
- Keep roadmap short; point to epic detail instead of copying requirement text.
- Preserve stable IDs.
- Do not delete historical rows unless they are duplicate placeholders or clearly wrong generated noise.
- Mark unresolved conflicts as stale or blocked instead of fabricating truth.

## Do Not

- choose the next product priority
- create new accepted requirements
- promote requirements into PRD/TDD without explicit accepted evidence
- mark work done without verification evidence
- edit source code
- perform release-sensitive or destructive actions
