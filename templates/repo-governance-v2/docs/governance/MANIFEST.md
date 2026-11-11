<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Repo Governance Template Manifest

This manifest owns the template upgrade and compatibility contract.

## Version

`2.2.5`

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
- `.agents/skills/drift-repair/*`
- `.agents/skills/decision-advisor/*`

These six skill paths are the template-managed control skill set. Other `.agents/skills/*` paths are not implied by this allowlist.

## Never Overwrite During Upgrade

These paths must not be overwritten automatically:

- `docs/governance/local/*`
- `.agents/skills/local/*`
- `.agents/skills/*` except the template-managed control skill set listed in `Replaceable During Upgrade`
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
- `docs/governance/local/security.example.md`
- `docs/governance/local/epics/README.example.md`

These example files are required in the source template package. Initialized consuming repos may omit the `.example.md` files after creating the repo-owned non-example files; template upgrades must not copy examples over initialized local truth.

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
- `.agents/skills/drift-repair/SKILL.md`
- `.agents/skills/decision-advisor/SKILL.md`

Repo-owned extension area:

- `.agents/skills/local/README.md`

## Local Files Expected After Initialization

- `docs/governance/local/ops.md`
- `docs/governance/local/prd.md`
- `docs/governance/local/tdd.md`
- `docs/governance/local/roadmap.md`
- `docs/governance/local/security.md`
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
5. Preserve repo-owned local truth, `.agents/skills/local/*`, and repo-owned expert skills outside the managed control skill set.
6. Preserve legacy repo-owned docs unless a human explicitly migrates them.
7. After replacement, run the compatibility checklist below.

If a path is not clearly allowed, do not overwrite it automatically.

## Compatibility Checklist

Before claiming a repo is using governance v2.2.5, check:

- `AGENTS.md` exists and points to `docs/governance/*`.
- `docs/governance/VERSION` exists and is `2.2.5` or newer.
- `docs/governance/MANIFEST.md` exists and owns the upgrade contract.
- Required managed governance modules exist.
- Required managed control skills exist.
- Required repo local files exist after initialization.
- Security/privacy/PII/auth/audit/retention lookup routes to `docs/governance/local/security.md`.
- Managed files have the managed header.
- Repo local files have the repo-owned warning after initialization.
- Upgrade replace list excludes `docs/governance/local/*`.
- Upgrade replace list excludes `.agents/skills/local/*`.
- Upgrade replace list excludes all non-managed-control `.agents/skills/*` paths.
- Repo-specific expert skills remain present and are not treated as template-owned control skills.
- Roadmap points to epic detail files instead of duplicating full child requirement text.
- Epics do not claim to override PRD, TDD, Security, hard gates, or roadmap priority.
- Empty local sections and placeholders are treated as `unknown`, not accepted truth.

When validating the source template package itself, also check:

- Required local example files exist in the template.
- Local example files have the initialization header.

When validating an initialized consuming repo, do not require `.example.md` files to be vendored.
