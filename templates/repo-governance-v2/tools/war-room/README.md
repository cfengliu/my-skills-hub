# War Room Dashboard

Local read-only dashboard for `repo-governance-v2`.

## Source Of Truth

- `docs/governance/local/roadmap.md` owns priority and sequencing.
- `docs/governance/local/epics/*.md` owns execution status, evidence, gaps, and next steps.
- PRD and TDD are not parsed.

The dashboard stores no state and writes no governance files.

## Run

From a repo initialized with `repo-governance-v2`:

```bash
node tools/war-room/server.mjs
```

Then open:

```text
http://127.0.0.1:4767
```

`tools/war-room/server.mjs` resolves the default repo root as `../..` from the server file, because installed templates place it at `tools/war-room/server.mjs`.

To point at another repo root:

```bash
node tools/war-room/server.mjs /absolute/path/to/repo
```

## Drift Checks

- Roadmap reference points to no known epic, delivery slice, or requirement.
- Roadmap Done Recently contains an item whose referenced status is not done.
- Requirement is done but has no existing evidence.
- Delivery slice is done but covered requirements are not all done.

The dashboard reports drift; it does not repair drift.
