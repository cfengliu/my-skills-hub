# Local Ollama Worker MCP Server

本資料夾是 MCP server 原始碼，提供工具：

```ts
run_local_model_task({
  task: string,
  repoPath?: string,
  model?: string
})
```

## 行為邊界

- `repoPath` 不依賴 Codex thread cwd。
- 省略 `repoPath` 時，只 best-effort 使用 MCP process cwd。
- cwd 不是 git repo 時，要求明確傳 `repoPath`。
- `realpath(repoPath)` 必須落在 `OLLAMA_WORKER_ALLOWED_ROOTS` 內。
- 內層命令使用 `codex --ask-for-approval never exec --ignore-user-config ... -`。
- prompt 走 stdin，不塞 command argument。
- Node 使用 `spawn()`，不用 `exec()`。
- tool 回 artifact paths，不直接吐 patch。

## npm global 安裝位置

一般不要手猜 npm global path，用這兩個命令查：

```bash
npm prefix -g
npm root -g
```

常見位置：

```text
nvm:      ~/.nvm/versions/node/<version>/lib/node_modules
Homebrew: /opt/homebrew/lib/node_modules
Intel Mac:/usr/local/lib/node_modules
```

可執行檔通常在：

```text
$(npm prefix -g)/bin
```

## 安裝到本機 npm global

從 repo root 執行：

```bash
npm install -g ./mcps/local-ollama-worker
```

這是本機私用 package：

- 不發布 registry。
- `package.json` 保留 `"private": true`，避免手滑 publish。
- `prepare` 會在安裝時 build `dist/`。

安裝後確認：

```bash
command -v ollama-worker-mcp
ollama-worker-mcp --help 2>/dev/null || true
```

`ollama-worker-mcp` 是 stdio MCP server，直接執行會等待 JSON-RPC stdin，沒有一般 CLI help 是正常的。

## Codex config

推薦讓 Codex 直接呼叫 global npm bin：

```toml
[mcp_servers.local_ollama_worker]
command = "ollama-worker-mcp"
args = []
startup_timeout_sec = 20
tool_timeout_sec = 1200
enabled = true
enabled_tools = ["run_local_model_task"]
default_tools_approval_mode = "prompt"

[mcp_servers.local_ollama_worker.env]
OLLAMA_WORKER_ALLOWED_ROOTS = "/Users/<you>/Documents/GitHub:/Users/<you>/dev"
OLLAMA_WORKER_DEFAULT_MODEL = "qwen2.5-coder:14b"
```

如果 Codex 找不到 global bin，就改用絕對路徑。查法：

```bash
command -v ollama-worker-mcp
```

然後填：

```toml
command = "/absolute/path/to/ollama-worker-mcp"
args = []
```

## Codex UI 表單填法

```text
啟動指令
ollama-worker-mcp

引數
<留空>

環境變數
OLLAMA_WORKER_ALLOWED_ROOTS=/Users/<you>/Documents/GitHub:/Users/<you>/dev
OLLAMA_WORKER_DEFAULT_MODEL=qwen2.5-coder:14b

工作目錄
~
```

工作目錄不重要。這個 worker 不依賴工作目錄判斷 repo；呼叫 tool 時建議明確傳 `repoPath`。

`OLLAMA_WORKER_ALLOWED_ROOTS` 用 `:` 分隔。不要放：

```text
~/.ssh
~/Library
/etc
/
```


## 工具輸出

MCP tool 只回 artifact paths：

```json
{
  "status": "completed",
  "runId": "20260625-123456-a1b2c3d4",
  "repoPath": "/absolute/repo",
  "model": "qwen2.5-coder:14b",
  "exitCode": 0,
  "artifacts": {
    "outputDir": "/absolute/repo/.codex/ollama-worker-runs/20260625-123456-a1b2c3d4",
    "finalMessagePath": "/absolute/repo/.codex/ollama-worker-runs/20260625-123456-a1b2c3d4/final.md",
    "patchPath": "/absolute/repo/.codex/ollama-worker-runs/20260625-123456-a1b2c3d4/patch.diff",
    "stdoutPath": "/absolute/repo/.codex/ollama-worker-runs/20260625-123456-a1b2c3d4/stdout.log",
    "stderrPath": "/absolute/repo/.codex/ollama-worker-runs/20260625-123456-a1b2c3d4/stderr.log"
  }
}
```

外層 AI 要自己讀 `patch.diff`、`final.md`，不要把 patch 當 MCP response 直接吃。

## CLI smoke test

```bash
printf '%s\n' '{"task":"Inspect the repo and summarize only.","repoPath":"/absolute/repo"}' \
  | ollama-worker-cli
```

## MCP smoke test

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0.0"}}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  | ollama-worker-mcp
```
