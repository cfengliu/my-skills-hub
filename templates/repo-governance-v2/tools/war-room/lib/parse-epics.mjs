export function parseEpicMarkdown(markdown, filePath) {
  const heading = parseEpicHeading(markdown, filePath);
  const deliverySlicesSection = extractSection(markdown, "Delivery Slices");
  const requirementListSection = extractSection(markdown, "Requirement List");

  return {
    id: heading.id,
    title: heading.title,
    status: firstNonEmptyLine(extractSection(markdown, "Status")),
    filePath,
    sourceRef: filePath,
    slices: splitH3Blocks(deliverySlicesSection).map((block) => parseSliceBlock(block, filePath)),
    requirements: splitH3Blocks(requirementListSection).map((block) =>
      parseRequirementBlock(block, filePath),
    ),
  };
}

function parseEpicHeading(markdown, filePath) {
  const headingLine = markdown
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith("# "));
  const match = headingLine?.trim().match(/^#\s+(E-\d+)\s*(.*)$/);

  return {
    id: match?.[1] ?? inferEpicId(filePath),
    title: cleanValue(match?.[2] ?? ""),
  };
}

function inferEpicId(filePath) {
  return filePath.match(/(?:^|\/)(E-\d+)[^/]*$/)?.[1] ?? "";
}

function parseSliceBlock(block, filePath) {
  const heading = parseH3Heading(block.heading, /^(E-\d+[A-Z])\s*(.*)$/);

  return {
    id: heading.id,
    title: heading.title,
    deliveryStatus: fieldValue(block.body, "delivery status"),
    covers: splitCommaList(fieldValue(block.body, "covers")),
    sourceRef: `${filePath}#${slugify(block.heading)}`,
  };
}

function parseRequirementBlock(block, filePath) {
  const heading = parseH3Heading(block.heading, /^(E-\d+-\d+)\s*(.*)$/);

  return {
    id: heading.id,
    title: heading.title,
    type: fieldValue(block.body, "type"),
    deliveryStatus: fieldValue(block.body, "delivery status"),
    acceptanceStatus: fieldValue(block.body, "acceptance status"),
    slice: fieldValue(block.body, "Slice"),
    prd: fieldValue(block.body, "PRD"),
    tdd: fieldValue(block.body, "TDD"),
    existingEvidence: listUnderField(block.body, "existing evidence"),
    sourceRef: `${filePath}#${slugify(block.heading)}`,
  };
}

function parseH3Heading(heading, pattern) {
  const match = heading.match(pattern);

  return {
    id: match?.[1] ?? "",
    title: cleanValue(match?.[2] ?? ""),
  };
}

function extractSection(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const headingLine = `## ${heading}`;
  const startIndex = lines.findIndex((line) => line.trim() === headingLine);
  if (startIndex === -1) return "";

  const endIndex = lines.findIndex(
    (line, index) => index > startIndex && /^##\s+/.test(line),
  );
  const sectionEnd = endIndex === -1 ? lines.length : endIndex;
  return lines.slice(startIndex + 1, sectionEnd).join("\n");
}

function splitH3Blocks(section) {
  const lines = section.split(/\r?\n/);
  const blocks = [];
  let currentBlock = null;

  for (const line of lines) {
    const headingMatch = line.trim().match(/^###\s+(.+)$/);
    if (headingMatch) {
      if (currentBlock) blocks.push(finalizeBlock(currentBlock));
      currentBlock = { heading: headingMatch[1].trim(), bodyLines: [] };
      continue;
    }

    if (currentBlock) currentBlock.bodyLines.push(line);
  }

  if (currentBlock) blocks.push(finalizeBlock(currentBlock));
  return blocks;
}

function finalizeBlock(block) {
  return {
    heading: block.heading,
    body: block.bodyLines.join("\n"),
  };
}

function firstNonEmptyLine(section) {
  return cleanValue(section.split(/\r?\n/).find((line) => cleanValue(line)) ?? "");
}

function fieldValue(markdown, fieldName) {
  const fieldPattern = escapeRegex(fieldName).replace(/\s+/g, "\\s+");
  const match = markdown.match(new RegExp(`^\\s*-\\s*${fieldPattern}\\s*:\\s*(.*)$`, "im"));
  return cleanValue(match?.[1] ?? "");
}

function listUnderField(markdown, fieldName) {
  const lines = markdown.split(/\r?\n/);
  const fieldPattern = new RegExp(
    `^\\s*-\\s*${escapeRegex(fieldName).replace(/\s+/g, "\\s+")}\\s*:\\s*(.*)$`,
    "i",
  );
  const fieldIndex = lines.findIndex((line) => fieldPattern.test(line));
  if (fieldIndex === -1) return [];

  const values = [];
  for (let index = fieldIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*-\s+[^:]+:\s*/.test(line)) break;

    const itemMatch = line.match(/^\s{2,}-\s*(.*)$/);
    if (!itemMatch) {
      if (!line.trim()) continue;
      break;
    }

    const value = cleanValue(itemMatch[1]);
    if (isRealValue(value)) values.push(value);
  }

  return values;
}

function splitCommaList(value) {
  return value
    .split(",")
    .map(cleanValue)
    .filter(isRealValue);
}

function cleanValue(value = "") {
  return value.trim().replace(/^`|`$/g, "").trim();
}

function isRealValue(value) {
  return Boolean(value) && value !== "-" && !/^<[^>]*>$/.test(value);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
