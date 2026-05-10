# Codex 工作日誌

本文件用來記錄專案決策、agent 工作內容、視覺驗證結果，以及人機協作歷程。
目標是讓未來沒有前備知識的 agent 能快速理解專案脈絡、接續工作，並避免重複踩坑。

## 專案固定背景

- 專案類型：以 p5.js 為主的手機優先 AR 專案
- 部署目標：GitHub Pages
- 開發環境：Visual Studio Code + Live Server
- 版本控制：Git + GitHub branches
- 最終確認權：由使用者保留
- Agent 不得自行 commit 或 push
- 視覺相關修改必須進行實際視覺驗證，不能只檢查語法

---

## 紀錄格式

### YYYY-MM-DD — 任務標題

#### 使用者需求
記錄使用者原始需求，包含限制、偏好、補充說明。

#### 檢視過的脈絡
列出本次讀取或參考的檔案、資料夾、前次工作日誌段落。

#### Agent 對目前狀態的理解
說明目前架構、相關功能流程、重要限制。

#### 實作前方案
記錄在動手修改前提出的方案、步驟、風險與驗證方式。

#### 使用者回饋與決策
記錄使用者同意、否決、修正或補充的內容。

#### 修改過的檔案
- `path/to/file`

#### 實作細節
具體說明修改了什麼、為什麼這樣修改、和 p5.js / AR / 手機瀏覽器有什麼關係。

#### 遇到的問題
記錄錯誤、限制、視覺問題、架構不清楚之處。

#### 嘗試過的解法
說明嘗試了哪些方法、結果如何、為什麼採用或放棄。

#### 最終解法
說明最後採用的做法與原因。

#### 視覺驗證
- 測試環境：
- 瀏覽器：
- 裝置 / viewport：
- 是否有截圖：
- Console 錯誤：
- 預期畫面：
- 實際觀察：
- 手機 / AR 後續確認事項：

#### 尚未解決的風險
列出尚未確認、需要人工測試、或可能影響 GitHub Pages / 手機 / AR 的問題。

#### 建議下一步
列出下一位 agent 或使用者可以接續處理的事項。

---

### 2026-05-10 — 修正編碼說明並記錄 headless 截圖流程

#### 日期
2026-05-10

#### 任務摘要
修正 `AGENTS.md` 中新增的 PowerShell UTF-8 設定區塊未關閉的 Markdown 格式問題，並補上目前可行的本機預覽與 headless 截圖流程。

#### 使用者需求
使用者希望修正 `AGENTS.md` 裡未結尾的 code block，並在適當位置補上截圖流程說明。使用者也提出疑問：雖然 Codex 已能執行專案並截圖，但是否能親自操作，例如按下開始按鈕進入下一頁，因為真正需要截圖驗證的內容在後續頁面。

#### 實作前理解
目前專案可用 Python static server 提供靜態檔案；Chrome / Edge headless 在沙盒內會被 Windows 權限阻擋，但在使用者允許沙盒外執行後可截圖。若未加入 `--virtual-time-budget=10000`，容易截到 p5.js 尚未完成繪製前的白畫面。

#### 實作方案
先修正 `AGENTS.md` 中 `powershell` code fence 的結尾，再加入本機預覽、headless 截圖流程、等待時間需求、沙盒外執行限制，以及 camera / AR 測試的限制說明。接著以工作日誌記錄本次文件更新與仍待確認的互動測試能力。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`

#### 決策紀錄
將長期協作規則放在 `AGENTS.md`，因為未來 agent 會優先讀取該檔案；將本次診斷與流程背景放在 `docs/codex-worklog.md`，方便追溯原因與限制。

#### 遇到的問題
`AGENTS.md` 原本新增的 `Terminal encoding note` 少了結尾的三個反引號，導致後續章節可能被 Markdown 視為同一段 code block。

#### 嘗試過的解法
使用 PowerShell 以 UTF-8 讀取檔案確認內容，再用小範圍 patch 修正 Markdown 格式並補充驗證流程，避免改動功能程式碼。

#### 最終解法
已在 `AGENTS.md` 補上 code fence 結尾，並新增 `Local preview and screenshot workflow`，記錄 `Start-Job` 啟動 Python server、Chrome headless mobile viewport、`--virtual-time-budget=10000`、以及沙盒外執行限制。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Chrome headless；Edge headless 也曾成功產生相近 Start page 截圖
- 裝置 / viewport：Chrome 回報 viewport 約 478x690；截圖目標使用 mobile-like window size
- 是否有截圖：有，`docs/chrome-headless-wait-test.png`、`docs/cdp-click-scanning-test.png`、`docs/cdp-click-result-test.png`
- Console 錯誤：未完成完整 DevTools console 擷取；Chrome logging 未顯示頁面層級 fatal JS 錯誤
- 預期畫面：p5.js Start page 黑底、中文說明文字、綠色開始按鈕；點擊後進入 Scanning page
- 實際觀察：加上 `--virtual-time-budget=10000` 後可截到 Start page；使用 CDP `Input.dispatchMouseEvent` 點擊開始按鈕後，狀態由 `START` 變為 `SCANNING`，fake camera stream 可用，並截到掃描頁 UI；再點擊 shutter 後狀態變為 `RESULT`，`resultPhoto` 與 `spawnPosition` 均存在，並截到結果頁 UI
- 手機 / AR 後續確認事項：真實相機權限、後鏡頭、裝置方向感測、觸控手感、結果頁生成流程仍需進一步自動化或實機測試

#### 尚未解決的風險
Browser Use / in-app browser 目前因 Node REPL `Access is denied` 無法使用。Chrome DevTools Protocol 已能模擬點擊開始按鈕、進入掃描頁、點擊 shutter、進入結果頁並截圖；但 fake camera 畫面不能取代真實手機 AR 測試，儲存流程與真實相機畫面仍需另行驗證。

#### 使用者回饋或修正
使用者指出真正需要截圖的內容在後續頁面，因此單純能截 Start page 不足以符合完整測試需求。

#### 建議的下一步
將 Chrome DevTools Protocol 操作流程整理成可重複執行的測試腳本，下一步測試返回 / 儲存按鈕、不同 viewport、以及真實手機上的 camera permission 與裝置方向感測。

---

### 2026-05-10 — 驗證前次 agent 留下的 CDP 視覺測試流程

#### 日期
2026-05-10

#### 任務摘要
依照前一位 agent 在工作日誌中留下的本機預覽、headless Chrome、fake camera 與 Chrome DevTools Protocol 操作流程，重新驗證 Start → Scanning → Result 的自動化視覺測試是否可重現。

#### 使用者需求
使用者要求先閱讀 `AGENTS.md`，再閱讀 `docs/codex-worklog.md` 最近工作紀錄，並驗證前一位 agent 找出的工作流程。使用者特別提醒：工作日誌不是看過即可，而是重要提示與可運用的技能，應用來少走彎路。

#### 實作前理解
前次紀錄指出，單純 Chrome headless 截圖可能截到空白畫面；正確流程需要啟動本機 static server、使用 Chrome headless、加上 fake camera 參數，並透過 CDP 回讀 runtime 狀態與模擬點擊 Start button / shutter。因為 Start button 位置是在 `drawStartPage()` 內依 viewport 動態計算，驗證時不應硬猜座標，而應從頁面 runtime 讀取 `StartButton.ButtonX` 與 `StartButton.ButtonY`。

#### 實作方案
先以 UTF-8 讀取 `AGENTS.md` 與 `docs/codex-worklog.md`，確認專案規範與前次工作流程。接著檢查 `index.html`、`sketch.js`、`Pages/StartPage/StartPage.js`、`Pages/StartPage/StartPageSettings.js`、`Pages/ScanningPage/ShutterButton.js`，確認頁面狀態、Start button 與 shutter 的互動邏輯。最後啟動 Python static server 與 Chrome headless，使用 CDP 執行 runtime evaluate、mouse event 與 `Page.captureScreenshot`。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `index.html`
- `sketch.js`
- `Pages/StartPage/StartPage.js`
- `Pages/StartPage/StartPageSettings.js`
- `Pages/ScanningPage/ShutterButton.js`

#### 修改過的檔案
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
採用前次 worklog 留下的 CDP 流程作為主要驗證方式，而不是只確認 headless Chrome 是否產生截圖檔。原因是本次重跑也觀察到：使用一般 `--screenshot` 搭配絕對路徑雖能輸出檔案，但畫面可能是白圖；必須回讀 runtime 狀態並實際點擊後續頁面，才能確認流程真的可用。

#### 遇到的問題
沙盒內 PowerShell 與 `rg` 在目前 Windows 環境中仍可能遇到 `Access is denied`，需要使用者允許沙盒外執行。第一次使用相對截圖路徑時沒有產生檔案；改成絕對路徑後可產生檔案，但該檔案是白圖，表示只檢查檔案存在不足以代表視覺驗證成功。

#### 嘗試過的解法
先嘗試基本 Chrome headless `--screenshot` 流程，確認相對路徑不可靠；再改用絕對路徑確認 Chrome 能輸出圖片。接著依前次 worklog 提示，改用 Chrome DevTools Protocol：透過 `Runtime.evaluate` 讀取 `currentPagesState`、`StartButton`、`video`、`shutterX/Y`、`resultPhoto` 與 `spawnPosition`，並用 `Input.dispatchMouseEvent` 模擬點擊。

#### 最終解法
CDP 自動化流程成功重現。初始狀態為 `START`，`hasP5=true`，viewport 內部尺寸約為 `478x694`，Start button 座標為 `(239, 537.6)`。點擊 Start button 後狀態變為 `SCANNING`，`videoReady=true`，shutter 座標為 `(239, 614)`。點擊 shutter 後狀態變為 `RESULT`，`hasResultPhoto=true`，並成功取得 `spawnPosition` 與 `spawnPositionRatio`。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：Chrome window size `390x844`，p5 runtime 回報約 `478x694`
- 是否有截圖：有，`docs/verify-cdp-start-2026-05-10.png`、`docs/verify-cdp-scanning-2026-05-10.png`、`docs/verify-cdp-result-2026-05-10.png`
- Console 錯誤：本次未建立完整 console event 收集；Chrome 有輸出與 managed web app 相關的非頁面 fatal 訊息，未阻止頁面流程
- 預期畫面：Start page 顯示黑底中文說明與綠色啟動按鈕；Scanning page 顯示 fake camera 綠色畫面、快門與 UI；Result page 顯示生成昆蟲、儲存與返回按鈕
- 實際觀察：三張 CDP 截圖皆非白圖，Start / Scanning / Result 的視覺內容符合預期；fake camera 畫面可支撐自動化 UI 驗證
- 手機 / AR 後續確認事項：真實手機相機、後鏡頭、HTTPS 權限、DeviceOrientation 權限、觸控手感與真實 AR 疊合仍需實機驗證

#### 尚未解決的風險
CDP + fake camera 可以驗證頁面狀態與 UI 流程，但不能取代真實手機的 camera permission、感測器權限、後鏡頭畫面與效能測試。`--screenshot` 單步流程仍可能產生白圖，因此未來應優先使用 CDP 回讀狀態與 `Page.captureScreenshot`。

#### 使用者回饋或修正
使用者提醒工作日誌應被視為重要提示與可運用技能，而不是只作為閱讀過的文件。本次驗證流程已依此修正，直接沿用前次紀錄中的 CDP 技術路線。

#### 建議的下一步
將本次使用的 CDP 驗證流程整理成可重複執行的腳本，並加入 console event 收集、不同 viewport 測試、返回 / 儲存按鈕驗證，以及真實手機手動測試清單。
