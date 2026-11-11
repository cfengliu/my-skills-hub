---
name: runtime-adapter
description: "Use when an external workflow runtime needs a compact handoff of repo governance, hard gates, local truth references, and relevant expert skills."
---
<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->

# Runtime Adapter

## Purpose

Provide governance context when the active runtime needs a handoff packet. The active runtime retains planning, execution, orchestration, verification, release approval, artifact paths, and branch decisions.

## Policy Sources

- Entrypoint, hard gates, and domain-based source lookup: `AGENTS.md`
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
- repo-owned expert skill frontmatter from `.agents/skills/*/SKILL.md`, excluding the managed control skill set

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
  - docs/governance/local/security.md
  - docs/governance/local/epics/E-xxx-<topic>.md
repo_expert_skills:
  - skill: skill-name
    path: .agents/skills/skill-name/SKILL.md
    selected: true | false
    reason: "why this expert skill applies or was not selected"
release_gate_likely: true | false | unknown
verifier_likely_required: true | false | unknown
handoff_note: "Active runtime owns workflow. Repo governance owns hard gates and local truth."
```

Use `unknown` when evidence is insufficient. Do not classify uncertain tasks as trivial.

## Repo Expert Skill Discovery

At task start, inspect available repo-owned expert skill frontmatter under `.agents/skills/*/SKILL.md`.

Exclude the template-managed control skill set:

- `runtime-adapter`
- `subagent-routing`
- `verifier`
- `release-gate`
- `drift-repair`
- `decision-advisor`

Treat remaining skills as repo-owned expert skills. They remain active even when they are not under `.agents/skills/local/*`.

Select only expert skills whose `description` matches the task. Return selected and intentionally skipped expert skills in `repo_expert_skills` so the active runtime can see which domain invariants were considered.

## Context Selection And Completion

Use the domain lookup in `AGENTS.md` to select local files. Load only files relevant to the task and selected expert skill bodies when their invariants are needed.

Before returning, confirm references exist or are marked unknown, expert skills were selected from their descriptions, and the packet supplies context without taking over workflow or granting approvals.
