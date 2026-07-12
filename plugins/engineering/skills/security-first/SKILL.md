---
name: security-first
description: "Use when designing, implementing, reviewing, or launching software that handles users, data, permissions, APIs, files, payments, secrets, external services, logs, quotas, or dependencies. Assumes malicious abuse and protects assets, authorization, input boundaries, secrets, system cost, and auditability."
---

# Security First

Systems do not only fail by accident. They are also abused on purpose.

Failure First handles accidents. Security First handles malicious or careless misuse.

## Purpose

Protect assets, permissions, data, secrets, and system cost.

## Required output

```md
# Security Design

## Assets
| Asset | Sensitivity | Owner | Protection needed |
|---|---|---|---|

## Trust boundaries
- Frontend -> Backend:
- Backend -> Database:
- Backend -> external provider:
- Admin surface:
- Webhook/callback surface:

## Authentication and authorization
| Action | Identity source | Required permission | Ownership check |
|---|---|---|---|

## Input validation
| Input | Validation | Reject/fallback behavior |
|---|---|---|

## Secret management
- Secrets:
- Storage:
- Rotation:
- Revocation:
- Audit:

## Rate limit / quota / cost controls
- Per user:
- Per IP/account:
- File/text size:
- Retry limits:
- Cost cap:

## Audit log
- Who:
- When:
- Where/source:
- Action:
- Success/failure:
- Usage/cost:
- Security limit triggered:

## Security tests
- Unauthorized:
- Cross-user access:
- Invalid input:
- Oversized input:
- Secret leakage/logging:
- Rate limit/quota:
```

## Process

1. Define assets first.
2. Draw trust boundaries; assume frontend, user input, third-party APIs, and callbacks are untrusted.
3. Separate authentication from authorization.
4. Enforce authorization on the backend for every protected action.
5. Apply least privilege to users, admins, service accounts, DB users, and CI tokens.
6. Validate all external input.
7. Keep secrets out of frontend, repo, and logs.
8. Add rate limits, quotas, and cost controls.
9. Add audit logs without leaking sensitive data.
10. Review dependency risk.

## Core rules

- The frontend is not trusted.
- User-provided IDs are not trusted for ownership.
- Backend identity comes from token/session, not request body.
- Login is not enough; every action still needs authorization.
- Secrets never go to client bundles, repos, screenshots, analytics, or logs.
- Logs must help investigations without exposing sensitive content.

## Common assets

- User account
- Personal data
- User-generated content
- Uploaded files/audio/images
- API keys
- JWT/session secrets
- Translation/history records
- Usage quota/credits
- Payment/subscription data
- Admin permissions

## Validation targets

Validate:

- Text length
- File size/type
- Language/enum codes
- URL/callback origin
- userId/resourceId shape
- Token/session state
- JSON schema
- Pagination/sort params
- Webhook signature

## Dependency security

- Avoid unknown packages when built-ins or existing deps work.
- Pin versions where appropriate.
- Keep lockfiles.
- Check known vulnerabilities.
- Remove unused dependencies.
- Prefer smaller dependency surfaces.

## Checklist

- What assets are protected?
- Can the frontend access any secret?
- Does the backend check ownership and permissions?
- Can one user access another user's data?
- Is every external input validated?
- Can logs leak sensitive data?
- Are rate limits and quotas in place?
- Can API keys/secrets be rotated and revoked?
