# AGENTS.md

## 回應語言

- 用台灣中文回答。

## 專案目的

- 這個 repo 是一組可安裝、可維護的 Codex/Agent skills。
- skills 依領域分類管理，例如 `engineering/`、未來可新增 `founder/`、`marketing/`、`product/`。
- 每個 skill 仍然是自包含資料夾，主要內容放在該 skill 資料夾的 `SKILL.md`。
- 目前只有 `engineering/` 類別。
- 根目錄的 `INDEX.md` 是 catalog，負責列出分類、skill 清單與命名規則。

## 目錄結構

```txt
my-skills-hub/
  AGENTS.md
  INDEX.md
  engineering/
    problem-first/
      SKILL.md
      agents/openai.yaml
```

- 不要把所有 skills 攤平在 repo root。
- 不要現在新增 `dist/`；只有在某個 agent runtime 不支援巢狀 skill discovery 時，才加入 flat export。

## 倉庫管理機制

### Source of truth

- 類別資料夾是主要維護來源，例如 `engineering/`。
- `INDEX.md` 是公開 catalog，負責讓人快速知道有哪些類別、有哪些 skills、各自用途。
- `AGENTS.md` 是 agent 操作規則，負責定義這個 repo 的結構、命名、驗證與修改方式。
- 不要用 `INDEX.md` 取代實際分類資料夾；index 只是導覽，不是結構本身。

### 分類策略

- skills 必須放進領域分類底下，不放 repo root。
- 目前只啟用 `engineering/`。
- 未來新增非工程類 skills 時，再新增對應類別，例如：
  - `founder/`
  - `marketing/`
  - `sales/`
  - `product/`
  - `operations/`
- 不要太早建立空分類；有第一個確定要放的 skill 時再建。
- 類別名稱要代表使用場景或角色，不要代表抽象形容詞。

### Skill lifecycle

新增 skill 時照這個順序：

1. 判斷它屬於哪個類別。
2. 在該類別底下建立 skill 資料夾。
3. 新增 `SKILL.md`。
4. 確認 frontmatter 的 `name` 等於 skill 資料夾名稱。
5. 確認 `description` 是觸發條件，不是流程摘要。
6. 補上必要的 supporting files，例如 `agents/openai.yaml`。
7. 更新 `INDEX.md`。
8. 跑驗證，確認結構與名稱一致。

移動或改名 skill 時照這個順序：

1. 保留 skill 內容與 supporting files。
2. 移動資料夾到正確類別。
3. 如果資料夾改名，同步更新 `SKILL.md` frontmatter 的 `name`。
4. 更新 `INDEX.md`。
5. 跑驗證。

刪除 skill 時照這個順序：

1. 確認不是只是應該移到其他類別。
2. 刪除 skill 資料夾。
3. 從 `INDEX.md` 移除。
4. 跑驗證，確認沒有壞掉的目錄或 index 條目。

### `dist/` policy

- 預設不要建立 `dist/`。
- 只有在明確遇到 agent runtime 不支援巢狀 discovery 時，才建立 `dist/`。
- 如果之後需要 `dist/`，它只能是產物，不是主要維護來源。
- 不要手動在 `dist/` 改 skill；要從分類資料夾修改後再同步輸出。

### Index policy

- 每個新增、移動、改名、刪除 skill，都要同步更新 `INDEX.md`。
- `INDEX.md` 至少要列出：
  - 類別名稱
  - 類別用途
  - skill path
  - skill purpose
- `INDEX.md` 不放長篇教學；詳細流程留在各自 `SKILL.md`。

## 寫作原則

- 文字要直接、實用、像資深工程師寫給 agent 的操作手冊。
- 避免抽象口號；每個 skill 都要回答：
  - 什麼情境要用？
  - 為什麼要用？
  - 產出格式是什麼？
  - 具體流程是什麼？
  - 完成前要檢查什麼？
- 若有範本，使用 Markdown code fence，讓 agent 可以直接複製。
- code comment 一律用英文；其餘內容用台灣中文。

## Skill 檔案規範

- 每個 `SKILL.md` 開頭必須有 frontmatter：

```md
---
name: skill-name
description: "Use when ..."
---
```

- `name` 要和資料夾名稱一致。
- `name` 不要加類別前綴；例如 `engineering/problem-first/SKILL.md` 的 `name` 是 `problem-first`。
- `description` 要清楚寫出觸發情境，讓 agent 知道什麼時候該用。
- 內文建議結構：
  - 標題
  - 核心原則
  - Purpose
  - Required output
  - Process
  - Examples（必要時）
  - Checklist

## 修改原則

- 不要為了漂亮而改掉可操作性。
- 不要新增空泛章節；每個段落都要能改善 agent 行為。
- 修改 skill 時，優先維持既有風格和結構。
- 如果新增 skill，要同時確認：
  - 放在正確類別底下
  - 資料夾名稱正確
  - `SKILL.md` 存在
  - frontmatter 正確
  - 觸發描述夠具體
  - required output 可直接使用
  - `INDEX.md` 已更新

## 驗證方式

- 修改後至少檢查 Markdown 結構是否正常。
- 新增或改名 skill 時，檢查所有 `*/*/SKILL.md` 的 `name` 是否和 skill 資料夾一致。
- 確認 repo root 不直接放 skill 資料夾。
- 確認 `INDEX.md` 沒漏掉已存在的 skills。
