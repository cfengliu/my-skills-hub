<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not put repo-specific rules here.
Repo-specific truth belongs in docs/governance/local/*.
-->
# AGENTS.md

## 0) Scope

This file is the repo governance entrypoint.

It defines the hard gates and source-of-truth order that every agent must respect. Detailed policy lives in `docs/governance/managed/*`; template upgrade rules live in `docs/governance/MANIFEST.md`.

Read only the minimum governance files needed for the current task. Use `docs/governance/README.md` as the lookup guide.

## 1) Constraints And Priority

Hard constraints always apply first:

1. Platform / harness / sandbox / safety limits.
2. Non-overridable gates in this file.
3. Non-overridable managed governance requirements.

Inside those constraints, instruction and truth priority is:

1. User latest explicit instruction.
2. Accepted product, UI, UX, behavior, and acceptance truth in `docs/governance/local/prd.md`.
3. Accepted technical design and implementation boundaries in `docs/governance/local/tdd.md`.
4. Delivery priority and next-work sequencing in `docs/governance/local/roadmap.md`.
5. Large workstream requirement details in `docs/governance/local/epics/*`.
6. Operational constants in `docs/governance/local/ops.md`.
7. Override-allowed managed defaults under `docs/governance/managed/*`.
8. Runtime defaults, generated plans, scratch artifacts, external workflow rules, and non-canonical skills.

User instructions and local files may satisfy or strengthen gates. They must not remove or weaken non-overridable gates.

## 2) Non-overridable Gates

These requirements cannot be weakened by local files, generated plans, runtime defaults, or external skills:

- meaningful changes and meaningful completion claims require verifier or an equivalent independent verification pass
- release-sensitive actions require release-gate or an equivalent release-gate pass
- secrets must not be written into tracked files
- destructive actions and production-data actions require the relevant human checkpoint and release-gate handling
- commit requires explicit user approval
- runtime artifacts are not canonical unless explicitly promoted into accepted local truth
- repo-owned local files and local skills must not be overwritten by template upgrades

Policy owners:

- task classes, planning, runtime artifacts, and canonical lookup: `docs/governance/managed/process.md`
- verification, completion taxonomy, completion reports, and commit rules: `docs/governance/managed/verification.md`
- release-sensitive, destructive, production-data, and human checkpoint gates: `docs/governance/managed/release.md`
- subagent delegation boundaries: `docs/governance/managed/subagents.md`
- doc sync and stale-doc handling: `docs/governance/managed/doc-sync.md`
- upgrade allowlist, denylist, initialization-only paths, required files, and compatibility checks: `docs/governance/MANIFEST.md`

## 3) Governance Sources

Template-managed governance modules:

- `docs/governance/managed/process.md`
- `docs/governance/managed/verification.md`
- `docs/governance/managed/release.md`
- `docs/governance/managed/subagents.md`
- `docs/governance/managed/doc-sync.md`

Repo-owned local truth after initialization:

- `docs/governance/local/ops.md`
- `docs/governance/local/prd.md`
- `docs/governance/local/tdd.md`
- `docs/governance/local/roadmap.md`
- `docs/governance/local/epics/README.md`
- `docs/governance/local/epics/E-xxx-<topic>.md`, when a large workstream needs child requirement tracking

## 4) Ownership

Files under `docs/governance/managed/` are owned by the repo-governance template and may be replaced during template upgrades.

Files under `docs/governance/local/` are owned by the consuming repo and must not be overwritten during template upgrades.

Template upgrade allowlist, denylist, and required-file contract are authoritative in `docs/governance/MANIFEST.md`.

## 5) Local Truth Model

Repo-owned local truth uses these roles:

- `prd.md`: accepted product behavior, UI / UX decisions, user-facing flows, and acceptance criteria.
- `tdd.md`: accepted technical design, architecture boundaries, API contracts, data models, and verification strategy.
- `roadmap.md`: priority dashboard for Now / Next / Later / Done / Parked work.
- `epics/*`: requirement ledgers for large workstreams, child requirement status, source, PRD/TDD promotion, evidence, and next step.
- `ops.md`: commands, environments, release process, operator notes path, and operational constants.

Empty sections, placeholders, or missing local files mean `unknown`, not accepted truth.

Roadmap decides sequencing. Epics track details. PRD and TDD own final accepted truth. If roadmap or epic details conflict with PRD/TDD, treat the lower-priority source as stale and synchronize before making a meaningful completion claim.

## 6) Runtime Artifacts

Runtime-generated specs, plans, scratch notes, review notes, execution artifacts, and temporary files are working materials.

They become canonical only if the user or maintainer explicitly promotes them into local PRD, TDD, roadmap, epics, ops, or another accepted durable source.

Path alone does not make an artifact canonical.

## 7) Minimum Completion Requirements

Meaningful completion reports must include:

- summary
- touched files
- commands run
- results
- skipped checks
- doc sync status
- verifier status
- residual risks
- commit status

Use the precise completion taxonomy and commit-status values from `docs/governance/managed/verification.md`.
