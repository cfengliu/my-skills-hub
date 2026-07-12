<!--
Example file for repo initialization.
Copy to the same path without .example in the filename.
Do not overwrite the repo-owned target file during upgrades.
-->
<!--
Repo-owned file after initialization.
Do not overwrite during template upgrades.
-->
# Security And Privacy

This file owns repo-specific security, privacy, PII handling, authentication and authorization boundaries, auditability, retention, secrets handling, and abuse controls.

It constrains PRD, TDD, and Ops on security-sensitive concerns. It does not replace:

- `prd.md` for accepted product behavior, user-facing flows, and UX states.
- `tdd.md` for architecture, API contracts, schemas, integrations, and verification strategy.
- `ops.md` for commands, environments, release operations, backup, restore, and incident procedure.

Empty sections and placeholders are `unknown`, not accepted security truth. Add only decisions accepted by the user or maintainer.

## Data Classification

| Data | Classification | Source of truth | Exposure rule |
|---|---|---|---|
| `<public content>` | Public | `<system>` | `<where it may appear>` |
| `<internal drafts/config>` | Internal | `<system>` | `<who may read/write>` |
| `<account/profile data>` | Personal data | `<system/provider>` | `<minimum exposure>` |
| `<sensitive user data>` | Sensitive personal data | `<system/provider>` | `<masking/access rule>` |
| `<transaction/payment/regulated data>` | Sensitive transaction data | `<system>` | `<authorization gate>` |
| `<tokens/secrets/API keys>` | Secret | Secret manager / environment | Never expose to frontend, repo, logs, screenshots, analytics, or support artifacts. |
| `<audit records>` | Sensitive operational data | `<audit store>` | Visible only to authorized operator/admin contexts with minimum necessary detail. |

## Trust Boundaries

- Frontend is untrusted. It may improve UX but must not decide authorization.
- Backend is the security boundary for protected reads and writes.
- Database/storage access must stay behind backend authorization and least-privilege credentials.
- Auth provider proves identity/session state only; local domain authorization must be recomputed by the backend.
- External verification, payment, email, storage, AI, or webhook providers are evidence or transport sources, not local authorization truth unless explicitly accepted here.
- Admin/operator surfaces must be separated from public or regular-user surfaces.
- Webhook/callback surfaces are untrusted until signature, timestamp/replay window, idempotency, and expected state transitions pass validation.

## Authentication And Authorization

| Action | Identity source | Required backend authorization | Ownership / scope check |
|---|---|---|---|
| Read public data | Anonymous or session | Public visibility rules | Only approved public state. |
| Read own data | Authenticated user | User read permission | Resource owner matches backend identity. |
| Mutate own data | Authenticated user | User write permission | Resource owner matches backend identity and transition is allowed. |
| Read admin data | Admin/operator identity | Admin read permission | Minimum necessary fields only. |
| Mutate admin data | Admin/operator identity | Admin write permission | Reason/audit evidence required for sensitive changes. |
| Process webhook/callback | Provider signature | Valid signature and replay/idempotency checks | Update only allowed local projection/state. |

Rules:

- Login is not authorization.
- User-provided IDs are not ownership proof.
- Backend identity comes from verified session/token context, not request body.
- Provider profile, metadata, logs, or callbacks must not grant local permissions by themselves.
- Missing or stale step-up / reauthentication for high-risk actions must produce a stable backend denial reason, for example `STEP_UP_REQUIRED`.

## PII Minimization And Local Protection

- Store only personal data required for accepted product behavior, authorization, auditability, legal/operational review, or support.
- Do not store raw provider documents, sensitive images, OCR text, full provider payloads, full tokens, or provider secrets unless explicitly accepted here.
- Use provider IDs or stable local IDs for identity mapping; do not use email as the ownership key unless explicitly accepted and risk-reviewed.
- Classify local PII before production use.
- Use field-level encryption for sensitive local fields where database-level access is not enough.
- Use blind indexes or equivalent designs for searchable PII; normal admin search must not decrypt-and-scan production data.
- Keep encryption keys, blind-index keys, recovery material, and rotation procedures out of tracked files.
- Mask provider subjects, email addresses, inquiry/payment/reference IDs, and similar identifiers in UI/logs unless full value is strictly required and authorized.

## Secrets Management

- Secrets must not be committed to tracked files.
- Secrets must not be embedded in frontend bundles or public runtime payloads.
- Use environment variables or a platform secret manager for provider keys, webhook secrets, DB credentials, storage credentials, signing keys, encryption keys, and API tokens.
- Secrets must be rotatable without code changes.
- Revoked secrets must be removed from active runtime configuration.
- Logs, screenshots, analytics, support exports, and error reports must not capture secrets.
- Suspected secret exposure requires immediate revocation/rotation and an incident record.

## Input Validation

Validate at backend boundaries:

| Input | Validation | Reject / fallback behavior |
|---|---|---|
| Session/token | Signature, issuer/audience, expiry, expected provider | Reject as unauthenticated. |
| Resource IDs | Shape, existence, allowed scope | Return not found or forbidden without leaking extra data. |
| State transitions | Current state and allowed transition | Reject invalid transition. |
| Money/quantity/value | Numeric bounds, currency/unit, business constraints from backend state | Reject with safe reason. |
| Webhook/callback | Signature, timestamp/replay window, schema, idempotency key | Reject or ignore safely; audit security failures. |
| Uploads | Auth, role, MIME/type, size, extension, storage metadata | Reject unsupported or oversized files. |
| Text fields | Length, required fields, supported locale, safe rendering | Reject invalid input or store safe empty value. |
| Pagination/sort/filter | Allowlisted fields and bounded limits | Clamp or reject. |

## Logging And Redaction

Logs must support debugging and investigations without leaking sensitive data.

Do not log:

- Full session tokens, JWTs, API keys, webhook secrets, encryption keys, or provider secrets.
- Raw webhook payloads that contain sensitive data.
- Raw documents, document URLs, OCR content, selfies, payment instruments, or sensitive images.
- Full provider subject IDs, reference IDs, or email addresses when masked values are enough.
- Full request/response payloads for protected mutations when structured outcomes are enough.

Recommended redaction:

- Email: `st***@example.com`
- Provider subject/reference: provider plus short suffix only.
- Token/secret/key: never show, except a non-reversible fingerprint when needed for rotation audit.

## Rate Limits And Abuse Controls

Define minimum controls for:

- login/session-sensitive endpoints
- user self-service mutations
- high-risk business actions
- admin/operator mutations
- uploads/imports/exports
- public APIs that can be scraped or create backend cost
- webhook/callback endpoints against replay and burst retries
- AI, email, SMS, payment, storage, or other metered provider calls

Record accepted dimensions and thresholds here when known:

| Surface | Dimensions | Threshold | Failure behavior |
|---|---|---|---|
| `<endpoint/surface>` | `<per IP/account/resource>` | `<limit/window>` | `<reject/degrade/audit>` |

## Audit Logging

Security-relevant audit events should include:

- actor type and actor id/reference, masked where appropriate
- timestamp
- source surface and request context
- action
- target resource
- before/after when safe and useful
- success/failure
- reason or denial code
- security limit triggered, if any

Audit logs must not include raw secrets, raw sensitive documents, full tokens, or unnecessary personal data.

Minimum audit coverage before production:

- protected admin/operator mutations
- permission or ownership denials for sensitive actions
- external-provider callback/webhook state changes
- webhook signature failure or replay rejection
- account/profile/status changes that affect access
- high-risk business action accepted/rejected
- production safety guard triggered

## Retention, Deletion, Backup, And Restore

Retention and deletion policy must be explicitly accepted before production personal, sensitive, transaction, or audit data is stored.

Safe baseline until a stricter accepted policy exists:

- Do not keep raw sensitive provider documents in this system unless explicitly accepted.
- Preserve records required for security, transaction integrity, legal, or operational review.
- Separate user-visible account closure from records that must remain for audit or transaction integrity.
- Backups containing personal, sensitive, transaction, or audit data are sensitive.
- Restore operations involving production personal data require the relevant human checkpoint and release-gate handling.
- Lower-environment restored data must not contain production PII unless explicitly approved and protected.

Open policy decisions before production launch:

- Retention duration by data class.
- Export/delete request process and SLA.
- Account closure vs anonymization rules.
- Backup retention duration and restore authorization.
- Key rotation, revocation, and lost-key recovery behavior.

## Incident Response Baseline

Security or privacy incidents include suspected leaks of secrets, tokens, personal data, sensitive provider references, transaction data, unauthorized admin/operator access, webhook spoofing, or production safety guard bypass.

Minimum response:

1. Contain exposure or unauthorized access.
2. Revoke or rotate affected secrets/tokens/keys.
3. Preserve relevant audit evidence without broadly copying sensitive payloads.
4. Identify affected data classes and users/resources.
5. Record timeline, impact, mitigation, and follow-up actions in the accepted operator/incident record.
6. Add regression tests or controls for the failure mode where possible.

## Security Acceptance Checklist

Before claiming a security-sensitive change is meaningful-complete, verify:

- No secrets are written to tracked files.
- Frontend does not receive secrets or admin-only/internal-only models.
- Backend authorizes every protected read/write.
- User-provided IDs are not trusted for ownership.
- External-provider callbacks/webhooks verify signature and idempotency, or the missing control is explicitly blocked.
- Logs redact tokens, secrets, provider IDs, reference IDs, and personal data where required.
- Admin/operator views show minimum necessary data only.
- Audit events are produced for protected mutations and security decisions.
- Rate limits or abuse controls exist, or skipped controls are documented as residual risk.
- Production disables local/dev-only auth, mock providers, bypass flags, or test credentials.
- Relevant PRD/TDD/Security/Ops/roadmap/epic docs are synchronized or drift is reported.
