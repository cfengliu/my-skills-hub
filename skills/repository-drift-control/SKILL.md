---
name: repository-drift-control
description: "Use when repository documentation or agent instructions need cleanup of repeated rules, stale content, conflicting sources, or unnecessary structure while preserving accepted decisions and required gates."
---

# Repository Drift Control

Edit repository documents so each rule or decision has an identifiable owner and readers can find the current action. Preserve accepted meaning while reducing maintenance burden.

## Keep or remove

Keep a passage when it changes behavior, scope, ownership, priority, execution, verification, risk, or authorization, or preserves rationale and evidence needed to understand a decision. Otherwise remove it or reduce it to a reference.

Age alone does not make content obsolete. Historical evidence may still explain a constraint or decision; retain it or use the repository's archive convention when it is no longer part of the active instructions.

## Editing process

1. Identify the target document's audience, job, and authoritative sources from repository governance. Start with the requested scope and direct references; read code, tests, history, or other documents only to resolve a concrete claim, ownership conflict, or lifecycle state.
2. Compare passages against the keep/remove criterion. Consolidate equivalent rules at their authoritative owner and link secondary documents there. Preserve exceptions that change behavior instead of flattening them into a generic rule.
3. Resolve stale statements using accepted decisions and repository evidence, not file recency. Update the owner first, then affected references, indexes, and status labels. Generated artifacts and current implementation do not independently authorize new requirements.
4. If accepted meaning cannot be established, keep the disputed claim in place and report the conflict, affected sources, and decision needed. Do not silently turn uncertainty into a rule or make sources agree by inventing a decision.
5. Rewrite remaining instructions around concrete actions. Consolidate repeated warnings; preserve explicit prohibitions for secrets, security, irreversible actions, and approval gates. Retain explanatory context only when it changes how the action is performed.
6. Compare the edit with the original for lost constraints, decisions, exceptions, evidence, and gates. Check affected links, paths, Markdown, and repository-specific validation. Leave unrelated documents untouched.

Report code or behavior mismatches discovered during the pass; repair implementation only when the user has authorized that scope. Do not expose secrets, weaken required controls, or change product requirements as a side effect of cleanup.

## Output

For a small edit, return a short change report. For a broader pass, use:

```md
- Changed / removed: <consolidations, stale content, or redundant structure>
- Preserved: <material constraints, exceptions, decisions, and evidence>
- Unresolved drift: <conflict, sources, and needed decision, or none>
- Verification: <checks run, results, and checks skipped with reasons>
```

Report categories of removed noise rather than narrating every deleted sentence.

## Completion check

- Remaining passages affect execution, decisions, or necessary traceability.
- Canonical ownership is identifiable and secondary references resolve correctly.
- The result is shorter or easier to use without losing accepted meaning or hard gates.
