# dsh-codex-transcribe

在 DSH 聊天輸入框旁加入麥克風按鈕，錄音後透過 Codex 原生聽寫轉成文字，填回草稿供確認後送出。也可使用 `/codex-transcribe 音訊路徑` 轉錄既有檔案，取得逐字稿與 TXT 附件。沿用本機 Codex 的 ChatGPT 登入。

## 安裝與使用

前置條件：Node.js 24、DSH `0.2.2-rc.1`，以及已執行 `codex login` 的 ChatGPT 帳號。從 repo 根目錄執行：

```sh
cd plugins/dsh-codex-transcribe
npm pack --cache .cache/npm
dsh plugin --profile web add ./dsh-codex-transcribe-0.3.3.tgz
```

安裝後啟用輸入框錄音介面與經 DSH 登入驗證的轉錄路由。若同時啟用另一個語音輸入 bundle，輸入框可能出現兩個錄音按鈕。

重新整理 Web GUI，輸入框下方、模型選單和送出按鈕之間會出現麥克風：

1. 點麥克風，允許瀏覽器使用麥克風。等右側出現紅色方形鍵再開始說話。
2. 方形停止鍵會把逐字稿插入草稿。有反白文字時，逐字稿接在選取範圍後面。上箭頭會轉錄並送出整則草稿，叉號或 Escape 可取消。
3. 瀏覽器優先錄成 WebM／Opus，依支援情形改用 Ogg／Opus 或 M4A。錄音沒有固定秒數上限，單次最多 25 MB。

使用 `localhost`、loopback 或 HTTPS 開啟 DSH，瀏覽器才允許麥克風。Codex 登入留在 DSH 伺服器端；瀏覽器不需要權杖，也不需下載辨識模型。錄音停止時會把音訊傳至 ChatGPT 轉錄服務。

既有音訊檔的轉錄指令：

```text
/codex-transcribe-status
/codex-transcribe recordings/meeting.webm
```

路徑相對於目前 Session 的工作目錄，也接受絕對路徑；路徑含空格時直接輸入即可，不需 shell 引號。指令透過一般 agent 回合呼叫 `codex_transcribe`，模型仍需遵循 followup。也可直接請 agent 轉錄指定錄音。工具的 `language` 參數提供選填語言提示，例如 `zh`。

支援 WebM、WAV、MP3、M4A、OGG。插件限制單檔最多 25,000,000 bytes，這是本插件的保守限制，不是原生端點公開的大小保證。檔案轉錄與麥克風聽寫共用原生後端；麥克風聽寫在停止錄音後上傳，文字直接回填草稿，不啟動 agent 回合。檔案轉錄保留 TXT 附件。

## 登入與權杖設定位置

安裝後開啟 DSH「設定」，找到自動產生的 `codex-transcribe` 插件設定頁：

| 欄位 | 用途 |
|---|---|
| `accessToken` | 選填的 Codex／ChatGPT OAuth 存取權杖，以 secret 欄位遮蔽；留空沿用 Codex 登入。不是 OpenAI API key。 |
| `accountId` | 搭配手動權杖的 ChatGPT account ID。自動登入模式從 Codex 登入資訊取得。 |
| `codexHome` | 選填的 Codex 設定目錄，留空使用 `CODEX_HOME` 或使用者的 `.codex` 目錄。 |
| `language` | 預設語言提示，留空自動辨識。 |
| `timeoutMs` | 逾時毫秒，預設 180000，介面允許 1000–600000。 |

自動登入模式只在伺服器端讀取 Codex 管理的 `auth.json`，取出 OAuth 存取權杖與帳號識別碼；不修改登入檔，也不自行更新 refresh token。每次請求重新讀取檔案，登入過期時請透過 Codex 重新登入。API key 登入模式會明確拒絕。

手動設定的 secret 由 DSH 保存到目前 profile 的本機設定文件，設定介面與遠端設定讀取會遮蔽其值；這不是加密保管庫。不要把權杖貼進對話、提交到 Git 或放入工具參數。正常使用不必手動填權杖。

`/codex-transcribe-status` 只檢查可否載入登入資訊，回報來源，不顯示權杖、帳號識別碼或有效期限，也不連線驗證端點權限。

## 與搜尋／圖片插件的差異

DSH 的指令、工具、取消與附件處理沿用現有插件架構。傳輸層有所不同：搜尋和圖片使用 `codex app-server` 的 JSON RPC；目前的 app-server 沒有獨立聽寫 RPC，因此本插件直接呼叫桌面聽寫使用的 `https://chatgpt.com/backend-api/transcribe`，以本機 Codex 登入授權。

這是未公開、可能變更的 ChatGPT 產品端點，不是 OpenAI Platform 的 `/v1/audio/transcriptions`。沒有額外的開發者 API key，也不會在失敗後偷偷切換服務。成功驗證 OAuth 不能證明轉錄免費、包含於訂閱，或保證使用量歸屬；權限與用量由上游帳號服務決定。

請求只送 `file` 與選填 `language`，不指定模型、不啟動 Realtime 語音通話。結果是服務端逐字稿，不再交給模型整理或翻譯；DSH agent 最後如何呈現仍取決於模型，原始文字另存為 TXT 附件。沒有保證時間戳記或說話者標籤。

## CLI 與開發

以下命令在插件目錄執行：

```sh
node cli.mjs status
node cli.mjs transcribe --file recordings/meeting.webm --language zh
npm ci --ignore-scripts --cache .cache/npm
npm test
npm pack --dry-run --cache .cache/npm
```

CLI 支援 `--codex-home` 指定登入目錄，以及 `--timeout` 指定毫秒；刻意不提供權杖命令列參數，以免出現在 shell history 或程序清單。CLI 回傳 JSON，不會自動寫入逐字稿檔。

[auth.mjs](auth.mjs) 管理登入解析；[backend.mjs](backend.mjs) 管理 multipart 請求、取消、逾時及安全錯誤；[host.mjs](host.mjs) 整合 DSH 設定、檔案服務與附件；[cli.mjs](cli.mjs) 提供獨立入口；[voice.mjs](voice.mjs) 註冊 DSH 的錄音上傳路由。[client.mjs](client.mjs) 負責錄音與草稿回填。[cordis.patch.yml](cordis.patch.yml) 將插件加入 profile。

網路目的地固定，不跟隨重新導向、不自動重試。音訊讀取使用 DSH `fs` 服務及 Session 工作目錄，遵循檔案沙箱；Codex 登入檔屬插件的伺服器端憑證整合，沒有提供給模型任意指定認證檔的工具參數。HTTP 錯誤不回傳原始 body，網路錯誤不回傳底層例外，避免權杖進入工具紀錄。服務回應限制 2 MiB。

## 驗證與限制

2026-11-17 使用本機 Codex ChatGPT 登入、合成的短 WebM 音訊呼叫原生端點，回傳 HTTP 200，正確辨識 `This is a short transcription test. The number is 42.`。這次驗證不代表其他帳號都有轉錄權限，也不涵蓋長錄音或所有音訊格式的準確率。

0.3.3 的自動測試使用假憑證與模擬 HTTP，涵蓋登入解析、上傳、取消、大小限制、直接送出及保留草稿。Chrome 已手動確認麥克風聽寫及保留開頭。Safari 的實體麥克風流程尚未驗證。

端點依據為 [Codex Desktop 聽寫問題回報](https://github.com/openai/codex/issues/20668) 與 [社群實作](https://github.com/Zakariaaben/codex-speech-to-text-linux)，不是官方穩定 API 文件。以這次本機實測為可用性證據；403 時直接回報拒絕，不繞過限制。

0.3.0 改用瀏覽器原生壓縮錄音。自動測試涵蓋模擬 121 秒錄音後手動停止並回填、三種壓縮格式的原始位元組傳遞、大小限制與取消。
