---
name: release-gate
description: Use when a task may deploy, roll out, migrate schema or data, touch production-like configuration, or otherwise needs a repo-local go-no-go decision before environment-changing actions proceed.
---

# Release Gate

## Overview

Make the repo-local go / hold / require-human decision for environment-changing actions after implementation exists but before release-sensitive operations proceed.

## When to Use

- before deploy, release, or rollout
- before destructive schema or data changes
- before backup / restore / rollback-sensitive operations
- before touching production-like configuration, credentials wiring, or environment bootstrap
- whenever the task or changed files indicate a release-sensitive action

Do not use this skill for normal implementation, generic planning, or code correctness review.

## Inputs

- user request
- changed files
- verification summary
- `docs/ops.md`
- current environment intent

## Output

Return:

1. gate status: `go`, `hold`, or `require-human`
2. release-sensitive actions detected
3. required preconditions
4. required commands or checks
5. residual release risk

## Release-Sensitive Detector

Before deciding whether `release-gate` is required, scan changed files, requested commands, and intended environment actions. The detector only raises a gate signal or records an explicit rule-out reason; it does not make the go / hold / require-human decision.

Treat the following as release-sensitive signals unless explicitly ruled out with evidence:

- schema or migration files
- deploy, release, rollout, backup, restore, rollback, or migration scripts
- container, infrastructure, proxy, or runtime config files
- `.env*`, secrets documentation, credentials wiring, or production-like configuration
- CI/CD workflow files
- commands containing deploy, release, rollout, migrate, backup, restore, rollback, or production config changes
- auth, identity, payments, billing, or production data handling changes

If release-gate is not run, record the rule-out reason explicitly in the verifier or final synthesis, for example: `release-gate not run because no detector signal appeared and no deploy / migration / environment action was requested`.

## Pseudocode

```text
function release_gate(task, change, verification):
  ops = load("docs/ops.md")
  actions = classify_release_actions(task, change)

  if actions.is_empty():
    return gate("go", reason="no release-sensitive action detected")

  preconditions = []

  if verification.status != "pass":
    preconditions.append("verifier_pass_required")

  if actions.includes("destructive_schema") or actions.includes("destructive_data"):
    preconditions.append("backup_required")

  if actions.includes("deploy") or actions.includes("rollout"):
    preconditions.append("post_deploy_checks_required")

  if actions.includes("prod_config") or actions.includes("secrets"):
    preconditions.append("human_checkpoint_required")

  if "human_checkpoint_required" in preconditions:
    return gate("require-human", preconditions, ops_refs=ops)

  if missing_required_ops_steps(preconditions, ops):
    return gate("hold", preconditions, ops_refs=ops)

  return gate("go", preconditions, ops_refs=ops)
```

## Common Mistakes

- treating test success as automatic deploy approval
- bypassing backup requirements for destructive changes
- allowing runtime cleanup or rollout steps without reading `docs/ops.md`
- making release decisions for non-release tasks
