---
name: release-gate
description: Use before deploy, release, rollout, migration, production-like configuration, production data access or mutation, destructive actions, or any environment-changing action to produce a repo-local go, hold, or require-human decision.
---

# Release Gate

## Purpose

Make the repo-local `go`, `hold`, or `require-human` decision for release-sensitive or destructive environment-changing actions.

Release-gate does not verify generic code correctness. Verifier must pass first when a meaningful change is involved.

## When to Use

Use before:

- deploy, release, or rollout
- schema or data migration
- destructive schema or data changes
- production-like config changes
- production data access or mutation
- backup, restore, or rollback-sensitive operations
- secrets or credentials wiring
- auth, identity, payments, billing, or permission-boundary changes

## Inputs

- user request
- intended action
- changed files
- verifier summary when applicable
- `docs/governance/local/ops.md`
- target environment

## Output

```yaml
gate_status: go | hold | require-human
release_sensitive_actions:
  - "action or none"
target_environment: "environment or unknown"
required_preconditions:
  - "precondition or none"
commands_or_checks:
  - command: "command or inspection"
    result: pass | fail | skipped | blocked
residual_release_risk:
  - "risk or none"
next_action: proceed | fix | ask-human | run-verifier
```

## Decision Rules

Return `require-human` when secrets, production data, production config, destructive actions, or human checkpoint gates are involved.

Return `hold` when required verification, backup, target environment, rollback path, or post-action checks are missing.

Return `go` only when required preconditions are satisfied and no human checkpoint remains.

## Detector Signals

Treat these as release-sensitive unless explicitly ruled out with evidence:

- deploy / release / rollout / migrate / backup / restore / rollback commands
- schema or migration files
- production-like config
- `.env*`, secrets docs, credentials wiring
- CI/CD release path files
- auth, identity, payments, billing, permission boundaries
- production data access or mutation
- destructive environment actions

## Common Mistakes

- treating test success as deploy approval
- bypassing backup for destructive data changes
- proceeding without target environment clarity
- approving release when verifier failed or was skipped for meaningful changes
