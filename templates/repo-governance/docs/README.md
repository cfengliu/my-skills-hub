# Docs Guide

這份文件是 `docs/` 的入口與導覽，不重寫治理流程或權威規則。
真正的判斷仍應回到下列 canonical truth files，而不是只停在這份索引。

## Start Here

Always start with:

1. `AGENTS.md`

Then load only what the task needs:

- Process / planning / verification / doc sync / commit gate：`docs/process.md`
- Commands / model policy / dev server / deploy / destructive actions：`docs/ops.md`
- Product behavior, UI / UX, acceptance：`docs/prd.md`, if present
- Technical design, architecture, API, schema：`docs/tdd.md`, if present
- Durable requirements：`docs/requirements/README.md`, if present
- Historical repo-authored plans：`docs/plans/README.md`, only when explicitly relevant

Do not read every doc by default.

## Canonical Truth

- `docs/process.md`
  - canonical process、planning gate、canonical sync rules、runtime ownership notes
- `docs/ops.md`
  - model policy, operational constants, and deployment/runtime procedures
- `docs/prd.md`
  - canonical product behavior and acceptance, if applicable
- `docs/tdd.md`
  - canonical technical design, if applicable
- `docs/requirements/README.md`
  - requirements normalization entry and requirement index, if applicable

## Non-Canonical Areas

- `docs/meeting-notes/`
  - raw meeting notes and discovery artifacts
- `docs/plans/`
  - repo-authored governance records, manual plans, and historical artifacts
  - not the required destination for external runtime working artifacts
- `docs/references/`
  - supporting material that is not top-level authority
- `docs/archive/`
  - retired or historical documents

## Interpretation Notes

- confirmed UI / UX decisions are the highest product authority; if they conflict with PRD or TDD, follow UI / UX first and sync the stale docs
- runtime-generated specs、plans、review notes、scratch docs are non-canonical unless their accepted changes are synced back to canonical truth files
- external workflow runtime artifacts follow that runtime's archival rules, but remain non-canonical unless synced back to canonical truth files
- `docs/plans/` may contain useful records, but location alone does not make those records canonical
- when UI / UX changes, sync to `docs/prd.md` and, when technical design changes, `docs/tdd.md`
- when behavior changes, sync to `docs/prd.md` if this repo uses PRD as canonical truth
- when technical design changes, sync to `docs/tdd.md` if this repo uses TDD as canonical truth
- when operational practice changes, sync to `docs/ops.md`
- when durable requirements change, sync to the relevant file under `docs/requirements/`
