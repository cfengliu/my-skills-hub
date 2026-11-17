# DSH /imagen

透過已登入 ChatGPT 的 Codex CLI，在 DSH 輸入 `/imagen 圖片描述` 產生一張 PNG。這是獨立插件，不需要額外 bridge，也沒有 OpenAI API 備援。

## 安裝

套件最終位置為 `/Users/steve/Documents/GitHub/my-skills-hub/plugins/dsh-imagen`。

1. 使用 Node.js 24 與 DSH `0.2.2-rc.1`。
2. 安裝 Codex CLI `0.169.0`，並先用 Codex 登入 ChatGPT。帳號與目前 provider 必須支援原生 image generation。
3. 安裝已附上的本機 bundle。

```sh
dsh plugin --profile web add /Users/steve/Documents/GitHub/my-skills-hub/plugins/dsh-imagen/dsh-imagen-local-0.1.0.tgz
```

4. 重新整理 Web GUI，確認指令選單出現 `/imagen`。
5. 輸入 `/imagen 清晨陽光穿過原始森林，寫實攝影`。

插件透過一般 agent turn 呼叫 `imagen_generate`。圖片顯示於工具卡。按停止可取消回合與 Codex 子程序。模型仍需遵循 followup 指示，因此不能在 command dispatch 層保證模型一定只呼叫一次。

## 驗證 Codex

以下命令只查帳號與能力，不啟動圖片回合。

```sh
node cli.mjs status
```

以下命令會實際使用 Codex 帳號額度。輸出必須位於執行命令時的工作目錄內，且檔案不可已存在。

```sh
node /Users/steve/Documents/GitHub/my-skills-hub/plugins/dsh-imagen/cli.mjs generate --prompt '清晨的原始森林，寫實攝影' --out forest.png
```

CLI 支援 `--command` 指定 Codex 執行檔、`--model` 選擇規劃模型，以及 `--timeout` 指定毫秒。預設執行 `codex`，不指定模型，逾時為 `180000`。命令是直接啟動執行檔，不會送進 shell。

## 限制

- 只接收同一 thread 與 turn 的 native `imageGeneration` 完成項目，並等成功的 `turn/completed`。文字、MCP 結果與工具聲稱的圖片都不算成功。
- 支援 canonical base64 PNG，以及 Codex 回報的真實 `codexHome/generated_images/<thread>/<item>.png`。只提供 `fileId` 的回應不支援，不猜測下載 RPC。
- PNG 上限為 32 MiB，最多 4000 萬像素。拒絕路徑跳脫、symlink、損壞 PNG 與交錯 PNG。
- thread 使用 ephemeral、read-only、approvalPolicy never 與空 environments。以程序參數停用 shell、apps、plugins、多 agent 與 web search。MCP server 名稱由 `config/read` 在記憶體中取得，並於 thread config 逐一停用。插件不讀取認證檔、不顯示設定值、不改寫使用者 config。
- DSH 的 `saveImage` 可能正規化圖片。插件另以 `saveFile` 保存原始 PNG，並在結果提供 file reference。目前自訂工具卡只顯示圖片與文字，尚無原始 PNG 下載按鈕。需要直接取得原圖時使用 CLI 的 `--out`。
- 目前 DSH `defineTool` 沒有宣告 external effect 的欄位。工具描述限制為使用者明確請求，正常工具政策仍可拒絕執行。本插件沒有額外強制每張圖片重新核准。
- 2026-11-17 已在 Codex CLI `0.169.0` 實測登入與原生生圖。插件 backend 產生有效 PNG，原圖為 3,757,366 bytes。31 項自動測試通過，涵蓋取消、逾時、錯誤、路徑限制、指令與 renderer 註冊。
- 尚未安裝到正在執行的 DSH profile，也尚未在實際瀏覽器驗證圖片卡及停止按鈕。現有 GUI 要求認證，未以 HTTP 401 回應替代瀏覽器驗收。

## 測試

先讓套件能解析 DSH 提供的 peer dependencies，再執行 `npm test`。測試不需要登入，也不會實際生圖。

設計比較與工作分工記錄見 [DECISIONS.md](DECISIONS.md)。
