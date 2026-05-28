<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Completion Rules

## Completion Taxonomy

Use precise status words:

- `not-started`: only intake, analysis, or planning happened.
- `implemented`: files changed, but verification is not complete.
- `checked`: lightweight checks completed; only valid for trivial changes or explicitly scoped checks.
- `verified`: verifier or equivalent independent verification passed.
- `release-ready`: release-gate returned `go`, but deploy / rollout has not yet happened.
- `released`: deploy / rollout completed and post-release checks passed.
- `blocked`: missing permission, missing environment, failing checks, requirement conflict, or human decision needed.

Do not use `complete` to hide missing verification, release-gate, or post-release checks.

## Meaningful Completion Report

Every meaningful completion report must include:

```text
Summary:
Touched files:
Commands run:
Results:
Skipped checks:
Doc sync:
Verifier:
Residual risks:
Commit status:
```

`Commit status` must be one of:

- `not requested`
- `waiting for user approval`
- `committed with hash <hash>`

## Trivial Completion Report

For trivial changes, report:

```text
Summary:
Touched files:
Checks:
Doc sync:
Commit status:
```

Explain why broader verification was not required.

## Partial Completion

If only part of a task is finished, say exactly what is done, what remains, and what blocks further progress. Do not report `verified` unless the delivered slice has been independently verified.

## Commit Rules

Do not commit unless the user explicitly approves commit.

Before a commit candidate:

- verification must pass or be explicitly lightweight for a trivial change
- doc sync must be resolved or marked blocked
- release-gate must pass if release-sensitive work is involved
- unrelated working tree changes must be identified
- commit scope and message must be clear
