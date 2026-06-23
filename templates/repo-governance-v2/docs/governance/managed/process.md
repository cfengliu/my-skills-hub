<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Process Rules

This file owns task classes, planning, minimum doc loading, runtime artifact handling, canonical lookup, and recovery rules.

Verification and completion live in `verification.md`. Release-sensitive gates live in `release.md`. Subagent boundaries live in `subagents.md`. Documentation sync lives in `doc-sync.md`.
Decision promotion gates use `.agents/skills/decision-advisor/SKILL.md`.

## Task Classes

Classify work as:

- `trivial`: typo fixes, formatting, non-behavioral comments, wording, or local documentation phrasing only; no runtime behavior, product acceptance, tests, ops rules, schemas, configuration, APIs, dependency behavior, release paths, or durable requirements change.
- `meaningful`: any substantive change to code, config, schema, dependency behavior, public behavior, UI structure, interaction flow, API contract, test expectation, deployment path, durable docs, ops rules, or requirements.
- `release-sensitive`: deploy, release, rollout, migration, backup, restore, rollback, production-like config, CI/CD release path, auth, identity, payments, billing, secrets, production data, external API/provider calls, data leaving the repo or trusted environment, third-party downloads, or environment-changing action.
- `destructive`: an action that may delete, overwrite, or irreversibly modify data, schema, config, branch, worktree, environment, or production-like state.
- `blocked`: missing permission, missing environment, failing checks, requirement conflict, or human decision needed.

When uncertain, classify upward toward the safer category.

## Canonical Chains

These flows describe lifecycle, not authority order.

```text
Intake / tracking:
meeting note / direct discussion -> roadmap item -> epic when needed

Truth promotion:
discussion / roadmap item / epic detail -> PRD and/or Technical Design

Methodology derivation:
PRD -> BDD scenarios -> behavior tests
Technical Design -> TDD technical checks -> technical tests

Execution:
PRD / Technical Design / explicit user instruction -> plan -> BDD scenario or TDD technical check -> test first -> implementation
```

Delivery closure:

```text
implementation -> verification -> release-gate when applicable -> deployment when requested
```

Roadmap and epic entries may organize and track work, but do not by themselves authorize implementation. Accepted PRD and Technical Design define durable implementation scope. Explicit user instruction may define current-task scope when it does not violate hard gates. Delivery closure answers whether completion may be claimed.

BDD applies to product behavior work. The PRD is the durable authority for BDD scenarios, and each scenario must express observable behavior from accepted PRD acceptance criteria. Explicit user instruction may source current-task BDD scenarios; durable product truth still requires promotion into PRD when needed.

Test-Driven Development applies to technical design work. The Technical Design is the durable authority for TDD technical checks, and each check must verify an invariant from accepted technical decisions, contracts, boundaries, or state rules. Explicit user instruction may source current-task technical checks; durable technical truth still requires promotion into Technical Design when needed.

Test first means product behavior work starts from a BDD-backed behavior test, and technical design work starts from a TDD-backed technical check. Trivial wording, formatting, and non-behavioral documentation changes do not need BDD scenarios or tests.

Methodology derivation triggers when meaningful product behavior or meaningful technical implementation is about to become a plan task or implementation task. Meaningful product behavior work must trigger BDD derivation. Meaningful technical implementation work must trigger Test-Driven Development derivation.

Methodology derivation does not trigger for intake, roadmap sequencing, epic tracking, truth promotion by itself, trivial wording, formatting, or non-behavioral documentation changes.

## Decision Promotion Gate

Run `.agents/skills/decision-advisor/SKILL.md` before promoting discussion, notes, roadmap, epic detail, PRD drafts, or Technical Design drafts into accepted PRD, Technical Design (`tdd.md`), epic detail, or implementation plans when unresolved assumptions may become accepted truth.

Do not use decision-advisor for trivial wording, formatting, typo fixes, refactors with no behavior change, or fully reversible local implementation choices that do not affect accepted behavior.

Decision-advisor results control promotion:

- `go`: promotion may proceed.
- `needs-approval`: promotion must wait for explicit user approval or `照建議`.
- `needs-specialist`: affected items must wait for repo-local specialist review or user override.
- `blocked`: promotion must not proceed until the smallest blocking question is answered.

Recommended defaults are not accepted truth until approved by the user or already grounded in accepted local truth.

## Minimum Doc Loading

Start from `AGENTS.md`. Then load only files relevant to the task:

- task class, planning, runtime artifacts, or canonical lookup: `docs/governance/managed/process.md`
- local commands / environment: `docs/governance/local/ops.md`
- product or UI behavior: `docs/governance/local/prd.md`
- technical design or API / schema / boundary decisions: `docs/governance/local/tdd.md`
- priority or next-work sequencing: `docs/governance/local/roadmap.md`
- large workstream child requirement detail: the relevant file under `docs/governance/local/epics/`
- decision promotion or unresolved assumptions: `.agents/skills/decision-advisor/SKILL.md`
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

Empty sections, placeholders, or missing local files mean `unknown`, not accepted truth.

If a lower-priority source conflicts with higher-priority local truth, mark or sync the stale source before a meaningful completion claim.

## Recovery Rules

If governance is violated, correct the process and continue safely:

```text
Process correction: local rules attempted to weaken a hard gate. Re-applying non-overridable governance now.
Process correction: a runtime artifact was treated as canonical. Re-anchoring to repo truth now.
Process correction: unresolved assumptions were about to be promoted. Running decision-advisor before changing accepted truth.
Process correction: verification was skipped. Running verifier before making completion claims.
Process correction: release-sensitive action exceeded repo release rules. Running release-gate now.
Process correction: a template upgrade touched local repo truth. Restoring local ownership before continuing.
```
