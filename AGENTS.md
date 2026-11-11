# AGENTS.md

## 語言與輸出

- 一律用台灣中文回答；code comment 用英文。
- 制定或修改規則、模板時，逐句檢查必要性，刪除無助於決策、修改或驗證的內容。

## Repo 結構

- 目前只維護 standalone skills，放在 `skills/<skill-name>/`。
- skill 資料夾名稱使用 kebab-case，不設 category 層。
- 每個 skill 必須自包含；主要內容放在自己的 `SKILL.md`，必要資源放在同一資料夾。
- 有實際內容才建立 supporting folders；不在 repo root 直接放 skill，不建立 `dist/`。
- `INDEX.md` 只做 catalog，列出每個 skill 的路徑與用途。

## SKILL.md

每個檔案以 frontmatter 開頭：

```md
---
name: skill-name
description: "Use when ..."
---
```

- `name` 等於資料夾名稱，不加分類前綴。
- `description` 描述觸發情境，不寫流程摘要。
- 內文說明使用情境、目的、產出格式、具體流程與完成檢查；指令必須可操作、可驗證。
- 範本使用 Markdown code fence；只保留有用途的章節。

## 變更與驗證

1. 新增時建立可直接使用的 skill 與必要資源。
2. 搬移或改名時保留 supporting files；改名後同步 frontmatter 的 `name`。
3. 刪除前確認不應搬到其他位置；同步移除失去用途的配套。
4. 更新 `INDEX.md` 與受影響引用。
5. 檢查 Markdown 結構、連結、所有 skill 的 frontmatter 與資料夾名稱。
6. 確認 catalog 完整、列出的路徑存在、沒有重複 skill、空資料夾或 root skill。
7. 修改執行腳本時，執行相關行為驗證，回報實際結果與略過項目。
