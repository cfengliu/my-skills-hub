<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Terminology

## `trivial change`

A change that only affects typo fixes, formatting, non-behavioral comments, wording, or local documentation phrasing, and does not change runtime behavior, product acceptance, tests, ops rules, schemas, configuration, APIs, dependency behavior, release paths, or durable requirements.

## `meaningful change`

Any substantive change to code, config, schema, dependency behavior, public behavior, UI structure, interaction flow, API contract, test expectation, deployment path, durable docs, ops rules, or requirements. If uncertain, treat the change as meaningful.

## `accepted change`

A change approved by the user or maintainer, merged, or explicitly promoted into durable repo truth.

## `release-sensitive action`

Deploy, release, rollout, migration, backup, restore, rollback, production-like config, CI/CD release path, auth, identity, payments, billing, secrets, production data, or environment-changing action.

## `destructive action`

An action that may delete, overwrite, or irreversibly modify data, schema, config, branch, worktree, environment, or production-like state.

## `canonical source`

A durable repo truth source explicitly recognized by `AGENTS.md`, `docs/governance/*`, or local PRD, TDD, roadmap, epics, and ops files.

## `runtime artifact`

A generated or temporary spec, plan, scratch note, review note, execution artifact, or runtime-owned file. Runtime artifacts are not canonical unless explicitly promoted.

## `human checkpoint`

A gate that requires explicit human approval before continuing, including commit approval, release-sensitive actions, destructive actions, secrets, production data, branch deletion, and worktree deletion.
