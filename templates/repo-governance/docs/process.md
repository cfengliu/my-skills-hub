# Process Rules

這份文件承接 `AGENTS.md`，只記錄需求、規格、planning、runtime artifacts 與 canonical sync 流程，不重複 AI 對話路由規則或 runtime-internal choreography。

`AGENTS.md` 定義 tactical subagent 的 repo-level 原則與禁止事項；本文件定義 tactical subagent 的 planning / execution 操作細節。

## 1) Canonical Chains

本 repo 的 canonical process 分成兩條鏈，分別回答不同問題。

### 1.1 Promotion Pipeline

用途：定義需求如何從原始討論升格成可實作範圍。

`meeting note / direct discussion -> requirement normalization -> PRD -> TDD -> plan -> implementation`

規則：

- raw discussion 與 meeting note 是 input capture，不等於已定案需求，也不等於 canonical requirement
- 正式會議或多決策討論可先保留於 `docs/meeting-notes/`；直接 chat 討論可直接作為 raw input，不強制補一份 meeting note
- `docs/requirements/` 是 durable requirement 的第一個 canonical normalization layer；若 repo 不追蹤 durable requirements，可省略
- 所有要被持續追蹤、升格或實作的需求，最終都應整理進對應 requirement file
- `docs/prd.md` 承接已被接受的 product behavior and acceptance；若 repo 非產品型，可改成等價 canonical behavior file
- `docs/tdd.md` 承接已被接受的 technical design；若 repo 不需要長期技術設計，可省略但需在 verifier 回報中說明
- `plan` 是 execution 前的 working artifact；其檔案路徑與格式可由 external runtime 決定
- 達到 `implementation` 表示已具備進入執行的前置條件，不表示可直接宣稱完成

輕量模式：

- 小型、非 durable、未改變 acceptance 的修正，不必先建立 requirement 或 PRD / TDD 切片
- 若該修正後續被接受為長期產品行為、技術設計、ops 規則或 durable requirement，completion claim 前必須同步回對應 canonical truth
- 若修正是否 durable 不確定，但已確認不改變 behavior / acceptance，可先以輕量模式執行，並在 verification 時明確標示 doc sync 判斷

### 1.2 Delivery Closure

用途：定義 implementation 開始後，何時可宣稱交付完成。

`implementation -> verification -> deployment (when applicable)`

規則：

- `verification` 是 completion gate，不是需求升格階段
- 非 trivial 變更或 meaningful completion claim，不得跳過 `verification` 就宣稱完成
- `deployment` 只在本次任務包含 release、rollout 或 environment change 時適用
- 若任務不含 deploy，canonical stopping point 是 verified implementation
- 若文件、測試、實作不一致，以最高層 canonical truth 為準，再回補其餘內容

trivial change 定義：

- 只影響拼字、註解、文件措辭、格式、明顯 typo、或不改變 runtime behavior / product acceptance 的局部修正
- 不涉及 release、migration、auth、payments、secrets、production-like config、資料毀損風險或 branch / worktree deletion
- 不新增或改變 canonical requirement、PRD acceptance、TDD design、ops rule

meaningful change 定義：

- 任何 runtime behavior、UI 結構、互動流程、顯示條件、資料模型、API contract、測試期望、ops 規則或 durable requirement 的變更
- 任何需要對外宣稱功能完成、bug fixed、regression covered、或 release-ready 的變更
- 任何不確定是否 trivial 的變更，預設視為 meaningful

trivial change 可採輕量驗證：檢查 diff、確認不需 canonical doc sync，並在回報中說明未跑完整 verifier 的理由。meaningful change 或 meaningful completion claim 仍必須經過 `verifier`。

### 1.3 Interpretation Rule

- Promotion Pipeline 解決「是否可以開始實作」
- Delivery Closure 解決「是否可以宣稱完成」
- `docs/requirements/README.md` 與 `docs/plans/README.md` 可描述各自負責的局部階段，但不得改寫這兩條 canonical chains
- 其他文件若需提及流程，應引用本節，不得重寫 canonical chain

### 1.4 Completion Claim Taxonomy

為避免把不同完成狀態混成同一個「完成」，回報狀態應使用下列詞彙：

- `not-started`：尚未改動，只完成 intake、analysis 或 planning
- `implemented`：已修改，但尚未完成 verification
- `checked`：已做輕量檢查；只適用於 trivial change，或明確說明為何未達 verifier 階段
- `verified`：`verifier` 已 pass；若任務不含 release-sensitive action，這是 canonical stopping point
- `release-ready`：`release-gate` 已給 `go`，但尚未 deploy / rollout
- `released`：已 deploy / rollout，且 post-deploy checks pass
- `blocked`：缺權限、缺環境、檢查失敗、需求衝突或需要人工確認

不得用 `complete` 或「完成」掩蓋 verification、release-gate 或 post-deploy checks 尚未發生的狀態。

## 2) Planning Threshold

以下任一情況，必須先寫 plan，再進入實作：

- 2 個以上檔案修改
- 同時涉及文件、程式、測試
- 跨元件 / 跨頁狀態或互動流程調整
- 新互動模式、新流程、或既有驗收標準變動
- 使用者明確要求 planning / writing-plans

例外：符合 trivial change 定義的輕量修正，不因修改 2 個以上檔案而自動要求 plan；仍需輕量驗證與 doc sync 判斷。

若不確定是否屬於複雜任務，預設視為複雜。

複雜任務必須有 plan，但 plan file path、format 與 supporting artifacts 由 external runtime 決定。

### 2.1) Spark Delegation Pass

產出 execution plan 時，必須做 Spark delegation pass：

- 掃描 planned tasks，挑出可給 `gpt-5.3-codex-spark` 或等價 fast worker 的小型 coding task。
- 適合條件：scope 小、write scope 明確、可平行、不碰敏感區、主 runtime 可快速驗證。
- 禁止交給 Spark：planning、architecture、security/auth、migration、payments、secrets、release/deploy、verification ownership、長時間 debugging、跨 repo refactor。
- 每個 Spark task 必須列：goal、write scope、forbidden scope、可否並行、驗證方式。
- 沒有適合 Spark 的 task，plan 必須寫一句原因。
- Spark 不可用或 scope 不清時，主 runtime 接手；不得阻塞 workflow。

委派 prompt 用這個最小格式：

```text
Spawn a tactical coding subagent for this scoped task.
Goal: ...
Allowed write scope: ...
Forbidden scope: ...
Verify with: ...
Return touched files, summary, commands/skips, residual risks.
Stop if scope expands or touches forbidden/sensitive areas.
```

## 3) Implementation Start Rule

- 即使是非複雜任務，也要先完成一次簡要規劃思考
- 只有在使用者已明確下達開發指令後，才可開始實作
- planning 完成後，可直接在同一 session 執行，不必再等待額外流程切換，除非使用者或平台要求

## 4) Plan Execution

- 若平台支援且任務可拆分，優先採可平行的執行方式
- 進入執行後，原則上應完成 plan 全部 tasks
- 只有以下情況可暫停：
  - blocker
  - 需求衝突且需要使用者決策
  - 使用者明確要求中止或改道

## 4.5) Subagent Execution Boundary

- subagent 使用前必須有明確目標、scope、允許修改範圍、禁止修改範圍、必要 canonical refs、驗證期望。
- 寫入型 subagent 必須有明確 write scope；平行 subagents 的 write scope 不得重疊。
- exploration / verifier sidecar subagents 預設不得修改檔案。
- tactical coding subagent 只能執行第 2.1 節選出的 bounded coding tasks。
- subagent 若遇到需求衝突、scope 擴大、forbidden scope、release-sensitive action、secrets、production config、destructive action 或 destructive git action，必須回報 blocked。
- runtime-internal review 或 subagent review 可作為 evidence，但不取代 repo-local `verifier` completion gate。
- meaningful completion claim 必須整合 subagent 結果，列出哪些檢查由 subagent 執行、哪些由主 runtime 執行、哪些 skipped 以及原因。

### 4.6) Tactical Coding Subagent Output Contract

Tactical coding subagent output 必須包含 touched files、edit summary、commands/skips、blocked items 與 residual risks。

Subagent output 不自動可信。主 runtime 必須 inspect diff、跑必要 checks，並滿足 repo-local `verifier` contract。

## 5) Runtime Artifact Sync Rule

- external runtime 可在其自有路徑產生 specs、plans、review notes、scratch docs
- 若 external runtime 是 Superpowers，artifact path 與歸檔方式依 Superpowers 自身規則；repo 不另外指定或覆寫
- 這些 artifacts 是 working materials，不因路徑存在而變成 canonical truth
- accepted behavior changes 必須同步到 `docs/prd.md`，若 repo 使用 PRD 作為 canonical truth
- accepted technical design changes 必須同步到 `docs/tdd.md`，若 repo 使用 TDD 作為 canonical truth
- accepted ops 或 release changes 必須同步到 `docs/ops.md`
- durable requirements 必須回寫到 `docs/requirements/` 下的對應檔案，若 repo 追蹤 durable requirements

Meaningful completion claim 必須明確回報 canonical sync 判斷。即使不需要同步，也必須說明理由：

```text
Docs sync:
- PRD: updated / not needed because ... / needs sync because ... / not applicable because ...
- TDD: updated / not needed because ... / needs sync because ... / not applicable because ...
- Ops: updated / not applicable because ... / needs sync because ...
- Requirements: updated / not applicable because ... / needs sync because ...
```

`not needed` 或 `not applicable` 不得只作為結論；必須連到具體原因，例如未改變產品行為、未改變技術設計、未改變 ops 規則、或未新增 durable requirement。

## 6) UI / UX Authority And Sync Rule

已被使用者或 maintainer 明確確認的 UI / UX decision 是最高產品權威。若 UI / UX 與 PRD、TDD、plan、tests 或既有實作衝突：

1. 以 UI / UX decision 為準。
2. 將 PRD、TDD、requirements、tests 或 implementation 的衝突處標記為 stale / needs-sync。
3. completion claim 前同步更新受影響 canonical docs；若暫時無法同步，回報必須明確列出 blocker 與殘留風險。

UI / UX decision 包含但不限於：

- UI 結構
- layout / visual hierarchy
- 互動流程
- 顯示條件
- 文案與 affordance
- accessibility / usability expectation
- 驗收行為

若變更涉及以上任一項，且 repo 使用 PRD 作為 canonical truth，必須同步更新 `docs/prd.md`。若變更也改變技術設計，必須同步更新 `docs/tdd.md`。

可接受格式：

- ASCII
- wireframe 式文字
- 狀態與行為描述

重點是 canonical docs 必須能反映最新 UI / UX authority，不要求單一格式。

## 7) Worktree And Branch Ownership

- external runtime 擁有 branch naming、worktree naming、與 worktree strategy
- 本 repo 不再規定 runtime artifact path 或 branch prefix
- 對不同 objective 使用隔離 worktree 通常較安全，但屬於 runtime workflow decision，不是 repo 必須流程
- branch / worktree deletion 仍受 `AGENTS.md` 的 human checkpoint gates 約束
