---
name: release-gate
description: Use before deploy, release, rollout, migration, production-like configuration, production data access or mutation, external API/provider calls with repo or user data, third-party downloads, destructive actions, or any environment-changing action to produce a repo-local go, hold, or require-human decision.
---
<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->

# Release Gate

## Purpose

Make the repo-local `go`, `hold`, or `require-human` decision for release-sensitive or destructive environment-changing actions.

Release-gate does not verify generic code correctness. Verifier must pass first when a meaningful change is involved.

## Policy Sources

- Release-sensitive, destructive, production-data, and human checkpoint policy: `docs/governance/managed/release.md`
- Repo-specific release commands, environments, backup, rollback, and operator notes: `docs/governance/local/ops.md`
- Repo-specific security, privacy, PII, auth, secrets, retention, and abuse controls: `docs/governance/local/security.md`
- Verification prerequisite for meaningful changes: `docs/governance/managed/verification.md`

## When to Use

Use when the user request, intended command, changed files, or target environment may touch deploy, release, rollout, migration, production-like config, production data, destructive actions, secrets, auth, payments, billing, permission boundaries, external API/provider calls, sending repo, user, private, test, or generated data outside the repo or trusted environment, or downloading third-party assets, datasets, models, large binaries, or executable artifacts into the repo or runtime.

If no release-sensitive signal is present, record the rule-out reason in verifier or final reporting.

## Inputs

- user request
- intended action
- changed files
- verifier summary when applicable
- `docs/governance/local/ops.md`
- `docs/governance/local/security.md`, when the action touches security/privacy/auth/PII/secrets/audit/retention/abuse controls
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

## Decision Procedure

1. Load `docs/governance/managed/release.md`, `docs/governance/local/ops.md`, and `docs/governance/local/security.md` when security/privacy/auth/PII/secrets/audit/retention/abuse controls are affected.
2. Identify release-sensitive actions, target environment, affected data, schema, config, secrets, auth, billing, external services, data leaving the repo, downloads, and CI/CD path.
3. Confirm meaningful changes have passed verifier or equivalent independent verification.
4. Return `require-human` when a human checkpoint remains.
5. Return `hold` when verification, backup, target environment, rollback path, or post-action checks are missing.
6. Return `go` only when required preconditions are satisfied and no human checkpoint remains.

## Common Mistakes

- treating test success as deploy approval
- bypassing backup for destructive data changes
- proceeding without target environment clarity
- approving release when verifier failed or was skipped for meaningful changes
- treating external API calls, data transfer outside the trusted environment, or third-party downloads as ordinary verification
