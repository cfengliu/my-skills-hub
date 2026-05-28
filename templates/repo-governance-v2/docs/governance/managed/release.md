<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Release Rules

## Release-sensitive Detector

Treat the following as release-sensitive unless explicitly ruled out with evidence:

- deploy, release, rollout, backup, restore, rollback, or migration commands
- schema or migration files
- database, storage, or production-like data changes
- container, infrastructure, proxy, runtime, or CI/CD config
- `.env*`, secrets documentation, credentials wiring, or production-like config
- auth, identity, payments, billing, or permission boundary changes
- production data access or mutation
- destructive environment actions

## Release-gate Requirement

Before any release-sensitive action:

1. Read `docs/governance/local/ops.md`.
2. Identify target environment and affected data, schema, config, secrets, auth, billing, and CI/CD path.
3. Run release-gate or an equivalent release-gate pass.
4. Continue only if the decision is `go`.

## Gate Status

- `go`: required preconditions are satisfied and the action may proceed.
- `hold`: do not proceed until missing checks, environment data, or preconditions are resolved.
- `require-human`: do not proceed without explicit human confirmation.

If the decision is missing, unclear, `hold`, or `require-human`, stop and ask for human confirmation or fix the blocker.

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
