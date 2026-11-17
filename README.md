# My Skills Hub

Reusable Codex skills and a local DSH image-generation plugin.

[繁體中文](README.zh-Hant.md) · [Catalog](INDEX.md)

## Find what you need

- [Skills](INDEX.md#skills): session knowledge extraction and repository documentation maintenance. Each folder under `skills/` is independently installable.
- [DSH /imagen](plugins/dsh-imagen/README.md): generate PNG images through a signed-in Codex CLI. Installation, development, and verification are documented with the plugin.

## Install a skill

Copy the entire `skills/<skill-name>/` folder into `~/.codex/skills/<skill-name>/`, including supporting files. Then ask Codex to use it:

```text
Use $distill-session-knowledge to extract reusable lessons and workflows from this session.
```

Session distillation proposes changes in the conversation by default. It writes files when authorized; global skill edits require explicit approval for that change.

## Maintain this repository

Follow [AGENTS.md](AGENTS.md). Keep the [catalog](INDEX.md) current; put component-specific instructions alongside the component. Dependency directories, caches, and generated plugin bundles are ignored by Git.
