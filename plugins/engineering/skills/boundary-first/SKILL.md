---
name: boundary-first
description: "Use when designing or reviewing software architecture, modules, APIs, data ownership, state machines, permissions, or external integrations. Helps control complexity by cutting clear boundaries before implementation or refactoring."
---

# Boundary First

Complexity comes from things affecting each other.

A system becomes hard to maintain when changing A breaks B, changing B breaks C, and nobody knows what is safe to touch.

## Purpose

Use Boundary First to control complexity and prevent cross-module pollution. Define:

- Module boundaries
- Data ownership
- API contracts
- State ownership and legal transitions
- Permission boundaries
- External service boundaries

## Required output

```md
# Boundary Design

## Core concepts
- <domain concept>
- <domain concept>

## Modules
| Module | Owns | Does not own | Depends on | Used by |
|---|---|---|---|---|

## Data ownership
| Data/entity | Owner module | Who may read | Who may write | Write API |
|---|---|---|---|---|

## API contracts
| API/function | Input | Output | Errors | Owner |
|---|---|---|---|---|

## State transitions
| State | Can move to | Trigger | Owner |
|---|---|---|---|

## External service boundaries
| Service | Wrapped by | Internal interface | Retry/timeout owner |
|---|---|---|---|
```

## Process

1. Identify core domain concepts first.
2. Define each module's responsibility and non-responsibility.
3. Give every important data object exactly one owner.
4. Prevent direct writes from random modules; expose owner APIs instead.
5. Isolate external services behind interfaces/adapters.
6. Define legal state transitions; do not allow arbitrary state mutation.
7. Make permission boundaries explicit.

## Ownership rule

Bad:

```ts
user.remainingCredits -= amount
```

Better:

```ts
quotaService.consume(userId, amount)
```

Keep rules where the data is owned.

## External service rule

Bad:

```ts
openai.chat.completions.create(...)
```

Better:

```ts
interface TranslationProvider {
  translate(input: TranslationInput): Promise<TranslationOutput>
}
```

Business logic should depend on an internal interface, not a vendor SDK.

## State rule

Write allowed transitions explicitly, e.g.:

```txt
Created -> Processing
Processing -> Succeeded
Processing -> Failed
Processing -> Cancelled
Failed -> Retrying
```

Reject impossible jumps unless a migration/admin repair explicitly owns them.

## Checklist

- Does each module have one clear responsibility?
- Does each module say what it does not own?
- Does every data object have one owner?
- Is every state change owned and legal?
- Are API inputs, outputs, and errors clear?
- Are external services hidden behind adapters/interfaces?
- Would changing this area break unrelated areas?
