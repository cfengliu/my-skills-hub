# Docs Guide

這份文件是 `docs/` 的入口與導覽，不重寫治理流程或權威規則。
真正的判斷仍應回到下列 canonical truth files，而不是只停在這份索引。

## Start Here

1. `AGENTS.md`
2. `docs/process.md`
3. `docs/ops.md`
4. `docs/prd.md`（若此 repo 有產品行為與驗收規格）
5. `docs/tdd.md`（若此 repo 有長期技術設計）
6. `docs/requirements/README.md`（若此 repo 追蹤 durable requirements）
7. `docs/plans/README.md`（若此 repo 保留 repo-authored planning records）

## Canonical Truth

- `docs/process.md`
  - canonical process、planning gate、canonical sync rules、runtime ownership notes
- `docs/ops.md`
  - operational constants and deployment/runtime procedures
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
