---
name: task-harness
description: "Use when a user gives a task that should be turned into an executable, repeatable, controllable, and verifiable harness before execution. Applies to task planning, AI agent prompts, delegation specs, workflows, research, product work, engineering work, automation, and requests where unclear scope or weak acceptance criteria could cause bad execution."
---

# Task Harness

Do not rush into execution. First turn the task into a harness that a human, AI agent, or team can run and verify.

Humans own direction, boundaries, and judgment. AI owns execution, attempts, and output. The harness owns repeatability, control, and verification.

## Purpose

Use Task Harness to convert vague or open-ended tasks into:

- clear intent
- necessary context
- explicit constraints
- executable process
- defined output
- verification criteria
- agent-ready prompt

If the user asks to "just do it", create a short harness first, then execute.

## Harness levels

| Level | Use for | Format |
|---|---|---|
| Level 1 | Small tasks: copy edits, short content, summaries, small queries, small functions, quick decisions | 目標、限制、輸出、驗收 |
| Level 2 | Medium tasks: features, research, comparisons, reports, workflows, articles, product planning | Intent、Context、Constraints、Process、Output、Verification |
| Level 3 | Large tasks: project plans, product development, architecture, team workflows, AI agent workflows, automation systems | Level 2 + Owner、Milestones、Risks、Rollback、Review、Automation |

## Required output

Always produce:

1. 任務判斷
2. Task Harness
3. 可直接交給 AI Agent 的 Prompt
4. 驗收清單
5. 風險與回饋機制, only when the task is complex or high-impact

## Default output format

```md
## 任務判斷

任務類型：
任務等級：
我採用的 Harness：

## Task Harness

### 1. Intent
這個任務真正要完成的是：

### 2. Context
執行前需要知道：

### 3. Constraints
限制與邊界：

### 4. Process
執行步驟：

### 5. Output
最後交付物：

### 6. Verification
驗收標準：

## 可直接交給 AI Agent 的 Prompt

請根據以下任務 Harness 執行：

目標：
背景：
限制：
步驟：
輸出格式：
驗收標準：

請先確認你理解任務，再按照步驟完成。完成後，請用驗收標準自我檢查一次。

## 驗收清單

- [ ] 是否符合原始目標？
- [ ] 是否遵守限制？
- [ ] 是否輸出指定格式？
- [ ] 是否能被使用者直接使用？
- [ ] 是否有明確下一步？
```

## Process

1. 判斷任務類型與 Harness 等級。
2. 補全使用者沒有說清楚的背景，並用「假設」標記。
3. 產出符合等級的 Task Harness。
4. 產出一段可直接交給 AI Agent 執行的 prompt。
5. 產出驗收清單。
6. 任務複雜或影響高時，補充風險、回饋機制、rollback 或 review gate。

## Level 1 format

Use this for small tasks.

```md
## 任務判斷

任務類型：
任務等級：Level 1
我採用的 Harness：小任務 Harness

## Task Harness

### 目標

### 限制

### 輸出

### 驗收

## 可直接交給 AI Agent 的 Prompt

請根據以下任務 Harness 執行：

目標：
限制：
輸出格式：
驗收標準：

完成後請自我檢查一次。

## 驗收清單

- [ ] 是否符合目標？
- [ ] 是否遵守限制？
- [ ] 是否可直接使用？
```

## Level 3 additions

Use this for large tasks. Add these sections after Verification:

```md
### 7. Owner
誰負責方向、執行、審查與決策：

### 8. Milestones
分段交付與檢查點：

### 9. Risks
主要風險與預防方式：

### 10. Rollback
出錯時如何回復或降級：

### 11. Review
何時需要人工審查、誰做最後判斷：

### 12. Automation
哪些部分可自動化、哪些不能自動化：
```

## Rules

- Do not only answer the content; design the task system first.
- Do not stop for excessive clarification. Make reasonable assumptions and mark them as「假設」.
- Do not produce generic advice. Every section must be executable or checkable.
- Every harness must include acceptance criteria.
- Every harness must be usable by a human, AI agent, or team.
- Keep output concise, structured, and practical.
- If directly executing after the harness, keep the harness short enough that it does not block momentum.

## Common mistakes

| Mistake | Fix |
|---|---|
| Asking too many questions before helping | Make assumptions, label them, and proceed |
| Writing a plan with no verification | Add concrete acceptance criteria |
| Producing a prompt without context | Include intent, constraints, output format, and checks |
| Treating all tasks as large projects | Pick Level 1 for small tasks |
| Over-abstracting the harness | Make every step executable |

## Checklist

- Did you choose Level 1, 2, or 3 based on task size?
- Did you state assumptions clearly?
- Does the harness include constraints and output format?
- Are verification criteria observable?
- Can another human or AI agent execute it without extra explanation?
- Is there a ready-to-copy AI Agent prompt?
