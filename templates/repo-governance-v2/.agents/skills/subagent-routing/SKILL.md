---
name: subagent-routing
description: Use after an explicit plan or task list exists and before considering subagents, to classify tasks as inline, delegable, main-runtime-only, or blocked while preserving repo hard gates.
---

# Subagent Routing

## Purpose

Classify planned tasks before delegation. This skill only performs routing classification.

It does not execute tasks, edit files, start subagents, verify completion, approve release, or make final judgment.

## Policy Sources

- Subagent safety boundary: `docs/governance/managed/subagents.md`
- Hard gates and truth priority: `AGENTS.md`
- Verification and completion ownership: `docs/governance/managed/verification.md`
- Release-sensitive boundaries: `docs/governance/managed/release.md`

## Inputs

- user request
- explicit plan or task list
- known read/write scopes
- `AGENTS.md`
- `docs/governance/managed/subagents.md`
- relevant local governance refs

## Output

```yaml
subagent_routing_decision:
  subagents: yes | no
  main_runtime_only:
    - task: "task or none"
      reason: "why main runtime must own it"
  delegable_tasks:
    - task: "task or none"
      read_scope: ["path or scope"]
      write_scope: ["path or scope"]
      forbidden_scope: ["path or scope"]
      verification_required: "specific check or review"
      escalation_trigger: "when the subagent must stop and report blocked"
  inline_tasks:
    - task: "task or none"
      reason: "small, cheaper, or safer inline"
  blocked_or_unclear:
    - task: "task or none"
      reason: "missing requirement, unsafe scope, or conflict"
```

## Decision Procedure

1. Load `docs/governance/managed/subagents.md`.
2. Classify each planned task as `main-runtime-only`, `delegable`, `inline`, or `blocked_or_unclear`.
3. Delegate only bounded, low-risk, explicitly scoped tasks whose output can be independently reviewed and verified.
4. Keep planning, requirement interpretation, architecture, security, release, destructive actions, verifier ownership, release-gate ownership, final diff review, and final judgment in the main runtime.
5. If scope is unclear or a hard gate may be crossed, mark the task blocked or main-runtime-only.

## Authority Boundary

Subagent output is evidence, not authority. Main runtime owns integration, diff review, verification, doc sync judgment, release-gate handling, and final response.
