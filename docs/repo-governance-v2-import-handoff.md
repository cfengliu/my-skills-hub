# Repo Governance v2 匯入指南

將 `templates/repo-governance-v2` 初始化、升級或遷移到指定 repo，保留目標專案既有規則、資料與 skills。

## 交接指令

```text
Source: <PATH_TO_MY_SKILLS_HUB>/templates/repo-governance-v2
Target: <PATH_TO_TARGET_REPO>

依 source 的 docs/governance/MANIFEST.md 與本指南執行。
先判定初始化、升級或舊版遷移，再建立檔案變更清單。
保留 target 的 local truth、非 managed skills、原始碼、測試、機密與操作筆記。
完成後回報變更、保留項目、驗證結果與待確認事項；commit 需使用者明確批准。
```

## 判定與變更清單

1. 確認 source 與 target 的絕對路徑；不要從目前工作目錄猜目標。
2. 讀取 source 的 `docs/governance/MANIFEST.md`、`VERSION` 與 `README.md`。
3. 讀取 target 的 `AGENTS.md`、既有 manifest、版本、local 文件與 skills；檢查舊版治理文件。
4. 沒有 manifest 時採初始化；已有 manifest 時比對版本與差異。存在舊版規則時，加入遷移步驟。
5. 依 source manifest 的 replaceable、never-overwrite、initialization-only 與 required-file 清單建立變更集合。本指南不另維護一份允許覆蓋清單。
6. 升級時保留 target local truth 與所有非 managed control skills。路徑未明確允許時，不自動覆蓋。

## 初始化與遷移

- 將 manifest 指定的 managed files 與完整 control skill set 安裝到 target 對應位置。
- target 已有 `AGENTS.md` 時，先將專案專屬規則依領域遷移到 local 文件，再替換入口；未解決的規則衝突先請使用者決定。
- 只為缺少的 local 文件複製 manifest 列出的 example，移除檔名的 `.example`，並改用 repo-owned header。涵蓋 Ops、PRD、Technical Design、Security、Roadmap 與 epic ledger。
- 初始化後，空白或 placeholder 仍是 unknown；不能聲稱已確認需求或政策。
- local skills extension 說明只在不存在時建立。
- 舊版 `docs/ops.md`、`docs/prd.md`、`docs/tdd.md`、`docs/requirements/*` 依領域遷移；保留原檔，除非使用者明確授權刪除或封存。
- source 的 managed process 取代通用流程；專案例外進 local 文件，不把舊 workflow 整份複製到 managed 入口。

## 升級

依 manifest 執行 candidate replace set 與 denylist 檢查，只替換允許的 managed files。保留 initialized local 文件；不要用 examples 覆蓋它們。

War Room 是可選工具；有需求時另檢查 `tools/war-room/README.md`、目標工具差異與相關測試。它不在目前 manifest 的自動覆蓋清單內。

## 驗證與回報

執行 source manifest 的 compatibility checklist，區分 source package 與 initialized repo 的要求，並檢查：

- required managed files、control skills 與 initialized local files 齊全。
- 版本與實際安裝內容一致，managed、example、repo-owned headers 正確。
- local truth、非 managed skills、機密與舊文件沒有被意外覆蓋或刪除。
- 搬移後的引用、Markdown 結構與 skill frontmatter 正確。

```md
## Governance import report
- Target and mode:
- Source / previous target version:
- Changed files:
- Preserved files and legacy migration:
- Commands and actual results:
- Skipped checks and reasons:
- Unresolved decisions / human review:
- Commit status: not requested | waiting for user approval | committed with hash <hash>
```
