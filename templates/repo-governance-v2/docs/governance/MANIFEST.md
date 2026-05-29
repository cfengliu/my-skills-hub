<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Repo Governance Template Manifest

This manifest owns the template upgrade and compatibility contract.

## Version

`2.2.0`

## Replaceable During Upgrade

Only these paths may be replaced automatically during a template upgrade:

- `AGENTS.md`
- `docs/governance/VERSION`
- `docs/governance/MANIFEST.md`
- `docs/governance/README.md`
- `docs/governance/managed/*`
- `.agents/skills/verifier/*`
- `.agents/skills/release-gate/*`
- `.agents/skills/subagent-routing/*`
- `.agents/skills/runtime-adapter/*`

## Never Overwrite During Upgrade

These paths must not be overwritten automatically:

- `docs/governance/local/*`
- `.agents/skills/local/*`
- source code
- tests
- secrets
- local operator notes

Legacy repo-owned docs are also denied unless a human explicitly migrates them:

- `docs/prd.md`
- `docs/tdd.md`
- `docs/requirements/*`

## Initialization Only

These files are copied only when initializing a repo. They are not repo-owned truth until copied to the matching non-example path:

- `docs/governance/local/ops.example.md`
- `docs/governance/local/prd.example.md`
- `docs/governance/local/tdd.example.md`
- `docs/governance/local/roadmap.example.md`
- `docs/governance/local/epics/README.example.md`

## Required Template Files

Managed governance modules:

- `docs/governance/managed/process.md`
- `docs/governance/managed/verification.md`
- `docs/governance/managed/release.md`
- `docs/governance/managed/subagents.md`
- `docs/governance/managed/doc-sync.md`

Managed control skills:

- `.agents/skills/runtime-adapter/SKILL.md`
- `.agents/skills/subagent-routing/SKILL.md`
- `.agents/skills/verifier/SKILL.md`
- `.agents/skills/release-gate/SKILL.md`

Repo-owned extension area:

- `.agents/skills/local/README.md`

## Local Files Expected After Initialization

- `docs/governance/local/ops.md`
- `docs/governance/local/prd.md`
- `docs/governance/local/tdd.md`
- `docs/governance/local/roadmap.md`
- `docs/governance/local/epics/README.md`

Actual epic files are created by the consuming repo when needed:

```text
docs/governance/local/epics/E-001-<topic>.md
```

## Header Requirements

Managed files must include the managed header:

```text
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
```

Initialization examples must include the example header and repo-owned target warning:

```text
Example file for repo initialization.
Copy to the same path without .example in the filename.
Do not overwrite the repo-owned target file during upgrades.
```

Initialized repo-owned local files must retain a repo-owned warning equivalent to:

```text
Repo-owned file after initialization.
Do not overwrite during template upgrades.
```

## Upgrade Procedure

Before applying a template upgrade:

1. Read this manifest.
2. Build the candidate replace set.
3. Remove every path matching the never-overwrite list.
4. Treat initialization examples as template files only; do not copy them over initialized local files.
5. Preserve repo-owned local truth and local skills.
6. Preserve legacy repo-owned docs unless a human explicitly migrates them.
7. After replacement, run the compatibility checklist below.

If a path is not clearly allowed, do not overwrite it automatically.

## Compatibility Checklist

Before claiming a repo is using governance v2.2, check:

- `AGENTS.md` exists and points to `docs/governance/*`.
- `docs/governance/VERSION` exists and is `2.2.0` or newer.
- `docs/governance/MANIFEST.md` exists and owns the upgrade contract.
- Required managed governance modules exist.
- Required managed control skills exist.
- Required local example files exist in the template.
- Required repo local files exist after initialization.
- Managed files have the managed header.
- Local example files have the initialization header.
- Repo local files have the repo-owned warning after initialization.
- Upgrade replace list excludes `docs/governance/local/*`.
- Upgrade replace list excludes `.agents/skills/local/*`.
- Roadmap points to epic detail files instead of duplicating full child requirement text.
- Epics do not claim to override PRD, TDD, hard gates, or roadmap priority.
- Empty local sections and placeholders are treated as `unknown`, not accepted truth.
