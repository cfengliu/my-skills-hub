<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Verification And Completion Rules

This file owns verification requirements, completion taxonomy, completion reports, and commit rules.

Doc sync decisions must follow `doc-sync.md`. Release-sensitive actions still require `release.md` and release-gate handling.

## When Verification Is Required

Any meaningful change or meaningful completion claim requires verifier or an equivalent independent verification pass.

Trivial changes may use lightweight verification, but the report must say what was checked and why broader verification or doc sync was not required.

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

## Independent Verification Standard

Verification must evaluate:

- final diff
- expected behavior or acceptance criteria
- relevant repo truth
- commands run and observed results
- skipped checks and reasons
- doc sync requirements
- residual risks

Do not rely on implementer self-review, subagent self-review, or successful command exit alone.

## Evidence Requirements

For every check, record:

- command or inspection performed
- actual result
- pass / fail / skipped / blocked
- reason for skipped or blocked checks

## False-success Checks

Verifier should challenge:

- command passes but validates the wrong invariant
- schema exists but is not used
- report exists but is empty or misleading
- tests pass because the changed behavior is not covered
- docs say a workflow works but paths or commands disagree
- runtime artifacts are treated as canonical without promotion
- local files contain placeholders or empty sections that are mistaken for accepted truth

## Expected Checks

Prefer the smallest meaningful checks for the touched area. Use commands from `docs/governance/local/ops.md` when present:

- tests for changed behavior
- typecheck when typed code changed
- lint when style or static checks are part of repo policy
- build when packaging or runtime integration changed
- browser / e2e checks for UI or full-flow behavior
- release-gate for release-sensitive actions

## Skipped-check Wording

Skipped checks must include the concrete reason:

```text
Skipped: <check> because <reason>. Residual risk: <risk>.
```

Do not imply certainty when checks were skipped.

## Commit Rules

Do not commit unless the user explicitly approves commit.

Before a commit candidate:

- verification must pass or be explicitly lightweight for a trivial change
- doc sync must be resolved or marked blocked
- release-gate must pass if release-sensitive work is involved
- unrelated working tree changes must be identified
- commit scope and message must be clear
