# dsh-codex-imagen

透過已登入 ChatGPT 的 Codex CLI，在 DSH 輸入 `/codex-imagen 圖片描述` 產生一張 PNG。這是獨立插件，不需要額外 bridge，也沒有 OpenAI API 備援。

## 安裝

前置條件：Node.js 24、DSH `0.2.2-rc.1`，以及已登入 ChatGPT 的 Codex CLI。原生生圖已在 Codex CLI `0.169.0` 實測；帳號與目前 provider 必須支援 image generation。

從 repo 根目錄執行：

```sh
cd plugins/dsh-codex-imagen
npm pack --cache .cache/npm
dsh plugin --profile web add ./dsh-codex-imagen-0.1.0.tgz
```

重新整理 Web GUI，確認指令選單出現 `/codex-imagen`，再輸入 `/codex-imagen 清晨陽光穿過原始森林，寫實攝影`。打包檔由本機產生，不納入 Git。

插件透過一般 agent turn 呼叫 `imagen_generate`。圖片顯示於工具卡。按停止可取消回合與 Codex 子程序。模型仍需遵循 followup 指示，因此不能在 command dispatch 層保證模型一定只呼叫一次。

## CLI

以下命令均在插件目錄執行。查詢帳號與能力，不啟動圖片回合：

```sh
node cli.mjs status
```

實際生圖會使用 Codex 帳號額度。輸出必須位於目前工作目錄內，且檔案不可已存在；`output/` 已由 Git 忽略。

```sh
mkdir -p output
node cli.mjs generate --prompt '清晨的原始森林，寫實攝影' --out output/forest.png
```

CLI 支援 `--command` 指定 Codex 執行檔、`--model` 選擇規劃模型，以及 `--timeout` 指定毫秒。預設執行 `codex`，不指定模型，逾時為 `180000`。命令直接啟動執行檔，不會送進 shell。

## 開發與測試

在插件目錄安裝鎖定的依賴，再執行測試：

```sh
npm ci --ignore-scripts
npm test
```

測試不需要登入，也不會實際生圖。打包前可用 `npm pack --dry-run` 檢查檔案清單。

| 模組 | 責任 |
|---|---|
| [backend.mjs](backend.mjs) | Codex JSON RPC、程序生命週期、圖片來源與 PNG 驗證。 |
| [host.mjs](host.mjs) | DSH 指令、工具、取消訊號與附件儲存。 |
| [client.js](client.js) | Web GUI 工具圖片卡。 |
| [cli.mjs](cli.mjs) | 帳號狀態與直接輸出 PNG 的命令入口。 |

採用 command 排入 user followup，再由正常 turn 呼叫工具，讓取消與附件沿用 DSH 流程。未採用 command 直接生圖，因現行 `CommandResult` 不能承載 attachment，額外事件與取消流程會增加維護負擔。

Backend 以 `ImageRequest {prompt}` 接收請求，回傳 `GeneratedImage {data, mediaType, threadId, revisedPrompt}`；host 轉為 DSH `{attachment, original, threadId, revisedPrompt}`。每個請求擁有獨立 app-server 子程序、pending RPC map 與 turn，結束時終止並等待子程序 close。

## 限制

- 只接收同一 thread 與 turn 的 native `imageGeneration` 完成項目，並等成功的 `turn/completed`。文字、MCP 結果與工具聲稱的圖片都不算成功。
- 支援 canonical base64 PNG，以及 Codex 回報的真實 `codexHome/generated_images/<thread>/<item>.png`。只提供 `fileId` 的回應不支援，不猜測下載 RPC。
- PNG 上限為 32 MiB，最多 4000 萬像素。拒絕路徑跳脫、symlink、損壞 PNG 與交錯 PNG。
- thread 使用 ephemeral、read-only、approvalPolicy never 與空 environments。以程序參數停用 shell、apps、plugins、多 agent 與 web search。MCP server 名稱由 `config/read` 在記憶體中取得，並於 thread config 逐一停用。插件不讀取認證檔、不顯示設定值、不改寫使用者 config。
- DSH 的 `saveImage` 可能正規化圖片。插件另以 `saveFile` 保存原始 PNG，並在結果提供 file reference。目前自訂工具卡只顯示圖片與文字，尚無原始 PNG 下載按鈕。需要直接取得原圖時使用 CLI 的 `--out`。
- 目前 DSH `defineTool` 沒有宣告 external effect 的欄位。工具描述限制為使用者明確請求，正常工具政策仍可拒絕執行。本插件沒有額外強制每張圖片重新核准。

## 驗證紀錄

2026-11-17 在 Codex CLI `0.169.0` 實測登入與原生生圖，backend 產生有效 PNG，原圖為 3,757,366 bytes，保存在 [範例圖片](examples/primeval-forest.png)。當次記錄 31 項自動測試通過，涵蓋取消、逾時、錯誤、路徑限制、指令與 renderer 註冊。

2026-11-17 已安裝並啟用於執行中的 DSH `web` profile，取代舊名稱 `dsh-imagen-local`。尚未在實際瀏覽器驗證 `/codex-imagen` 指令選單、圖片卡及停止按鈕。
