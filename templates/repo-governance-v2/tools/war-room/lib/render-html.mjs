const ROADMAP_LANES = [
  { key: "now", label: "Now" },
  { key: "next", label: "Next" },
  { key: "later", label: "Later" },
  { key: "doneRecently", label: "Done Recently" },
  { key: "cancelledOrParked", label: "Cancelled / Parked" },
];

export function renderDashboardHtml({ roadmap, epics, warnings }) {
  const safeRoadmap = roadmap ?? {};
  const safeEpics = epics ?? [];
  const safeWarnings = warnings ?? [];
  const lanes = safeRoadmap.lanes ?? {};

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>War Room Dashboard</title>
  <style>
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #0f172a; }
    main { max-width: 1120px; margin: 0 auto; padding: 32px 20px 48px; }
    h1, h2, h3 { margin: 0; }
    h1 { font-size: 32px; }
    h2 { margin-top: 32px; font-size: 22px; }
    h3 { font-size: 16px; }
    a { color: #2563eb; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 20px; }
    .metric, .card, .lane, .warning { border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; box-shadow: 0 1px 2px rgb(15 23 42 / 0.04); }
    .metric { padding: 16px; }
    .metric strong { display: block; margin-top: 8px; font-size: 28px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 14px; }
    .lane, .card, .warning { padding: 16px; }
    .item { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
    .muted { color: #64748b; }
    .meta { margin-top: 6px; font-size: 13px; color: #64748b; }
    .pill { display: inline-block; border-radius: 999px; padding: 2px 8px; background: #e0f2fe; color: #075985; font-size: 12px; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <main>
    <h1>War Room Dashboard</h1>
    ${renderSummary(lanes, safeEpics, safeWarnings)}
    ${renderRoadmapLanes(lanes)}
    ${renderEpicProgress(safeEpics)}
    ${renderCompletedWork(lanes.doneRecently ?? [], safeEpics)}
    ${renderWarnings(safeWarnings)}
  </main>
</body>
</html>`;
}

function renderSummary(lanes, epics, warnings) {
  const activeEpics = epics.filter((epic) => epic.status !== "done" && epic.status !== "cancelled").length;
  const metrics = [
    ["Now", count(lanes.now)],
    ["Next", count(lanes.next)],
    ["Done Recently", count(lanes.doneRecently)],
    ["Active Epics", activeEpics],
    ["Drift Warnings", warnings.length],
  ];

  return `<section class="summary" aria-label="Summary">
    ${metrics.map(([label, value]) => `<div class="metric"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`).join("\n    ")}
  </section>`;
}

function renderRoadmapLanes(lanes) {
  return `<section>
    <h2>Roadmap Lanes</h2>
    <div class="grid">
      ${ROADMAP_LANES.map(({ key, label }) => renderLane(label, lanes[key] ?? [])).join("\n      ")}
    </div>
  </section>`;
}

function renderLane(label, items) {
  const body = items.length === 0
    ? `<p class="muted">No items.</p>`
    : items.map(renderRoadmapItem).join("\n");

  return `<article class="lane">
    <h3>${escapeHtml(label)} <span class="pill">${items.length}</span></h3>
    ${body}
  </article>`;
}

function renderRoadmapItem(item) {
  const ref = item.detailRef ?? item.evidenceRef ?? item.sourceRef;

  return `<div class="item">
    <strong>${escapeHtml(item.id ?? "Untitled")}</strong> ${escapeHtml(item.work ?? "")}
    ${item.note ? `<div class="meta">${escapeHtml(item.note)}</div>` : ""}
    ${ref ? `<div class="meta">Ref: ${escapeHtml(ref)}</div>` : ""}
  </div>`;
}

function renderEpicProgress(epics) {
  const body = epics.length === 0
    ? `<p class="muted">No epics.</p>`
    : `<div class="grid">${epics.map(renderEpicCard).join("\n")}</div>`;

  return `<section>
    <h2>Epic Progress</h2>
    ${body}
  </section>`;
}

function renderEpicCard(epic) {
  const slices = epic.slices ?? [];
  const requirements = epic.requirements ?? [];
  const doneRequirements = requirements.filter((requirement) => requirement.deliveryStatus === "done").length;
  const blockedOrRejected = [
    ...slices.filter((slice) => slice.deliveryStatus === "blocked"),
    ...requirements.filter((requirement) => requirement.deliveryStatus === "blocked" || requirement.acceptanceStatus === "rejected"),
  ].length;
  const missingEvidence = requirements.filter(
    (requirement) => requirement.deliveryStatus === "done" && (requirement.existingEvidence ?? []).length === 0,
  ).length;

  return `<article class="card">
    <h3>${escapeHtml(epic.id ?? "Untitled")} ${escapeHtml(epic.title ?? "")}</h3>
    <p><span class="pill">${escapeHtml(epic.status ?? "unknown")}</span></p>
    <ul>
      <li>Slices: ${slices.length}</li>
      <li>Requirements done: ${doneRequirements}/${requirements.length}</li>
      <li>Blocked / rejected: ${blockedOrRejected}</li>
      <li>Missing evidence: ${missingEvidence}</li>
      <li>File: ${escapeHtml(epic.filePath ?? epic.sourceRef ?? "")}</li>
    </ul>
  </article>`;
}

function renderCompletedWork(doneRecently, epics) {
  const completedRoadmapItems = doneRecently.map((item) => ({
    title: `${item.id ?? "Untitled"} ${item.work ?? ""}`.trim(),
    detail: item.evidenceRef ?? item.sourceRef,
  }));
  const completedRequirements = epics.flatMap((epic) => (epic.requirements ?? [])
    .filter((requirement) => requirement.deliveryStatus === "done")
    .map((requirement) => ({
      title: `${requirement.id ?? "Untitled"} ${requirement.title ?? ""}`.trim(),
      detail: (requirement.existingEvidence ?? []).join(", ") || requirement.sourceRef || epic.filePath,
    })));
  const completed = [...completedRoadmapItems, ...completedRequirements];
  const body = completed.length === 0
    ? `<p class="muted">No completed work.</p>`
    : `<ul>${completed.map((item) => `<li><strong>${escapeHtml(item.title)}</strong>${item.detail ? ` <span class="muted">${escapeHtml(item.detail)}</span>` : ""}</li>`).join("\n")}</ul>`;

  return `<section>
    <h2>Completed Work</h2>
    ${body}
  </section>`;
}

function renderWarnings(warnings) {
  const body = warnings.length === 0
    ? `<p>No drift warnings.</p>`
    : warnings.map((warning) => `<article class="warning">
      <strong>${escapeHtml(warning.severity ?? "warning")}: ${escapeHtml(warning.code ?? "unknown")}</strong>
      <p>${escapeHtml(warning.message ?? "")}</p>
      <div class="meta">Source: ${escapeHtml(warning.sourceRef ?? "")}</div>
      ${warning.relatedRef ? `<div class="meta">Related: ${escapeHtml(warning.relatedRef)}</div>` : ""}
    </article>`).join("\n");

  return `<section>
    <h2>Drift Warnings</h2>
    ${body}
  </section>`;
}

function count(value) {
  return (value ?? []).length;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
