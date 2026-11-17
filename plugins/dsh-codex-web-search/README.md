# dsh-codex-web-search

透過已登入 ChatGPT 的 Codex CLI，將原生網頁搜尋提供給 DSH。輸入 `/codex-search 搜尋問題`，或由 agent 呼叫 `codex_web_search`，取得 Codex 整理的摘要、來源連結與搜尋動作。

## 安裝

前置條件：Node.js 24、DSH `0.2.2-rc.1`，以及已登入 ChatGPT、可使用網頁搜尋的 Codex CLI。已在 Codex CLI `0.169.0` 實測。

從 repo 根目錄執行：

```sh
cd plugins/dsh-codex-web-search
npm pack --cache .cache/npm
dsh plugin --profile web add ./dsh-codex-web-search-0.1.0.tgz
```

重新整理 Web GUI，再輸入：

```text
/codex-search 查詢 OpenAI 官方 Codex CLI 網頁搜尋文件，附上來源連結
```

打包檔與依賴不納入 Git。插件使用 DSH 既有文字工具卡，不需要 client bundle。安裝到其他 profile 時替換 `web`。

## 搜尋工具

`codex_web_search` 接收：

- `query`：必填，1–16000 字元的搜尋問題。
- `mode`：`live`（預設，即時網路存取）或 `cached`（Codex 搜尋索引）。

回傳 `answer`、`searches`、`threadId`、`mode`。`answer` 是模型整理的文字，可含來源 Markdown 連結；`searches` 每筆包含 `query`、`action` 與 `results`。`results` 原樣保留協定提供的 JSON 陣列，缺少時為 `null`，空陣列仍為 `[]`。

這不是固定格式的搜尋引擎結果 API。Codex 公開協定的 `results` 是 opaque JSON，沒有保證 URL、title 或 snippet 欄位；一般搜尋回合可能不提供這個陣列。摘要中的連結是模型輸出，插件沒有逐一擷取網址驗證。搜尋事件完成也不保證搜尋服務成功；來源不足或搜尋失敗時仍須閱讀回答判斷，不應把摘要當成已驗證事實。

## CLI

以下命令均在插件目錄執行；CLI 回傳 JSON：

```sh
node cli.mjs status
node cli.mjs search 'Codex CLI live 與 cached web search 的差異，附官方來源'
node cli.mjs search --cached 'Node.js fetch 文件'
```

`status` 只確認登入狀態，不啟動模型回合，也不保證搜尋服務可用。搜尋會使用 Codex 帳號額度。CLI 的 Ctrl+C 與 DSH 停止回合會取消子程序。

## 實作與限制

[host.mjs](host.mjs) 註冊指令與工具；[backend.mjs](backend.mjs) 管理搜尋 thread 與事件；[rpc.mjs](rpc.mjs) 管理 JSON RPC、逾時與子程序關閉；[cli.mjs](cli.mjs) 提供獨立測試入口。

實作方式與 [dsh-codex-imagen](../dsh-codex-imagen/README.md) 相同：每次請求啟動獨立 `codex app-server`，沿用 Codex 登入，以 ephemeral、read-only、approvalPolicy never 的 thread 執行。停用 shell、apps、plugins、多 agent、code mode 與設定中的 MCP servers。沒有 API key 備援，不讀取或修改認證檔與使用者 config。Codex 自身仍可能寫入工作區外的狀態資料庫，因此執行環境需允許 Codex 正常運作。

只接受同一 thread 與 turn 的 `webSearch` 完成事件，並等 `turn/completed` 成功且存在文字回答；只有文字回答或 MCP 搜尋不算完成。外部頁面內容與回傳摘要都應視為不可信資料。預設逾時 180000 毫秒；插件設定可調整 `command`、`model`、`timeoutMs`。

指令會將查詢加入一般 agent followup，再由 agent 呼叫工具。實際呼叫仍取決於 agent 是否遵循指示，與圖片插件相同。這個插件不會覆蓋 DSH 既有的 `web_search` 工具。

## 開發與驗證

```sh
npm ci --ignore-scripts --cache .cache/npm
npm test
npm pack --dry-run --cache .cache/npm
```

自動測試使用本機 fake app-server，不需要登入或搜尋額度，涵蓋原生搜尋事件、thread/turn 隔離、MCP 排除、literal query、取消、逾時、程序中斷、RPC 錯誤與指令註冊。

2026-11-17：20 項自動測試通過，打包清單檢查通過。在 Codex CLI `0.169.0` 實際執行即時搜尋，取得原生 `webSearch` 事件與附來源連結的回答。已安裝並啟用於執行中的 DSH `web` profile；尚未驗證瀏覽器內的指令選單與停止按鈕。

當次 `npm audit` 回報 8 項 high 警示，來自鎖定的 DSH `0.2.2-rc.1` peer 相依鏈使用的 Zod；audit 建議升級 DSH 套件至 `0.2.2-rc.3`。本插件維持目前 DSH runtime 的精確版本相容要求，沒有自行跨版本升級。執行環境升級後應同步更新兩個插件的 engines、peerDependencies 與 lockfile 並重測。

協定參考：[Codex 0.169.0 web search item](https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/ext/items/src/web_search.rs)、[web search tool](https://github.com/openai/codex/blob/rust-v0.169.0/codex-rs/ext/web-search/src/tool.rs)。
