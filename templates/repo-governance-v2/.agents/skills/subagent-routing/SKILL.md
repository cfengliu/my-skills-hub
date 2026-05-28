---
name: subagent-routing
description: Use after an explicit plan or task list exists and before considering subagents, to classify tasks as inline, delegable, main-runtime-only, or blocked while preserving repo hard gates.
---

# Subagent Routing

## Purpose

Classify planned tasks before delegation. This skill only performs routing classification.

It does not:

- execute tasks
- edit files
- start subagents
- verify completion
- approve release
- make final judgment

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

## Delegable Criteria

A task may be delegated only when all are true:

- bounded and low risk
- clear goal and acceptance
- explicit read/write/forbidden scope
- independently reviewable
- cheaply verifiable
- not security-critical
- failure is easy to detect and repair

## Never Delegate

- user intent clarification
- planning ownership
- requirement interpretation
- architecture decisions
- security decisions
- auth, permission, payments, billing
- secrets handling
- migration, deployment, release, rollback, production config
- destructive actions
- commit decisions
- final diff review
- final completion judgment
- verifier ownership
- release-gate ownership
- broad cross-module refactors
- unclear tasks

## Authority Boundary

Subagent output is evidence, not authority. Main runtime owns integration, diff review, verification, doc sync judgment, release-gate handling, and final response.
