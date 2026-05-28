<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Process Rules

This file defines planning, minimum doc loading, runtime artifact handling, canonical lookup, and recovery rules. Verification, release, completion, subagent boundaries, and doc sync live in their dedicated managed files.

## Canonical Chains

Promotion pipeline:

```text
meeting note / direct discussion -> roadmap item -> epic when needed -> PRD -> TDD when needed -> plan -> implementation
```

Delivery closure:

```text
implementation -> verification -> release-gate when applicable -> deployment when requested
```

Promotion answers whether implementation may start. Delivery closure answers whether completion may be claimed.

## Minimum Doc Loading

Start from `AGENTS.md`. Then load only files relevant to the task:

- terminology / task class: `docs/governance/managed/terminology.md`
- local commands / environment: `docs/governance/local/ops.md`
- product or UI behavior: `docs/governance/local/prd.md`
- technical design or API / schema / boundary decisions: `docs/governance/local/tdd.md`
- priority or next-work sequencing: `docs/governance/local/roadmap.md`
- large workstream child requirement detail: the relevant file under `docs/governance/local/epics/`
- release-sensitive work: `docs/governance/managed/release.md` and `.agents/skills/release-gate/SKILL.md`
- meaningful completion claim: `docs/governance/managed/verification.md` and `.agents/skills/verifier/SKILL.md`

Do not load every governance doc by default.

## Planning Threshold

Create an explicit plan before implementation when any of these apply:

- 2 or more files will likely change
- docs, code, and tests are all involved
- cross-component or cross-page behavior is involved
- a new workflow, interaction pattern, or acceptance criterion is introduced
- the user explicitly asks for planning or an implementation plan
- the task is ambiguous and a wrong interpretation would be costly

Trivial changes may use lightweight inline planning.

Plan file paths, branch strategy, worktree strategy, and runtime artifacts are owned by the active workflow runtime unless repo-local rules explicitly say otherwise.

## Task Classification

Classify work as:

- `trivial`
- `meaningful`
- `release-sensitive`
- `destructive`
- `blocked`

When uncertain, classify upward toward the safer category.

## Runtime Artifacts

Runtime-generated specs, plans, scratch notes, review notes, and execution artifacts are working materials. They are not canonical just because they exist or live under a particular path.

Accepted durable changes must be promoted into the appropriate local source before meaningful completion is claimed.

## Canonical Source Lookup

Use this order for local repo truth:

1. `docs/governance/local/prd.md` for accepted product behavior, UI / UX, user-facing flows, and acceptance criteria.
2. `docs/governance/local/tdd.md` for accepted technical design, architecture boundaries, API contracts, data models, and verification strategy.
3. `docs/governance/local/roadmap.md` for Now / Next / Later / Done / Parked priority and sequencing.
4. `docs/governance/local/epics/*` for large workstream child requirement detail, source, promotion status, evidence, and next step.
5. `docs/governance/local/ops.md` for commands, environments, release process, operator notes path, and operational constants.
6. existing implementation and tests, only when not contradicted by higher-priority truth.

If a lower-priority source conflicts with higher-priority local truth, mark or sync the stale source before a meaningful completion claim.

## Recovery Rules

If governance is violated, correct the process and continue safely:

```text
Process correction: local rules attempted to weaken a hard gate. Re-applying non-overridable governance now.
Process correction: a runtime artifact was treated as canonical. Re-anchoring to repo truth now.
Process correction: verification was skipped. Running verifier before making completion claims.
Process correction: release-sensitive action exceeded repo release rules. Running release-gate now.
Process correction: a template upgrade touched local repo truth. Restoring local ownership before continuing.
```
