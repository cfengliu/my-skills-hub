import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("parseEpicMarkdown ignores nested fields and non-direct evidence children", () => {
  const markdown = `# E-002 Parser Hardening

## Status

accepted

## Delivery Slices

### E-002A Valid Slice

- delivery status: in-progress
- minimum completion:
  - delivery status: done
- covers: E-002-001

## Requirement List

### E-002-001 Valid Requirement

- type: accepted
- delivery status: in-progress
- acceptance status: not-reviewed
- Slice: E-002A
- PRD: not-needed
- TDD: not-needed
- decisions:
  - existing evidence:
    - docs/should-not-be-evidence.md
- existing evidence:
    - tests/too-deep.test.mjs
- gaps:
  -
- next:`;

  const epic = parseEpicMarkdown(markdown, "docs/governance/local/epics/E-002-parser.md");

  assert.equal(epic.slices[0].deliveryStatus, "in-progress");
  assert.deepEqual(epic.requirements[0].existingEvidence, []);
});

test("parseEpicMarkdown does not parse fenced README example templates as real epics", () => {
  const markdown = readFileSync(
    new URL("../../templates/repo-governance-v2/docs/governance/local/epics/README.example.md", import.meta.url),
    "utf8",
  );

  const epic = parseEpicMarkdown(
    markdown,
    "templates/repo-governance-v2/docs/governance/local/epics/README.example.md",
  );

  assert.equal(epic.id, "unknown");
  assert.deepEqual(epic.slices, []);
  assert.deepEqual(epic.requirements, []);
});

test("parseEpicMarkdown parses Requirement List at end of file", () => {
  const markdown = `# E-003 EOF Requirement

## Status

done

## Requirement List

### E-003-001 Last Requirement

- type: accepted
- delivery status: done
- acceptance status: accepted
- Slice: E-003A
- PRD: not-needed
- TDD: not-needed
- existing evidence:
  - tests/last.test.mjs`;

  const epic = parseEpicMarkdown(markdown, "docs/governance/local/epics/E-003-eof.md");

  assert.equal(epic.requirements.length, 1);
  assert.equal(epic.requirements[0].id, "E-003-001");
  assert.deepEqual(epic.requirements[0].existingEvidence, ["tests/last.test.mjs"]);
});

test("parseEpicMarkdown stops Delivery Slices at the next trimmed h2", () => {
  const markdown = `# E-004 Section Boundary

## Delivery Slices

### E-004A Real Slice

- delivery status: done
- covers: E-004-001

  ## Requirement List

### E-004-001 Not A Slice

- delivery status: in-progress
- covers: E-004-999`;

  const epic = parseEpicMarkdown(markdown, "docs/governance/local/epics/E-004-boundary.md");

  assert.equal(epic.slices.length, 1);
  assert.equal(epic.slices[0].id, "E-004A");
});

test("parseEpicMarkdown sourceRef slug uses IDs only", () => {
  const markdown = `# E-005 Source Refs

## Delivery Slices

### E-005A Original Title

- delivery status: done
- covers: E-005-001

## Requirement List

### E-005-001 Mutable Title

- type: accepted
- delivery status: done
- acceptance status: accepted
- Slice: E-005A
- PRD: not-needed
- TDD: not-needed
- existing evidence:
  - tests/source-ref.test.mjs`;

  const epic = parseEpicMarkdown(markdown, "docs/governance/local/epics/E-005-source-refs.md");

  assert.equal(epic.slices[0].sourceRef, "docs/governance/local/epics/E-005-source-refs.md#e-005a");
  assert.equal(epic.requirements[0].sourceRef, "docs/governance/local/epics/E-005-source-refs.md#e-005-001");
});

test("parseEpicMarkdown accepts uppercase and lowercase field variants", () => {
  const markdown = `# E-006 Field Variants

## Delivery Slices

### E-006A Field Case

- Delivery Status: DONE
- Covers: E-006-001

## Requirement List

### E-006-001 Requirement Case

- Type: accepted
- Delivery Status: DONE
- Acceptance Status: ACCEPTED
- slice: E-006A
- prd: not-needed
- tdd: not-needed
- Existing Evidence:
  - tests/case.test.mjs`;

  const epic = parseEpicMarkdown(markdown, "docs/governance/local/epics/E-006-case.md");

  assert.equal(epic.slices[0].deliveryStatus, "DONE");
  assert.deepEqual(epic.slices[0].covers, ["E-006-001"]);
  assert.equal(epic.requirements[0].type, "accepted");
  assert.equal(epic.requirements[0].deliveryStatus, "DONE");
  assert.equal(epic.requirements[0].acceptanceStatus, "ACCEPTED");
  assert.equal(epic.requirements[0].slice, "E-006A");
  assert.equal(epic.requirements[0].prd, "not-needed");
  assert.equal(epic.requirements[0].tdd, "not-needed");
  assert.deepEqual(epic.requirements[0].existingEvidence, ["tests/case.test.mjs"]);
});
