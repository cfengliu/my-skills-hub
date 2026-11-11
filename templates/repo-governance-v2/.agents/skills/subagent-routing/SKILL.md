---
name: subagent-routing
description: Use after an explicit plan or task list exists and before considering subagents, to classify tasks as inline, delegable, main-runtime-only, or blocked while preserving repo hard gates.
---
<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->

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

1. Read `docs/governance/managed/subagents.md` for delegation eligibility, forbidden responsibilities, output requirements, and main-runtime authority.
2. Classify each planned task using that policy and its known read/write scope. Mark unresolved scope or gate conflicts as blocked or main-runtime-only.
3. Return the routing packet without executing tasks or starting agents. Subagent output is evidence; final integration and judgment remain with the main runtime.

## Completion Check

- Every planned task has a classification and reason.
- Delegable tasks have bounded scopes, verification, and escalation conditions.
- The classification preserves managed policy and does not imply authorization to delegate.
