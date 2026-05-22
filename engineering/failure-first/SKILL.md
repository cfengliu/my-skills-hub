---
name: failure-first
description: "Use when designing or reviewing reliability, production behavior, external API calls, background jobs, payments, quota changes, provider integrations, retry logic, idempotency, fallback, logging, metrics, alerts, or recovery. Assumes the system will fail and makes failure controlled, observable, and recoverable."
---

# Failure First

Real systems fail.

Networks disconnect, APIs slow down, DBs fail, users double-click, third parties change behavior, disks fill, and traffic spikes.

The question is not whether failure happens. The question is whether failure is controlled or catastrophic.

## Purpose

Make failures observable, controlled, and recoverable.

## Required output

```md
# Failure Design

## Failure modes
| Flow/operation | Failure mode | User impact | System impact | Handling |
|---|---|---|---|---|

## Timeout policy
| External call | Timeout | On timeout |
|---|---|---|

## Retry policy
| Error | Retry? | Max attempts | Backoff | Idempotent? |
|---|---|---|---|---|

## Idempotency
- Idempotency key:
- Unique constraint:
- Duplicate request behavior:
- Side effects protected:

## Fallback/degradation
- Primary failure:
- Fallback:
- User-facing message:

## Observability
- Logs:
- Metrics:
- Traces:
- Alerts:
- Request/correlation ID:

## Recovery/compensation
- Manual repair:
- Background retry:
- Data reconciliation:
- Rollback:
```

## Process

1. List how each important flow can fail.
2. Put timeouts on every external call.
3. Retry only transient failures, with limits and backoff.
4. Make critical operations idempotent.
5. Add fallback or graceful degradation for core flows.
6. Add logs, metrics, traces, errors, and alerts.
7. Separate user-facing errors from internal diagnostics.
8. Define recovery or compensation for partial failures.

## Retry guidance

Usually retry:

- Temporary network errors
- 429 rate limit
- 503 service unavailable
- Timeout

Usually do not retry:

- Permission denied
- Invalid input
- Quota insufficient
- Payment failed
- Non-idempotent side effects without protection

Retry must have:

- Max attempts
- Backoff
- Jitter when appropriate
- Idempotency or side-effect protection

## Idempotency examples

Use one or more:

- requestId
- idempotencyKey
- unique constraint
- state check before side effect
- exactly-once-ish job lock

Duplicate requests must not double-charge, double-deduct quota, or create duplicate records.

## Observability fields

Log useful context, not sensitive content:

- requestId/correlationId
- userId/accountId when safe
- provider/service
- operation
- status
- latency
- error type/code
- retry attempt
- cost/usage units when safe

Never log secrets, tokens, raw sensitive user content, full SQL errors with secrets, or API keys.

## Checklist

- How can this fail?
- Does every external call have a timeout?
- Can retry duplicate a side effect?
- Are important operations idempotent?
- Does the user see a clear error?
- Can engineers diagnose it with requestId/logs/metrics?
- Is there a fallback or recovery path?
