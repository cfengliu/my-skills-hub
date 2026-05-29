<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Documentation Sync Rules

This file owns PRD, TDD, roadmap, epics, ops sync, and stale-doc handling.

## Sync Principle

Accepted durable changes must be synchronized into the appropriate canonical source before meaningful completion claim.

Empty sections, placeholders, or missing local files mean `unknown`, not accepted truth.

## PRD Sync

Update `docs/governance/local/prd.md` when accepted product behavior, UI / UX, acceptance criteria, or user-facing flows change.

## TDD Sync

Update `docs/governance/local/tdd.md` when accepted technical design, architecture, API, schema, integration behavior, or verification strategy changes.

## Roadmap Sync

Update `docs/governance/local/roadmap.md` when priority, Now / Next / Later / Done / Parked state, or the next work item changes.

Roadmap should stay short. It should point to epic detail instead of duplicating full child requirement text.

## Epic Sync

Update the relevant file under `docs/governance/local/epics/` when a large workstream child requirement changes status, source, PRD/TDD promotion, evidence, or next step.

Create an epic file only when a roadmap item needs child requirement tracking, source history, multi-phase delivery, or repeated updates across sessions.

## Ops Sync

Update `docs/governance/local/ops.md` when commands, environments, release process, model policy, operator notes path, or operational constants change.

## Stale Doc Marking

If a conflicting doc cannot be synchronized immediately, mark it stale in the stale source or record the conflict in the relevant local file, then report the blocker and residual risk.

## Completion Reporting

Meaningful completion reports must include doc sync status for applicable sources:

```text
Doc sync:
- PRD:
- TDD:
- Roadmap:
- Epics:
- Ops:
```

Use `not needed` or `not applicable` only with a concrete reason.
