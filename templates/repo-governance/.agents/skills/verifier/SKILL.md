---
name: verifier
description: Use when correctness, regressions, repo-truth alignment, or completion claims need independent validation after an external runtime makes a meaningful change.
---

# Verifier

## Overview

Independently validate correctness, regressions, repo-truth alignment, and residual risk after the workflow runtime has already done its own work.

## Input

- changed files
- expected behavior
- available checks
- relevant subagent reports, if external runtime used subagents
- repo truth from `AGENTS.md`, `docs/process.md`, `docs/ops.md`, `docs/prd.md`, and `docs/tdd.md` when those files exist

## Output

Return:

1. checks run
2. pass or fail
3. repo-truth mismatches
4. suspicious areas
5. residual risks
6. first-principles findings
7. recommended next action

When reported back to the user, explicitly mark this as the `verifier` stage and include:

- verification commands
- actual results
- whether repo docs need sync
- whether first-principles review was completed
- residual risks or gaps

## Verifier Report Schema

Return a structured report for meaningful completion claims. The report is evidence for completion eligibility; it is not a runtime self-review and does not approve release-sensitive actions.

```yaml
status: pass | fail | blocked
verification_scope: lightweight | targeted | full | blocked
changed_files:
  - "path"
subagent_inputs:
  - role: "exploration | implementation | review | verification-support"
    summary: "what the subagent checked or changed"
    files: ["path or none"]
    evidence: "commands, pass/fail result, skipped reason, or residual risk summary"
commands:
  - command: "test or check command"
    result: pass | fail | blocked | skipped
    evidence: "short actual result, error, or skip reason"
repo_truth_alignment:
  prd: aligned | needs-sync | not-applicable
  tdd: aligned | needs-sync | not-applicable
  ops: aligned | needs-sync | not-applicable
  requirements: aligned | needs-sync | not-applicable
doc_sync_decision:
  prd:
    status: updated | not-needed | needs-sync | not-applicable
    reason: "explicit reason"
  tdd:
    status: updated | not-needed | needs-sync | not-applicable
    reason: "explicit reason"
  ops:
    status: updated | not-needed | needs-sync | not-applicable
    reason: "explicit reason"
  requirements:
    status: updated | not-needed | needs-sync | not-applicable
    reason: "explicit reason"
first_principles_review:
  status: pass | concerns | blocked
  notes: "invariants, assumptions, redundancy, or blocker summary"
suspicious_areas:
  - "area or none"
residual_risks:
  - "risk or none"
recommended_next_action: report-verified | fix | request-human | run-release-gate
```

For skipped or blocked checks, include the concrete reason instead of implying success.

## Pseudocode

```text
function verifier(change):
  truth = existing_files([
    "AGENTS.md",
    "docs/process.md",
    "docs/ops.md",
    "docs/prd.md",
    "docs/tdd.md",
    "docs/requirements/README.md",
  ])

  checks = select_smallest_meaningful_checks(change, truth)
  results = run(checks)

  doc_sync = compare_against_repo_truth(change, truth)
  first_principles = review_invariants_and_assumptions(change)

  if blocked(results):
    status = "blocked"
  elif failed(results) or mismatched(doc_sync):
    status = "fail"
  else:
    status = "pass"

  return report(
    status=status,
    commands=checks,
    actual_results=results,
    doc_sync=doc_sync,
    first_principles=first_principles,
    residual_risks=find_residual_risks(change, results, doc_sync),
  )
```

## Do

- run the smallest meaningful verification for the touched area
- prefer stable script entrypoints when available
- apply the `first-principles-review` skill to the changed artifact, diff, or verification target when available
- compare the change against repo truth, not just runtime intent
- check whether product, workflow, or ops docs now need sync
- challenge assumptions, invariants, duplicated logic, and unnecessary process or abstraction as part of verification
- call out missing coverage or blocked checks
- include relevant subagent reports as evidence, but independently check repo-truth alignment
- make the verification evidence explicit rather than implicit in the final synthesis

## Do Not

- claim certainty when checks were skipped
- trust runtime self-review or subagent self-review as a substitute for verification
- approve release-sensitive actions
- rewrite implementation unless explicitly requested
- collapse into runtime execution behavior
