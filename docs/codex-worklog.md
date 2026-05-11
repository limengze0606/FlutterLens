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

---

### 2026-05-10 — 擴充 CDP 測試：console、viewport、儲存與返回

#### 日期
2026-05-10

#### 任務摘要
在已驗證的 CDP 自動化流程上加入 console event 收集、不同 viewport 測試，以及 Result page 的儲存 / 返回按鈕驗證。

#### 使用者需求
使用者確認前一階段完成後，要求測試加入 console event 收集、不同 viewport 測試、返回 / 儲存按鈕驗證。

#### 實作前理解
前次流程已可用 CDP 模擬 Start → Scanning → Result。本次需擴充同一套流程，不另開新的測試方向。`drawSaveButton()` 的按鈕中心為 `width / 2, height - 145`；`drawBackButton()` 的按鈕中心為 `width / 2, height - 80`。儲存會呼叫 `saveCanvas("FlutterLens-result", "png")`，因此 headless Chrome 需設定 download behavior 並檢查下載目錄。

#### 實作方案
啟動 Python static server 與 Chrome headless，透過 CDP 啟用 `Runtime.enable`、`Log.enable`、`Page.enable`、`Browser.setDownloadBehavior`。每個 viewport 讀取 Start button runtime 座標後點擊，進入 Scanning 後讀取 shutter 座標再點擊，最後截 Result。主要 portrait viewport 額外點擊儲存按鈕並檢查下載檔，再點擊返回按鈕並確認狀態回到 `SCANNING` 且 Result data 已清空。

#### 檢視過的檔案
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/ResultPageSettings.js`
- `Pages/ScanningPage/ScanningPage.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
延續前次 worklog 中可重用的 CDP 技術路線，並將 console event 與 download behavior 加入同一次自動化流程。不同 viewport 先以 Chrome `--window-size` 測試，因目前環境下 CDP `Emulation.setDeviceMetricsOverride` 的重跑嘗試發生 timeout，暫不把它作為穩定流程。

#### 遇到的問題
三個 viewport 中，portrait 與 compact 可完成 Start → Scanning → Result；landscape `844x390` 未進入 Scanning。截圖顯示橫向高度下 Start page 的按鈕掉到畫面外，CDP runtime 也停留在 `START`，因此不是單純點擊座標錯誤，而是橫向版面可用性風險。console 收集到一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，推測為瀏覽器自動請求 favicon 或其他非必要資源，未阻止流程。精準 emulated viewport 測試曾嘗試使用 `Emulation.setDeviceMetricsOverride`，但該輪 CDP 命令 timeout，已清理殘留 headless Chrome profile。

#### 嘗試過的解法
先用現有穩定 CDP 流程加入 console event 收集與多 viewport。對於儲存流程，透過 `Browser.setDownloadBehavior` 指定下載目錄，點擊儲存後檢查檔案是否出現。對於返回流程，點擊返回後用 `Runtime.evaluate` 讀取 `currentPagesState`、`resultPhoto`、`spawnPosition` 與 `spawnPositionRatio`。另嘗試改用 CDP device metrics override 取得更精準 viewport，但本次在 PowerShell WebSocket 流程中 timeout，暫列為工具流程待改善。

#### 最終解法
擴充測試成功涵蓋 console、portrait / compact viewport、儲存與返回。`portrait-390x844` runtime 約 `478x694`，完成 `START → SCANNING → RESULT`，儲存後下載 `docs/cdp-downloads-2026-05-10/portrait-390x844/FlutterLens-result.png`，大小 43,501 bytes；返回後狀態為 `SCANNING`，且 `resultPhoto` 與 `spawnPosition` 已清空。`compact-360x740` runtime 約 `478x590`，完成 `START → SCANNING → RESULT`。`landscape-844x390` runtime 約 `822x240`，Start button 不可見，流程停在 `START`。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`390x844`、`360x740`、`844x390` window size；runtime 分別約 `478x694`、`478x590`、`822x240`
- 是否有截圖：有，`docs/extended-portrait-390x844-start.png`、`docs/extended-portrait-390x844-scanning.png`、`docs/extended-portrait-390x844-result.png`、`docs/extended-portrait-390x844-after-back.png`、`docs/extended-compact-360x740-start.png`、`docs/extended-compact-360x740-scanning.png`、`docs/extended-compact-360x740-result.png`、`docs/extended-landscape-844x390-start.png`、`docs/extended-landscape-844x390-scanning.png`、`docs/extended-landscape-844x390-result.png`
- Console 錯誤：每個 viewport 收到 1 筆 404 resource 訊息，未阻止 p5.js 與互動流程；未觀察到 fatal JS exception
- 預期畫面：portrait / compact 應完成 Start、Scanning、Result；portrait 的 Save 應產生 PNG，Back 應回到 Scanning。landscape 應至少可操作 Start button。
- 實際觀察：portrait / compact 符合預期；portrait Save / Back 通過。landscape Start button 不在可視範圍，無法進入 Scanning。
- 手機 / AR 後續確認事項：需在真實手機橫向與直向確認 viewport、高度、安全區域、權限彈窗與觸控手感。

#### 尚未解決的風險
landscape Start page 目前有明顯可用性風險：在短高度橫向 viewport 下按鈕不可見，使用者無法啟動流程。Chrome `--window-size` 與 runtime viewport 不完全相同，未來若要做可重複測試，應將 CDP script 獨立成檔案並修正 `Emulation.setDeviceMetricsOverride` timeout 問題。console 404 需進一步確認是否只是 favicon；若要讓 console 完全乾淨，可補 favicon 或過濾非頁面資源。

#### 使用者回饋或修正
使用者要求本階段直接測試 console 收集、多 viewport、返回與儲存按鈕。尚未提出對測試結果的修正意見。

#### 建議的下一步
優先修正 landscape Start page 的垂直配置，確保按鈕在橫向手機高度下可見；接著將 CDP 測試整理成可重跑腳本，加入穩定的 device metrics override、console 分級、download 檢查、返回 / 儲存按鈕斷言，以及 screenshots 產物命名規則。

---

### 2026-05-10 — 建立可重跑 CDP 視覺測試腳本與產物命名規則

#### 日期
2026-05-10

#### 任務摘要
將前幾輪手動 PowerShell / CDP 操作整理成可重跑的 `scripts/run-cdp-visual-test.ps1`，並新增 `docs/cdp-visual-test-workflow.md` 記錄執行方式與 screenshots / downloads / JSON 產物命名規則。

#### 使用者需求
使用者要求將 CDP 測試整理成可重跑腳本，並增加 screenshots 產物命名規則。

#### 實作前理解
前次 CDP 測試已驗證 Start → Scanning → Result、console event 收集、portrait / compact / landscape viewport、Save 與 Back。最需要固化的是可重跑性、產物位置、命名規則、summary / console 記錄，以及 headless Chrome profile 的清理。

#### 實作方案
新增 `scripts/run-cdp-visual-test.ps1`，預設從專案根目錄啟動 Python static server 與 Chrome headless，使用 fake camera 與 CDP 操作三個 viewport。產物集中輸出到 `docs/cdp-runs/<runId>/`，並用 `<runId>-<viewportLabel>-<stage>.png` 命名截圖。新增 `docs/cdp-visual-test-workflow.md` 以繁體中文說明執行方式、命名規則、判讀重點與已知限制。

#### 檢視過的檔案
- `.gitignore`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `scripts/run-cdp-visual-test.ps1`
- `docs/cdp-visual-test-workflow.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
腳本採用前次已穩定的 Chrome `--window-size` 流程，而不是預設使用 `Emulation.setDeviceMetricsOverride`，因後者前次在 PowerShell WebSocket 流程中發生 timeout。產物採用 run 目錄集中管理，避免 screenshots 散落在 `docs/` 根層。Chrome profile 預設放在 run 目錄下的 `profiles/`，測試結束後自動清除；只有指定 `-KeepProfiles` 時才保留。

#### 遇到的問題
需要避免測試腳本誤殺使用者日常 Chrome，因此清理程序只根據本次 profile path 篩選 Chrome process。landscape viewport 的 Start button 不可見問題仍存在，腳本會在 summary 中記錄 `startVisible=false`，不會硬點畫面外座標。

#### 嘗試過的解法
將前次手動 CDP 互動拆成 PowerShell functions：`Send-Cdp`、`Invoke-CdpEval`、`Save-CdpScreenshot`、`Invoke-CdpClick`、`Receive-CdpMessage`。用 `Browser.setDownloadBehavior` 驗證 Save，並將 console event 另存為 JSON。

#### 最終解法
腳本已可重跑。執行 `.\scripts\run-cdp-visual-test.ps1 -RunId "codex-script-smoke"` 成功產生 `docs/cdp-runs/codex-script-smoke/`，包含 screenshots、downloads、`codex-script-smoke-summary.json` 與 `codex-script-smoke-console.json`。Smoke run 結果：`portrait-390x844` 完成流程、Save 下載 `FlutterLens-result.png`、Back 回到 `SCANNING` 且清空 result data；`compact-360x740` 完成流程；`landscape-844x390` 記錄 `startVisible=false` 並停在 `START`。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- 是否有截圖：有，集中於 `docs/cdp-runs/codex-script-smoke/screenshots/`
- Console 錯誤：summary 顯示每個 viewport 收到 1 筆 console event；詳細內容在 `docs/cdp-runs/codex-script-smoke/codex-script-smoke-console.json`
- 預期畫面：portrait / compact 可完成流程；portrait 可 Save 與 Back；landscape 目前應被腳本標記為 Start 不可見風險
- 實際觀察：符合預期，腳本回傳 JSON summary，且產物命名符合規則
- 手機 / AR 後續確認事項：仍需真實手機確認 camera / orientation / touch / performance

#### 尚未解決的風險
CDP 腳本目前仍以 `--window-size` 為穩定模式，runtime viewport 與指定 window size 不完全相同。landscape Start page 的按鈕不可見是功能風險，需另行修正。Console 404 resource 訊息來源尚未追蹤到具體資源。

#### 使用者回饋或修正
使用者要求把已驗證的 CDP 測試流程產品化成可重跑腳本，並補上 screenshots 命名規則。本次已完成。

#### 建議的下一步
修正 landscape Start page 排版後，使用 `scripts/run-cdp-visual-test.ps1` 重跑並比較新的 `summary.json` 與 screenshots；接著可考慮把 CDP script 加入更正式的測試檢查流程，並補上 console 404 的來源確認。

---

### 2026-05-10 — 調整 RoughInsectWings 手繪上色筆觸

#### 日期
2026-05-10

#### 任務摘要
調整 `RoughInsectWings.js` 的 `drawRoughWingColor()`，讓 rough wing 上色從被輪廓裁切的少量 marker 線段，改成更自然、手繪、可略微出界的多層筆觸與色斑。

#### 使用者需求
使用者希望 `RoughInsectWings.js` 的 `drawRoughWingColor()` 能以自然、手繪的筆觸來上色，可以稍微出界，也不需要太依照翅膀的網格形狀，並參考示意圖中類似 ink on photo、水彩或 marker 色塊覆蓋在翅膀線稿下方的視覺。

#### 實作前理解
前次工作日誌指出本專案的視覺修改必須實際跑瀏覽器驗證，且已有可重跑的 CDP 視覺測試腳本。閱讀 `RoughInsectWings.js` 後確認：原本 `drawRoughWingColor()` 雖然會建立 `markerPaint`，但實際 `brush.set("marker1", "#0000FF", ...)` 硬寫成藍色，而且筆觸會經過 `trimPolylineToOutline()` 裁回 `baseOutline`，因此不容易產生參考圖中自然溢出、自由色塊、不貼齊 Voronoi 網格的感覺。

#### 實作方案
保留現有 rough wing 的輪廓、Voronoi 線稿與 p5.brush 架構，只改寫上色層。將上色改為多條鬆散 marker 筆觸，取樣點可來自翅膀內部或輪廓邊緣附近，端點加入 overshoot，並取消完全裁切回輪廓內的行為。同時新增少量不規則色斑，讓色彩不完全服從 Voronoi 網格。為了避免 fake camera 或真實照片取樣色太接近時畫面過淡，對筆觸色加入小幅 hue shift 與飽和度提升，但仍以 `color1` / `color2` 為基底。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `index.html`
- `sketch.js`
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/InsectWings.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
沒有新增外部依賴，也沒有改動 GitHub Pages 載入路徑。保留 `marker1` brush，因為專案已經載入 `assets/brushTips/marker1.jpg` 並用於 rough wing 上色；本次只調整 stroke 生成方式、顏色使用方式與鬆散取樣策略。Voronoi 線稿仍在色彩層之後繪製，讓結果接近「先染色、再用墨線標註翅脈」的順序。

#### 遇到的問題
CDP 使用 fake camera 時背景與取樣色偏單一亮綠，因此自動截圖中的翅膀色彩主要呈現淡綠、白色水痕與邊緣暈染，無法完整代表真實照片下的多色效果。Console 仍出現每個 viewport 一筆 404 resource 訊息，與前次測試一致，未阻止流程。

#### 嘗試過的解法
第一版先將 `drawRoughWingColor()` 改成多條不裁切的 marker 筆觸與色斑，並真正套用 `getRoughWingMarkerColor()` 的結果。視覺截圖顯示已有溢出與暈染，但 fake camera 色彩偏淡；第二版加入 `tintRoughWingBrushColor()`，對照片主色做小幅色相偏移與飽和度補強，讓單色環境下仍能保留手繪色塊層次。

#### 最終解法
`drawRoughWingColor()` 現在會產生 9 到 14 條鬆散 marker 筆觸，以及 3 到 5 個不規則色斑。新增 `sampleLooseWingBrushPoint()`、`samplePointNearOutlineEdge()`、`tintRoughWingBrushColor()`、`drawLooseWingColorPatch()`，並擴充 `makeRoughMarkerStroke()` 支援 `allowOvershoot`。筆觸端點與取樣點可稍微超出 `baseOutline`，但仍會以輪廓附近範圍控制，避免色彩大幅飄離翅膀。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-wing-color-final-2026-05-10/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次已知狀況一致，未阻止流程
- 預期畫面：Result page 的 rough wing 色彩應呈現自然 marker / watercolor 筆觸，可小幅出界，不完全貼合 Voronoi 網格；portrait / compact 應維持流程通過，portrait Save / Back 應正常
- 實際觀察：portrait / compact 完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，Back 回到 `SCANNING` 並清空 Result data。Result 截圖可看到翅膀周圍與內部有鬆散暈染、出界與淡色水痕，線稿仍在上層。因 fake camera 色彩單一，真實照片下的多色筆觸仍需實機或真實影像確認
- 手機 / AR 後續確認事項：真實手機相機、GitHub Pages HTTPS、後鏡頭、觸控、效能與真實環境色彩仍需人工確認

#### 尚未解決的風險
fake camera 不能代表真實照片的色彩分布，因此需要用真實手機或至少真實照片背景確認色相偏移是否過強或過淡。landscape Start page 的按鈕不可見問題仍存在，非本次任務範圍。Console 404 resource 來源仍未追蹤。

#### 使用者回饋或修正
使用者核准先前提出的實作方案，指示「開始」。尚未針對本次視覺結果提出後續修正。

#### 建議的下一步
用真實手機拍攝多色自然背景，確認 rough wing 上色在真實照片中是否達到示意圖的水彩 / marker 手繪感；若顏色仍偏淡，可再提高 `marker1` 筆觸密度或建立專用 rough wash brush。另建議後續修正 landscape Start page 排版與 console 404 來源。

---

### 2026-05-10 — 將 Rough Wing 上色改為根部放射式筆觸

#### 日期
2026-05-10

#### 任務摘要
依照使用者回饋，將 `drawRoughWingColor()` 從較隨機的補色筆觸，改為由翅膀根部往上緣、尖端與尾端延伸的放射狀上色結構，讓手繪色彩更接近真實翅膀的生長方向。

#### 使用者需求
使用者新增 `docs/llms.txt`，希望 agent 理解 p5.brush 更完整的使用方式，並指出上一版筆刷方向仍太隨機，像是隨便填幾筆。使用者提出希望上色能像真實蝴蝶翅膀一樣，從翅膀根部放射狀延伸到尖端與尾端，看起來更自然。

#### 實作前理解
`docs/llms.txt` 說明本專案使用的是 p5 build，已由 p5 的 `createCanvas(..., WEBGL)` 管理 canvas 與 frame flush；`brush.load()` 只需要在切換 target 時使用。文件也指出 `brush.fill()`、`brush.fillBleed()`、`brush.fillTexture()` 可用於 watercolor fill，`brush.beginShape()` / `vertex()` / `endShape()` 可支援 stroke 與 fill。這讓 rough wing 上色可以從單純 marker stroke 擴充為「淡水彩 wedge + 放射 marker stroke」。

#### 實作方案
以 `baseOutline[0]` 作為翅膀根部，建立 root-to-edge radial system。先畫 2 到 3 個從根部往外緣展開的淡色 wedge，使用 `brush.fill()`、`brush.fillBleed()` 與 `brush.fillTexture()` 製造水彩底色，再畫 16 到 22 條根部往外緣的 marker strokes。隨機性只用於端點 overshoot、線條彎曲、乾筆斷裂與邊緣 jitter，不再決定整體方向。

#### 檢視過的檔案
- `docs/llms.txt`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
採用 p5.brush 的 fill API 來試做水彩底色，但把 bleed 與 texture 控制得較低，避免 fake camera 下產生過大的亮綠外圈。保留 `marker1` 作為主要上色筆刷，因為它已存在於專案 setup，且能延續前一版手繪 marker 質感。

#### 遇到的問題
第一次 radial 版本的 watercolor wedge 在 fake camera 單一亮綠背景中產生偏大的發光暈染，內部放射筆觸不夠清楚。這不一定代表真實照片會同樣失敗，但自動截圖很難看出使用者期待的自然多色手繪感。

#### 嘗試過的解法
先實作 root-to-edge 的 watercolor wedge 與 marker strokes，跑 CDP 視覺測試後觀察到外圈偏亮。第二次微調降低 `brush.fill()` opacity、降低 `fillBleed()`、關閉 `fillTexture()` 的 scatter，並增加 marker stroke 數量與 alpha，使放射筆觸比外圈暈染更明確。

#### 最終解法
`drawRoughWingColor()` 現在先取得 root point，使用 `drawRadialWingWash()` 畫淡色放射 wedge，再以 `makeRadialWingMarkerStroke()` 畫從根部往外緣的 marker strokes。新增 helper 包含 `getRoughWingRootPoint()`、`getRadialWingProgress()`、`getWingOutlinePointAtProgress()`、`makeRadialWingStrokeStart()`、`makeRadialWingMarkerStroke()`、`drawRadialWingWash()`、`interpolatePoint()` 與 `jitterArrayPoint()`。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-wing-radial-final-2026-05-10/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次已知狀況一致，未阻止流程
- 預期畫面：rough wing 色彩應沿翅膀根部往外放射，保留手繪筆觸與小幅 overshoot，不再像隨機補色
- 實際觀察：portrait / compact 完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，Back 回到 `SCANNING` 且清空 Result data。Result 截圖可看到上色集中在翅膀周圍並有根部向外延伸的方向感，但 fake camera 單一亮綠仍讓色彩偏白、偏發光，真實照片效果需再確認
- 手機 / AR 後續確認事項：真實手機相機、自然背景、多色照片下的色相表現、筆觸是否過亮、手機效能仍需人工測試

#### 尚未解決的風險
目前自動截圖使用 fake camera，無法可靠評估真實環境中的色彩與水彩透明度。若實機仍覺得像外圈發光，下一步應進一步降低 `brush.fillBleed()` 或改用純 radial marker strokes，不使用 fill wedge。landscape Start page 與 console 404 仍是既有風險。

#### 使用者回饋或修正
使用者指出上一版「筆刷方向還是太過於隨機，像是隨便填幾筆」，並提議改成像真實蝴蝶翅膀一樣從根部放射到尖端與尾端。本次已依該方向實作並驗證。

#### 建議的下一步
用真實手機拍攝自然環境，特別是包含多種綠、棕、天空或花色的背景，檢查 radial rough wing 是否比上一版自然。若色彩仍過白或過亮，優先降低 watercolor wedge 比重，讓 marker strokes 成為主體。

---

### 2026-05-10 — 研究 Rough Wing 手繪上色演算法方向

#### 日期
2026-05-10

#### 任務摘要
閱讀專案規範、前次工作紀錄、`docs/llms.txt` 與 `RoughInsectWings.js`，整理 `drawRoughWingColor()` 可用於自然手繪上色的演算法與實作邏輯。

#### 使用者需求
使用者要求先閱讀 `AGENTS.md`、`docs/codex-worklog.md`，吸收前人工作紀錄，再閱讀 `llms.txt` 學習 p5.brush，目標是思考 `RoughInsectWings.js` 的 `drawRoughWingColor()` 如何用自然、手繪的筆觸上色。

#### 實作前理解
目前專案使用 p5 build 的 p5.brush，主畫布由 p5 的 `createCanvas(..., WEBGL)` 管理，不需要呼叫 standalone build 的 `brush.render()`。前次已將 rough wing 上色從隨機補色筆觸改為根部放射式架構，包含淡水彩 wedge 與 marker strokes。使用者此輪仍在詢問演算法方向，因此本次不修改功能程式碼。

#### 實作方案
先閱讀現有文件與程式，確認目前 `drawRoughWingColor()` 的資料來源、筆觸方向、p5.brush API 使用方式，再提出可落地的演算法建議：根部放射流場、分層透明水彩、乾筆斷裂、邊界小幅溢出、局部色斑與與 Voronoi 線稿分離的筆觸邏輯。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/llms.txt`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`

#### 修改過的檔案
- `docs/codex-worklog.md`

#### 決策紀錄
本次只整理演算法與設計方向，不改 `RoughInsectWings.js`。後續若要實作，應先讓使用者確認採用哪一種視覺策略，再修改程式並重跑 CDP 視覺測試。

#### 遇到的問題
使用者提到 `llms.txt`，但專案根目錄沒有該檔案；依前次工作紀錄判斷實際位置為 `docs/llms.txt`，已改讀該檔案。

#### 嘗試過的解法
先以 UTF-8 讀取專案規範與工作紀錄，再用 `rg` 定位 `RoughInsectWings.js` 內相關函式行號，確認目前上色核心位於 `drawRoughWingColor()`、`drawRadialWingWash()`、`makeRadialWingMarkerStroke()` 等函式。

#### 最終解法
整理出後續可採用的演算法方向，核心建議是以「翅膀根部到外緣的放射流場」作為筆觸主方向，再疊加水彩 wash、marker 乾筆、邊界 overshoot、色相變化與少量非網格化色斑。

#### 視覺驗證紀錄
- 測試環境：未執行瀏覽器測試
- 瀏覽器：未執行
- 裝置 / viewport：未執行
- 是否有截圖：無
- Console 錯誤：未檢查
- 預期畫面：本次為演算法討論，尚未改變視覺結果
- 實際觀察：未產生新畫面
- 手機 / AR 後續確認事項：若後續修改 `drawRoughWingColor()`，需重跑 CDP 視覺測試並以真實手機確認照片色彩與 AR 疊合效果

#### 尚未解決的風險
目前建議尚未實作與視覺驗證。fake camera 色彩單一，未來即使 CDP 通過，也仍需真實手機或真實照片背景判斷筆觸色彩是否自然。

#### 使用者回饋或修正
使用者目前要求先提出適合的演算法或邏輯，尚未指定要開始修改程式。

#### 建議的下一步
請使用者選擇偏好的上色策略：偏水彩暈染、偏 marker 乾筆、或偏真實蝶翼放射色帶。確認後再調整 `drawRoughWingColor()` 並執行視覺驗證。

---

### 2026-05-10 — 嘗試 Rough Wing 鮮艷乾筆上色

#### 日期
2026-05-10

#### 任務摘要
依使用者要求嘗試讓 `drawRoughWingColor()` 的 rough wing 上色更鮮艷，同時避免使用太多 watercolor 暈染造成目標手機裝置效能負擔。

#### 使用者需求
使用者希望 rough wing 顏色可以更鮮艷，但擔心使用太多暈染會讓目標裝置跑不動或變慢。使用者指示「試試看」。

#### 實作前理解
前次版本已使用根部放射式筆觸，但 fake camera 測試中水彩 wedge 容易偏白、偏發光。`docs/llms.txt` 指出 `brush.fillBleed()` 與 `fillTexture()` 可做 watercolor 效果，但這類 fill 模擬相對昂貴；若要顧及手機效能，應減少暈染與 texture，把主要色彩交給較少量的 stroke。

#### 實作方案
降低 `washCount`、`fillBleed()`、`fillTexture()` 與 wash alpha，減少 watercolor 成本。主色改用 `markerBrush` 而不是 image-based `marker1`，避免白霧感並降低對 image brush 的依賴。為了讓 fake camera 單色背景也能看出鮮艷色彩，`tintRoughWingBrushColor()` 改成產生較大幅度的色相偏移，並用手寫 HSB-to-RGB 轉換直接輸出 CSS RGB 顏料。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/llms.txt`
- `docs/visual-test-log.md`
- `sketch.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`

#### 修改過的檔案
- `sketch.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
最終選擇「鮮艷乾筆放射」而不是增加 watercolor 暈染。`markerBrush` opacity 從 1 提高到 32，讓現有 p5.brush marker 型態可以真的承擔色彩。`marker1` 曾一度提高 opacity，但最終主上色不再使用 `marker1`，因此已收回原值，避免留下不必要的全域 brush 行為變化。

#### 遇到的問題
前幾輪只提高 saturation、alpha 或 `marker1` opacity 時，fake camera 截圖仍偏白或偏灰；改用 `default` brush 時顏色出來但變成顆粒噴濺；改用高 opacity `markerBrush` 時顏色過厚、蓋掉翅脈。最後確認 `colorToBrushPaint()` 直接讀 `p5.Color.levels` 在目前 HSB 流程下不夠可靠，因此改用明確的 CSS RGB 顏料輸出。

#### 嘗試過的解法
嘗試降低 wash、提高 marker alpha、提高 image brush opacity、加入大幅 hue shift、改用 `default` brush、改用 `markerBrush`，並多次跑 CDP 測試截圖觀察。最後保留 `markerBrush`，但把 opacity 與 strokeWeight 收斂到較輕的範圍。

#### 最終解法
`drawRoughWingColor()` 現在只產生 0 到 1 層極淡 wash，並將 marker stroke 數量降到 12 到 17 條。主筆觸使用 `markerBrush`，strokeWeight 降到 3.8 到 7.2，筆刷 weight multiplier 降到 0.32 到 0.5。`tintRoughWingBrushColor()` 改為輸出 `roughPaintColor`，並新增 `hsbToRgb()`，確保 p5.brush 收到明確 CSS RGB 色彩。`drawRadialWingWash()` 的 alpha、bleed 與 texture 也大幅降低。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-wing-vivid-balanced-final-2026-05-10/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次已知狀況一致，未阻止流程
- 預期畫面：rough wing 色彩更鮮艷，但不依賴大量暈染；翅脈仍可讀；Result Save / Back 不回歸失敗
- 實際觀察：portrait / compact 完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，Back 回到 `SCANNING` 且清空 Result data。Result 截圖出現明顯紅、紫、藍綠與黃褐色筆觸，色彩比前版更鮮艷，但 fake camera 仍不能代表真實照片下的自然度
- 手機 / AR 後續確認事項：真實手機相機、自然照片色彩、鮮艷色相是否突兀、手機效能與觸控流暢度仍需人工確認

#### 尚未解決的風險
fake camera 單色綠背景無法可靠評估真實照片中的色彩自然度。新的 `markerBrush` 色塊在截圖中仍偏大塊，實機上可能需要再降低 opacity、strokeWeight 或改回較接近照片色的 hue shift。landscape Start page 按鈕不可見與 console 404 仍是既有風險。

#### 使用者回饋或修正
使用者指出想要顏色更鮮艷，但也擔心暈染過多導致目標裝置效能不佳。本次已依此方向降低暈染、提高乾筆色彩。

#### 建議的下一步
用真實手機拍攝多色自然背景測試 rough wing，如果色彩過度突兀，優先縮小 hue shift；如果仍太厚，優先降低 `markerBrush` opacity 或 strokeWeight，而不是恢復大量 watercolor fill。

---

### 2026-05-10 — 分析參考程式的小筆觸上色策略

#### 日期
2026-05-10

#### 任務摘要
閱讀使用者提供的下載檔案 `C:\Users\ja120\Downloads\新文字文件.txt`，分析其以粒子與 noise flow 累積小筆觸的繪圖方式，並對照目前 `drawRoughWingColor()` 可如何改成一幀完成的手繪上色。

#### 使用者需求
使用者想換一個方式繪製 rough wing 上色，參考找到的程式。該程式使用多段小筆觸完成畫面，但使用者不想做成動畫，而是希望一幀就看到結果；挑選顏色方式也希望可以從專案原有方式延伸修改。

#### 實作前理解
參考程式以 `Particle` 為單位，每個粒子從圖片座標取色，使用 `noise(pos.x / 400, pos.y / 400) * TAU` 決定移動方向，並在生命週期中反覆畫小圓。它靠多輪粒子與逐漸變小的筆觸尺寸累積出印象派筆觸。FlutterLens 不需要動畫累積，因此可把粒子的生命週期在單次函式呼叫中跑完，直接畫出多段短 stroke 或小橢圓筆觸。

#### 實作方案
本次只提出設計方案，不修改功能程式碼。建議以翅膀 root-to-edge 放射方向作為主流場，加入少量 noise flow 偏移，產生很多短小 stroke。每個 stroke 的起點在翅膀內部或邊界附近取樣，顏色從現有 `getRoughWingMarkerColor()` 延伸，依局部 progress、照片色、原本 `color1/color2` 與輕微 hue shift 取得，而不是完全照參考程式從外部圖片取色。

#### 檢視過的檔案
- `C:\Users\ja120\Downloads\新文字文件.txt`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `docs/codex-worklog.md`

#### 決策紀錄
不直接照搬參考程式的動畫 loop，也不把圖片取色機制搬進 rough wing。更適合本專案的是「一次性粒子模擬」：在 `drawRoughWingColor()` 內建立固定數量的小筆觸，每條筆觸只走 2 到 5 個短步，並以 p5.brush 或 p5 shape 畫出結果。

#### 遇到的問題
參考程式在 1920x1920 canvas 上以動畫逐幀累積，粒子數與生命週期都偏大；若原樣搬到手機 AR Result page，可能會造成明顯效能負擔。且參考程式取色來源是靜態 image，本專案 rough wing 色彩來源是拍照後的 `color1/color2` 與昆蟲生成參數，兩者資料流不同。

#### 嘗試過的解法
將參考程式拆解為粒子初始化、取色、noise flow 移動、生命週期畫點四個概念，再重新對應到 FlutterLens：粒子初始化改成翅膀 outline 內取樣；取色改成沿用 `getRoughWingMarkerColor()` 與照片色；noise flow 改成 root-to-edge 方向加 jitter；生命週期改成單次函式內的短步模擬。

#### 最終解法
提出一幀式小筆觸演算法：先產生多個 brush particles，依翅膀進度取得顏色與方向，每個 particle 立刻跑完短生命週期並畫出 2 到 5 段小筆觸。筆觸數量應控制在手機可承受範圍，例如每側翅膀 80 到 160 條短 stroke，而不是上千粒子乘以 100 幀。

#### 視覺驗證紀錄
- 測試環境：未執行瀏覽器測試
- 瀏覽器：未執行
- 裝置 / viewport：未執行
- 是否有截圖：無
- Console 錯誤：未檢查
- 預期畫面：本次為演算法分析，尚未改變視覺結果
- 實際觀察：未產生新畫面
- 手機 / AR 後續確認事項：若後續實作，需使用 CDP 測試 Result page，並以真實手機確認短筆觸數量對效能的影響

#### 尚未解決的風險
短筆觸數量、p5.brush stroke 成本與真實手機效能仍需測試。若用 p5.brush 畫太多短線，可能仍比少量 marker strokes 慢；可準備降級方案，用 p5 的 `ellipse()` 或 `line()` 畫低成本色點。

#### 使用者回饋或修正
使用者明確表示不需要動畫逐幀跑，希望一幀完成；並希望挑色方式從原專案既有方式延伸。

#### 建議的下一步
請使用者確認是否採用「一次性粒子短筆觸」方案。若確認，下一步可將 `drawRoughWingColor()` 改為小筆觸生成器，保留現有 Voronoi 翅脈與輪廓流程，並重跑 CDP 視覺測試。

---

### 2026-05-10 — 實作 Rough Wing 一幀式小筆觸粒子上色

#### 日期
2026-05-10

#### 任務摘要
將 `drawRoughWingColor()` 從少量大段放射筆觸改為一幀式小筆觸粒子上色，參考使用者提供的粒子 flow 程式，但不使用動畫逐幀累積。

#### 使用者需求
使用者確認「試試看」，希望把參考程式中多段小筆觸的精神用在 rough wing 上色，但結果要一幀完成；顏色挑選則從專案原有的 `color1/color2` 與 `fillType` 邏輯延伸。

#### 實作前理解
原本最新版本使用 `markerBrush` 畫 12 到 17 條較大的放射筆觸，顏色鮮艷但容易形成大色塊。參考程式則以粒子生命週期逐幀畫小圓，累積成印象派質感。FlutterLens 的 Result page 不適合等待動畫累積，因此需要在 `drawRoughWingColor()` 單次呼叫中直接完成短筆觸模擬。

#### 實作方案
保留現有翅膀輪廓、Voronoi 翅脈與 root-to-edge 結構，只替換上色層。新增 `drawRoughWingParticleStrokes()`，分兩層產生約 82 到 118 條短筆觸。每條筆觸先在翅膀內或邊緣附近取樣起點，再以 root-to-point 的放射方向為主，加入 noise flow 與 fan bend，立即跑完 1 到 4 個短步並用 `markerBrush` 畫出。

#### 檢視過的檔案
- `C:\Users\ja120\Downloads\新文字文件.txt`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `sketch.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
沒有新增依賴，也沒有改 `sketch.js` 的 brush 定義。繼續使用既有 `markerBrush`，但每條筆觸的 brush weight 與 strokeWeight 都比上一版小。顏色不再使用大幅極端 hue shift 作為主體，而是新增 `tintRoughWingParticleColor()`：多數筆觸只做較小色相偏移，少數筆觸作為 accent 色。

#### 遇到的問題
若直接用大量 p5.brush 短線可能造成手機效能負擔，因此本次控制每側翅膀約 82 到 118 條短筆觸，且每條只有 1 到 4 個短步。CDP fake camera 可確認畫面與流程，但仍不能評估真實手機生成時間。

#### 嘗試過的解法
先將 `drawRoughWingColor()` 的大段 marker stroke loop 移除，改為 `drawRoughWingParticleStrokes()`。新增粒子取樣、progress 推估、短筆觸生成與粒子顏色函式。也修正 `colorToBrushPaint()` 對 `roughPaintColor` 的 alpha 處理，讓 wash 傳入的低 alpha 不會被顏料物件的 alpha 覆蓋。

#### 最終解法
`drawRoughWingColor()` 現在只保留 0 到 1 層極淡 wash，主要上色由 `drawRoughWingParticleStrokes()` 完成。新增 helper：`sampleRoughWingParticleStart()`、`getRoughWingParticleProgress()`、`makeRoughWingParticleStroke()`、`tintRoughWingParticleColor()`。筆觸方向為根部放射加 noise flow，顏色由原本 `getRoughWingMarkerColor()` 延伸。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-wing-particle-strokes-2026-05-10/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次已知狀況一致，未阻止流程
- 預期畫面：rough wing 上色由多段短筆觸累積，一幀完成，不依賴動畫；翅脈仍可讀；Result Save / Back 不回歸失敗
- 實際觀察：portrait / compact 完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，大小 52,836 bytes；Back 回到 `SCANNING` 且清空 Result data。Result 截圖顯示短筆觸感比上一版大色塊自然，翅脈仍可讀
- 手機 / AR 後續確認事項：真實手機相機、生成時間、觸控流暢度、真實照片下的色彩自然度仍需人工確認

#### 尚未解決的風險
p5.brush 短筆觸數量比上一版多，雖然每條都較短較細，但實際手機效能仍需測。若卡頓，建議先降低 layer count，或考慮用 p5 native `line()` / `ellipse()` 畫低成本筆觸。landscape Start page 按鈕不可見與 console 404 仍是既有風險。

#### 使用者回饋或修正
使用者確認要嘗試參考程式的多段小筆觸方向，並提醒不需要動畫逐幀累積。

#### 建議的下一步
請使用者檢視 `rough-wing-particle-strokes-2026-05-10` 的 Result 截圖。如果方向正確，下一步應以真實手機拍攝自然背景測試生成速度與色彩；若筆觸仍太密或太碎，可降低第二層 count 或拉長單筆 stroke。

---

### 2026-05-10 — 收斂 Rough Wing 小筆觸為主色漸變與輪廓內填色

#### 日期
2026-05-10

#### 任務摘要
依使用者回饋，將 rough wing 小筆觸上色收斂為只使用第一主色與第二主色之間的漸變，限制筆觸在翅膀範圍內，並在考慮效能的前提下提高填滿感。

#### 使用者需求
使用者希望顏色只使用第一主色和第二主色之間的漸變；由於這種多段小筆觸畫法看起來應該待在翅膀內，因此希望限制不要出界；同時希望筆觸可以加粗或更填滿，但仍需考慮目標裝置效能。

#### 實作前理解
前一版已將上色改為一幀式小筆觸粒子，但包含少量 accent hue，且點位允許靠近或略超出 outline。這次需要移除額外跳色，改用穩定的主色漸變，並避免 `brush.fillBleed()` 造成出界。

#### 實作方案
移除 watercolor wash 與 accent 色彩。新增 `getRoughWingGradientColor()`，以粒子 `progress` 在 `color1` 與 `color2` 間取樣，只做小幅 saturation / brightness 調整，不改 hue family。新增 `keepRoughParticlePointInsideWing()`，將 stroke 的每個點位推回翅膀內側並避開輪廓邊緣。填滿感透過小幅增加 count、alpha、brushWeight 與 strokeWeight 完成，而不是大幅增加粒子數。

#### 檢視過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
為了避免出界，本次關閉 wash，而非使用更低的 bleed。真正 polygon mask clipping 目前沒有導入，因 p5.brush 筆刷寬度仍可能跨出中心線；本次採用較低成本的中心線內縮策略，將粒子點位推入輪廓內側。

#### 遇到的問題
fake camera 的第一主色與第二主色都偏綠，因此自動截圖無法展示真實照片下的雙主色漸變差異。此問題不代表邏輯沒有使用漸變，而是測試素材色彩單一。

#### 嘗試過的解法
先將 accent 色與 wash 移除，再觀察 CDP 截圖發現填滿感偏薄；第二輪提高兩層粒子的 alpha、brushWeight、strokeWeight，並只小幅增加 count，避免效能成本過大。

#### 最終解法
`drawRoughWingParticleStrokes()` 現在使用兩層粒子：第一層約 50 到 63 條較粗筆觸，第二層約 60 到 77 條補色筆觸。`getRoughWingGradientColor()` 只混合 `color1` / `color2`，`keepRoughParticlePointInsideWing()` 負責把取樣點與短筆觸點位限制在翅膀內側。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-wing-contained-gradient-filled-2026-05-10/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次已知狀況一致，未阻止流程
- 預期畫面：rough wing 上色只使用第一與第二主色間的漸變，筆觸在翅膀內，填滿感比前版提高
- 實際觀察：portrait / compact 完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，大小 64,227 bytes；Back 回到 `SCANNING` 且清空 Result data。Result 截圖顯示筆觸更厚且沒有明顯出界；fake camera 下主要呈現綠色系
- 手機 / AR 後續確認事項：真實手機相機、雙主色漸變效果、筆觸是否在高 DPR 下仍不溢出、生成速度與觸控流暢度仍需人工確認

#### 尚未解決的風險
目前是用中心線內縮控制出界，並非真正對 p5.brush stroke 做 polygon mask clipping；若筆刷很粗或手機 DPR 很高，邊緣仍可能有少量可見外溢。筆觸數量與粗度增加後，手機效能需實機驗證。

#### 使用者回饋或修正
使用者要求顏色回到第一主色與第二主色之間的漸變，並限制筆觸在翅膀範圍內，同時提高填滿感但注意效能。

#### 建議的下一步
用真實手機和多色背景測試雙主色漸變是否自然。若仍不夠滿，優先略增 brushWeight；若手機卡頓，優先降低第二層 count 或改用低成本 p5 native 筆觸。

---

### 2026-05-11 — 為 Rough Wing 加入雙主色關係判斷、裝飾色與 NMM 高光

#### 日期
2026-05-11

#### 任務摘要
依使用者提出的兩個方向，調整 `drawRoughWingColor()`：加入類 NMM 的亮暗高光層，並用第一主色與第二主色的個別屬性與差異分數決定是否需要額外裝飾色。

#### 使用者需求
使用者希望讓 `RoughInsectWings.js` 的 `drawRoughWingColor()` 生成結果更具視覺吸引力。提出兩個方向：一是蝴蝶翅膀可能有金屬反射感，可用 NMM 上色技法，以多層高光模擬金屬光澤；二是根據第一與第二主色的彩度、明度與色相來決定額外裝飾色。使用者也提醒：不能只取兩色平均，因為兩個主色差異大時本身可能已足夠明顯，平均值反而會造成誤判。

#### 實作前理解
目前 rough wing 已是前幾輪收斂後的版本：主上色由 `drawRoughWingParticleStrokes()` 使用兩層 `marker1` 小筆觸完成，顏色主要由 `getRoughWingGradientColor()` 在 `color1` 與 `color2` 間混合，並以 `keepRoughParticlePointInsideWing()` 控制筆觸中心線待在翅膀輪廓內。`docs/llms.txt` 顯示本專案使用 p5.brush 的 p5 build，因此不需要 `brush.render()`；大量 `fillBleed()` / `fillTexture()` 有效能風險，較適合用少量 stroke 疊出質感。

#### 實作方案
保留既有兩層主色小筆觸，不重寫主填色。新增 `analyzeRoughWingColorPair()`，分別讀取兩個主色的 hue、saturation、brightness，計算 `hueDistance`、`saturationDistance`、`brightnessDistance` 與 `contrastScore`。若兩色已經有高色相差或高明度差，裝飾色會大幅減量；若兩色接近、偏灰或對比不足，才提高裝飾色強度。接著疊加少量 `drawRoughWingAccentStrokes()` 與 `drawRoughWingSpecularStrokes()`，用短筆觸製造裝飾色與 NMM 式暗反射 / 亮高光。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/llms.txt`
- `docs/visual-test-log.md`
- `sketch.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
採用混合方案：主色漸變作底，智慧裝飾色作節奏，NMM 高光作光澤。沒有使用兩色平均作主要判斷，而是先看兩色之間的差異；主色差異越大，accent 越少。沒有恢復 watercolor wash，避免出界與手機效能風險。新高光與裝飾色都使用既有 `marker1` 短筆觸與輪廓內縮 helper，避免新增依賴或大改筆刷設定。

#### 遇到的問題
CDP fake camera 的照片色彩高度偏綠，導致第一與第二主色在測試中也接近綠色系，因此截圖無法完整代表真實照片下「兩主色差異大」或「互補色裝飾」的效果。landscape Start page 的 Start button 仍不可見，屬於前次已知版面風險，與本次 rough wing 上色無關。

#### 嘗試過的解法
先閱讀 `AGENTS.md`、工作日誌、`docs/llms.txt` 與目前 rough wing 實作，確認前人已完成的一幀式小筆觸與輪廓內縮策略。接著只在 `drawRoughWingColor()` 後段疊加新層，並新增色彩分析與 glint helper。修改後用 `node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 檢查語法，再執行 `scripts/run-cdp-visual-test.ps1 -RunId rough-wing-accent-nmm-2026-05-11` 做視覺驗證。

#### 最終解法
`drawRoughWingColor()` 現在會先建立 `colorProfile`，再依序繪製主色粒子、裝飾色短筆觸、NMM 式暗反射與亮高光。新增 helper 包含 `analyzeRoughWingColorPair()`、`makeRoughWingColorStats()`、`getHueDistance()`、`wrapHue()`、`drawRoughWingAccentStrokes()`、`drawRoughWingSpecularStrokes()`、`drawRoughWingGlintStroke()`。裝飾色強度由 `contrastScore` 控制，避免在兩主色本來就強烈時過度加色。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-wing-accent-nmm-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次已知狀況一致，未阻止流程
- 預期畫面：rough wing 保留主色漸變與輪廓內小筆觸，並新增少量裝飾色與亮暗高光；翅脈仍可讀，Result Save / Back 不回歸失敗
- 實際觀察：portrait / compact 完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，大小 63,654 bytes；Back 回到 `SCANNING` 且 `backCleared=true`。Result 截圖顯示翅膀內有更細的亮暗節奏，未明顯蓋掉翅脈或外溢。fake camera 主色偏綠，無法完整判斷真實照片下的裝飾色自然度
- 手機 / AR 後續確認事項：真實手機相機、多色背景、兩主色差異大時 accent 是否足夠克制、NMM 高光是否自然、生成速度與觸控流暢度仍需人工確認

#### 尚未解決的風險
自動測試只能使用 fake camera，無法代表真實照片色彩。高光與裝飾色目前偏保守，若真實手機上仍不夠明顯，可微增 `drawRoughWingSpecularStrokes()` 的 count 或 highlight alpha；若色彩過度突兀，優先降低 `accentStrength` 上限。landscape Start page 按鈕不可見與 console 404 仍是既有風險。

#### 使用者回饋或修正
使用者接受混合方案，但指出兩主色不能只用平均判斷。本次已依此修正為先分析兩色個別屬性與差異，再決定是否需要裝飾色。

#### 建議的下一步
請使用者用真實手機拍攝多色背景測試 rough wing。特別觀察：兩主色本來差異大時是否保持乾淨；兩主色接近時裝飾色是否能增加層次；NMM 高光是否有金屬感但不蓋掉翅脈。

---

### 2026-05-11 — 參考實際蝴蝶影像加入 Rough Wing 圖案語法

#### 日期
2026-05-11

#### 任務摘要
依使用者提供的 `butterfly.jpg` 參考圖，將 rough wing 從單純筆觸與高光推進到更像蝴蝶翅膀的 pattern layer，包含深色外緣、邊緣點列、放射色帶與少量眼斑。

#### 使用者需求
使用者覺得上一輪結果不夠明顯，希望參考實際翅膀影像，學習或模仿其中的 pattern。使用者提供 `C:\Users\ja120\Downloads\butterfly.jpg`，圖中可見多種蝴蝶翅膀語法：黑色外緣、白點列、眼斑、放射色帶、翅尖深色 patch 與高對比色塊。

#### 實作前理解
上一輪已加入雙主色關係判斷、裝飾色與 NMM 高光，但視覺仍偏細微。參考圖顯示真正讓蝴蝶翅膀易辨識的不是單一高光，而是明確圖案結構。因 `drawRoughWingColor()` 在 Voronoi 翅脈之前執行，新增圖案層會被後續翅脈壓在上方，視覺上接近真實蝶翼的「底色圖案 + 翅脈線」。

#### 實作方案
新增 `drawRoughWingButterflyPattern()`，在主色粒子填色後、accent 與 specular 前執行。此函式依 `colorProfile` 與隨機 seed 選擇圖案語法：固定加入深色 rim band 與 rim spots；視主色對比加入 radial bands；主色不高對比時才加入 occasional eye spots。色彩仍延續 `analyzeRoughWingColorPair()`，新增 `rimPaint`、`spotPaint` 與 `bandPaint`，避免只靠平均值判斷。

#### 檢視過的檔案
- `C:\Users\ja120\Downloads\butterfly.jpg`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
選擇先實作最常見且辨識度高的 pattern：外緣深框與邊緣白點列。眼斑只在非高對比主色時出現，避免所有翅膀都變成同一類花紋。沒有直接複製參考圖中的任何特定蝴蝶，而是抽象成可生成的 pattern archetypes。所有圖案仍使用 p5.brush 的 `marker1` stroke 或小型 `brush.circle()`，避免新增依賴。

#### 遇到的問題
CDP fake camera 下主色仍偏綠，能檢查 pattern 是否明顯，但不能完整檢查多色真實照片下的配色自然度。portrait 截圖中昆蟲生成位置偏低，翅膀被儲存 / 返回按鈕遮住一部分；這與 Result spawn 位置或隨機生成有關，不是本次 pattern layer 直接造成，但會影響視覺評估。

#### 嘗試過的解法
先觀察參考圖，整理出外緣黑框、白點列、眼斑、放射色帶、外半部 patch 等重複語法。實作時先建立 `drawRoughWingRimBand()`、`drawRoughWingRimSpots()`、`drawRoughWingRadialBands()`、`drawRoughWingEyeSpots()`，再用 `drawRoughWingPatternDot()` 與 `drawRoughWingPatternStroke()` 統一繪製。修改後使用 `node --check` 與 CDP 視覺測試驗證。

#### 最終解法
`drawRoughWingColor()` 現在流程為：主色粒子填色 → butterfly pattern layer → 裝飾色短筆觸 → NMM 高光。`analyzeRoughWingColorPair()` 也新增 `rimPaint`、`spotPaint`、`bandPaint`。新增圖案層會固定提供深色輪廓與點列，並依主色對比選擇放射色帶與眼斑，使結果比單純 accent / highligts 更明顯。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-wing-butterfly-pattern-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次已知狀況一致，未阻止流程
- 預期畫面：rough wing 應更明顯出現實際蝴蝶翅膀常見 pattern，例如深外框、白點列、放射色帶或眼斑；翅脈仍可讀；Result Save / Back 不回歸失敗
- 實際觀察：portrait / compact 完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，大小 91,947 bytes；Back 回到 `SCANNING` 且 `backCleared=true`。compact Result 截圖可清楚看到深色外緣與白點列，辨識度比上一輪提高。portrait Result 中昆蟲位置偏低，被按鈕遮住部分翅膀，需後續另評估 spawn 位置
- 手機 / AR 後續確認事項：真實手機相機、多色背景、pattern 強度、按鈕遮擋、生成時間與觸控流暢度仍需人工確認

#### 尚未解決的風險
新增 pattern layer 讓 PNG 大小從上一輪約 63KB 增加到約 92KB，表示畫面資訊與筆觸數增加，手機效能需實測。黑框與白點列在 fake camera 下非常明顯，真實照片上可能需要依背景調整 alpha 或 count。portrait spawn 位置偏低造成按鈕遮擋，可能需要未來修正 Result page 的生成位置限制。

#### 使用者回饋或修正
使用者指出上一版不夠明顯，並提供實際蝴蝶影像作為 pattern 參考。本次已依參考圖抽象出 pattern archetypes 並實作。

#### 建議的下一步
請使用者檢視 `rough-wing-butterfly-pattern-2026-05-11` 截圖。如果方向正確，下一步建議用真實手機拍攝多色背景測試；若覺得黑框太重，可降低 `drawRoughWingRimBand()` 的 `strokeWeight` 或 alpha；若希望更像孔雀蝶，可提高 `drawRoughWingEyeSpots()` 出現率。

---

### 2026-05-11 — 收斂 Rough Wing Pattern 為乾淨內縮版本

#### 日期
2026-05-11

#### 任務摘要
依使用者回饋，將上一版過於明顯且髒的蝴蝶圖案層收斂為較乾淨、低透明、內縮的版本，降低深色筆觸、外溢與髒邊問題。

#### 使用者需求
使用者指出上一版雖然效果明顯，但視覺上不好看：過於明顯的筆觸、明顯出界、很深的顏色讓畫面看起來很髒。使用者同意改為 clean pattern 方向：弱化深外框、縮小點列、讓圖案更內縮且更淡。

#### 實作前理解
上一版髒感主要來自 `rimPaint` 太接近黑色且 alpha 高、`drawRoughWingRimBand()` 連續閉合畫兩層粗線、邊緣白點帶深色 ring、以及 pattern 點位太靠近輪廓。p5.brush 筆刷有寬度，即使中心線在輪廓內，視覺上仍可能外溢。

#### 實作方案
保留 pattern layer 的結構，但全面收斂參數：降低 `rimPaint` 明暗對比與 alpha；`drawRoughWingRimBand()` 改為單層、不閉合、低透明、較細且更內縮的斷續線；`drawRoughWingRimSpots()` 減少數量、縮小半徑、移除深色 ring 並更內縮；`drawRoughWingRadialBands()` 減少數量、降低 alpha、縮小 strokeWeight 並把外緣端點往內縮；眼斑降為低機率且更小。

#### 檢視過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
不移除 pattern layer，因它提供蝴蝶辨識度；但將「黑框白點」從主視覺改成背景性的淡紋理。重點從「明顯」改為「乾淨且不出界」。目前不引入真正 polygon clipping，仍使用內縮點位與降低筆刷粗度來控制外溢。

#### 遇到的問題
fake camera 仍使主色偏綠，對真實照片下的配色自然度判斷有限。compact 截圖中 Result 昆蟲仍可能被儲存 / 返回按鈕遮住，這是既有 Result spawn 位置風險，與本次 clean pattern 參數收斂無直接關係。

#### 嘗試過的解法
先定位髒感來源，再用小範圍 patch 調整 color profile 與 pattern drawing 參數。使用 `node --check` 檢查語法，並執行 `scripts/run-cdp-visual-test.ps1 -RunId rough-wing-clean-pattern-2026-05-11` 驗證 Result 流程與截圖。

#### 最終解法
`rimPaint` 由高 alpha 深黑改為較低明度但不接近黑的主色暗版，alpha 降到 132；`spotPaint` alpha 降到 168 且不再純白；`bandPaint` alpha 降低。rim band 改為單層斷續線，strokeWeight 降至約 1.15 到 2.05，內縮約 0.62 到 0.92 `insectBaseUnit`。白點列變少、變小、無深色外圈，色帶與眼斑也更小、更淡、更內縮。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-wing-clean-pattern-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次已知狀況一致，未阻止流程
- 預期畫面：pattern 保留蝴蝶語法但不再以深黑髒邊和大白點為主；筆觸更淡、更內縮，外溢減少；Result Save / Back 不回歸失敗
- 實際觀察：portrait / compact 完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，大小 76,871 bytes；Back 回到 `SCANNING` 且 `backCleared=true`。截圖中黑色髒邊與大白點明顯退掉，畫面較乾淨；pattern 變成較淡的蝶翼紋理。compact 仍有按鈕遮擋昆蟲的既有問題
- 手機 / AR 後續確認事項：真實手機、多色背景、clean pattern 是否太淡、Result spawn 安全區域與效能仍需人工確認

#### 尚未解決的風險
目前仍沒有真正 mask clipping，若手機高 DPR 或特定 seed 產生較寬筆觸，仍可能有少量出界。clean pattern 比上一版乾淨但辨識度下降，需要使用者判斷是否達到想要的平衡。按鈕遮擋昆蟲的問題仍建議另開任務處理。

#### 使用者回饋或修正
使用者指出上一版過髒、過黑、筆觸與出界太明顯。本次依此將 pattern 收斂為低透明、內縮、無深色 ring 的版本。

後續使用者補充回饋：clean pattern 版中，白點的點綴效果很好，之後或許可以從白點這個方向發展；但放射色帶看起來有點怪。使用者推測問題不只是筆觸強弱，而是放射色帶的位置過於隨機，且左右翅膀不對稱，導致整體 pattern 缺乏像真實蝴蝶那樣的結構一致性。

#### 建議的下一步
請使用者比較 `rough-wing-butterfly-pattern-2026-05-11` 與 `rough-wing-clean-pattern-2026-05-11`。若 clean 版太淡，可只微增 radial band alpha，不建議恢復深色 rim band；若仍嫌髒，下一步應暫停 rim band，只保留主色粒子與少量內縮色帶。

依使用者最新回饋，下一次處理 pattern 時應優先保留並發展白點點綴，但重新設計放射色帶。建議新增類似 `createRoughWingPatternPlan()` 的事前參數計算流程：像翅膀大輪廓與 Voronoi 網格一樣，先用共同 seed 決定左右翅膀共享的額外紋理配置，例如白點數量、點列位置、放射色帶起訖 progress、色帶寬度與對稱關係；左右翅膀繪製時再各自加入手繪 jitter、筆壓與微小偏移。這樣可以保留手繪差異，但避免 pattern 結構本身左右不協調或太隨機。

---

### 2026-05-11 — CDP 視覺測試支援本機照片假相機

#### 日期
2026-05-11

#### 任務摘要
擴充 `scripts/run-cdp-visual-test.ps1`，讓 CDP 視覺測試可用 `tests/fixtures/camera/` 裡的本機照片產生 canvas fake camera stream，取代 Chrome 預設綠色 fake camera。

#### 使用者需求
使用者詢問 Chrome fake camera 永遠是綠色時，如何確認不同背景下的視覺效果。經討論後同意採用 CDP 注入 mock `getUserMedia()` 的方案，並已在 `tests/fixtures/camera/` 放入五張不同大小照片：`cementWall.jpg`、`colorfulToys.jpg`、`darkWood.jpg`、`greenPlants.jpg`、`streets.jpg`。使用者也已在 `.gitignore` 新增 `tests/`，避免本機照片進入版本控制。

#### 實作前理解
既有 CDP 腳本能穩定操作 Start → Scanning → Result、Save / Back 與多 viewport，但使用 `--use-fake-device-for-media-stream` 時相機畫面固定偏綠，只能驗流程，無法驗真實背景對取色、rough wing、pattern 與 Result 視覺的影響。若改用 `canvas.captureStream()`，可以在不修改正式 app 的前提下，讓 app 仍透過 `navigator.mediaDevices.getUserMedia()` 取得 video stream。

#### 實作方案
保留預設 Chrome fake camera 行為；當使用 `-CameraFixture` 時，腳本改為先開 `about:blank`、透過 `Page.addScriptToEvaluateOnNewDocument` 注入 mock camera，再 `Page.navigate` 到本機頁面。mock camera 會載入指定 fixture 圖片，以 cover 方式畫到 `CameraWidth x CameraHeight` canvas，並用 `canvas.captureStream(30)` 回傳假相機影像。產物命名加入 camera label，避免不同 fixture 截圖互相覆蓋。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/cdp-visual-test-workflow.md`
- `docs/visual-test-log.md`
- `scripts/run-cdp-visual-test.ps1`
- `.gitignore`
- `tests/fixtures/camera/` 中的五張 fixture 圖片清單與尺寸

#### 修改過的檔案
- `scripts/run-cdp-visual-test.ps1`
- `docs/cdp-visual-test-workflow.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
選擇腳本注入 mock camera，而不是把測試模式寫進正式 app，避免 production code 因測試 fixture 增加分支。預設仍保留原本 Chrome fake camera，讓舊流程可用；指定 `-CameraFixture` 才進入 canvas fixture camera。camera stream 解析度與 browser viewport 分開設定，因真實手機上相機影像尺寸與螢幕 viewport 本來就不同。

#### 遇到的問題
需要確保注入發生在 app 呼叫 `getUserMedia()` 前，因此不能直接讓 Chrome 啟動到首頁；腳本改為先開 `about:blank`，建立 CDP 連線並注入，再導向首頁。fixture 圖片在本機 server 下提供，必須確認路徑位於專案根目錄內。landscape Start button 不可見的既有問題仍存在。

#### 嘗試過的解法
先檢查 fixture 檔案與 `.gitignore`，確認五張圖片都在 `tests/fixtures/camera/`，尺寸皆為直式高解析。接著用 PowerShell parser 檢查腳本語法，再執行 `.\scripts\run-cdp-visual-test.ps1 -RunId cdp-fixture-greenPlants-2026-05-11 -CameraFixture greenPlants -CameraWidth 720 -CameraHeight 1280` 驗證完整流程。

#### 最終解法
腳本新增 `-CameraFixture`、`-CameraFixtureDir`、`-CameraWidth`、`-CameraHeight`。`-CameraFixture default` 使用舊的 Chrome fake camera；指定檔名或 basename 時使用 canvas fixture camera；指定 `all` 時會依檔名排序跑資料夾內的 `jpg`、`jpeg`、`png`、`webp`。截圖命名改為 `<runId>-<cameraLabel>-<viewportLabel>-<stage>.png`，下載路徑改為 `downloads/<cameraLabel>/<viewportLabel>/FlutterLens-result.png`。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Camera fixture：`greenPlants.jpg`，mock camera canvas `720x1280`
- 是否有截圖：有，集中於 `docs/cdp-runs/cdp-fixture-greenPlants-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程
- 預期畫面：Scanning / Result 背景應為植物照片，不再是預設綠色 fake camera
- 實際觀察：portrait / compact 完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，大小 772,584 bytes；Back 回到 `SCANNING` 且 `backCleared=true`。截圖確認 Scanning 與 Result 背景為 `greenPlants.jpg`。landscape 仍停在 `START`，`startVisible=false`
- 手機 / AR 後續確認事項：真實手機相機、後鏡頭曝光 / 對焦、權限流程、DeviceOrientation、觸控手感與效能仍需實機確認

#### 尚未解決的風險
canvas fixture camera 改善自動化視覺回歸，但仍不能代表真實手機鏡頭的曝光、噪訊、對焦、廣角畸變與效能。`-CameraFixture all` 尚未實際跑完整五張，若一次跑全部 fixture 與三個 viewport，測試時間會明顯增加。landscape Start page 按鈕不可見仍是既有版面風險。

#### 使用者回饋或修正
使用者同意實作方案 2，並提供五張本機測試照片與 `.gitignore` 設定。本次實作依此保留照片在本機、不納入版本控制。

#### 建議的下一步
用 `-CameraFixture all` 跑完整五張 fixture，比較 `greenPlants`、`darkWood`、`cementWall`、`colorfulToys`、`streets` 下 rough wing 與 Result UI 是否穩定。若測試時間太長，可先針對正在調整的視覺功能指定單張 fixture。後續也建議修正 landscape Start button 不可見與 Result 昆蟲可能被按鈕遮擋的既有問題。
