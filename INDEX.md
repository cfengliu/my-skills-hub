# Skills Hub Index

這個 repo 用三區管理 Codex 能力：

- `plugins/`：已產品化、可安裝的 Codex plugins。
- `mcps/`：本機 MCP server 原始碼。
- `skills/`：尚未升級成 plugin 的 standalone skills。
- `templates/`：可複製到其他 repo 的治理、流程或專案骨架模板。

同一個 skill 不應同時存在 `plugins/` 與 `skills/`。升級成 plugin 時要搬移，不要複製。

## Plugins

### Engineering

- Path: `plugins/engineering`
- Purpose: 統合工程設計、結構壓測、變更、安全、失敗模式、驗證與簡化思考的 Codex plugin。

| Skill | Purpose |
|---|---|
| `plugins/engineering/skills/engineering-first-principles` | 統合 Engineering skills，依任務風險路由到 problem/boundary/simplicity/change/verification/failure/security first，並內建在設計或實作前壓測關鍵結構判斷的常駐工程判斷 layer。 |
| `plugins/engineering/skills/problem-first` | 先釐清問題、使用者、成功標準與 MVP，避免做錯東西。 |
| `plugins/engineering/skills/simplicity-first` | 壓低複雜度，避免過度設計。 |
| `plugins/engineering/skills/change-first` | 在改動前先理解變更範圍、風險與遷移策略。 |
| `plugins/engineering/skills/boundary-first` | 先切清楚模組、責任與介面邊界。 |
| `plugins/engineering/skills/failure-first` | 先思考失敗模式、復原與降級策略。 |
| `plugins/engineering/skills/security-first` | 先檢查權限、資料保護、濫用與攻擊面。 |
| `plugins/engineering/skills/verification-first` | 把需求轉成測試、型別、CI 與驗證證據。 |

## MCP Servers

### Local Ollama Worker

- Path: `mcps/local-ollama-worker`
- Purpose: 本機 MCP server，提供 `run_local_model_task`，把 bounded repo task 交給 nested `codex exec` + local OSS/Ollama model 執行，並只回 artifact paths。

| Asset | Purpose |
|---|---|
| `mcps/local-ollama-worker/src/server.ts` | MCP stdio server，宣告 `run_local_model_task` 並處理 initialize、tools/list、tools/call。 |
| `mcps/local-ollama-worker/src/worker.ts` | MCP 與 CLI 共用 worker：驗證 allowed roots、建立 run artifacts、用 `spawn()` 呼叫 nested Codex。 |
| `mcps/local-ollama-worker/bin/ollama-worker-mcp` | 本機 npm package 的 MCP server bin，可用 `npm exec --package <local path> -- ollama-worker-mcp` 執行。 |
| `mcps/local-ollama-worker/bin/ollama-worker-cli` | CLI smoke test bin，直接從 stdin 收 `run_local_model_task` JSON。 |
| `mcps/local-ollama-worker/README.md` | 安裝到 `~/.codex/local-mcp/ollama-worker/` 與 Codex config 範例。 |

## Standalone Skills

### Reviews

給文件、設計、架構、程式碼或 diff 做高強度審查，優先拆假設、驗證不變量、找錯誤信心與不必要複雜度。

| Skill | Purpose |
|---|---|
| `skills/reviews/first-principles-review` | 從第一原理審查文件、提案、需求、架構、程式碼或 diff，挑戰假設、冗餘與 false success states。 |

### Agent Workflows

給 AI Agent 任務設計、委派、驗收、回饋迴圈與可重複執行流程使用。

| Skill | Purpose |
|---|---|
| `skills/agent-workflows/task-harness` | 先把任務轉成可執行、可驗證、可交給人或 AI Agent 穩定完成的 harness。 |
| `skills/agent-workflows/mcp-worker-prompt` | 將任務切成 MCP/local/Ollama worker 可安全執行的窄 prompt，限制檔案範圍、副作用與驗證方式，並要求外層 agent 檢查 artifacts。 |

### Frontend

給前端 UI、樣式、設計 token 與主題遷移使用。

| Skill | Purpose |
|---|---|
| `skills/frontend/css-theme-migration` | 將 dark-mode-only CSS 或 UI code 遷移成可維護的 light/dark semantic theme token system，保留 visual hierarchy、brand accent 與 contrast。 |

## Templates

### Repo Governance

- Path: `templates/repo-governance`
- Purpose: 可複製到任意 repo 的 AI 協作治理骨架，定義 repo source of truth、runtime boundary、human gates、verification、release gate 與 recovery contract。

| Asset | Purpose |
|---|---|
| `templates/repo-governance/AGENTS.md` | repo 協作憲章模板，定義指令優先序、runtime boundary、model / subagent policy、source of truth、human gates、verification、release 與 recovery contract。 |
| `templates/repo-governance/docs/README.md` | `docs/` 入口與按需讀取 canonical truth 的導覽模板。 |
| `templates/repo-governance/docs/process.md` | promotion pipeline、delivery closure、planning threshold、planned task execution routing、runtime artifact sync 與 completion claim taxonomy 模板。 |
| `templates/repo-governance/docs/ops.md` | model policy、dev server、verification、backup/restore、deploy/release 與 destructive change 操作常數模板。 |
| `templates/repo-governance/.agents/skills/runtime-adapter` | generic repo-local control skill：選擇最小必要 expert skills 並注入 canonical repo truth。 |
| `templates/repo-governance/.agents/skills/subagent-routing` | 泛用 repo-local control skill：在明確 plan / task list 出現後，將任務分類為 main-runtime-only、delegable、inline 或 blocked，且不執行任務。 |
| `templates/repo-governance/.agents/skills/release-gate` | generic repo-local control skill：對 release-sensitive actions 與 destructive environment actions 做 go / hold / require-human 判定。 |
| `templates/repo-governance/.agents/skills/verifier` | generic repo-local control skill：獨立驗證 correctness、regressions、repo-truth alignment 與 doc sync。 |

### Repo Governance v2

- Path: `templates/repo-governance-v2`
- Purpose: 可複製、可升級的 full AI 協作治理套件；以 `MANIFEST.md` 作為 upgrade contract 唯一 owner，並將 template-owned managed governance、repo-owned local truth、control skills 與 initialization examples 分離，避免升級覆蓋 local repo 特色或產生規則 drift。

| Asset | Purpose |
|---|---|
| `templates/repo-governance-v2/AGENTS.md` | 薄入口與硬邊界模板，定義 non-overridable gates、truth priority、managed/local ownership、local truth model、runtime artifacts 與 minimum completion requirements，細節指向 managed docs。 |
| `templates/repo-governance-v2/docs/governance/VERSION` | governance template 版本號。 |
| `templates/repo-governance-v2/docs/governance/MANIFEST.md` | template upgrade contract owner：version、upgrade allowlist / denylist、initialization-only paths、required files、header rules 與 compatibility checklist。 |
| `templates/repo-governance-v2/docs/governance/README.md` | governance 入口與 lookup guide，說明 initialization、upgrade、compatibility 與 local truth roles。 |
| `templates/repo-governance-v2/docs/governance/managed/process.md` | task classes、canonical chains、minimum doc loading、planning threshold、runtime artifact handling、canonical lookup 與 recovery rules。 |
| `templates/repo-governance-v2/docs/governance/managed/verification.md` | verification requirement、completion taxonomy、completion reports、independent verification standard、false-success checks、skipped-check wording 與 commit rules。 |
| `templates/repo-governance-v2/docs/governance/managed/release.md` | release-sensitive detector、release-gate requirement、human checkpoints、secrets、production data 與 destructive environment action rules。 |
| `templates/repo-governance-v2/docs/governance/managed/subagents.md` | subagent 邊界、不可委派任務、required output、main runtime authority 與 parallelism rules。 |
| `templates/repo-governance-v2/docs/governance/managed/doc-sync.md` | PRD、TDD、roadmap、epics、ops sync 與 stale doc marking 規則。 |
| `templates/repo-governance-v2/docs/governance/local/ops.example.md` | repo-owned ops 初始化範例，記錄 commands、environment、release、model policy 與 operator notes path；placeholder 不等於 accepted truth。 |
| `templates/repo-governance-v2/docs/governance/local/prd.example.md` | repo-owned PRD 初始化範例，記錄 accepted product behavior、UI / UX、user flows 與 acceptance criteria；empty section 視為 unknown。 |
| `templates/repo-governance-v2/docs/governance/local/tdd.example.md` | repo-owned TDD 初始化範例，記錄 accepted technical design、architecture boundaries、API/data contracts 與 verification strategy；empty section 視為 unknown。 |
| `templates/repo-governance-v2/docs/governance/local/roadmap.example.md` | repo-owned roadmap 初始化範例，記錄 Now / Next / Later / Done / Parked sequencing，不承載 requirement 明細；empty section 視為 unknown。 |
| `templates/repo-governance-v2/docs/governance/local/security.example.md` | repo-owned security/privacy 初始化範例，記錄 PII、auth/authz、audit、retention、secrets、abuse controls 與 incident baseline；empty section 視為 unknown。 |
| `templates/repo-governance-v2/docs/governance/local/epics/README.example.md` | repo-owned epic ledger 初始化範例，定義 `E-001A` delivery slices、`E-001-001` requirements、Requirement List ownership 與 PRD/TDD/Security promotion；empty section 視為 unknown。 |
| `templates/repo-governance-v2/.agents/skills/runtime-adapter` | repo-local context injector，回傳 governance refs、hard gates、local truth boundaries 與 local context entrypoints，不接管 workflow routing。 |
| `templates/repo-governance-v2/.agents/skills/subagent-routing` | subagent routing classifier：將 explicit plan/tasks 分成 inline、delegable、main-runtime-only 或 blocked，不執行任務。 |
| `templates/repo-governance-v2/.agents/skills/verifier` | meaningful change / completion claim 的獨立驗證 control skill，保留 output schema 並依 managed verification/doc-sync/release policy 判斷。 |
| `templates/repo-governance-v2/.agents/skills/release-gate` | release-sensitive / destructive environment action 的 go / hold / require-human 判定 control skill，依 managed release policy 與 local ops 執行。 |
| `templates/repo-governance-v2/.agents/skills/drift-repair` | roadmap、epic、PRD、TDD、ops local truth 發生 stale status、錯誤引用或證據不一致時，修復可由 repo evidence 支撐的治理文件 drift。 |
| `templates/repo-governance-v2/.agents/skills/decision-advisor` | promotion 前的決策 gate：分類 assumptions、標 capability tags、路由可用 specialist skills、回報 missing specialist capability，並輸出 approval report，避免 unresolved assumptions 變成 accepted truth。 |
| `templates/repo-governance-v2/tools/war-room` | 本機 read-only 戰情室 dashboard，解析 roadmap 與 epics，顯示 Now / Next / Later / Done / Parked、epic progress、completed work 與 roadmap-epic drift warnings。 |
| `templates/repo-governance-v2/.agents/skills/local/README.md` | repo-owned local agent skills extension 區，template upgrade 不可覆蓋。 |

## Upgrade Rules

- plugin 是可安裝單位：`plugins/<plugin-name>`。
- MCP server 是本機工具原始碼：`mcps/<mcp-name>`。
- standalone skill 是 incubator：`skills/<category>/<skill-name>`。
- template 是可複製資產：`templates/<template-name>`。
- skill 升級成 plugin 時，用搬移：`skills/<category>/<skill-name>` → `plugins/<plugin-name>/skills/<skill-name>`。
- 不建立 `dist/`，除非明確遇到 agent runtime 不支援巢狀 discovery。
