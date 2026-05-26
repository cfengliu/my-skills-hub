# Process Rules

這份文件承接 `AGENTS.md`，只記錄需求、規格、planning、runtime artifacts、subagent decision 與 canonical sync 流程，不重複 AI 對話路由規則或 runtime-internal choreography。

`AGENTS.md` 定義 subagent 的 repo-level 原則與禁止事項；本文件定義 planning / execution 時如何做輕量 subagent decision。

## 1) Canonical Chains

本 repo 的 canonical process 分成兩條鏈，分別回答不同問題。

### 1.1) Promotion Pipeline

用途：定義需求如何從原始討論升格成可實作範圍。

```text
meeting note / direct discussion -> requirement normalization -> PRD -> TDD -> plan -> implementation
```

規則：

- raw discussion 與 meeting note 是 input capture，不等於已定案需求，也不等於 canonical requirement。
- 正式會議或多決策討論可先保留於 `docs/meeting-notes/`；直接 chat 討論可直接作為 raw input，不強制補一份 meeting note。
- `docs/requirements/` 是 durable requirement 的第一個 canonical normalization layer；若 repo 不追蹤 durable requirements，可省略。
- 所有要被持續追蹤、升格或實作的需求，最終都應整理進對應 requirement file。
- `docs/prd.md` 承接已被接受的 product behavior and acceptance；若 repo 非產品型，可改成等價 canonical behavior file。
- `docs/tdd.md` 承接已被接受的 technical design；若 repo 不需要長期技術設計，可省略但需在 verifier 回報中說明。
- `plan` 是 execution 前的 working artifact；其檔案路徑與格式可由 external runtime 決定。
- 達到 `implementation` 表示已具備進入執行的前置條件，不表示可直接宣稱完成。

輕量模式：

- 小型、非 durable、未改變 acceptance 的修正，不必先建立 requirement 或 PRD / TDD 切片。
- 若該修正後續被接受為長期產品行為、技術設計、ops 規則或 durable requirement，completion claim 前必須同步回對應 canonical truth。
- 若修正是否 durable 不確定，但已確認不改變 behavior / acceptance，可先以輕量模式執行，並在 verification 時明確標示 doc sync 判斷。

### 1.2) Delivery Closure

用途：定義 implementation 開始後，何時可宣稱交付完成。

```text
implementation -> verification -> deployment (when applicable)
```

規則：

- `verification` 是 completion gate，不是需求升格階段。
- 非 trivial 變更或 meaningful completion claim，不得跳過 `verification` 就宣稱完成。
- `deployment` 只在本次任務包含 release、rollout 或 environment change 時適用。
- 若任務不含 deploy，canonical stopping point 是 verified implementation。
- 若文件、測試、實作不一致，以最高層 canonical truth 為準，再回補其餘內容。

trivial change 定義：

- 只影響拼字、註解、文件措辭、格式、明顯 typo、或不改變 runtime behavior / product acceptance 的局部修正。
- 不涉及 release、migration、auth、payments、secrets、production-like config、資料毀損風險或 branch / worktree deletion。
- 不新增或改變 canonical requirement、PRD acceptance、TDD design、ops rule。

meaningful change 定義：

- 任何 runtime behavior、UI 結構、互動流程、顯示條件、資料模型、API contract、測試期望、ops 規則或 durable requirement 的變更。
- 任何需要對外宣稱功能完成、bug fixed、regression covered、或 release-ready 的變更。
- 任何不確定是否 trivial 的變更，預設視為 meaningful。

trivial change 可採輕量驗證：檢查 diff、確認不需 canonical doc sync，並在回報中說明未跑完整 verifier 的理由。meaningful change 或 meaningful completion claim 仍必須經過 `verifier`。

### 1.3) Interpretation Rule

- Promotion Pipeline 解決「是否可以開始實作」。
- Delivery Closure 解決「是否可以宣稱完成」。
- `docs/requirements/README.md` 與 `docs/plans/README.md` 可描述各自負責的局部階段，但不得改寫這兩條 canonical chains。
- 其他文件若需提及流程，應引用本節，不得重寫 canonical chain。

### 1.4) Completion Claim Taxonomy

為避免把不同完成狀態混成同一個「完成」，回報狀態應使用下列詞彙：

- `not-started`：尚未改動，只完成 intake、analysis 或 planning。
- `implemented`：已修改，但尚未完成 verification。
- `checked`：已做輕量檢查；只適用於 trivial change，或明確說明為何未達 verifier 階段。
- `verified`：`verifier` 已 pass；若任務不含 release-sensitive action，這是 canonical stopping point。
- `release-ready`：`release-gate` 已給 `go`，但尚未 deploy / rollout。
- `released`：已 deploy / rollout，且 post-deploy checks pass。
- `blocked`：缺權限、缺環境、檢查失敗、需求衝突或需要人工確認。

不得用 `complete` 或「完成」掩蓋 verification、release-gate 或 post-deploy checks 尚未發生的狀態。

## 2) Planning Threshold

以下任一情況，必須先有 explicit plan，再進入實作。除非使用者或 runtime 要求 plan file，簡短 inline plan 即可：

- 2 個以上檔案修改
- 同時涉及文件、程式、測試
- 跨元件 / 跨頁狀態或互動流程調整
- 新互動模式、新流程、或既有驗收標準變動
- 使用者明確要求 planning / writing-plans

例外：符合 trivial change 定義的輕量修正，不因修改 2 個以上檔案而自動要求 plan；仍需輕量驗證與 doc sync 判斷。

若不確定是否屬於複雜任務，預設視為複雜。

複雜任務必須有 explicit plan，但 plan file path、format 與 supporting artifacts 由 external runtime 決定。

### 2.1) Task Execution Routing

Planning and final judgment stay with the main runtime.

After an explicit plan or task list exists, route each execution task independently.

Default routing:

```text
planning / architecture / risk / integration / verification judgment -> main runtime
eligible bounded low-risk execution task -> low-cost task execution subagent
complex / ambiguous / high-risk / hard-to-verify execution task -> main runtime
```

A task is eligible for the low-cost task execution subagent only when all conditions are true:

- task is an execution task, not planning、architecture、security、release、migration、or verification ownership
- goal and acceptance are clear
- read scope and write scope are explicit
- forbidden scope is explicit
- expected output can be short and structured
- main runtime can inspect and verify the result cheaply
- task does not involve secrets、production config、auth、billing、payments、destructive action、or release-sensitive action
- task does not require broad cross-module redesign or ambiguous reasoning

Escalate to main runtime when any condition is true:

- requirements are unclear
- implementation requires architecture decision
- change affects schema、API contract、security boundary、auth、billing、payments、deployment path、or durable ops behavior
- task spans multiple high-coupling modules
- failure mode is hard to detect with local checks
- tests are failing for unclear reasons
- subagent would need large repo context to understand the task

Parallelism is optional.

- If tasks are independent and write scopes do not overlap, they may run in parallel.
- A bounded task may be delegated sequentially even when it cannot run in parallel.
- If write scopes overlap, main runtime must coordinate ordering and inspect each diff before continuing.

If using a subagent, the plan must include:

```text
Subagent task:
- task name:
- model:
- goal:
- read scope:
- write scope:
- forbidden scope:
- can run in parallel:
- expected output:
- verification method:
- escalation trigger:
```

If no task is eligible, write:

```text
Subagents: none; tasks are too small, too ambiguous, too risky, or cheaper to do inline.
```

Do not force artificial task splitting.

## 3) Implementation Start Rule

- 即使是非複雜任務，也要先完成一次簡要規劃思考。
- 只有在使用者已明確下達開發指令後，才可開始實作。
- planning 完成後，可直接在同一 session 執行，不必再等待額外流程切換，除非使用者或平台要求。

## 4) Plan Execution

- 若平台支援且任務可拆分，依第 2.1 節 route execution tasks；main runtime remains accountable for integration and final judgment。
- 進入執行後，原則上應完成 plan 全部 tasks。
- 只有以下情況可暫停：
  - blocker
  - 需求衝突且需要使用者決策
  - 使用者明確要求中止或改道

### 4.5) Subagent Execution Boundary

If subagents are used, the main runtime remains accountable.

- Subagents must stay within assigned read/write scope.
- Parallel write scopes must not overlap.
- Exploration / verifier sidecar subagents must not modify files.
- If a subagent hits scope expansion, forbidden scope, secrets, production config, release-sensitive action, destructive action, destructive git action, or requirement conflict, it must report `blocked`.
- Subagent output must include touched files, edit summary, commands run or skipped, blocked items, and residual risks.
- Subagent output is evidence, not authority. The main runtime must inspect the diff, run necessary checks, and satisfy the repo-local `verifier` contract.

## 4.6) Post-Plan Review And Commit Gate

每次 plan execution 結束後，若本次工作進入 commit candidate 狀態，commit 前必須先完成 post-plan review gate。

Post-plan review gate 的目的不是取代 `verifier`，而是在 commit 前補一層工程判斷與第一原理挑戰，避免「檢查有跑但核心不成立」的假成功。

必要步驟：

1. 依第 1.2 節完成適用的 verification；meaningful change 或 meaningful completion claim 仍必須經過 `verifier`。
2. 做 first-principles review；具體 checklist 以 `.agents/skills/verifier/SKILL.md` 為準。
3. 做最小必要 engineering review：
   - 對小型 doc / governance change，至少確認 key decisions、selected / skipped checks 與 verification evidence
   - 對 feature / refactor / launch 類工作，依風險升級到更嚴格檢查，不強制固定 skill
4. 確認 canonical doc sync 狀態：
   - 已同步，或
   - 明確說明不需要同步的原因，或
   - 若需要但尚未同步，標記 blocked，不得 commit
5. 若沒有 P1/P2 blocker，回報 review verdict、verification evidence、doc sync status 與 residual risks。
6. commit 前必須詢問使用者是否可以 commit；即使 review pass，也不得自動 commit。

Commit hold 條件：

- verification 或 `verifier` fail
- post-plan review 發現 P1/P2 blocker
- canonical doc sync required 但尚未完成
- working tree 含 unrelated changes 且尚未釐清 scope
- release-sensitive action 尚未通過 `release-gate`
- commit message / commit scope 尚未明確

## 4.7) Completion Report Contract

Meaningful completion report 必須包含：

```text
Summary:
Touched files:
Commands run:
Results:
Skipped checks:
Doc sync:
Verifier:
Residual risks:
Commit status:
```

Commit status 必須是 `not requested`、`waiting for user approval` 或 `committed with hash <hash>`。

## 5) Runtime Artifact Sync Rule

- external runtime 可在其自有路徑產生 specs、plans、review notes、scratch docs。
- 若 external runtime 是 Superpowers，artifact path 與歸檔方式依 Superpowers 自身規則；repo 不另外指定或覆寫。
- 這些 artifacts 是 working materials，不因路徑存在而變成 canonical truth。
- accepted behavior changes 必須同步到 `docs/prd.md`，若 repo 使用 PRD 作為 canonical truth。
- accepted technical design changes 必須同步到 `docs/tdd.md`，若 repo 使用 TDD 作為 canonical truth。
- accepted ops、model policy 或 release changes 必須同步到 `docs/ops.md`。
- durable requirements 必須回寫到 `docs/requirements/` 下的對應檔案，若 repo 追蹤 durable requirements。

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

UI / UX decision 包含但不限於 UI 結構、layout / visual hierarchy、互動流程、顯示條件、文案與 affordance、accessibility / usability expectation、驗收行為。

若變更涉及以上任一項，且 repo 使用 PRD 作為 canonical truth，必須同步更新 `docs/prd.md`。若變更也改變技術設計，必須同步更新 `docs/tdd.md`。

可接受格式：ASCII、wireframe 式文字、狀態與行為描述。重點是 canonical docs 必須能反映最新 UI / UX authority，不要求單一格式。

## 7) Worktree And Branch Ownership

- external runtime 擁有 branch naming、worktree naming、與 worktree strategy。
- 本 repo 不再規定 runtime artifact path 或 branch prefix。
- 對不同 objective 使用隔離 worktree 通常較安全，但屬於 runtime workflow decision，不是 repo 必須流程。
- branch / worktree deletion 仍受 `AGENTS.md` 的 human checkpoint gates 約束。
