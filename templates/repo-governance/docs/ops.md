# Ops Rules

這份文件記錄 repo 的操作常數與執行規則。套用此 template 後，請把 placeholder 改成目標 repo 的實際值；未使用的區塊可刪除或標示 not applicable。

## Project Constants

- project name：`<PROJECT_NAME>`
- primary runtime：`<RUNTIME_OR_FRAMEWORK>`
- package manager：`<npm | pnpm | yarn | uv | cargo | go | other>`
- default local URL：`<LOCAL_DEV_URL_OR_NOT_APPLICABLE>`
- production or release target：`<DEPLOY_TARGET_OR_NOT_APPLICABLE>`

## Dev Server Rule

- 僅在「本次有修改 repo 內檔案，且需要 browser 預覽或人工驗收前端畫面」時，才自動啟動開發伺服器。
- 預設 dev server command：`<DEV_SERVER_COMMAND>`
- 若不需要人工確認前端畫面（如文件、純 render、純資料整理、套件安裝、非 UI 調整），不得自動啟動。
- 若開發伺服器已在執行，需回報既有 URL 與 session，不得重複啟動。
- 若啟動失敗，需立即回報原因並提供替代方案。

## Verification Commands

請依 repo 實際工具鏈填入穩定 entrypoints。

- unit tests：`<UNIT_TEST_COMMAND_OR_NOT_APPLICABLE>`
- typecheck：`<TYPECHECK_COMMAND_OR_NOT_APPLICABLE>`
- lint：`<LINT_COMMAND_OR_NOT_APPLICABLE>`
- build：`<BUILD_COMMAND_OR_NOT_APPLICABLE>`
- e2e / browser checks：`<E2E_COMMAND_OR_NOT_APPLICABLE>`

## Backup And Restore Rule

若 repo 有 database、object storage、或 production-like local stack，填入實際命令。

- backup command：`<BACKUP_COMMAND_OR_NOT_APPLICABLE>`
- restore command：`<RESTORE_COMMAND_OR_NOT_APPLICABLE>`
- backup output directory：`<BACKUP_OUTPUT_DIR_OR_NOT_APPLICABLE>`
- persistent data paths：`<PERSISTENT_DATA_PATHS_OR_NOT_APPLICABLE>`

## Deploy / Release Rule

若 repo 有 deploy、release、rollout 或 migration 行為，填入實際步驟。

- deploy command：`<DEPLOY_COMMAND_OR_NOT_APPLICABLE>`
- rollback command：`<ROLLBACK_COMMAND_OR_NOT_APPLICABLE>`
- migration command：`<MIGRATION_COMMAND_OR_NOT_APPLICABLE>`
- post-deploy checks：`<POST_DEPLOY_CHECKS_OR_NOT_APPLICABLE>`

任何 deploy / release / rollout / destructive environment action 前，都必須先跑 `.agents/skills/release-gate/SKILL.md`。

## Destructive Change Rule

涉及 destructive schema、destructive data、production-like config、secrets、auth、payments、billing、或 environment bootstrap 時：

1. 明確列出目標環境。
2. 明確列出資料毀損或 rollback 風險。
3. 先完成必要 backup。
4. 先取得人類確認。
5. release-gate 必須回傳 `go` 才能繼續。
6. 完成後執行 post-action checks 並回報實際結果。
