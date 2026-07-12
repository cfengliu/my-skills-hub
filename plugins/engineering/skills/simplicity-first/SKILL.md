---
name: simplicity-first
description: "Use when choosing architecture, implementation style, abstractions, frameworks, services, or technical scope. Helps avoid overengineering by selecting the simplest boring solution that solves the current proven problem."
---

# Simplicity First

Every layer of complexity becomes future cost.

An extra abstraction, service, framework, config, or workflow is another thing to understand, test, debug, and maintain.

## Purpose

Use the simplest solution that solves the current confirmed problem. Do not pay for imagined future requirements before they are proven.

## Required output

```md
# Simplicity Review

## Smallest viable architecture
- <minimal components>

## Intentionally not building
- <not now>
- <not now>

## Delayed abstractions
| Abstraction | Why not now | Trigger to add later |
|---|---|---|

## Technology choices
| Choice | Reason | Risk | Exit cost |
|---|---|---|---|

## Things to delete or avoid
- <unused abstraction/config/flag/API/dependency>
```

## Process

1. Start with the direct implementation.
2. Avoid microservices, plugin systems, event-driven architecture, workflow engines, multi-tenant architecture, or full admin systems unless the current problem truly needs them.
3. Require evidence before adding abstraction.
4. Prefer boring, mature, debuggable technology.
5. Write obvious code rather than clever code.
6. Delete unused abstractions, configs, feature flags, APIs, docs, and dependencies.

## Abstraction rule

Use this default rhythm:

1. First time: write directly.
2. Second time: observe the shape.
3. Third time: consider abstraction.

Do not abstract just because two snippets look slightly similar.

## Boring tech questions

- Is this stable?
- Is the community mature?
- Can the team maintain it?
- Is debugging straightforward?
- Is the replacement cost acceptable?
- Is this chosen for the problem, or for novelty?

## Code clarity rule

Prefer code a tired teammate can read quickly. Do not optimize for cleverness.

## Checklist

- Is this design too early?
- Is this abstraction needed now?
- Is there a more direct solution?
- Is this technology chosen because it is reliable or because it is trendy?
- Are we building for a fantasy future?
- What breaks if we delete this layer?
