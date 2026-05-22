---
name: runtime-adapter
description: Use at task start when an external workflow runtime needs a thin repo-local selector that chooses matching expert skills and injects canonical repo truth without taking over planning, implementation, review, or release decisions.
---

# Runtime Adapter

## Overview

Select the smallest relevant set of repo-local expert skills and canonical repo-truth references for the external workflow runtime. This skill is a selector and context injector only.

## When to Use

- at task start before the external workflow runtime begins its own flow
- when repo-local expert skills may apply
- when the runtime needs stable references to repo truth

Do not use this skill for planning, coding, verification, or release approval.

## Inputs

- user request
- touched area if already known
- `docs/process.md`
- `docs/ops.md`
- `docs/prd.md`, if present
- `docs/tdd.md`, if present
- `docs/requirements/README.md`, if present
- available repo-local expert skills, if any exist

## Output

Return:

1. selected repo-local expert skills, or `none`
2. canonical repo-truth references to load
3. a short handoff note for the external runtime
4. whether `release-gate` is likely required later
5. if the external runtime already uses subagents, a pointer to the subagent boundaries in `AGENTS.md` and `docs/process.md`

## Handoff Packet Schema

Return the handoff as a small structured packet plus any short human note that is useful. The packet standardizes repo-truth injection for the external runtime; it does not give `runtime-adapter` ownership of planning, implementation, verification, branch/worktree strategy, or runtime artifact paths.

```yaml
task_class: trivial | meaningful | release-sensitive | unknown
classification_confidence: high | medium | low
touching_areas:
  - docs | ops | frontend | backend | data | tests | infrastructure | unknown
required_expert_skills:
  - skill-name-or-none
canonical_refs:
  - AGENTS.md
  - docs/process.md
  - docs/ops.md
  - docs/prd.md
  - docs/tdd.md
  - docs/requirements/README.md
planning:
  required: true | false | unknown
  reason: "short reason tied to docs/process.md"
verification:
  verifier_required: true | false | unknown
  reason: "short reason tied to docs/process.md"
release:
  gate_possible: true | false | unknown
  reason: "short release-sensitive signal or explicit non-release reason"
doc_sync_watch:
  prd: possible | not-applicable | unknown
  tdd: possible | not-applicable | unknown
  ops: possible | not-applicable | unknown
  requirements: possible | not-applicable | unknown
handoff_note: "External runtime owns workflow. Local tail controls remain verifier and release-gate."
```

Use `unknown` when evidence is insufficient. Do not over-classify uncertain tasks as trivial.

## Expert Selection Rules

- Start from the user request and likely touched files.
- Inspect `.agents/skills/*/SKILL.md` if repo-local expert skills exist.
- Exclude the three control skills from expert selection: `runtime-adapter`, `release-gate`, `verifier`.
- Select the minimal set whose descriptions directly match the touched domain.
- If no expert skill clearly applies, return `none`.
- Do not load all experts just because the task is broad; prefer the smallest set that covers the touched surface.

## Pseudocode

```text
function runtime_adapter(task):
  truth_refs = existing_files([
    "AGENTS.md",
    "docs/process.md",
    "docs/ops.md",
    "docs/prd.md",
    "docs/tdd.md",
    "docs/requirements/README.md",
  ])

  experts = discover_repo_local_expert_skills(".agents/skills/*/SKILL.md")
    .exclude(["runtime-adapter", "release-gate", "verifier"])
    .filter(description_matches(task))
    .minimal()

  release_hint = detect_release_sensitive_intent(task)

  return handoff(
    selected_experts=experts or "none",
    truth_refs=truth_refs,
    release_hint=release_hint,
    note="External runtime owns workflow. Local tail controls remain verifier and release-gate.",
  )
```

## Do

- keep expert selection minimal
- inject canonical repo truth before the runtime starts
- explicitly say when no expert skill applies
- flag release-sensitive tasks early so the runtime knows `release-gate` may be required later
- when subagents are already part of the external runtime flow, point to `AGENTS.md` and `docs/process.md` boundaries without recommending dispatch strategy or roles

## Do Not

- decide runtime working-artifact paths
- create plans
- implement code
- perform verification
- approve release actions
- re-own subagent orchestration
- recommend subagent dispatch strategy, count, ordering, or roles
- load every expert skill by default
