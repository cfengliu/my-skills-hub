# My Skills Hub

可重用的 Codex skills，以及本機 DSH 圖片生成插件。

[English](README.md) · [完整目錄](INDEX.md)

## 找到需要的工具

- [Skills](INDEX.md#skills)：Session 知識萃取與 repo 文件維護。`skills/` 下的每個資料夾都可獨立安裝。
- [DSH /imagen](plugins/dsh-imagen/README.md)：透過已登入的 Codex CLI 產生 PNG。安裝、開發與驗證方式集中在插件說明。

## 安裝 skill

將完整的 `skills/<skill-name>/` 資料夾複製到 `~/.codex/skills/<skill-name>/`，包含 supporting files，再請 Codex 使用：

```text
請用 $distill-session-knowledge 萃取本次 Session 值得保留的經驗與可重做流程。
```

Session 萃取預設在對話提出修改建議；取得授權後才寫檔。修改全域 skill 需要對該修改的明確批准。

## 維護 repo

遵循 [AGENTS.md](AGENTS.md)。項目清單集中在 [catalog](INDEX.md)，各項目的操作說明放在自己的目錄。依賴目錄、快取與插件打包產物由 Git 忽略。
