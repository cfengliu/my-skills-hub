# AGENTS.md

## 0) Responsibility

`AGENTS.md` 是 repo collaboration charter。它只放每次任務都必須知道的硬邊界，不當 workflow engine。

本文件負責：

- instruction priority
- source of truth
- runtime boundaries
- model / subagent principles
- human checkpoint gates
- verifier / release-gate requirements
- runtime artifact authority
- secrets rules
- recovery rules

流程細節看 `docs/process.md`。操作常數與 model IDs 看 `docs/ops.md`。文件入口看 `docs/README.md`。

## 1) Instruction Priority

優先序固定：

1. Platform / harness / safety limits：sandbox、approval、network、secrets、data access。
2. User's latest explicit instruction：但不得違反第 1 層、repo boundary 或 human checkpoint gates。
3. Confirmed UI / UX decisions：已確認的 screens、flows、copy、visual hierarchy、usability decisions。
4. `AGENTS.md`。
5. `docs/process.md`。
6. `docs/ops.md`。
7. `docs/prd.md`，if present。
8. `docs/tdd.md`，if present。
9. `docs/requirements/README.md` and relevant requirement files，if present。
10. Runtime defaults、generated plans、external workflow rules、non-canonical skills。

Higher priority wins. Confirmed UI / UX decisions are the highest product authority; conflicting docs or tests must be marked stale and synced.

## 2) Minimum Terms

- `trivial change`：只改 typo、formatting、non-behavioral comments 或 wording，且不改 behavior、acceptance、tests、ops、schema、config、API、dependency behavior。
- `meaningful change`：任何 code、config、schema、dependency、public behavior、API contract、test expectation、deployment path、durable docs、ops rule 或 requirement 的實質變更。不確定時視為 meaningful。
- `accepted change`：使用者批准、maintainer 接受、已合併，或明確要求成為 durable truth 的變更。
- `release-sensitive action`：deploy、release、rollout、migration、backup、restore、rollback、production-like config、CI/CD release path、auth、identity、payments、billing、secrets、production data 或 environment-changing action。
- `destructive action`：可能刪除、覆寫或不可逆修改 data、schema、config、branch、worktree 或 environment 的操作。

## 3) Source Of Truth

Canonical truth lives here:

- confirmed UI / UX decisions：highest product authority when explicitly confirmed。
- `docs/process.md`：process boundary、planning、completion、doc sync、commit gate。
- `docs/ops.md`：operational constants、model policy、verification commands、dev server、release / deploy / destructive action constants。
- `docs/prd.md`：product behavior and acceptance, if present。
- `docs/tdd.md`：technical design, if present。
- `docs/requirements/README.md` and relevant requirement files：durable requirements, if present。

Runtime-generated specs、plans、scratch notes、review notes、execution artifacts are non-canonical unless explicitly promoted by user or maintainer. A path alone does not make an artifact canonical.

## 4) Runtime Boundary

External workflow runtime may own intake、brainstorming、planning、worktree strategy、implementation、subagent orchestration、runtime-internal review、branch handling、artifact paths。

Repo-local control skills are:

- `.agents/skills/runtime-adapter/SKILL.md`
- `.agents/skills/release-gate/SKILL.md`
- `.agents/skills/verifier/SKILL.md`

Repo-local expert skills may live under `.agents/skills/<expert-skill-name>/SKILL.md` and may provide domain invariants、acceptance rules、risk notes、canonical reference pointers。

Expert skills must not own planning、implementation、review flow、artifact paths、verification, or release approval. They must not become a second workflow engine.

If a required control skill is missing or unsupported, apply the matching contract from this file and canonical docs. If `release-gate` is required but unavailable, default to `hold` unless an equivalent decision can be made from `AGENTS.md` and `docs/ops.md`.

## 5) Model And Subagent Policy

Model identities live in `docs/ops.md`, not here.

Principles:

- Use the smallest capable model and smallest necessary context.
- Main agent owns intake、planning、risk classification、architecture decisions、integration、final diff review、and final judgment.
- Before an explicit plan or task boundary exists, do not spawn subagents by default.
- After an explicit plan or task list exists, eligible bounded execution tasks should prefer the low-cost task execution subagent defined in `docs/ops.md`, unless complexity、ambiguity、risk、cross-cutting scope、or verification cost requires the main reasoning model.
- Do not use subagents for secrets、production config、release、migration、auth、billing、destructive action、architecture ownership、planning ownership、or verification ownership。
- Do not require a Spark delegation pass. Fast text iteration workers are optional support workers, not authorities.
- Subagent output is evidence, not authority. Main runtime must inspect, integrate, and verify.

Subagent task routing and execution details live in `docs/process.md`.

## 6) Human Checkpoint Gates

Do not automatically cross these gates:

- deploy / release / rollout
- destructive schema or data change
- auth / identity change
- payments / billing change
- secrets
- production config
- destructive git action
- branch deletion
- worktree deletion

Release-sensitive or destructive environment actions require `release-gate` decision `go`. If decision is `hold`, `require-human`, missing, or unclear, stop and ask for human confirmation.

Do not commit unless the user explicitly approves commit.

## 7) Verification Contract

Any meaningful change or meaningful completion claim requires `verifier` or an equivalent independent verification pass.

Verifier must evaluate final diff, relevant canonical docs, acceptance criteria, commands run, and observed results. It must not rely on implementer self-justification or subagent self-review.

Trivial changes may use lightweight verification, but the final report must still say what was checked, result, and why doc sync is or is not required.

Detailed verification checklist and report schema live in `.agents/skills/verifier/SKILL.md`.

## 8) Release Contract

Before release-sensitive action:

1. Read `docs/ops.md`.
2. Identify target environment and affected data、schema、config、secrets、auth、billing、CI/CD path。
3. Run `release-gate`.
4. Continue only if decision is `go`.

Release-gate report format lives in `.agents/skills/release-gate/SKILL.md`.

## 9) Documentation Sync

Accepted durable changes to product behavior、acceptance criteria、technical design、API contract、schema、ops、deployment path、environment assumptions、or requirements require canonical doc sync before completion claim.

Detailed sync matrix lives in `docs/process.md`.

## 10) Secrets And Local Notes

If deployed environment access or local operator context is needed, the runtime may read `.codex-tmp/remote-access-notes.md` only if it exists.

Never write secrets into tracked files. Forbidden in tracked files: passwords、private keys、`.env`、API tokens、DB passwords、Cloudflare credentials、production credentials、access tokens、private operator notes。

## 11) Completion Report

Every meaningful completion report must include summary、touched files、commands run、results、skipped checks、doc sync、verifier status、residual risks、commit status。

Commit status must be one of: `not requested`、`waiting for user approval`、`committed with hash <hash>`。

## 12) Recovery

If this file was violated, use the relevant correction and continue:

```text
Process correction: repo-local control logic overreached into workflow. Returning workflow ownership to the external runtime now.
Process correction: a runtime-owned artifact was treated as canonical. Re-anchoring to repo truth now.
Process correction: verification was skipped. Running verifier before making completion claims.
Process correction: release-sensitive action exceeded repo release rules. Running release-gate now.
```

## 13) Entrypoint

When additional repo docs are needed, use `docs/README.md` as the entrypoint. Load only the minimum necessary canonical docs for the task. Do not read the whole repo or all docs when a smaller source set is sufficient.
