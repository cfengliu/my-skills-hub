# My Skills Hub

Reusable, independently installable Codex skills for task handoffs, session knowledge, documentation maintenance, and critical reviews.

[繁體中文](README.zh-Hant.md) · [Skill index](INDEX.md)

## Skills

| Skill | When to use it | What it produces |
|---|---|---|
| [task-harness](skills/task-harness/) | Prepare a task for another person or agent, repeated execution, or automation. | A copyable task contract with context, scope, deliverables, and observable acceptance criteria. |
| [distill-session-knowledge](skills/distill-session-knowledge/) | Extract useful lessons or repeatable workflows from a coding session, transcript, or agent run. | Evidence-backed lessons or runnable workflow cards, with scope, decisions, checks, and recommendations for where to preserve them. |
| [repository-drift-control](skills/repository-drift-control/) | Repository documentation contains repeated rules, stale instructions, conflicting sources, or unnecessary structure. | Focused document edits that consolidate ownership and remove noise while preserving accepted decisions, evidence, and hard gates. |
| [first-principles-review](skills/first-principles-review/) | Challenge a document, proposal, design, code module, or diff before trusting it. | Findings about assumptions, invariants, false confidence, and unnecessary complexity, plus a simpler direction and missing evidence. |

Use `task-harness` before handing work off, `distill-session-knowledge` to preserve what a session taught you, `repository-drift-control` to maintain existing documentation, and `first-principles-review` to assess whether an artifact deserves your confidence.

## Installation and use

Each skill lives directly under `skills/<skill-name>/`. Copy the entire folder into `~/.codex/skills/<skill-name>/`, including any supporting files.

Ask Codex to use the installed skill, for example:

```text
Use $distill-session-knowledge to extract reusable lessons and workflows from this session.
```

Session distillation proposes changes in the conversation by default. It writes files when authorized; global skill edits require explicit approval for that change.

## Maintenance

Follow [AGENTS.md](AGENTS.md). Keep [INDEX.md](INDEX.md), both README language versions, and affected references aligned when adding, renaming, merging, or deleting a skill.
