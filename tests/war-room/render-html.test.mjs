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

test("renderDashboardHtml counts only accepted and in-progress epics as active", () => {
  const html = renderDashboardHtml({
    roadmap: { lanes: {} },
    epics: [
      { id: "E-001", title: "Accepted", status: "accepted" },
      { id: "E-002", title: "In progress", status: "in-progress" },
      { id: "E-003", title: "Proposed", status: "proposed" },
      { id: "E-004", title: "Parked", status: "parked" },
    ],
    warnings: [],
  });

  assert.match(html, /<span>Active Epics<\/span><strong>2<\/strong>/);
});

test("renderDashboardHtml counts blocked and rejected acceptance statuses", () => {
  const html = renderDashboardHtml({
    roadmap: { lanes: {} },
    epics: [
      {
        id: "E-001",
        title: "War Room",
        status: "in-progress",
        requirements: [
          { id: "E-001-001", title: "Blocked", deliveryStatus: "todo", acceptanceStatus: "blocked" },
          { id: "E-001-002", title: "Rejected", deliveryStatus: "todo", acceptanceStatus: "rejected" },
        ],
      },
    ],
    warnings: [],
  });

  assert.match(html, /<li>Blocked \/ rejected: 2<\/li>/);
});
