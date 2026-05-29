---
name: runtime-adapter
description: Use at task start when an external workflow runtime needs repo governance context, hard gates, local truth boundaries, and relevant repo-specific entrypoints without taking over planning, implementation, subagent orchestration, verification, release approval, artifact paths, branch strategy, or workflow routing.
---

# Runtime Adapter

## Scope Lock

This skill provides repo governance context to the active runtime.

It does not own planning, implementation, subagent orchestration, verification, release approval, artifact paths, branch strategy, or workflow routing.

It may only help the runtime identify relevant governance files, hard gates, local truth boundaries, and repo-specific context entrypoints.

## Policy Sources

- Entrypoint, hard gates, and truth priority: `AGENTS.md`
- Lookup guide: `docs/governance/README.md`
- Task classes and canonical lookup: `docs/governance/managed/process.md`
- Upgrade contract: `docs/governance/MANIFEST.md`

## When to Use

Use at task start when repo-local governance may affect the task and the active runtime needs a small handoff packet.

## Inputs

- user request
- known touched areas, if any
- `AGENTS.md`
- `docs/governance/README.md`
- relevant local governance files, only when needed

## Output

Return a compact packet:

```yaml
task_class: trivial | meaningful | release-sensitive | destructive | unknown
classification_confidence: high | medium | low
relevant_governance_refs:
  - AGENTS.md
  - docs/governance/README.md
hard_gates:
  - gate-or-none
local_context_refs:
  - docs/governance/local/ops.md
  - docs/governance/local/prd.md
  - docs/governance/local/tdd.md
  - docs/governance/local/roadmap.md
  - docs/governance/local/epics/E-xxx-<topic>.md
release_gate_likely: true | false | unknown
verifier_likely_required: true | false | unknown
handoff_note: "Active runtime owns workflow. Repo governance owns hard gates and local truth."
```

Use `unknown` when evidence is insufficient. Do not classify uncertain tasks as trivial.

## Local Context Selection

- Use `ops.md` for commands, environment, release, model policy, and operator notes path.
- Use `prd.md` for product behavior, UI / UX, user-facing flows, and acceptance.
- Use `tdd.md` for technical design, architecture, API, schema, data, and verification strategy.
- Use `roadmap.md` for Now / Next / Later / Done / Parked sequencing.
- Use the relevant epic file only when the task touches a large workstream's child requirement details.

Do not load every local file by default.

## Do Not

- create plans
- implement code
- verify completion
- approve release-sensitive actions
- choose subagent count, roles, or order
- decide artifact paths or branch strategy
- become a workflow router
