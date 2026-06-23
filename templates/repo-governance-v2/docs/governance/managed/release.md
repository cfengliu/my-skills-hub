<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Release Rules

This file owns release-sensitive, destructive, production-data, and human checkpoint gates.

Verification passing is not release approval. Meaningful changes still require verification before release-gate can return `go`.

## Release-sensitive Detector

Treat the following as release-sensitive unless explicitly ruled out with evidence:

- deploy, release, rollout, backup, restore, rollback, or migration commands
- schema or migration files
- database, storage, or production-like data changes
- container, infrastructure, proxy, runtime, or CI/CD config
- `.env*`, secrets documentation, credentials wiring, or production-like config
- auth, identity, payments, billing, or permission boundary changes
- production data access or mutation
- external API calls or provider calls
- sending repo, user, private, test, or generated data outside the repo or trusted environment
- downloading third-party assets, datasets, models, large binaries, or executable artifacts into the repo or runtime
- destructive environment actions

## Release-gate Requirement

Before any release-sensitive action:

1. Read `docs/governance/local/ops.md`, and read `docs/governance/local/security.md` when security/privacy/auth/PII/secrets/audit/retention/abuse controls are affected.
2. Identify target environment and affected data, schema, config, secrets, auth, billing, external services, data leaving the repo, downloads, and CI/CD path.
3. Run release-gate or an equivalent release-gate pass.
4. Continue only if the decision is `go`.

## Gate Status

- `go`: required preconditions are satisfied and the action may proceed.
- `hold`: do not proceed until missing checks, environment data, or preconditions are resolved.
- `require-human`: do not proceed without explicit human confirmation.

If the decision is missing, unclear, `hold`, or `require-human`, stop and ask for human confirmation or fix the blocker.

## Human Checkpoint Gates

Do not automatically cross these gates:

- deploy / release / rollout
- destructive schema or data change
- auth / identity change
- permission, PII, audit, retention, or abuse-control change
- payments / billing change
- secrets
- production config
- production data access or mutation
- external API/provider call with repo, user, private, test, or generated data
- repo, user, private, test, or generated data transfer outside the repo or trusted environment
- third-party asset, dataset, model, large binary, or executable artifact download into the repo or runtime
- destructive git action
- branch deletion
- worktree deletion

## Secrets

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

## Production Data Rules

Production data access or mutation always requires human checkpoint. Treat production-like local stacks conservatively when destructive data loss is possible.

## Destructive Environment Actions

Before destructive schema, destructive data, or irreversible environment changes:

- identify target environment
- identify data loss and rollback risks
- confirm backup / restore path when applicable
- get human confirmation
- require release-gate `go`
- run post-action checks and report actual results
