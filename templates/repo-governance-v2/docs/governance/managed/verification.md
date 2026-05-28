<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Verification Rules

## When Verification Is Required

Any meaningful change or meaningful completion claim requires verifier or an equivalent independent verification pass.

Trivial changes may use lightweight verification, but the report must say what was checked and why broader verification or doc sync was not required.

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
