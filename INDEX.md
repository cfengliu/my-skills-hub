# Skills Index

這個 repo 用「類別資料夾」管理 skills。每個 skill 仍然保持自包含：一個資料夾、一份 `SKILL.md`，需要的 agent 設定放在同一個 skill 資料夾裡。

## Categories

### Engineering

給工程、產品建置、系統設計、除錯、驗證、安全與變更管理使用。

| Skill | Purpose |
|---|---|
| `engineering/problem-first` | 先釐清問題、使用者、成功標準與 MVP，避免做錯東西。 |
| `engineering/simplicity-first` | 壓低複雜度，避免過度設計。 |
| `engineering/change-first` | 在改動前先理解變更範圍、風險與遷移策略。 |
| `engineering/boundary-first` | 先切清楚模組、責任與介面邊界。 |
| `engineering/failure-first` | 先思考失敗模式、復原與降級策略。 |
| `engineering/security-first` | 先檢查權限、資料保護、濫用與攻擊面。 |
| `engineering/verification-first` | 把需求轉成測試、型別、CI 與驗證證據。 |
| `engineering/engineering-first-principles` | 用第一性原理審視工程決策與設計取捨。 |

### Agent Workflows

給 AI Agent 任務設計、委派、驗收、回饋迴圈與可重複執行流程使用。

| Skill | Purpose |
|---|---|
| `agent-workflows/task-harness` | 先把任務轉成可執行、可驗證、可交給人或 AI Agent 穩定完成的 harness。 |

## Future Categories

之後可以新增：

- `founder/`：策略、募資、公司節奏、決策框架。
- `marketing/`：定位、訊息、活動、內容、成長實驗。
- `sales/`：客戶開發、銷售流程、異議處理。
- `product/`：需求探索、roadmap、使用者研究、產品規格。
- `operations/`：招聘、流程、財務、營運節奏。

## Naming Rules

- 類別資料夾用單數、領域名或清楚的工作流名稱：`engineering/`, `agent-workflows/`, `founder/`, `marketing/`。
- 分類可以調整；不要因為現有分類而把 skill 硬塞到不準的位置。
- skill 資料夾使用 kebab-case：`problem-first`, `positioning-first`。
- `SKILL.md` frontmatter 的 `name` 必須等於 skill 資料夾名稱，不包含類別前綴。
- 如果未來某個 agent runtime 不支援巢狀 skill discovery，再新增 `dist/` 作為 flat export；現在先不要加。
