<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not put repo-specific rules here.
Repo-specific truth belongs in docs/governance/local/*.
-->
# AGENTS.md

## 0) Scope

This file is the repo governance entrypoint.

It defines the hard gates and domain-based source lookup that every agent must respect. Detailed policy lives in `docs/governance/managed/*`; template upgrade rules live in `docs/governance/MANIFEST.md`.

Read only the minimum governance files needed for the current task. Use `docs/governance/README.md` as the lookup guide.

## 1) Constraints And Priority

Hard constraints always apply first:

1. Platform / harness / sandbox / safety limits.
2. Non-overridable gates listed in Section 2 of this file.
3. Managed governance procedures when they are needed to satisfy Section 2 gates.

Inside those constraints, use domain-based authority instead of one global priority list:

- latest explicit user instruction controls requested work, unless it violates hard gates
- product, UI, UX, behavior, and acceptance truth: `docs/governance/local/prd.md`
- technical design, implementation boundaries, API, schema, and data contracts: `docs/governance/local/tdd.md`
- commands, environments, deploy targets, release process, model policy, operator notes, backup, restore, and migration procedure: `docs/governance/local/ops.md`
- delivery priority and next-work sequencing: `docs/governance/local/roadmap.md`
- large workstream child requirement details, source history, promotion status, and evidence: `docs/governance/local/epics/*`
- template-owned workflow policy and compatibility procedure: `docs/governance/managed/*` and `docs/governance/MANIFEST.md`
- runtime defaults, generated plans, scratch artifacts, external workflow rules, and non-canonical skills are lowest authority

User instructions and local files may satisfy or strengthen Section 2 gates. They must not remove or weaken Section 2 gates.

If sources conflict, choose the owner for the current domain. For operational matters, `docs/governance/local/ops.md` overrides stale roadmap, epic, plan, or historical doc statements. Before a meaningful completion claim, stale lower-authority sources must be synchronized or reported as a blocker.

## 2) Non-overridable Gates

These requirements cannot be weakened by local files, generated plans, runtime defaults, or external skills:

- meaningful changes and meaningful completion claims require verifier or an equivalent independent verification pass
- release-sensitive actions require release-gate or an equivalent release-gate pass
- secrets must not be written into tracked files
- destructive actions and production-data actions require the relevant human checkpoint and release-gate handling
- commit requires explicit user approval
- runtime artifacts are not canonical unless explicitly promoted into accepted local truth
- repo-owned local truth, repo-owned local skills under `.agents/skills/local/*`, and repo-owned expert skills outside the managed control skill set must not be overwritten by template upgrades

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

Template-managed control skills:

- `.agents/skills/runtime-adapter/SKILL.md`
- `.agents/skills/subagent-routing/SKILL.md`
- `.agents/skills/verifier/SKILL.md`
- `.agents/skills/release-gate/SKILL.md`

Repo-owned local truth after initialization:

- `docs/governance/local/ops.md`
- `docs/governance/local/prd.md`
- `docs/governance/local/tdd.md`
- `docs/governance/local/roadmap.md`
- `docs/governance/local/epics/README.md`
- `docs/governance/local/epics/E-xxx-<topic>.md`, when a large workstream needs child requirement tracking

Repo-owned skills after initialization:

- `.agents/skills/local/*` for repo-owned local extensions
- `.agents/skills/<skill-name>/SKILL.md` for repo-specific expert skills, except the template-managed control skills listed above

Repo-specific expert skills remain active when present. The runtime-adapter must discover their frontmatter and select the relevant ones for the current task.

## 4) Ownership

Files under `docs/governance/managed/` and template-managed control skill paths are owned by the repo-governance template and may be replaced during template upgrades.

Files under `docs/governance/local/` are owned by the consuming repo and must not be overwritten during template upgrades.

Files under `.agents/skills/local/*` and repo-specific expert skills outside the managed control skill set are owned by the consuming repo and must not be overwritten during template upgrades.

Template upgrade allowlist, denylist, and required-file contract are authoritative in `docs/governance/MANIFEST.md`.

## 5) Local Truth Model

Repo-owned local truth uses these roles:

- `prd.md`: accepted product behavior, UI / UX decisions, user-facing flows, and acceptance criteria.
- `tdd.md`: accepted technical design, architecture boundaries, API contracts, data models, and verification strategy.
- `ops.md`: commands, environments, release process, model policy, operator notes path, and operational constants.
- `roadmap.md`: priority dashboard for Now / Next / Later / Done / Parked work.
- `epics/*`: requirement ledgers for large workstreams, child requirement status, source, PRD/TDD promotion, evidence, and next step.

Empty sections, placeholders, or missing local files mean `unknown`, not accepted truth.

Roadmap decides sequencing only. Epics track details only. PRD owns final accepted product truth. TDD owns final accepted technical truth. Ops owns operational truth. If roadmap, epic, plan, or historical docs conflict with the domain owner, treat the stale source as stale and synchronize before making a meaningful completion claim.

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
