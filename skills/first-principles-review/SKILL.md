---
name: first-principles-review
description: "Use when reviewing a document, proposal, design, code module, or diff to challenge its assumptions, invariants, evidence of correctness, or unnecessary complexity."
---

# First Principles Review

Assess whether an artifact achieves its intended job and which parts are necessary. Ground findings in consequences and evidence so the review changes decisions rather than expressing taste.

## Review

1. Identify the intended outcome, who depends on it, and the constraints that actually bind it. Distinguish accepted requirements from preferences, habits, and unproven assumptions.
2. Derive the minimum inputs, outputs, invariants, dependencies, and failure conditions needed for that outcome. Use this model to judge the existing design rather than assuming its structure is necessary.
3. Trace the claims that matter to their enforcement:
   - For documents, check whether definitions, premises, and conclusions support one another and whether rules change an action or decision.
   - For code, trace data flow, state transitions, ownership, and callers to find where guarantees are enforced or bypassed.
   - For validation, inspect what the check actually proves. File existence, schema declarations, exit code zero, and generated output alone do not establish use, enforcement, or correctness.
4. Test simpler alternatives against the same constraints. Flag duplicated responsibility, dead paths, pass-through layers, or abstractions only when removing them preserves required behavior or exposes a justified tradeoff. Repetition may be intentional; explain its actual cost before recommending removal.
5. Rank findings by their consequences for users, correctness, risk, and maintenance. For each finding, explain the failed premise or mechanism, supporting evidence, and smallest corrective direction. Omit cosmetic preferences unless they hide a substantive problem.

Missing evidence is an uncertainty, not proof of failure. State what would resolve it; call it a blocker only when the requested decision depends on that evidence. Separate observed facts, assumptions, and open questions in claims that affect the verdict.

Review findings do not authorize implementation. If the user also requests fixes, apply the supported changes within that scope.

## Output

Lead with the highest-impact findings. Use this structure for each actionable finding:

```md
- Finding: <problem and affected location>
- Mechanism / consequence: <why it fails and what depends on it>
- Evidence: <observed behavior or source; label assumptions>
- Correction: <smallest justified change or verification needed>
```

State the intended job and binding constraints when needed to understand the findings. Report no substantive findings when warranted; do not invent issues to fill a template. For a readiness decision, give a scoped verdict, unresolved blockers, and the evidence needed to close them. Distinguish checks performed from checks proposed.

## Completion check

- Each finding has a causal explanation and locatable evidence or an explicit evidence gap.
- Recommended simplifications still satisfy the binding constraints and account for affected callers.
- The verdict covers only the inspected scope and what the checks establish.
