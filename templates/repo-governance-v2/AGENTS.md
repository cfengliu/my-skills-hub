<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not put repo-specific rules here.
Repo-specific truth belongs in docs/governance/local/*.
-->
# AGENTS.md

## 0) Scope

This file is the repo governance entrypoint.

It defines:

- instruction priority
- governance source ownership
- non-overridable gates
- local truth boundaries
- minimum completion requirements

Detailed process rules live under `docs/governance/`. Read only the minimum relevant files for the current task.

## 1) Constraints And Priority

Hard constraints always apply first:

1. Platform / harness / sandbox / safety limits.
2. Non-overridable gates in this `AGENTS.md`.
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

User instructions and local files operate only within non-overridable gates. They may satisfy a gate, but must not remove or weaken it.

Local files may strengthen governance requirements. Local files may specialize override-allowed defaults. Local files must not weaken or remove non-overridable gates.

## 2) Non-overridable Gates

The following requirements cannot be weakened by local files, generated plans, runtime defaults, or external skills:

- verifier requirement for meaningful changes
- release-gate requirement for release-sensitive actions
- secrets rules
- destructive-action gates
- production-data gates
- human checkpoint gates
- commit approval requirement
- runtime artifacts are not canonical unless explicitly promoted
- local files must not be overwritten by template upgrades

## 3) Governance Sources

Template-managed rules live here:

- `docs/governance/managed/terminology.md`
- `docs/governance/managed/process.md`
- `docs/governance/managed/completion.md`
- `docs/governance/managed/verification.md`
- `docs/governance/managed/subagents.md`
- `docs/governance/managed/release.md`
- `docs/governance/managed/doc-sync.md`

Repo-owned local truth lives here:

- `docs/governance/local/ops.md`
- `docs/governance/local/prd.md`
- `docs/governance/local/tdd.md`
- `docs/governance/local/roadmap.md`
- `docs/governance/local/epics/README.md`
- `docs/governance/local/epics/E-xxx-<topic>.md`, when a large workstream needs child requirement tracking

Use `docs/governance/README.md` as the entrypoint when more detail is needed.

## 4) Ownership

Files under `docs/governance/managed/` are owned by the repo-governance template and may be replaced during template upgrades.

Files under `docs/governance/local/` are owned by this repo and must not be overwritten during template upgrades.

Template upgrades may replace:

- `AGENTS.md`
- `docs/governance/VERSION`
- `docs/governance/MANIFEST.md`
- `docs/governance/README.md`
- `docs/governance/managed/*`
- `.agents/skills/verifier/*`
- `.agents/skills/release-gate/*`
- `.agents/skills/subagent-routing/*`
- `.agents/skills/runtime-adapter/*`

Template upgrades must not overwrite:

- `docs/governance/local/*`
- `.agents/skills/local/*`
- repo source code
- repo secrets or local operator notes
- legacy repo-owned docs listed in `docs/governance/MANIFEST.md`

## 5) Local Truth Model

Repo-owned local truth uses these roles:

- `prd.md`: accepted product behavior, UI / UX decisions, user-facing flows, and acceptance criteria.
- `tdd.md`: accepted technical design, architecture boundaries, API contracts, data models, and verification strategy.
- `roadmap.md`: priority dashboard for Now / Next / Later / Done / Parked work.
- `epics/*`: requirement ledgers for large workstreams, child requirement status, source, PRD/TDD promotion, evidence, and next step.
- `ops.md`: commands, environments, release process, operator notes path, and operational constants.

Roadmap decides sequencing. Epics track details. PRD and TDD own final accepted truth.

If roadmap or epic details conflict with PRD/TDD, treat the lower-priority source as stale and synchronize before making a meaningful completion claim.

## 6) Runtime Artifacts

Runtime-generated specs, plans, scratch notes, review notes, execution artifacts, and temporary files are not canonical by default.

They become canonical only if the user or maintainer explicitly promotes them into local PRD, TDD, roadmap, epics, ops, or another accepted durable source.

Path alone does not make an artifact canonical.

## 7) Human Checkpoint Gates

Do not automatically cross these gates:

- deploy / release / rollout
- destructive schema or data change
- auth / identity change
- payments / billing change
- secrets
- production config
- production data access or mutation
- destructive git action
- branch deletion
- worktree deletion

Release-sensitive or destructive environment actions require a release-gate decision of `go`.

If the decision is `hold`, `require-human`, missing, or unclear, stop and ask for human confirmation.

Do not commit unless the user explicitly approves commit.

## 8) Verification

Any meaningful change or meaningful completion claim requires verifier or an equivalent independent verification pass.

Trivial changes may use lightweight verification, but the completion report must still say what was checked and why broader verification or doc sync was not required.

Verification details live in:

- `docs/governance/managed/verification.md`
- `.agents/skills/verifier/SKILL.md`

## 9) Release

Before any release-sensitive action:

1. Read `docs/governance/local/ops.md`.
2. Identify target environment and affected data, schema, config, secrets, auth, billing, and CI/CD path.
3. Run release-gate or an equivalent release-gate pass.
4. Continue only if the decision is `go`.

Release details live in:

- `docs/governance/managed/release.md`
- `.agents/skills/release-gate/SKILL.md`

## 10) Secrets

Never write secrets into tracked files.

Forbidden in tracked files:

- passwords
- private keys
- `.env`
- API tokens
- DB passwords
- cloud credentials
- production credentials
- access tokens
- private operator notes

If local operator context is needed, use the repo-approved local notes path defined in `docs/governance/local/ops.md`, if present.

## 11) Completion Report

Every meaningful completion report must include:

- summary
- touched files
- commands run
- results
- skipped checks
- doc sync status
- verifier status
- residual risks
- commit status

Commit status must be one of:

- `not requested`
- `waiting for user approval`
- `committed with hash <hash>`
