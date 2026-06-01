import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { readDashboardModel, parsePort } from "../../templates/repo-governance-v2/tools/war-room/server.mjs";

async function withGovernanceTree(callback) {
  const root = await mkdtemp(path.join(tmpdir(), "war-room-server-"));

  try {
    await mkdir(path.join(root, "docs/governance/local/epics"), { recursive: true });
    return await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function writeRoadmap(root, markdown) {
  await writeFile(path.join(root, "docs/governance/local/roadmap.md"), markdown, "utf8");
}

async function writeEpic(root, fileName, markdown) {
  await writeFile(path.join(root, "docs/governance/local/epics", fileName), markdown, "utf8");
}

const roadmapMarkdown = `# Roadmap

## Now

| ID | Work | Why Now | Detail Ref |
|---|---|---|---|
| \`E-101A\` | Server MVP | Needed locally | \`epics/E-101-server.md\` |

## Done Recently

| ID | Completed Work | Evidence Ref |
|---|---|---|
| \`E-101-001\` | Server model | \`epics/E-101-server.md\` |
`;

const epicMarkdown = `# E-101 Server Dashboard

## Status

in-progress

## Delivery Slices

### E-101A Server MVP

- delivery status: done
- covers: E-101-001

## Requirement List

### E-101-001 Load Model

- type: accepted
- delivery status: done
- acceptance status: accepted
- Slice: E-101A
- PRD: not-needed
- TDD: not-needed
- existing evidence:
  - tests/war-room/server.test.mjs
`;

test("readDashboardModel builds roadmap, epics, and warnings from a governance tree", async () => {
  await withGovernanceTree(async (root) => {
    await writeRoadmap(root, roadmapMarkdown);
    await writeEpic(root, "E-101-server.md", epicMarkdown);

    const model = await readDashboardModel(root);

    assert.equal(model.roadmap.lanes.now[0].id, "E-101A");
    assert.equal(model.epics.length, 1);
    assert.equal(model.epics[0].id, "E-101");
    assert.deepEqual(model.warnings, []);
  });
});

test("readDashboardModel reports a clear missing roadmap error", async () => {
  await withGovernanceTree(async (root) => {
    await assert.rejects(
      readDashboardModel(root),
      new RegExp(`Missing roadmap file: ${root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/docs/governance/local/roadmap\\.md`),
    );
  });
});

test("readDashboardModel reports a clear missing epics directory error", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "war-room-server-"));

  try {
    await mkdir(path.join(root, "docs/governance/local"), { recursive: true });
    await writeRoadmap(root, roadmapMarkdown);

    await assert.rejects(
      readDashboardModel(root),
      new RegExp(`Missing epics directory: ${root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/docs/governance/local/epics`),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("readDashboardModel ignores example epic files", async () => {
  await withGovernanceTree(async (root) => {
    await writeRoadmap(root, roadmapMarkdown);
    await writeEpic(root, "E-101-server.md", epicMarkdown);
    await writeEpic(root, "README.example.md", "# E-999 README Example\n");
    await writeEpic(root, "E-001-sample.example.md", "# E-001 Sample Example\n");

    const model = await readDashboardModel(root);

    assert.deepEqual(model.epics.map((epic) => epic.filePath), [
      "docs/governance/local/epics/E-101-server.md",
    ]);
  });
});

test("dynamic import exposes helpers without starting the server", async () => {
  const module = await import("../../templates/repo-governance-v2/tools/war-room/server.mjs?smoke");

  assert.equal(typeof module.readDashboardModel, "function");
});

test("dynamic import exposes helpers even when PORT is invalid", async () => {
  const originalPort = process.env.PORT;
  process.env.PORT = "abc";

  try {
    const module = await import("../../templates/repo-governance-v2/tools/war-room/server.mjs?invalid-port-smoke");

    assert.equal(typeof module.readDashboardModel, "function");
  } finally {
    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
  }
});

test("parsePort reports invalid PORT values clearly", () => {
  assert.throws(() => parsePort("abc"), /Invalid PORT: abc/);
});
