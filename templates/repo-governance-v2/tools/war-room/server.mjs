#!/usr/bin/env node

import http from "node:http";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseRoadmapMarkdown } from "./lib/parse-roadmap.mjs";
import { parseEpicMarkdown } from "./lib/parse-epics.mjs";
import { detectDrift } from "./lib/detect-drift.mjs";
import { renderDashboardHtml } from "./lib/render-html.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const toolRoot = path.dirname(scriptPath);
const defaultRepoRoot = path.resolve(toolRoot, "../..");

async function main() {
  const repoRoot = path.resolve(process.argv[2] ?? defaultRepoRoot);
  const port = parsePort(process.env.PORT ?? "4767");

  const server = http.createServer(async (_request, response) => {
    try {
      const model = await readDashboardModel(repoRoot);
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(renderDashboardHtml(model));
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : String(error));
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`War Room Dashboard: http://127.0.0.1:${port}`);
    console.log(`Repo root: ${repoRoot}`);
  });
}

export async function readDashboardModel(root) {
  const roadmapPath = path.join(root, "docs/governance/local/roadmap.md");
  const epicsRoot = path.join(root, "docs/governance/local/epics");

  if (!existsSync(roadmapPath)) {
    throw new Error(`Missing roadmap file: ${roadmapPath}`);
  }

  if (!existsSync(epicsRoot)) {
    throw new Error(`Missing epics directory: ${epicsRoot}`);
  }

  const roadmapMarkdown = await readFile(roadmapPath, "utf8");
  const roadmap = parseRoadmapMarkdown(roadmapMarkdown, "docs/governance/local/roadmap.md");
  const epicFiles = await listEpicFiles(epicsRoot);
  const epics = await Promise.all(
    epicFiles.map(async (fileName) => {
      const absolutePath = path.join(epicsRoot, fileName);
      const markdown = await readFile(absolutePath, "utf8");
      return parseEpicMarkdown(markdown, `docs/governance/local/epics/${fileName}`);
    }),
  );
  const warnings = detectDrift({ roadmap, epics });

  return { roadmap, epics, warnings };
}

export function parsePort(value) {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${value}`);
  }

  return port;
}

async function listEpicFiles(epicsRoot) {
  const entries = await readdir(epicsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^E-\d+-.+\.md$/.test(name))
    .filter((name) => !name.endsWith(".example.md"))
    .sort();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
