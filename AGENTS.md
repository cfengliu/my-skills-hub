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
