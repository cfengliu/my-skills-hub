import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(
  await readFile(new URL("../../mcps/local-ollama-worker/package.json", import.meta.url), "utf8"),
);

test("local ollama worker is a local-only npm package", () => {
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.publishConfig, undefined);
  assert.equal(packageJson.name, "ollama-worker-mcp");
});

test("local ollama worker exposes an MCP server bin for npm/npx execution", () => {
  assert.equal(packageJson.bin["ollama-worker-mcp"], "./bin/ollama-worker-mcp");
  assert.equal(packageJson.bin["ollama-worker-cli"], "./bin/ollama-worker-cli");
});

test("local ollama worker builds itself during local npm install", () => {
  assert.equal(packageJson.scripts.prepare, "npm run build");
});
