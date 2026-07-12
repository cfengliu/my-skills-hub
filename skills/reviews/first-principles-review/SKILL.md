---
name: first-principles-review
description: Review documents, proposals, requirements, architecture notes, code, modules, or diffs from first principles. Use when Codex must challenge assumptions, constraints, invariants, false confidence, failure modes, dependency choices, duplication, redundancy, or accidental complexity instead of giving a surface-level style review, including requests like "use first principles to inspect this document or code", "用第一原理檢查文件/代碼", or "從第一原理拆解這個設計".
---

# First Principles Review

## Overview

Evaluate an artifact by reducing it to purpose, constraints, invariants, inputs, outputs, and essential moving parts. Prefer deletion, simplification, consolidation, and clearer boundaries over ornamental abstractions or style commentary.

## Assumption Challenge Mode

When the user asks to "challenge", "push back", "質疑", "挑戰", or verify whether something is truly ready, bias toward adversarial but constructive review.

Focus on false confidence:
- A script passes but does not verify the core invariant.
- A schema exists but no runtime path uses it.
- A command exits 0 while producing empty or useless output.
- Documentation says a workflow works, but actual cwd/package boundaries disagree.
- A report can be generated from invalid, partial, or misleading data.

Do not invent blockers. Separate:
- **Fact:** directly observed in code, docs, commands, or outputs.
- **Assumption:** currently required for the conclusion but not proven.
- **Open question:** missing info that changes the decision.

## Workflow

1. Define the job.
   - State what the artifact is trying to achieve in one sentence.
   - Identify who or what depends on it.
   - Separate hard constraints from habits, conventions, or inherited decisions.
2. Build the first-principles model.
   - List required inputs, outputs, invariants, dependencies, and failure conditions.
   - Mark each important claim as a fact, an assumption, or an open question.
   - Ask what the simplest correct version would need.
3. Inspect for fundamental problems.
   - Trace where reasoning breaks, constraints conflict, or assumptions remain unproven.
   - Look specifically for false success states: pass-but-not-validated, schema-but-not-enforced, output-but-empty, report-but-invalid, docs-but-wrong-cwd.
   - Check whether each important guarantee is enforced by code, tests, or commands—not only stated in documentation.
   - Rank risks by consequence: wrong decision > broken invariant > fake confidence > maintainability drag > cosmetic drift.
   - Find duplication, redundancy, dead weight, unnecessary layers, and abstractions that only exist to support other abstractions.
   - Distinguish deliberate reinforcement from accidental duplication. Say so when repetition is justified or materially harmless.
   - Explain why a structure is unnecessary instead of merely calling it complex.
4. Produce findings.
   - Rank issues by impact: wrong premise, broken invariant, constraint mismatch, redundancy, maintainability drag.
   - Explain each issue in causal terms: what assumption fails, why it fails, and what risk it creates.
   - Skip style nits unless they directly obscure reasoning or hide duplication.
5. Recommend a simpler direction.
   - Suggest the smallest rewrite or refactor direction that restores clarity.
   - Prefer removing steps, merging duplicated responsibilities, collapsing layers, or enforcing invariants closer to the source.
   - Do not fully rewrite unless the user explicitly asks for implementation.

## Document Review Lens

When reviewing documents, proposals, specs, or architecture notes:

- Verify the problem statement before judging the solution.
- Separate requirements from preferences and guesses.
- Flag circular reasoning, undefined terms, missing constraints, and untested leaps from premise to conclusion.
- Find repeated sections, duplicated requirements, contradictory rules, and process steps that do not change the outcome.
- Ask whether the document describes the simplest workable system or defends inherited complexity.

## Code Review Lens

When reviewing code, modules, or diffs:

- Trace the real data flow, control flow, and state transitions.
- Identify duplicated logic, redundant branches, dead adapters, pass-through wrappers, and layers with no unique responsibility.
- Check whether invariants are enforced in code or only assumed by comments and conventions.
- Question abstractions that increase call depth without reducing semantic duplication.
- Prefer merging equivalent paths and deleting accidental complexity before introducing new patterns.

## Output Format

Use this structure unless the user requests another format:

1. Goal
   - State the artifact's job in one sentence.
2. Facts and constraints
   - List the hard requirements, invariants, and external constraints.
3. Assumptions to challenge
   - List the key assumptions that need proof.
4. First-principles findings
   - Explain the fundamental problems in priority order.
5. Redundancy and duplication
   - Call out repeated logic, repeated ideas, unnecessary layers, or no-op process.
   - Explicitly say when no meaningful redundancy exists.
6. Simpler direction
   - Recommend the smallest cleaner design or refactor direction.
7. Open questions
   - Name missing context that blocks stronger conclusions.
8. Readiness verdict
   - Include when the review is about readiness, acceptance, or whether blockers remain.
   - Say whether there are P1/P2 blockers.
   - If ready, state the exact verification evidence required.
   - If not ready, name the smallest patch that would make it ready.

## Guardrails

- Do not anchor on framework fashion, team habit, or personal taste.
- Do not reward complexity just because it looks "enterprise".
- Do not recommend new abstractions until semantic duplication is real.
- Do not confuse indirection with flexibility.
- Do not be adversarial for theater; every challenge must tie to a concrete risk.
- Do not treat missing evidence as failure; label it as an open question unless the system depends on it.
- Do not accept "exists" as proof of "used" or "validated".
- Do not accept "passes" as proof unless the command validates the relevant invariant.
- Say what evidence is missing when context is insufficient.
- Switch to implementation only after the user explicitly asks to rewrite or refactor.

## Example Triggers

- "Use first principles to review this design document."
- "Inspect this module from first principles and tell me what is redundant."
- "Challenge the assumptions in this proposal and recommend a simpler architecture."
