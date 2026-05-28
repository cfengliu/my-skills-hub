<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Repo Governance Template Manifest

## Version

`2.1.0`

## Replaceable During Upgrade

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

- `docs/governance/local/*`
- `.agents/skills/local/*`
- source code
- secrets
- local operator notes

Legacy repo-owned docs are also denied unless a human explicitly migrates them:

- `docs/prd.md`
- `docs/tdd.md`
- `docs/requirements/*`

## Initialization Only

- `docs/governance/local/*.example.md`
- `docs/governance/local/epics/README.example.md`

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

## Upgrade Rule

Use the replace list as the allowlist and the never-overwrite list as the denylist. If a path is not clearly allowed, do not overwrite it automatically.
