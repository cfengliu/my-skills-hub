# /imagen 設計決策

資料以 `ImageRequest {prompt}` 進入 backend，產生 `GeneratedImage {data, mediaType, threadId, revisedPrompt}`。Host 儲存為 DSH canonical `{attachment, original, threadId, revisedPrompt}`。一個生圖請求擁有一個 app-server 子程序、pending RPC map 與一個正常 turn，結束時終止並等待子程序 close。

| 設計 | 使用者行為 | 取捨 |
| --- | --- | --- |
| Command 排入 user followup，正常 turn 呼叫工具 | `/imagen` 後可停止 turn，工具結果進入既有稽核與附件流程 | 採用。模型需遵循一次呼叫與 literal prompt 指示。 |
| Command 直接生圖 | dispatch 可直接執行 | 不採用。現行 CommandResult 只接受文字與 sourceEventSeq，不能承載 attachment。額外事件與取消流程會增加維護負擔。 |

Backend 只理解 native Codex JSON RPC 與 PNG。Host 只接 DSH command、tool 與 attachment API。Client 只註冊工具圖片卡。不建立額外 bridge，也不依賴 build 工具。

吞吐 checkpoint 的 blocking gate 是讀取現行 API 與 parent 的真實生圖驗證。獨立調查已由 parent 完成。本實作只有一個 owner，所有可變檔案隔離在 staging，backend、host、client 與測試依序完成。最小分工是三個模組、CLI 與行為測試，沒有額外 agent。

使用 Model the Domain 原則，把程序生命週期與 RPC pending requests 集中在單一 client，並用 canonical image 資料形狀隔開 Codex 與 DSH。未經真實 GUI 驗證的顯示與安裝不標示已通過。
