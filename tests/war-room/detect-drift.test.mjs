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
