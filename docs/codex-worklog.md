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

---

### 2026-05-11 — 調整 Start page 直向空間分配並修正橫向按鈕不可見

#### 日期
2026-05-11

#### 任務摘要
重整 Start page responsive layout。直向不再把所有文字集中在畫面中央，改為上方標題、中段說明、下方權限提示與按鈕；短高度橫向改為左文右按鈕，修正 `landscape-844x390` 下 Start button 不可見、CDP 無法進入 Scanning 的問題。

#### 使用者需求
使用者要求接著修改橫向版面中 Start button 不可見的問題；隨後補充直向手機觀看時也覺得字全部集中在中央、周圍留了許多空間，希望一併改善空間運用。

#### 實作前理解
既有 Start page 以內容總高度置中。直向時會讓標題、說明、權限提示與按鈕形成一團集中在中央；橫向短高度時，即使已縮小字級，完整 7 行說明與 60px 按鈕總高度仍超過 runtime 高度，導致 `landscape-844x390` 的 Start button 掉出畫面，CDP summary 顯示 `startVisible=false`。

#### 實作方案
將 `drawStartPage()` 拆成兩種 layout。一般直向與較高畫面使用 `drawStartPagePortraitLayout()`，依 viewport 分區配置標題、正文與底部操作區。`width > height && height < 360` 時使用 `drawStartPageLandscapeCompact()`，顯示短版文案並改成左側文字、右側權限提示與按鈕。新增 `updateStartButtonMetrics()` 與 `drawStartButton()`，讓按鈕尺寸依 layout 調整，但保留既有 `StartButton.ButtonX/Y/Width/Height` 給互動與 CDP 測試讀取。

#### 檢視過的檔案
- `Pages/StartPage/StartPage.js`
- `Pages/StartPage/StartPageSettings.js`
- `Pages/pagesSettings.js`
- `sketch.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `Pages/StartPage/StartPage.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
沒有只把橫向按鈕硬往上推，因為使用者指出直向空間也有問題；因此改為重新整理 Start page 的 responsive layout。直向保留完整文案，橫向改用短文案，避免在 240px runtime 高度中硬塞完整說明。按鈕尺寸在橫向縮小但維持可點擊面積。

#### 遇到的問題
`drawScreenText()` 沒有文字框寬度或自動換行，因此仍需用手動換行控制中文段落。p5 runtime 在 Chrome headless `844x390` 下約為 `822x240`，可用高度比外部 window size 小很多，橫向必須採用獨立版面。

#### 嘗試過的解法
先閱讀 Start page、Start button settings、文字 helper 與點擊處理，確認 CDP 是從 `StartButton.ButtonX/Y` 讀座標，互動則用 `dist()` 判斷點擊位置。修改後使用 `node --check Pages\StartPage\StartPage.js` 檢查語法，再執行 `.\scripts\run-cdp-visual-test.ps1 -RunId start-layout-responsive-2026-05-11 -CameraFixture greenPlants -CameraWidth 720 -CameraHeight 1280` 進行視覺與互動驗證。

#### 最終解法
`drawStartPage()` 現在依 viewport 切換 layout。直向版面使用上中下分區：標題位於上方、完整說明位於中段、權限提示與啟動按鈕固定在下方操作區。橫向短版使用左側標題 / 3 行說明、右側權限提示 / 啟動按鈕。三個測試 viewport 都能讀到可見 Start button。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Camera fixture：`greenPlants.jpg`，mock camera canvas `720x1280`
- 是否有截圖：有，集中於 `docs/cdp-runs/start-layout-responsive-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程
- 預期畫面：直向不再集中成一團；橫向 Start button 可見且可點
- 實際觀察：portrait / compact Start page 呈現上方標題、中段說明、下方提示與按鈕；landscape 顯示左文右按鈕。三個 viewport 都 `startVisible=true` 並完成 `START → SCANNING → RESULT`。portrait Save 下載 `FlutterLens-result.png`，大小 771,398 bytes；Back 回到 `SCANNING` 且 `backCleared=true`
- 手機 / AR 後續確認事項：真實手機 Safari / Android Chrome 的 viewport、安全區域、字體渲染、觸控手感與權限彈窗仍需人工確認

#### 尚未解決的風險
CDP 截圖可確認目前測試 viewport，但真實手機可能因瀏覽器網址列、安全區域或系統字體造成高度差異。橫向版面使用短文案，資訊量比直向少；若使用者希望橫向也保留完整說明，需要改成可捲動或更複雜的多段布局。

#### 使用者回饋或修正
使用者同意「直向分區 + 橫向短版」方案，並指出直向中央集中問題應與橫向不可見問題一起處理。

#### 建議的下一步
請使用者在真實手機直向與橫向各載入一次 Start page，確認視覺重心與按鈕位置是否符合手感。若直向仍覺得文字偏集中，可再把正文區略往上推並降低文字行距；若橫向希望保留更多資訊，可考慮加入可捲動說明或一個簡短副標。

---

### 2026-05-11 — 測試橫向頁面搭配全部 Camera Fixtures

#### 日期
2026-05-11

#### 任務摘要
依使用者要求，測試修正後的橫向頁面搭配 `tests/fixtures/camera/` 全部照片時，是否都能進入 Scanning 與 Result，並檢視橫向 Result 視覺狀況。

#### 使用者需求
使用者詢問原有 CDP 截圖流程是否已能進入橫向 Result 與 Scanning 後，要求實際測試橫向頁面搭配 fixtures 裡的照片結果。

#### 實作前理解
前一輪已修正 Start page 橫向按鈕不可見問題，`greenPlants` 單張 fixture 在 `landscape-844x390` 可完成 `START → SCANNING → RESULT`。本次需擴大到所有 fixture，確認不是單一照片偶然成功。

#### 實作方案
執行 `.\scripts\run-cdp-visual-test.ps1 -RunId landscape-fixtures-all-2026-05-11 -CameraFixture all -CameraWidth 720 -CameraHeight 1280`。腳本會同時跑 portrait、compact 與 landscape，但本次重點檢查五張 fixture 的 `landscape-844x390` summary 與 screenshots。為方便檢視，另外將五張橫向 Result 截圖合成 `landscape-result-montage.png`。

#### 檢視過的檔案
- `scripts/run-cdp-visual-test.ps1`
- `docs/cdp-runs/landscape-fixtures-all-2026-05-11/landscape-fixtures-all-2026-05-11-summary.json`
- `docs/cdp-runs/landscape-fixtures-all-2026-05-11/landscape-fixtures-all-2026-05-11-console.json`
- `docs/cdp-runs/landscape-fixtures-all-2026-05-11/screenshots/`

#### 修改過的檔案
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
本次不修改功能程式碼，只用現有 CDP fixture camera 流程驗證橫向結果。雖然使用者只問橫向，腳本目前沒有 viewport filter，因此以 `-CameraFixture all` 跑完整矩陣，再聚焦判讀 landscape rows。

#### 遇到的問題
第一次合成 montage 時 PowerShell `System.Drawing.Bitmap` 建構子參數寫法不正確，產生 overload 錯誤；CDP 測試本身已完成且不受影響。修正合成圖建立方式後成功產出 montage。每個 viewport 仍有一筆已知 404 resource event。

#### 嘗試過的解法
先直接跑完整 fixture 矩陣，再用 PowerShell / System.Drawing 讀取 `*-landscape-844x390-result.png` 合成垂直對照圖。修正 Bitmap 建構方式後產出 `docs/cdp-runs/landscape-fixtures-all-2026-05-11/landscape-result-montage.png`。

#### 最終解法
五張 fixture 的橫向測試全部通過 `START → SCANNING → RESULT`，包含 `cementWall`、`colorfulToys`、`darkWood`、`greenPlants`、`streets`。summary 中五個 landscape case 均為 `startVisible=true`、`videoReady=true`、`hasResultPhoto=true`。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`landscape-844x390` runtime 約 `822x240`
- Camera fixtures：`cementWall`、`colorfulToys`、`darkWood`、`greenPlants`、`streets`
- 是否有截圖：有，集中於 `docs/cdp-runs/landscape-fixtures-all-2026-05-11/screenshots/`，另有 `landscape-result-montage.png`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程
- 預期畫面：所有 fixture 在橫向都能完成 Scanning 與 Result 截圖
- 實際觀察：所有 fixture 橫向流程成功。Result 截圖顯示背景照片與昆蟲都有出現，但 Save / Back 按鈕在橫向短高度中位於畫面中央偏上，部分結果與昆蟲或主視覺區域重疊
- 手機 / AR 後續確認事項：真實手機橫向 Result page 的按鈕安全區、昆蟲生成位置與觸控手感仍需人工確認

#### 尚未解決的風險
橫向 Start page 已可用，但 Result page 橫向 layout 仍有按鈕遮擋或與昆蟲重疊的風險。若要改善，下一步可針對 Result page 橫向模式重新安排 Save / Back 操作區與昆蟲 spawn safe area。

#### 使用者回饋或修正
使用者要求實際測試橫向頁面搭配 fixtures 裡照片的結果。本次已完成所有 fixture 橫向驗證。

#### 建議的下一步
優先處理 Result page 橫向模式：將 Save / Back 移到右側或底部安全區，並讓昆蟲生成位置避開按鈕區域。之後再用同一個 `landscape-fixtures-all` 矩陣回歸測試。

---

### 2026-05-11 — 為 Rough Butterfly 加入極簡符號式身體

#### 日期
2026-05-11

#### 任務摘要
為 `drawRoughInsect()` 中的 `insectType === 0` 加入新的 rough butterfly body。新身體不沿用 `drawInsectBody()` 的寫實頭、胸、腹，而是用細長弧線、短線 / 小點與柔軟觸角暗示蝴蝶身體，並讓 rough wings 依身體參照點定位。

#### 使用者需求
使用者希望開始為 `drawRoughInsect()` 加上身體繪製，但邏輯不同於 `drawInsect()`。風格需接近參考圖：極簡線條式、符號化、輕盈、飄逸、有裝飾感。身體是一條細直線或微彎弧線，從兩片翅膀交會處往下延伸；中間可用小點或短線表示頭部 / 胸部；觸角用兩條柔軟外彎細線，自然收尾，不必畫圓。使用者確認本階段先只針對 `insectType === 0`。

#### 實作前理解
`drawInsect()` 會依昆蟲類型安排寫實 body 與 wings；`drawRoughInsect()` 目前只畫 rough wings，body 呼叫被註解。`drawRoughInsectWings()` 原本固定以 `0.5 * insectBaseUnit` 作為 wing pair 的 y offset，左右 wing root 使用全域 `bodyHalfWidth`。若未先建立 body anchor，未來要支援不同角度或更清楚的身體 / 翅膀比例會比較困難。

#### 實作方案
新增 `RoughInsectBody.js`，提供 `createRoughInsectBodyPlan()` 與 `drawRoughInsectBody()`。`drawRoughInsect()` 在 `insectType === 0` 時先建立 body plan，再把 `wingRootY` 與 `wingRootHalfWidth` 傳給 `drawRoughInsectWings()`。身體繪製順序放在 wings 之後，讓細線 body 與 antenna 能壓在翅膀交會處上方。其他 `insectType` 暫時維持只有 rough wings。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `index.html`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/InsectBody.js`
- `Pages/ResultPage/InsectGenerator/InsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`

#### 修改過的檔案
- `index.html`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
本次沒有修改 `drawInsectBody()`，避免寫實 body 與 rough body 的視覺語彙混在一起。body plan 先只支援 `insectType === 0`，但資料結構保留 `wingRootY`、`wingRootHalfWidth`、`headY`、`bottomY`、`curveX`，之後可擴充不同角度與姿態。`drawRoughInsectWings()` 保留既有預設值，沒有 body plan 時仍使用原本的 rough wing 位置。

#### 遇到的問題
第一次視覺驗證時，主身體線條太厚，畫面讀起來像紅色柱狀筆畫，不符合「幾筆細長弧線」與輕盈感。橫向 Result page 仍有既有風險：Save / Back 按鈕在短高度 landscape 中會遮擋或壓近昆蟲。

#### 嘗試過的解法
先新增 body plan 與 rough body 線條，再執行 `node --check` 與 CDP 視覺驗證。看到第一版主軸過厚後，將 body axis 與 antenna 的 stroke weight 大幅降低，小點與短線也同步收細，再重新跑 CDP。

#### 最終解法
`RoughInsectBody.js` 會為 butterfly 產生一組穩定 body plan，包含翅膀交會點、細長 body 主軸、頭部小點、胸部短線與兩條自然外彎觸角。`drawRoughInsect()` 只在 `insectType === 0` 傳入此 plan 並繪製 body；其他 rough insect 類型不變。`RoughInsectWings.js` 接受可選 body plan，讓 wing pair 根據 `wingRootY` 與 `wingRootHalfWidth` 定位。

#### 視覺驗證紀錄
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Camera fixture：`greenPlants.jpg`，mock camera canvas `720x1280`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-butterfly-body-thin-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JS exception
- 預期畫面：`insectType === 0` 的 rough butterfly 應在翅膀交會處出現細長符號式 body 與柔軟觸角，body 不應變成寫實頭胸腹或厚重主體
- 實際觀察：portrait / compact / landscape 均完成 `START → SCANNING → RESULT`。第二輪收細後，portrait Result 中 body 主軸變成細線，觸角自然外彎並壓在 wing root 上方，整體比第一版輕。portrait Save 下載 `FlutterLens-result.png`，大小 775,803 bytes；Back 回到 `SCANNING` 且 `backCleared=true`
- 手機 / AR 後續確認事項：真實手機相機、不同背景、不同 seed 下 body 是否太淡或被 wing pattern 吃掉仍需人工確認

#### 尚未解決的風險
目前 CDP 測到的 seed 顯示 body 位置可接受，但不同隨機翅膀尺寸與背景亮度下，細 body 可能過淡或與 pattern 混在一起。橫向 Result page 的按鈕遮擋昆蟲仍是既有問題，本次未處理。未來若要做不同角度，body plan 需要加入 pose / side view 資訊，並讓 wings 根據該姿態改變根部與旋轉比例。

#### 使用者回饋或修正
使用者確認本階段先針對 `insectType === 0` 實作 rough butterfly body，其他類型暫不處理。

#### 建議的下一步
請使用者檢視 `docs/cdp-runs/rough-butterfly-body-thin-2026-05-11/screenshots/rough-butterfly-body-thin-2026-05-11-greenPlants-portrait-390x844-result.png` 的 body 線條感。如果方向正確，下一步可用 `-CameraFixture all` 跑全部照片，確認深色 / 淺色背景下 body 的可讀性；若覺得 body 太淡，可只微增 alpha，不建議回到第一版的厚主軸。

---

### 2026-05-11 — 新增視覺截圖後的審美自評流程

#### 日期
2026-05-11

#### 任務摘要
將使用者提出的「截圖測試後需進行審美判斷」納入專案協作流程，補充到 `AGENTS.md`，並記錄本次 rough butterfly body 的使用者審美回饋。

#### 使用者需求
使用者確認前一版 rough butterfly body 功能上確實有畫出身體，也符合「比較抽象的線條符號」描述，但視覺上並不吸引人。使用者希望在工作流程內加入新機制：完成截圖測試後，Codex 不只確認畫面是否正確呈現，也要自己進行審美判斷，可以主動修正調整，或是評分並給予評語；使用者也會給出評分及評語，這些內容都要記錄進工作日誌，讓專案逐漸形成美學共識。

#### 實作前理解
既有流程強調語法檢查、CDP 截圖、console、viewport 與功能流程，但對「視覺是否真的好看」的要求不夠明確。前一輪 rough butterfly body 正是典型例子：功能與描述皆通過，但結果缺少吸引力；若只記錄「已出現、已通過」，未來 agent 會難以理解使用者真正的視覺標準。

#### 實作方案
在 `AGENTS.md` 新增 `Aesthetic review requirements`，要求截圖或視覺檢查後必須包含審美分數、優點、弱點、是否自行調整、若未調整則說明原因，以及下一步需要的使用者回饋。同步補充 worklog 與 visual test log 應記錄 Codex 審美自評與使用者審美回饋。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`

#### 決策紀錄
將審美自評放入 `AGENTS.md`，使它成為未來 agent 必須遵守的固定流程，而不是只存在於某次對話。使用 `1–10` 分數作為建議量尺，但重點不是分數本身，而是留下具體評語、修正判斷與使用者回饋。

#### 遇到的問題
本次沒有重新修改 rough butterfly body 視覺本身，因使用者的主要需求是先把新的評估機制納入流程。前一版 body 的審美問題仍需另行設計調整。

#### 嘗試過的解法
直接補強流程文件，讓「功能正確但視覺弱」能被明確記錄，而不是被視為完成。

#### 最終解法
`AGENTS.md` 已新增截圖後的審美自評要求，並要求把 Codex 自評與使用者審美回饋記錄進工作日誌。`docs/codex-worklog.md` 已記錄使用者對 rough butterfly body 的最新評語。

#### 視覺驗證紀錄
本次為流程文件更新，未進行新的瀏覽器截圖。前一輪 rough butterfly body 的 CDP 截圖仍位於 `docs/cdp-runs/rough-butterfly-body-thin-2026-05-11/screenshots/`。

#### Codex 審美自評
回看前一輪 rough butterfly body，功能分可接受，但審美分約 `4/10`。優點是已建立符號化 body 與 wing root anchor，線條比第一版輕；弱點是整體太像「補上的中心線」，缺少參考圖中的書寫感、節奏、裝飾性與姿態。觸角與身體的關係偏機械，body 沒有成為畫面中有魅力的筆勢。

#### 使用者審美回饋
使用者回饋：結果功能上確實有畫出身體，也符合比較抽象的線條符號描述，但視覺上並不吸引人。使用者希望未來 Codex 在截圖後加入審美判斷、主動修正或評分評語，並將 Codex 與使用者的評分及評語都記錄進工作日誌，逐漸形成美學共識。

#### 尚未解決的風險
審美分數可能因 agent 主觀標準不同而波動，因此未來每次自評都應搭配具體畫面描述與使用者回饋，而不是只留下數字。rough butterfly body 本身仍需要下一輪視覺設計改善。

#### 使用者回饋或修正
使用者明確要求新增工作流程機制，而不只是針對單次畫面修正。

#### 建議的下一步
下一次調整 rough butterfly body 時，應先把目標審美拆成更具體的準則：例如線條要有書寫起伏、身體與觸角要形成一個優雅手勢、body 不能只是垂直中心線、與翅膀根部需要更自然地融合。完成截圖後需留下 Codex 自評分數與評語，再等待或整合使用者評分。

---

### 2026-05-11 — 記錄 p5.brush 運筆美學提示

#### 日期
2026-05-11

#### 任務摘要
記錄使用者對 p5.brush 使用方式與 Codex 創作角色的美學提示，並補充到 `AGENTS.md` 的審美流程中。

#### 使用者需求
使用者提示：`p5.brush` 是可以自由運用的畫筆。當 Codex 能思考並決定好每筆的位置及方向後，效果可能會更自然。Codex 應思考人類會如何運筆，包括下筆時的壓力、轉折等，最後將其設計為一套系統。在這個過程中，Codex 不只是寫程式，也可以是畫面的共同創作者。

#### 實作前理解
前一版 rough butterfly body 雖然功能上成立，但像是把線條放到畫面上，缺少真正的手繪運筆邏輯。使用者這次指出，問題不只是 brush 種類或 jitter，而是每一筆需要有意圖：起筆、方向、轉折、壓力與收筆都要像人類畫圖一樣被設計。

#### 實作方案
將這段提示寫入 `AGENTS.md` 的 `Aesthetic review requirements`，使未來使用 p5.brush 實作 rough body、rough wings、pattern 或其他手繪視覺時，都要先思考運筆意圖，再把它系統化成程式。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`

#### 決策紀錄
將「Codex 是畫面的共同創作者」寫入流程脈絡，避免未來 agent 把 p5.brush 當作單純產生線條材質的 API。之後的視覺演算法應描述筆勢與人類運筆邏輯，再寫成可重複的生成系統。

#### 遇到的問題
本次是流程與美學提示記錄，尚未重新設計 rough butterfly body。

#### 嘗試過的解法
直接更新 `AGENTS.md` 與工作日誌，保留使用者提示的核心意義。

#### 最終解法
`AGENTS.md` 已新增 p5.brush 運筆準則：使用 brush 前應決定每筆的起點、轉折、終點、壓力變化與人類下筆理由，再用受控隨機系統化，而不是只靠任意 jitter。工作日誌已記錄使用者提示，作為後續 rough butterfly body 改善的美學基礎。

#### 視覺驗證紀錄
本次未修改視覺程式，未執行瀏覽器截圖。

#### Codex 審美自評
這個提示指出了目前 rough body 最大缺口：線條有了，但沒有足夠「運筆意圖」。若以這個標準回看上一版 body，視覺分仍約 `4/10`；下一版應先設計筆勢，再實作 brush stroke。

#### 使用者審美回饋
使用者明確表示，希望 Codex 能把 p5.brush 當成自由畫筆，思考人類如何運筆，包括每筆的位置、方向、壓力、轉折，並把這些設計成系統；Codex 在此過程中不只是寫程式，也是畫面的共同創作者。

#### 尚未解決的風險
若只把這段提示寫入文件而不在下一輪實作中具體落地，rough body 仍可能停留在功能正確但美感不足的狀態。下一輪需要把「運筆」拆成可實作的 stroke grammar。

#### 使用者回饋或修正
使用者提供了未來審美與實作方向：從人類運筆出發，而不是從隨機線條出發。

#### 建議的下一步
下一輪 rough butterfly body 應先設計 `stroke grammar`：例如 body 主軸是一筆由 wing root 下壓、微彎、收尖的筆；觸角是從頭部輕起筆、外翻、末端減壓收筆的兩筆；胸部短線或小點是節奏點而非結構標籤。完成後再用 CDP 截圖、Codex 審美自評與使用者評分共同迭代。

---

### 2026-05-11 — 以 p5.brush 運筆系統重畫 Rough Butterfly Body

#### 日期
2026-05-11

#### 任務摘要
依使用者「把 p5.brush 當作自由畫筆、思考人類運筆」的提示，重畫 `insectType === 0` 的 rough butterfly body，並擴充 CDP 視覺測試腳本，讓測試可強制 `finalPitch` 以穩定截到指定昆蟲類型。

#### 使用者需求
使用者要求「那就試試看再畫一次昆蟲身體吧」。脈絡是前一版 body 功能正確但不吸引人；使用者希望 Codex 不只是寫程式，而是作為畫面的共同創作者，設計每一筆的位置、方向、壓力、轉折與系統化規則。

#### 實作前理解
前一版 `RoughInsectBody.js` 主要用 p5 原生 `bezier()` 畫細線，雖抽象但缺少筆勢。要改善，不能只改線寬，而要把 body 拆成 stroke grammar：主軸、胸部節奏筆、頭部點、兩條觸角各自有起筆、轉折、收筆與壓力設計。另發現既有 CDP 測試不一定穩定截到 `insectType === 0`，因 scanning page 會依 `rotationX` 更新 `finalPitch`，桌機 headless 下可能落到其他類型，導致 body 審美判讀失準。

#### 實作方案
改寫 `RoughInsectBody.js`：body plan 產生更接近 wing root 的 head / root / bottom 與 `gestureSide`；繪製端改為 `drawHumanBrushStroke()`，用 `pencil1`、紅墨色、受控 jitter 與分段壓力設計主軸、echo stroke、collar rhythm mark、antennae。由於 `brush.vertex(..., pressure)` 在本次截圖中讓主軸不穩定可見，最後改成 brush 主線搭配 native pressure hints，用分段 stroke weight 補出可讀的壓力節奏。同步在 `scripts/run-cdp-visual-test.ps1` 新增 `-ForcedFinalPitch`，測特定 insect type 時可穩定截圖。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ScanningPage/GyroManager.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/llms.txt`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
保留「只針對 `insectType === 0`」的功能範圍。測試工具新增 `-ForcedFinalPitch`，而不是把測試邏輯寫進 app production code。body stroke 使用 brush 作為主要筆觸，但為了穩定可見與表現壓力，額外疊加 native segmented pressure hints；這是目前比純 `brush.vertex(..., pressure)` 更穩定的折衷。

#### 遇到的問題
第一次重畫後 CDP 截圖其實不是穩定 butterfly，因 `finalPitch` 在 headless scanning 中可能變成其他類型。加入 `-ForcedFinalPitch` 的第一版 PowerShell 參數使用 nullable double，執行時出現 `You cannot call a method on a null-valued expression`，修正為預設 `NaN` 的普通 double 後可用。第二版 brush stroke 一開始仍只有頭部點明顯，主軸幾乎消失；推測 `brush.vertex()` 的 pressure 參數與目前筆刷 / 權重組合不夠穩定，因此改為 brush 線條不傳 pressure，再疊 native 壓力提示。

#### 嘗試過的解法
先改成 p5.brush stroke grammar，執行 `node --check` 與 CDP。發現非 type0 截圖後，搜尋 `finalPitch` 與 `GyroManager.js`，確認測試需強制 pitch。接著修改 CDP 腳本加入 `-ForcedFinalPitch 0`，重跑後確認 summary 中 `resultFinalPitch=0`。最後調整 brush stroke 的可見度與壓力提示，再重跑 `rough-butterfly-body-forced-type0-visible-2026-05-11`。

#### 最終解法
`RoughInsectBody.js` 現在以 `gestureSide` 產生一組手勢方向，主軸由 wing root 下壓後微彎並收尖；可選 echo stroke 增加手繪感；collar rhythm mark 與 head dot 作為節奏點；antennae 從頭部輕起筆向外翻。CDP 腳本新增 `-ForcedFinalPitch`，可用 `-ForcedFinalPitch 0` 穩定測 butterfly body。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過；`scripts/run-cdp-visual-test.ps1` PowerShell parser 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Camera fixture：`greenPlants.jpg`，mock camera canvas `720x1280`
- Forced pitch：`-ForcedFinalPitch 0`，summary 顯示三個 viewport 的 `resultFinalPitch=0`
- 是否有截圖：有，集中於 `docs/cdp-runs/rough-butterfly-body-forced-type0-visible-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍只有一筆已知 404 resource event，未阻止流程；未觀察到新增 JS exception
- 預期畫面：butterfly body 應以紅墨手勢線條出現在翅膀交會處，較前版更有筆勢與存在感
- 實際觀察：body 主軸、頭部點與觸角在 forced type0 截圖中可見，尤其 compact result 較清楚；portrait result 因生成位置落在 Save / Back 附近，按鈕遮擋影響審美判讀。整體比上一版更像一組有意圖的紅墨筆勢，但主軸仍偏直，與翅膀根部融合還可以再優化

#### Codex 審美自評
本次最終版約 `6/10`。比前一版 `4/10` 明顯進步：紅墨存在感更好，主軸不再只是極細中心線，也開始有下壓、轉折、收筆的意識。弱點是線條仍略像「程式化折線」而非真正一氣呵成的書寫筆勢；body 與 wings 的視覺融合不足，尤其胸部節奏點還沒有漂亮地把兩片翅膀串起來。按鈕遮擋讓 portrait 截圖難以公平評估美感。

#### 使用者審美回饋
使用者後續評分為 `5/10`，認為結果「還可以」。主要建議是整體平衡：目前結果中身體比例相較於翅膀過於細長。使用者也觀察到 Codex 在截圖自評後做了多次調整，但每次間效果差距不夠明顯，因此建議未來調整參數或繪圖邏輯時可以更大膽，像射箭調整準心一樣，若調過頭反而能看出適當範圍。使用者也希望 Codex 自行重複調整的次數最好不要超過三次，因為使用者也能提供意見。使用者另外說明，已在 Codex 完成後自行修改了身體顏色及筆刷粗細。

#### 尚未解決的風險
`drawRoughInsect()` 目前每次 draw 都會重新 random seed，Result 可能有幀間變化；這是既有生成邏輯風險，會影響穩定審美比較。Result spawn 與 Save / Back 按鈕遮擋仍干擾評估。`brush.vertex(..., pressure)` 在本環境下不如預期穩定，後續若要更純粹使用 p5.brush 壓力，需要另外做小型筆觸實驗。

#### 使用者回饋或修正
使用者要求重新嘗試畫 body，並提供「人類運筆」作為核心方向。本次依該方向做第二版。完成後，使用者給出 `5/10`，指出身體比例相對翅膀過細長，並要求未來視覺調整幅度更大、迭代不超過三次；使用者已自行調整 body 顏色與筆刷粗細，未來 agent 不應覆蓋這些手動修改。

#### 建議的下一步
下一輪若繼續調 body，應先保留使用者已修改的顏色與筆刷粗細，再針對比例大幅調整：縮短 body length、加寬或增加胸部節奏筆，讓身體相對翅膀更穩。視覺迭代時最多做三輪自評調整，且每輪要有明顯差異；若第一輪就暴露方向問題，應停下來請使用者判斷，而不是小幅反覆微調。

---

### 2026-05-11 — Rough Butterfly 新增第二對翅膀

#### 日期
2026-05-11

#### 任務摘要
在 `drawRoughInsect()` 的 `insectType === 0` rough butterfly 中新增第二對翅膀，讓蝴蝶從 body plan 的不同對照點長出前翅與後翅，並讓同一隻昆蟲的兩對翅膀共用顏色與 pattern 選用。

#### 使用者需求
使用者想先看畫上蝴蝶第二對翅膀時的效果。第二對翅膀一樣要從身體的對照點長出，可以使用不同於第一對翅膀的位置；兩對翅膀要盡量靠近貼合但不要重疊，模擬真實蝴蝶輪廓，因此可以修改翅膀輪廓決定邏輯。同一隻昆蟲的兩對翅膀要使用相同的顏色選用或紋路 pattern。

#### 實作前理解
`drawRoughInsect()` 目前只在 `insectType === 0` 建立 `roughBodyPlan`，並將 `wingRootY` 與 `wingRootHalfWidth` 傳入 `drawRoughInsectWings()`。既有 `drawRoughWingPair()` 只畫一對左右對稱的大翅膀；左右翅膀共用 `wingParams`、`baseOutline` 與 `roughPattern`，但 pattern archetype 會在上色時重新隨機判斷。前次使用者已自行調整 body 顏色與筆刷粗細，本次不應覆蓋 body。

#### 實作方案
在 `RoughInsectWings.js` 中新增 butterfly 專用的雙 wing pair 流程：`fore` 前翅較上、較長，`hind` 後翅較低、較短且更圓。先畫後翅，再畫前翅，最後仍由既有 body 繪製壓在根部上方。另新增 `wingStylePlan`，把 `colorProfile`、`highContrast`、`useEyeSpots`、`useRadialBands` 等 pattern 選用固定為同一份，讓前翅與後翅使用同一套顏色與紋路決策，但保留不同 stroke seed 以維持手繪自然感。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/InsectWings.js`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
雙翅邏輯只套用於 `insectType === 0 && bodyPlan`，其他 rough insect 類型維持原本一對翅膀。前後翅共用 pattern 選用，但不強制複製完全相同的筆觸路徑，因為完全相同會太機械；目前保留左右與前後翅各自的 stroke seed，使材質自然但視覺語彙一致。

#### 遇到的問題
第一版 `rough-butterfly-double-wings-v1-2026-05-11` 功能上有畫後翅，但後翅幾乎被前翅吃掉，畫面仍像單一長翅，只有少量下方暗線可見。這不符合「想先看第二對翅膀效果」的需求。

#### 嘗試過的解法
第一輪先加入 `drawRoughButterflyWingPairs()`、`createRoughButterflyWingPairPlans()` 與共享 `wingStylePlan`，並跑 CDP 截圖。看到後翅不夠明顯後，第二輪做大幅視覺調整：壓扁前翅下緣、把後翅根點往下移、增加後翅圓度與下垂感，讓第二對翅膀在 silhouette 中讀得出來。

#### 最終解法
`drawRoughInsectWings()` 會在 rough butterfly 且有 body plan 時呼叫 `drawRoughButterflyWingPairs()`。此函式建立共享 `wingStylePlan` 與 `fore/hind` 兩組 pair plan。`drawRoughWingPairFromPlan()` 支援每對翅膀自己的 `rootHalfWidth`、`yOff`、`rotation`、`scaleX`、`scaleY` 與輪廓參數。`drawRoughWingColor()` 與 `drawRoughWingButterflyPattern()` 現在可接收共享 style / pattern plan。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Camera fixture：`greenPlants.jpg`，mock camera canvas `720x1280`
- Forced pitch：`-ForcedFinalPitch 0`，summary 顯示三個 viewport 的 `resultFinalPitch=0`
- 是否有截圖：有，最終第二輪集中於 `docs/cdp-runs/rough-butterfly-double-wings-v2-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JS exception
- 預期畫面：rough butterfly 應出現前翅與後翅，兩對翅膀靠近貼合但輪廓可辨，且前後翅共享同一套顏色與 pattern 選用
- 實際觀察：第二輪中後翅已明顯成為下方翅瓣，與前翅貼近，整體更像四翅蝴蝶。pattern 色系一致。portrait 與 compact 可讀性較好；landscape 中 Result UI 仍靠近昆蟲，是既有版面風險。

#### Codex 審美自評
最終第二輪約 `7/10`。優點是四翅輪廓終於讀得出來，前翅與後翅的貼合比第一輪自然，且同一套綠色系 pattern 沒有前後翅風格分裂。弱點是後翅仍有點像被前翅拉長的尾瓣，還不是非常精準的真實蝶翼比例；在植物背景上綠色翅膀與背景融合，輪廓主要靠黑線支撐。第一輪後我做了一次大幅調整；第二輪已足以讓使用者判斷方向，因此停止自我迭代，未做第三輪。

#### 使用者審美回饋
使用者針對本次改動本身給 `8/10`，不是只針對美觀程度。使用者認為 Codex 這次判斷準確，包含正確辨認第一次繪製的問題、後續改動能明顯看出差異，並且適當地收手給使用者看。使用者觀察到橫向時的翅膀輪廓比例較自然，問題可能出在翅膀輪廓會參照螢幕或畫布的長或寬；直向畫面時翅膀太向下延伸而不自然，橫向時比例比較剛好。

#### 尚未解決的風險
CDP fake camera 不能代表真實手機相機環境；真實照片下的顏色對比、pattern 可讀性與手機效能仍需實機確認。`drawRoughInsect()` 仍有每幀重新 random 的既有風險，可能影響穩定審美比較。Result spawn 與 Save / Back 按鈕在部分 viewport 中仍可能遮擋或壓近昆蟲。

#### 使用者回饋或修正
使用者確認「Go!」後允許依實作方案修改程式。本次完成後，使用者補充評分與診斷：本次改動本身 `8/10`，流程判斷與收手時機正確；下一個問題應優先檢查直向 viewport 下 wingBaseLen 或翅膀輪廓參照螢幕長寬造成的垂直延伸。本次沒有要求 commit 或 push。

#### 建議的下一步
下一輪建議先處理直向比例：檢查 `createRoughButterflyWingPairPlans()` 中 `wingBaseLen`、`foreLength`、`hindTipY`、`hind yOff` 與 `scaleY` 是否過度受 `max(width, height)` 或畫布長邊影響；可讓 butterfly wing size 主要參照短邊或加入 portrait-specific vertical compression。調整時以橫向截圖作為較自然比例的參考，讓直向結果接近橫向的前後翅比例，再用 `-ForcedFinalPitch 0` 跑 portrait / compact / landscape 對照。

---

### 2026-05-11 — 修正 Rough Butterfly 直向雙翅比例

#### 日期
2026-05-11

#### 任務摘要
依使用者觀察，修正 rough butterfly 在 portrait / compact 直向 viewport 下翅膀過度向下延伸的比例問題，讓直向雙翅輪廓更接近前一輪 landscape 中較自然的比例。

#### 使用者需求
使用者指出上一輪改動本身可給 `8/10`，但觀察到橫向時翅膀輪廓比例較自然；問題應該出在翅膀輪廓會參照螢幕或畫布長寬，導致直向時翅膀太向下延伸、不自然，橫向時反而比較剛好。使用者要求開始下一輪修正。

#### 實作前理解
`createRoughButterflyWingPairPlans()` 原本使用 `(screenMax * 0.15 + screenMin * 0.4) * 0.01` 作為 `wingBaseLen`。在 portrait runtime 約 `478x694` 時，`screenMax` 會拉大基礎長度；後翅的 `yOff`、`hindTipY` 與 `scaleY` 又會放大垂直下垂，使直向結果比 landscape 更像往下拖的長尾瓣。landscape 較自然，因此不應全面縮小所有方向，而應只讓直向逐步壓縮。

#### 實作方案
在 `createRoughButterflyWingPairPlans()` 中加入 `portraitAmount`，依 `height / width` 判斷直向程度。橫向時 `portraitAmount=0`，保留原比例；直向時讓 `wingBaseLen` 從原本的長短邊混合值逐步靠近短邊基準，並套用 `verticalCompression` 與 `hindDropCompression` 壓縮 `foreTipY`、`hindTipY`、後翅 `yOff`、前後翅 `scaleY`。第一輪截圖後 compact 仍略有尾瓣感，因此第二輪加強短邊基準與垂直壓縮，並停止在第二輪交給使用者判斷。

#### 檢視過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
不改 body、顏色、pattern，也不改非 butterfly 類型。比例修正只存在於 butterfly 專用 `createRoughButterflyWingPairPlans()`，並透過 `portraitAmount` 保護 landscape。這是因為使用者明確指出 landscape 較自然，若全面縮小翅膀會破壞目前最好的參考。

#### 遇到的問題
第一輪 `rough-butterfly-double-wings-portrait-ratio-v1-2026-05-11` 中，portrait 截圖的昆蟲位置剛好被 Save / Back 按鈕部分遮擋，不適合作為唯一判斷；compact 可見比例有改善但後翅仍有一點向下拖成尾瓣。因此做第二輪加強直向壓縮。

#### 嘗試過的解法
第一輪將 `wingBaseLen` 在 portrait 時往短邊基準靠近，並壓縮 `hind yOff` 與 `tipY`。第二輪把短邊基準從 `0.47` 調到 `0.44`，讓 `portraitAmount` 更早介入，並加強 `verticalCompression`、`hindDropCompression` 與前後翅 `scaleY` 的直向壓縮。

#### 最終解法
最終保留第二輪：`portraitAmount = constrain((height / width - 1) / 0.45, 0, 1)`，直向時 `wingBaseLen` 往 `screenMin * 0.44 * 0.01` 靠近；`verticalCompression` 與 `hindDropCompression` 分別壓縮翅尖垂直量與後翅根點下移量。橫向時上述修正不介入。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Camera fixture：`greenPlants.jpg`，mock camera canvas `720x1280`
- Forced pitch：`-ForcedFinalPitch 0`，summary 顯示三個 viewport 的 `resultFinalPitch=0`
- 是否有截圖：有，最終第二輪集中於 `docs/cdp-runs/rough-butterfly-double-wings-portrait-ratio-v2-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JS exception
- 預期畫面：portrait / compact 的雙翅不再因畫布長邊而過度向下延伸，landscape 的自然比例不應被破壞
- 實際觀察：第二輪 portrait / compact 的整體高度收斂，後翅仍可辨但不再像前一輪那樣一路向下拖；landscape 仍保持可讀的四翅輪廓。portrait 這輪未被按鈕遮擋，較能判斷比例。

#### Codex 審美自評
本輪約 `7.5/10`。優點是使用者指出的 viewport 比例問題被明確對準，直向的翅膀高度與後翅下垂量比上一輪自然，且橫向未被破壞。弱點是後翅末端仍偏尖，真實蝴蝶後翅可以更圓鈍；另外綠色背景仍讓翅膀主要依靠黑線可讀。第一輪後做了一次更明顯的第二輪調整，第二輪已足以提供使用者評圖，因此停止自我迭代。

#### 使用者審美回饋
使用者對 `portrait-ratio-v2` 給 `6/10`。使用者認為本輪有改善問題，但沒有到差很多；這點可以接受。使用者也認同 Codex 提到的「後翅專屬輪廓」是很好的下一步方向。

#### 尚未解決的風險
CDP fake camera 不能取代真實手機 AR / camera 測試。不同 seed、不同背景與不同真實手機 viewport 下，`portraitAmount` 的壓縮曲線仍可能需要微調。Result spawn 與按鈕安全區仍會影響視覺判讀。

#### 使用者回饋或修正
使用者要求開始下一輪，並提供具體方向：以 landscape 較自然的輪廓比例為參考，修正 portrait 翅膀過度向下延伸。完成後使用者評分 `6/10`，指出比例壓縮雖有改善但差異不大，並肯定下一輪可改做後翅專屬輪廓。

#### 建議的下一步
下一步不要再只靠 `portraitAmount` 壓縮比例；應設計後翅專屬的 rounder outline，讓後翅有自己的上緣、外緣與圓鈍下緣，而不是沿用前翅輪廓再縮放。目標是讓後翅更像真實蝴蝶的下翅瓣，並用較明顯的輪廓差異解決「改善但不大」的問題。

---

### 2026-05-11 — 規劃昆蟲姿態矩陣與振翅階段

#### 日期
2026-05-11

#### 任務摘要
閱讀專案規則、工作紀錄與 rough insect 相關程式，評估是否可讓生成昆蟲像參考圖一樣呈現不同姿態、角度與振翅階段。

#### 使用者需求
使用者提供一張紅色線稿蝴蝶參考圖，希望畫出來的昆蟲能有不同姿態或角度。期待透過類似矩陣轉換的方式，讓身體有不同角度，翅膀隨身體角度變化，並加入模擬振翅的不同階段，呈現昆蟲在立體空間中以不同角度飛行的樣子。

#### 實作前理解
目前 rough butterfly 已有雙翅與 body plan。`drawRoughInsect()` 會先 translate 到生成位置，再給整隻昆蟲一個 2D 隨機旋轉；`createRoughInsectBodyPlan()` 產生 body 軸線、wing root 與 gestureSide；`createRoughButterflyWingPairPlans()` 產生 fore / hind 兩對翅膀，但翅膀姿態主要仍是 2D 平面輪廓與左右鏡像縮放。若要做參考圖那種不同角度，適合在 body plan 與 wing pair plan 之間新增一層 `posePlan`，用偽 3D 投影控制 body yaw / pitch / roll、左右翅膀開合與振翅 phase。

#### 實作方案
先不直接改程式，先提出分階段方案：第一階段建立 `posePlan` 與 2D affine / pseudo-3D 投影工具，讓 body 與 wing root 共用同一姿態座標；第二階段讓 fore / hind wings 依 posePlan 改變左右縮放、旋轉、垂直 offset 與遮擋順序；第三階段加入 `flapPhase`，用 3 到 5 個離散振翅階段產生上拍、平展、下拍等 silhouette；第四階段用 CDP `-ForcedFinalPitch 0` 截圖比較多個 pose seed，進行審美自評。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`

#### 修改過的檔案
- `docs/codex-worklog.md`

#### 決策紀錄
此需求可行，但建議先做「偽 3D 姿態系統」而不導入真正 3D renderer。原因是目前專案的強項是 p5.brush 手繪線稿與 2D compositing；若直接改成 3D mesh，會破壞既有筆觸系統。姿態矩陣應成為生成計畫的一層資料，而不是散落在各個 draw function 的臨時 rotate / scale。

#### 遇到的問題
目前 `flapAngle` 在 rough insect 路徑中固定為 `0`；整體 `randomRot` 只有平面旋轉，不能表現立體飛行角度。雙翅雖已有 fore / hind，但 wing outline 還沒有真正針對不同視角改變輪廓與遮擋。

#### 嘗試過的解法
本階段只做閱讀與方案設計，未修改功能程式。已確認最適合接入點是 `drawRoughInsect()` 建立 `currentSeed` 與 `roughBodyPlan` 之後、呼叫 `drawRoughInsectWings()` 與 `drawRoughInsectBody()` 之前。

#### 最終解法
尚未實作。建議下一步在使用者同意後新增 `RoughInsectPose.js` 或在現有 rough generator 中加入小型 pose helpers，先完成 6 到 9 種可辨識的靜態姿態，而不是一開始追求連續動畫。

#### 視覺驗證紀錄
本階段未修改視覺功能，因此未執行瀏覽器截圖。若進入實作，需用既有 CDP 流程測 `portrait-390x844`、`compact-360x740`、`landscape-844x390`，並固定 rough butterfly 類型做多 pose 對照。

#### Codex 審美自評
目前僅評估方向，暫不給成品分數。參考圖的重點不是精確透視，而是「每隻蝴蝶像一筆畫出不同瞬間」：有的側飛、有的翻轉、有的展平、有的翅膀半收。實作時姿態差異要大到一眼可辨，不能只做微小 scale 差異。

#### 使用者審美回饋
使用者希望昆蟲能像參考圖一樣有不同姿態或角度，身體與翅膀能透過類似矩陣轉換連動，並加入振翅階段，模擬立體空間中不同角度飛行。

#### 尚未解決的風險
若每幀重新 random，振翅與姿態可能抖動，後續可能需要先讓 result insect 的 seed / pose 穩定。偽 3D 投影過強時可能讓手繪線稿變得機械；投影過弱則看不出差異。實作後仍需真實手機檢查可讀性與按鈕遮擋。

#### 使用者回饋或修正
等待使用者確認是否採用此分階段方案，以及第一輪要優先做靜態姿態、振翅階段，或兩者一起做最小版本。

#### 建議的下一步
若使用者同意，第一輪建議做靜態姿態系統：建立 `posePlan`，用 6 個 pose preset 測試 body axis、wing root、左右 fore / hind wings 的連動與遮擋。通過後第二輪再加入 `flapPhase`。

---

### 2026-05-11 — 實作 Rough Butterfly 偽 3D 姿態與振翅 phase

#### 日期
2026-05-11

#### 任務摘要
在 rough butterfly 中加入第一版 `posePlan`，讓昆蟲不只平面旋轉，而能依 yaw / pitch / roll、近遠側與離散振翅 phase 產生不同飛行姿態。

#### 使用者需求
使用者確認可以開始實作與測試，希望昆蟲能像參考圖一樣有不同姿態或角度：身體角度能透過類似矩陣轉換改變，翅膀跟著身體連動，並加入模擬振翅的不同階段，呈現立體空間中不同角度飛行的感覺。

#### 實作前理解
目前 rough butterfly 已有 body plan 與 fore / hind 雙翅，但主要仍靠整體 `rotate()` 與左右鏡像翅膀呈現。`flapAngle` 固定為 `0`，沒有實際振翅階段。最合適的第一輪不是導入真正 3D renderer，而是在既有 p5.brush 2D 手繪座標上加一層偽 3D pose：讓整隻昆蟲有 roll 與縮放投影，讓左右翅有近遠側差異與不同繪製順序。

#### 實作方案
新增 `createRoughInsectPosePlan()`，由 seed 產生 `yaw`、`pitch`、`roll`、`phaseIndex`、`nearSide`、近遠側 scale / y offset / root skew / depth tilt。`drawRoughInsect()` 在 rough butterfly 時建立 posePlan，套用整體 roll 與 body scale，並把 posePlan 掛到 bodyPlan。`createRoughButterflyWingPairPlans()` 依 phase 改變 fore / hind 的 length、tipY、yOff 與 rotation。`drawRoughWingPairFromPlan()` 改為依 nearSide 決定左右翅繪製順序，並在 `drawRoughWingSideFromPlan()` 中套用近遠側縮放、位移與旋轉。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `index.html`
- `scripts/run-cdp-visual-test.ps1`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
本輪只改 rough butterfly，避免影響其他 insect type。未新增外部依賴，也未改 p5.brush、body 顏色或使用者先前自行調整的 body 筆刷粗細。第一輪截圖顯示姿態過度折疊，因此第二輪降低 phase fold / spread 的極端程度、近遠側縮放與 depth tilt，讓視角差異保留但 silhouette 不至於變成兩片直立葉。

#### 遇到的問題
第一輪 `rough-butterfly-pose-flap-v1-2026-05-11` 的功能流程通過，但 visual 上 portrait / compact 太像兩片直立葉片，四翅與身體不易讀出。差異檢查時也發現一次 patch 誤動到一般 `drawInsect()` 的隨機旋轉區塊，已補回，避免影響非 rough 路徑。

#### 嘗試過的解法
先建立 `posePlan` 與 near/far wing transform，跑 `node --check` 與 CDP。看到第一輪折翅太強後，第二輪大幅調低最極端振翅 phase、近遠側 scale、root skew 與 depth tilt，再重跑語法檢查與 CDP 視覺測試。第二輪後已能看出半收翅飛行姿態，因此依使用者先前偏好停止自我迭代。

#### 最終解法
`RoughInsectWings.js` 新增 `createRoughInsectPosePlan()` 與 `drawRoughWingSideFromPlan()`。rough butterfly 現在會以 seed 產生 5 種離散振翅 phase，並讓 fore / hind wings 隨 phase 改變展開長度、上下拍位置與旋轉；左右翅依 yaw 分近遠側，近側稍大、遠側稍小且先畫，形成簡單遮擋與立體感。`InsectManager.js` 只在 rough butterfly 時套用 posePlan；其他 rough 類型維持原本平面隨機旋轉。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\InsectManager.js` 通過；`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Camera fixture：`greenPlants.jpg`，mock camera canvas `720x1280`
- Forced pitch：`-ForcedFinalPitch 0`，summary 顯示三個 viewport 的 `resultFinalPitch=0`
- 是否有截圖：有，最終第二輪集中於 `docs/cdp-runs/rough-butterfly-pose-flap-v2-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JS exception
- 預期畫面：rough butterfly 應呈現非平面旋轉的飛行姿態，左右翅膀有近遠側差異，振翅 phase 造成可辨的半收 / 平展 / 下拍 silhouette
- 實際觀察：第二輪比第一輪自然，compact / landscape 的半收翅輪廓較穩定；portrait 被 Save / Back 按鈕遮擋，身體與後翅仍偏弱

#### Codex 審美自評
本輪約 `6.5/10`。優點是姿態系統已開始工作，蝴蝶不再只是平面旋轉，第二輪也比第一輪更像半收翅飛行狀態。弱點是身體軸線還沒有足夠參與 pose，後翅也容易被前翅與背景吃掉；參考圖的輕盈、多角度線稿感只做到骨架，還沒完全到位。本輪做了一次明顯視覺修正後停止，等待使用者評圖。

#### 使用者審美回饋
尚未收到本輪成品回饋。使用者本輪指示是可以開始做測試。

#### 尚未解決的風險
CDP fake camera 不能取代真實手機 AR / camera 測試。Result spawn 與 Save / Back 按鈕遮擋仍會干擾 portrait 評圖。`drawRoughInsect()` 既有每次 draw 重新 random 的風險仍可能造成姿態或種子不穩。若要更接近參考圖，下一步需要讓 body stroke 本身也依 posePlan 變形，而不只是整體縮放與旋轉。

#### 使用者回饋或修正
使用者針對 `rough-butterfly-pose-flap-v2-2026-05-11` 給 `6.5/10`。使用者認為確實有變化，但變化還不夠明顯；身體本身也需要有更大的角度變化來帶動全身。使用者也指出目前截圖流程或判讀沒有成功取到真正的蝴蝶部分，因為剛才看到的結果更像沒有身體的蛾模板，而不是有身體姿態帶動的蝴蝶。

#### 建議的下一步
下一輪建議先修正測試與目標判讀：確認 CDP 截圖能穩定取到真正的 rough butterfly，且畫面中必須清楚出現 body。實作上應讓 body axis 直接讀取 posePlan，做出更明顯的側飛 / 俯仰身體姿態，並讓翅根、前翅、後翅以 body 為主軸連動。若 body 不可見或仍像無身體蛾形模板，應視為本輪失敗而不是通過。

---

### 2026-05-11 — 強化 Rough Butterfly Body Axis 姿態

#### 日期
2026-05-11

#### 任務摘要
依使用者回饋，調整 rough butterfly 的 body axis，讓身體本身讀取 `posePlan` 並以更清楚的頭、胸、腹主軸帶動全身姿態。

#### 使用者需求
使用者要求調整 body axis。上一輪使用者給 `6.5/10`，指出有變化但不夠明顯；身體本身需要有更大的角度變化來帶動全身。使用者也指出前一輪截圖更像沒有身體的蛾模板，因此下一輪必須確認截圖中的 body 清楚可見。

#### 實作前理解
前一輪 `posePlan` 主要作用在翅膀與整體 layer transform；`RoughInsectBody.js` 的 body axis 還是固定細長筆勢，沒有直接讀取 yaw / pitch / flap phase。這會造成翅膀雖然有近遠側變化，但 body 不夠像整隻昆蟲的骨架。另有測試問題：Result spawn 常靠近 Save / Back 按鈕，會遮住 body，使視覺判讀不可靠。

#### 實作方案
修改 `drawRoughBodyGestureAxis()`、`drawRoughBodyRhythmMarks()`、`drawRoughBodyGestureAntennae()`，讓 body 點位由 `getRoughPoseBodyPoint()` 產生，並依 `posePlan.yaw`、`posePlan.pitch`、`posePlan.phase.lift`、`posePlan.nearSide` 做頭、胸、腰、腹、尾的明顯偏移。加強主軸 stroke weight、頭部 pressure dot 與胸部量感。同步在 CDP 測試腳本新增 `-ForcedSpawnRatioX` / `-ForcedSpawnRatioY`，讓視覺驗證可把昆蟲固定在較不會被按鈕遮擋的位置。

#### 檢視過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/ResultPage.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
本輪不再調翅膀 silhouette，而是把 body 視為通過條件。CDP forced spawn 只屬於測試工具，不改 production Result page；目的為避免按鈕遮擋造成錯誤審美判讀。Body 顏色仍保留既有黑色，不覆蓋使用者先前可能調過的色彩方向。

#### 遇到的問題
第一輪 `rough-butterfly-body-axis-pose-v1-2026-05-11` 中，compact 可看出 body 變清楚，但 portrait / landscape 仍受 Save / Back 按鈕遮擋。這證明單靠原本 shutter 位置產生的 spawn 不適合評估 body axis。

#### 嘗試過的解法
先改 body axis，再跑 `node --check` 與 CDP。看到按鈕遮擋後，修改 `scripts/run-cdp-visual-test.ps1`，新增 forced spawn ratio。第二輪用 `-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36` 重跑，使昆蟲固定在畫面上方偏左，三個 viewport 都能看到 body。

#### 最終解法
`RoughInsectBody.js` 現在會用 pose-aware points 畫 head、thorax、waist、abdomen、tail，並用較粗的 pencil stroke、native pressure hints、胸部橢圓量感與較大的頭部點強化可讀性。觸角也會依 pose yaw 做些微 skew。`scripts/run-cdp-visual-test.ps1` 支援 `-ForcedSpawnRatioX` / `-ForcedSpawnRatioY`，方便視覺測試固定昆蟲位置。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過；`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過；`node --check Pages\ResultPage\InsectGenerator\InsectManager.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Camera fixture：`greenPlants.jpg`，mock camera canvas `720x1280`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：第二輪 `-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 是否有截圖：有，最終第二輪集中於 `docs/cdp-runs/rough-butterfly-body-axis-pose-v2-2026-05-11/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JS exception
- 預期畫面：body 清楚可見，且不再像無身體蛾模板
- 實際觀察：portrait / compact / landscape 都能看到 body；compact 最清楚，portrait 也能辨識觸角、頭部、胸腹軸線與左右翅。整體已不再是無身體模板，但身體角度仍偏正面。

#### Codex 審美自評
本輪約 `7/10`。優點是 body 真的成為骨架，頭、觸角、胸部與腹部可讀性都比前版好，CDP forced spawn 也讓評圖可靠許多。弱點是姿態還偏正面與對稱，沒有達到參考圖中側飛、俯仰、翻轉那些更戲劇性的角度。這輪完成「body 可見且能帶動全身」的基礎，但下一輪需要改成更明確的 pose preset。

#### 使用者審美回饋
尚未收到本輪 body axis 調整後回饋。上一輪使用者指出變化不夠明顯，且前一輪像無身體蛾模板。

#### 尚未解決的風險
CDP fake camera 不能取代真實手機 AR / camera 測試。Body 在深綠背景上仍可能依賴黑線可讀，真實背景更暗時可能被吃掉。姿態仍由 random 連續值產生，可能缺乏一眼可辨的多姿態差異。

#### 使用者回饋或修正
使用者回饋：Codex 對 `rough-butterfly-body-axis-pose-v2-2026-05-11` 的自評準確，提出的下一步修改方向也合理。這表示目前「body 已較清楚，但姿態仍偏正面；下一輪應改做離散 pose preset 讓差異更明顯」的判斷可作為後續方向。

#### 建議的下一步
下一輪建議從 random pose 改成離散 pose preset，例如：正面展翅、三分之二側飛、側身上拍、俯視下拍、仰角半收。每個 preset 明確指定 body lean、近遠側翅膀大小、遮擋順序與 flap phase，才能更接近參考圖中多個不同角度的蝴蝶。

---

### 2026-05-12 — 將 Rough Butterfly 身體改為 p5.brush 具象頭胸腹

#### 日期
2026-05-12

#### 任務摘要
依使用者要求，將 rough 昆蟲身體從偏線稿骨架的 body axis，改成參考 `InsectBody.js` 那種較具象的頭、胸、腹結構，但繪製方式改用 p5.brush，保留 rough 手繪質感。

#### 使用者需求
使用者要求先閱讀 `AGENTS.md` 與 `docs/codex-worklog.md`，吸收前人的工作紀錄，接著將 rough 昆蟲身體改成像 `InsectBody.js` 那種較具象的結構，但要使用 p5.brush 來畫。使用者同意方案後要求開始實作。

#### 實作前理解
`InsectBody.js` 以 native ellipse 畫蝴蝶的 head、thorax、abdomen、segments 與 antennae；`RoughInsectBody.js` 目前只支援 `insectType === 0`，也就是 rough butterfly，並且已經讀取 `posePlan` 做 body axis。因為載入順序是 `RoughInsectWings.js`、`RoughInsectBody.js`、`InsectBody.js`，rough body 不能直接依賴 `InsectBody.js` 的函式，適合在 `RoughInsectBody.js` 內把具象解剖結構翻譯成 p5.brush 筆觸。

#### 實作方案
保留 `drawRoughInsectBody()` 的入口與 body plan / posePlan 流程，不改 `InsectManager.js` 或翅膀。新增 body anatomy helper，從 pose-aware 的 head、thorax、abdomen、tail 點位建立身體角度、法線與軸線。用 `brush.fill()` / `brush.beginShape()` / `brush.endShape(true)` 生成手繪橢圓 mass，分別畫腹部、胸部與頭部，再補腹部分節、背線 highlight、胸部短毛與頭部小點。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `index.html`
- `Pages/ResultPage/InsectGenerator/InsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
本輪只改 rough butterfly body，不擴張到 moth 或 dragonfly，因目前 rough body plan 本來也只支援 butterfly。具象化不是直接複製 `InsectBody.js` 的乾淨 ellipse，而是將 head / thorax / abdomen / segments 的結構轉成 brush shape，避免失去 rough 線稿與手繪材質。第一輪截圖顯示 body 已出現但偏小偏黑，因此做第二輪調整：放大頭胸腹、加暖色 dorsal highlight 與較可見的分節線。

#### 遇到的問題
第一版 `rough-butterfly-figurative-brush-body-v1-2026-05-12` 功能流程正常，但 body 遠看仍容易糊成中心黑點，不夠接近使用者想要的具象身體。landscape forced spawn 讓昆蟲靠近畫面上緣，視覺判讀仍受位置影響。

#### 嘗試過的解法
先建立 p5.brush 橢圓 mass、腹部分節、胸部短毛與頭部小點，跑 `node --check` 與 CDP。看到第一版 body 偏小後，第二版放大 abdomen / thorax / head 的比例，並新增暖色背線與較明顯的腹部分節，再重跑語法檢查與 CDP 視覺測試。

#### 最終解法
`RoughInsectBody.js` 新增 `drawRoughBodyFigurativeMasses()`、`buildRoughBodyAnatomy()`、`drawRoughBrushOval()`、`drawRoughAbdomenSegments()`、`drawRoughBodyDorsalHighlight()`、`drawRoughThoraxHairs()` 等 helper。現在 rough butterfly body 會在原本 pose-aware body axis 上疊加 p5.brush 畫出的頭、胸、腹具象 mass，並用分節與 highlight 增加可讀性。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過；`node --check Pages\ResultPage\InsectGenerator\InsectManager.js` 通過；第一輪也檢查過 `RoughInsectWings.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- Camera fixture：第一次視覺測試誤用腳本預設 fake camera，後續依使用者提醒補跑 `-CameraFixture greenPlants`，使用 `tests/fixtures/camera/greenPlants.jpg`
- 是否有截圖：有，補正後的 fixture 驗證集中於 `docs/cdp-runs/rough-butterfly-figurative-brush-body-greenPlants-v2-2026-05-12/screenshots/`；先前預設 fake camera 對照在 `docs/cdp-runs/rough-butterfly-figurative-brush-body-v2-2026-05-12/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 預期畫面：rough butterfly body 應可讀成具象的頭、胸、腹，而不是只有一條 body axis 或黑色中心點
- 實際觀察：在 `greenPlants.jpg` fixture 中，portrait / compact 都能讀出頭、胸、腹與腹部分節，compact 最清楚；植物背景比預設假相機更容易吃掉部分黑色線條，因此更能暴露對比風險。landscape 可見 body，但 forced spawn 位置偏上，昆蟲接近畫面上緣。

#### Codex 審美自評
本輪約 `7.2/10`。優點是 body 從骨架線變成真正可讀的昆蟲身體，頭胸腹和分節已比前版具象，也保留 p5.brush 的手繪感。補跑 `greenPlants.jpg` fixture 後，確認植物背景中 body 仍可讀，但深綠葉叢會吃掉一部分黑色線條。弱點是整體 body 仍偏小，仍主要靠深色輪廓與 highlight 讀出；姿態本身仍沿用上一輪的 pose 系統，還不是使用者先前期待的更明顯側飛 / 翻轉 preset。本輪做了一次視覺調整與一次 fixture 補測後停止，等待使用者評分。

#### 使用者審美回饋
尚未收到本輪成品回饋。使用者本輪明確方向是「身體更像 `InsectBody.js` 的具象結構，但使用 p5.brush 來畫」。

#### 尚未解決的風險
CDP canvas fixture 不能取代真實手機 AR / camera 測試。使用者指出第一次測試沒有用 fixtures 圖片，這是本輪驗證流程疏漏；已補跑 `greenPlants.jpg`，但尚未跑完整 `all` fixtures 背景壓力測試。真實背景若較暗，深色 body 可能仍被吃掉。landscape forced spawn 讓昆蟲靠近畫面上緣，下一輪若要評估 landscape 構圖，應改用較低的 spawn ratio。body 已具象化，但尚未解決前次工作紀錄中「離散 pose preset」的姿態差異需求。

#### 使用者回饋或修正
使用者指出本輪最初沒有使用 fixtures 內的圖片測試。已承認疏漏並補跑 `rough-butterfly-figurative-brush-body-greenPlants-v2-2026-05-12`，使用 `tests/fixtures/camera/greenPlants.jpg`。等待使用者對 fixture 補測結果的視覺評分與方向修正。

#### 建議的下一步
請使用者先評估第二版 body 具象程度。如果分數接近可接受，下一步建議回到離散 pose preset；如果覺得 body 仍太小或不夠像 `InsectBody.js`，下一輪可優先放大 body 10-20%、提高 highlight 對比，或讓 abdomen 更長、更明確分節。

---

### 2026-05-12 — 建立摘要文件導覽與閱讀規則

#### 日期
2026-05-12

#### 任務摘要
將目前工作日誌中的重點資訊整理成多個摘要檔，讓後續 agent 可以先讀精簡導覽，只有在需要追溯原始脈絡時才閱讀完整 `docs/codex-worklog.md`。同時把何時讀取或編輯這些摘要檔的規則寫入 `AGENTS.md`。

#### 使用者需求
使用者要求把目前工作日誌中的重點資訊摘要成不同檔案，方便後續 agent 只在必要時才看完整內容。接著使用者確認，應把何時讀或編輯這些檔案的規則寫進 `AGENTS.md`，並同意開始執行。

#### 實作前理解
`docs/codex-worklog.md` 已接近 150KB，`docs/visual-test-log.md` 也累積大量視覺測試紀錄。完整日誌仍需要保留作為 source of truth，但後續 agent 若每次都全讀，會浪費上下文，也容易被歷史細節淹沒。較合理的做法是建立第一層摘要檔，分別承擔 onboarding、審美標準、測試流程、風險與下一步。

#### 實作方案
新增四個摘要檔：`docs/agent-quickstart.md`、`docs/visual-style-guide.md`、`docs/testing-playbook.md`、`docs/current-risks-and-next-steps.md`。在 `AGENTS.md` 新增「Summary docs and reading order」區塊，規定新 agent 先讀摘要檔，只有摘要不足、需要原始決策、需要記錄新任務或使用者明確要求時才讀完整 worklog。最後把本次文件整理追加到工作日誌。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `docs/`

#### 修改過的檔案
- `AGENTS.md`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/testing-playbook.md`
- `docs/current-risks-and-next-steps.md`
- `docs/codex-worklog.md`

#### 決策紀錄
摘要檔只作為導覽與目前結論，不取代完整 worklog。若未來任務改變視覺標準、測試流程、目前風險或建議下一步，必須同步更新對應摘要檔。這樣可讓後續 agent 快速進入狀況，同時仍保留完整歷史可追溯。

#### 遇到的問題
目前 Windows 沙盒內 PowerShell 仍出現 `CreateProcessAsUserW failed: 5`，因此讀取檔案索引時需要使用沙盒外執行。這次修改本身是文件整理，不涉及程式與視覺畫面。

#### 嘗試過的解法
先用 `rg` 與 `Get-Content -Encoding UTF8` 查看 `AGENTS.md`、worklog 標題索引、最近工作紀錄與視覺測試索引，再根據已有結論建立摘要檔。沒有壓縮或刪除原始工作日誌，以避免遺失歷史脈絡。

#### 最終解法
已建立四個摘要檔，並在 `AGENTS.md` 中加入閱讀順序與編輯規則。後續 agent 應先讀 `docs/agent-quickstart.md`，再依任務讀 `docs/visual-style-guide.md`、`docs/testing-playbook.md` 或 `docs/current-risks-and-next-steps.md`；只有摘要不足或需要正式記錄時才讀完整 `docs/codex-worklog.md`。

#### 視覺驗證紀錄
本次沒有修改程式或視覺輸出，因此未執行瀏覽器截圖，也未更新 `docs/visual-test-log.md`。

#### Codex 審美自評
本次是文件資訊架構整理，沒有視覺成品可評分。文件結構目標是降低後續 agent onboarding 成本，並讓審美、測試與風險資訊各自有固定入口。

#### 使用者審美回饋
本次沒有新的視覺審美回饋。

#### 尚未解決的風險
摘要檔需要後續 agent 持續維護，否則可能與完整 worklog 脫節。未來若新增大量視覺迭代，應避免只寫完整 worklog 而忘記更新 `docs/visual-style-guide.md` 或 `docs/current-risks-and-next-steps.md`。

#### 使用者回饋或修正
使用者同意建立摘要檔，並確認要把何時讀取或編輯這些檔案的規則寫進 `AGENTS.md`。

#### 建議的下一步
下一位 agent 接手時，先依 `AGENTS.md` 的摘要閱讀順序進行 onboarding。若使用者接著評估 rough butterfly body，應同步更新 `docs/visual-style-guide.md` 與 `docs/current-risks-and-next-steps.md`。

---

### 2026-05-12 — RoughInsectBody 三段輪廓地基

#### 日期
2026-05-12

#### 任務摘要
依使用者要求回頭打好 `RoughInsectBody.js` 的地基：先不處理翅膀或身體本身的姿態角度，將 rough butterfly body 簡化成頭、胸、腹三個空心輪廓，內部不填色。

#### 使用者需求
使用者表示想回頭打好 `RoughInsectBody.js` 的地基，先不考慮或固定住翅膀或身體本身的角度，將身體構造簡化為頭、胸、腹三個圖形，而且只畫輪廓，內部不用填滿顏色。Codex 先提出計畫，使用者回覆「好」後才開始修改。

#### 實作前理解
上一版 rough butterfly body 已經加入 p5.brush 填色 mass、腹部分節、背線 highlight、胸毛、頭部點與觸角，視覺較豐富，但也讓基本身體比例不容易單獨判讀。使用者本輪不是要求再加細節，而是要退回更乾淨的結構地基，確認 head / thorax / abdomen 三段本身是否成立。

#### 實作方案
在 `createRoughInsectBodyPlan()` 中直接建立 `anatomy.head`、`anatomy.thorax`、`anatomy.abdomen` 三個固定縱向排列的橢圓參數，保留少量 seed-based 尺寸差異，但不再使用 body curve 或 pose-driven point。`drawRoughInsectBody()` 改為只呼叫新的 `drawRoughBodySimpleOutline()`，用 `drawRoughOutlineOval()` 畫三個 `noFill()` 輪廓。`InsectManager.js` 中暫時將 rough butterfly 的 `roughPosePlan` 設為 `null`，讓 body 與 wings 不再套用 pseudo-3D posePlan。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/testing-playbook.md`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
本輪沒有刪掉舊的 body helper，而是停止呼叫它們，方便之後回頭比較或逐層加回細節。保留 `wingRootY` 與 `wingRootHalfWidth`，避免翅膀定位接口壞掉。先停用 `createRoughInsectPosePlan()` 的套用，而不是刪除 pose 系統，因為這次目標是固定姿態建立 body 地基；未來仍可能回到離散 pose preset。

#### 遇到的問題
沙盒內 PowerShell 仍出現 `CreateProcessAsUserW failed: 5`，因此讀檔、語法檢查與 CDP 視覺測試都需要使用沙盒外執行。第一輪截圖顯示三段輪廓功能上成立，但在 `greenPlants.jpg` 背景與翅膀內部線條上偏淡，頭胸腹不夠像主結構。

#### 嘗試過的解法
第一版先改成三個空心輪廓並跑 `rough-body-three-outline-2026-05-12`。看過截圖後，Codex 判斷 body 地基太淡，因此做第二輪小調整：放大 head / thorax / abdomen 的 rx / ry，並提高輪廓線寬與 brush stroke alpha。第二輪重跑 `rough-body-three-outline-bolder-2026-05-12` 後，portrait / compact 的三段 body 明顯更可讀。

#### 最終解法
`RoughInsectBody.js` 現在以 `anatomy` 保存三個空心輪廓，繪製時只畫 abdomen、thorax、head 的 `pencil1` no-fill outline。內部填色、highlight、分節、短毛、頭部點與觸角都不再呼叫。`InsectManager.js` 暫時不建立 rough butterfly posePlan，因此 `bodyPlan.posePlan` 不會傳入 body 或 wings，讓本輪畫面專注於基礎比例。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過；`node --check Pages\ResultPage\InsectGenerator\InsectManager.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 瀏覽器：Google Chrome headless
- 裝置 / viewport：`portrait-390x844` runtime 約 `478x694`；`compact-360x740` runtime 約 `478x590`；`landscape-844x390` runtime 約 `822x240`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 是否有截圖：有，最終第二輪位於 `docs/cdp-runs/rough-body-three-outline-bolder-2026-05-12/screenshots/`；第一輪對照位於 `docs/cdp-runs/rough-body-three-outline-2026-05-12/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 預期畫面：rough butterfly body 應只顯示頭、胸、腹三個空心輪廓，沒有填色與內部裝飾
- 實際觀察：第二輪 portrait / compact 都能看出三段輪廓；landscape 也可見 body，但畫面高度與 Save / Back 按鈕位置讓構圖判讀較受干擾。portrait 完成 Save 下載與 Back 清除 result data。

#### Codex 審美自評
本輪約 `6.8/10`。優點是回到清楚的 body 地基，三段輪廓比上一版複雜 body 更容易檢查比例，也符合「只畫輪廓、不填色」的需求。第一輪偏淡，第二輪加粗後在植物背景中可讀性變好。弱點是視覺魅力刻意收掉，目前像結構草圖，不像完成品；頭胸腹與翅根仍偏機械，後續需要使用者判斷比例是否值得繼續加細節。

#### 使用者審美回饋
尚未收到本輪截圖後的使用者評分。已記錄使用者原始方向：先固定或不考慮角度，body 簡化為頭、胸、腹三個圖形，且只畫輪廓、內部不填色。

#### 尚未解決的風險
CDP canvas fixture 不能替代真實手機 AR / camera 測試。三段 body 目前只用 `greenPlants.jpg` 補測，尚未跑完整 `-CameraFixture all` 背景壓力測試。posePlan 暫停後，姿態變化暫時減少；後續若要回到側飛、俯仰或翻轉，需要重新設計三輪廓 body 的投影規則。

#### 使用者回饋或修正
使用者已批准先按計畫實作三輪廓 body 地基。等待使用者檢視第二輪截圖後，判斷三段比例、線寬與空心輪廓方向是否正確。

#### 建議的下一步
請使用者先評估三輪廓地基。如果比例與可讀性可接受，下一步可以只加回一層細節，例如觸角或腹部分節；若覺得三段仍不夠像昆蟲，應先調整頭胸腹比例與間距，再進入 pose preset 或翅膀角度。

---

### 2026-05-12 — 清理 body 筆觸粗細參數並拉長腹部

#### 日期
2026-05-12

#### 任務摘要
回答使用者對 `brushWeight` / `strokeWeight` 的疑問後，趁此修正 `RoughInsectBody.js` 裡的命名與用法混淆，讓 body 筆觸粗細統一由 `strokeWeight` 控制，同時加粗身體輪廓線並拉長腹部。

#### 使用者需求
使用者詢問 `brushWeight` 與 `strokeWeight` 在程式中的作用，以及 `docs/llms.txt` 是否有對應功能。理解後，使用者要求趁現在修正這個問題，順便把身體輪廓線加粗，並讓腹部輪廓再長一點。

#### 實作前理解
`docs/llms.txt` 中 p5.brush 的正式 API 是 `brush.set(name, color, weight)` 與 `brush.strokeWeight(weight)`。`brushWeight` 不是 library API，而是先前 `RoughInsectBody.js` helper 自訂的 option 名稱，實際上也只是傳給 `brush.set()` 的第三個 weight multiplier。這會和後續的 `brush.strokeWeight()` 形成兩套粗細控制，語意不乾淨，也容易讓未來調參誤判。

#### 實作方案
本輪只處理 `RoughInsectBody.js`，不動 `RoughInsectWings.js`。在 body helper 中移除所有 `brushWeight` option，將 `brush.set(..., 1)` 固定為選擇筆刷與顏色，真正的筆觸粗細統一交給 `brush.strokeWeight(options.strokeWeight)`。同時提高三個 body 輪廓的 `strokeWeight` 區間，並把 abdomen 的長度由約 `2.18-2.54u` 拉長到約 `2.78-3.22u`。

#### 檢視過的檔案
- `docs/llms.txt`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
選擇只清理 body 檔，因使用者本輪關注的是 `RoughInsectBody.js` 的地基與輪廓。`RoughInsectWings.js` 仍有一些 wing pattern layer 使用 `brushWeight` 作為自訂參數，暫時不一起改，避免影響翅膀視覺。body 中即使是目前未呼叫的舊 helper，也移除 `brushWeight` option，避免未來加回時再次混淆。

#### 遇到的問題
需要避免把 `brush.set()` 的第三個參數與 `brush.strokeWeight()` 都拿來同時調 body 粗細。若兩者同時存在，很難判斷截圖中線條變粗是因哪個參數造成。

#### 嘗試過的解法
先用 `rg` 搜尋 `brushWeight`、`strokeWeight`、`brush.set` 與 `brush.strokeWeight`，確認 body 檔中混用位置。接著移除所有 body helper 的 `brushWeight` option，並把 `drawHumanBrushStroke()` 與 `drawRoughOutlineOval()` 內的 `brush.set()` weight 固定為 `1`。修改後用 `rg` 確認 `RoughInsectBody.js` 中不再有 `brushWeight`。

#### 最終解法
`RoughInsectBody.js` 的 body 筆觸粗細現在只看 `strokeWeight`。三段輪廓的線寬區間提高為 abdomen 約 `1.85-2.42`、thorax 約 `1.82-2.36`、head 約 `1.55-2.02`。腹部輪廓比前一版更長，讓中心 body 的昆蟲主軸更明顯。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過；`node --check Pages\ResultPage\InsectGenerator\InsectManager.js` 通過
- 搜尋檢查：`rg -n "brushWeight" Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 無結果
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`rough-body-outline-weight-cleanup-2026-05-12`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/rough-body-outline-weight-cleanup-2026-05-12/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：portrait / compact 中 body 腹部更長，三段輪廓更有主結構感。landscape 仍可見 body，但按鈕與畫面高度仍限制構圖判讀。

#### Codex 審美自評
本輪約 `7.1/10`。優點是腹部長度更像昆蟲身體主軸，輪廓在植物背景中更穩定可讀，且參數語意比前一版乾淨。弱點是黑色輪廓變重後，會和翅膀內部線條搶視覺；後續若要加回分節、觸角或姿態，需要控制中心 body 不要變成過密的黑線團。

#### 使用者審美回饋
使用者本輪指出 `brushWeight` / `strokeWeight` 的語意問題並要求修正，也要求加粗身體輪廓線與拉長腹部。尚未收到本輪截圖後的視覺評分。

#### 尚未解決的風險
CDP canvas fixture 不能替代真實手機 AR / camera 測試。這次只清理 body 檔，未處理 wings 中的自訂 `brushWeight` 參數；若未來要全專案一致化，需要另行評估，避免翅膀視覺大幅改變。加粗 body 後，在暗背景或細節密集翅膀上可能顯得太黑。

#### 使用者回饋或修正
等待使用者檢視 `rough-body-outline-weight-cleanup-2026-05-12` 的截圖，確認腹部長度與輪廓線粗細是否合適。

#### 建議的下一步
如果使用者認可目前三段比例，下一步可加回單一細節層，例如先只加觸角，或先只加腹部分節。若使用者覺得黑線太重，應先微降 body `strokeWeight` 區間，再加細節。

---

### 2026-05-12 — 加回兩條簡單觸角線

#### 日期
2026-05-12

#### 任務摘要
在目前三段式 rough butterfly body 地基上，依使用者要求加入兩條簡單觸角線。

#### 使用者需求
使用者要求：「加上觸角，兩條線」。需求很明確，是在現有頭、胸、腹空心輪廓基礎上加回最小限度的觸角，不是加完整頭部裝飾或複雜細節。

#### 實作前理解
目前 body 地基已停用 posePlan，使用頭、胸、腹三個空心輪廓，且 `brushWeight` helper option 已從 body 檔移除，粗細統一由 `strokeWeight` 控制。本輪應維持這些規則，只增加左右兩條可讀的 antenna line。

#### 實作方案
在 `drawRoughBodySimpleOutline()` 畫完 head outline 後呼叫 `drawRoughSimpleAntennae()`。觸角從 head 上緣左右兩個 base point 起筆，經過一個中間控制點，向左右上方延伸。新增 `drawRoughAntennaLine()`，使用 `brush.set("pencil1", ink, 1)` 與 `brush.strokeWeight()` 畫線，fallback 則用 p5 原生 `curveVertex()`。

#### 檢視過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
本輪只加兩條線，不加端點球、分叉、填色或腹部分節，避免打破目前 body 地基的簡潔性。保留使用者手動微調過的腹部比例與 strokeWeight，沒有覆蓋既有 body 參數。觸角 helper 沒有使用 `brushWeight`，延續上一輪清理後的參數規則。

#### 遇到的問題
觸角需要可讀，但不能太粗或太長，否則會和翅膀上緣與內部線條混在一起。landscape viewport 中畫面高度低，觸角與 UI / 翅膀的判讀仍較不穩。

#### 嘗試過的解法
先用三點 brush path 畫左右觸角，base 在 head 上緣，尾端向左右上方外展。線寬設定在 `0.82-1.18`，比 head / thorax / abdomen 輪廓輕，讓它像附屬結構而不是主輪廓。

#### 最終解法
`RoughInsectBody.js` 新增 `drawRoughSimpleAntennae()` 與 `drawRoughAntennaLine()`。目前 body 繪製順序為 abdomen、thorax、head、antennae。觸角在 p5.brush 可用時用 `pencil1` 手繪線，否則用原生 p5 curve fallback。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過；`node --check Pages\ResultPage\InsectGenerator\InsectManager.js` 通過
- 搜尋檢查：`rg -n "brushWeight" Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 無結果
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`rough-body-simple-antennae-2026-05-12`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/rough-body-simple-antennae-2026-05-12/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：portrait / compact 中兩條觸角清楚可見，讓頭部更像昆蟲；landscape 也可見，但構圖仍受按鈕與高度限制。

#### Codex 審美自評
本輪約 `7.2/10`。優點是觸角讓 body 更像昆蟲，卻沒有把地基變複雜；兩條線在 portrait / compact 中可讀，沒有壓過頭胸腹輪廓。弱點是目前觸角仍偏符號，缺少更自然的手繪起筆與收筆魅力；但依使用者「兩條線」的範圍，本輪選擇不再加裝飾。

#### 使用者審美回饋
使用者要求加上觸角，兩條線。尚未收到本輪截圖後的評分。

#### 尚未解決的風險
CDP canvas fixture 不能取代真實手機 AR 測試。觸角在真實植物背景、深色背景或不同 seed 下可能與翅膀上緣混在一起。若未來做姿態 preset，觸角也需要跟著 head 方向重新投影。

#### 使用者回饋或修正
等待使用者確認觸角長度、角度與粗細是否符合預期。

#### 建議的下一步
若使用者認可觸角，下一步可選擇加腹部分節，或先微調觸角長度 / 外彎幅度。若覺得 body 地基已夠完整，再回到姿態或翅膀根部連動。

---

### 2026-05-12 — 新增「可手動微調參數」總結要求

#### 日期
2026-05-12

#### 任務摘要
將使用者要求的「之後做新功能時，要說明在哪裡調參數」正式加入專案協作流程。

#### 使用者需求
使用者表示，以後有做什麼新功能時要跟使用者說在哪裡改參數，接著要求把這件事新增到工作流程。

#### 實作前理解
本專案的視覺迭代高度依賴參數微調，例如 body 輪廓線寬、腹部長度、觸角張開距離與翅膀 pattern 密度。若 Codex 只回報改了什麼，而不說明可調參數在哪裡，使用者之後要手動微調會很不方便，也會讓未來 agent 忘記交代重要調參入口。

#### 實作方案
更新 `AGENTS.md` 的 Required collaboration workflow 與 Completion criteria，要求 Codex 在完成新功能或視覺調整後，提供可手動微調的參數說明，包括檔案路徑、function 名稱、參數名稱，以及數值調大 / 調小會造成的效果。同步更新 `docs/agent-quickstart.md`，讓後續 agent onboarding 時會看到此規則。

#### 檢視過的檔案
- `AGENTS.md`
- `docs/agent-quickstart.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `AGENTS.md`
- `docs/agent-quickstart.md`
- `docs/codex-worklog.md`

#### 決策紀錄
將此要求放入 `AGENTS.md` 的核心流程與完成標準，而不是只記在 worklog，確保未來每次 meaningful task 的 final summary 都必須包含調參資訊。`docs/agent-quickstart.md` 也同步補充，降低後續 agent 漏讀完整 `AGENTS.md` 細節時遺漏此要求的風險。

#### 遇到的問題
本次是流程文件更新，沒有程式或視覺輸出變更，因此不需要跑 CDP 視覺測試。

#### 嘗試過的解法
先檢視 `AGENTS.md` 中既有 Required collaboration workflow 與 Completion criteria，再新增「manual tuning notes」相關步驟。接著在 quickstart 的專案狀態中補一條簡短規則。

#### 最終解法
`AGENTS.md` 現在要求 Codex 在總結時提供新功能或變更行為的可手動調參位置與效果。Completion criteria 也新增 manual tuning notes。`docs/agent-quickstart.md` 已補充同樣規則。

#### 視覺驗證紀錄
本次沒有修改程式或視覺輸出，因此未執行瀏覽器截圖，也未更新 `docs/visual-test-log.md`。

#### Codex 審美自評
本次是流程規則更新，沒有視覺成品可評分。此規則有助於後續視覺合作，因使用者可以更直接接手微調參數。

#### 使用者審美回饋
本次沒有新的視覺審美評分。使用者新增的是協作流程偏好：每次做新功能或視覺調整後，都要說明參數在哪裡調。

#### 尚未解決的風險
未來 agent 仍需實際遵守此規則；若只寫文件但 final summary 漏掉調參位置，仍會造成使用者手動微調困難。

#### 使用者回饋或修正
使用者明確要求把「告知調參位置」加入工作流程，已完成。

#### 建議的下一步
後續任何功能或視覺改動的總結，固定加入「可手動微調的參數」段落，列出檔案、function、參數與調整效果。

---

### 2026-05-12 — 整理 rough insect 整體旋轉為 screen rotation plan

#### 日期
2026-05-12

#### 任務摘要
將 rough insect 的整體畫布旋轉從兩次隨機 rotate，整理成先選離散 screen rotation plan，再只套用一次 `rotate()`。

#### 使用者需求
使用者先確認 canvas `rotate()` 時翅膀是否會和身體同步，接著要求整理成「一次明確的整體旋轉」。使用者進一步指出旋轉角度不能在一大段範圍內隨機，而應該先決定 plan，每個 plan 有各自角度範圍，讓 plan 間差異更明顯。使用者也明確限定本階段不改變身體編排或翅膀變形，只確認整體轉向正確性。

#### 實作前理解
`drawRoughInsect()` 目前在 `translate(x, y)` 後先做一次 `random(-PI/4, PI/4)` rotate，之後因 `roughPosePlan` 暫時為 `null`，又在 fallback 分支做第二次 random rotate。這會讓整體方向不容易判讀，也不符合目前重打地基時需要的可控 plan 化方向。由於翅膀與 body 都在同一個 `push()/pop()` 座標系中繪製，只要整體 rotate 放在 draw calls 前，兩者會同步旋轉。

#### 實作方案
只修改 `Pages/ResultPage/InsectGenerator/InsectManager.js`。新增 `createRoughScreenRotationPlan(seedValue)`，用離散 plan 決定 `baseAngle`、`jitter` 與 `weight`，並用 `seededUnit(seedValue, salt)` 從 `currentSeed` 產生穩定的 plan 選擇與 jitter。`drawRoughInsect()` 先產生 `currentSeed`，再建立 `roughScreenRotationPlan`，最後只呼叫一次 `insectLayer.rotate(roughScreenRotationPlan.rotation)`。保留 `roughPosePlan = null`，且不改 `RoughInsectBody.js` 或 `RoughInsectWings.js`。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/current-risks-and-next-steps.md`
- `docs/testing-playbook.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `docs/agent-quickstart.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
本輪只處理 screen rotation，不處理 body pose 或 wing pose。plan 先包含 `uprightHover`、`diagonalRiseLeft`、`diagonalRiseRight`、`sideDriftLeft`、`sideDriftRight`。每個 plan 的 `jitter` 維持在約 7 至 9 度，避免回到大範圍隨機；plan 間 `baseAngle` 差距則保持明顯，讓後續多 seed 截圖時容易比較。

#### 遇到的問題
CDP 視覺測試的一次 run 只會抽到當下 seed 對應的一個 screen rotation plan。本輪截圖抽到接近直立 hover 的方向，因此可確認同步與單一旋轉，但尚不能用截圖代表所有 plan 都已審美通過。

#### 嘗試過的解法
先用 `node --check` 檢查 `InsectManager.js` 語法，再跑既有 CDP 測試流程。檢視 portrait、compact、landscape 三張 result 截圖，確認翅膀、身體、觸角在同一整體方向中同步旋轉。

#### 最終解法
`drawRoughInsect()` 移除原本前後兩次 random rotate。現在 rough insect 的整體方向由 `createRoughScreenRotationPlan(currentSeed)` 決定，並且只套用一次 `insectLayer.rotate()`。`roughPosePlan` 仍為停用狀態，不影響 body 編排或翅膀形變。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\InsectManager.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`rough-screen-rotation-plan-2026-05-12`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/rough-screen-rotation-plan-2026-05-12/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：翅膀、身體與觸角作為同一整體同步旋轉；沒有出現 body 與 wing 各自不同步的現象。本次 seed 接近直立 hover，尚未覆蓋全部 plan 分支。

#### Codex 審美自評
本輪約 `7.2/10`。優點是方向系統變乾淨，昆蟲不再因雙重 random rotate 產生難以判讀的任意斜角；body、wing、antennae 仍然像同一隻昆蟲。弱點是本次截圖沒有展示 plan 間差異，審美判斷主要集中在「同步、乾淨、未破壞地基」，還不是完整姿態設計評分。

#### 使用者審美回饋
使用者明確要求本階段只確認整體轉向正確性，不改變身體編排或翅膀變形。使用者也要求旋轉角度由 plan 分配，每個 plan 有自己的範圍，讓 plan 間差異更明顯。

#### 尚未解決的風險
CDP + fake camera 仍不能取代真實手機 AR 測試。所有 screen rotation plan 尚未逐一截圖比對；目前沒有測試入口可強制指定 plan id，因此後續若要審美比較，需要新增 debug / forced plan 參數或跑多 seed 截圖。landscape 仍容易被 Save / Back 按鈕與低高度影響構圖判讀。

#### 使用者回饋或修正
等待使用者確認這種 plan-based screen rotation 的方向是否符合地基階段需求，尤其是是否需要更大角度差、更多 plan，或暫時只保留少量方向。

#### 建議的下一步
若使用者認可這個整體轉向地基，下一步可加入測試用 forced screen rotation plan，方便逐一截圖 `uprightHover`、`diagonalRise`、`sideDrift`。之後再進入 body / wing posePlan，但仍應保持 screen rotation、body pose、wing pose 三層分離。

---

### 2026-05-12 — 修正 screen rotation plan 角度單位

#### 日期
2026-05-12

#### 任務摘要
檢查角度模式後，修正 `createRoughScreenRotationPlan()` 讓它配合目前全域 `angleMode(DEGREES)`，使不同 screen rotation plan 真的產生可見旋轉。

#### 使用者需求
使用者要求檢查角度模式的使用，確認不同 plan 是否真的會有旋轉效果。確認問題後，使用者要求「先只改 `createRoughScreenRotationPlan()`」，不要擴大修改 body、wing 或其他 rotate。

#### 實作前理解
`sketch.js` 的 setup 會呼叫 `angleMode(DEGREES)`，因此 p5 的 `rotate()` 會把傳入值當 degree。上一輪 `createRoughScreenRotationPlan()` 使用 `PI / 180` 產生弧度值，導致原本預期的 `-32°` 實際只傳入約 `-0.559°`，`58°` 實際只傳入約 `1.012°`，不同 plan 雖然有數值差異，但畫面上幾乎看不出來。

#### 實作方案
只修改 `Pages/ResultPage/InsectGenerator/InsectManager.js` 中的 `createRoughScreenRotationPlan()`。移除 `const angle = PI / 180`，將各 plan 的 `baseAngle` 與 `jitter` 直接改成 degree 數值，例如 `-32`、`32`、`-58`、`58`。不修改 `drawRoughInsect()`、`RoughInsectBody.js`、`RoughInsectWings.js` 或其他 rotate。

#### 檢視過的檔案
- `sketch.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`
- `docs/agent-quickstart.md`
- `docs/current-risks-and-next-steps.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `docs/agent-quickstart.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
依使用者要求，本輪只修正 screen rotation plan 的角度單位。雖然搜尋結果顯示專案其他檔案也有 `rotate()`，但那些可能牽涉 body / wing 內部姿態與既有視覺，本輪不碰，避免把整體轉向地基修正和內部變形混在一起。

#### 遇到的問題
角度模式是全域設定，`createRoughScreenRotationPlan()` 若使用弧度值，語法不會錯，但視覺幾乎沒有旋轉，容易誤以為 plan 抽到的是直立。這是視覺專案中「看起來沒壞但行為不符合預期」的典型問題。

#### 嘗試過的解法
先用 `rg` 搜尋 `angleMode` 與 `rotate()`，確認 `sketch.js` 有 `angleMode(DEGREES)`。接著用 Node 模擬原本弧度值在 degree 模式下的實際角度，確認 plan 差異只有約 `0.5°` 到 `1°`。修正後再用 Node 模擬不同 seed，確認可抽到 `38.30°`、`-52.63°`、`56.73°`、`-8.22°`、`-31.31°` 等明顯角度。

#### 最終解法
`createRoughScreenRotationPlan()` 現在直接使用 degree 數值：`uprightHover` 為 `0 ± 9°`，`diagonalRiseLeft / Right` 為 `±32 ± 8°`，`sideDriftLeft / Right` 為 `±58 ± 7°`。`drawRoughInsect()` 仍只套用一次 `insectLayer.rotate(roughScreenRotationPlan.rotation)`。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\InsectManager.js` 通過
- Node 模擬：不同 seed 可產生明顯 degree 旋轉角度
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`rough-screen-rotation-degrees-2026-05-12`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/rough-screen-rotation-degrees-2026-05-12/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：compact viewport 出現明顯側向飛行效果，portrait 與 landscape 也有可見整體斜向；翅膀、身體與觸角同步旋轉。

#### Codex 審美自評
本輪約 `7.4/10`。優點是 plan 的方向差異終於可見，側向圖像明顯比上一輪更符合「plan 間差異要清楚」的目標。弱點是這仍只是整體畫布旋轉，不是身體帶動的姿態；側向時內部 body / wing 沒有投影變形，但這符合使用者要求的本階段範圍。

#### 使用者審美回饋
使用者要求先只改 `createRoughScreenRotationPlan()`，避免擴大到身體編排或翅膀變形。

#### 尚未解決的風險
專案其他 `rotate()` 也可能受到 `angleMode(DEGREES)` 影響，但本輪未檢查或修正它們。若後續要處理 body / wing 內部姿態，需要另開一輪系統性檢查角度單位，並搭配視覺截圖，避免一次改太多造成風格變動。

#### 使用者回饋或修正
等待使用者確認目前 screen rotation 的 degree 範圍是否足夠清楚，尤其是 `sideDrift` 的角度是否太大或剛好。

#### 建議的下一步
下一步可新增 debug / forced screen rotation plan 入口，讓測試能指定 `uprightHover`、`diagonalRiseLeft`、`diagonalRiseRight`、`sideDriftLeft`、`sideDriftRight` 逐張截圖比較。若使用者想先維持現狀，也可以回頭檢查 body / wing 內部 rotate 的角度模式，但應另開一輪。

---

### 2026-05-13 — rough butterfly 對稱斑點與亮暗斑點規則

#### 日期
2026-05-13

#### 任務摘要
將 rough butterfly 翅膀花紋中的斑點改成左右對稱分布，並依翅膀本體平均亮度切換亮斑或暗斑，同時保留未來擴充斑點分布模式的架構。

#### 使用者需求
使用者希望翅膀花紋上的斑點分布位置左右對稱，參考真蝴蝶圖像中左右翅相互呼應的斑點與眼斑。使用者進一步補充：若翅膀本體顏色主要偏暗，畫的可能就是白斑；若本體偏亮時則畫黑斑，之後也可能擴充斑點分布模式。

#### 實作前理解
`RoughInsectWings.js` 中同一對翅膀已共用 `baseOutline` 與 `roughPattern`，左右翅透過 `g.scale(side * ...)` 做鏡像，因此大輪廓可對稱。但斑點原本在 `drawRoughWingRimSpots()` 與 `drawRoughWingEyeSpots()` 內依單側繪製流程即時 random，加上左右翅使用不同 `strokeSeed`，導致左右斑點位置不會穩定對稱。正確做法應是先建立一份共用的斑點位置計畫，再讓左右翅在各自鏡像 transform 中畫同一份 local 座標。

#### 實作方案
在 `drawRoughWingPairFromPlan()` 產生 `baseOutline` 後，先計算 `bounds`、`center`、`colorProfile` 與 `symmetricSpotPlan`。新增 `createRoughWingSpotPlan()` 生成共用斑點資料，包含 `rimSpots`、`innerSpots`、`eyeSpots`，並保留 `rim-chain`、`inner-scatter`、`rim-and-inner` 三種模式骨架。新增 `createRoughWingSpotPalette()` 依 `averageBrightness` 決定 `dark-on-light` 或 `light-on-dark`，讓亮翅偏黑斑、暗翅偏白斑。`drawRoughWingButterflyPattern()` 若收到 `patternPlan.spotPlan`，改由 `drawRoughWingSpotPlan()` 使用共用座標繪製；若沒有 spot plan，仍保留舊 fallback。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/testing-playbook.md`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/InsectWings.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
斑點對稱只鎖定「分布位置」，不是把整隻翅膀的所有筆觸變成完全一致。左右翅仍可保留外輪廓、粒子筆觸與 brush roughness 的手繪差異。斑點顏色被獨立成 `spotPalette`，避免未來新增分布模式時重寫明暗判斷。第一次截圖後，Codex 判斷斑點太含蓄，因此提高斑點 alpha、半徑與內側斑點數量，讓手機 viewport 上能看出新行為。

#### 遇到的問題
第一輪 `sym-spots-20260513` 截圖中，亮綠 fake camera 背景與亮綠翅膀讓暗斑不夠明顯，黑斑容易被翅脈線吃掉。`colorToBrushPaint()` 會用 fallback alpha 作為上限，初版 `getRoughWingSpotPaint()` 傳入的 alpha cap 偏低，也讓斑點可讀性不足。

#### 嘗試過的解法
先跑 `node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 確認語法。接著跑 `scripts/run-cdp-visual-test.ps1 -RunId "sym-spots-20260513" -ForcedFinalPitch 0 -ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36` 做第一輪 CDP 截圖。觀察後調高 `rimSpots` / `innerSpots` 的數量與半徑，並提高 `getRoughWingSpotPaint()` 的 alpha cap，再跑第二輪 `sym-spots-20260513-v2`。

#### 最終解法
`drawRoughWingPairFromPlan()` 現在為每一對 forewing / hindwing 建立一份 `symmetricSpotPlan`，並包進 `resolvedWingStylePlan.pattern.spotPlan` 傳給左右翅。`createRoughWingSpotPlan()` 產生同一組 local 斑點座標，因此左右翅經由原本鏡像 transform 會自然對稱。`createRoughWingSpotPalette()` 依 `averageBrightness >= 58` 選擇 `dark-on-light` 或 `light-on-dark`，並提供 `primary`、`secondary`、`core` 三個 paint role 給 rim spots、inner spots 與 eye spots 使用。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 第一輪 Run id：`sym-spots-20260513`
- 第二輪 Run id：`sym-spots-20260513-v2`
- Camera：Chrome fake camera 預設亮綠畫面
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/sym-spots-20260513-v2/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：第二輪 compact viewport 中蝴蝶本體較清楚，可看到左右翅斑點與點列有成對呼應；portrait 中昆蟲與亮綠形狀部分重疊，仍能確認流程但不適合做細節審美判斷。

#### Codex 審美自評
本輪約 `7.1/10`。優點是斑點分布開始像真蝴蝶一樣左右呼應，而且明暗斑點規則與分布模式骨架已經清楚。弱點是 fake camera 的亮綠背景太極端，亮綠翅膀上的黑斑仍會和翅脈線競爭；目前是架構與方向成立，但還不到漂亮完成版。

#### 使用者審美回饋
使用者提出希望斑點分布位置左右對稱，並明確補充暗色翅膀可用白斑、亮色翅膀可用黑斑，之後可能擴充更多斑點分布模式。

#### 尚未解決的風險
尚未用真實手機 AR / camera 驗證，也尚未固定深色翅膀 seed 來檢查白斑效果。`rim-chain`、`inner-scatter`、`rim-and-inner` 目前是骨架，還不是完整的蝴蝶品種花紋語法。若斑點加太多，可能與 body 及翅脈搶視覺，後續需要依使用者回饋微調密度。

#### 使用者回饋或修正
等待使用者看截圖或實機後評估：斑點是否夠明顯、是否太像印章、黑斑 / 白斑規則是否符合預期，以及下一步想擴充哪一種分布模式。

#### 建議的下一步
建議下一步新增可 forced wing brightness / palette 的 debug 測試入口，分別固定暗色翅膀與亮色翅膀截圖，確認白斑與黑斑都可讀。若使用者想先做美術方向，可優先擴充「外緣珠串」或「翅中黑點群」兩種真蝴蝶常見模式。

---

### 2026-05-13 — 抽離 rough wing 筆刷設定

#### 日期
2026-05-13

#### 任務摘要
將 `RoughInsectWings.js` 中多處硬編碼的 p5.brush 筆刷名稱、brush set 第三參數、`strokeWeight`、`beginShape` roughness、pressure 與 fill texture 相關數值，集中抽離到獨立的 `RoughWingBrushSettings.js`，讓使用者之後可以分層調整翅膀各部位效果。

#### 使用者需求
使用者說明自己私下修改過翅膀斑點模式，日誌沒有紀錄，因此後續不應依舊日誌覆蓋斑點邏輯。使用者要求將昆蟲翅膀中硬編碼的筆刷設定獨立出來，讓每個部份效果更好調整，並指定 `ROUGH_WING_BRUSH_SETTINGS` 可以獨立成一份檔案。使用者也提供前一輪 body `brushWeight` / `strokeWeight` 清理日誌片段，提醒 wings 中仍有自訂 `brushWeight` 語意需要整理。

#### 實作前理解
`RoughInsectWings.js` 同時負責翅膀幾何、斑點分布、筆觸路徑與 p5.brush 材質設定。外輪廓、Voronoi 翅脈、底色粒子、rim band、radial band、斑點、accent、高光、wash、loose patch 都直接寫入 `brush.set()`、`strokeWeight()`、`beginShape()`、`fillBleed()` 或 `fillTexture()` 的數值。這些值分散在檔案各處，會讓使用者很難單獨調整某一層。另一方面，使用者私下改過斑點模式，所以本輪必須保護 `createRoughWingSpotPlan()` 的現行分布邏輯，只抽離實際落筆的材質與粗細設定。

#### 實作方案
新增 `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`，以全域 `var ROUGH_WING_BRUSH_SETTINGS` 保存各層設定。`index.html` 在 `RoughInsectWings.js` 前載入此檔。`RoughInsectWings.js` 新增 `getRoughWingBrushSettings()`、`roughSettingValue()`、`roughSettingInt()`、`roughClampSetting()` helper，讓設定檔中的數值可以是固定值或 `[min, max]` 區間。將原本的 `brushWeight` 自訂名稱改成 `brushLoad`，用來表示 p5.brush `brush.set(name, color, weight)` 的第三個材質 / 載色強度參數，避免和 `brush.strokeWeight()` 混淆。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/testing-playbook.md`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `index.html`
- `Pages/ResultPage/ResultPageSettings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `scripts/run-cdp-visual-test.ps1`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `index.html`
- `docs/agent-quickstart.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
選擇新增獨立 settings 檔，而不是把設定物件留在 `RoughInsectWings.js`，符合使用者希望設定獨立的要求。設定檔只集中筆刷材質、粗細、pressure、roughness、wash texture 等視覺強度參數，不改斑點座標、模式、數量與 progress 的生成流程。命名上使用 `brushLoad` 取代 `brushWeight`，保留 p5.brush 第三參數的可調性，但減少與線寬 `strokeWeight` 的語意混淆。

#### 遇到的問題
Windows sandbox 對一般讀檔指令多次回傳 `CreateProcessAsUserW failed: 5`，因此讀檔、搜尋、語法檢查與 CDP 測試都透過核准後的 PowerShell 指令執行。另需注意新 settings 檔必須在 `RoughInsectWings.js` 之前載入，否則 browser runtime 會找不到 `ROUGH_WING_BRUSH_SETTINGS`。

#### 嘗試過的解法
先用 `rg` 搜尋 `brush.set`、`strokeWeight`、`beginShape`、`circle`、`fillBleed`、`fillTexture`、`brushWeight` 等位置，確認硬編碼集中在 wings 檔。接著新增 settings 檔，逐層替換外輪廓、Voronoi、particle fill、rim band、radial band、pattern dot、accent、specular、radial wash、loose patch 的設定來源。最後用 `rg -n "brushWeight"` 確認 wing 相關檔案不再有 `brushWeight` 識別字。

#### 最終解法
`ROUGH_WING_BRUSH_SETTINGS` 現在包含 `outline`、`voronoi`、`particleFill`、`rimBand`、`radialBand`、`patternDot`、`accent`、`specular`、`radialWash`、`loosePatch` 等區塊。`RoughInsectWings.js` 仍保留幾何、分布與筆觸路徑；實際筆刷名稱、brush load、線寬、roughness、pressure clamp 與 texture 區間改由 settings 讀取。`index.html` 已新增 settings 檔載入順序。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughWingBrushSettings.js` 通過
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\InsectManager.js` 通過
- 搜尋檢查：`rg -n "brushWeight" Pages\ResultPage\InsectGenerator\RoughInsectWings.js Pages\ResultPage\InsectGenerator\RoughWingBrushSettings.js` 無結果
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`rough-wing-brush-settings-refactor-2026-05-13`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/rough-wing-brush-settings-refactor-2026-05-13/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：三個 viewport 都成功進入 Result，portrait 完成 Save / Back。昆蟲、翅膀輪廓、翅脈、斑點、body 與觸角皆正常出現，沒有因新設定檔載入造成空白或例外。

#### Codex 審美自評
本輪約 `7.0/10`。優點是重構沒有破壞目前手繪翅膀結構，斑點與翅脈仍可讀，並且未來可以更清楚地分層調整每一種筆觸。弱點是本輪不是美術精修，植物背景上的黑色翅脈與斑點仍偏搶眼；若下一輪要改善觀感，可先降低 `voronoi.strokeWeight`、`voronoi.brushLoad` 或 `patternDot.strokeWeight`，再觀察斑點是否更乾淨。

#### 使用者審美回饋
使用者指出自己私下修改過翅膀斑點模式，日誌沒有紀錄；本輪要求將昆蟲翅膀中硬編碼的筆刷設定獨立出來，方便調整每個部份效果，並明確同意 `ROUGH_WING_BRUSH_SETTINGS` 可以獨立成一份檔案。

#### 尚未解決的風險
CDP + fixture 不能取代真實手機 AR / camera 測試。settings 抽離雖然保留原數值，但每次從設定檔調參後仍需重新截圖確認。`createRoughWingSpotPlan()` 的現行斑點模式包含使用者私下修改內容，未來若要改斑點分布，必須先讀目前程式碼並保護使用者的意圖。

#### 使用者回饋或修正
等待使用者檢查新的 `RoughWingBrushSettings.js` 分層是否符合調參習慣，尤其是 `brushLoad` 命名是否足夠清楚，以及是否需要再拆更細的斑點 / 翅脈設定。

#### 建議的下一步
建議下一步可用 settings 做一輪小型視覺調參：先只降低 `voronoi.strokeWeight` 或 `patternDot.strokeWeight`，比較翅脈、斑點與 body 的視覺競爭是否改善。若使用者要繼續擴充斑點模式，應先備註目前私下修改過的模式規則，再改 `createRoughWingSpotPlan()`。

---

### 2026-05-13 — 移除 rough wing settings 的 brushLoad

#### 日期
2026-05-13

#### 任務摘要
依使用者要求與 `docs/llms.txt` 的 p5.brush API 說明，移除 `RoughWingBrushSettings.js` 中容易混淆的 `brushLoad` 類參數，讓 rough wing 的可調粗細集中於 `strokeWeight`，頂點壓力集中於 `brush.vertex(..., pressure)` 對應的 pressure 設定。

#### 使用者需求
使用者先要求確認 `RoughWingBrushSettings.js` 中註解是否正確，且參數是否都有對應到 `docs/llms.txt`。在釐清 `brush.set(name, color, weight)` 與 `brush.strokeWeight(weight)` 都是 weight multiplier 後，使用者要求若可以捨棄 `brushLoad` 就移除，避免誤會。

#### 實作前理解
`docs/llms.txt` 明確寫出 `brush.set(name, color, weight)` 的第三參數是 weight multiplier，`brush.strokeWeight(weight)` 也是設定 weight multiplier。若 settings 同時暴露 `brushLoad` 與 `strokeWeight`，使用者會誤以為前者是墨水量、後者是粗細，但依文件兩者其實都屬於 weight multiplier。更乾淨的做法是讓 `brush.set()` 固定第三參數 `1`，只用 `strokeWeight` 調整線寬 / weight，用 `brush.vertex(x, y, pressure?)` 的第三參數調整筆畫過程中的 pressure。

#### 實作方案
從 `RoughWingBrushSettings.js` 移除 `brushLoad`、`initialBrushLoad`、`darkBrushLoad`、`brightBrushLoad`、`brushLoadJitter`。在 `RoughInsectWings.js` 將所有 `brush.set(settings.brushName, color, ...)` 的第三參數固定為 `1`。更新 `drawRoughWingPatternStroke()` 與 `drawRoughWingGlintStroke()` 的函式簽名，不再傳入 brush load。順便將 `radialWash.fillTextureScale` 改名為 `fillTextureBorderIntensity`，因 `docs/llms.txt` 中 `brush.fillTexture(textureStrength, borderIntensity, scatter?)` 的第二參數是 `borderIntensity`，不是 scale。

#### 檢視過的檔案
- `docs/llms.txt`
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
選擇徹底移除 `brushLoad`，而不是保留並加註說明，因使用者明確希望避免誤會。`brush.set()` 第三參數固定為 `1`，讓該呼叫只負責選擇筆刷與顏色；真正可調的 weight multiplier 交給 `strokeWeight`，筆畫中段的濃淡 / 收筆交給 pressure 相關參數。這與先前 body 清理 `brushWeight` / `strokeWeight` 混淆的方向一致。

#### 遇到的問題
需要小心更新所有呼叫簽名，避免 `drawRoughWingPatternStroke()` 或 `drawRoughWingGlintStroke()` 仍用舊參數順序。另需注意移除 `brushLoad` 後可能讓線條視覺有所差異，因此不能只跑語法檢查。

#### 嘗試過的解法
先用 `rg` 搜尋 `brushLoad`、`initialBrushLoad`、`darkBrushLoad`、`brightBrushLoad`、`brushLoadJitter` 與相關函式呼叫。移除 settings 中的欄位後，將 renderer 中所有 `brush.set()` 第三參數改為 `1`，並更新 `fillTextureBorderIntensity` 的名稱與使用位置。接著跑語法檢查、搜尋確認與 CDP 視覺測試。

#### 最終解法
`RoughWingBrushSettings.js` 已不再包含任何 `brushLoad` 類欄位。`RoughInsectWings.js` 中所有 rough wing 筆刷初始化都使用 `brush.set(..., 1)`，後續再呼叫 `brush.strokeWeight()` 或 `brush.vertex(..., pressure)` 控制可調效果。`radialWash.fillTextureBorderIntensity` 現在正確對應 `brush.fillTexture()` 第二參數。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughWingBrushSettings.js` 通過
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 搜尋檢查：`rg -n "brushLoad|initialBrushLoad|darkBrushLoad|brightBrushLoad"` 只剩歷史文件紀錄，程式檔中無結果
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`rough-wing-remove-brushload-2026-05-13`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/rough-wing-remove-brushload-2026-05-13/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：三個 viewport 都成功進入 Result，portrait 完成 Save / Back。翅膀輪廓、翅脈、斑點、body 與觸角皆正常出現，未觀察到空白、消失或線條突然爆粗。

#### Codex 審美自評
本輪約 `7.0/10`。優點是設定語意更貼近 `docs/llms.txt`，未來調參更不容易混淆，且視覺仍正常可讀。弱點是本輪不是美術精修，黑色翅脈與斑點在植物背景中仍偏重；但這應透過 `strokeWeight` 或 pressure 參數調整，而不是重新引入 `brushLoad`。

#### 使用者審美回饋
使用者要求回答必須依據 `docs/llms.txt`，並在理解 `brushLoad` 容易造成誤會後，指示「如果可以捨棄 brushLoad 就去掉，避免誤會」。

#### 尚未解決的風險
CDP + fixture 仍不能替代真實手機 AR / camera 測試。移除 `brushLoad` 後目前只驗證 greenPlants fixture 與三個 viewport；若後續使用者調整 `strokeWeight` 或 pressure，仍需逐輪截圖確認。歷史 worklog 中仍會保留過去提到 `brushLoad` 的紀錄，但最新摘要已說明目前狀態。

#### 使用者回饋或修正
等待使用者確認新的 settings 命名是否符合調參習慣，尤其是 `fillTextureBorderIntensity` 是否比原本的 `fillTextureScale` 更清楚。

#### 建議的下一步
若要繼續整理註解，可逐項標註哪些是 p5.brush 直接 API 對應，哪些是專案自訂生成參數。若要做視覺調整，建議先小幅降低 `voronoi.strokeWeight` 或 `patternDot.strokeWeight`，觀察黑線與斑點是否更不搶 body。

---

### 2026-05-13 — 拆分 rough wing 斑點筆刷設定

#### 日期
2026-05-13

#### 任務摘要
依使用者要求，讓 rough butterfly 的 `rim-chain`、`inner-scatter` 與眼紋分別套用不同的 p5.brush 設定，避免所有斑點都共用 `patternDot`。

#### 使用者需求
使用者希望 `rim-chain`、`inner-scatter` 及眼紋能分別套用不同筆刷設定。Codex 先閱讀目前 `RoughWingBrushSettings.js` 與 `RoughInsectWings.js`，提出拆分設定、保留 fallback、只改呼叫路徑不重寫斑點分布的方案；使用者回覆「好」後開始實作。

#### 實作前理解
目前斑點分布由 `createRoughWingSpotPlan()` 產生，`rimSpots`、`innerSpots`、`eyeSpots` 最後都呼叫 `drawRoughWingPatternDot()`，因此共用 `ROUGH_WING_BRUSH_SETTINGS.patternDot`。若要讓三種模式有不同筆刷，不需要改分布邏輯，只要讓各繪製函式傳入不同 settings。眼紋有 ring / middle / core 三層，應再細分成三組 brush settings，方便之後調外圈穩定度、中層柔度與核心銳利度。

#### 實作方案
在 `RoughWingBrushSettings.js` 新增 `rimChainSpot`、`innerScatterSpot` 與 `eyeSpot.ring / middle / core`，保留 `patternDot` 作為 fallback。在 `RoughInsectWings.js` 新增 `getRoughWingSpotBrushSettings(settingsKey, nestedKey)`，並讓 `drawRoughWingPatternDot()` 可接收指定 settings。`drawRoughWingRimSpotPlan()` 使用 `rimChainSpot`，`drawRoughWingInnerSpotPlan()` 使用 `innerScatterSpot`，`drawRoughWingEyeSpotPlan()` 分別使用眼紋三層設定。舊 fallback 函式 `drawRoughWingRimSpots()` 與 `drawRoughWingEyeSpots()` 也接上同樣設定。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/testing-playbook.md`
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
選擇只拆分筆刷設定，不改 `createRoughWingSpotPlan()` 的 mode / count / position，因使用者先前私下修改過斑點模式，必須以現行程式為準延續。`patternDot` 保留為 fallback，避免未來 settings 漏填時造成斑點消失或 runtime error。初始視覺意圖為：`rimChainSpot` 偏乾、偏細；`innerScatterSpot` 稍厚、稍柔；`eyeSpot` 外圈較穩、中層柔、核心較銳利。

#### 遇到的問題
本次 CDP 隨機結果沒有明顯生成大眼紋，因此截圖只能確認接口穩定與一般斑點繪製正常，無法完整審美比較 `rim-chain`、`inner-scatter` 與眼紋三種模式。另在 `git diff` 中看到前一輪尚未提交的 `brushLoad` 清理變更，Codex 沒有回復或覆蓋，只在本輪新增斑點筆刷拆分。

#### 嘗試過的解法
先用 `node --check` 檢查兩個 JS 檔。接著用 `scripts/run-cdp-visual-test.ps1` 搭配 `greenPlants` fixture、`ForcedFinalPitch 0` 與 forced spawn 跑三個 viewport。視覺上確認 Result 有昆蟲且沒有新增錯誤；因需求是接口拆分，不做額外加粗或改色的自我調參，以免混入未經使用者確認的美術方向。

#### 最終解法
`RoughWingBrushSettings.js` 現在包含 `patternDot` fallback、`rimChainSpot`、`innerScatterSpot` 與 `eyeSpot.ring / middle / core`。`RoughInsectWings.js` 的 plan-based 與 fallback 斑點繪製路徑都會依類型傳入對應 settings。未來調整不同斑點筆刷時，可只修改 settings 檔。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughWingBrushSettings.js` 通過
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`rough-wing-spot-brush-split-2026-05-13`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/rough-wing-spot-brush-split-2026-05-13/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：三個 viewport 都成功進入 Result，portrait 完成 Save / Back。翅膀輪廓、翅脈、body 與觸角正常出現，未觀察到斑點筆刷拆分造成空白或爆粗。

#### Codex 審美自評
本輪約 `7.1/10`。優點是筆刷控制接口更細，日後可以獨立調整 rim-chain、inner-scatter、眼紋的材質與粗細；截圖中昆蟲仍可讀，沒有破壞整體。弱點是本次 seed 的斑點差異偏細微，沒有大眼紋可直接審美判斷；greenPlants 背景上，黑色翅脈與細小斑點仍容易和植物紋理競爭。這輪沒有做視覺加粗或改色，因需求主要是拆分設定。

#### 使用者審美回饋
使用者希望 `rim-chain`、`inner-scatter` 與眼紋能分別套用不同筆刷設定，並同意 Codex 先拆分設定與呼叫路徑。尚未提供本輪截圖分數。

#### 尚未解決的風險
尚未用多 seed 或強制模式分別驗證 `rim-chain`、`inner-scatter`、眼紋三種模式的視覺差異。CDP + fixture 仍不能取代真實手機 AR / camera 測試。若未來調大眼紋外圈，需注意不要讓眼紋壓過 body 或翅脈。

#### 使用者回饋或修正
等待使用者確認三組筆刷設定命名與初始粗細是否符合調參習慣。

#### 建議的下一步
若要視覺化三種設定差異，建議新增或臨時使用 forced spot mode / 多 seed 測試，分別截出 `rim-chain`、`inner-scatter`、眼紋。調參時可先改 `RoughWingBrushSettings.js` 的 `rimChainSpot.strokeWeight`、`innerScatterSpot.strokeWeight`、`eyeSpot.ring.strokeWeight`、`eyeSpot.middle.strokeWeight`、`eyeSpot.core.strokeWeight`。

---

### 2026-05-13 — 眼紋改用高彩度 hue 互補色

#### 日期
2026-05-13

#### 任務摘要
依使用者要求，將 rough butterfly 的眼紋顏色從「依平均亮度選深斑 / 淺斑」改成「只依 hue 取互補色」，並把彩度範圍拉高。

#### 使用者需求
使用者先詢問目前眼斑顏色如何決定與使用的顏色模式。確認目前是 HSB 決策、轉 RGB 給 p5.brush 後，使用者要求改成不考慮 `averageBrightness`，只計算 hue 使用對比色，並補充「彩度可以範圍取高一點的」。

#### 實作前理解
眼紋顏色集中在 `Pages/ResultPage/InsectGenerator/RoughInsectWings.js` 的 `createRoughWingSpotPalette()`。舊版先用 `averageBrightness >= 70` 決定 `useDarkSpots`，再分成暗斑或亮斑兩套路徑。實際繪製仍是 HSB 計算後用 `hsbToRgb()` 轉成 `rgb(r, g, b)` 字串，透過 `drawRoughWingEyeSpotPlan()` 的 `ring / middle / core` 三層畫出。

#### 實作方案
保留三層眼紋結構，但刪除 `useDarkSpots` 與 `averageBrightness` 分支。改用 `complementHue = wrapHue(stronger.h + 180)` 作基準，外圈在互補色附近小幅 jitter，中層在互補色兩側更大偏移，核心則接近外圈但亮度較低。彩度 clamp 改成偏高範圍：外圈約 `68-96`、中層約 `62-90`、核心約 `54-84`。最後清理函式簽名，讓 `createRoughWingSpotPalette(g, stronger)` 不再接收未使用的亮度與對比參數。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/testing-playbook.md`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
選擇讓「是否取對比色」只依 hue 決定，不再用 `averageBrightness` 切換深斑或淺斑。亮度仍給固定值，原因是完全只改 hue 而不控制 brightness 會讓眼紋在不同底色上可能太灰或太刺；本輪的解讀是決策不看平均亮度，但顏料本身仍需要穩定的亮度層次。三層 brightness 固定為外圈 `58`、中層 `78`、核心 `18`，讓核心保持眼點感。

#### 遇到的問題
既有 CDP 測試腳本沒有 forced eye-spot 參數，原本可能只能驗證 Result 沒壞，無法保證截圖有眼紋。這次 `greenPlants` fixture 的隨機結果剛好抽到可見紫色眼紋，因此可做初步審美判讀，但未來若要精修仍需要多 seed 或 forced eye-spot 測試入口。

#### 嘗試過的解法
先用 `node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 做語法檢查，接著用 `scripts/run-cdp-visual-test.ps1 -RunId eye-spot-complement-hue-2026-05-13 -CameraFixture greenPlants -ForcedFinalPitch 0 -ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36` 跑三個 viewport。視覺確認後，又清理 `createRoughWingSpotPalette()` 的未使用參數並重新執行 `node --check`。

#### 最終解法
`createRoughWingSpotPalette()` 現在只接收 `g` 與 `stronger`。外圈、內圈、核心都從 `stronger.h + 180` 附近產生高彩度互補色，回傳 `tone: "hue-complement"`。呼叫端 `analyzeRoughWingColorPair()` 也改成 `createRoughWingSpotPalette(g, stronger)`。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`eye-spot-complement-hue-2026-05-13`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/eye-spot-complement-hue-2026-05-13/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：三個 viewport 都成功進入 Result，portrait 完成 Save / Back。portrait 可見較大的紫色眼紋，compact 與 landscape 可見較小紫點。綠色翅膀上的紫色互補斑比舊亮度規則更醒目。

#### Codex 審美自評
本輪約 `7.4/10`。優點是眼紋色相差更清楚，紫色互補斑在綠色翅膀上有明確存在感，符合使用者要求的 hue 對比與較高彩度。弱點是外圈仍偏像紫色圓點，還不是很自然的蝴蝶眼紋層次；小 viewport 中紫點會與黑色翅脈競爭。這輪沒有做第二次視覺調整，因為配色方向已達成，下一步應先讓使用者判斷彩度是否過高或剛好。

#### 使用者審美回饋
使用者要求「不考慮 averageBrightness，只計算 hue 來使用對比色」，並補充「彩度可以範圍取高一點的」。尚未對本輪截圖給分。

#### 尚未解決的風險
尚未用多 seed 或強制眼紋模式驗證所有主色 hue 下的互補色結果。高彩度互補色在真實手機相機背景中可能過飽和，也可能與黑色翅脈競爭。CDP + fixture 仍不能取代真實手機 AR / camera 測試。

#### 使用者回饋或修正
等待使用者確認 purple / complementary eyespot 的彩度、亮度與三層比例是否符合期待。

#### 建議的下一步
若要繼續精修眼紋，建議新增 forced eye-spot 測試入口或臨時多 seed 截圖，避免每次靠隨機抽到眼紋。可調參數集中在 `Pages/ResultPage/InsectGenerator/RoughInsectWings.js` 的 `createRoughWingSpotPalette()`：`primaryHue / secondaryHue / coreHue` 的 jitter 控制色相分離；三個 saturation clamp 控制彩度；三個 brightness 數值控制外圈、中層與核心明暗。形狀與筆刷粗細則在 `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js` 的 `eyeSpot.ring / middle / core.strokeWeight`。

---

### 2026-05-13 — 修正互補色只套用 EyeSpots

#### 日期
2026-05-13

#### 任務摘要
依使用者澄清，修正前一輪實作，讓高彩度 hue 互補色只套用於 EyeSpots，一般 `rim-chain` / `inner-scatter` 斑點維持原本 `spotPalette`。

#### 使用者需求
使用者指出剛才沒有說明清楚：「只有 EyeSpots 的需要這樣使用對比色」。這表示一般斑點不應一起使用 hue 互補色。

#### 實作前理解
前一輪把 `createRoughWingSpotPalette()` 整個改成互補色，但 `getRoughWingSpotPaint()` 同時供 `drawRoughWingRimSpotPlan()`、`drawRoughWingInnerSpotPlan()` 與 `drawRoughWingEyeSpotPlan()` 使用，因此一般斑點也會被改成互補色。正確架構應該是保留一般 `spotPalette`，再新增只給眼紋用的 `eyeSpotPalette`。

#### 實作方案
恢復 `createRoughWingSpotPalette(g, stronger, quieter, averageBrightness, hueDistance, alreadyContrasty)` 的舊亮斑 / 暗斑規則，供 rim / inner 一般斑點使用。新增 `createRoughWingEyeSpotPalette(g, stronger)`，把 hue 互補色與較高彩度 clamp 移到這個專用函式。`analyzeRoughWingColorPair()` 同時回傳 `spotPalette` 與 `eyeSpotPalette`。新增 `getRoughWingEyeSpotPaint()`，讓 plan-based `drawRoughWingEyeSpotPlan()` 與 fallback `drawRoughWingEyeSpots()` 只從 eye palette 取色。

#### 檢視過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
選擇分離 palette，而不是在 `getRoughWingSpotPaint()` 裡用 role 或呼叫者條件判斷，因為 EyeSpots 是明確不同的語意層。這樣未來若調高互補色彩度，只會影響 `eyeSpotPalette`，不會污染 rim-chain 或 inner-scatter。

#### 遇到的問題
CDP 測試腳本仍沒有 forced eye-spot 參數；本輪隨機結果沒有抽到大 EyeSpots，因此只能確認流程穩定與一般斑點未被互補色污染，無法完整評估互補色眼紋本身。

#### 嘗試過的解法
先檢視 `RoughInsectWings.js` 中 `analyzeRoughWingColorPair()`、`createRoughWingSpotPalette()`、`drawRoughWingEyeSpotPlan()` 與 fallback `drawRoughWingEyeSpots()` 的關係。修改後執行 `node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js`，再用 `scripts/run-cdp-visual-test.ps1 -RunId eye-spot-complement-only-2026-05-13 -CameraFixture greenPlants -ForcedFinalPitch 0 -ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36` 驗證三個 viewport。

#### 最終解法
`spotPalette` 已恢復為一般斑點使用的亮斑 / 暗斑 palette；新增 `eyeSpotPalette` 專供 EyeSpots 使用高彩度 hue 互補色。`drawRoughWingRimSpotPlan()` 與 `drawRoughWingInnerSpotPlan()` 仍走 `getRoughWingSpotPaint()`；`drawRoughWingEyeSpotPlan()` 與 `drawRoughWingEyeSpots()` 改走 `getRoughWingEyeSpotPaint()`。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`eye-spot-complement-only-2026-05-13`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/eye-spot-complement-only-2026-05-13/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：三個 viewport 都成功進入 Result，portrait 完成 Save / Back。本輪沒有抽到大 EyeSpots，但一般小斑點未整體變成互補紫色，昆蟲、翅膀、body 與觸角正常。

#### Codex 審美自評
本輪約 `7.2/10`。優點是職責更準確，只有 EyeSpots 會取得互補色，一般斑點回到原本與翅膀亮度關係較一致的視覺語法。弱點是本輪截圖無法評估 EyeSpots 互補色本身，仍需要 forced eye-spot 或多 seed 截圖。

#### 使用者審美回饋
使用者澄清只有 EyeSpots 需要使用對比色，一般斑點不應使用互補色。此回饋已同步到摘要文件。

#### 尚未解決的風險
尚未以 forced eye-spot 穩定驗證互補色眼紋。真實手機背景上，EyeSpots 的互補色仍可能過飽和或與翅脈競爭。CDP + fixture 仍不能取代真實手機 AR / camera 測試。

#### 使用者回饋或修正
等待使用者確認新的分流是否符合預期：一般斑點維持原本 palette，只有 EyeSpots 使用互補色。

#### 建議的下一步
若要繼續精修，建議新增 forced eye-spot 測試入口。一般斑點顏色調整應改 `createRoughWingSpotPalette()`；EyeSpots 互補色調整應改 `createRoughWingEyeSpotPalette()`；EyeSpots 形狀與粗細調整仍在 `RoughWingBrushSettings.js` 的 `eyeSpot.ring / middle / core.strokeWeight`。

---

### 2026-05-14 — Rough Butterfly Body 填色與腹部環紋

#### 日期
2026-05-14

#### 任務摘要
替 rough butterfly 的頭、胸、腹新增 p5.brush 手繪填色，並在腹部加入可隨 seed 變化的環狀紋理。

#### 使用者需求
使用者希望接著替身體上色，上色筆刷先比照翅膀。頭、胸、腹顏色可以不同也可以完全相同，例如頭胸一個顏色、腹部另一個顏色。顏色範圍可包含常見黑或褐色、翅膀主色或其對比色，腹部也可加環狀紋理。使用者後續修正：body 色彩不一定要將主色和對比色調成低彩度。

#### 實作前理解
目前 `RoughInsectBody.js` 的 butterfly body 是頭、胸、腹三個空心輪廓加兩條觸角，沒有填色。翅膀先畫、body 後畫，因此 body 填色會位於翅膀上方。翅膀色彩來源是 `InsectManager.js` 中的 `topColors[0]` 與 `topColors[1]`，body 若要引用翅膀主色或對比色，需要從 `drawRoughInsectBody()` 傳入 `color1` / `color2`。

#### 實作方案
在 `RoughInsectBody.js` 新增 `createRoughBodyColorPlan()`，用 seed 從自然黑 / 褐、翅膀主色、翅膀對比色之間選擇 body palette。主色與對比色不強制低彩度，而是用 brightness / saturation 範圍控制可讀性，保留部分高彩度結果。新增 `drawRoughBodyColorMasses()` 與 `drawRoughFilledBodyOval()`，使用 `marker1`、`brush.fill()`、`fillBleed()`、`fillTexture()` 產生手繪填色。新增 `drawRoughAbdomenRingBands()`，在腹部橢圓內畫 4 到 7 條略彎環紋。最後仍由 `drawRoughBodySimpleOutline()` 畫黑色 pencil 輪廓與觸角，保住結構。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/testing-playbook.md`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `index.html`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
選擇讓 body 直接重用 `RoughInsectWings.js` 已載入的 `wrapHue()`、`hsbToRgb()`、`colorToBrushPaint()`，避免再建立一套重複色彩轉換。Body palette 保留自然黑褐色，也保留主色 / 對比色高彩度可能性，以符合使用者修正。填色先畫在輪廓之前，輪廓與觸角仍位於最上方，避免填色削弱頭胸腹的可讀性。

#### 遇到的問題
初版填色若只沿橢圓邊緣走筆，容易變成有色輪廓而不是真正身體上色。因此改用 `brush.fill()`、`fillBleed()`、`fillTexture()` 填滿封閉橢圓，再補一圈較淡的 marker 邊緣筆觸。

#### 嘗試過的解法
先新增 body color plan 與環紋，再以 parser 檢查 `RoughInsectWings.js`、`RoughInsectBody.js`、`InsectManager.js`。視覺上確認填色語法後，調整 `drawRoughFilledBodyOval()`，讓 body fill 成為真正的封閉形狀填色，而不是只沿邊緣描線。

#### 最終解法
`drawRoughInsectBody()` 現在可接收 `wingColor1` / `wingColor2`，由 `InsectManager.js` 傳入翅膀色彩。`createRoughBodyColorPlan()` 產生 head、thorax、abdomen、band paint，以及填色 pass、腹部環紋數量與線寬。`drawRoughBodyColorMasses()` 依序畫腹部填色、腹部環紋、胸部填色、頭部填色，再交給既有 `drawRoughBodySimpleOutline()` 畫輪廓與觸角。

#### 視覺驗證紀錄
- 語法檢查：以 Node `new Function()` parse `RoughInsectWings.js`、`RoughInsectBody.js`、`InsectManager.js`，皆通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- Run id：`body-color-fill-2026-05-14`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：位於 `docs/cdp-runs/body-color-fill-2026-05-14/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：三個 viewport 都成功進入 Result，portrait 完成 Save / Back。portrait 可見偏紫褐 body 與腹部細環紋；compact 可見偏深綠黑 body，較融合但仍可讀；landscape 可見昆蟲，但按鈕仍靠近昆蟲。

#### Codex 審美自評
本輪約 `7.5/10`。優點是 body 不再只是空心三輪廓，中心有實體手繪質感；偏紫褐 body 與綠色翅膀形成舒服的色相差，腹部環紋讓昆蟲感更明確。弱點是深綠黑 body 在葉片背景上仍偏低調，小尺寸下環紋要靠輪廓才容易讀到。這輪沒有再做第二次視覺調整，因為 body 已可讀，再加重填色或環紋可能讓中心與翅膀內線搶視覺。

#### 使用者審美回饋
使用者提出 body 上色方向，並修正「body 色彩不一定要將主色和對比色調成低彩度」。此回饋已同步到摘要文件。

#### 尚未解決的風險
尚未用多 seed 檢查黑 / 褐、主色、對比色 body 的比例與穩定性。高彩度 body 在真實手機相機背景上可能過飽和，也可能與翅膀斑點競爭。CDP + fixture 仍不能取代真實手機 AR / camera 測試。

#### 使用者回饋或修正
等待使用者確認 body 填色、主色 / 對比色彩度、腹部環紋密度是否符合期待。

#### 建議的下一步
若要調 body 色彩，優先改 `Pages/ResultPage/InsectGenerator/RoughInsectBody.js` 的 `createRoughBodyColorPlan()`：`naturalPalettes` 控制黑 / 褐自然體色，`linkedPalettes` 控制主色與對比色策略，`tuneRoughBodyHSB()` 的 `sat` / `bri` 範圍控制彩度與亮度。若要調填色厚度，改 `drawRoughBodyColorMasses()` 傳給 `drawRoughFilledBodyOval()` 的 `passes`、`strokeWeight`、`pressureBase`、`pressureTaper`；數值提高會讓 body 更重、更顯眼，降低會更透明。若要調腹部環紋，改 `createRoughBodyColorPlan()` 的 `abdomenBandCount`、`abdomenBandWeight` 與 `abdomenBandChance`；數量或線寬提高會更像分節，降低會更簡潔。

---

### 2026-05-14 — Rough Dragonfly / Moth 第一版

#### 日期
2026-05-14

#### 任務摘要
在 rough 手繪生成模式中新增蜻蜓與蛾，讓蝴蝶尚未完成的情況下，也能用同一套 p5.brush / rough wing 模式生成另外兩種昆蟲。

#### 使用者需求
使用者表示「雖然蝴蝶部分尚未完成，但希望套用同樣的模式畫出手繪蜻蜓及蛾」。在計畫確認後，使用者補充「蛾只要有一對翅膀，但是要有很多眼斑」。因此本輪蛾的重點不是雙翅層次，而是單一大翅對與大量眼斑。

#### 實作前理解
`drawRoughInsect()` 雖然會依 `finalPitch` 判斷 `insectType`，但後面硬性設定 `insectType = 0`，導致 rough mode 實際只會畫蝴蝶。`createRoughInsectBodyPlan()` 與 `drawRoughInsectBody()` 也只支援 type 0。舊版非 rough generator 已有 `drawDragonflyBody()`、`drawMothBody()`、`drawDragonflyWings()`、`drawMothWings()` 可作結構參考，但手繪版需要自己的 body plan、wing plan 與眼斑策略。

#### 實作方案
移除 rough mode 中的 `insectType = 0` 硬鎖，讓 `finalPitch` 判斷重新生效。擴充 `RoughInsectBody.js`：type 1 建立蜻蜓寬頭、短胸、極長細腹與密集腹節；type 2 建立蛾小頭、寬毛胸、短胖腹、羽狀觸角與胸部毛感。擴充 `RoughInsectWings.js`：type 1 使用兩對狹長 wing pair、淡化蝴蝶式斑點；type 2 使用一對大而圓鈍的 moth wing pair，並以 `createRoughMothEyeSpotPlan()` 強制產生多排眼斑。另在 `InsectWings.js` 的 `generateWingOutline()` 補上 `wingStyle = 2`，讓 rough moth 可共用既有單邊翅膀 renderer。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/testing-playbook.md`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/InsectBody.js`
- `Pages/ResultPage/InsectGenerator/InsectWings.js`
- `scripts/run-cdp-visual-test.ps1`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/InsectWings.js`
- `docs/visual-style-guide.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
蛾採用「一對翅膀」的使用者指定方向，因此沒有做像蝴蝶一樣的 fore / hind 雙翅層。蛾的眼斑不使用蝴蝶的偶發 `useEyeSpots` 機率，而是走 `useMothEyeField` 與 `createRoughMothEyeSpotPlan()`，固定生成多排眼斑。蜻蜓為避免像蝴蝶，強制空 `spotPlan` 並關閉 radial bands / eye spots，保留較透明、翅脈主導的視覺。

#### 遇到的問題
rough wing 底層使用 `generateWingOutline()` 產生填色與剪裁輪廓，而手繪外輪廓使用 `generateBowedWingOutline()`。若只新增其中一個的 moth wing style，填色與外輪廓會不一致，因此兩處都補了 `wingStyle = 2` 的圓鈍蛾翅控制點。Landscape 截圖中蛾靠近上方並被 Save / Back 按鈕遮擋，仍是構圖驗證風險。

#### 嘗試過的解法
先擴充 body plan，再擴充 wing plan，最後移除 manager 的 rough type 硬鎖。語法檢查使用 `node --check` 分別檢查 `InsectManager.js`、`RoughInsectBody.js`、`RoughInsectWings.js`、`InsectWings.js`。視覺檢查用 CDP 腳本強制 `finalPitch`：`30` 驗證蜻蜓，`-60` 驗證蛾。

#### 最終解法
`drawRoughInsect()` 現在會建立三種昆蟲的 `roughBodyPlan`，並用同一流程先畫 rough wings、再畫 rough body。蜻蜓使用 `drawRoughDragonflyWingPairs()` 與 `createRoughDragonflyWingPairPlans()` 畫兩對窄翅，body details 追加大眼與密集腹節。蛾使用 `drawRoughMothWingPair()` 與 `createRoughMothEyeSpotPlan()` 畫一對大翅與大量眼斑，body details 追加羽狀觸角與胸部毛感。

#### 視覺驗證紀錄
- 語法檢查：`node --check` 通過 `InsectManager.js`、`RoughInsectBody.js`、`RoughInsectWings.js`、`InsectWings.js`
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 蜻蜓 run id：`rough-dragonfly-20260514`
- 蛾 run id：`rough-moth-20260514`
- Camera fixture：Chrome fake camera 預設畫面
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：蜻蜓 `-ForcedFinalPitch 30`；蛾 `-ForcedFinalPitch -60`
- Forced spawn：`-ForcedSpawnRatioX 0.42 -ForcedSpawnRatioY 0.34`
- 截圖：位於 `docs/cdp-runs/rough-dragonfly-20260514/screenshots/` 與 `docs/cdp-runs/rough-moth-20260514/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：蜻蜓 portrait 可見長細腹、兩對狹長翅與淡翅脈；蛾 portrait 可見一對大翅與多排紫色眼斑。蛾 landscape 被 Save / Back 遮擋，不適合當作構圖通過判定。

#### Codex 審美自評
蜻蜓約 `7.2/10`。優點是類型辨識成立，長腹與兩對窄翅清楚避開蝴蝶語彙；弱點是姿態仍偏平面標本，透明翅的輕盈感與身體帶動姿態可再強化。蛾約 `7.4/10`。優點是單一大翅對與大量眼斑明確回應使用者需求；弱點是 body 在多眼斑翅面中偏弱，羽狀觸角與胸部毛感在手機尺寸不夠突出。這輪未再做第二次視覺調整，因為第一版已達成類型可分與蛾多眼斑的主要目標，下一輪更適合依使用者對眼斑密度、蛾翅形與蜻蜓透明感的回饋調整。

#### 使用者審美回饋
使用者明確要求蛾只要一對翅膀，但要有很多眼斑。此回饋已寫入 `docs/visual-style-guide.md`，作為後續判斷 rough moth 是否成功的重要標準。

#### 尚未解決的風險
尚未使用真實手機相機測試 rough dragonfly / moth 的 AR 疊合、相機權限、效能與觸控流程。尚未用多 seed 或 fixture 背景檢查蛾眼斑是否穩定好看，也尚未解決 landscape 中 Save / Back 可能遮擋昆蟲的問題。蜻蜓和蛾目前也尚未接入離散 pose preset。

#### 使用者回饋或修正
等待使用者確認蛾的眼斑密度是否足夠、單一翅對外形是否像蛾，以及蜻蜓是否需要更透明或更動態。

#### 建議的下一步
若要調蛾的眼斑密度，改 `Pages/ResultPage/InsectGenerator/RoughInsectWings.js` 的 `createRoughMothEyeSpotPlan()`：`rows[].count` 增加會讓每排眼斑更多，`radiusScale` 增加會讓眼斑更大、更搶，`yBias` 會改變眼斑上下分布。若要調蛾翅外形，改 `createRoughMothWingPairPlan()` 的 `params.length`、`params.width`、`params.tipY`，或 `InsectWings.js` / `RoughInsectWings.js` 中 `wingStyle = 2` 的 bezier 控制點；`width` 增加會更厚、更像蛾，`tipY` 增加會讓翅尖下垂。若要調蜻蜓，改 `createRoughDragonflyWingPairPlans()` 的 `params.length` / `params.width` / `scaleY`；`length` 增加會更修長，`width` 或 `scaleY` 降低會更透明細窄。若要調身體，改 `createRoughDragonflyBodyPlan()` 的 `bottomY` 距離與 `abdomen.rx`，或 `createRoughMothBodyPlan()` 的 `thorax.rx` / `abdomen.rx`；數值增加會讓身體更有存在感。

---

### 2026-05-14 — 修正蛾外框與蜻蜓側眼

#### 日期
2026-05-14

#### 任務摘要
重新檢查 rough moth 翅膀外框未顯示的原因，修正外框生成與 p5.brush 狀態設定；同時把 rough dragonfly 頭部兩個小黑點改成靠側面的兩個大黑圓 / 橢圓複眼。

#### 使用者需求
使用者質疑前一輪對蛾外框問題的推測，要求重新確認筆刷設定與函式呼叫順序。確認原因後，使用者要求除了修改蛾外，也把蜻蜓眼睛改成頭部靠側面的兩個大黑圓或橢圓。

#### 實作前理解
前一輪回答把蛾沒有外框主要歸因於外框太細或被眼斑視覺蓋掉，這不夠準確。重新沿著 `drawRoughWing()` 的順序檢查後，發現底色與花紋先由 `drawRoughWingColor()` 與 `drawRoughVoronoiPattern()` 畫完，再由 `generateBowedWingOutline()` 與 `drawEdgeWithOvershoot()` 畫外框。底色輪廓使用 `generateWingOutline()`，已支援 `wingStyle = 2`；但外框使用的 `generateBowedWingOutline()` 尚未支援 `wingStyle = 2`。同時 `drawEdgeWithOvershoot()` 只呼叫 `brush.set()` 與 `brush.strokeWeight()`，沒有重設 `brush.noFill()` 與 `brush.stroke()`，容易被前面 `brush.noStroke()` 狀態影響。

#### 實作方案
在 `RoughInsectWings.js` 的 `generateBowedWingOutline()` 補上 `case 2`，使用與 moth base outline 相同的圓鈍翅控制點，讓外框與底色輪廓一致。並在 `drawEdgeWithOvershoot()` 中每次畫外框前明確呼叫 `brush.noFill()` 與 `brush.stroke(settings.color)`，避免依賴上一層 brush 狀態。於 `RoughInsectBody.js` 新增 `drawRoughDragonflySideEyes()`，將原本 `drawRoughDragonflyBodyDetails()` 中的兩個小 `drawRoughPressureDot()` 改為左右側的黑色手繪填色橢圓。

#### 檢視過的檔案
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
採納使用者對 root cause 的提醒，將蛾外框問題視為函式分歧與 brush 狀態問題，而非單純審美強度問題。蜻蜓眼睛不再用點狀暗示，改為使用 `drawRoughFilledBodyOval()` 產生手繪黑色側眼，讓材質與 rough body 其他填色一致。

#### 遇到的問題
`g.push()` / `g.pop()` 不會保護 p5.brush 的全域 stroke / fill 狀態，因此若外框函式沒有自行設定 stroke，前面圖層留下的 `brush.noStroke()` 可能讓外框消失。另一個問題是 moth 的 `wingStyle = 2` 先前只補到 base outline，沒有補到 bowed outline。

#### 嘗試過的解法
先用 `rg` 和局部檔案讀取確認 `drawRoughWing()` 呼叫順序，再檢查 `RoughWingBrushSettings.js` 的 outline 設定與 `drawEdgeWithOvershoot()` 的 brush 呼叫。確認問題後只做兩個小修正：補 bowed outline case 與重設 brush stroke；蜻蜓眼睛則替換成新的 side-eye helper。

#### 最終解法
`generateBowedWingOutline()` 現在支援 `wingStyle = 2`，蛾外框可依同一組 moth control points 生成。`drawEdgeWithOvershoot()` 在 `brush.beginShape()` 前會明確設定 `brush.noFill()`、`brush.stroke(settings.color)` 與 `brush.strokeWeight(strokeWeight)`。`drawRoughDragonflyBodyDetails()` 改呼叫 `drawRoughDragonflySideEyes()`，在頭部左右側畫兩個較大的黑色橢圓。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectWings.js` 通過
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 蛾 run id：`rough-moth-outline-20260514`
- 蜻蜓 run id：`rough-dragonfly-eyes-20260514`
- Camera fixture：Chrome fake camera 預設畫面
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：蛾 `-ForcedFinalPitch -60`；蜻蜓 `-ForcedFinalPitch 30`
- Forced spawn：`-ForcedSpawnRatioX 0.42 -ForcedSpawnRatioY 0.34`
- 截圖：位於 `docs/cdp-runs/rough-moth-outline-20260514/screenshots/` 與 `docs/cdp-runs/rough-dragonfly-eyes-20260514/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：蛾 portrait 外框已恢復，單一大翅對輪廓更清楚；蜻蜓 portrait 頭部左右側可見大黑眼，不再是中央小黑點。

#### Codex 審美自評
蛾約 `7.8/10`。外框恢復後，多眼斑不再像漂浮在沒有邊界的色塊上，單一翅對更成立；弱點是外框仍偏細，複雜真實背景中可能需要 moth 專用外框強度。蜻蜓約 `7.5/10`。側眼方向比小黑點正確，寬頭複眼感更強；弱點是手機尺寸下眼睛仍略小，後續可再增加側向位移或 rx。

#### 使用者審美回饋
使用者指出應重新確認筆刷設定與函式呼叫順序，並要求蜻蜓眼睛改成頭部靠側面的兩個大黑圓或橢圓。這次修正直接回應該回饋。

#### 尚未解決的風險
尚未用真實手機背景確認蛾外框在複雜影像上是否足夠清楚。蜻蜓大側眼在不同 seed、不同 body 色彩與不同縮放下可能仍需調整大小與外凸程度。真機 AR / camera、DeviceOrientation、效能與觸控仍未驗證。

#### 使用者回饋或修正
等待使用者評估蛾外框是否符合預期，以及蜻蜓側眼是否夠大、夠靠外側。

#### 建議的下一步
若蛾外框仍偏弱，優先調 `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js` 的 `outline.strokeWeightsByPass`，提高第一個值會讓主外框更重，提高第二個值會讓手繪複線更明顯；若只想影響蛾，可在 `drawEdgeWithOvershoot()` 增加 moth 專用參數。若蜻蜓眼睛要更大，調 `Pages/ResultPage/InsectGenerator/RoughInsectBody.js` 的 `drawRoughDragonflySideEyes()`：提高 `rx` / `ry` 會放大眼睛，提高 `head.rx * 0.72` 的倍率會讓眼睛更靠頭部外側。

---

### 2026-05-14 — 修正蛾 body 筆刷狀態與羽狀觸角層級

#### 日期
2026-05-14

#### 任務摘要
依使用者判斷，檢查 rough moth 身體框線與觸角未顯示的原因，修正 body 階段沒有穩定設定 p5.brush stroke 的問題，並讓蛾的羽狀觸角最後繪製。

#### 使用者需求
使用者指出蛾的身體框線都沒有畫出來，包括觸角，要求檢查筆刷設定和函式呼叫順序；後續也認同問題很可能是在畫 body 前沒有設定到 brush。

#### 實作前理解
先前已確認 rough moth 翅膀外框問題來自 bowed outline 與 wing brush stroke 狀態。本輪再看 body，發現 `drawRoughInsect()` 目前工作區狀態已強制 `insectType = 2`，因此確實會進入蛾分支。呼叫順序為 `drawRoughInsectWings()` 先、`drawRoughInsectBody()` 後，body 不應被翅膀蓋掉。問題更像是 p5.brush 的 fill / noStroke / texture / wash 狀態跨函式殘留，導致 body outline 與 antenna 的 pencil stroke 不穩定或太弱。

#### 實作方案
在 `RoughInsectBody.js` 新增 `resetRoughBodyBrushStroke()`，每次 body outline 或 antenna 下筆前都明確清掉 hatch / wash / fill / stroke 狀態，再重新設定 `pencil1`、`brush.stroke()` 與 `brush.strokeWeight()`。將 body 繪製順序調整為色塊、類型細節、外框，並將蛾羽狀觸角移到外框之後最後畫。觸角主幹與羽枝略加粗，讓手機尺寸可讀。

#### 檢視過的檔案
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `docs/agent-quickstart.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
採納使用者對 root cause 的判斷：body 問題不是沒有進入 moth 分支，也不是呼叫順序被翅膀蓋住，而是 body 線條不應依賴前一階段留下的 brush 狀態。`g.push()` / `g.pop()` 不能保護 p5.brush 的全域 stroke / fill 狀態，因此 body stroke helper 必須自行重設。沒有改動目前工作區中的 `insectType = 2` 測試鎖定，避免擅自覆蓋使用者或前序工作狀態。

#### 遇到的問題
初始檢查截圖 `inspect-moth-outline-20260514` 顯示蛾翅與眼斑正常，但 body 黑色外框與觸角幾乎不可見。第一次加入 body brush reset 後，body 中軸與頭胸腹框線明顯恢復，但觸角仍偏細小。第二次才將觸角移到 body outline 之後最後畫，並提高主幹與羽枝 stroke weight。

#### 嘗試過的解法
先用 `rg` 確認 `drawRoughInsect()`、`drawRoughInsectWings()`、`drawRoughInsectBody()`、`drawRoughBodySimpleOutline()` 與 `drawRoughMothBodyDetails()` 的呼叫順序。接著用 CDP 截圖比對修正前、body brush reset 後、最終觸角層級三個狀態。過程中沒有私下大量調參，只做兩輪聚焦調整。

#### 最終解法
`drawRoughInsectBody()` 現在進入 body 繪製前先呼叫 `resetRoughBodyBrushStroke()`，並在色塊與類型細節後繪製 body outline。`drawRoughAntennaLine()` 與 `drawRoughOutlineOval()` 都改用 `resetRoughBodyBrushStroke()`，每條線與每個 outline pass 都重新設定 `pencil1` stroke。蛾觸角從 `drawRoughMothBodyDetails()` 移到 `drawRoughInsectBody()` 最後，並加粗主幹與羽枝。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過兩次
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 修正前 run id：`inspect-moth-outline-20260514`
- body brush 修正 run id：`fix-moth-body-brush-20260514`
- 最終 run id：`fix-moth-antenna-final-20260514`
- Camera fixture：Chrome fake camera 預設畫面
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch -60`
- Forced spawn：`-ForcedSpawnRatioX 0.50 -ForcedSpawnRatioY 0.40`
- 截圖：位於 `docs/cdp-runs/fix-moth-antenna-final-20260514/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：body 框線與中軸恢復可讀，觸角在頭部上方可見但仍保持細節角色，沒有壓過蛾翅眼斑。

#### Codex 審美自評
最終版本約 `7.2/10`。優點是 body 不再像淡色糊在翅膀中央，頭胸腹輪廓重新保住昆蟲結構，羽狀觸角也能作為蛾的細節線索。弱點是手機尺寸下觸角仍偏小，若希望一眼看出蛾的櫛齒觸角，需要再提高 `antennaSpread`、`antennaLength` 或羽枝粗細。

#### 使用者審美回饋
使用者指出蛾 body 框線與觸角都沒有畫出來，並判斷「是在畫body前沒有設定到brush」。本輪驗證與修正結果支持此判斷。

#### 尚未解決的風險
尚未用真實手機背景或多 seed 確認 body outline 與羽狀觸角在複雜影像上都穩定可見。觸角目前是保守加強，若使用者期待更誇張的蛾類識別，仍需下一輪視覺調參。真機 AR / camera、DeviceOrientation、效能與觸控仍未驗證。

#### 使用者回饋或修正
等待使用者確認這版 body 框線是否已符合預期，以及觸角要維持細節感或再放大成更明顯的蛾特徵。

#### 建議的下一步
若要讓蛾觸角更明顯，調 `Pages/ResultPage/InsectGenerator/RoughInsectBody.js` 的 `createRoughMothBodyPlan()`：提高 `antennaSpread` 會讓左右觸角更外展，提高 `antennaLength` 會讓觸角更長、更突出。也可調 `drawRoughMothFeatherAntennae()`：提高主幹 `strokeWeight` 會讓觸角骨架更黑，提高外側 / 內側羽枝 `strokeWeight` 會讓櫛齒感更強，提高 `branchCount` 會讓羽枝更密。若 body 框線要更重，調 `drawRoughBodySimpleOutline()` 中 abdomen / thorax / head 的 `strokeWeight`；數值增加會讓頭胸腹外框更黑、更像墨線，但也會和翅膀眼斑競爭。

---

### 2026-05-14 — 強制蛾 body 最後黑色結構線

#### 日期
2026-05-14

#### 任務摘要
依使用者重新檢視的判斷，將 rough moth body 問題從「共用 brush 沒設定」收斂為「蛾的 body 框線 / 觸角看起來跟著身體顏色走」，並為 moth 增加最後一層強制黑色結構線與較明顯的黑色羽狀觸角。

#### 使用者需求
使用者指出蝴蝶和蜻蜓的身體框線都是黑的，只有蛾的框線好像跟著身體顏色走，因此要求試著修正蛾的筆刷或顏色設定。

#### 實作前理解
重新聚焦後，若蝴蝶與蜻蜓 body outline 正常，問題不應只歸因於共用 `drawRoughOutlineOval()` 或 `resetRoughBodyBrushStroke()` 完全失效。`drawRoughFilledBodyOval()` 會在 body 填色後用 `paintInfo.color` 畫同色系邊線；`drawRoughMothBodyDetails()` 又會用 `colorPlan.band` 畫 moth-only 的短毛 / 紋理筆觸。因此蛾的彩色 body / band 筆觸可能視覺上主導了身體邊線，使使用者看到的線不像黑色外框。

#### 實作方案
在 `RoughInsectBody.js` 新增 `drawRoughMothBlackStructureOverlay()`，只針對 `bodyPlan.insectType === 2` 在最後重畫 abdomen、thorax、head 的黑色 `pencil1` outline，再繪製黑色羽狀觸角。同步調整 `resetRoughBodyBrushStroke()`，移除準備畫 stroke 前的 `brush.noStroke()`，並改用與成功翅膀外框較一致的 `brush.stroke(colorValue)`。第一輪截圖後發現觸角仍偏弱，因此第二輪放大 `drawRoughMothFeatherAntennae()` 的 base、spread、length 與 stroke weight。

#### 檢視過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `docs/visual-test-log.md`
- `docs/visual-style-guide.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`
- `docs/visual-style-guide.md`

#### 決策紀錄
本輪不再把問題描述成「所有 body stroke 都沒有設定 brush」，因為蝴蝶與蜻蜓正常顯示黑框。採納使用者的新判斷：moth-only 的彩色 body 邊線與 band 短毛可能讓蛾 body 框線看起來不是黑色。因此使用 moth-only 最後黑色 overlay，而不是大幅改共用 body outline 或移除 body palette。保留 colored moth fur，避免一次把視覺質地全部拿掉。

#### 遇到的問題
第一輪 `fix-moth-black-structure-20260514` 的黑色 body 結構比前版明確，但觸角仍不夠清楚；這符合使用者先前「觸角完全沒畫出來」的觀察，表示只加黑色 overlay 還不夠。第二輪才提高觸角外展、長度與線寬。

#### 嘗試過的解法
先用 `rg` 與局部檔案讀取確認 body color plan、`drawRoughFilledBodyOval()` 的同色邊線、`drawRoughMothBodyDetails()` 的 `colorPlan.band` 筆觸，以及真正黑色 outline 的呼叫順序。接著改程式、跑 `node --check`，再用 CDP 跑兩輪 forced moth 截圖：`fix-moth-black-structure-20260514` 與 `fix-moth-black-structure-v2-20260514`。

#### 最終解法
`drawRoughInsectBody()` 在共用 body outline 後，若是 moth 會呼叫 `drawRoughMothBlackStructureOverlay()`。該 helper 最後用黑色重畫 abdomen / thorax / head outline，並呼叫黑色 `drawRoughMothFeatherAntennae()`。`resetRoughBodyBrushStroke()` 不再呼叫 `brush.noStroke()`，且使用 `brush.stroke(colorValue)` 避免 alpha 參數形式造成顏色 / stroke 狀態判讀不穩。`drawRoughMothFeatherAntennae()` 的 `baseY`、`baseGap`、`spread`、`len` 與 stroke weight 已放大，讓觸角在手機截圖中更容易讀到。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過兩次
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 第一輪 run id：`fix-moth-black-structure-20260514`
- 第二輪 run id：`fix-moth-black-structure-v2-20260514`
- Camera fixture：Chrome fake camera 預設畫面
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch -60`
- Forced spawn：`-ForcedSpawnRatioX 0.50 -ForcedSpawnRatioY 0.40`
- 截圖：位於 `docs/cdp-runs/fix-moth-black-structure-v2-20260514/screenshots/`
- Console 錯誤：每個 viewport 仍有一筆已知 404 resource event，未阻止流程；未觀察到新增 JavaScript exception
- 實際觀察：第二輪 portrait / compact 中可見黑色 body 結構與頭部上方較清楚的黑色羽狀觸角；觸角仍保持細節角色，未壓過翅膀眼斑。

#### Codex 審美自評
約 `7.4/10`。優點是方向更貼近使用者觀察：蛾 body 不再只像彩色身體邊緣，最後一層黑線能把頭胸腹結構壓回來，觸角也比前一輪更像有畫出來。弱點是蛾的頭胸區和眼斑翅面仍很密，觸角在真實背景或不同 seed 下可能仍需更誇張的 silhouette。

#### 使用者審美回饋
使用者重新檢視後指出，蛾的問題應該是部分筆刷設定或顏色設定有問題，因為蝴蝶和蜻蜓的身體框線是黑的，但蛾的框線好像會跟著身體顏色走。本輪修正直接回應此判斷，並修正前一輪過度聚焦共用 brush reset 的說法。

#### 尚未解決的風險
尚未用真實手機背景、多 seed 或 fixtures 壓力測試確認黑色 overlay 都穩定可見。若 body palette 抽到很深的顏色，黑線與身體仍可能黏在一起。若使用者想要更明確的蛾類櫛齒觸角，還需要再提高觸角外展與羽枝密度。真機 AR / camera、DeviceOrientation、效能與觸控仍未驗證。

#### 使用者回饋或修正
等待使用者確認第二輪黑色 body 結構線與觸角是否符合「黑框有畫出來」的預期，以及觸角是否要再更明顯。

#### 建議的下一步
若黑線還是不夠黑或不夠像外框，調 `Pages/ResultPage/InsectGenerator/RoughInsectBody.js` 的 `drawRoughMothBlackStructureOverlay()`：提高 abdomen / thorax / head 的 `strokeWeight` 會讓 moth 專用黑框更重，提高 `passes` 會讓手繪複線更明顯。若觸角要更像蛾，調 `drawRoughMothFeatherAntennae()`：提高 `spread` 倍率會讓左右更外展，提高 `len` 倍率會讓觸角更長，提高主幹與羽枝 `strokeWeight` 會讓櫛齒感更黑；若畫面太重，先降低 `drawRoughMothBodyDetails()` 的 colored fur 數量或 alpha，而不是移除最後黑線。

---

### 2026-05-14 — Result 頁底部按鈕重排與 Web Share API

#### 日期
2026-05-14

#### 任務摘要
調整 Result page 底部操作 UI：返回按鈕移到右下角，儲存移到左下角，並在左下角新增分享按鈕。分享按鈕會嘗試透過 Web Share API 分享不含 UI 的生成 PNG，並在不支援時提供畫面提示。同步更新 CDP 測試腳本，使測試讀取新的 responsive action layout，涵蓋手機轉向後的按鈕可見性。

#### 使用者需求
使用者要求修改 Result 頁面，將返回按鈕移到右下角，儲存移到左下角，同時左下角新增分享按鈕，透過 Web Share API 讓使用者可以上傳生成結果至社群。使用者後續補充要考慮手機螢幕轉向時 UI 位置是否仍能正確顯示。

#### 實作前理解
原本 Result page 的 Save / Back 皆固定在畫面下方中央：Save 在 `height - 145`，Back 在 `height - 80`。這種固定座標在直向會遮住底部中央，在橫向短高度也沒有明確分區。新增 Share 後若仍用固定座標，繪製、點擊判定與 CDP 測試容易不同步。Web Share API 分享圖片檔需要 secure context、使用者手勢、`navigator.share`，檔案分享還需要 `navigator.canShare({ files })`，且 headless Chrome 不能代表真實手機系統分享面板。

#### 實作方案
在 `Pages/ResultPage/ResultPage.js` 新增 `getResultActionLayout()`，每次依目前 `width` / `height` 重新計算三顆按鈕的位置、尺寸、圓角與字級。直向與 compact 會將 `儲存`、`分享` 放在左下側，`返回` 放在右下角；landscape / 短高度會縮小按鈕高度與寬度，避免跑出 viewport。新增 `drawShareButton()`、`checkShareButtonClicked()`、`shareResultImage()` 與分享狀態提示。`sketch.js` 的 Result interaction 依序檢查 Save、Share、Back。測試腳本改由 runtime 呼叫 `getResultActionLayout()` 讀取 Save / Share / Back 座標與 visible flag，不再硬寫舊中央座標。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/testing-playbook.md`
- `docs/current-risks-and-next-steps.md`
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/ResultPageSettings.js`
- `Pages/pagesSettings.js`
- `sketch.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/ResultPage.js`
- `sketch.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- `docs/testing-playbook.md`
- `docs/current-risks-and-next-steps.md`

#### 決策紀錄
決定把 Result actions 的座標集中到 `getResultActionLayout()`，讓 draw、hit test 與 CDP 驗證共用同一份 layout，避免旋轉或 viewport 改變後位置不一致。分享輸出沿用「不含 UI」的原則：點擊分享時先清掉文字層並重畫 Result artwork，再用 canvas PNG blob 建立 `File`。若瀏覽器支援檔案分享，呼叫 `navigator.share({ files })`；若不支援檔案分享但支援文字分享，退回文字分享；若完全不支援，顯示「請先儲存圖片」提示。

#### 遇到的問題
CDP headless Chrome 中 `navigator.share()` 會進入等待系統分享面板的狀態，無法像真實手機一樣完成或取消。因此測試不能把 `shareState === shared` 當作通過條件，而是確認按鈕可點、狀態進入 `sharing`、沒有 JS exception，且後續 Save / Back 仍能運作。第一輪測試顯示 share 狀態停在 `preparing`，因此調整為取得 blob 並準備呼叫分享前，先將狀態改為 `sharing` / 「開啟分享面板...」，並立即 `loop()` 讓 UI 回到畫面上。

#### 嘗試過的解法
先閱讀 Result page、全域互動流程與 screen-space helper，確認 UI 實際繪在 `screenTextLayer`，匯出時可清掉 UI layer。接著以 `apply_patch` 重構 Result button layout、接上分享流程，再更新 CDP 腳本。先跑 `result-actions-share-2026-05-14`，發現 headless share 狀態文字需調整；修正後再跑 `result-actions-share-final-2026-05-14` 做最終驗證。

#### 最終解法
`getResultActionLayout()` 會依 viewport 設定 `buttonW`、`buttonH`、`bottomMargin`、`labelSize`，並回傳 `save`、`share`、`back` 三個座標。`drawResultActionButton()` 統一畫按鈕；`checkSaveButtonClicked()`、`checkShareButtonClicked()`、`checkBackButtonClicked()` 皆使用同一 layout 做 AABB hit test。`shareResultImage()` 會呼叫 `renderResultArtworkForCanvasExport()` 產生不含 UI 的 canvas 畫面，再透過 `getResultCanvasBlob()` 建立 PNG `File` 給 Web Share API。`scripts/run-cdp-visual-test.ps1` 新增 `after-share` 截圖 stage 與 summary 中的 `resultActions`、`shareState`、`shareMessage`。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\ResultPage.js` 通過
- 語法檢查：`node --check sketch.js` 通過
- PowerShell 解析：`[scriptblock]::Create((Get-Content -Raw scripts\run-cdp-visual-test.ps1))` 通過
- 測試環境：Windows / PowerShell / Python static server / Chrome headless / Chrome DevTools Protocol
- 最終 run id：`result-actions-share-final-2026-05-14`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 截圖：`docs/cdp-runs/result-actions-share-final-2026-05-14/screenshots/`
- Result action visible：三個 viewport 的 Save / Share / Back 均為 `visible: true`
- Portrait Save：下載 `FlutterLens-result.png`，大小 775,788 bytes
- Portrait Share：`shareState: "sharing"`，`shareMessage: "開啟分享面板..."`
- Portrait Back：回到 `SCANNING`，`backCleared: true`
- Console 錯誤：三個 viewport 各有一筆既有 404 resource event；未觀察到新增 JavaScript exception

#### Codex 審美自評
約 `8/10`。優點是底部操作變成清楚的左右分區，直向畫面中 `儲存`、`分享`、`返回` 三顆按鈕視覺重量一致，且不再堆在中央上下兩列。分享狀態提示是低調黑色 pill，資訊可見但不搶昆蟲與照片。橫向短高度下按鈕縮小後仍可讀，也沒有貼到邊界。弱點是三顆中文文字按鈕仍偏傳統，若未來要更精緻，可以改成 icon + tooltip 或 icon + short label；目前為了維持既有風格與可讀性，先不做更大視覺語言改版。

#### 使用者審美回饋
本輪使用者沒有提供審美分數或截圖評語。使用者補充的功能性回饋是要考慮手機螢幕轉向時 UI 位置是否仍正確顯示，本輪已把 layout 改為每次依 viewport 重算，並用 portrait / compact / landscape CDP 驗證。

#### 尚未解決的風險
Web Share API 的真實分享面板、社群 app 目標、iOS / Android 檔案分享支援度仍需真機測試。CDP headless 只能確認按鈕、狀態與 fallback 不造成 JS exception，不能確認使用者是否能在真實手機上成功送出到 Instagram、Threads、LINE 或其他社群。GitHub Pages HTTPS 應符合 secure context，但仍需部署後測。Result 按鈕仍位於底部，若昆蟲 spawn 非常低仍可能被按鈕遮住；本輪改善的是操作分區與旋轉位置，不是 spawn avoidance。

#### 使用者回饋或修正
等待使用者在真機或本機預覽中確認底部按鈕位置、分享提示文案與真實社群分享流程是否符合期待。

#### 建議的下一步
用手機開 GitHub Pages 或本機 HTTPS 預覽，測試 Share 按鈕是否能分享 `FlutterLens-result.png` 到目標社群。若要調整按鈕位置，改 `Pages/ResultPage/ResultPage.js` 的 `getResultActionLayout()`：提高 `marginX` 會讓左右按鈕離邊緣更遠；提高 `gap` 會拉開儲存與分享；提高 `buttonH` 會讓按鈕更高、更容易點但更佔底部畫面；提高 `maxButtonW` 會讓文字更寬鬆但更容易在窄螢幕擁擠；提高 `bottomMargin` 會讓按鈕往上，降低則更貼近底部。若要改提示外觀，調 `drawResultShareMessage()` 的 `messageW`、`messageH`、`fill` 與文字 `size`。

---

### 2026-05-14 — 修正 Result 儲存重複下載與分享後重繪狀態

#### 日期
2026-05-14

#### 任務摘要
修正使用者回報的兩個 Result page 問題：按下儲存會下載多次重複結果；按下分享後重新繪製的結果中，昆蟲身體輪廓框線看起來不再是黑色。新增儲存 / 分享進行中鎖定，並調整分享匯出流程，取完 PNG blob 後立即還原正常 Result UI，再開啟 Web Share API。

#### 使用者需求
使用者指出兩個問題：一是按下儲存按鈕時會下載多次重複結果；二是按下分享後重新繪製的結果，昆蟲身體的輪廓框線變成不是黑色。

#### 實作前理解
儲存重複下載很可能來自手機觸控同時觸發 touch / mouse 或使用者連點，而原本 `exportResultImage()` 沒有檢查 `resultExportPending` / 匯出中狀態，可能讓同一輪互動排進多次 `saveCanvas()`。分享問題則來自 `shareResultImage()` 為了取得無 UI PNG，直接在可見 canvas 上呼叫 `renderResultArtworkForCanvasExport()`；在等待分享面板時，使用者會看到這個匯出畫格，且 p5.brush 狀態可能讓 body 黑線呈現與一般 draw loop 不一致。

#### 實作方案
在 `ResultPage.js` 增加 `resultSaveInProgress` 與 `resultShareInProgress`。`exportResultImage()` 若已在儲存、匯出 pending 或 ready 狀態會直接 return；真正 `saveCanvas()` 完成後才解除鎖定。分享流程在匯出前後呼叫 `syncBrushToCanvas()`，取得 blob 後不再停留在無 UI canvas，而是呼叫 `restoreResultSceneAfterCanvasExport()` 立即重畫正常 Result artwork + UI，再進入 `navigator.share()`。

#### 檢視過的檔案
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `sketch.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 修改過的檔案
- `Pages/ResultPage/ResultPage.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/codex-worklog.md`
- `docs/visual-test-log.md`

#### 決策紀錄
決定不改昆蟲 body 繪製本身，因為問題與「分享時額外重畫並停留在匯出畫格」高度相關；先讓分享匯出變成短暫內部步驟，取完 blob 立即還原正常畫面。儲存問題則用 Result page 自身的狀態鎖處理，而不是只依賴瀏覽器事件行為，因為不同手機瀏覽器對 touch / mouse 合成事件差異很大。

#### 遇到的問題
Chrome headless 仍無法真正完成系統分享面板，只能確認狀態進入 `sharing`。因此分享後框線是否維持黑色需用 `after-share` 截圖比對，並額外使用 forced moth 測試，因為 moth body 最容易暴露黑色結構線問題。

#### 嘗試過的解法
先用 `rg` 檢查 `exportResultImage()`、`completeResultExportIfReady()`、`shareResultImage()`、`touchStarted()` / `mousePressed()` 與 rough body black overlay。接著加入 `resultSaveInProgress` / `resultShareInProgress`、分享前後 `syncBrushToCanvas()`、`restoreResultSceneAfterCanvasExport()`。CDP 測試腳本改為 portrait 快速連點 Save 兩次，驗證下載數量仍為一個。最後跑一般 result 與 forced moth 兩輪視覺測試。

#### 最終解法
`exportResultImage()` 只有在沒有 `resultSaveInProgress`、`resultExportPending`、`resultExportReady` 時才會開始匯出，並在 `completeResultExportIfReady()` 的 `saveCanvas()` 後解除 `resultSaveInProgress`。`shareResultImage()` 只有在沒有分享 / 儲存 / 匯出進行中時才會執行；取得 PNG blob 後會呼叫 `restoreResultSceneAfterCanvasExport()`，將畫面立即恢復成正常 Result UI 與一般 brush 狀態，再等待 Web Share API。`run-cdp-visual-test.ps1` 會在 portrait 測試中快速點 Save 兩次，作為重複下載回歸測試。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\ResultPage.js` 通過
- 語法檢查：`node --check sketch.js` 通過
- PowerShell 解析：`[scriptblock]::Create((Get-Content -Raw scripts\run-cdp-visual-test.ps1))` 通過
- 一般 run id：`result-actions-share-fix-2026-05-14`
- Forced moth run id：`result-share-moth-outline-fix-2026-05-14`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced moth pitch：`-ForcedFinalPitch -60`
- Forced spawn：一般 run 使用 `0.34 / 0.36`；moth run 使用 `0.50 / 0.40`
- 一般 run portrait 快速點 Save 兩次後，下載資料夾只有一個 `FlutterLens-result.png`
- Forced moth after-share 截圖中，body 中軸與外框維持黑色結構感，沒有變成彩色輪廓
- Console 錯誤：兩輪三個 viewport 各有一筆既有 404 resource event；未觀察到新增 JavaScript exception

#### Codex 審美自評
約 `8/10`。修正後分享狀態提示仍維持在正常 Result UI 上方，不再像使用者看到的那樣停留在重新繪製的匯出畫格。Forced moth 的 after-share 截圖中，身體黑色中軸與外框仍可讀，與分享前一致。視覺弱點仍是 moth body 在綠色背景中偏細，若使用者希望更強烈黑框，應回到 `drawRoughMothBlackStructureOverlay()` 調黑線，而不是讓分享流程改畫面。

#### 使用者審美回饋
使用者指出分享後重新繪製的結果中，昆蟲身體輪廓框線變成不是黑色。此回饋已記錄，並用 forced moth 的 before / after-share 截圖確認本輪修正方向。

#### 尚未解決的風險
真實手機上是否仍會因瀏覽器事件合成而觸發其他重複互動，需要 iOS / Android 實機確認。Web Share API 在 headless 中只能停在 `sharing` 狀態，不能確認社群 app 接收 PNG。若分享面板在真機上長時間開啟，仍需確認返回頁面後 UI 與 body brush 狀態正常。

#### 使用者回饋或修正
等待使用者在實機上再按一次 Save / Share，確認不再多次下載，且分享後回到 Result 時 body 黑框維持預期。

#### 建議的下一步
用真機測試連點 `儲存`，確認只下載一次；再測 `分享` → 取消分享 → 回到 Result，確認昆蟲 body 外框仍是黑色。若仍有重複下載，可在 `Pages/ResultPage/ResultPage.js` 的 `exportResultImage()` 增加更長的時間型 debounce；若 body 黑線仍覺得偏弱，調 `Pages/ResultPage/InsectGenerator/RoughInsectBody.js` 的 `drawRoughMothBlackStructureOverlay()`，提高 abdomen / thorax / head 的 `strokeWeight` 或 `passes`。

---

### 2026-05-18 — Result page 固定作品圖與非全螢幕展示重構

#### 日期
2026-05-18

#### 任務摘要
依使用者需求重構 Result page：相機截圖與生成昆蟲在進入結果頁時先固定成一張作品圖，結果頁本身改為深色基礎背景、中上方作品展示區與角落操作按鈕，避免最終影像佔滿全螢幕。

#### 使用者需求
使用者希望結果頁不要再讓最終影像佔據全螢幕；具體方向是將相機截圖與生成昆蟲儲存到獨立畫布或 graphic，結果頁保留一個基礎背景、角落原本按鈕，並在中央或上半部放置生成結果區域。使用者也詢問若直向拍攝後才旋轉螢幕會發生什麼，本輪確認並採用「作品固定，旋轉只改展示 layout」的行為。

#### 實作前理解
原本 `ResultPage.js` 會每次把 `resultPhoto` 用 cover 方式鋪滿主 canvas，然後直接呼叫 `drawRoughInsect(window, x, y)`。因此 Result 畫面、Save / Share 匯出與旋轉後的主 canvas 尺寸耦合在一起；直向拍攝後旋轉可能重新 cover 裁切照片、重算昆蟲位置與尺寸。由於 p5.brush 主要綁在主 canvas 上，直接把昆蟲畫到 offscreen `createGraphics()` 有 brush 狀態不一致的風險。

#### 實作方案
在 `setupResultPhoto()` 取得 `resultPhoto` 與 `resultRenderSeed` 後，呼叫 `createResultArtworkSnapshot()`。此函式先在主 canvas 以舊邏輯渲染一次相機截圖與昆蟲，接著用 `get(0, 0, width, height)` 擷取成固定的 `resultArtworkImage`。之後 `drawResultPage()` 不再重畫相機與昆蟲，只重算 `resultArtworkLayout`，畫深色基礎背景、相片式作品框、固定作品圖與既有 Result UI。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/current-risks-and-next-steps.md`
- `docs/testing-playbook.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/ResultPageSettings.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/pagesSettings.js`
- `sketch.js`
- `scripts/run-cdp-visual-test.ps1`

#### 修改過的檔案
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/ResultPageSettings.js`
- `sketch.js`
- `docs/agent-quickstart.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
決定先使用固定 `p5.Image` 作為作品圖，而不是直接讓 rough insect 畫進 offscreen `createGraphics()`。原因是 rough wing / body 內部大量使用全域 `brush`，過去分享匯出也曾因可見 canvas 重畫造成 brush 狀態差異；用主 canvas 渲染一次再擷取，可以維持與既有視覺一致。Save / Share 改為直接使用 `resultArtworkImage.canvas` 產生 PNG，不含結果頁背景與按鈕。旋轉螢幕時 `windowResized()` 改為只呼叫 `updateResultArtworkLayout()`，不再重算 spawn position。

#### 遇到的問題
CDP 測試腳本目前是分別用 portrait / compact / landscape 啟動頁面，能驗證三種 viewport 的結果頁版面，但不能完全等同「同一次直向拍攝後旋轉到橫向」。另外，landscape runtime 高度約 240px，作品圖會被壓成較窄的橫向展示帶；這符合目前可用空間，但真機橫向安全區與網址列高度仍需實測。

#### 嘗試過的解法
先讀 Result page、頁面座標 helper、InsectManager 與 rough insect 的 brush 用法，確認 `drawRoughInsect()` 雖然接受 layer，但內部 brush 仍是全域狀態。接著新增 `resultArtworkImage`、`resultArtworkLayout`、`resultArtworkSourceSize`，將舊的 `renderResultArtwork()` 拆成展示用 `renderResultArtwork()` 與一次性來源渲染 `renderResultArtworkSource()`。完成後用 Node 語法檢查與 CDP 視覺測試驗證。

#### 最終解法
`createResultArtworkSnapshot()` 會在拍攝進 Result 時產生固定作品圖。`getResultArtworkDisplayLayout()` 依目前 viewport、底部 action layout 與作品原始比例，計算中上方展示區。`renderResultPageBackground()` 畫深色基礎背景與上下區塊，`renderResultArtwork()` 畫淺色細框與固定作品圖。`exportResultImage()` 透過 `downloadResultArtworkImage()` 直接下載固定作品圖；`shareResultImage()` 透過 `getResultCanvasBlob()` 從固定作品圖建立 PNG `File`。`sketch.js` 的 `windowResized()` 在 Result 狀態只更新作品展示 layout。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\ResultPage.js` 通過
- 語法檢查：`node --check Pages\ResultPage\ResultPageSettings.js` 通過
- 語法檢查：`node --check sketch.js` 通過
- CDP run id：`result-artwork-card-2026-05-18`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced spawn：`-ForcedSpawnRatioX 0.42 -ForcedSpawnRatioY 0.34`
- Result state：三個 viewport 都進入 `RESULT`
- Result action visible：三個 viewport 的 Save / Share / Back 均為 `visible: true`
- Portrait Share：`shareState: "sharing"`，`shareMessage: "開啟分享面板..."`
- Portrait Save：下載一個 `FlutterLens-result.png`，大小 783,343 bytes
- Portrait Back：回到 `SCANNING`，`backCleared: true`
- 截圖：`docs/cdp-runs/result-artwork-card-2026-05-18/screenshots/`
- Console 錯誤：三個 viewport 各有一筆既有 404 resource event；未觀察到新增 JavaScript exception

#### Codex 審美自評
約 `8.1/10`。優點是結果頁現在明確分成「作品」與「操作介面」兩層，照片與昆蟲不再被按鈕直接壓住，也不再像整個頁面只是相機截圖。深色背景讓綠色植物與昆蟲仍是主角，淺色細框讓作品區邊界清楚。弱點是目前視覺語言偏相片展示，稍微保守；如果使用者想要更有 AR 儀式感或探索感，背景材質與作品框可以再設計，但不應干擾作品本體。

#### 使用者審美回饋
本輪尚未收到使用者對截圖的審美分數或評語。使用者的核心方向是不要讓最終影像全螢幕鋪滿，並希望作品能放在中央或上半部；本輪已依此落地。

#### 尚未解決的風險
尚未用真實手機實測「直向拍攝後旋轉到橫向」的完整流程。程式邏輯上作品圖會固定，不再重畫相機或昆蟲，但 iOS / Android 的網址列高度、安全區、orientation resize timing 仍可能影響展示區視覺。Chrome headless 也不能確認真實 Web Share 面板與社群 app 接收 PNG。

#### 使用者回饋或修正
等待使用者確認第一版結果頁展示感是否偏好。如果覺得太像一般相片框，可再調整背景與框線；如果覺得作品區仍太大或太小，可直接調 layout 參數。

#### 建議的下一步
用真機直向拍攝後旋轉到橫向，確認作品圖不重抽、不改構圖、不改昆蟲尺寸。若要調作品展示區，改 `Pages/ResultPage/ResultPage.js` 的 `getResultArtworkDisplayLayout()`：提高 `sideMargin` 會讓作品區更窄、左右留白更多；提高 `topMargin` 會把作品區往下壓；提高 `bottomGap` 會讓作品區離按鈕更遠；提高 `maxDisplayW` 的比例會讓作品區更寬；調整 `yBias`，數值變大會讓作品區往下，變小會往上。若要調背景，改 `renderResultPageBackground()` 的 `background()` 與三個 `fill()`；若要調作品框，改 `renderResultArtwork()` 內框線的 `fill(236, 234, 225, 245)`、外擴 `4` 與陰影偏移 `3 / 5`。

---

### 2026-05-18 — 修正 Result 固定作品圖中的 body 輪廓線錯位

#### 日期
2026-05-18

#### 任務摘要
針對 Result page 固定作品圖中，昆蟲 body 填色位置正確但黑色輪廓線沒有對齊身體的問題，將 body outline 的封閉 brush shape 改成多段開放弧線，避開 p5.brush closed shape 在 snapshot 流程中的錯位風險。

#### 使用者需求
使用者回報生成昆蟲的身體部位顏色填充正確，但輪廓線位置沒有對在生成影像上，並詢問是否是輪廓線沒有畫到正確畫布，或有其他可能性。使用者接著指出翅膀也有類似上色與外框邏輯卻沒有錯位，因此希望先試試將 body outline 改成不同畫法。

#### 實作前理解
翅膀外框使用 `drawEdgeWithOvershoot()` 畫開放曲線，`brush.endShape()` 不封閉；body outline 則使用 `drawRoughOutlineOval()` 一圈點位加 `brush.endShape(true)` 畫封閉橢圓。因翅膀外框沒有錯位，問題較不像整個 Result snapshot 畫布錯誤，而更像 body closed outline 這種 p5.brush path 在固定作品圖擷取流程中出現 transform / close-path 偏移。

#### 實作方案
只修改 `Pages/ResultPage/InsectGenerator/RoughInsectBody.js` 的 body outline 畫法。保留原本 `drawRoughOutlineOval()` 的 public 入口與 fallback p5 ellipse，但在 brush 路徑中改呼叫新的 `drawRoughOpenOutlineOvalPass()`。新函式把每個橢圓輪廓拆成三段有重疊的開放弧線，每段都使用 `brush.beginShape(0.12)`、多個 vertex、`brush.endShape()`，不再使用 `brush.endShape(true)`。

#### 檢視過的檔案
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectWings.js`
- `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
決定不先改 Result page snapshot 架構，因為翅膀外框沒有錯位，代表整個畫布或固定作品圖流程並非唯一原因。先以最小變更處理 body outline 的 closed shape，若此修正有效，再保留目前固定作品圖設計。

#### 遇到的問題
CDP 截圖可以確認 forced butterfly pitch 下 body outline 是否貼回填色，但不能保證所有 seed、moth black overlay、dragonfly side eyes 都完全穩定。Landscape 中昆蟲較小，body 細節不如 portrait 容易判讀。

#### 嘗試過的解法
先對比 rough wing 與 rough body 的 brush 呼叫方式，確認翅膀外框是 open stroke，body outline 是 closed oval。接著以 `apply_patch` 新增 `drawRoughOpenOutlineOvalPass()`，讓每個 body oval 由三段開放弧線組成。最後跑語法檢查與 CDP forced pitch 視覺驗證。

#### 最終解法
`drawRoughOutlineOval()` 在 `brush` 可用時不再建立單一封閉橢圓，而是每個 pass 呼叫 `drawRoughOpenOutlineOvalPass()`。該函式將 360 度輪廓切成三段，段與段之間有小幅 overlap，並保留 wobble、pressure taper 與 pass offset，因此仍有手繪感，但避開 closed brush shape 的錯位行為。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過
- 語法檢查：`node --check Pages\ResultPage\ResultPage.js` 通過
- CDP run id：`body-open-outline-2026-05-18`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.42 -ForcedSpawnRatioY 0.34`
- Result state：三個 viewport 都進入 `RESULT`
- Result action visible：三個 viewport 的 Save / Share / Back 均為 `visible: true`
- Portrait Share：`shareState: "sharing"`，`shareMessage: "開啟分享面板..."`
- Portrait Save：下載一個 `FlutterLens-result.png`，大小 781,376 bytes
- Portrait Back：回到 `SCANNING`，`backCleared: true`
- 截圖：`docs/cdp-runs/body-open-outline-2026-05-18/screenshots/`
- Console 錯誤：三個 viewport 各有一筆既有 404 resource event；未觀察到新增 JavaScript exception

#### Codex 審美自評
約 `8/10`。優點是 body 黑色輪廓回到填色附近，三段開放弧線的接縫與重疊比單一機械封閉橢圓更接近手繪描邊。弱點是線條在小尺寸與綠色植物背景上仍有些細，若使用者希望身體更明確，可提高 outline stroke 或增加 arc pass。

#### 使用者審美回饋
使用者指出 body 填色正確但輪廓線錯位，並補充翅膀同樣有上色與外框卻沒有出現錯位。這項觀察幫助本輪將問題定位到 body closed outline，而不是整個 Result page 固定作品圖畫布。

#### 尚未解決的風險
目前主要驗證 forced butterfly pitch。仍需用多 seed 與 forced moth / dragonfly 確認所有 body outline 與細節線都穩定，特別是 moth 的黑色結構 overlay 與觸角。真機 AR / camera 與旋轉流程仍未驗證。

#### 使用者回饋或修正
等待使用者確認這版在實際畫面中是否解決 body 輪廓錯位。如果仍有少數 seed 錯位，下一步應擷取問題 seed 或 screenshot，再確認是否還有其他 closed body detail path。

#### 建議的下一步
用真機或多次 CDP seed 測 butterfly / dragonfly / moth 三類 body。若要調 body 輪廓貼合與手繪感，改 `Pages/ResultPage/InsectGenerator/RoughInsectBody.js` 的 `drawRoughOpenOutlineOvalPass()`：提高 `arcCount` 會讓輪廓分段更多、接近連續線；提高 `overlap` 會減少段落缺口但線會更重；提高 `pointCount` 會讓弧線更平滑；提高 `wobble` 的傳入值或 `passOffset` 會讓線更手繪但可能更鬆；提高呼叫端 `strokeWeight` 會讓 body 更清楚但可能壓過翅膀細節。

---

### 2026-05-18 — 確認並修正黑色 body 結構線未進入 resultArtworkImage

#### 日期
2026-05-18

#### 任務摘要
依使用者提供的結果頁手動截圖與 Save 下載圖對照，確認偏移的黑色 body 輪廓 / 觸角沒有被擷取進 `resultArtworkImage`，而是 p5.brush 在可見 canvas 上延後 flush 的殘留層。將 Result artwork 擷取改為兩階段：先畫作品來源，等該 frame 結束讓 p5.brush postdraw 合成，再 `get()` 成固定作品圖。

#### 使用者需求
使用者指出結果頁手動截圖中，身體本身有一套顏色接近 body 的框線，但另有一套黑色且帶觸角的 body 輪廓線偏移到左側翅膀上；按下儲存後，下載圖中黑色版消失，只剩 body 本身框線。使用者要求確認黑色版是否有畫進 `resultArtworkImage`，若沒有就修改。

#### 實作前理解
檢查 `RoughInsectBody.js` 後確認 body 有兩套線條：`drawRoughFilledBodyOval()` 會在彩色填色後用 `marker1` 與 `paintInfo.color` 畫接近 body 顏色的框線；`drawRoughBodySimpleOutline()` / `drawRoughSimpleAntennae()` 則用 `ink = "#050504"` 與 `pencil1` 畫黑色 body 結構線與觸角。使用者的下載圖沒有黑色版，代表原本同步 `createResultArtworkSnapshot()` 太早呼叫 `get()`，當下 p5.brush 的黑色結構線尚未完全合成進主 canvas。

#### 實作方案
在 `ResultPage.js` 中取消 `setupResultPhoto()` 立即同步擷取作品圖，改為設定 `resultCaptureScheduled = true` 並清空 `resultArtworkImage`。`drawResultPage()` 若尚未擷取完成，先呼叫 `renderResultArtworkCaptureFrame()` 畫出相機截圖與昆蟲，接著用 `setTimeout(..., 0)` 排程 `captureResultArtworkAfterBrushFlush()`。這讓目前 draw frame 結束、p5.brush postdraw flush 完成後，再用 `get(0, 0, width, height)` 擷取固定作品圖。

#### 檢視過的檔案
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/InsectGenerator/RoughInsectBody.js`
- `docs/llms.txt`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/ResultPage/ResultPage.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
決定保留固定作品圖架構，但改變擷取時機，而不是把黑色結構線移除。原因是黑色 body / 觸角是設計中的結構層，應該進入作品圖；錯的是它在結果頁上以殘留層形式出現、卻沒有進入 Save PNG。`docs/llms.txt` 也提醒 p5 build 的 brush 會由 draw / postdraw 流程處理，不應用 standalone 的 `brush.render()`；因此採用 frame 後 `get()`，不手動呼叫不存在於 p5 build 流程中的 render。

#### 遇到的問題
原本 `createResultArtworkSnapshot()` 在 `setupResultPhoto()` 內同步完成，該時間點來自互動事件而非完整 draw frame。p5.brush 的部分線條可能在 p5 postdraw 才合成到可見 canvas，導致 `resultArtworkImage` 少了黑色線，但下一個結果頁畫面又顯示出殘留黑線。

#### 嘗試過的解法
先追出 body 兩套線條來源，確認彩色框線與黑色結構線是同一 body 流程的不同層。接著搜尋 `docs/llms.txt` 與 p5.brush 行為，確認 p5 build 不應用 standalone `brush.render()`。最後以 Result page 排程方式，把擷取延到 brush postdraw 之後。

#### 最終解法
`setupResultPhoto()` 設定 `resultCaptureScheduled = true`、`resultArtworkCaptureQueued = false`、`resultArtworkImage = null` 並呼叫 `loop()`。`drawResultPage()` 在 capture 未完成時只畫作品來源，不畫結果頁背景與 UI。`queueResultArtworkCapture()` 用 `setTimeout()` 安排 `captureResultArtworkAfterBrushFlush()`；後者在 brush flush 後擷取 `resultArtworkImage`，重算 `resultArtworkSourceSize` / `resultArtworkLayout`，再回到正常 Result page。

#### 視覺驗證紀錄
- 語法檢查：`node --check Pages\ResultPage\ResultPage.js` 通過
- 語法檢查：`node --check Pages\ResultPage\InsectGenerator\RoughInsectBody.js` 通過
- CDP run id：`result-artwork-brush-flush-2026-05-18`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.42 -ForcedSpawnRatioY 0.34`
- Result state：三個 viewport 都進入 `RESULT`
- Result action visible：三個 viewport 的 Save / Share / Back 均為 `visible: true`
- Portrait Share：`shareState: "sharing"`，`shareMessage: "開啟分享面板..."`
- Portrait Save：下載一個 `FlutterLens-result.png`，大小 771,542 bytes
- Portrait Back：回到 `SCANNING`，`backCleared: true`
- 截圖：`docs/cdp-runs/result-artwork-brush-flush-2026-05-18/screenshots/`
- 下載圖：`docs/cdp-runs/result-artwork-brush-flush-2026-05-18/downloads/greenPlants/portrait-390x844/FlutterLens-result.png`
- 觀察：Result 截圖與下載 PNG 都可見同一套黑色 body 結構線與觸角，內容一致
- Console 錯誤：三個 viewport 各有一筆既有 404 resource event；未觀察到新增 JavaScript exception

#### Codex 審美自評
約 `8.2/10`。這輪的重點不是改美術重量，而是讓「看見的作品」與「儲存的作品」一致。修正後黑色 body / 觸角不再像浮在結果頁上的幽靈層，而是固定作品圖的一部分；視覺上 body 結構更完整。弱點是黑色線條仍偏細，後續若使用者想要 body 更明顯，可再調 rough body outline stroke。

#### 使用者審美回饋
使用者提供兩張對照圖，明確指出結果頁手動截圖與 Save 下載圖不一致：結果頁有偏移的黑色 body / 觸角，下載圖沒有。此回饋直接確認問題在 `resultArtworkImage` 擷取時機，而不是單純 body 形狀計算。

#### 尚未解決的風險
CDP 已驗證 forced butterfly 情境，但仍需用使用者實機情境確認粉色牆面背景下不再出現偏移黑線。也需用多 seed 與 moth / dragonfly 確認其他 body 結構層都能進固定作品圖。

#### 使用者回饋或修正
等待使用者重新測試結果頁手動截圖與 Save PNG 是否一致。如果仍有殘留層，下一步需進一步清理 p5.brush target 或在 capture frame 後強制重畫正常 Result page。

#### 建議的下一步
請用同一個粉色牆面場景再測一次：進 Result 後先截圖，再按 Save 比對下載 PNG。若兩者一致但覺得 body 黑線太弱，調 `Pages/ResultPage/InsectGenerator/RoughInsectBody.js` 的 `drawRoughBodySimpleOutline()` / `drawRoughOpenOutlineOvalPass()`；若兩者仍不一致，下一步在 `captureResultArtworkAfterBrushFlush()` 後增加一次明確的可見 canvas 重畫與 brush target sync。

---

### 2026-05-19 — 評估整體改為 HTML / CSS app shell 的架構方向

#### 日期
2026-05-19

#### 任務摘要
針對使用者提出的大型架構調整進行初步評估：將目前由 p5.js canvas 掌控整體畫面、UI、頁面狀態與轉場的架構，改為以 HTML / CSS 作為主要 app shell，並透過 CSS transition / animation 或其他 browser 原生方式處理頁面轉場。

#### 使用者需求
使用者希望評估是否要修改目前程式整體架構，讓整體畫面改由 HTML / CSS 完成，轉場也由 CSS 或其他方式處理。

#### 實作前理解
目前專案的 `index.html` 與 `style.css` 很薄，主要 app lifecycle 在 `sketch.js`。`PagesState`、Start / Scanning / Result 三頁、文字、按鈕、點擊範圍、相機畫面、色票 UI、陀螺儀提示、結果頁背景與 actions 都由 p5 canvas 繪製或用 canvas hit-test 處理。昆蟲生成、p5.brush、相機截圖與結果 PNG 輸出仍高度依賴 p5 canvas。

#### 實作方案
本次未實作程式，只完成架構評估。初步建議採分階段 hybrid migration：先把頁面 shell、按鈕、文字、狀態提示與轉場移到 DOM / CSS，保留 p5 canvas 作為相機 / artwork / insect rendering layer；確認互動與輸出穩定後，再評估是否進一步拆分相機 video、分析 canvas、結果 artwork canvas。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/current-risks-and-next-steps.md`
- `docs/architecture.md`
- `index.html`
- `style.css`
- `sketch.js`
- `Pages/pagesSettings.js`
- `Pages/StartPage/StartPage.js`
- `Pages/ScanningPage/ScanningPage.js`
- `Pages/ScanningPage/ShutterButton.js`
- `Pages/ScanningPage/ScanningPageSettings.js`
- `Pages/ScanningPage/ColorProcessor.js`
- `Pages/ScanningPage/GyroManager.js`
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/ResultPageSettings.js`
- `Pages/ResultPage/InsectGenerator/InsectManager.js`

#### 修改過的檔案
- `docs/codex-worklog.md`

#### 決策紀錄
初步判斷不建議一次性把所有 p5 畫面改成純 HTML / CSS。Start page、Result page 的 UI、按鈕、toast、頁面背景、轉場很適合 DOM 化；Scanning page 的 overlay UI 也可逐步 DOM 化；但相機取樣、中央色彩分析、結果圖固定擷取、昆蟲與 p5.brush 手繪渲染仍應保留 canvas。最安全的重構目標是「HTML / CSS 負責 app shell 與 transition，p5 負責影像分析與作品生成」。

#### 遇到的問題
目前全域狀態散落在多個檔案，且許多 layout 與 hit-test 由 `width` / `height` 與 p5 mouse / touch 座標計算。若直接改 DOM，需同步處理權限請求時機、iOS gesture 限制、canvas 層 pointer events、結果圖擷取時機、Save / Share 使用的 PNG 來源，以及現有 CDP 測試腳本的 selector / state 判斷。

#### 嘗試過的解法
本次僅做閱讀與風險拆解，沒有嘗試修改。

#### 最終解法
形成一個可供使用者審核的遷移方向：第一階段建立 DOM app shell 與狀態同步；第二階段將 Start page 與 Result UI DOM 化；第三階段將 Scanning overlay DOM 化但保留相機與分析 canvas；第四階段才評估轉場、測試腳本與結果輸出是否需要更深層重構。

#### 視覺驗證紀錄
本次未修改視覺或功能，因此未啟動本機預覽、未截圖。若後續實作此架構調整，必須用 mobile viewport 驗證 Start -> Scanning -> Result 的轉場、相機權限流程、快門觸控、結果圖展示、Save / Share / Back，以及 portrait / landscape 的 UI 疊層。

#### Codex 審美自評
本次是架構評估，沒有新畫面可評分。從審美角度看，DOM / CSS 化有機會讓轉場、排版、安全區、按鈕狀態與結果頁質感更穩定，也能降低 canvas 文字渲染的限制；但若拆得太急，可能破壞目前結果圖固定擷取與手繪昆蟲層的穩定性。

#### 使用者審美回饋
本次尚未收到使用者對 HTML / CSS 方向的具體視覺偏好或分數。

#### 尚未解決的風險
需要確認使用者期待的是「整個 app shell DOM 化」還是「連相機與昆蟲都盡量離開 p5」。後者成本與風險很高，且 p5.brush 與生成昆蟲目前不適合用 CSS 替代。也需確認是否接受新增較清楚的 JS state controller，或仍希望維持無 build step、純 script 載入的 GitHub Pages 形式。

#### 使用者回饋或修正
等待使用者審核架構評估與分階段方案。

#### 建議的下一步
請使用者先決定重構目標邊界：建議採用 hybrid 方案，讓 HTML / CSS 負責畫面結構與轉場，p5 canvas 保留為 artwork engine。若同意，下一步可先做一份更正式的 migration plan，列出新檔案結構、狀態流、DOM layer / canvas layer 分工、測試項目與第一階段改動範圍。

---

### 2026-05-19 — 第一階段 DOM UI 移植：Start / Shutter / Result actions

#### 日期
2026-05-19

#### 任務摘要
依使用者確認，開始第一階段 HTML / CSS 主架構重構：不加入轉場動畫，先將原版按鈕 UI 功能從 p5 canvas hit-test / canvas drawing 移植成同頁 DOM `<div>` / `<button>` 區塊。保留 p5 canvas 負責相機、色彩分析、結果作品圖、昆蟲與 p5.brush。

#### 使用者需求
使用者同意開始修改，並指定現階段不需要做轉場動畫，只需先將原版按鈕 UI 功能移植重構。

#### 實作前理解
原本 `index.html` 只有 script 載入，所有 Start 文字 / button、Scanning shutter、Result Save / Share / Back / toast 都由 p5 canvas 繪製，互動則由 `mousePressed()`、`touchStarted()` 和座標 hit-test 判斷。CDP 測試腳本仍依賴 `StartButton`、`shutterX/Y`、`getResultActionLayout()` 讀取座標，因此 DOM 化時需要保留這些 runtime 座標，避免測試與既有流程一次失效。

#### 實作方案
在 `index.html` 新增 `#dom-ui-layer`，包含 `#start-page-ui`、`#scanning-page-ui`、`#result-page-ui` 三個頁面區塊。新增 `Pages/DomUi.js` 負責 DOM 查找、事件綁定、頁面 active 狀態、Start layout、shutter layout、Result actions 與 toast 同步。`style.css` 新增 DOM UI 樣式。`StartPage.js` 改為更新 DOM layout 與 `StartButton` 座標，不再畫 canvas 文字與 Start button。`ShutterButton.js` 改為同步 DOM shutter，不再畫 canvas 快門。`ResultPage.js` 的 `renderResultUi()` 改為同步 DOM actions / toast，不再畫 canvas buttons。`sketch.js` 新增 `requestStartPermissions()` 與 `triggerShutterCapture()`，讓 DOM button 與舊 canvas fallback 共用同一套流程。

#### 檢視過的檔案
- `index.html`
- `style.css`
- `sketch.js`
- `Pages/StartPage/StartPageSettings.js`
- `Pages/StartPage/StartPage.js`
- `Pages/ScanningPage/ShutterButton.js`
- `Pages/ScanningPage/ScanningPage.js`
- `Pages/ResultPage/ResultPage.js`
- `Pages/ResultPage/ResultPageSettings.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/visual-test-log.md`
- `docs/agent-quickstart.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `index.html`
- `style.css`
- `sketch.js`
- `Pages/DomUi.js`
- `Pages/StartPage/StartPage.js`
- `Pages/ScanningPage/ShutterButton.js`
- `Pages/ResultPage/ResultPage.js`
- `docs/agent-quickstart.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
決定採 hybrid migration，不一次改掉相機與作品 canvas。DOM UI 仍使用現有 p5 layout 計算結果，原因是這可保留既有手機版位置、CDP runtime 座標與使用者熟悉的視覺節奏。保留舊 canvas hit-test 函式作為 fallback，但實際可見 UI 已改由 DOM button 接收 click。這輪不加入 transition，避免在第一階段把「架構接線」與「視覺動態設計」混在一起。

#### 遇到的問題
PowerShell 直接執行 `node --check` 時，WindowsApps 內的 `node.exe` 因存取被拒無法啟動。改用 Node REPL 讀取檔案並以 `new Function()` parse 驗證語法。另需注意 DOM layer 全螢幕覆蓋後，p5 canvas 的點擊 fallback 不一定能接到事件，因此核心按鈕都必須在 DOM 端完成事件接線。

#### 嘗試過的解法
先新增 DOM shell 與 CSS，再讓舊 page function 同步 DOM 位置。語法檢查先嘗試 `node --check`，失敗後改用 Node REPL parse。視覺驗證使用既有 CDP 腳本與 fake camera fixture，確認 Start / Scanning / Result、Share / Save / Back 都仍可操作。

#### 最終解法
`Pages/DomUi.js` 成為第一階段 DOM UI adapter：`initDomUi()` 在 `setup()` 中初始化；`syncDomUiState()` 每 frame 依 `currentPagesState` 切換 active page；`syncStartPageDom()`、`syncShutterButtonDom()`、`syncResultActionsDom()` 依 p5 計算出的 layout 設定 DOM 位置。Start button 呼叫 `requestStartPermissions()`，shutter 呼叫 `triggerShutterCapture()`，Result buttons 呼叫 `exportResultImage()`、`shareResultImage()`、`resetResultData()`。

#### 視覺驗證紀錄
- 語法 parse：`Pages/DomUi.js` 通過
- 語法 parse：`Pages/StartPage/StartPage.js` 通過
- 語法 parse：`Pages/ScanningPage/ShutterButton.js` 通過
- 語法 parse：`Pages/ResultPage/ResultPage.js` 通過
- 語法 parse：`sketch.js` 通過
- `node --check`：因 WindowsApps `node.exe` 存取被拒，無法執行
- CDP run id：`dom-ui-migration-2026-05-19`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.42 -ForcedSpawnRatioY 0.34`
- 三個 viewport 都完成 `START → SCANNING → RESULT`
- Portrait Share：`shareState: "sharing"`，`shareMessage: "開啟分享面板..."`
- Portrait Save：下載 `FlutterLens-result.png`，大小 772,809 bytes
- Portrait Back：回到 `SCANNING`，`backCleared: true`
- Console：三個 viewport 各有一筆既有 404 resource event；未觀察到新增 JavaScript exception
- 截圖：`docs/cdp-runs/dom-ui-migration-2026-05-19/screenshots/`

#### Codex 審美自評
約 `8/10`。DOM 文字邊緣比 canvas 文字穩，Start / Result 的按鈕位置與原設計一致，功能感清楚；Result 三顆按鈕沒有壓住作品主體。弱點是這輪刻意只做忠實移植，因此視覺仍偏原型：黑底 Start page、綠色 pill button、灰白 result buttons 都還沒有新的轉場或更完整的設計語言。若下一輪要提升質感，可在 DOM 基礎上做 transition、safe-area、button state、result page spacing 與視覺層級整理。

#### 使用者審美回饋
本輪尚未收到使用者對 DOM 化後畫面的分數或偏好。

#### 尚未解決的風險
CDP fake camera 不能取代真機；尤其 iOS Safari 的 DeviceOrientation / camera 權限仍需確認 DOM button click 是否完全符合 user gesture 限制。DOM layer 設定 `touch-action: none`，需真機確認不會造成非預期手勢問題。Result actions 已 DOM 化，但結果作品圖、相機、grid、色票、gyro icon 仍由 p5 canvas 繪製。未加入頁面轉場動畫。

#### 使用者回饋或修正
等待使用者在真機上確認 Start、shutter、Save / Share / Back 的觸控手感與視覺接受度。

#### 建議的下一步
先用真機測試 iOS / Android 權限與觸控流程。若第一階段穩定，下一步可在 `style.css` 的 `.dom-page` / `.dom-page.is-active` 加入 `opacity`、`transform` transition，並在 `Pages/DomUi.js` 的 `setDomPageActive()` 擴充 leaving / entering class。可調參數：`style.css` 的 `.ui-button-primary` 可改 Start button 顏色；`.shutter-button` 的 `border` 與 `.shutter-button-inner` 的 `width` / `height` 可調快門視覺重量；`.result-button` / `.result-button-secondary` 可調 Result button 透明度；`Pages/StartPage/StartPage.js` 的 `titleSize`、`bodySize`、`hintSize`、`buttonBottomMargin` 可調 Start layout。

---

### 2026-05-19 — 修正手機 Start button touch 無法進入

#### 日期
2026-05-19

#### 任務摘要
依使用者真機回報，修正第一階段 DOM UI 移植後手機上 Start button 點擊無法進入 Scanning page 的問題。

#### 使用者需求
使用者表示：「我用手機測試，從開始頁面的按鈕就點不進去了」。

#### 實作前理解
第一階段 DOM UI 只在 Start button 上綁 `click`。手機瀏覽器中，`click` 可能被 p5 的全域 `touchStarted()` 回傳 `false`、canvas 原生 touch listener、或瀏覽器 touch 行為影響，導致 DOM button 看得到但權限流程沒有被觸發。權限流程仍需保留 user gesture，因此不能改成非同步自動啟動。

#### 實作方案
在 `Pages/DomUi.js` 中讓 Start button 先於 `pointerdown` / `touchstart` / `mousedown` 阻止事件預設行為與冒泡，避免事件落到 p5 canvas / document handler；再於 `pointerup` / `touchend` / `click` 呼叫 `handleDomStartAction()`，直接觸發 `requestStartPermissions()`。在 `sketch.js` 新增 `startPermissionRequestInProgress`，避免同一次手機觸控同時觸發 `touchend` 與 `click` 時重複請求權限或相機。

#### 檢視過的檔案
- `Pages/DomUi.js`
- `sketch.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/DomUi.js`
- `sketch.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
決定保留 DOM button 作為正式入口，而不是退回 canvas hit-test。原因是本輪目標就是把 UI 移到 HTML / CSS；問題應在事件接線層修正。採用多事件入口但用防重入鎖保護，讓 iOS / Android 都有機會在最接近 user gesture 的事件上觸發權限流程。

#### 遇到的問題
CDP headless click 無法完整重現真機 touch event 與 iOS 權限 user activation。因此本地驗證只能確認既有桌面自動化流程未回歸，最終仍需使用者真機再次確認。

#### 嘗試過的解法
未做多輪嘗試；直接將 Start button 改為 touch / pointer / click 多事件支援，並補防重入。

#### 最終解法
`Pages/DomUi.js` 新增 `stopDomUiEvent()` 與 `handleDomStartAction()`。Start button 的 `pointerdown` / `touchstart` / `mousedown` 呼叫 `stopDomUiEvent()`；`pointerup` / `touchend` / `click` 呼叫 `handleDomStartAction()`。`sketch.js` 新增 `startPermissionRequestInProgress`，在 `requestStartPermissions()` 開始時鎖住，拒絕 / catch / camera callback 時釋放。

#### 視覺驗證紀錄
- 語法 parse：`Pages/DomUi.js` 通過
- 語法 parse：`sketch.js` 通過
- CDP run id：`dom-start-touch-fix-2026-05-19`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 三個 viewport 都完成 `START → SCANNING → RESULT`
- Portrait Share / Save / Back 仍通過，下載 `FlutterLens-result.png` 大小 774,520 bytes
- Console：三個 viewport 各有一筆既有 404 resource event；未觀察到新增 JavaScript exception

#### Codex 審美自評
約 `8/10`。本輪沒有改變畫面外觀，只修正手機事件接線；視覺結果與第一階段 DOM UI 移植一致。

#### 使用者審美回饋
本輪使用者回饋是功能問題，不是審美評分：手機上開始頁按鈕點不進去。

#### 尚未解決的風險
需要使用者用真機再次確認。若仍無法進入，可能是 `touchend` 對 iOS DeviceOrientation permission 不被視為有效 user activation，或 camera callback 未觸發。下一步可改成在 `touchstart` 直接觸發權限流程，或加暫時 debug toast 顯示事件是否觸發與 permission 回傳狀態。

#### 使用者回饋或修正
等待使用者重新測試手機 Start button。

#### 建議的下一步
請使用者重新整理手機頁面後再點 Start button 測試。若仍失敗，請回報手機系統 / 瀏覽器，以及點擊後是否有任何權限彈窗；下一步會在 `Pages/DomUi.js` 把權限觸發提前到 `touchstart`，或加 debug message 判斷卡在哪一層。

---

### 2026-05-19 — 依 NotAllowedError 將 Start 權限觸發提前到 touchstart

#### 日期
2026-05-19

#### 任務摘要
使用者再次真機測試後仍無法進入，並提供 `NotAllowedError: Permission denied` stack。依此判斷事件已進入 `requestStartPermissions()`，但 `createCapture()` 的相機權限請求在手機瀏覽器中仍被拒，因此將 Start DOM button 的權限觸發從放開階段提前到按下階段。

#### 使用者需求
使用者回報：「還是不行，我按下按鈕後顯示：NotAllowedError: Permission denied」，並提供 stack 指向 `p5.min.js`、`startCameraSafe()`、`requestStartPermissions()`、`handleDomStartAction()`。

#### 實作前理解
前一輪的 `touchend` / `pointerup` 修正已讓事件進入 `handleDomStartAction()`，但相機請求仍被瀏覽器拒絕。這表示問題更可能是 `createCapture()` 觸發時間離使用者手勢太遠，或手機瀏覽器對 `touchend` / 合成 click 的 user activation 判定較嚴格。

#### 實作方案
修改 `Pages/DomUi.js`：`pointerdown` / `touchstart` / `mousedown` 直接呼叫 `handleDomStartAction()`，而 `pointerup` / `touchend` / `click` 只呼叫 `stopDomUiEvent()`。維持 `sketch.js` 的 `startPermissionRequestInProgress` 防重入，並在 `video.elt` 上加一次性 `error` listener，讓相機錯誤時可釋放防重入鎖。

#### 檢視過的檔案
- `Pages/DomUi.js`
- `sketch.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `Pages/DomUi.js`
- `sketch.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
決定先不退回 canvas Start button，也不立刻大改成原生 `getUserMedia()`，而是先把 DOM button 的權限觸發移到最早的手勢事件。這是最小、最符合目前架構的修正。

#### 遇到的問題
CDP 不能完整模擬真機權限與 user activation，因此本地通過只能代表桌面 headless 沒回歸，不能保證手機瀏覽器已修好。

#### 嘗試過的解法
將 Start action 從 `pointerup` / `touchend` / `click` 改到 `pointerdown` / `touchstart` / `mousedown`。補 `video.elt` error listener 釋放防重入。

#### 最終解法
`Pages/DomUi.js` 中 Start button 的按下事件直接呼叫 `handleDomStartAction()`；放開與 click 僅阻止預設行為和冒泡。`sketch.js` 在 `startCameraSafe()` 建立 capture 後，若 video element 發出 error，釋放 `startPermissionRequestInProgress`。

#### 視覺驗證紀錄
- 語法 parse：`Pages/DomUi.js` 通過
- 語法 parse：`sketch.js` 通過
- CDP run id：`dom-start-touchstart-fix-2026-05-19`
- 三個 viewport 都完成 `START → SCANNING → RESULT`
- Portrait Share / Save / Back 仍通過，下載 `FlutterLens-result.png` 大小 778,242 bytes
- Console：仍只有既有 404 resource event；未觀察到新增 JavaScript exception

#### Codex 審美自評
約 `8/10`。本輪沒有改變視覺設計，只調整權限觸發時機；畫面外觀與 DOM UI 移植版一致。

#### 使用者審美回饋
本輪使用者提供功能錯誤 stack，未提供審美評分。

#### 尚未解決的風險
若手機仍出現 `NotAllowedError`，可能是頁面不是 HTTPS、安全來源不符合相機 API 要求、瀏覽器網站權限已被拒、或 p5 `createCapture()` 在該瀏覽器仍無法滿足權限要求。下一步需改用原生 `navigator.mediaDevices.getUserMedia()` 並加明確錯誤提示。

#### 使用者回饋或修正
等待使用者再次真機測試。

#### 建議的下一步
請使用者重新整理頁面並確認網址是否為 HTTPS / GitHub Pages；若仍失敗，請檢查瀏覽器網站設定中相機是否曾被拒絕。若確認 HTTPS 且權限未被拒仍失敗，下一步改寫 `startCameraSafe()`，先用原生 `navigator.mediaDevices.getUserMedia()` 取得 stream，再交給畫面流程使用。

---

### 2026-05-19 — 改用原生 getUserMedia 啟動相機

#### 日期
2026-05-19

#### 任務摘要
使用者回報 touchstart 修正後仍出現同樣的 `NotAllowedError`。依前一輪建議，將 `startCameraSafe()` 從 p5 `createCapture()` 改為 browser 原生 `navigator.mediaDevices.getUserMedia()`，成功取得 stream 後再掛到 p5 video element，排除 p5 權限封裝造成的問題。

#### 使用者需求
使用者表示：「還是一樣的報錯訊息」。

#### 實作前理解
既然 `touchstart` 已經直接觸發權限流程仍被拒，問題可能不是 DOM 事件時機，而是 p5 `createCapture()` 在該手機瀏覽器上的權限封裝或呼叫鏈仍被判定不合規。原生 `getUserMedia()` 是更直接的相機權限 API；若它仍被拒，下一步才應轉向 HTTPS / 網站權限 / 瀏覽器設定排查。

#### 實作方案
把 `startCameraSafe()` 改成 async：先檢查 `navigator.mediaDevices.getUserMedia`，再請求 `{ video: { facingMode: "environment" }, audio: false }`。成功後呼叫 `attachNativeCameraStream(stream)`，以 `createVideo([])` 建立 p5 media element，設定 `playsinline`、`webkit-playsinline`、`muted`、`autoplay` 與 `srcObject`。在 `loadedmetadata` 後設定 video size、播放、釋放防重入、切換到 `SCANNING` 並同步 DOM UI。失敗時釋放防重入並顯示相機權限 / HTTPS 提示。

#### 檢視過的檔案
- `sketch.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 修改過的檔案
- `sketch.js`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
決定不再讓 p5 `createCapture()` 作為第一個相機權限入口。保留 p5 作為後續影像繪製與 `video.get()` 的使用介面，但權限請求改由原生 API 直接處理。這讓權限錯誤更明確，也比較接近手機瀏覽器預期。

#### 遇到的問題
需要讓既有程式仍能使用 `image(video, ...)` 與 `video.get()`。因此沒有直接使用裸 `<video>` element，而是使用 `createVideo([])` 取得 p5 media element，再把原生 stream 掛到 `video.elt.srcObject`。

#### 嘗試過的解法
改寫 `startCameraSafe()` 與新增 `attachNativeCameraStream(stream)`；用 CDP fake camera 驗證 camera fixture 仍能進入 Scanning / Result。

#### 最終解法
`startCameraSafe()` 使用原生 `navigator.mediaDevices.getUserMedia()`；`attachNativeCameraStream()` 建立並設定 p5 video element。`loadedmetadata` 後進入 `SCANNING`。

#### 視覺驗證紀錄
- 語法 parse：`sketch.js` 通過
- CDP run id：`native-camera-start-2026-05-19`
- 三個 viewport 都完成 `START → SCANNING → RESULT`
- Portrait Share / Save / Back 仍通過，下載 `FlutterLens-result.png` 大小 771,572 bytes
- Console：仍只有既有 404 resource event；未觀察到新增 JavaScript exception

#### Codex 審美自評
約 `8/10`。本輪沒有視覺改動，畫面仍維持 DOM UI 移植版；變更集中在相機權限與 video stream 接線。

#### 使用者審美回饋
本輪使用者回報功能問題，未提供審美評分。

#### 尚未解決的風險
真機仍需確認。如果原生 `getUserMedia()` 仍回 `NotAllowedError`，則幾乎可指向 HTTPS / 安全來源、網站相機權限已被拒、瀏覽器設定或系統層權限。CDP fake camera 不能取代真機相機權限測試。

#### 使用者回饋或修正
等待使用者重新整理手機頁面後再次測試。

#### 建議的下一步
請使用者確認手機頁面是否從 HTTPS / GitHub Pages 開啟，並在瀏覽器網站設定中重設相機權限。如果這版仍失敗，下一步加畫面內錯誤提示，將 `error.name` / `error.message` 顯示給使用者，並提供相機權限重設指引。

---

### 2026-05-19 — 檢視 HTML/CSS 架構下的相機與陀螺儀權限風險

#### 日期
2026-05-19

#### 任務摘要
使用者擔心專案改成以 HTML/CSS 為主的 hybrid UI 後，手機相機與陀螺儀權限可能和原本 p5.js 流程衝突。本輪未改程式，先做架構檢視與 CDP fake camera 驗證。

#### 使用者需求
使用者詢問：「請幫我檢視手機的相機以及陀螺儀權限相關功能，由於我們有修改整個架構成以html/css為主，因此有可能和原本的p5js衝突?」

#### 實作前理解
目前 UI 已由 `index.html` 與 `Pages/DomUi.js` 負責 Start、Scanning、Result 的 DOM 按鈕與頁面 active 狀態；p5.js 仍負責 canvas、相機影像繪製、取色、陀螺儀 pitch 判斷與結果生成。權限最敏感的是 Start button 的 user gesture 是否仍能直接觸發 `DeviceOrientationEvent.requestPermission()` 與 `navigator.mediaDevices.getUserMedia()`。

#### 實作方案
先讀取 `docs/agent-quickstart.md`、`docs/testing-playbook.md`、`docs/current-risks-and-next-steps.md`，再檢查 `index.html`、`style.css`、`Pages/DomUi.js`、`sketch.js`、`Pages/ScanningPage/GyroManager.js`、`Pages/ScanningPage/ScanningPage.js`、`Pages/ScanningPage/ColorProcessor.js`。最後執行既有 CDP fake camera 測試，確認 DOM click、camera stream、p5 draw 與 Result 流程是否仍可運作。

#### 檢視過的檔案
- `docs/agent-quickstart.md`
- `docs/testing-playbook.md`
- `docs/current-risks-and-next-steps.md`
- `index.html`
- `style.css`
- `Pages/DomUi.js`
- `sketch.js`
- `Pages/ScanningPage/GyroManager.js`
- `Pages/ScanningPage/ScanningPage.js`
- `Pages/ScanningPage/ColorProcessor.js`
- `docs/cdp-runs/permission-review-2026-05-19/permission-review-2026-05-19-console.json`

#### 修改過的檔案
- `docs/codex-worklog.md`

#### 決策紀錄
目前沒有發現 HTML/CSS overlay 直接遮斷權限手勢：`#dom-ui-layer` 預設 `pointer-events: none`，只有 active page 開啟 `pointer-events: auto`，Start button 透過 DOM `click` 呼叫 `requestStartPermissions()`。相機已改用原生 `navigator.mediaDevices.getUserMedia()`，再接到 p5 `createVideo([])`，因此不再依賴 p5 `createCapture()` 作為主要權限入口。

#### 遇到的問題
`sketch.js` 仍保留舊的 `requestAccess()`，內部使用 `createCapture()` 與另一套 `DeviceOrientationEvent.requestPermission()` 流程；目前搜尋結果顯示未被呼叫，但它會造成後續維護混淆。另有未使用的 `requestMotionPermissionAfterCameraStart()`。真機 iOS 上，先等待 `DeviceOrientationEvent.requestPermission().then(...)` 再呼叫 `getUserMedia()` 是否百分之百維持 user gesture，仍需實機確認。

#### 嘗試過的解法
本輪未修改程式。執行 `.\scripts\run-cdp-visual-test.ps1 -RunId "permission-review-2026-05-19"`，用 Chrome fake camera 驗證 Start → Scanning → Result。

#### 最終解法
本輪結論是「基本架構沒有明顯 p5 / DOM 衝突，但仍有真機權限風險與舊程式碼清理需求」。建議下一輪經使用者同意後，移除或封存舊 `requestAccess()`，統一權限入口，並加上畫面內錯誤狀態顯示。

#### 視覺驗證紀錄
- CDP run id：`permission-review-2026-05-19`
- `portrait-390x844`、`compact-360x740`、`landscape-844x390` 都完成 `START → SCANNING → RESULT`
- 三個 viewport 皆為 `videoReady=true`，且 `hasResultPhoto=true`
- Portrait Share / Save / Back 仍通過，下載 `FlutterLens-result.png` 大小 57,544 bytes
- Console：每個 viewport 各有既有 404 resource event，另有預期中的「透過 HTML 按鈕 Click 成功觸發權限鏈！」；未觀察到新的 `getUserMedia`、`DeviceOrientationEvent`、p5 或 DOM exception

#### Codex 審美自評
約 `8/10`。本輪沒有改變視覺設計；截圖主要用於確認流程非白畫面與 DOM UI 狀態正常。因為任務焦點是權限與架構相容性，沒有進行視覺調參。

#### 使用者審美回饋
本輪使用者詢問功能與架構風險，未提供審美評分。

#### 尚未解決的風險
CDP fake camera 不能代表真實手機相機權限、iOS 動作感測器權限、後鏡頭選擇、HTTPS / GitHub Pages 安全來源、瀏覽器網站權限狀態或系統層相機權限。`window.orientation` 已是較舊 API，未來可考慮以 `screen.orientation` 或事件監聽補強，但需實機驗證。

#### 使用者回饋或修正
等待使用者決定是否要進入下一輪清理與修正。

#### 建議的下一步
建議下一輪先做小範圍修正：清掉舊權限流程、統一 `requestStartPermissions()` / `startCameraSafeWithoutAsync()` 命名與責任、加入畫面內錯誤提示，並在真機上測試 HTTPS、相機允許 / 拒絕、動作感測器允許 / 拒絕、後鏡頭與重新整理後重試流程。

---

### 2026-05-19 — Start page 改為相機與陀螺儀分離授權

#### 日期
2026-05-19

#### 任務摘要
使用者表示目前手機實測無法取得權限，並指定改為兩個獨立權限按鈕：一個詢問相機權限，同意後打勾；另一個詢問陀螺儀權限，同意後打勾；最後的開始按鈕必須等兩個都同意才可按。本輪依此改寫 Start page 權限流程。

#### 使用者需求
使用者要求：「我們換個方式，改成分別請求相機及陀螺儀，所以會多兩個按鈕，一個是按下或詢問是否提供相機權限，同意後會打勾，另一個是陀螺儀，然後最後的開始按鈕要兩個都同意才能按下」

#### 實作前理解
真機權限失敗很可能與一次點擊內連續請求相機與動作感測器有關。把權限拆成兩個明確按鈕後，每個敏感 API 都有自己的使用者手勢；同時可以讓使用者與開發者清楚知道失敗發生在相機或陀螺儀。

#### 實作方案
在 `index.html` 的 Start page 新增 `camera-permission-action`、`motion-permission-action` 與 `start-permission-status`。在 `sketch.js` 建立 `startPermissionState`，讓相機、陀螺儀各自有 `status`、`granted`、`error`。相機按鈕呼叫原生 `navigator.mediaDevices.getUserMedia()`，成功後用 `createVideo([])` 接 stream 並標記 granted，但不進入 Scanning。陀螺儀按鈕在 iOS 呼叫 `DeviceOrientationEvent.requestPermission()`；不支援或不需要該 API 的環境視為 granted。開始按鈕只在兩者都 granted 後切到 `PagesState.SCANNING`。同步更新 DOM UI 樣式、Start layout、CDP 測試腳本與摘要文件。

#### 檢視過的檔案
- `Pages/StartPage/StartPage.js`
- `Pages/StartPage/StartPageSettings.js`
- `Pages/DomUi.js`
- `sketch.js`
- `style.css`
- `index.html`
- `scripts/run-cdp-visual-test.ps1`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`
- `docs/agent-quickstart.md`
- `docs/testing-playbook.md`
- `docs/current-risks-and-next-steps.md`

#### 修改過的檔案
- `index.html`
- `style.css`
- `Pages/StartPage/StartPage.js`
- `Pages/DomUi.js`
- `sketch.js`
- `scripts/run-cdp-visual-test.ps1`
- `docs/agent-quickstart.md`
- `docs/testing-playbook.md`
- `docs/current-risks-and-next-steps.md`
- `docs/visual-test-log.md`
- `docs/codex-worklog.md`

#### 決策紀錄
決定讓 Start page 的「開始探索」不再直接請求權限，而只負責在兩項權限已同意後進入 Scanning。相機 stream 會在 Start page 階段先建立並保存，進入 Scanning 後沿用同一個 p5 video。這樣可避免使用者按開始時才觸發多個權限 API，也方便真機定位錯誤。

#### 遇到的問題
CDP 測試腳本原本只點舊的 Start button。新增 disabled Start button 後，腳本必須改成依序點擊相機權限、陀螺儀權限、開始按鈕，並回讀 `startPermissionState`。第一次修改腳本時多留一個舊的 `if` 區塊結尾，PowerShell parse 檢查報錯，已修正。

#### 嘗試過的解法
先完成分離式權限狀態機與 DOM 按鈕，跑 `split-permissions-2026-05-19`。功能通過後檢查 Start 截圖，發現初始狀態文字與 disabled 開始按鈕略擁擠，因此再做小幅視覺修正：初始狀態列不顯示重複提示，disabled 開始按鈕改成灰底，並重跑 `split-permissions-polish-2026-05-19`。

#### 最終解法
Start page 目前有三顆主要控制：`相機權限`、`陀螺儀權限`、`開始探索 / 等待權限`。兩個權限成功後，權限按鈕會變成打勾狀態，開始按鈕解鎖。若權限錯誤，Start page 會顯示 `error.name`、`error.message`、`window.isSecureContext` 與 `location.protocol`，方便真機排查。

#### 視覺驗證紀錄
- PowerShell 腳本 parse：`scripts/run-cdp-visual-test.ps1` 通過
- CDP run id：`split-permissions-polish-2026-05-19`
- 三個 viewport 都完成 `START → SCANNING → RESULT`
- 三個 viewport 的 `permissionState.camera.status` 與 `permissionState.motion.status` 都是 `granted`
- 三個 viewport 都是 `videoReady=true`、`hasResultPhoto=true`
- Portrait Share / Save / Back 通過，下載 `FlutterLens-result.png` 大小 55,416 bytes
- Console：每個 viewport 仍只有既有 404 resource event，另有預期中的「相機權限按鈕觸發 getUserMedia」；未觀察到新增 JavaScript exception

#### Codex 審美自評
約 `7.5/10`。兩個權限按鈕清楚、實用，disabled 開始按鈕灰底後不再搶注意力。整體偏排錯工具感，適合目前需要解決真機權限問題；弱點是 Start page 底部控制區稍密，若真機高度更小，可能需要進一步縮短 intro 或改 stacked controls。

#### 使用者審美回饋
本輪使用者指定互動流程，未提供審美評分。

#### 尚未解決的風險
CDP fake camera 不能代表真機 iOS / Android 權限彈窗。真機仍需確認 HTTPS / GitHub Pages、網站相機權限、系統相機權限、iOS 動作感測器權限、後鏡頭選擇與重新整理後重試流程。若真機仍失敗，需依 Start page 顯示的錯誤內容判斷下一步。

#### 使用者回饋或修正
等待使用者在手機上測試新的分離式權限流程。

#### 建議的下一步
請使用者用手機重新整理頁面後依序點「相機權限」與「陀螺儀權限」，回報哪一顆沒有打勾，以及畫面上顯示的錯誤名稱 / 訊息。若兩顆都能打勾，再測「開始探索」、後鏡頭畫面、pitch icon、快門、Result、Save / Share / Back。

---

### 2026-05-20 — 真機相機權限問題原因確認

#### 日期
2026-05-20

#### 任務摘要
使用者確認同一支手機可在 ScanApp 取得相機，但 FlutterLens 一開始仍回 `NotAllowedError: Permission denied`。後續使用者發現原因是手機先前不小心對 FlutterLens 網站按過拒絕相機權限，重設權限後問題解決。

#### 使用者需求
使用者回報：「問題解決了，是我的手機以前不小心按到拒絕」

#### 實作前理解
先前的 `NotAllowedError` 不代表 p5.js、HTML/CSS hybrid 架構、`getUserMedia()` constraints 或陀螺儀流程一定有錯。因同一手機可開 ScanApp 並取得相機，問題更可能落在 FlutterLens 網站本身的既有 site permission 狀態。

#### 實作方案
本輪沒有改程式；將真機排查結論記錄到工作日誌，供後續 agent 判斷相機權限問題時優先檢查網站權限是否曾被拒絕。

#### 檢視過的檔案
- `docs/codex-worklog.md`

#### 修改過的檔案
- `docs/codex-worklog.md`

#### 決策紀錄
將「網站權限曾被拒絕」列為未來排查 `NotAllowedError` 的高優先檢查項。若同手機其他 HTTPS camera app 可用，而 FlutterLens 不可用，應先檢查 FlutterLens domain 的瀏覽器網站設定與系統權限，而不是立刻重寫相機流程。

#### 遇到的問題
無新的程式問題。原本錯誤來自手機瀏覽器保存了對 FlutterLens 網站的拒絕狀態。

#### 嘗試過的解法
使用者以同一支手機測試 ScanApp，確認瀏覽器與系統相機能力可用；最後發現 FlutterLens 網站曾被拒絕相機權限。

#### 最終解法
重設或改回 FlutterLens 網站的相機允許權限後，問題解決。

#### 視覺驗證紀錄
本輪沒有新增視覺改動或截圖。前一輪 CDP fake camera 已確認分離式權限流程可運作；真機相機權限問題由使用者排查為網站權限狀態。

#### Codex 審美自評
不適用；本輪是權限排查結論紀錄，沒有畫面改動。

#### 使用者審美回饋
本輪沒有審美回饋。

#### 尚未解決的風險
未來若其他手機出現 `NotAllowedError`，仍需檢查 HTTPS、安全來源、網站權限、系統權限與瀏覽器政策。分離式權限流程仍需更多真機確認陀螺儀權限與後鏡頭表現。

#### 使用者回饋或修正
使用者確認問題原因是先前不小心拒絕 FlutterLens 網站的相機權限。

#### 建議的下一步
繼續用目前分離式權限流程做真機測試；若其他裝置重現 `NotAllowedError`，先檢查該 domain 的網站相機權限是否被封鎖。
