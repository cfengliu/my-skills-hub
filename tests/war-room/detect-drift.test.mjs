import test from "node:test";
import assert from "node:assert/strict";
import { detectDrift } from "../../templates/repo-governance-v2/tools/war-room/lib/detect-drift.mjs";

const emptyRoadmap = {
  filePath: "docs/governance/local/roadmap.md",
  lanes: {
    now: [],
    next: [],
    later: [],
    doneRecently: [],
    cancelledOrParked: [],
  },
};

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

test("detectDrift treats undefined evidence as missing evidence", () => {
  const warnings = detectDrift({
    roadmap: emptyRoadmap,
    epics: [
      {
        id: "E-010",
        status: "in-progress",
        filePath: "docs/governance/local/epics/E-010.md",
        slices: [],
        requirements: [
          { id: "E-010-001", title: "Done without evidence", deliveryStatus: "done", sourceRef: "docs/governance/local/epics/E-010.md#e-010-001" },
        ],
      },
    ],
  });

  assert.deepEqual(warnings.map((warning) => warning.code), ["requirement-done-missing-evidence"]);
});

test("detectDrift reports each open or missing covered requirement for done slices", () => {
  const warnings = detectDrift({
    roadmap: emptyRoadmap,
    epics: [
      {
        id: "E-020",
        status: "in-progress",
        filePath: "docs/governance/local/epics/E-020.md",
        slices: [
          { id: "E-020A", title: "Done slice", deliveryStatus: "done", covers: ["E-020-001", "E-020-002", "E-020-999"], sourceRef: "docs/governance/local/epics/E-020.md#e-020a" },
        ],
        requirements: [
          { id: "E-020-001", title: "Done", deliveryStatus: "done", existingEvidence: ["tests/example.test.mjs"], sourceRef: "docs/governance/local/epics/E-020.md#e-020-001" },
          { id: "E-020-002", title: "Open", deliveryStatus: "in-progress", existingEvidence: [], sourceRef: "docs/governance/local/epics/E-020.md#e-020-002" },
        ],
      },
    ],
  });

  const sliceWarnings = warnings.filter((warning) => warning.code === "slice-done-with-open-requirements");

  assert.equal(sliceWarnings.length, 2);
  assert.deepEqual(sliceWarnings.map((warning) => warning.relatedRef), [
    "docs/governance/local/epics/E-020.md#e-020-002",
    "missing requirement E-020-999",
  ]);
});

test("detectDrift reports duplicate ids deterministically and keeps the first target", () => {
  const roadmap = {
    ...emptyRoadmap,
    lanes: {
      ...emptyRoadmap.lanes,
      doneRecently: [
        { id: "E-030-001", work: "First target is done", sourceRef: "docs/governance/local/roadmap.md#done-recently" },
      ],
    },
  };

  const warnings = detectDrift({
    roadmap,
    epics: [
      {
        id: "E-030",
        status: "in-progress",
        filePath: "docs/governance/local/epics/E-030.md",
        slices: [],
        requirements: [
          { id: "E-030-001", title: "First", deliveryStatus: "done", existingEvidence: ["tests/first.test.mjs"], sourceRef: "docs/governance/local/epics/E-030.md#first" },
          { id: "E-030-001", title: "Second", deliveryStatus: "in-progress", existingEvidence: [], sourceRef: "docs/governance/local/epics/E-030.md#second" },
        ],
      },
    ],
  });

  assert.deepEqual(warnings.map((warning) => warning.code), ["duplicate-id"]);
  assert.equal(warnings[0].sourceRef, "docs/governance/local/epics/E-030.md#second");
  assert.equal(warnings[0].relatedRef, "docs/governance/local/epics/E-030.md#first");
  assert.match(warnings[0].message, /E-030-001/);
  assert.match(warnings[0].message, /docs\/governance\/local\/epics\/E-030\.md#first/);
  assert.match(warnings[0].message, /docs\/governance\/local\/epics\/E-030\.md#second/);
});

test("detectDrift returns no warnings for clean input", () => {
  const warnings = detectDrift({
    roadmap: {
      ...emptyRoadmap,
      lanes: {
        ...emptyRoadmap.lanes,
        doneRecently: [
          { id: "E-040A", work: "Done slice", sourceRef: "docs/governance/local/roadmap.md#done-recently" },
        ],
      },
    },
    epics: [
      {
        id: "E-040",
        status: "in-progress",
        filePath: "docs/governance/local/epics/E-040.md",
        slices: [
          { id: "E-040A", title: "Clean slice", deliveryStatus: "done", covers: ["E-040-001"], sourceRef: "docs/governance/local/epics/E-040.md#e-040a" },
        ],
        requirements: [
          { id: "E-040-001", title: "Done", deliveryStatus: "done", existingEvidence: ["tests/clean.test.mjs"], sourceRef: "docs/governance/local/epics/E-040.md#e-040-001" },
        ],
      },
    ],
  });

  assert.deepEqual(warnings, []);
});
