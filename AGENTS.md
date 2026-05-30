# AGENTS.md

## 語言

- 一律用台灣中文回答。
- code comment 一律用英文。

## 輸出時

- 制定或修改規則、模板時，AI 必須逐句檢查「這句有沒有必要」；沒有必要就刪掉，只輸出能推進決策、修改或驗證的內容。

## Repo 目標

- 這個 repo 只放可安裝、可維護的 Codex plugins、尚未產品化的 standalone skills，以及可複製到其他 repo 的 templates。
- `plugins/` 放已產品化、可安裝的 plugin。
- `skills/` 放還沒升級成 plugin 的 standalone skill。
- `templates/` 放可複製到其他 repo 的治理、流程或專案骨架模板。
- 同一個 skill 不可同時存在 `plugins/` 與 `skills/`，避免內容 drift。
- `INDEX.md` 只做 catalog；不可取代實際 plugin、skill 或 template 資料夾。

## Plugin 規則

- 一個 plugin 必須是一個自包含資料夾：`plugins/<plugin-name>/`。
- plugin 資料夾名稱使用 kebab-case。
- 每個 plugin 必須包含 `.codex-plugin/plugin.json`。
- plugin 內的 skills 放在 `plugins/<plugin-name>/skills/<skill-name>/`。
- plugin 內每個 skill 仍然必須自包含，主要內容放在該 skill 資料夾的 `SKILL.md`。
- `plugin.json` 的 `name` 必須等於 plugin 資料夾名稱。
- `plugin.json` 必須包含可驗證的 `version`、`description`、`author.name`、`skills` 與必要 `interface` 欄位。
- 不要在 plugin 內建立空的 supporting folders；有實際內容時才建立。

## Standalone Skill 規則

- standalone skill 必須放在 `skills/<category>/<skill-name>/`。
- category 用領域、角色或使用場景命名。
- category 名稱使用 kebab-case。
- skill 資料夾名稱使用 kebab-case。
- 不要建立空 category；有第一個 skill 時才建立 category。
- standalone skill 升級成 plugin skill 時，必須搬移，不可複製。

## Template 規則

- template 必須放在 `templates/<template-name>/`。
- template 資料夾名稱使用 kebab-case。
- template 是可複製資產，不是 Codex plugin，也不是 standalone skill。
- template 可包含 `AGENTS.md`、`docs/`、`.agents/skills/` 或其他實際會被複製到目標 repo 的檔案。
- 不要在 template 內建立空的 supporting folders；有實際內容時才建立。
- template 內容若包含 `SKILL.md`，仍必須符合本文件的 `SKILL.md` 規則。
- template 內容應泛化成可移植形式；專案專屬常數、路徑、服務名稱或 domain skill 應使用 placeholder 或範例說明。

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
- `name` 不可加 plugin 或 category 前綴。
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

- 新增、移動、改名、刪除 plugin、skill 或 template 時，必須同步更新 `INDEX.md`。
- `INDEX.md` 必須列出：
  - plugin 名稱、用途、path、內含 skills
  - standalone skill category、用途、path、skill purpose
  - template 名稱、用途、path、內含 assets
- `INDEX.md` 不放長篇教學。

## 新增 plugin 流程

1. 判斷 plugin 是否真的是可安裝單位；不要把 hub 名稱拿來當 plugin 名稱。
2. 建立 `plugins/<plugin-name>/`。
3. 新增 `.codex-plugin/plugin.json`。
4. 在 `plugins/<plugin-name>/skills/` 底下新增或搬入 skills。
5. 確認每個 `SKILL.md` frontmatter 正確。
6. 確認 required output 可直接使用。
7. 補上必要 supporting files。
8. 更新 `INDEX.md`。
9. 跑驗證。

## 新增 standalone skill 流程

1. 判斷最準確 category；既有 category 不準就新增或調整 category。
2. 在 `skills/<category>/<skill-name>/` 建立 skill 資料夾。
3. 新增 `SKILL.md`。
4. 確認 frontmatter 正確。
5. 確認 required output 可直接使用。
6. 補上必要 supporting files。
7. 更新 `INDEX.md`。
8. 跑驗證。

## 新增 template 流程

1. 判斷 template 是否真的是可複製資產；不要把 runtime-only workflow 放進 template。
2. 建立 `templates/<template-name>/`。
3. 放入實際會被複製到目標 repo 的檔案。
4. 將專案專屬內容泛化成 placeholder 或範例。
5. 若包含 `SKILL.md`，確認 frontmatter 正確。
6. 確認 template 沒有空資料夾。
7. 更新 `INDEX.md`。
8. 跑驗證。

## standalone skill 升級成 plugin skill 流程

1. 確認目標 plugin 是正確安裝單位；若沒有正確 plugin，先新增 plugin。
2. 將 `skills/<category>/<skill-name>/` 搬移到 `plugins/<plugin-name>/skills/<skill-name>/`。
3. 保留 skill 內容與 supporting files。
4. 確認 `SKILL.md` 的 `name` 仍等於 skill 資料夾名稱。
5. 更新 plugin 的 `.codex-plugin/plugin.json`（如需要）。
6. 更新 `INDEX.md`。
7. 跑驗證。

## 移動或改名流程

1. 保留 plugin、skill 內容與 supporting files。
2. 移動資料夾到正確位置。
3. 若 plugin 資料夾改名，同步更新 `plugin.json` 的 `name`。
4. 若 skill 資料夾改名，同步更新 `SKILL.md` 的 `name`。
5. 更新 `INDEX.md`。
6. 跑驗證。

## 刪除流程

1. 確認不是只需要移到其他 plugin 或 standalone category。
2. 刪除 plugin 或 skill 資料夾。
3. 從 `INDEX.md` 移除。
4. 跑驗證。

## 驗證規則

- 修改後必須檢查 Markdown 結構。
- 新增、移動、改名 skill 後，必須檢查所有 `plugins/*/skills/*/SKILL.md`、`skills/*/*/SKILL.md` 與 `templates/*/**/SKILL.md` 的 `name` 是否等於資料夾名稱。
- 必須確認 repo root 沒有直接放 skill 資料夾。
- 必須確認 `INDEX.md` 沒漏掉既有 plugins、standalone skills 或 templates。
- 必須確認每個 `plugins/*/.codex-plugin/plugin.json` 存在且可被 plugin validator 驗證。
