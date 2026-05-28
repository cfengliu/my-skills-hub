# AGENTS.md

## 0) 責任範圍

`AGENTS.md` 是 repo collaboration charter。它只放每次任務都必須知道的硬邊界，不當 workflow engine。

本文件負責：

- 指令優先序
- 事實來源
- runtime 邊界
- model / subagent 原則
- 人類確認 gates
- verifier / release-gate 要求
- runtime artifact 權威性
- secrets 規則
- recovery 規則

流程細節看 `docs/process.md`。操作常數與 model IDs 看 `docs/ops.md`。文件入口看 `docs/README.md`。

## 1) 指令優先序

優先序固定：

1. Platform / harness / safety limits：sandbox、approval、network、secrets、data access。
2. 使用者最新明確指令：但不得違反第 1 層、repo boundary 或 human checkpoint gates。
3. 已確認的 UI / UX 決策：已確認的 screens、flows、copy、visual hierarchy、usability decisions。
4. `AGENTS.md`。
5. `docs/process.md`。
6. `docs/ops.md`。
7. Repo-local control skill contract：僅限被啟用且在其宣告 scope 內。
8. `docs/prd.md`，若存在。
9. `docs/tdd.md`，若存在。
10. `docs/requirements/README.md` 與相關 requirement files，若存在。
11. Runtime defaults、generated plans、external workflow rules、non-canonical skills。

高優先序覆蓋低優先序。已確認的 UI / UX 決策是最高產品權威；衝突的 docs 或 tests 必須標成 stale 並同步。

## 2) 最小術語

- `trivial change`：只改 typo、formatting、non-behavioral comments 或 wording，且不改 behavior、acceptance、tests、ops、schema、config、API、dependency behavior。
- `meaningful change`：任何 code、config、schema、dependency、public behavior、API contract、test expectation、deployment path、durable docs、ops rule 或 requirement 的實質變更。不確定時視為 meaningful。
- `accepted change`：使用者批准、maintainer 接受、已合併，或明確要求成為 durable truth 的變更。
- `release-sensitive action`：deploy、release、rollout、migration、backup、restore、rollback、production-like config、CI/CD release path、auth、identity、payments、billing、secrets、production data 或 environment-changing action。
- `destructive action`：可能刪除、覆寫或不可逆修改 data、schema、config、branch、worktree 或 environment 的操作。

## 3) 事實來源

Canonical truth 來源如下：

- 已確認的 UI / UX 決策：明確確認後，是最高產品權威。
- `docs/process.md`：process boundary、planning、completion、doc sync、commit gate。
- `docs/ops.md`：operational constants、model policy、verification commands、dev server、release / deploy / destructive action constants。
- `docs/prd.md`：product behavior 與 acceptance，若存在。
- `docs/tdd.md`：technical design，若存在。
- `docs/requirements/README.md` 與相關 requirement files：durable requirements，若存在。

Runtime 產生的 specs、plans、scratch notes、review notes、execution artifacts 預設不是 canonical；除非使用者或 maintainer 明確提升。只有 path 不會讓 artifact 變成 canonical。

## 4) Runtime 邊界

External workflow runtime 可以擁有 intake、brainstorming、planning、worktree strategy、implementation、subagent orchestration、runtime-internal review、branch handling、artifact paths。

Repo-local control skills：

- `.agents/skills/runtime-adapter/SKILL.md`
- `.agents/skills/subagent-routing/SKILL.md`
- `.agents/skills/release-gate/SKILL.md`
- `.agents/skills/verifier/SKILL.md`

Repo-local expert skills 可以放在 `.agents/skills/<expert-skill-name>/SKILL.md`，並提供 domain invariants、acceptance rules、risk notes、canonical reference pointers。

Expert skills 不可擁有 planning、implementation、review flow、artifact paths、verification 或 release approval，也不可變成第二套 workflow engine。

若必要 control skill 缺失或平台不支援，套用本文件與 canonical docs 中對應的 contract。若需要 `release-gate` 但不可用，預設為 `hold`；除非可從 `AGENTS.md` 與 `docs/ops.md` 做出等效決策。

## 5) Model 與 Subagent 政策

Model identities 放在 `docs/ops.md`，不放這裡。

原則：

- 使用足以完成任務的最小 model 與最小必要 context。
- Main agent 擁有 intake、planning、risk classification、architecture decisions、integration、final diff review 與 final judgment。
- 在 explicit plan 或 task boundary 出現前，預設不要啟動 subagents。
- explicit plan 或 task list 出現後，執行 plan tasks 前，先跑 `subagent-routing` skill 或等效 routing pass。
- 符合條件的 bounded execution tasks 應優先使用 `docs/ops.md` 定義的 low-cost task execution subagent；除非 complexity、ambiguity、risk、cross-cutting scope 或 verification cost 需要 main reasoning model。
- 不要用 subagents 處理 secrets、production config、release、migration、auth、billing、destructive action、architecture ownership、planning ownership 或 verification ownership。
- Subagent output 是 evidence，不是 authority。Main runtime 必須 inspect、integrate、verify。

Subagent task routing 與 execution 細節放在 `docs/process.md`。

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
