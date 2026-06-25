---
name: mcp-worker-prompt
description: "Use when delegating work to a local model worker, Ollama worker, nested Codex exec, MCP worker, or any cheap coding sub-agent that tends to hallucinate, over-edit, skip verification, or needs narrow file-scoped prompts."
---

# MCP Worker Prompt

Use local workers as narrow executors, not planners. The outer agent owns judgment, task slicing, review, and acceptance.

## When to use

Use this before calling tools like `run_local_model_task` or any local/Ollama-backed coding worker.

Do not use this for broad product planning, architecture decisions, security-sensitive work, or tasks where the worker must infer intent from repo context.

## Core rule

Give the worker one small, file-scoped task with explicit verification. Never ask it to “inspect and implement” unless the inspection target is a named file list.

## Prompt template

```text
Task: <one sentence>

Change scope:
- Create/edit exactly these files:
  - <path>
- Do not edit any other files.

Required behavior:
- <observable requirement 1>
- <observable requirement 2>

Constraints:
- Do not install dependencies.
- Do not run network commands.
- Use only existing tooling.
- Code comments must be in English.
- If you are unsure, stop and explain instead of guessing.

Verification:
Run these commands:
- <command 1>
- <command 2>

Expected outputs:
- <expected output 1>
- <expected output 2>

Final answer:
- List files changed.
- List commands run.
- List observed outputs.
```

## Good task shape

```text
Create exactly one new file named worker-sum.mjs at the repository root.
It must read integer CLI args, ignore non-integers, print their sum, and print 0 when no valid integers exist.
Do not edit any existing files. Do not install dependencies. Do not run network commands.
Run:
- node worker-sum.mjs 1 2 abc 3
- node worker-sum.mjs abc
Expected outputs:
- 6
- 0
```

## Bad task shape

```text
Inspect the repo and add the feature.
```

Why bad:

- scope is undefined
- worker chooses files
- verification is missing
- high chance of fake success or unrelated edits

## Review every run

After the worker returns, inspect artifacts before trusting it:

```bash
RUN=.codex/ollama-worker-runs/<runId>
cat "$RUN/final.md"
grep -nE '^(exec|/bin/zsh| succeeded|codex|tokens used|warning:)' "$RUN/stderr.log"
cat "$RUN/patch.diff"
git status --short
```

Treat files as:

- `final.md`: what the worker claims
- `stderr.log`: what actually ran
- `patch.diff`: reviewable diff, including untracked new files when the worker supports it
- `git status`: source of truth for remaining workspace state

## Failure handling

If the worker fails, do not retry with a broader prompt.

1. Read `stderr.log`.
2. Identify the exact miss: no exec, wrong file, empty file, wrong output, unrelated edits.
3. Retry with a smaller correction prompt that names the current file and exact expected result.
4. Verify independently from the outer agent.

## Completion check

- The prompt names exact file paths.
- The prompt forbids unrelated edits, installs, and network commands.
- Verification commands and expected outputs are listed.
- The worker final answer includes observed outputs.
- The outer agent checked artifacts and actual workspace state.
