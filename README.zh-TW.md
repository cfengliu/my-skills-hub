# My Skills Hub

可獨立安裝的 Codex skills，用於任務交接、Session 知識萃取、文件維護與審查。

[English](README.md) · [Skill 目錄](INDEX.md)

## Skills

| Skill | 使用時機 | 產出 |
|---|---|---|
| [task-harness](skills/task-harness/) | 準備將任務交給其他人或 Agent，或讓任務重複執行、自動化。 | 可直接複製的任務契約，包含背景、範圍、交付物與可觀察的驗收條件。 |
| [distill-session-knowledge](skills/distill-session-knowledge/) | 從 Coding Session、對話紀錄或 Agent 執行紀錄，萃取有價值的經驗與可重做的流程。 | 有證據的經驗卡或可執行的流程卡，保留適用範圍、決策、驗證及保存位置建議。 |
| [repository-drift-control](skills/repository-drift-control/) | Repo 文件出現重複規則、過期指令、來源衝突或多餘結構。 | 聚焦的文件修改，釐清權責、移除雜訊，保留已接受決策、證據與必要關卡。 |
| [first-principles-review](skills/first-principles-review/) | 在信任文件、提案、設計、程式模組或 diff 前，先挑戰其合理性。 | 假設、不變量、錯誤信心與不必要複雜度的審查發現，以及較簡單的方向與缺少的證據。 |

交接前用 `task-harness`；保存 Session 經驗用 `distill-session-knowledge`；整理現有文件用 `repository-drift-control`；判斷內容是否可信用 `first-principles-review`。

## 安裝與使用

每個 skill 直接放在 `skills/<skill-name>/`。將完整資料夾複製到 `~/.codex/skills/<skill-name>/`，包含必要的 supporting files。

安裝後可請 Codex 使用，例如：

```text
請用 $distill-session-knowledge 萃取本次 Session 值得保留的經驗與可重做流程。
```

Session 萃取預設在對話提出修改建議；取得授權後才寫檔。修改全域 skill 需要對該修改的明確批准。

## 維護

遵循 [AGENTS.md](AGENTS.md)。新增、改名、合併或刪除 skill 時，同步更新 [INDEX.md](INDEX.md)、兩個語言版本的 README 與受影響引用。
