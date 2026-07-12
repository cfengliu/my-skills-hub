# Package Plugin Script

`scripts/package-plugin.mjs` 把 repo 內的 plugin source 同步到本機 Codex 可安裝位置。

它不會修改 repo 內的 source plugin；它只在你執行非 `--check` 模式時更新：

- `~/plugins/<plugin-name>`
- `~/.agents/plugins/marketplace.json`（除非加 `--no-marketplace`）

## Repo source layout

plugin source 必須放在：

```text
plugins/<plugin-name>/
  .codex-plugin/
    plugin.json
  skills/
    <skill-name>/
      SKILL.md
```

目前主要 plugin 是：

```text
plugins/engineering
```

## Commands

只檢查，不安裝：

```bash
node scripts/package-plugin.mjs engineering --check
```

安裝/同步單一 plugin 到本機 Codex plugin 位置，並更新個人 marketplace：

```bash
node scripts/package-plugin.mjs engineering
```

只同步 plugin folder，不更新 marketplace：

```bash
node scripts/package-plugin.mjs engineering --no-marketplace
```

檢查所有 repo 內 plugins：

```bash
node scripts/package-plugin.mjs --all --check
```

同步所有 repo 內 plugins：

```bash
node scripts/package-plugin.mjs --all
```

## What it validates

- `plugins/<plugin-name>/.codex-plugin/plugin.json` 必須存在。
- `plugin.json` 的 `name` 必須等於 plugin 資料夾名稱。
- `plugin.json` 的 `skills` 必須是 `./skills/`。
- 每個 `skills/<skill-name>/SKILL.md` 必須存在。
- 每個 `SKILL.md` frontmatter 必須有 `name` 與 `description`。
- `SKILL.md` 的 `name` 必須等於 skill 資料夾名稱。
- `INDEX.md` 必須列出 plugin path 與 plugin 內所有 skill path。

## Notes

- `--check` 是安全模式，只做驗證，不碰 `~/plugins` 或 marketplace。
- 預設 plugin name 是 `engineering`，所以 `node scripts/package-plugin.mjs --check` 等同檢查 `engineering`。
- marketplace entry 使用 local source：`./plugins/<plugin-name>`。
