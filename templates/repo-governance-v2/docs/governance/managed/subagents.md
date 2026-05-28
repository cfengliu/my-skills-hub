<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Subagent Boundaries

This file defines repo-level subagent safety boundaries. It does not define a full orchestration workflow.

## When Subagents May Be Used

Subagents may be used when all are true:

- task is bounded and low risk
- goal and acceptance are clear
- read scope, write scope, and forbidden scope are explicit
- output can be independently reviewed
- verification is practical
- task does not require main-runtime judgment

## When Subagents Must Not Be Used

Do not delegate:

- user-intent clarification
- planning ownership
- requirement interpretation
- architecture decisions
- security decisions
- auth, permission, payments, or billing boundaries
- secrets handling
- migration, deployment, release, rollback, or production config
- destructive actions
- commit decisions
- final diff review
- final completion judgment
- verifier ownership
- release-gate ownership
- broad cross-module refactors
- tasks with unclear scope

## Required Subagent Output

Subagent output must include:

- touched files
- edit summary
- commands run or skipped
- blocked items
- residual risks

## Authority Boundary

Subagent output is evidence, not authority.

Main runtime owns:

- integration
- diff review
- verification judgment
- doc sync judgment
- release-gate handling
- final response

## Parallelism

Parallel subagents may only write to non-overlapping scopes. If write scopes overlap, main runtime must sequence work and inspect diffs between steps.
