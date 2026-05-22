---
name: verification-first
description: "Use when implementing, reviewing, or fixing software where correctness must be proven with tests, type checks, CI, logs, examples, contract checks, regression tests, or edge-case coverage. Turns requirements and success criteria into verification evidence."
---

# Verification First

Humans make mistakes. Correctness cannot rely on vibes.

A good engineer says: tests, types, checks, examples, logs, and CI give evidence that this is roughly correct.

## Purpose

Build mechanisms that expose mistakes early.

## Required output

```md
# Verification Plan

## Requirements to tests
| Requirement/success criterion | Test/check | Level |
|---|---|---|

## Test cases
| Case | Setup | Action | Expected result | Type |
|---|---|---|---|---|

## Edge cases
- Empty input
- Oversized input
- Invalid enum/code
- Duplicate request
- Timeout/error from dependency
- Expired token/session
- Missing data
- Unauthorized access

## CI checks
- Type check:
- Lint:
- Unit tests:
- Integration tests:
- Build:
- E2E/contract/security checks:

## Regression tests
- Bug:
- Reproduction:
- Test added:
```

## Process

1. Convert Problem First success criteria into tests.
2. Test important business rules, not just UI happy paths.
3. Use the right test level for the risk.
4. Include permission, ownership, and boundary tests.
5. Cover edge cases and dependency failures.
6. Add automated checks in CI.
7. Every fixed bug gets a regression test.

## Test levels

| Type | Verifies |
|---|---|
| Unit | Single function/rule |
| Integration | Multiple modules together |
| E2E | User-visible full flow |
| Contract | API input/output compatibility |
| Security | Authz, ownership, malicious input |
| Regression | A fixed bug stays fixed |

## Must-test logic

- Quota deduction
- Permission checks
- Payment/subscription state
- Job/state transitions
- Data owner validation
- Provider fallback
- Idempotency behavior
- Cost-sensitive calls

## Bug-fix loop

1. Reproduce the bug.
2. Write a failing test.
3. Fix the bug.
4. Confirm the test passes.
5. Keep the test as regression coverage.

## Checklist

- How do we prove this feature is correct?
- Is the happy path tested?
- Are error paths tested?
- Are permissions and ownership tested?
- Are boundary inputs tested?
- Did each fixed bug get a regression test?
- Can CI block obvious mistakes automatically?
