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
  if (laneKey === "doneRecently") {
    const requiredCells = cleanRequiredCells([
      row.ID,
      row["Completed Work"],
      row["Evidence Ref"],
    ]);
    if (!requiredCells) return null;

    const [id, work, evidenceRef] = requiredCells;
    return {
      id,
      work,
      evidenceRef,
      sourceRef: `${filePath}#done-recently`,
    };
  }

  if (laneKey === "cancelledOrParked") {
    const requiredCells = cleanRequiredCells([row.ID, row.Work, row.Reason]);
    if (!requiredCells) return null;

    const [id, work, note] = requiredCells;
    return {
      id,
      work,
      note,
      sourceRef: `${filePath}#cancelled-or-parked`,
    };
  }

  const requiredCells = cleanRequiredCells([
    row.ID,
    row.Work,
    row["Why Now"] ?? row.Trigger ?? row["Why Later"],
    row["Detail Ref"],
  ]);
  if (!requiredCells) return null;

  const [id, work, note, detailRef] = requiredCells;
  return {
    id,
    work,
    note,
    detailRef,
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
  const cells = [];
  let cell = "";
  const content = line.slice(1, -1);

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === "\\" && nextCharacter === "|") {
      cell += "|";
      index += 1;
      continue;
    }

    if (character === "|") {
      cells.push(cell);
      cell = "";
      continue;
    }

    cell += character;
  }

  cells.push(cell);
  return cells;
}

function cleanCell(value = "") {
  return value
    .trim()
    .replace(/^`|`$/g, "")
    .trim();
}

function cleanRequiredCells(values) {
  const cells = values.map((value) => cleanCell(value));
  return cells.every(isRealCell) ? cells : null;
}

function isRealCell(value) {
  return Boolean(value) && value !== "-" && !/<[^>]*>/.test(value);
}

function toAnchor(laneKey) {
  return laneKey.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
