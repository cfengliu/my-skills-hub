---
name: change-first
description: "Use when a system or feature will likely evolve: provider swaps, pricing rules, prompts, schemas, workflows, APIs, storage formats, business rules, languages, or quota policies. Helps isolate likely change points without overabstracting stable areas."
---

# Change First

Software will change.

Requirements, data, APIs, providers, models, users, and pricing change. The goal is not to predict everything; it is to isolate the changes that are likely and painful.

## Purpose

Identify likely change points and reduce future modification cost without abstracting everything.

## Required output

```md
# Change Design

## Likely change points
| Area | Why likely to change | Pain if not isolated | Isolation now? |
|---|---|---|---|

## Isolated now
| Change point | Boundary/interface/config/strategy | Owner |
|---|---|---|

## Not abstracted yet
| Area | Why direct is okay now | Trigger to abstract |
|---|---|---|

## Replacement cost
| Component | Cost to replace | Files/modules affected | Risk |
|---|---|---|---|

## Migration strategy
- Schema/versioning:
- Backward compatibility:
- Data repair/backfill:
- Rollout/rollback:
```

## Process

1. List the areas most likely to change.
2. Rank them by pain if left scattered.
3. Isolate only likely-and-painful changes.
4. Depend on internal abstractions where replacement is realistic.
5. Move volatile rules into config or strategy objects only when they truly change.
6. Keep migrations possible for database/schema changes.

## Common change points

- External provider or vendor
- Prompt/template
- Model name
- Pricing calculation
- Quota policy
- Supported languages/file types
- Storage schema
- API response shape
- Business workflow/status rules

## Interface rule

Bad:

```ts
class TranslationService {
  constructor(private openaiProvider: OpenAIProvider) {}
}
```

Better:

```ts
class TranslationService {
  constructor(private provider: TranslationProvider) {}
}
```

Depend on the stable concept, not the current vendor.

## Configuration rule

Good candidates for config/strategy:

- Model name
- Timeout
- Retry count
- Daily quota
- Supported language list
- Pricing rule

Do not configure everything. Configuration is also complexity.

## Checklist

- What is most likely to change?
- How many modules would that change touch?
- Is the change point centralized?
- Are stable areas overabstracted?
- Would replacing a provider, DB, or pricing rule be painful?
- Is there a migration path for schema/data changes?
