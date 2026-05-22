#!/usr/bin/env node

import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MARKETPLACE_CATEGORY = "Productivity";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");
const sourcePluginsRoot = path.join(repoRoot, "plugins");
const homeDir = os.homedir();
const personalPluginsRoot = path.join(homeDir, "plugins");
const marketplaceRoot = path.join(homeDir, ".agents", "plugins");
const marketplacePath = path.join(marketplaceRoot, "marketplace.json");

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const allPlugins = args.includes("--all");
const skipMarketplace = args.includes("--no-marketplace");
const pluginName = args.find((arg) => !arg.startsWith("--")) ?? "engineering";

async function main() {
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const pluginNames = allPlugins ? await listPluginNames() : [pluginName];

  for (const name of pluginNames) {
    await validatePluginName(name);
    const sourcePluginRoot = path.join(sourcePluginsRoot, name);
    const plugin = await readPlugin(sourcePluginRoot, name);
    await validateSkills(plugin);
    await validateIndex(plugin);

    if (checkOnly) {
      printSummary(plugin, "check");
      continue;
    }

    const targetPluginRoot = path.join(personalPluginsRoot, name);
    await copyPlugin(sourcePluginRoot, targetPluginRoot);

    if (!skipMarketplace) {
      await writeMarketplaceEntry(plugin);
    }

    printSummary(plugin, skipMarketplace ? "package" : "install");
  }
}

async function listPluginNames() {
  if (!existsSync(sourcePluginsRoot)) {
    throw new Error("No plugins directory found. Expected plugins/<plugin-name>.");
  }

  const entries = await readdir(sourcePluginsRoot, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();

  if (names.length === 0) {
    throw new Error("No plugins found under plugins/<plugin-name>.");
  }

  return names;
}

async function readPlugin(sourcePluginRoot, expectedName) {
  const manifestPath = path.join(sourcePluginRoot, ".codex-plugin", "plugin.json");
  const skillsRoot = path.join(sourcePluginRoot, "skills");

  if (!existsSync(manifestPath)) {
    throw new Error(`${relative(sourcePluginRoot)} must include .codex-plugin/plugin.json.`);
  }

  if (!existsSync(skillsRoot)) {
    throw new Error(`${relative(sourcePluginRoot)} must include skills/.`);
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.name !== expectedName) {
    throw new Error(
      `${relative(manifestPath)} name must be "${expectedName}", got "${manifest.name ?? ""}".`,
    );
  }

  if (manifest.skills !== "./skills/") {
    throw new Error(`${relative(manifestPath)} skills must be "./skills/".`);
  }

  return {
    name: expectedName,
    sourceRoot: sourcePluginRoot,
    manifest,
    skillsRoot,
    manifestPath,
  };
}

async function validateSkills(plugin) {
  const entries = await readdir(plugin.skillsRoot, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;

    const skillRoot = path.join(plugin.skillsRoot, entry.name);
    const skillMdPath = path.join(skillRoot, "SKILL.md");
    if (!existsSync(skillMdPath)) {
      throw new Error(`${relative(skillRoot)} must include SKILL.md.`);
    }

    const frontmatter = await readFrontmatter(skillMdPath);
    if (frontmatter.name !== entry.name) {
      throw new Error(
        `${relative(skillMdPath)} frontmatter name must be "${entry.name}", got "${frontmatter.name ?? ""}".`,
      );
    }

    skills.push({
      name: entry.name,
      sourceRoot: skillRoot,
      indexPath: `plugins/${plugin.name}/skills/${entry.name}`,
    });
  }

  if (skills.length === 0) {
    throw new Error(`${relative(plugin.skillsRoot)} must include at least one skill.`);
  }

  validateDuplicateSkillNames(skills, plugin.name);
  plugin.skills = skills.sort((a, b) => a.name.localeCompare(b.name));
}

async function readFrontmatter(skillMdPath) {
  const contents = await readFile(skillMdPath, "utf8");
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);

  if (!match) {
    throw new Error(`${relative(skillMdPath)} must start with closed YAML frontmatter.`);
  }

  const frontmatterText = match[1];
  const nameMatch = frontmatterText.match(/^name:\s*["']?([^"'\r\n]+)["']?\s*$/m);
  const descriptionMatch = frontmatterText.match(/^description:\s*(.+)$/m);

  if (!nameMatch) {
    throw new Error(`${relative(skillMdPath)} frontmatter must include a non-empty name.`);
  }

  if (!descriptionMatch || descriptionMatch[1].trim().length === 0) {
    throw new Error(`${relative(skillMdPath)} frontmatter must include a non-empty description.`);
  }

  return {
    name: nameMatch[1].trim(),
  };
}

function validateDuplicateSkillNames(skills, pluginNameForError) {
  const seen = new Set();

  for (const skill of skills) {
    if (seen.has(skill.name)) {
      throw new Error(`Duplicate skill name "${skill.name}" found in plugin "${pluginNameForError}".`);
    }
    seen.add(skill.name);
  }
}

async function validateIndex(plugin) {
  const indexPath = path.join(repoRoot, "INDEX.md");
  const contents = await readFile(indexPath, "utf8");
  const requiredPaths = [`plugins/${plugin.name}`, ...plugin.skills.map((skill) => skill.indexPath)];
  const missing = requiredPaths.filter((requiredPath) => !contents.includes(requiredPath));

  if (missing.length > 0) {
    throw new Error(`INDEX.md is missing path(s): ${missing.join(", ")}.`);
  }
}

async function copyPlugin(sourcePluginRoot, targetPluginRoot) {
  await recreateDirectory(targetPluginRoot);
  await cp(sourcePluginRoot, targetPluginRoot, {
    recursive: true,
    force: true,
    errorOnExist: false,
  });
}

async function writeMarketplaceEntry(plugin) {
  await mkdir(marketplaceRoot, { recursive: true });

  const marketplace = await readMarketplace();
  const entry = createMarketplaceEntry(plugin.name);
  const plugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];
  const firstExistingIndex = plugins.findIndex((candidate) => candidate?.name === plugin.name);
  const withoutDuplicates = plugins.filter((candidate) => candidate?.name !== plugin.name);

  if (firstExistingIndex === -1) {
    withoutDuplicates.push(entry);
    marketplace.plugins = withoutDuplicates;
  } else {
    withoutDuplicates.splice(firstExistingIndex, 0, entry);
    marketplace.plugins = withoutDuplicates;
  }

  await writeJson(marketplacePath, marketplace);
}

async function readMarketplace() {
  if (!existsSync(marketplacePath)) {
    return {
      name: "personal",
      interface: {
        displayName: "Personal",
      },
      plugins: [],
    };
  }

  const raw = await readFile(marketplacePath, "utf8");
  const marketplace = JSON.parse(raw);

  if (!marketplace || typeof marketplace !== "object" || Array.isArray(marketplace)) {
    throw new Error(`${marketplacePath} must contain a JSON object.`);
  }

  marketplace.name ||= "personal";
  marketplace.interface =
    marketplace.interface && typeof marketplace.interface === "object"
      ? marketplace.interface
      : { displayName: "Personal" };
  marketplace.interface.displayName ||= "Personal";
  marketplace.plugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : [];

  return marketplace;
}

function createMarketplaceEntry(name) {
  return {
    name,
    source: {
      source: "local",
      path: `./plugins/${name}`,
    },
    policy: {
      installation: "AVAILABLE",
      authentication: "ON_INSTALL",
    },
    category: MARKETPLACE_CATEGORY,
  };
}

async function recreateDirectory(targetPath) {
  const resolved = path.resolve(targetPath);
  const resolvedPersonalPluginsRoot = path.resolve(personalPluginsRoot);

  if (!resolved.startsWith(`${resolvedPersonalPluginsRoot}${path.sep}`)) {
    throw new Error(`Refusing to recreate unsafe path: ${targetPath}`);
  }

  await rm(targetPath, { recursive: true, force: true });
  await mkdir(targetPath, { recursive: true });
}

async function writeJson(targetPath, payload) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function validatePluginName(name) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(`Invalid plugin name "${name}". Use kebab-case.`);
  }
}

function printSummary(plugin, mode) {
  const action =
    mode === "check" ? "Checked" : mode === "install" ? "Installed" : "Packaged";

  console.log(`${action} plugin ${plugin.name}:`);
  for (const skill of plugin.skills) {
    console.log(`- ${skill.indexPath}`);
  }

  if (mode !== "check") {
    console.log(`Plugin root: ${path.join(personalPluginsRoot, plugin.name)}`);
    if (!skipMarketplace) {
      console.log(`Marketplace: ${marketplacePath}`);
    }
  }
}

function printHelp() {
  console.log(`Usage:
  node scripts/package-plugin.mjs [plugin-name] [--check] [--no-marketplace]
  node scripts/package-plugin.mjs --all [--check] [--no-marketplace]

Examples:
  node scripts/package-plugin.mjs engineering --check
  node scripts/package-plugin.mjs engineering
  node scripts/package-plugin.mjs engineering --no-marketplace
  node scripts/package-plugin.mjs --all --check

Defaults:
  plugin-name: engineering
  source:      plugins/<plugin-name>
  target:      ~/plugins/<plugin-name>
  marketplace: ~/.agents/plugins/marketplace.json
`);
}

function relative(targetPath) {
  return path.relative(repoRoot, targetPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
