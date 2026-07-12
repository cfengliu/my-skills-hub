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

  const resolvedRoots = await resolveExistingRoots(allowedRoots);
  if (resolvedRoots.length === 0) {
    throw new Error("OLLAMA_WORKER_ALLOWED_ROOTS does not contain any existing directories.");
  }

  const allowed = resolvedRoots.some((root) => isPathInside(resolvedRepo, root));
  if (!allowed) {
    throw new Error(`repoPath is not under OLLAMA_WORKER_ALLOWED_ROOTS: ${resolvedRepo}`);
  }

  return resolvedRepo;
}

async function resolveExistingRoots(roots) {
  const resolved = [];

  for (const root of roots) {
    try {
      resolved.push(await realpath(path.resolve(root)));
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }

  return resolved;
}

export function buildCodexArgs({ model, localProvider = "ollama", worktree, finalMessagePath }) {
  return [
    "--ask-for-approval",
    "never",
    "exec",
    "--ignore-user-config",
    "--oss",
    "--local-provider",
    localProvider,
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
  const localProvider = process.env.OLLAMA_WORKER_LOCAL_PROVIDER || "ollama";
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
    localProvider,
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

async function collectGitDiff(repo) {
  const trackedDiff = await runGit(repo, ["diff", "--binary"]);
  const untrackedFilesRaw = await runGit(repo, ["ls-files", "--others", "--exclude-standard", "-z"]);
  const untrackedFiles = untrackedFilesRaw.split("\0").filter(Boolean);
  const untrackedDiffs = [];

  for (const file of untrackedFiles) {
    const diff = await runGit(repo, ["diff", "--binary", "--no-index", "--", "/dev/null", file], {
      allowExitCodes: [0, 1],
    });
    untrackedDiffs.push(normalizeNoIndexDiff(diff, file));
  }

  return [trackedDiff, ...untrackedDiffs].filter(Boolean).join("\n");
}

function runGit(repo, args, { allowExitCodes = [0] } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd: repo,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("close", (exitCode) => {
      const code = exitCode ?? 1;
      if (!allowExitCodes.includes(code)) {
        reject(new Error(Buffer.concat(stderr).toString("utf8") || `git ${args.join(" ")} failed`));
        return;
      }
      resolve(Buffer.concat(stdout).toString("utf8"));
    });
    child.on("error", reject);
  });
}

function normalizeNoIndexDiff(diff, file) {
  return diff
    .replace(/^diff --git a\/dev\/null b\/(.+)$/m, `diff --git a/${file} b/${file}`)
    .replace(/^--- \/dev\/null$/m, "--- /dev/null")
    .replace(/^\+\+\+ b\/(.+)$/m, `+++ b/${file}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = await readFile(0, "utf8");
  const result = await runLocalModelTask(JSON.parse(raw));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
