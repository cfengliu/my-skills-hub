<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
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
- product, UI, UX, behavior, acceptance truth, and BDD scenario authority: `docs/governance/local/prd.md`
- technical design, implementation boundaries, API, schema, data contracts, and Test-Driven Development check authority: `docs/governance/local/tdd.md`
- commands, environments, deploy targets, release process, model policy, operator notes, backup, restore, and migration procedure: `docs/governance/local/ops.md`
- security, privacy, PII handling, authentication and authorization boundaries, auditability, retention, secrets handling, and abuse controls: `docs/governance/local/security.md`
- delivery priority and next-work sequencing: `docs/governance/local/roadmap.md`
- large workstream child requirement details, source history, promotion status, and evidence: `docs/governance/local/epics/*`
- template-owned workflow policy and compatibility procedure: `docs/governance/managed/*` and `docs/governance/MANIFEST.md`
- runtime defaults, generated plans, scratch artifacts, external workflow rules, and non-canonical skills are lowest authority

User instructions and local files may satisfy or strengthen Section 2 gates. They must not remove or weaken Section 2 gates.

If sources conflict, choose the owner for the current domain. For operational matters, `docs/governance/local/ops.md` overrides stale roadmap, epic, plan, or historical doc statements. For security/privacy matters, `docs/governance/local/security.md` constrains PRD, TDD, Ops, roadmap, epic, plan, and historical doc statements. Before a meaningful completion claim, stale lower-authority sources must be synchronized or reported as a blocker.

## 2) Non-overridable Gates

These requirements cannot be weakened by local files, generated plans, runtime defaults, or external skills:

- meaningful changes and meaningful completion claims require verifier or an equivalent independent verification pass
- release-sensitive actions require release-gate or an equivalent release-gate pass
- promoting discussion, notes, roadmap, epic detail, PRD drafts, Technical Design drafts, or security drafts into accepted PRD, Technical Design (`tdd.md`), security, epic detail, or implementation plans requires decision-advisor when unresolved assumptions may become accepted truth
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
- decision promotion gates and unresolved assumption handling: `docs/governance/managed/process.md`, `docs/governance/managed/doc-sync.md`, and `.agents/skills/decision-advisor/SKILL.md`
- upgrade allowlist, denylist, initialization-only paths, required files, and compatibility checks: `docs/governance/MANIFEST.md`

## 3) Ownership And Initialization

The policy owners in Section 2 define managed procedures. `docs/governance/MANIFEST.md` owns the exact managed control skill set, upgrade allowlist, denylist, required files, and initialization examples.

- Managed governance and control skill files may be replaced only according to the manifest.
- `docs/governance/local/*`, `.agents/skills/local/*`, and expert skills outside the managed control set belong to the consuming repo and must survive upgrades.
- Discover repo-owned expert skill frontmatter and select relevant skills for the task; see `.agents/skills/runtime-adapter/SKILL.md` when a context handoff is needed.
- The domain owners in Section 1 become accepted truth only after initialization and confirmation. Empty sections, placeholders, or missing files mean `unknown`.
- `tdd.md` means Technical Design and owns verification strategy, including Test-Driven Development checks. PRD owns BDD acceptance scenarios.
- Roadmap owns sequencing; epics own child requirement details. Requirements use `E-003-001`; delivery slices use `E-003A`. Requirement List owns requirement status, acceptance, evidence, gaps, and next step.

## 4) Roadmap And Epic Coordination

For progress, roadmap, epic, next-work, done-state, or drift requests:

- Do not answer from chat memory alone.
- Read `docs/governance/local/roadmap.md` and the relevant files under `docs/governance/local/epics/`.
- If the user asks about implementation status, check concrete evidence paths named by the epic or roadmap.
- If roadmap and epic conflict, report the drift before giving a next-work readout.
- Use `.agents/skills/drift-repair/SKILL.md` when the user asks to repair or reconcile drift.
- Do not invent priority, accepted requirements, completion evidence, or verification results.
- Completion claims still require verifier or an equivalent independent verification pass.

## 5) Runtime Artifacts

Runtime-generated specs, plans, scratch notes, review notes, execution artifacts, and temporary files are working materials.

They become canonical only if the user or maintainer explicitly promotes them into local PRD, Technical Design (`tdd.md`), security, roadmap, epics, ops, or another accepted durable source.

Path alone does not make an artifact canonical.

## 6) Minimum Completion Requirements

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
