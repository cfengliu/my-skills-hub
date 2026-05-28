<!--
Managed by repo-governance template.
Replaceable during template upgrades.
Do not edit in consuming repos.
Repo-specific specialization belongs in docs/governance/local/*.
-->
# Repo Governance

Repo-governance v2 separates replaceable governance from durable repo truth.

- Managed files are replaceable.
- Local files are durable repo truth.
- Local files may specialize or strengthen governance, but must not weaken hard gates.
- Runtime artifacts are not canonical unless explicitly promoted.

## Start Here

Start with `AGENTS.md`, then load only the minimum relevant files.

Common lookup:

| Need | Read |
|---|---|
| Terms and task classes | `docs/governance/managed/terminology.md` |
| Planning threshold and runtime artifact rules | `docs/governance/managed/process.md` |
| Completion status and report format | `docs/governance/managed/completion.md` |
| Verification requirements | `docs/governance/managed/verification.md` |
| Subagent boundaries | `docs/governance/managed/subagents.md` |
| Release-sensitive gates | `docs/governance/managed/release.md` |
| Doc sync and stale docs | `docs/governance/managed/doc-sync.md` |
| Repo commands and environments | `docs/governance/local/ops.md` |
| Product behavior and acceptance | `docs/governance/local/prd.md` |
| Technical design and boundaries | `docs/governance/local/tdd.md` |
| Priority and next work | `docs/governance/local/roadmap.md` |
| Large workstream requirement details | `docs/governance/local/epics/` |

Do not read every governance file by default.

## Initialization

When copying this template into a repo, initialize local files by copying examples:

```text
docs/governance/local/ops.example.md           -> docs/governance/local/ops.md
docs/governance/local/prd.example.md           -> docs/governance/local/prd.md
docs/governance/local/tdd.example.md           -> docs/governance/local/tdd.md
docs/governance/local/roadmap.example.md       -> docs/governance/local/roadmap.md
docs/governance/local/epics/README.example.md  -> docs/governance/local/epics/README.md
```

Create actual epic files only when a large roadmap item needs child requirement tracking:

```text
docs/governance/local/epics/E-001-<topic>.md
```

After initialization, real `docs/governance/local/*` files are repo-owned and must not be overwritten by template upgrades.

## Local Truth Roles

- `ops.md`: commands, environments, release process, model policy, and operator notes path.
- `prd.md`: accepted product behavior, UI / UX decisions, user-facing flows, and acceptance criteria.
- `tdd.md`: accepted technical design, architecture boundaries, API contracts, data models, and verification strategy.
- `roadmap.md`: priority dashboard for Now / Next / Later / Done / Parked work.
- `epics/`: requirement ledgers for large workstreams.

Roadmap decides sequencing. Epics track details. PRD and TDD own accepted truth.

## Legacy Compatibility

Some repos may still have older repo-owned docs outside `docs/governance/local/`.

Those files are never overwritten by this template. To adopt v2 fully, move active product, technical, priority, and workstream truth into the local files described above, then mark older files stale or archived.

## Compatibility Check

Before claiming a repo is using governance v2.1, check:

- `AGENTS.md` exists and points to `docs/governance/*`.
- `docs/governance/VERSION` exists and is `2.1.0` or newer.
- `docs/governance/MANIFEST.md` exists.
- Required managed files exist.
- Required local example files exist in the template.
- Required repo local files exist after initialization.
- Managed files have the managed header.
- Local example files have the initialization header.
- Repo local files have the repo-owned header.
- `.agents/skills/*/SKILL.md` exist for managed control skills.
- `.agents/skills/local/README.md` exists.
- Upgrade replace list excludes `docs/governance/local/*`.
- Upgrade replace list excludes `.agents/skills/local/*`.
- Roadmap points to epic detail files instead of duplicating full child requirement text.
- Epics do not claim to override PRD, TDD, hard gates, or roadmap priority.
