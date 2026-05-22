---
name: problem-first
description: "Use before designing or coding a feature, product, workflow, automation, API, or system when the actual user problem, success criteria, non-goals, constraints, or MVP need to be clarified. Prevents building the wrong thing or turning a vague request into overbuilt code."
---

# Problem First

Code is not the goal. Solving the right problem is the goal.

The biggest engineering waste is not slow coding; it is building the wrong thing completely.

## Purpose

Use Problem First to avoid solving the wrong problem. Answer:

- Why build this?
- Who uses it?
- What pain does it solve?
- What does success mean?
- What will not be built?
- What is the smallest viable solution?

## Required output: Problem Brief

```md
# Problem Brief

## One-sentence problem
We need to help [user type],
in [scenario],
solve [specific problem],
so they can achieve [result].

## Users
- Primary user:
- Secondary users:

## Success criteria
- <specific, observable criterion>
- <specific, observable criterion>

## Non-goals
- <explicitly not in scope>
- <explicitly not in scope>

## Constraints
- Time:
- Cost:
- Tech/platform:
- Legal/security/privacy:
- Operational:

## MVP
- Smallest version that proves the problem is solved:
```

## Process

1. Write the one-sentence problem definition.
2. Define concrete success criteria; avoid vague words like "good", "fast", or "usable" unless they are quantified.
3. Define non-goals to prevent scope creep.
4. Identify constraints that change the design.
5. Find the smallest viable solution.
6. Ask whether this can be solved without new code, with an existing tool, manually first, or with a smaller version.

## Good success criteria examples

- User receives a result within 3 seconds.
- Failed requests show a clear, actionable error.
- The same input is not charged twice.
- A user can only access records they own.
- The system rejects invalid or oversized input before calling expensive services.

## Non-goal examples

- Version 1 does not support team collaboration.
- Version 1 does not support offline mode.
- Version 1 does not include a full admin backend.
- Version 1 does not support custom model training.

## Checklist before coding

- Can the problem be stated in one sentence?
- Is the user clear?
- Are success criteria observable?
- Are non-goals explicit?
- Are constraints written down?
- Is the MVP truly minimal?
- Is any feature being built only because it sounds nice?
