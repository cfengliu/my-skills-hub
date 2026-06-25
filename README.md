# My Skills Hub

A central place for installable Codex plugins, standalone skills that are not productized yet, and templates that can be copied into other repositories.

## Repository areas

- `plugins/`: Productized, installable Codex plugins.
- `mcps/`: Local MCP server source trees.
- `skills/`: Standalone skills that are still incubating and have not been promoted into plugins.
- `templates/`: Copyable governance, workflow, or project scaffold templates for other repositories.
- `INDEX.md`: The full catalog. Update it whenever a plugin, skill, or template is added, moved, renamed, or deleted.

## Current assets

- `plugins/engineering`: A Codex plugin for engineering design, boundaries, change safety, security, failure modes, verification, and simplicity.
- `mcps/local-ollama-worker`: A local MCP server for bounded Ollama-backed Codex worker tasks.
- `skills/reviews/first-principles-review`: A first-principles review skill for documents, designs, architecture, code, or diffs.
- `skills/agent-workflows/task-harness`: A skill for turning work into executable, verifiable, and delegable task harnesses.
- `templates/repo-governance`: An AI collaboration governance scaffold.
- `templates/repo-governance-v2`: An upgradeable full AI collaboration governance kit.

See [`INDEX.md`](INDEX.md) for the complete catalog.

## Plugin package / install

Check one plugin:

```bash
node scripts/package-plugin.mjs engineering --check
```

Sync one plugin to the local Codex plugin location and update the personal marketplace:

```bash
node scripts/package-plugin.mjs engineering
```

Check all plugins:

```bash
node scripts/package-plugin.mjs --all --check
```

See [`docs/package-plugin.md`](docs/package-plugin.md) for details.

## Maintenance rules

- Do not keep the same skill in both `plugins/` and `skills/`.
- Every plugin must include `.codex-plugin/plugin.json`.
- Every skill must be self-contained, with its main content in its own `SKILL.md`.
- A `SKILL.md` frontmatter `name` must match the skill folder name.
- Do not create empty supporting folders.
- Do not create `dist/` by default; only add it if the runtime cannot discover nested skills.
- After changes, verify Markdown structure, skill names, plugin metadata, and `INDEX.md` coverage.
