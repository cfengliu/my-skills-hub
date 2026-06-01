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
