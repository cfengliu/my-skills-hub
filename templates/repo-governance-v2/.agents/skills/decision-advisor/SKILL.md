---
name: decision-advisor
description: "Use when discussion, notes, roadmap items, epics, PRD drafts, TDD drafts, security drafts, or implementation plans may promote unresolved assumptions into accepted truth and you need to extract human decisions, recommend safe defaults, route specialist skills, or block unsafe promotion."
---
<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->

# Decision Advisor

Decision Advisor is a thin promotion gate. It is not a specialist expert and must not pretend to be one.

Use it to decide whether a discussion can safely become PRD, TDD, security policy, epic detail, or an implementation plan.

## Why Use This

Unresolved assumptions become expensive when they are written as accepted truth. The goal is to prevent the agent from silently deciding product meaning, data policy, permission rules, cost/risk posture, or irreversible technical commitments.

The user should not have to answer raw technical questions. Translate technical options into human-level decisions.

Bad:

```text
Should we create MemberAuditLog or extend AuditLog?
```

Good:

```text
Do member audit events need different retention, visibility, or query policy from existing audit events?
Recommendation: extend existing AuditLog unless the answer is yes.
```

## When To Use

Use before any of these promotions when unresolved assumptions may become accepted truth:

- discussion or meeting notes -> PRD
- discussion or meeting notes -> TDD
- roadmap or epic detail -> PRD, TDD, or Security
- PRD, TDD, or Security -> implementation plan
- implementation plan -> implementation, when the plan contains unresolved product, data, permission, cost, or risk assumptions

Do not use for trivial wording, formatting, typo fixes, refactors with no behavior change, or local implementation choices that are fully reversible and do not affect accepted behavior.

## Accepted Truth Sources

Treat these as accepted truth, in priority order:

1. Explicit user decisions in the current task.
2. Approved PRD, TDD, security, ADR, policy, roadmap, or epic files.
3. Existing repository behavior, tests, schemas, and public contracts.
4. Clearly stated organizational defaults.

Do not treat brainstorming notes, comments, TODOs, speculative language, or unresolved meeting discussion as accepted truth.

## Gate Results

Return exactly one gate result:

| Result | Meaning |
|---|---|
| `go` | No human approval or specialist capability is needed before promotion. |
| `needs-approval` | Human approval is needed, but recommended defaults are available. The user may accept all by saying `照建議`. |
| `needs-specialist` | A specialist capability is needed before a confident recommendation. Do not guess. |
| `blocked` | Required context is missing, contradictory, or too risky to promote. Ask the smallest human-level question that unblocks progress. |

When multiple outcomes apply, choose the highest-severity gate result:

```text
blocked > needs-specialist > needs-approval > go
```

- Use `blocked` when promotion is unsafe because required context is missing or contradictory.
- Use `needs-specialist` when missing expertise blocks a confident recommendation but the decision is well-scoped.
- Use `needs-approval` when safe recommended defaults exist but human approval is required.
- Use `go` only when all decisions are boring defaults or already grounded in accepted truth.

`needs-specialist` means the missing expertise prevents a confident recommendation. `blocked` means the missing information is core context needed to understand the decision, scope, or risk.

## Decision Classes

Classify each decision or assumption:

| Class | Rule |
|---|---|
| `boring-default` | The agent may apply it. It follows existing repo truth, is low risk, reversible, and does not affect user-facing behavior, PII, auth, billing, retention, public contracts, or irreversible schema. |
| `recommended-default` | The agent may recommend it, but the user must approve before it becomes accepted truth. |
| `human-decision` | The user must approve because it affects product meaning, data policy, permissions, risk, cost, scope, public behavior, or irreversible design. |
| `blocked-unknown` | The agent cannot safely recommend because key context is missing or conflicting. |

## Capability Tags

Tag each non-boring decision so specialist skills can be selected or searched.

Use the smallest accurate set:

```text
product-risk, ux, privacy, pii, audit, retention, security, auth, permission,
data-model, schema, migration, api-contract, webhook, idempotency,
reliability, failure-mode, infra-cost, provider, billing, compliance,
release, destructive-change
```

If no accurate tag exists, add a short kebab-case tag and explain why.

## Human Question Rule

Human-facing questions must avoid implementation details unless the implementation detail is itself the business decision.

Bad:

```text
Should we use soft delete or hard delete?
```

Good:

```text
Should deleted records remain recoverable and auditable after users no longer see them?
Recommendation: keep deleted records recoverable unless policy requires permanent deletion.
```

## Specialist Routing

Decision Advisor may use available specialist skills when the environment exposes them. Specialist output is advisory; Decision Advisor remains responsible for the final gate result.

Selection rules:

- `privacy`, `pii`, `audit`, `retention` -> privacy or compliance specialist
- `security`, `auth`, `permission` -> security specialist
- `data-model`, `schema`, `migration` -> data or migration specialist
- `api-contract`, `webhook`, `idempotency` -> API or reliability specialist
- `infra-cost`, `provider`, `reliability`, `failure-mode` -> infra, cost, or failure specialist
- `product-risk`, `ux` -> product or UX specialist
- `billing`, `compliance`, `release`, `destructive-change` -> domain specialist or human approval

Do not invent a specialist result when no suitable skill is available.

Do not delay the whole report if only part of the decision set requires specialist review. Report safe parts separately and mark only the affected items as `needs-specialist`.

## Missing Specialist Handling

When a needed specialist skill is unavailable:

1. Mark the item as `needs-specialist` unless a conservative recommended default is still safe.
2. State the missing capability.
3. Provide search keywords for `find-skills` or skills.sh.
4. Do not install external skills without user approval.
5. If the user approves adding a specialist skill, install or copy it into the target repo's `.agents/skills/` directory by default.
6. Do not install specialist skills into user-global directories unless the user explicitly asks for global installation.
7. After installation, rerun Decision Advisor or the affected decision review.

Downloaded or added specialist skills are repo assets by default. They should travel with the repo and be reviewed like other repo-local agent behavior.

Output missing capability like this:

```md
### Missing specialist capability

- Decision:
- Needed capability:
- Why needed:
- Suggested search keywords:
- Gate impact: needs-specialist | blocked
```

## External Specialist Output Contract

Ask external specialist skills to return this format. If they do not, normalize their output into this shape before using it.

```md
## Specialist Decision Review

### Skill

<skill-name>

### Applies to

<decision ids or topics>

### Recommendation

<recommended default>

### Human-facing question

<non-technical question the user can answer>

### Why approval is needed

<business, product, risk, or governance reason>

### Risk if wrong

<concrete consequence>

### Reversibility

easy | moderate | hard | irreversible

### Blocks

PRD | TDD | plan | implementation | release

### Confidence

high | medium | low

### Change recommendation if

<condition that would change the recommendation>
```

## Required Output

Return this report:

````md
# Decision Advisor Report

## Gate result

go | needs-approval | needs-specialist | blocked

## Summary

- Human decisions:
- Recommended defaults:
- Boring defaults:
- Blocked unknowns:
- Missing specialist capabilities:

## Recommended decision set

The user can reply `照建議` to accept only the recommended defaults listed here. This does not approve blocked items or items requiring missing specialist review.

```text
<decision>: <recommended default>
```

## Decisions requiring approval

| ID | Decision | Tags | Recommendation | Change recommendation if | Human-facing question | Why approval is needed | Blocks |
|---|---|---|---|---|---|---|---|

## Boring defaults applied

| Default | Reason | Reversible? |
|---|---|---|

## Safe assumptions

| Assumption | Why safe | Record in |
|---|---|---|

## Missing specialist capabilities

| Decision | Needed capability | Suggested search keywords | Gate impact |
|---|---|---|---|

## Blocked unknowns

| Unknown | Why blocked | Smallest unblock question |
|---|---|---|

## Promotion instruction

<Say exactly whether PRD, TDD, epic, plan, or implementation may proceed.>
````

Omit empty tables only when they would add no information. Keep the `Gate result`, `Summary`, and `Promotion instruction`.

## Process

1. Identify the target artifact: PRD, TDD, epic, plan, implementation, or release. If it is not explicit, infer the nearest likely promotion target. If multiple targets are plausible and the risk differs by target, return `blocked` and ask which artifact is being promoted.
2. Summarize the proposed promotion in one sentence.
3. List assumptions that would become accepted truth.
4. Classify each assumption or decision.
5. Add capability tags to every non-boring item.
6. Route to available specialist skills when useful.
7. If a needed specialist is missing, produce a missing specialist report instead of guessing.
8. Convert technical options into human-facing questions.
9. Produce a recommended decision set only for items safe to accept together.
10. Give a promotion instruction that says what can proceed and what must wait.

## Hard Rules

- Do not treat a recommendation as accepted truth.
- Do not ask the user to decide boring defaults.
- Do not hide high-risk choices inside implementation plans.
- Do not use raw technical options as the main user-facing question.
- Do not install skills from the network without user approval.
- Mark PII, auth, permission, billing, retention, public API, destructive, release-sensitive, or irreversible migration choices as at least `needs-approval`.
- If context is missing and the wrong choice would cause expensive rework or risk, return `blocked`.

## Completion Check

Before finishing, verify:

- Every non-boring decision has tags.
- Every approval item has a human-facing question.
- Every recommendation says what would change it.
- The report clearly says whether the user can reply `照建議`.
- The promotion instruction does not allow unresolved assumptions to become accepted truth.
