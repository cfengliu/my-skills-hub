---
name: repository-drift-control
description: "Use when repository documents, AGENTS.md files, SKILL.md files, governance notes, plans, indexes, or workflow instructions need documentation decluttering or gardening: remove repetition and stale residue, consolidate rules, clarify ownership, simplify structure, and rewrite routine prohibitions as direct operating instructions without changing accepted truth."
---

# Repository Drift Control

Make repository documentation smaller, clearer, and easier to maintain while preserving accepted decisions, constraints, risks, evidence, and hard gates.

This skill primarily edits documents. Read code, tests, history, or generated artifacts only when needed to verify what the documents should preserve.

## Desired result

- Each document has one clear purpose and audience.
- Each durable rule or decision has one identifiable owner.
- Secondary documents link to canonical truth instead of copying it.
- Current instructions are prominent; history and residue are compressed or removed.
- Agent-facing instructions state what to do before explaining constraints.
- Readers can find the next action, decision, owner, and verification method quickly.

## Keep or remove

Keep content when it changes:

- behavior or decisions
- scope, priority, ownership, or workflow
- inputs, outputs, dependencies, or lifecycle state
- acceptance criteria or verification
- security, release, destructive-action, or human approval boundaries
- material risk or unresolved questions
- decision rationale or evidence needed for future traceability

Otherwise, remove it or reduce it to a short rationale, evidence link, or historical note.

Age alone does not make content residue. Remove historical material only when it no longer changes current action and has no material evidence or decision-traceability value.

## Workflow

### 1. Define the document's job

State its purpose, audience, expected action, and canonical responsibility in one sentence. Resolve ownership from repository governance and surrounding evidence first; record an open question only when that evidence is insufficient.

### 2. Start with the smallest scope

Read the target document and directly referenced governance. Expand to related documents, code, tests, generated artifacts, or history only when needed to preserve meaning, verify a claim, resolve ownership, identify duplicated rules, or confirm lifecycle state. Keep unrelated documents outside the pass.

### 3. Classify the content

Label material as:

- `decision`: accepted choice that changes behavior
- `rule`: durable instruction or boundary
- `workflow`: ordered actions and decision points
- `verification`: evidence required for completion
- `risk`: consequence that changes execution
- `open question`: unresolved issue with an owner
- `context`: rationale needed to understand a decision
- `residue`: repetition, superseded narration, stale process detail, or historical material that no longer changes action and has no material evidence value

### 4. Apply the 斷捨離 pass

- Reduce long background to conclusion, rationale, and evidence.
- Convert meeting history into accepted decisions and open questions.
- Merge repeated rules into one canonical statement.
- Replace secondary copies with links or short references.
- Collapse scattered instructions into an ordered workflow.
- Convert vague quality claims into observable acceptance criteria.
- Remove empty sections, decorative prose, obsolete warnings, and no-op process steps.
- Move useful historical evidence out of the active workflow when the repository has an archive convention.
- Keep terminology stable across affected documents.

Prefer deletion and consolidation over adding explanatory layers while preserving decision traceability.

### 5. Improve instruction framing

For agent-facing documents:

1. State the expected action first.
2. Rewrite routine prohibitions as positive operating instructions.
3. Pair necessary prohibitions with the correct alternative behavior.
4. Consolidate repeated warnings into one boundary.
5. Use concrete verbs such as `read`, `discover`, `identify`, `compare`, `preserve`, `verify`, `repair`, and `escalate`.

Example:

```text
Before:
Do not assume canonical paths. Do not edit files before checking governance.

After:
Read repository governance first, discover the canonical owners, and then edit the affected files.
```

Keep explicit prohibitions for security, authority, destructive actions, irreversible changes, secrets, and hard gates.

### 6. Resolve document drift

- Follow repository-defined ownership rather than file recency.
- Update the canonical owner first when an accepted decision changed.
- Align secondary documents after the canonical statement is stable.
- Treat generated artifacts as derived evidence, not canonical truth.
- Keep an unresolved normative claim unchanged and in place when accepted truth cannot be established; report the authority conflict, affected documents, and required decision owner.
- Report code or behavior mismatch when discovered; keep implementation repair outside this document pass unless the user asks for it.

### 7. Verify preservation

Compare the result with the original and confirm:

- accepted decisions, constraints, risks, approvals, and hard gates remain intact
- every remaining section changes understanding or action
- repeated normative claims have one owner
- links, paths, indexes, and lifecycle labels in scope are correct
- instruction rewrites preserve the original constraint
- the diff removes more noise than it introduces
- unrelated documents remain outside the change

Run repository-provided Markdown, link, structure, or skill validation for the changed files.

## Output format

When editing files, return:

```md
## Changed
- <structural simplification>
- <rules or decisions consolidated>

## Preserved
- <important decision, constraint, risk, or gate>

## Removed noise
- <categories of repetition, history, residue, or defensive wording>

## Drift found
- <authority, routing, lifecycle, duplication, or behavior mismatch, or None>

## Open questions
- <question and decision owner, or None>

## Verification
- <checks performed>
```

Report categories of removed noise instead of listing every deleted sentence. For a small edit, collapse the report to a few bullets.

## Hard boundaries

- Never expose secrets or weaken security, managed governance, destructive-action controls, irreversible-change controls, or release hard gates.
- Never invent accepted decisions or change product requirements merely to make documents look consistent.
- Never promote generated artifacts or current implementation into canonical truth without repository authority.
- Never silently resolve an authority conflict when accepted truth cannot be established.

## Completion check

- The result is shorter or materially easier to scan.
- Every retained section has an operational, evidentiary, or decision-traceability purpose.
- Canonical ownership is clearer.
- Routine instructions say what to do.
- Verification shows that simplification preserved meaning.
