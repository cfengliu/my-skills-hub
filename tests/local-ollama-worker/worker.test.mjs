import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import {
  buildCodexArgs,
  createRunId,
  resolveAllowedRepoPath,
  runLocalModelTask,
} from "../../mcps/local-ollama-worker/src/worker.ts";

async function withTempRepo(callback) {
  const root = await mkdtemp(path.join(tmpdir(), "ollama-worker-test-"));

  try {
    await mkdir(path.join(root, ".git"), { recursive: true });
    return await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("resolveAllowedRepoPath requires an explicit repoPath when cwd is not a git repo", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "ollama-worker-not-repo-"));

  try {
    await assert.rejects(
      () =>
        resolveAllowedRepoPath({
          repoPath: undefined,
          processCwd: root,
          allowedRoots: [root],
        }),
      /repoPath is required/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("resolveAllowedRepoPath accepts repo paths inside allowed roots", async () => {
  await withTempRepo(async (repoRoot) => {
    const resolved = await resolveAllowedRepoPath({
      repoPath: repoRoot,
      processCwd: "/does/not/matter",
      allowedRoots: [path.dirname(repoRoot)],
    });

    assert.equal(resolved, await realpath(repoRoot));
  });
});

test("resolveAllowedRepoPath rejects repo paths outside allowed roots", async () => {
  await withTempRepo(async (repoRoot) => {
    const allowedRoot = await realpath(process.cwd());
    await assert.rejects(
      () =>
        resolveAllowedRepoPath({
          repoPath: repoRoot,
          processCwd: "/does/not/matter",
          allowedRoots: [allowedRoot],
        }),
      /not under OLLAMA_WORKER_ALLOWED_ROOTS/,
    );
  });
});

test("resolveAllowedRepoPath ignores missing allowed roots when another root allows the repo", async () => {
  await withTempRepo(async (repoRoot) => {
    const resolved = await resolveAllowedRepoPath({
      repoPath: repoRoot,
      processCwd: "/does/not/matter",
      allowedRoots: [path.join(repoRoot, "missing-root"), path.dirname(repoRoot)],
    });

    assert.equal(resolved, await realpath(repoRoot));
  });
});

test("createRunId includes a random suffix to avoid same-second collisions", () => {
  const first = createRunId(new Date("2026-06-25T12:34:56.000Z"));
  const second = createRunId(new Date("2026-06-25T12:34:56.000Z"));

  assert.match(first, /^20260625-123456-[a-f0-9]{8}$/);
  assert.match(second, /^20260625-123456-[a-f0-9]{8}$/);
  assert.notEqual(first, second);
});

test("buildCodexArgs puts approval mode before exec and prompt stdin marker last", () => {
  const args = buildCodexArgs({
    model: "qwen2.5-coder:14b",
    localProvider: "ollama",
    worktree: "/tmp/worktree",
    finalMessagePath: "/tmp/out/final.md",
  });

  assert.deepEqual(args.slice(0, 3), ["--ask-for-approval", "never", "exec"]);
  assert.ok(args.includes("--ignore-user-config"));
  assert.ok(args.includes("--oss"));
  assert.deepEqual(args.slice(args.indexOf("--local-provider"), args.indexOf("--local-provider") + 2), [
    "--local-provider",
    "ollama",
  ]);
  assert.ok(args.includes("--ephemeral"));
  assert.equal(args.at(-1), "-");
});

test("runLocalModelTask writes artifacts and returns paths without embedding patch content", async () => {
  await withTempRepo(async (repoRoot) => {
    const calls = [];
    const result = await runLocalModelTask(
      {
        task: "Add tests",
        repoPath: repoRoot,
        model: "local-model",
      },
      {
        processCwd: "/not/a/repo",
        allowedRoots: [path.dirname(repoRoot)],
        outputRoot: path.join(repoRoot, ".ollama-worker-runs"),
        spawnCodex: async (command, args, options) => {
          calls.push({ command, args, options });
          await writeFile(path.join(options.outputDir, "final.md"), "final message", "utf8");
          return { exitCode: 0, stdout: "ok", stderr: "" };
        },
        collectDiff: async () => "diff --git a/file b/file\n",
      },
    );

    assert.equal(calls[0].command, "codex");
    assert.equal(calls[0].options.input, "Add tests");
    assert.equal(result.model, "local-model");
    assert.equal(result.status, "completed");
    assert.equal(result.patch, undefined);
    assert.match(result.artifacts.patchPath, /patch\.diff$/);
    assert.match(result.artifacts.finalMessagePath, /final\.md$/);
  });
});
