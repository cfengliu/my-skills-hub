# My Skills Hub

Reusable Codex skills and local DSH plugins for Codex image generation, web search, and audio transcription.

[繁體中文](README.zh-Hant.md) · [Catalog](INDEX.md)

## Find what you need

- [Skills](INDEX.md#skills): session knowledge extraction and repository documentation maintenance. Each folder under `skills/` is independently installable.
- [dsh-codex-imagen](plugins/dsh-codex-imagen/README.md): generate PNG images through a signed-in Codex CLI with `/codex-imagen`.
- [dsh-codex-web-search](plugins/dsh-codex-web-search/README.md): research queries using native Codex web search with `/codex-search`.
- [dsh-codex-transcribe](plugins/dsh-codex-transcribe/README.md): dictate into the chat draft with a composer microphone button, or transcribe files with `/codex-transcribe`, using the existing Codex ChatGPT login.

Each plugin documents its installation, development, and verification steps.

## Install a skill

Copy the entire `skills/<skill-name>/` folder into `~/.codex/skills/<skill-name>/`, including supporting files. Then ask Codex to use it:

```text
Use $distill-session-knowledge to extract reusable lessons and workflows from this session.
```

Session distillation proposes changes in the conversation by default. It writes files when authorized; global skill edits require explicit approval for that change.

## Maintain this repository

Follow [AGENTS.md](AGENTS.md). Keep the [catalog](INDEX.md) current; put component-specific instructions alongside the component. Dependency directories, caches, and generated plugin bundles are ignored by Git.
