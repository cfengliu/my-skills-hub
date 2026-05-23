# AGENTS 規範（強制）

## 0) 這份文件的責任

`AGENTS.md` 是 repo 協作憲章，只定義：

- 指令優先序
- source of truth
- runtime model
- canonical truth locations and runtime artifacts
- risk checkpoints
- repo-local skill contract
- verification contract
- release contract
- recovery contract

repo 不擁有主要 workflow engine；外部 workflow runtime 可以負責 intake、planning、worktree、execution、subagent dispatch、review、branch handling，但必須遵守 repo 邊界。

repo-local control skills 預設為：

- `.agents/skills/runtime-adapter/SKILL.md`
- `.agents/skills/release-gate/SKILL.md`
- `.agents/skills/verifier/SKILL.md`

repo-local expert skills 是可選 knowledge overlays。若目標 repo 有 domain-specific expert skills，放在 `.agents/skills/<expert-skill-name>/SKILL.md`，並由 `runtime-adapter` 選擇與注入。

流程細則看 `docs/process.md`。
操作常數看 `docs/ops.md`。
`docs/README.md` 是 `docs/` 入口與閱讀順序。

## 0.1) Default Execution Summary

一般任務預設流程：

1. 讀取本 `AGENTS.md` 與最小必要 canonical docs。
2. 使用 `runtime-adapter` 選擇必要 repo-local expert skills 並注入 repo-truth references。
3. runtime-generated plans、specs、scratch notes 預設維持 non-canonical，除非使用者或 maintainer 明確 promoted。
4. 在明確 workspace scope 內實作，且避免 subagents 有重疊 write scope。
5. 執行最小且足以驗證本次變更的 checks。
6. meaningful completion claim 前必須跑 `verifier`。
7. accepted durable behavior、design、ops 或 requirements 改變時，completion claim 前必須同步 canonical docs。
8. deploy、rollout、migration、destructive environment action 或其他 release-sensitive action 前必須跑 `release-gate`。
9. 回報 touched files、commands、pass/fail results、skipped checks、doc sync status 與 residual risks。

## 1) 指令優先序

優先序固定如下：

1. 平台 / harness / safety 限制（sandbox、approval、network、secrets、data access）
2. 使用者最新明確指令，但不得違反第 1 層、本 repo safety gates 或 human checkpoint gates
3. 已被使用者 / maintainer 明確確認的 UI / UX decision（若存在）
4. `AGENTS.md`
5. `docs/process.md`
6. `docs/ops.md`
7. `docs/prd.md`（若存在）
8. `docs/tdd.md`（若存在）
9. repo 外 workflow runtimes / skills

若規則互相衝突，以較高優先序為準。
使用者指令只在不違反 platform、harness、safety、secrets 與 repo boundary constraints 的範圍內有效。

UI / UX authority rule：若已確認的 UI / UX decision 與 PRD、TDD、plan、tests 或既有實作衝突，以 UI / UX decision 為最高產品權威；衝突文件或測試應標記為 stale 並同步修正，而不是反過來壓過 UI / UX。

## 1.1) Minimum Terms

- `trivial change`：只影響 typo、formatting、non-behavioral comment 或措辭，且不改變 runtime behavior、product acceptance、test expectation、ops rule 或 durable requirement。
- `meaningful change`：任何 code、config、schema、dependency、public behavior、API contract、test expectation、deployment path、durable documentation、ops rule 或 requirement 的實質變更；不確定時預設 meaningful。
- `accepted change`：使用者批准、maintainer 接受、已合併、或明確要求成為 durable truth 的變更，且會改變 product behavior、technical design、operational procedure 或 requirements。
- `release-sensitive action`：deploy、release、rollout、migration、backup、restore、rollback、production-like config、CI/CD release path、auth、identity、payments、billing、secrets、production data 或 environment-changing action。
- `destructive action`：可能刪除、覆寫、不可逆修改 data/schema/config/branch/worktree/environment 的操作。
- `canonical doc sync required`：accepted durable behavior、design、ops rule 或 requirement 改變時，completion claim 前必須更新對應 canonical truth；若不需同步，回報中必須說明具體理由。

## 2) Runtime Model

外部 workflow runtime 可以擁有：

- brainstorming
- planning
- runtime working-artifact path selection
- worktree orchestration
- subagent orchestration
- implementation
- runtime-internal review
- branch finish flow

`runtime-adapter` 只負責：

- 在 task start 選擇最小必要的 repo-local expert skills
- 注入 canonical repo-truth references
- 提醒是否可能需要尾端 `release-gate`

`release-gate` 只負責：

- 對 deploy / rollout / migration / destructive environment actions 做 go / hold / require-human 判定
- 強制 release-sensitive preconditions 參照 `docs/ops.md`

`verifier` 只負責：

- 獨立驗證 correctness、regressions、repo-truth alignment
- 確認是否需要 PRD / TDD / ops / requirements 同步

repo 的靜態邊界規則直接由 `AGENTS.md` 與 `docs/` 提供；`runtime-adapter` 不得把自己膨脹成第二套 workflow engine。
repo-local skill 不得重寫外部 runtime 已經擁有的 generic workflow。
repo-local skill 不得接管 runtime working-artifact path selection。

若必要 repo-local control skill 缺失、不可讀或 runtime 不支援 skills，不得 silent proceed：

- 可直接依本 `AGENTS.md` 與 `docs/` 套用對應 contract。
- 若缺失的是 gated action 必需的 control skill（例如 release-sensitive action 需要 `release-gate`），預設結果為 `hold`。除非 runtime 能依本 `AGENTS.md` 與 `docs/ops.md` 明確完成等價 release-gate 判定，否則任務必須標記 `blocked` 並請求人工確認。
- `verifier` 不可用時，meaningful completion claim 至少必須做一個獨立 verification pass：只根據 final diff、canonical docs、commands 與 observed results 驗證，不得依賴 implementer self-justification。

## 2.1) Subagent Boundary Contract

外部 runtime 可以使用 subagents；repo 只管硬邊界，不接管 orchestration。

- 必須遵守本 repo 的 source of truth、workspace 邊界、human checkpoint gates、verification contract 與 release contract。
- 寫入型 subagent 必須有明確且互不重疊的 write scope。
- subagent 不得自動越過 human checkpoint gates；涉及 deploy、release、rollout、destructive git action、secrets、production config 時仍需人類同意與必要的 `release-gate`。
- subagent review 不取代 repo-local `verifier`。
- subagent 回報必須列出 touched files、commands、pass/fail、skipped checks 與 residual risks。

## 2.2) Tactical Coding Subagent Rules

產出 execution plan 時，必須做 Spark delegation pass：挑出可給 `gpt-5.3-codex-spark` 或等價 fast worker 的小型 coding task，並加入 plan。

- Spark 只做小範圍 coding；不做 planning、architecture、security、migration、release、verification ownership。
- 每個 Spark task 必須列 goal、write scope、forbidden scope、可否並行、驗證方式。
- 沒有適合 task 就寫原因；不得硬拆。
- Spark 不可用或 scope 不清時，主 runtime 接手，不得阻塞 workflow。

## 3) Repo-Local Skill Contract

repo-local expert skills 是 domain-specific knowledge overlays，不是 workflow owners。

expert skills 可提供：

- domain invariants
- repo-specific acceptance rules
- risk notes
- canonical reference pointers

expert skills 不得：

- 決定 runtime artifact path
- 重新編排 planning / implementation / review flow
- 取代 `verifier`
- 取代 `release-gate`

expert skills 的輸出應偏向 domain guidance，而不是 workflow choreography。

## 4) Source Of Truth

- confirmed UI / UX decisions：已被使用者或 maintainer 明確確認的畫面、互動、流程、文案、視覺層級與可用性決策；若與 PRD / TDD 衝突，以 UI / UX 為準
- canonical process boundary：`docs/process.md`
- operational constants：`docs/ops.md`
- canonical product behavior and acceptance：`docs/prd.md`（若存在）
- canonical technical design：`docs/tdd.md`（若存在）
- requirements normalization：`docs/requirements/README.md` 與對應 requirement files（若存在）
- runtime-generated specs、plans、review notes、scratch docs 不因路徑存在而成為 canonical truth
- 若 runtime default 與 repo truth 衝突，以 repo truth 為準。
- 若 confirmed UI / UX decisions 與 repo truth 衝突，先維持 UI / UX decision，再同步更新受影響的 PRD、TDD、requirements、tests 或 implementation。

## 5) Canonical Truth Locations And Runtime Artifacts

- canonical requirements normalization 預設放在 `docs/requirements/`
- canonical product behavior and acceptance 預設放在 `docs/prd.md`
- canonical technical design 預設放在 `docs/tdd.md`
- canonical operational truth 放在 `docs/ops.md`
- runtime working artifacts 例如 specs、plans、review notes、execution scratch docs 可由外部 runtime 寫入其自有路徑，包括 runtime default locations
- `docs/plans/` 只保留給 repo-authored governance records、manual planning records、historical artifacts；它不是外部 runtime 的必須目的地
- Runtime-generated plans 不得放入 `docs/plans/`，除非使用者或 maintainer 明確 promoted 成 durable repo governance record。
- branch naming、worktree naming、runtime artifact path selection 由外部 runtime 決定，除非使用者明確要求其他做法
- 若使用 Superpowers runtime，其 specs、plans、review notes 等 artifacts 依 Superpowers 自身歸檔規則存放；除非 accepted changes 同步回 canonical truth，否則仍屬 runtime working artifacts
- 若行為、設計、ops 或 durable requirements 發生 accepted change，必須在 completion claim 前同步回 canonical truth 檔案
- 小型、非 durable、未改變 acceptance 的修正採輕量模式；具體門檻由 `docs/process.md` 定義

## 6) Human Checkpoint Gates

外部 runtime 不得自動越過以下人工作業關卡：

- deploy / release / rollout
- destructive schema 或 destructive data change
- auth / identity
- payments / billing
- secrets / production config
- destructive git action
- branch / worktree deletion

對 deploy / release / rollout / destructive environment actions，若 `release-gate` 未給出 `go`，外部 runtime 不得繼續。

## 7) Verification Contract

- 任何 meaningful change 或 meaningful completion claim 都必須經過 `verifier`。
- trivial change 可走輕量驗證；但一旦宣稱完成，仍需明確說明檢查結果與是否需要 canonical doc sync。
- 外部 runtime 的 self-review 或 staged review 不取代 `verifier`。
- `verifier` 必須獨立於 implementation path。Verifier independence 意味著 verifier 必須依 final diff、repo truth 與 acceptance criteria 評估，不得依賴 implementer self-justification；若無 separate model/subagent，runtime 必須以 separate verification pass 執行，且只使用 diff、relevant docs、commands 與 observed results。
- `verifier` 回報必須包含：
  - verification commands
  - actual results
  - repo doc sync requirement
  - first-principles review status
  - residual risks or gaps

## 8) Recovery Contract

若 AI 發現自己沒有依照本文件執行，不用停在泛泛道歉。
必須直接使用固定補救格式，立即回到正確流程：

- `Process correction: repo-local control logic overreached into workflow. Returning workflow ownership to the external runtime now.`
- `Process correction: a runtime-owned artifact was treated as canonical. Re-anchoring to repo truth now.`
- `Process correction: verification was skipped. Running verifier before making completion claims.`
- `Process correction: release-sensitive action exceeded repo release rules. Running release-gate now.`

補救後直接繼續執行，不要把使用者留在空轉狀態。

## 9) 文件權威入口

- `docs/README.md`：閱讀順序與文件導覽
- `docs/process.md`：process boundary、planning gate、canonical sync rules
- `docs/ops.md`：operation constants and release-sensitive procedures
- `docs/prd.md`：canonical product behavior and acceptance（若存在）
- `docs/tdd.md`：canonical technical design（若存在）
- `docs/requirements/README.md`：requirements normalization entry（若存在）
- `.agents/skills/release-gate/SKILL.md`：release-sensitive go / hold gate
- `.agents/skills/runtime-adapter/SKILL.md`：thin expert-skill selector and repo-truth injector
- `.agents/skills/verifier/SKILL.md`：independent verification
