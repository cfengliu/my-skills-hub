# Repo Governance v2 Import Handoff Guide

這份 handoff guide 是給 AI agent 用的：把本 repo 的 `templates/repo-governance-v2` 安全 import 到另一個 target repo。

目標不是「把資料夾整包蓋過去」。目標是讓 target repo 取得可升級的 governance v2，同時保留 target repo 自己的 local truth、existing skills、secrets、operator notes 與舊文件。

## 0. Handoff 給 AI 的最短指令

可以把這段直接交給下一個 AI：

```md
你要把 `templates/repo-governance-v2` import 到 target repo。

Source template path: `<PATH_TO_MY_SKILLS_HUB>/templates/repo-governance-v2`
Target repo path: `<PATH_TO_TARGET_REPO>`

請照 `docs/repo-governance-v2-import-handoff.md` 執行。

硬規則：
- 不要覆蓋 target repo 的 `docs/governance/local/*`。
- 不要覆蓋 target repo 的 `.agents/skills/local/*`。
- 不要覆蓋 target repo 的 repo-specific expert skills。
- 不要寫入 secrets。
- 如果 target repo 已有 `AGENTS.md` 或舊 governance docs，先分類與遷移，不要無腦刪。
- commit 必須等 user 明確批准。

完成時回報 touched files、初始化或升級判定、保留了哪些 local files、跑了哪些檢查、哪些事項需要 human review。
```

## 1. 適用情境

用這份 guide 處理三種情況：

1. target repo 第一次導入 governance v2。
2. target repo 已有 governance v2，要升級 managed governance。
3. target repo 有舊版治理檔案，例如 `AGENTS.md`、`docs/process.md`、`docs/ops.md`、`docs/prd.md`、`docs/tdd.md` 或 `docs/requirements/*`，要遷移到 v2。

如果只是閱讀 target repo 的治理規則，不要跑 import。先讀 target repo 自己的 `AGENTS.md`。

## 2. Source 與 target

Source template 固定是本 repo 的：

```text
templates/repo-governance-v2/
```

Target repo 是要導入治理的 repo root。

AI 開始前要先確認：

```text
source_template = <my-skills-hub>/templates/repo-governance-v2
target_repo = <target repo root>
```

不要用當前工作目錄猜 target repo，除非 user 已明確在 target repo 內下指令。

## 3. 不可違反的規則

### 永遠不能自動覆蓋

這些 target paths 是 repo-owned：

```text
docs/governance/local/*
.agents/skills/local/*
.agents/skills/* except runtime-adapter, subagent-routing, verifier, release-gate
source code
tests
secrets
local operator notes
```

如果 target repo 已有這些檔案，只能讀、保留、或請 human 決定遷移方式。

### 可以由 template 管理與替換

只有這些 target paths 可由 template import 或 upgrade 管理：

```text
AGENTS.md
docs/governance/VERSION
docs/governance/MANIFEST.md
docs/governance/README.md
docs/governance/managed/*
.agents/skills/runtime-adapter/*
.agents/skills/subagent-routing/*
.agents/skills/verifier/*
.agents/skills/release-gate/*
```

如果 path 不在 allowlist，預設不要覆蓋。

### Commit gate

不要自動 commit。完成 import / upgrade 後先回報 diff 與檢查結果，等 user 明確說要 commit。

## 4. Preflight checklist

在改檔前，先做這些事：

1. 確認 source template 存在。
2. 確認 target repo 存在且是正確 repo。
3. 讀 source：
   - `templates/repo-governance-v2/docs/governance/VERSION`
   - `templates/repo-governance-v2/docs/governance/MANIFEST.md`
   - `templates/repo-governance-v2/docs/governance/README.md`
4. 檢查 target 是否已有：
   - `AGENTS.md`
   - `docs/governance/MANIFEST.md`
   - `docs/governance/local/*`
   - `.agents/skills/*`
   - 舊文件：`docs/process.md`、`docs/ops.md`、`docs/prd.md`、`docs/tdd.md`、`docs/requirements/*`
5. 判斷這次是 initialization、upgrade，還是 migration。

判斷規則：

| Target 狀態 | 動作 |
|---|---|
| 沒有 `docs/governance/MANIFEST.md` | initialization |
| 有 `docs/governance/MANIFEST.md` 且 VERSION 較舊 | upgrade |
| 有舊版 `docs/process.md` / `docs/ops.md` 等 | migration-aware initialization 或 migration-aware upgrade |

## 5. Initialization 流程

第一次導入 governance v2 時照這個順序。

### 5.1 複製 managed files

從 source template 複製到 target：

```text
AGENTS.md
docs/governance/VERSION
docs/governance/MANIFEST.md
docs/governance/README.md
docs/governance/managed/
.agents/skills/runtime-adapter/
.agents/skills/subagent-routing/
.agents/skills/verifier/
.agents/skills/release-gate/
```

如果 target 已有 `AGENTS.md`：

1. 先讀舊 `AGENTS.md`。
2. 把 repo-specific truth 分類到 local files：
   - commands / env / deploy / model policy → `docs/governance/local/ops.md`
   - product / UX / acceptance → `docs/governance/local/prd.md`
   - architecture / API / data / verification strategy → `docs/governance/local/tdd.md`
   - priority / sequencing → `docs/governance/local/roadmap.md`
3. 不確定怎麼分類時，停止並問 human。
4. 不要把舊 `AGENTS.md` 的 repo-specific rules 直接塞進新的 managed `AGENTS.md`。

### 5.2 初始化 local truth

只在 target 缺少對應 local file 時，才從 example 建立：

```text
docs/governance/local/ops.example.md           -> docs/governance/local/ops.md
docs/governance/local/prd.example.md           -> docs/governance/local/prd.md
docs/governance/local/tdd.example.md           -> docs/governance/local/tdd.md
docs/governance/local/roadmap.example.md       -> docs/governance/local/roadmap.md
docs/governance/local/epics/README.example.md  -> docs/governance/local/epics/README.md
```

建立後保留 repo-owned header：

```text
Repo-owned file after initialization.
Do not overwrite during template upgrades.
```

不要要求 target repo 必須保留 `.example.md` 檔案。examples 是 source template package 的初始化材料，不是 initialized repo 必備內容。

### 5.3 初始化 local skills 區

如果 target 沒有 `.agents/skills/local/README.md`，從 source 複製：

```text
.agents/skills/local/README.md
```

如果 target 已有 `.agents/skills/local/*`，保留，不要覆蓋。

## 6. Upgrade 流程

target repo 已有 governance v2 時，照 `docs/governance/MANIFEST.md` 的 upgrade contract。

### 6.1 建立 candidate replace set

只放 allowlist：

```text
AGENTS.md
docs/governance/VERSION
docs/governance/MANIFEST.md
docs/governance/README.md
docs/governance/managed/*
.agents/skills/runtime-adapter/*
.agents/skills/subagent-routing/*
.agents/skills/verifier/*
.agents/skills/release-gate/*
```

### 6.2 移除 denylist

從 candidate replace set 移除：

```text
docs/governance/local/*
.agents/skills/local/*
.agents/skills/* except managed control skills
docs/prd.md
docs/tdd.md
docs/requirements/*
source code
tests
secrets
local operator notes
```

### 6.3 替換 managed files

只替換 candidate replace set 剩下的 files。

不要把 source 的 `.example.md` 覆蓋到 initialized target repo。target 已有 local `.md` 時，examples 不參與 upgrade。

## 7. Legacy migration 指引

如果 target repo 有舊治理檔案，不要刪除。先分類。

| Legacy source | 建議遷移目的地 |
|---|---|
| `docs/ops.md` | `docs/governance/local/ops.md` |
| `docs/prd.md` | `docs/governance/local/prd.md` |
| `docs/tdd.md` | `docs/governance/local/tdd.md` |
| `docs/requirements/*` | `docs/governance/local/epics/*` 或 PRD/TDD 已接受條目 |
| `docs/process.md` | 通常不直接遷移；先比對 managed process，repo-specific exceptions 才進 local |
| 舊 `AGENTS.md` | 只遷移 repo-specific truth；不要複製舊 workflow engine |

遷移原則：

- accepted product truth 進 `prd.md`。
- accepted technical truth 進 `tdd.md`。
- operational constants 進 `ops.md`。
- priority 進 `roadmap.md`。
- 大型 workstream 的 child requirements / evidence 進 `epics/`。
- 不確定是否 accepted 的內容，標成 open question，不要假裝是 truth。

除非 human 明確批准，legacy files 只保留，不做刪除或 archive。

## 8. 建議操作命令

以下命令只是範例。AI 必須先替換 source / target path，並確認不會覆蓋 repo-owned files。

```sh
SOURCE="<PATH_TO_MY_SKILLS_HUB>/templates/repo-governance-v2"
TARGET="<PATH_TO_TARGET_REPO>"

mkdir -p "$TARGET/docs/governance/managed"
mkdir -p "$TARGET/docs/governance/local/epics"
mkdir -p "$TARGET/.agents/skills"

cp "$SOURCE/AGENTS.md" "$TARGET/AGENTS.md"
cp "$SOURCE/docs/governance/VERSION" "$TARGET/docs/governance/VERSION"
cp "$SOURCE/docs/governance/MANIFEST.md" "$TARGET/docs/governance/MANIFEST.md"
cp "$SOURCE/docs/governance/README.md" "$TARGET/docs/governance/README.md"
cp -R "$SOURCE/docs/governance/managed/." "$TARGET/docs/governance/managed/"

cp -R "$SOURCE/.agents/skills/runtime-adapter" "$TARGET/.agents/skills/runtime-adapter"
cp -R "$SOURCE/.agents/skills/subagent-routing" "$TARGET/.agents/skills/subagent-routing"
cp -R "$SOURCE/.agents/skills/verifier" "$TARGET/.agents/skills/verifier"
cp -R "$SOURCE/.agents/skills/release-gate" "$TARGET/.agents/skills/release-gate"
```

初始化 local files 時，使用「不存在才複製」邏輯：

```sh
test -f "$TARGET/docs/governance/local/ops.md" || cp "$SOURCE/docs/governance/local/ops.example.md" "$TARGET/docs/governance/local/ops.md"
test -f "$TARGET/docs/governance/local/prd.md" || cp "$SOURCE/docs/governance/local/prd.example.md" "$TARGET/docs/governance/local/prd.md"
test -f "$TARGET/docs/governance/local/tdd.md" || cp "$SOURCE/docs/governance/local/tdd.example.md" "$TARGET/docs/governance/local/tdd.md"
test -f "$TARGET/docs/governance/local/roadmap.md" || cp "$SOURCE/docs/governance/local/roadmap.example.md" "$TARGET/docs/governance/local/roadmap.md"
test -f "$TARGET/docs/governance/local/epics/README.md" || cp "$SOURCE/docs/governance/local/epics/README.example.md" "$TARGET/docs/governance/local/epics/README.md"

mkdir -p "$TARGET/.agents/skills/local"
test -f "$TARGET/.agents/skills/local/README.md" || cp "$SOURCE/.agents/skills/local/README.md" "$TARGET/.agents/skills/local/README.md"
```

如果 target repo 已經有 `.agents/skills/<custom-skill>/SKILL.md`，不要動它。

## 9. Import 後驗證

完成後至少檢查：

```text
AGENTS.md exists
docs/governance/VERSION exists
docs/governance/MANIFEST.md exists
docs/governance/README.md exists
docs/governance/managed/process.md exists
docs/governance/managed/verification.md exists
docs/governance/managed/release.md exists
docs/governance/managed/subagents.md exists
docs/governance/managed/doc-sync.md exists
.agents/skills/runtime-adapter/SKILL.md exists
.agents/skills/subagent-routing/SKILL.md exists
.agents/skills/verifier/SKILL.md exists
.agents/skills/release-gate/SKILL.md exists
docs/governance/local/ops.md exists
docs/governance/local/prd.md exists
docs/governance/local/tdd.md exists
docs/governance/local/roadmap.md exists
docs/governance/local/epics/README.md exists
```

再檢查 header：

- managed files 有 `Managed by repo-governance template`。
- local files 有 `Repo-owned file after initialization`。
- `.agents/skills/local/README.md` 有 repo-owned extension warning。

再檢查保護：

- `docs/governance/local/*` 沒被 upgrade 覆蓋。
- `.agents/skills/local/*` 沒被 upgrade 覆蓋。
- repo-specific expert skills 沒被刪或改。
- secrets 沒被寫入 tracked files。
- legacy docs 沒被未經同意刪除。

## 10. 完成回報格式

AI 完成 import / upgrade 後，用這個格式回報：

````md
## Governance import report

- Target repo: `<path>`
- Mode: `initialization | upgrade | migration-aware initialization | migration-aware upgrade`
- Source version: `<version>`
- Target previous version: `<version or none>`

### Touched files
- `<path>`

### Preserved files
- `<path>`

### Legacy files found
- `<path>`: `<kept | migrated | needs human review>`

### Validation
- Managed files: `<pass | fail>`
- Local truth files: `<pass | fail>`
- Control skills: `<pass | fail>`
- Header checks: `<pass | fail>`
- Denylist protection: `<pass | fail>`

### Commands run
```text
<command and result>
```

### Skipped checks
- `<check>`: `<reason>`

### Human review needed
- `<item or none>`

### Commit status
- `not requested | waiting for user approval | committed with hash <hash>`
````

## 11. 常見錯誤

- 把 `templates/repo-governance-v2` 整包 `cp -R` 到 target root，結果覆蓋 local truth。
- 用 source `.example.md` 覆蓋 target 已初始化的 `local/*.md`。
- 把舊 `AGENTS.md` 的所有內容塞回 managed `AGENTS.md`。
- 把 repo-specific expert skills 當成 template-managed control skills 覆蓋。
- 沒讀 `MANIFEST.md` 就做 upgrade。
- 把 legacy docs 刪掉但沒有 human approval。
- 完成後直接 commit。

## 12. 成功定義

成功 import 代表：

- target repo 有 governance v2 managed files。
- target repo 有 initialized local truth files。
- target repo 的 local truth 與 local skills 沒被覆蓋。
- target repo 的 repo-specific expert skills 沒被覆蓋。
- upgrade / initialization 規則可由 `docs/governance/MANIFEST.md` 驗證。
- AI 可以從 target repo 的 `AGENTS.md` 進入，依 domain-based source lookup 找到正確 truth。
