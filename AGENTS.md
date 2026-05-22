# AGENTS.md

## 語言

- 一律用台灣中文回答。
- code comment 一律用英文。

## Repo 規則

- 這個 repo 只放可安裝、可維護的 Codex/Agent skills。
- skill 必須放在分類資料夾底下，不可直接放 repo root。
- 每個 skill 必須是自包含資料夾。
- 每個 skill 的主要內容必須放在該 skill 資料夾的 `SKILL.md`。
- `INDEX.md` 只做 catalog；不可取代實際分類資料夾。
- 不要建立空分類；有第一個 skill 時才建立分類。

## 分類規則

- 分類用領域、角色或使用場景命名。
- 分類可以新增、移動、重命名。
- 不要因為現有分類而把 skill 硬塞到不準的位置。
- 新增或移動 skill 前，先判斷最準確分類。
- 類別名稱使用 kebab-case。
- skill 資料夾名稱使用 kebab-case。

## `dist/` 規則

- 預設不要建立 `dist/`。
- 只有明確遇到 agent runtime 不支援巢狀 skill discovery 時，才建立 `dist/`。
- `dist/` 只能是產物，不是主要維護來源。
- 不可手動修改 `dist/` 內的 skill。

## `SKILL.md` 規則

- 每個 `SKILL.md` 開頭必須有 frontmatter：

```md
---
name: skill-name
description: "Use when ..."
---
```

- `name` 必須等於 skill 資料夾名稱。
- `name` 不可加類別前綴。
- `description` 必須描述觸發情境。
- `description` 不可寫成流程摘要。
- 內文必須直接、可操作、可驗證。
- 內文必須至少回答：
  - 什麼情境要用
  - 為什麼要用
  - 產出格式是什麼
  - 具體流程是什麼
  - 完成前要檢查什麼
- 範本必須使用 Markdown code fence。
- 不要新增空泛章節。
- 不要為了漂亮犧牲可操作性。

## `INDEX.md` 規則

- 新增、移動、改名、刪除 skill 時，必須同步更新 `INDEX.md`。
- `INDEX.md` 必須列出：
  - 類別名稱
  - 類別用途
  - skill path
  - skill purpose
- `INDEX.md` 不放長篇教學。

## 新增 skill 流程

1. 判斷最準確分類；既有分類不準就新增或調整分類。
2. 在分類底下建立 skill 資料夾。
3. 新增 `SKILL.md`。
4. 確認 frontmatter 正確。
5. 確認 required output 可直接使用。
6. 補上必要 supporting files。
7. 更新 `INDEX.md`。
8. 跑驗證。

## 移動或改名 skill 流程

1. 保留 skill 內容與 supporting files。
2. 移動資料夾到正確分類。
3. 若資料夾改名，同步更新 `SKILL.md` 的 `name`。
4. 更新 `INDEX.md`。
5. 跑驗證。

## 刪除 skill 流程

1. 確認不是只需要移到其他分類。
2. 刪除 skill 資料夾。
3. 從 `INDEX.md` 移除。
4. 跑驗證。

## 驗證規則

- 修改後必須檢查 Markdown 結構。
- 新增、移動、改名 skill 後，必須檢查所有 `*/*/SKILL.md` 的 `name` 是否等於資料夾名稱。
- 必須確認 repo root 沒有直接放 skill 資料夾。
- 必須確認 `INDEX.md` 沒漏掉既有 skills。
