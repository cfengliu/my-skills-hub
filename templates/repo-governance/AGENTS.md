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

## 1) 指令優先序

優先序固定如下：

1. 使用者最新明確指令
2. 平台 / harness 限制（sandbox、approval、network、secrets）
3. `AGENTS.md`
4. `docs/process.md`
5. `docs/ops.md`
6. `docs/prd.md`（若存在）
7. `docs/tdd.md`（若存在）
8. repo 外 workflow runtimes / skills

若規則互相衝突，以較高優先序為準。

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

## 2.1) Subagent Boundary Contract

- 外部 runtime 可以使用 subagents 做 exploration、implementation、spec review、code quality review、verification support。
- subagent dispatch / orchestration 是外部 runtime 的責任，不是 repo-local skill 的責任。
- subagents 必須遵守本 repo 的 source of truth、workspace 邊界、human checkpoint gates、verification contract、release contract。
- repo-local expert skills 可以被注入給 subagent 作為 domain guidance，但不得讓 expert skill 接管 subagent workflow。
- 不同 subagents 若會修改檔案，必須有明確且互不重疊的 write scope，避免互相覆蓋。
- subagent 的 self-review 或 runtime-internal review 不取代 repo-local `verifier`。
- subagent 不得自動越過 human checkpoint gates；涉及 deploy、release、rollout、destructive git action、secrets、production config 時仍需人類同意與必要的 `release-gate`。
- subagent 回報應明確列出 touched files、commands、pass/fail、blocked/skipped checks 與 residual risks，供主 runtime 與 `verifier` 整合判斷。

### 2.2) Spark Subagent Hard Rules

若 external runtime 支援 `gpt-5.3-codex-spark`，Spark 只能作為快速、狹窄、戰術型 coding subagent 使用；Spark 是快手，不是主腦。

符合 Spark 條件的小型局部 coding task，external runtime 應優先考慮委派給 Spark；若 scope、限制或驗證方式不明確，預設交由主 runtime 處理。

若任務進入 planning，plan 應先標出可交給 Spark 的小型局部任務；不確定就留給主 runtime。

Spark 不得作為 planner、architect、verifier、review owner、release judge、security reviewer 或長時間自主 agent。Spark output 不自動可信，且不得取代 repo-local `verifier`。

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

- canonical process boundary：`docs/process.md`
- operational constants：`docs/ops.md`
- canonical product behavior and acceptance：`docs/prd.md`（若存在）
- canonical technical design：`docs/tdd.md`（若存在）
- requirements normalization：`docs/requirements/README.md` 與對應 requirement files（若存在）
- runtime-generated specs、plans、review notes、scratch docs 不因路徑存在而成為 canonical truth
- 若 runtime default 與 repo truth 衝突，以 repo truth 為準。

## 5) Canonical Truth Locations And Runtime Artifacts

- canonical requirements normalization 預設放在 `docs/requirements/`
- canonical product behavior and acceptance 預設放在 `docs/prd.md`
- canonical technical design 預設放在 `docs/tdd.md`
- canonical operational truth 放在 `docs/ops.md`
- runtime working artifacts 例如 specs、plans、review notes、execution scratch docs 可由外部 runtime 寫入其自有路徑，包括 runtime default locations
- `docs/plans/` 只保留給 repo-authored governance records、manual planning records、historical artifacts；它不是外部 runtime 的必須目的地
- branch naming、worktree naming、runtime artifact path selection 由外部 runtime 決定，除非使用者明確要求其他做法
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
- `verifier` 必須獨立於 implementation path。
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
