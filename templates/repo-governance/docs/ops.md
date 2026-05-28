# Ops Rules

這份文件記錄 repo 的操作常數與執行規則。套用此 template 後，請把 placeholder 改成目標 repo 的實際值；未使用的區塊可刪除或標示 not applicable。

## 專案常數

- project name：`<PROJECT_NAME>`
- primary runtime：`<RUNTIME_OR_FRAMEWORK>`
- package manager：`<npm | pnpm | yarn | uv | cargo | go | other>`
- default local URL：`<LOCAL_DEV_URL_OR_NOT_APPLICABLE>`
- production or release target：`<DEPLOY_TARGET_OR_NOT_APPLICABLE>`

## Model 政策

模型選擇是 operational constant，不是 `AGENTS.md` 的固定產品規格。套用 template 後，請依目標 repo、平台可用性、成本與風險更新。

- main planning / reasoning / final judgment model：`<MAIN_REASONING_MODEL_OR_PLATFORM_DEFAULT>`
- low-cost task execution subagent model：`<LOW_COST_TASK_EXECUTION_SUBAGENT_MODEL_OR_NOT_APPLICABLE>`
- last reviewed：`<YYYY-MM-DD>`

範例 mapping，可依當下平台支援替換：

- main planning / reasoning / final judgment model：`gpt-5.5`
- low-cost task execution subagent model：`gpt-5.4-mini`

原則：

- planning、architecture、ambiguous reasoning、security、release、migration、integration judgment 與 verifier final judgment 使用 main planning / reasoning / final judgment model。
- explicit plan / task list 產生後，bounded、low-risk、cheap-to-verify 的 execution tasks 應優先使用 low-cost task execution subagent model。
- 若 low-cost task execution subagent model 是 `not applicable`、不可用或平台不支援，eligible tasks 應改由 main runtime inline 執行或使用平台預設可用模型；不得編造 model ID，也不得因缺少 low-cost model 而阻塞非必要 delegation。
- subagent 不擁有 planning、architecture、security、release、migration、destructive action、verification ownership 或 final completion judgment。
- main runtime 必須 inspect subagent diff、整合結果、執行必要 checks，並滿足 `verifier` contract。

## Dev Server 規則

- 僅在「本次有修改 repo 內檔案，且需要 browser 預覽或人工驗收前端畫面」時，才自動啟動開發伺服器。
- 預設 dev server command：`<DEV_SERVER_COMMAND>`
- 若不需要人工確認前端畫面（如文件、純 render、純資料整理、套件安裝、非 UI 調整），不得自動啟動。
- 若開發伺服器已在執行，需回報既有 URL 與 session，不得重複啟動。
- 若啟動失敗，需立即回報原因並提供替代方案。

## 驗證指令

請依 repo 實際工具鏈填入穩定 entrypoints。

- unit tests：`<UNIT_TEST_COMMAND_OR_NOT_APPLICABLE>`
- typecheck：`<TYPECHECK_COMMAND_OR_NOT_APPLICABLE>`
- lint：`<LINT_COMMAND_OR_NOT_APPLICABLE>`
- build：`<BUILD_COMMAND_OR_NOT_APPLICABLE>`
- e2e / browser checks：`<E2E_COMMAND_OR_NOT_APPLICABLE>`

## Backup 與 Restore 規則

若 repo 有 database、object storage、或 production-like local stack，填入實際命令。

- backup command：`<BACKUP_COMMAND_OR_NOT_APPLICABLE>`
- restore command：`<RESTORE_COMMAND_OR_NOT_APPLICABLE>`
- backup output directory：`<BACKUP_OUTPUT_DIR_OR_NOT_APPLICABLE>`
- persistent data paths：`<PERSISTENT_DATA_PATHS_OR_NOT_APPLICABLE>`

## Deploy / Release 規則

若 repo 有 deploy、release、rollout 或 migration 行為，填入實際步驟。

- deploy command：`<DEPLOY_COMMAND_OR_NOT_APPLICABLE>`
- rollback command：`<ROLLBACK_COMMAND_OR_NOT_APPLICABLE>`
- migration command：`<MIGRATION_COMMAND_OR_NOT_APPLICABLE>`
- post-deploy checks：`<POST_DEPLOY_CHECKS_OR_NOT_APPLICABLE>`

任何 release-sensitive action 或 destructive environment action 前，都必須先跑 `.agents/skills/release-gate/SKILL.md`。

## Destructive Change 規則

涉及 destructive schema、destructive data、production-like config、secrets、auth、payments、billing、或 environment bootstrap 時：

1. 明確列出目標環境。
2. 明確列出資料毀損或 rollback 風險。
3. 先完成必要 backup。
4. 先取得人類確認。
5. release-gate 必須回傳 `go` 才能繼續。
6. 完成後執行 post-action checks 並回報實際結果。
