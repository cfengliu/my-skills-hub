# War Room Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-framework local dashboard bundled in `repo-governance-v2` that reads roadmap and epic markdown files, renders a war-room view, and reports roadmap-epic drift without writing source documents.

**Architecture:** The tool is a read-only Node.js app split into parsers, drift detection, static HTML rendering, and a tiny HTTP server. `roadmap.md` owns sequencing, `epics/*.md` owns execution detail, and the dashboard owns only projection.

**Tech Stack:** Node.js built-ins only: `node:fs/promises`, `node:path`, `node:http`, `node:url`, `node:test`, and `node:assert/strict`.

---

## File Structure

Create:

- `templates/repo-governance-v2/tools/war-room/lib/parse-roadmap.mjs` — parse roadmap lanes and item refs from markdown tables.
- `templates/repo-governance-v2/tools/war-room/lib/parse-epics.mjs` — parse epic status, delivery slices, requirements, evidence, and source anchors.
- `templates/repo-governance-v2/tools/war-room/lib/detect-drift.mjs` — compare roadmap refs with epic data and return warning objects.
- `templates/repo-governance-v2/tools/war-room/lib/render-html.mjs` — render the dashboard as static HTML.
- `templates/repo-governance-v2/tools/war-room/server.mjs` — start the local read-only HTTP dashboard.
- `templates/repo-governance-v2/tools/war-room/README.md` — usage and source-of-truth boundaries.
- `tests/war-room/parse-roadmap.test.mjs` — parser tests for roadmap lanes.
- `tests/war-room/parse-epics.test.mjs` — parser tests for epic slices and requirements.
- `tests/war-room/detect-drift.test.mjs` — drift warning tests.
- `tests/war-room/render-html.test.mjs` — renderer smoke tests.

Modify:

- `INDEX.md` — add the new `tools/war-room` template asset under Repo Governance v2.

Do not modify:

- `templates/repo-governance-v2/docs/governance/local/prd.example.md`
- `templates/repo-governance-v2/docs/governance/local/tdd.example.md`

---

## Data Contracts

Use these object shapes consistently.

```js
const roadmap = {
  filePath: "docs/governance/local/roadmap.md",
  lanes: {
    now: [{ id: "E-001A", work: "Ship dashboard", note: "Needed now", detailRef: "epics/E-001-war-room.md", sourceRef: "docs/governance/local/roadmap.md#now" }],
    next: [],
    later: [],
    doneRecently: [],
    cancelledOrParked: [],
  },
};

const epic = {
  id: "E-001",
  title: "War Room",
  status: "in-progress",
  filePath: "docs/governance/local/epics/E-001-war-room.md",
  sourceRef: "docs/governance/local/epics/E-001-war-room.md",
  slices: [
    {
      id: "E-001A",
      title: "MVP",
      deliveryStatus: "in-progress",
      covers: ["E-001-001"],
      sourceRef: "docs/governance/local/epics/E-001-war-room.md#e-001a-mvp",
    },
  ],
  requirements: [
    {
      id: "E-001-001",
      title: "Read roadmap",
      type: "accepted",
      deliveryStatus: "done",
      acceptanceStatus: "accepted",
      slice: "E-001A",
      prd: "not-needed",
      tdd: "not-needed",
      existingEvidence: ["tests/war-room/parse-roadmap.test.mjs"],
      sourceRef: "docs/governance/local/epics/E-001-war-room.md#e-001-001-read-roadmap",
    },
  ],
};

const warning = {
  severity: "warning",
  code: "roadmap-ref-missing",
  message: "Roadmap item E-999A references no known epic slice or requirement.",
  sourceRef: "docs/governance/local/roadmap.md#now",
  relatedRef: "epics/E-999-missing.md",
};
```

---

## Task 1: Roadmap Parser

**Files:**

- Create: `templates/repo-governance-v2/tools/war-room/lib/parse-roadmap.mjs`
- Create: `tests/war-room/parse-roadmap.test.mjs`

- [ ] **Step 1: Write the failing roadmap parser test**

Create `tests/war-room/parse-roadmap.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
node --test tests/war-room/parse-roadmap.test.mjs
```

Expected: FAIL because `parse-roadmap.mjs` does not exist.

- [ ] **Step 3: Implement the roadmap parser**

Create `templates/repo-governance-v2/tools/war-room/lib/parse-roadmap.mjs`:

```js
const LANE_DEFINITIONS = [
  ["Now", "now"],
  ["Next", "next"],
  ["Later", "later"],
  ["Done Recently", "doneRecently"],
  ["Cancelled Or Parked", "cancelledOrParked"],
];

export function parseRoadmapMarkdown(markdown, filePath) {
  const lanes = {
    now: [],
    next: [],
    later: [],
    doneRecently: [],
    cancelledOrParked: [],
  };

  for (const [heading, laneKey] of LANE_DEFINITIONS) {
    const section = extractSection(markdown, heading);
    const rows = parseMarkdownTable(section);
    lanes[laneKey] = rows
      .map((row) => normalizeRoadmapRow(row, laneKey, filePath))
      .filter(Boolean);
  }

  return { filePath, lanes };
}

function normalizeRoadmapRow(row, laneKey, filePath) {
  const id = cleanCell(row.ID);
  if (!isRealId(id)) return null;

  if (laneKey === "doneRecently") {
    return {
      id,
      work: cleanCell(row["Completed Work"]),
      evidenceRef: cleanCell(row["Evidence Ref"]),
      sourceRef: `${filePath}#done-recently`,
    };
  }

  if (laneKey === "cancelledOrParked") {
    return {
      id,
      work: cleanCell(row.Work),
      note: cleanCell(row.Reason),
      sourceRef: `${filePath}#cancelled-or-parked`,
    };
  }

  return {
    id,
    work: cleanCell(row.Work),
    note: cleanCell(row["Why Now"] ?? row.Trigger ?? row["Why Later"]),
    detailRef: cleanCell(row["Detail Ref"]),
    sourceRef: `${filePath}#${toAnchor(laneKey)}`,
  };
}

function extractSection(markdown, heading) {
  const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\\\s*$([\\\\s\\\\S]*?)(?=^## |\\\\z)`, "m");
  return markdown.match(pattern)?.[1] ?? "";
}

function parseMarkdownTable(section) {
  const lines = section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));

  if (lines.length < 2) return [];

  const headers = splitTableRow(lines[0]).map(cleanCell);
  return lines.slice(2).map((line) => {
    const cells = splitTableRow(line).map(cleanCell);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

function splitTableRow(line) {
  return line.slice(1, -1).split("|");
}

function cleanCell(value = "") {
  return value
    .trim()
    .replace(/^`|`$/g, "")
    .trim();
}

function isRealId(value) {
  return Boolean(value) && value !== "-" && !value.includes("<") && !value.includes(">");
}

function toAnchor(laneKey) {
  return laneKey.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

- [ ] **Step 4: Run the roadmap parser test and verify it passes**

Run:

```bash
node --test tests/war-room/parse-roadmap.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit the roadmap parser**

Run:

```bash
git add templates/repo-governance-v2/tools/war-room/lib/parse-roadmap.mjs tests/war-room/parse-roadmap.test.mjs
git commit -m "feat: parse governance roadmap"
```

Expected: commit succeeds.

---

## Task 2: Epic Parser

**Files:**

- Create: `templates/repo-governance-v2/tools/war-room/lib/parse-epics.mjs`
- Create: `tests/war-room/parse-epics.test.mjs`

- [ ] **Step 1: Write the failing epic parser test**

Create `tests/war-room/parse-epics.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { parseEpicMarkdown } from "../../templates/repo-governance-v2/tools/war-room/lib/parse-epics.mjs";

test("parseEpicMarkdown extracts epic status, slices, requirements, and evidence", () => {
  const markdown = `# E-001 War Room Dashboard

## Status

in-progress

## Delivery Slices

### E-001A MVP Dashboard

- delivery status: in-progress
- covers: E-001-001, E-001-002
- minimum completion:
  - Dashboard starts locally.
- next: render completed work

### E-001B Polish

- delivery status: not-started
- covers: E-001-003
- minimum completion:
  - Improve empty states.
- next: wait for MVP acceptance

## Requirement List

### E-001-001 Parse Roadmap

- type: accepted
- delivery status: done
- acceptance status: accepted
- Slice: E-001A
- PRD: not-needed
- TDD: not-needed
- decisions:
  - Roadmap owns sequencing.
- existing evidence:
  - tests/war-room/parse-roadmap.test.mjs
- gaps:
  -
- next:

### E-001-002 Parse Epics

- type: accepted
- delivery status: in-progress
- acceptance status: not-reviewed
- Slice: E-001A
- PRD: not-needed
- TDD: not-needed
- decisions:
  -
- existing evidence:
  -
- gaps:
  - Need parser implementation.
- next: implement parser`;

  const epic = parseEpicMarkdown(markdown, "docs/governance/local/epics/E-001-war-room.md");

  assert.equal(epic.id, "E-001");
  assert.equal(epic.title, "War Room Dashboard");
  assert.equal(epic.status, "in-progress");
  assert.equal(epic.slices.length, 2);
  assert.equal(epic.slices[0].id, "E-001A");
  assert.equal(epic.slices[0].title, "MVP Dashboard");
  assert.equal(epic.slices[0].deliveryStatus, "in-progress");
  assert.deepEqual(epic.slices[0].covers, ["E-001-001", "E-001-002"]);
  assert.equal(epic.requirements.length, 2);
  assert.equal(epic.requirements[0].id, "E-001-001");
  assert.equal(epic.requirements[0].title, "Parse Roadmap");
  assert.equal(epic.requirements[0].deliveryStatus, "done");
  assert.deepEqual(epic.requirements[0].existingEvidence, ["tests/war-room/parse-roadmap.test.mjs"]);
  assert.equal(epic.requirements[1].existingEvidence.length, 0);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
node --test tests/war-room/parse-epics.test.mjs
```

Expected: FAIL because `parse-epics.mjs` does not exist.

- [ ] **Step 3: Implement the epic parser**

Create `templates/repo-governance-v2/tools/war-room/lib/parse-epics.mjs`:

```js
export function parseEpicMarkdown(markdown, filePath) {
  const titleMatch = markdown.match(/^#\s+(E-\d+)\s+(.+)$/m);
  const id = titleMatch?.[1] ?? inferEpicIdFromPath(filePath);
  const title = titleMatch?.[2]?.trim() ?? id;

  return {
    id,
    title,
    status: extractStatus(markdown),
    filePath,
    sourceRef: filePath,
    slices: parseSlices(markdown, filePath),
    requirements: parseRequirements(markdown, filePath),
  };
}

function extractStatus(markdown) {
  const section = extractSection(markdown, "Status");
  const status = section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("|") && !line.startsWith("-"));
  return status ?? "unknown";
}

function parseSlices(markdown, filePath) {
  const section = extractSection(markdown, "Delivery Slices");
  return splitH3Blocks(section).map(({ heading, body }) => {
    const match = heading.match(/^(E-\d+[A-Z])\s+(.+)$/);
    const id = match?.[1] ?? heading.trim();
    const title = match?.[2]?.trim() ?? "";

    return {
      id,
      title,
      deliveryStatus: fieldValue(body, "delivery status"),
      covers: splitIds(fieldValue(body, "covers")),
      sourceRef: `${filePath}#${slugify(`${id} ${title}`)}`,
    };
  });
}

function parseRequirements(markdown, filePath) {
  const section = extractSection(markdown, "Requirement List");
  return splitH3Blocks(section).map(({ heading, body }) => {
    const match = heading.match(/^(E-\d+-\d+)\s+(.+)$/);
    const id = match?.[1] ?? heading.trim();
    const title = match?.[2]?.trim() ?? "";

    return {
      id,
      title,
      type: fieldValue(body, "type"),
      deliveryStatus: fieldValue(body, "delivery status"),
      acceptanceStatus: fieldValue(body, "acceptance status"),
      slice: fieldValue(body, "Slice"),
      prd: fieldValue(body, "PRD"),
      tdd: fieldValue(body, "TDD"),
      existingEvidence: listUnderField(body, "existing evidence"),
      sourceRef: `${filePath}#${slugify(`${id} ${title}`)}`,
    };
  });
}

function extractSection(markdown, heading) {
  const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\\\s*$([\\\\s\\\\S]*?)(?=^## |\\\\z)`, "m");
  return markdown.match(pattern)?.[1] ?? "";
}

function splitH3Blocks(section) {
  const matches = [...section.matchAll(/^###\s+(.+?)\s*$([\s\S]*?)(?=^### |\z)/gm)];
  return matches.map((match) => ({
    heading: match[1].trim(),
    body: match[2],
  }));
}

function fieldValue(body, fieldName) {
  const pattern = new RegExp(`^- ${escapeRegExp(fieldName)}:\\\\s*(.*)$`, "im");
  return cleanValue(body.match(pattern)?.[1] ?? "");
}

function listUnderField(body, fieldName) {
  const lines = body.split(/\r?\n/);
  const fieldIndex = lines.findIndex((line) =>
    new RegExp(`^- ${escapeRegExp(fieldName)}:\\s*$`, "i").test(line.trim()),
  );
  if (fieldIndex === -1) return [];

  const values = [];
  for (const line of lines.slice(fieldIndex + 1)) {
    if (/^- [^:]+:/.test(line.trim())) break;
    const nested = line.match(/^\s+-\s*(.*)$/);
    if (!nested) continue;
    const value = cleanValue(nested[1]);
    if (isRealValue(value)) values.push(value);
  }
  return values;
}

function splitIds(value) {
  if (!isRealValue(value)) return [];
  return value.split(",").map((part) => cleanValue(part)).filter(isRealValue);
}

function cleanValue(value = "") {
  return value.trim().replace(/^`|`$/g, "").trim();
}

function isRealValue(value) {
  return Boolean(value) && value !== "-" && !value.includes("<") && !value.includes(">");
}

function inferEpicIdFromPath(filePath) {
  return filePath.match(/(E-\d+)/)?.[1] ?? "unknown";
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

- [ ] **Step 4: Run the epic parser test and verify it passes**

Run:

```bash
node --test tests/war-room/parse-epics.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit the epic parser**

Run:

```bash
git add templates/repo-governance-v2/tools/war-room/lib/parse-epics.mjs tests/war-room/parse-epics.test.mjs
git commit -m "feat: parse governance epics"
```

Expected: commit succeeds.

---

## Task 3: Drift Detector

**Files:**

- Create: `templates/repo-governance-v2/tools/war-room/lib/detect-drift.mjs`
- Create: `tests/war-room/detect-drift.test.mjs`

- [ ] **Step 1: Write the failing drift detector test**

Create `tests/war-room/detect-drift.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { detectDrift } from "../../templates/repo-governance-v2/tools/war-room/lib/detect-drift.mjs";

test("detectDrift reports roadmap and epic inconsistencies", () => {
  const roadmap = {
    filePath: "docs/governance/local/roadmap.md",
    lanes: {
      now: [
        { id: "E-999A", work: "Missing slice", detailRef: "epics/E-999-missing.md", sourceRef: "docs/governance/local/roadmap.md#now" },
      ],
      next: [],
      later: [],
      doneRecently: [
        { id: "E-001A", work: "MVP done", evidenceRef: "epics/E-001-war-room.md", sourceRef: "docs/governance/local/roadmap.md#done-recently" },
      ],
      cancelledOrParked: [],
    },
  };

  const epics = [
    {
      id: "E-001",
      title: "War Room",
      status: "in-progress",
      filePath: "docs/governance/local/epics/E-001-war-room.md",
      slices: [
        { id: "E-001A", title: "MVP", deliveryStatus: "done", covers: ["E-001-001", "E-001-002"], sourceRef: "docs/governance/local/epics/E-001-war-room.md#e-001a-mvp" },
      ],
      requirements: [
        { id: "E-001-001", title: "Parse roadmap", deliveryStatus: "done", acceptanceStatus: "accepted", existingEvidence: [], sourceRef: "docs/governance/local/epics/E-001-war-room.md#e-001-001-parse-roadmap" },
        { id: "E-001-002", title: "Parse epics", deliveryStatus: "in-progress", acceptanceStatus: "not-reviewed", existingEvidence: ["tests/war-room/parse-epics.test.mjs"], sourceRef: "docs/governance/local/epics/E-001-war-room.md#e-001-002-parse-epics" },
      ],
    },
  ];

  const warnings = detectDrift({ roadmap, epics });
  const codes = warnings.map((warning) => warning.code).sort();

  assert.deepEqual(codes, [
    "requirement-done-missing-evidence",
    "roadmap-ref-missing",
    "slice-done-with-open-requirements",
  ]);
  assert.ok(warnings.every((warning) => warning.sourceRef));
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
node --test tests/war-room/detect-drift.test.mjs
```

Expected: FAIL because `detect-drift.mjs` does not exist.

- [ ] **Step 3: Implement drift detection**

Create `templates/repo-governance-v2/tools/war-room/lib/detect-drift.mjs`:

```js
export function detectDrift({ roadmap, epics }) {
  const index = indexEpics(epics);
  return [
    ...detectMissingRoadmapRefs(roadmap, index),
    ...detectDoneRecentlyMismatch(roadmap, index),
    ...detectDoneRequirementsWithoutEvidence(epics),
    ...detectDoneSlicesWithOpenRequirements(epics, index),
  ];
}

function detectMissingRoadmapRefs(roadmap, index) {
  return roadmapItems(roadmap)
    .filter((item) => !index.byId.has(item.id))
    .map((item) => ({
      severity: "warning",
      code: "roadmap-ref-missing",
      message: `Roadmap item ${item.id} references no known epic, delivery slice, or requirement.`,
      sourceRef: item.sourceRef,
      relatedRef: item.detailRef ?? item.evidenceRef ?? "",
    }));
}

function detectDoneRecentlyMismatch(roadmap, index) {
  return roadmap.lanes.doneRecently
    .map((item) => ({ item, target: index.byId.get(item.id) }))
    .filter(({ target }) => target && target.deliveryStatus && target.deliveryStatus !== "done")
    .map(({ item, target }) => ({
      severity: "warning",
      code: "roadmap-done-target-not-done",
      message: `Roadmap Done Recently lists ${item.id}, but the referenced item status is ${target.deliveryStatus}.`,
      sourceRef: item.sourceRef,
      relatedRef: target.sourceRef,
    }));
}

function detectDoneRequirementsWithoutEvidence(epics) {
  return epics.flatMap((epic) =>
    epic.requirements
      .filter((requirement) => requirement.deliveryStatus === "done")
      .filter((requirement) => requirement.existingEvidence.length === 0)
      .map((requirement) => ({
        severity: "warning",
        code: "requirement-done-missing-evidence",
        message: `Requirement ${requirement.id} is done but has no existing evidence.`,
        sourceRef: requirement.sourceRef,
        relatedRef: epic.filePath,
      })),
  );
}

function detectDoneSlicesWithOpenRequirements(epics, index) {
  return epics.flatMap((epic) =>
    epic.slices
      .filter((slice) => slice.deliveryStatus === "done")
      .filter((slice) =>
        slice.covers.some((requirementId) => index.byId.get(requirementId)?.deliveryStatus !== "done"),
      )
      .map((slice) => ({
        severity: "warning",
        code: "slice-done-with-open-requirements",
        message: `Delivery slice ${slice.id} is done but not all covered requirements are done.`,
        sourceRef: slice.sourceRef,
        relatedRef: epic.filePath,
      })),
  );
}

function roadmapItems(roadmap) {
  return [
    ...roadmap.lanes.now,
    ...roadmap.lanes.next,
    ...roadmap.lanes.later,
    ...roadmap.lanes.doneRecently,
    ...roadmap.lanes.cancelledOrParked,
  ];
}

function indexEpics(epics) {
  const byId = new Map();

  for (const epic of epics) {
    byId.set(epic.id, { ...epic, kind: "epic", deliveryStatus: epic.status });
    for (const slice of epic.slices) byId.set(slice.id, { ...slice, kind: "slice" });
    for (const requirement of epic.requirements) {
      byId.set(requirement.id, { ...requirement, kind: "requirement" });
    }
  }

  return { byId };
}
```

- [ ] **Step 4: Run the drift detector test and verify it passes**

Run:

```bash
node --test tests/war-room/detect-drift.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit the drift detector**

Run:

```bash
git add templates/repo-governance-v2/tools/war-room/lib/detect-drift.mjs tests/war-room/detect-drift.test.mjs
git commit -m "feat: detect governance drift"
```

Expected: commit succeeds.

---

## Task 4: HTML Renderer

**Files:**

- Create: `templates/repo-governance-v2/tools/war-room/lib/render-html.mjs`
- Create: `tests/war-room/render-html.test.mjs`

- [ ] **Step 1: Write the failing renderer test**

Create `tests/war-room/render-html.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { renderDashboardHtml } from "../../templates/repo-governance-v2/tools/war-room/lib/render-html.mjs";

test("renderDashboardHtml renders summary, lanes, epic progress, completions, and warnings", () => {
  const html = renderDashboardHtml({
    roadmap: {
      lanes: {
        now: [{ id: "E-001A", work: "War room MVP", note: "Needed now", detailRef: "epics/E-001-war-room.md", sourceRef: "roadmap.md#now" }],
        next: [],
        later: [],
        doneRecently: [{ id: "E-000A", work: "Governance examples", evidenceRef: "roadmap.md", sourceRef: "roadmap.md#done-recently" }],
        cancelledOrParked: [],
      },
    },
    epics: [
      {
        id: "E-001",
        title: "War Room",
        status: "in-progress",
        filePath: "epics/E-001-war-room.md",
        slices: [{ id: "E-001A", deliveryStatus: "in-progress", covers: ["E-001-001"], sourceRef: "epics/E-001-war-room.md#e-001a" }],
        requirements: [{ id: "E-001-001", title: "Render dashboard", deliveryStatus: "done", acceptanceStatus: "accepted", existingEvidence: ["tests/war-room/render-html.test.mjs"], sourceRef: "epics/E-001-war-room.md#e-001-001" }],
      },
    ],
    warnings: [
      { severity: "warning", code: "roadmap-ref-missing", message: "Missing ref", sourceRef: "roadmap.md#now", relatedRef: "epics/missing.md" },
    ],
  });

  assert.match(html, /War Room Dashboard/);
  assert.match(html, /Now/);
  assert.match(html, /War room MVP/);
  assert.match(html, /Governance examples/);
  assert.match(html, /E-001/);
  assert.match(html, /Missing ref/);
  assert.match(html, /tests\/war-room\/render-html\.test\.mjs/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
node --test tests/war-room/render-html.test.mjs
```

Expected: FAIL because `render-html.mjs` does not exist.

- [ ] **Step 3: Implement the renderer**

Create `templates/repo-governance-v2/tools/war-room/lib/render-html.mjs`:

```js
export function renderDashboardHtml({ roadmap, epics, warnings }) {
  const summary = buildSummary(roadmap, epics, warnings);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>War Room Dashboard</title>
  <style>
    :root { color-scheme: dark; --bg:#020617; --panel:#0f172a; --line:#1e293b; --text:#e2e8f0; --muted:#94a3b8; --warn:#f59e0b; --done:#22c55e; }
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:var(--bg); color:var(--text); }
    main { max-width:1200px; margin:0 auto; padding:32px; }
    h1, h2, h3 { margin:0; }
    a { color:#93c5fd; }
    .muted { color:var(--muted); }
    .grid { display:grid; gap:16px; }
    .summary { grid-template-columns:repeat(auto-fit, minmax(150px,1fr)); margin:24px 0; }
    .card, .lane, .warning { background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:16px; }
    .metric { font-size:32px; font-weight:700; margin-top:8px; }
    .lanes { grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); }
    .item { border-top:1px solid var(--line); padding-top:12px; margin-top:12px; }
    .status { display:inline-block; border:1px solid var(--line); border-radius:999px; padding:2px 8px; color:var(--muted); font-size:12px; }
    .warning { border-color:#92400e; background:rgba(146,64,14,.16); }
    .done { color:var(--done); }
  </style>
</head>
<body>
  <main>
    <h1>War Room Dashboard</h1>
    <p class="muted">Read-only projection from roadmap and epics. PRD and TDD are not parsed.</p>
    ${renderSummary(summary)}
    <section class="grid lanes">${renderRoadmapLanes(roadmap)}</section>
    <section style="margin-top:24px">${renderEpicProgress(epics)}</section>
    <section style="margin-top:24px">${renderCompletedWork(roadmap, epics)}</section>
    <section style="margin-top:24px">${renderWarnings(warnings)}</section>
  </main>
</body>
</html>`;
}

function buildSummary(roadmap, epics, warnings) {
  return {
    now: roadmap.lanes.now.length,
    next: roadmap.lanes.next.length,
    doneRecently: roadmap.lanes.doneRecently.length,
    activeEpics: epics.filter((epic) => ["accepted", "in-progress"].includes(epic.status)).length,
    warnings: warnings.length,
  };
}

function renderSummary(summary) {
  return `<section class="grid summary">
    ${metric("Now", summary.now)}
    ${metric("Next", summary.next)}
    ${metric("Done Recently", summary.doneRecently)}
    ${metric("Active Epics", summary.activeEpics)}
    ${metric("Drift Warnings", summary.warnings)}
  </section>`;
}

function metric(label, value) {
  return `<div class="card"><div class="muted">${escapeHtml(label)}</div><div class="metric">${value}</div></div>`;
}

function renderRoadmapLanes(roadmap) {
  return [
    ["Now", roadmap.lanes.now],
    ["Next", roadmap.lanes.next],
    ["Later", roadmap.lanes.later],
    ["Done Recently", roadmap.lanes.doneRecently],
    ["Cancelled / Parked", roadmap.lanes.cancelledOrParked],
  ].map(([label, items]) => `<div class="lane"><h2>${label}</h2>${items.length ? items.map(renderRoadmapItem).join("") : `<p class="muted">No items</p>`}</div>`).join("");
}

function renderRoadmapItem(item) {
  const ref = item.detailRef ?? item.evidenceRef ?? item.sourceRef;
  return `<div class="item">
    <strong>${escapeHtml(item.id)}</strong>
    <div>${escapeHtml(item.work)}</div>
    <div class="muted">${escapeHtml(item.note ?? "")}</div>
    <div class="muted">${escapeHtml(ref ?? "")}</div>
  </div>`;
}

function renderEpicProgress(epics) {
  return `<h2>Epic Progress</h2><div class="grid">${epics.map(renderEpicCard).join("")}</div>`;
}

function renderEpicCard(epic) {
  const done = epic.requirements.filter((requirement) => requirement.deliveryStatus === "done").length;
  const blocked = epic.requirements.filter((requirement) => ["blocked", "rejected"].includes(requirement.acceptanceStatus)).length;
  const missingEvidence = epic.requirements.filter((requirement) => requirement.deliveryStatus === "done" && requirement.existingEvidence.length === 0).length;
  return `<article class="card">
    <h3>${escapeHtml(epic.id)} ${escapeHtml(epic.title)}</h3>
    <p><span class="status">${escapeHtml(epic.status)}</span></p>
    <p>${epic.slices.length} slices · ${done}/${epic.requirements.length} requirements done · ${blocked} blocked/rejected · ${missingEvidence} missing evidence</p>
    <p class="muted">${escapeHtml(epic.filePath)}</p>
  </article>`;
}

function renderCompletedWork(roadmap, epics) {
  const roadmapDone = roadmap.lanes.doneRecently.map((item) => ({
    id: item.id,
    work: item.work,
    evidence: item.evidenceRef,
  }));
  const requirementDone = epics.flatMap((epic) =>
    epic.requirements
      .filter((requirement) => requirement.deliveryStatus === "done")
      .map((requirement) => ({
        id: requirement.id,
        work: requirement.title,
        evidence: requirement.existingEvidence.join(", ") || requirement.sourceRef,
      })),
  );
  const rows = [...roadmapDone, ...requirementDone];
  return `<h2>Completed Work</h2><div class="grid">${rows.map((row) => `<div class="card"><strong class="done">${escapeHtml(row.id)}</strong><div>${escapeHtml(row.work)}</div><div class="muted">${escapeHtml(row.evidence ?? "")}</div></div>`).join("")}</div>`;
}

function renderWarnings(warnings) {
  return `<h2>Drift Warnings</h2><div class="grid">${warnings.length ? warnings.map((warning) => `<div class="warning"><strong>${escapeHtml(warning.code)}</strong><div>${escapeHtml(warning.message)}</div><div class="muted">${escapeHtml(warning.sourceRef)} → ${escapeHtml(warning.relatedRef ?? "")}</div></div>`).join("") : `<div class="card">No drift warnings.</div>`}</div>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
```

- [ ] **Step 4: Run the renderer test and verify it passes**

Run:

```bash
node --test tests/war-room/render-html.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit the renderer**

Run:

```bash
git add templates/repo-governance-v2/tools/war-room/lib/render-html.mjs tests/war-room/render-html.test.mjs
git commit -m "feat: render governance war room"
```

Expected: commit succeeds.

---

## Task 5: Local Server And README

**Files:**

- Create: `templates/repo-governance-v2/tools/war-room/server.mjs`
- Create: `templates/repo-governance-v2/tools/war-room/README.md`

- [ ] **Step 1: Implement the local server**

Create `templates/repo-governance-v2/tools/war-room/server.mjs`:

```js
#!/usr/bin/env node

import http from "node:http";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseRoadmapMarkdown } from "./lib/parse-roadmap.mjs";
import { parseEpicMarkdown } from "./lib/parse-epics.mjs";
import { detectDrift } from "./lib/detect-drift.mjs";
import { renderDashboardHtml } from "./lib/render-html.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const toolRoot = path.dirname(scriptPath);
const defaultRepoRoot = path.resolve(toolRoot, "../../..");
const repoRoot = path.resolve(process.argv[2] ?? defaultRepoRoot);
const port = Number(process.env.PORT ?? 4767);

async function main() {
  const server = http.createServer(async (_request, response) => {
    try {
      const model = await readDashboardModel(repoRoot);
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(renderDashboardHtml(model));
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : String(error));
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`War Room Dashboard: http://127.0.0.1:${port}`);
    console.log(`Repo root: ${repoRoot}`);
  });
}

export async function readDashboardModel(root) {
  const roadmapPath = path.join(root, "docs/governance/local/roadmap.md");
  const epicsRoot = path.join(root, "docs/governance/local/epics");

  if (!existsSync(roadmapPath)) {
    throw new Error(`Missing roadmap file: ${roadmapPath}`);
  }

  if (!existsSync(epicsRoot)) {
    throw new Error(`Missing epics directory: ${epicsRoot}`);
  }

  const roadmapMarkdown = await readFile(roadmapPath, "utf8");
  const roadmap = parseRoadmapMarkdown(roadmapMarkdown, "docs/governance/local/roadmap.md");
  const epicFiles = await listEpicFiles(epicsRoot);
  const epics = await Promise.all(
    epicFiles.map(async (fileName) => {
      const absolutePath = path.join(epicsRoot, fileName);
      const markdown = await readFile(absolutePath, "utf8");
      return parseEpicMarkdown(markdown, `docs/governance/local/epics/${fileName}`);
    }),
  );
  const warnings = detectDrift({ roadmap, epics });

  return { roadmap, epics, warnings };
}

async function listEpicFiles(epicsRoot) {
  const entries = await readdir(epicsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^E-\d+-.+\.md$/.test(name))
    .sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
```

- [ ] **Step 2: Write README**

Create `templates/repo-governance-v2/tools/war-room/README.md`:

```md
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
```

- [ ] **Step 3: Run all current tests**

Run:

```bash
node --test tests/war-room/*.test.mjs
```

Expected: PASS.

- [ ] **Step 4: Smoke-test missing file error**

Run:

```bash
node templates/repo-governance-v2/tools/war-room/server.mjs /tmp
```

Expected: server starts, and opening `http://127.0.0.1:4767` returns a clear missing roadmap message.

Stop the server with `Ctrl-C`.

- [ ] **Step 5: Commit server and README**

Run:

```bash
git add templates/repo-governance-v2/tools/war-room/server.mjs templates/repo-governance-v2/tools/war-room/README.md
git commit -m "feat: add governance war room server"
```

Expected: commit succeeds.

---

## Task 6: Index Update And Final Verification

**Files:**

- Modify: `INDEX.md`

- [ ] **Step 1: Update `INDEX.md`**

Under the `Repo Governance v2` asset table, add this row:

```md
| `templates/repo-governance-v2/tools/war-room` | 本機 read-only 戰情室 dashboard，解析 roadmap 與 epics，顯示 Now / Next / Later / Done / Parked、epic progress、completed work 與 roadmap-epic drift warnings。 |
```

- [ ] **Step 2: Run war-room tests**

Run:

```bash
node --test tests/war-room/*.test.mjs
```

Expected: PASS.

- [ ] **Step 3: Run existing plugin validator**

Run:

```bash
node scripts/package-plugin.mjs --check --all
```

Expected: PASS summary for existing plugins.

- [ ] **Step 4: Check required repo governance invariants**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
errors = []

root = Path(".")

for skill in list(root.glob("plugins/*/skills/*/SKILL.md")) + list(root.glob("skills/*/*/SKILL.md")) + list(root.glob("templates/*/**/SKILL.md")):
    folder_name = skill.parent.name
    text = skill.read_text()
    expected = f"name: {folder_name}"
    expected_quoted = f'name: "{folder_name}"'
    if expected not in text and expected_quoted not in text:
        errors.append(f"{skill}: frontmatter name does not match folder name {folder_name}")

for path in root.iterdir():
    if path.is_dir() and (path / "SKILL.md").exists():
        errors.append(f"Root-level skill folder is not allowed: {path}")

index = (root / "INDEX.md").read_text()
for required in [
    "plugins/engineering",
    "skills/reviews/first-principles-review",
    "skills/agent-workflows/task-harness",
    "templates/repo-governance-v2",
    "templates/repo-governance-v2/tools/war-room",
]:
    if required not in index:
        errors.append(f"INDEX.md missing {required}")

if errors:
    raise SystemExit("\\n".join(errors))

print("governance invariant check passed")
PY
```

Expected: `governance invariant check passed`.

- [ ] **Step 5: Verify git status**

Run:

```bash
git status --short
```

Expected: only intended changes are present before final commit.

- [ ] **Step 6: Commit index and verification completion**

Run:

```bash
git add INDEX.md
git commit -m "docs: index war room dashboard"
```

Expected: commit succeeds.

---

## Self-Review

### Spec Coverage

- Read-only dashboard: Task 5 server reads files and renderer outputs HTML only.
- Roadmap and epic parsing: Tasks 1 and 2.
- Completed work: Task 4 renderer.
- Drift warnings: Task 3 detector and Task 4 renderer.
- Local tool placement in template: Tasks 1 through 5 create files under `templates/repo-governance-v2/tools/war-room/`.
- `INDEX.md` update: Task 6.
- PRD/TDD out of scope: File structure and README state they are not parsed.

### Placeholder Scan

No implementation steps use unresolved placeholder markers.

### Type Consistency

The parser, detector, renderer, and server all use the data contracts defined above: `roadmap.lanes`, `epics[].slices`, `epics[].requirements`, and `warnings[]`.
