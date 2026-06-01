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
  const lines = markdown.split(/\r?\n/);
  const headingLine = `## ${heading}`;
  const startIndex = lines.findIndex((line) => line.trim() === headingLine);
  if (startIndex === -1) return "";

  const endIndex = lines.findIndex(
    (line, index) => index > startIndex && line.startsWith("## "),
  );
  const sectionEnd = endIndex === -1 ? lines.length : endIndex;
  return lines.slice(startIndex + 1, sectionEnd).join("\n");
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
