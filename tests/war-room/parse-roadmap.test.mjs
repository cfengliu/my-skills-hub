import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseRoadmapMarkdown } from "../../templates/repo-governance-v2/tools/war-room/lib/parse-roadmap.mjs";

test("parseRoadmapMarkdown extracts roadmap lanes and item refs", () => {
  const markdown = `# Roadmap

## Current Focus

- Ship governance dashboard.

## Now

| ID | Work | Why Now | Detail Ref |
|---|---|---|---|
| \`E-001A\` | War room MVP | Needed for review | \`epics/E-001-war-room.md\` |

## Next

| ID | Work | Trigger | Detail Ref |
|---|---|---|---|
| \`E-001B\` | Polish states | MVP accepted | \`epics/E-001-war-room.md\` |

## Later

| ID | Work | Why Later | Detail Ref |
|---|---|---|---|
| \`E-002A\` | Export report | Not needed for MVP | \`epics/E-002-export.md\` |

## Done Recently

| ID | Completed Work | Evidence Ref |
|---|---|---|
| \`E-000A\` | Governance v2 examples | \`docs/governance/local/roadmap.md\` |

## Cancelled Or Parked

| ID | Work | Reason |
|---|---|---|
| \`E-003A\` | Cloud dashboard | Local-only MVP |`;

  const result = parseRoadmapMarkdown(markdown, "docs/governance/local/roadmap.md");

  assert.equal(result.filePath, "docs/governance/local/roadmap.md");
  assert.deepEqual(Object.keys(result.lanes), [
    "now",
    "next",
    "later",
    "doneRecently",
    "cancelledOrParked",
  ]);
  assert.equal(result.lanes.now[0].id, "E-001A");
  assert.equal(result.lanes.now[0].work, "War room MVP");
  assert.equal(result.lanes.now[0].note, "Needed for review");
  assert.equal(result.lanes.now[0].detailRef, "epics/E-001-war-room.md");
  assert.equal(result.lanes.now[0].sourceRef, "docs/governance/local/roadmap.md#now");
  assert.equal(result.lanes.doneRecently[0].evidenceRef, "docs/governance/local/roadmap.md");
  assert.equal(result.lanes.cancelledOrParked[0].note, "Local-only MVP");
});

test("parseRoadmapMarkdown ignores placeholder rows", () => {
  const markdown = `# Roadmap

## Now

| ID | Work | Why Now | Detail Ref |
|---|---|---|---|
| \`E-001A\` | Real work | Useful | \`epics/E-001-real.md\` |
| \`<id>\` | \`<work>\` | \`<reason>\` | \`<path>\` |
| - | - | - | - |`;

  const result = parseRoadmapMarkdown(markdown, "docs/governance/local/roadmap.md");

  assert.equal(result.lanes.now.length, 1);
  assert.equal(result.lanes.now[0].id, "E-001A");
});

test("parseRoadmapMarkdown ignores canonical example placeholder items", () => {
  const filePath = "templates/repo-governance-v2/docs/governance/local/roadmap.example.md";
  const markdown = readFileSync(filePath, "utf8");

  const result = parseRoadmapMarkdown(markdown, filePath);

  assert.deepEqual(result.lanes, {
    now: [],
    next: [],
    later: [],
    doneRecently: [],
    cancelledOrParked: [],
  });
});

test("parseRoadmapMarkdown preserves escaped pipes inside table cells", () => {
  const markdown = `# Roadmap

## Now

| ID | Work | Why Now | Detail Ref |
|---|---|---|---|
| \`E-001A\` | Support A \\| B labels | Needed for review | \`epics/E-001-war-room.md\` |`;

  const result = parseRoadmapMarkdown(markdown, "docs/governance/local/roadmap.md");

  assert.equal(result.lanes.now.length, 1);
  assert.equal(result.lanes.now[0].id, "E-001A");
  assert.equal(result.lanes.now[0].work, "Support A | B labels");
  assert.equal(result.lanes.now[0].note, "Needed for review");
  assert.equal(result.lanes.now[0].detailRef, "epics/E-001-war-room.md");
});
