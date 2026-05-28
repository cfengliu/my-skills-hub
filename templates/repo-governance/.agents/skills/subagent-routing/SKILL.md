---
name: subagent-routing
description: 明確 plan 或 task list 出現後、執行前需要分類任務時使用；尤其是判斷任務要 inline 執行、delegated 給 subagent、保留給 main runtime，或先標成 blocked。
---

# Subagent Routing（子代理路由）

## 用途

在 explicit plan tasks 執行前先做分類。這個 skill 只負責 routing classification：不執行任務、不改檔案、不啟動 subagents、不驗證完成狀態、不批准 release，也不做 final judgment。

核心規則：subagent routing judgment 是必要的；實際 delegation 是選擇性的；小任務可用輕量 gate 後 inline 執行。

## 輸入

- 使用者要求
- explicit plan 或 task list
- 已知 touched files 或 scopes
- 來自 `AGENTS.md`、`docs/process.md`、`docs/ops.md` 的相關 repo truth

## 輸出

回傳這個結構：

```yaml
subagent_routing_decision:
  subagents: yes | no
  main_runtime_only:
    - task: "任務名稱或 none"
      reason: "為什麼必須由 main runtime 擁有"
  delegable_tasks:
    - task: "任務名稱或 none"
      recommended_subagent: "docs/ops.md 中的 model 或 role；不適用時填 not-applicable"
      read_scope: ["path 或 scope"]
      write_scope: ["path 或 scope"]
      forbidden_scope: ["path 或 scope"]
      verification_required: "具體 check 或 review"
      escalation_trigger: "subagent 必須停止並回報 blocked 的條件"
  inline_tasks:
    - task: "任務名稱或 none"
      reason: "夠小、較便宜，或 inline 做更安全"
  blocked_or_unclear:
    - task: "任務名稱或 none"
      reason: "缺 requirement、不安全 scope 或衝突"
```

小型或只適合 inline 的 plans，可用這個格式：

```text
Subagent Routing Decision（子代理路由決策）
Subagents: no; execute inline.（無子代理；inline 執行。）
Main-runtime only: none（無）
Delegable tasks: none（無）
Inline tasks（inline 任務）：
- task: <task>
  reason: task is small enough to execute inline; delegation overhead is not worth it（任務夠小，delegation overhead 不值得）
Blocked / unclear: none（無）
```

## 可 delegated 的工作

task 只有在全部條件都成立時，才可以 delegated：

- scope 有界且低風險
- goal 與 acceptance 清楚
- read scope、write scope、forbidden scope 明確
- 可獨立 review，且可獨立 verify
- 不跨太多範圍
- 不是 security-critical
- failure 容易偵測且修復成本低

## 不可 delegated 的工作

永遠不要 delegated：

- 釐清使用者意圖
- planning ownership
- requirement interpretation
- architecture decisions
- security decisions
- auth、permission、payments 或 billing boundaries
- migration、deployment、release、rollback 或 production config
- secrets handling
- destructive actions
- commit decisions
- final diff review
- final completion judgment
- verifier ownership
- release-gate ownership
- broad cross-module refactors
- 使用者意圖不清楚的 tasks

## Routing 規則

- task 很小、單一 scope，或直接做更便宜時，優先 inline execution。
- task 需要 judgment、integration context、risk classification 或 final authority 時，優先 main-runtime-only。
- 只有 bounded execution work、scope 明確、且 verification 成本低時，才優先 delegation。
- 任何 scope 不清楚時，標成 `blocked_or_unclear`，不要 delegated。
- 若任何 task 被分類為 `blocked_or_unclear`，該 task 在 blocker 解掉前不可執行。獨立且安全的 tasks 只有在不依賴 blocked task 時才可繼續。
- 不要為了使用 subagent 強行切分任務。

## 權威邊界

Subagent output 是 evidence，不是 authority。Main runtime 擁有 integration、diff review、verification、doc sync judgment 與 final response。
