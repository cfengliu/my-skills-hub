# War Room Dashboard Design

## Status

Approved on 2026-06-01.

## Problem Brief

We need to help repo maintainers, during planning or review, understand roadmap and epic progress quickly, so they can see current work, completed work, and roadmap-epic drift without manually reading every governance file.

## Users

- Primary user: repo maintainer.
- Secondary user: AI agent working inside the repo.

## Success Criteria

- Dashboard reads only roadmap and epic files.
- Dashboard shows Now, Next, Later, Done Recently, and Parked or Cancelled roadmap lanes.
- Dashboard shows epic delivery slice and requirement progress.
- Dashboard shows completed work.
- Dashboard shows drift warnings with source file references.
- Dashboard never writes roadmap, epic, PRD, or TDD files.

## Non-Goals

- Do not parse PRD or TDD content.
- Do not edit markdown from the dashboard.
- Do not add a database.
- Do not add auth, deployment, or cloud hosting.
- Do not package this as a standalone npm package or Codex plugin yet.

## Source Of Truth

- `docs/governance/local/roadmap.md` owns priority and sequencing.
- `docs/governance/local/epics/*.md` owns execution status, evidence, gaps, and next steps.
- PRD and TDD remain pure documents and are not dashboard inputs.

The dashboard is a read-only projection. It does not own state.

## Placement

Add the dashboard as a bundled local tool inside the `repo-governance-v2` template:

```text
templates/repo-governance-v2/tools/war-room/
```

This keeps the parser, dashboard, and governance-v2 roadmap/epic schema versioned together.

## Technology Choice

Use zero-framework Node.js with static HTML rendering.

```text
templates/repo-governance-v2/tools/war-room/
├── server.mjs
├── parse-roadmap.mjs
├── parse-epics.mjs
├── detect-drift.mjs
├── render-html.mjs
└── README.md
```

No React, Vite, bundler, database, or runtime framework is needed for the MVP.

## Dashboard Sections

### Top Summary

- Now count.
- Next count.
- Done Recently count.
- Active epic count.
- Drift warning count.

### Roadmap Lanes

- Now.
- Next.
- Later.
- Done Recently.
- Cancelled or Parked.

Each roadmap item should show its ID, work label, reason or trigger, and detail reference.

### Epic Progress

For each epic:

- Epic status.
- Delivery slice count.
- Requirement done count and total count.
- Blocked or rejected requirement count.
- Missing evidence count.

### Completed Work

Show completed work from:

- Roadmap `Done Recently`.
- Epic requirements with `delivery status: done`.

Each row should include an evidence or source reference when available.

### Drift Warnings

MVP drift checks:

- Roadmap detail reference points to a missing epic file.
- Roadmap item references a missing delivery slice or requirement.
- Roadmap Done Recently contains an item whose epic, slice, or requirement is not done.
- Requirement has `delivery status: done` but no existing evidence.
- Delivery slice has `delivery status: done` but covered requirements are not all done.

The dashboard reports drift. It does not repair drift.

## Module Boundaries

| Module | Owns | Does Not Own |
|---|---|---|
| `parse-roadmap.mjs` | Roadmap lanes and item references | Epic requirement details |
| `parse-epics.mjs` | Epic, slice, requirement, evidence, gap, and next-step extraction | Roadmap priority |
| `detect-drift.mjs` | Consistency checks between parsed roadmap and epics | Markdown repair |
| `render-html.mjs` | Static HTML projection | Source-of-truth state |
| `server.mjs` | Local HTTP server and refresh behavior | Data ownership |

## Runtime Behavior

Run from a repo that contains initialized governance files:

```bash
node tools/war-room/server.mjs
```

The server should:

- Locate `docs/governance/local/roadmap.md`.
- Locate `docs/governance/local/epics/*.md`.
- Parse files on request or refresh.
- Render a local dashboard URL.
- Fail with a clear message if required files are missing.

## Drift Position

The dashboard itself cannot drift because it stores no progress state.

The only drift it should expose is:

```text
roadmap.md ↔ epics/*.md
```

PRD and TDD sync are out of scope for this dashboard.

## MVP Completion Definition

MVP is complete when:

- `templates/repo-governance-v2/tools/war-room/` exists.
- `node tools/war-room/server.mjs` starts a local dashboard after template installation.
- Dashboard renders roadmap lanes, epic progress, completed work, and drift warnings.
- Warnings include source file references.
- No dashboard path writes to governance markdown files.
- `INDEX.md` documents the new template asset.

## Future Triggers

Only consider extracting this into a standalone package or plugin after:

- At least three repos use the dashboard.
- The roadmap and epic schema has stayed stable.
- Cross-repo installation and versioning become a real maintenance problem.
