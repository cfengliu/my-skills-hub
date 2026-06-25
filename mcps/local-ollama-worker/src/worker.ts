import { randomBytes } from "node:crypto";
import { createWriteStream } from "node:fs";
import { access, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

export function createRunId(date = new Date()) {
  const stamp = date.toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  return `${stamp}-${randomBytes(4).toString("hex")}`;
}

export function parseAllowedRoots(value = process.env.OLLAMA_WORKER_ALLOWED_ROOTS) {
  return String(value ?? "")
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function resolveAllowedRepoPath({
  repoPath,
  processCwd = process.cwd(),
  allowedRoots = parseAllowedRoots(),
} = {}) {
  const candidate = repoPath ? path.resolve(repoPath) : processCwd;
  const resolvedRepo = await realpath(candidate);

  if (!(await isGitRepo(resolvedRepo))) {
    if (!repoPath) {
      throw new Error("repoPath is required because the MCP process cwd is not a git repo.");
    }
    throw new Error(`repoPath is not a git repo: ${resolvedRepo}`);
  }

  if (allowedRoots.length === 0) {
    throw new Error("OLLAMA_WORKER_ALLOWED_ROOTS must include at least one allowed root.");
  }

  const resolvedRoots = await Promise.all(allowedRoots.map((root) => realpath(path.resolve(root))));
  const allowed = resolvedRoots.some((root) => isPathInside(resolvedRepo, root));
  if (!allowed) {
    throw new Error(`repoPath is not under OLLAMA_WORKER_ALLOWED_ROOTS: ${resolvedRepo}`);
  }

  return resolvedRepo;
}

export function buildCodexArgs({ model, worktree, finalMessagePath }) {
  return [
    "--ask-for-approval",
    "never",
    "exec",
    "--ignore-user-config",
    "--oss",
    "--model",
    model,
    "--cd",
    worktree,
    "--sandbox",
    "workspace-write",
    "--ephemeral",
    "--output-last-message",
    finalMessagePath,
    "-",
  ];
}

export async function runLocalModelTask(input, options = {}) {
  validateInput(input);

  const repo = await resolveAllowedRepoPath({
    repoPath: input.repoPath,
    processCwd: options.processCwd,
    allowedRoots: options.allowedRoots,
  });
  const model = input.model || process.env.OLLAMA_WORKER_DEFAULT_MODEL || "qwen2.5-coder:14b";
  const runId = createRunId();
  const outputRoot = options.outputRoot || path.join(repo, ".codex", "ollama-worker-runs");
  const outputDir = path.join(outputRoot, runId);
  const finalMessagePath = path.join(outputDir, "final.md");
  const patchPath = path.join(outputDir, "patch.diff");
  const stdoutPath = path.join(outputDir, "stdout.log");
  const stderrPath = path.join(outputDir, "stderr.log");

  await mkdir(outputDir, { recursive: true });

  const args = buildCodexArgs({
    model,
    worktree: repo,
    finalMessagePath,
  });

  const spawnCodex = options.spawnCodex || spawnCodexProcess;
  const execution = await spawnCodex("codex", args, {
    cwd: repo,
    input: input.task,
    outputDir,
    stdoutPath,
    stderrPath,
  });

  const collectDiff = options.collectDiff || collectGitDiff;
  const patch = await collectDiff(repo);
  await writeFile(patchPath, patch, "utf8");

  return {
    status: execution.exitCode === 0 ? "completed" : "failed",
    runId,
    repoPath: repo,
    model,
    exitCode: execution.exitCode,
    artifacts: {
      outputDir,
      finalMessagePath,
      patchPath,
      stdoutPath,
      stderrPath,
    },
  };
}

async function isGitRepo(repoPath) {
  try {
    await access(path.join(repoPath, ".git"));
    return true;
  } catch {
    return false;
  }
}

function isPathInside(candidate, root) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function validateInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Input must be an object.");
  }
  if (typeof input.task !== "string" || input.task.trim().length === 0) {
    throw new Error("task is required.");
  }
  if (input.repoPath !== undefined && typeof input.repoPath !== "string") {
    throw new Error("repoPath must be a string when provided.");
  }
  if (input.model !== undefined && typeof input.model !== "string") {
    throw new Error("model must be a string when provided.");
  }
}

function spawnCodexProcess(command, args, options) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });

    const stdout = createWriteStream(options.stdoutPath);
    const stderr = createWriteStream(options.stderrPath);

    child.stdout.pipe(stdout);
    child.stderr.pipe(stderr);
    child.stdin.end(options.input);

    child.on("close", (exitCode) => {
      stdout.end();
      stderr.end();
      resolve({ exitCode: exitCode ?? 1 });
    });

    child.on("error", (error) => {
      stderr.write(`${error.stack || error.message}${os.EOL}`);
      stdout.end();
      stderr.end();
      resolve({ exitCode: 1 });
    });
  });
}

function collectGitDiff(repo) {
  return new Promise((resolve) => {
    const child = spawn("git", ["diff", "--binary"], {
      cwd: repo,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const chunks = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.on("close", () => resolve(Buffer.concat(chunks).toString("utf8")));
    child.on("error", () => resolve(""));
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = await readFile(0, "utf8");
  const result = await runLocalModelTask(JSON.parse(raw));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
