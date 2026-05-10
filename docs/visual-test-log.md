# 視覺測試紀錄

## 紀錄格式

### 日期
YYYY-MM-DD

### 任務 / 功能
描述本次測試的功能或視覺變更。

### 測試環境
- Local / GitHub Pages：
- 瀏覽器：
- 裝置：
- Viewport：
- 螢幕方向：
- 是否可使用相機：
- 是否可測試 AR：

### 預期行為
描述畫面或互動應該呈現的結果。

### 實際觀察
描述實際看到的畫面、互動結果或異常。

### 截圖
- 截圖路徑或說明：
- 如果沒有截圖，說明原因。

### Console 錯誤
貼上或摘要瀏覽器 console 錯誤。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常

### 備註 / 風險
記錄尚未解決的視覺、效能或 AR 風險。

---

### 日期
2026-05-10

### 任務 / 功能
驗證前次 agent 留下的 Start → Scanning → Result 自動化視覺測試流程。

### 測試環境
- Local / GitHub Pages：Local Python static server
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：Chrome `--window-size=390,844`；p5 runtime 回報約 `478x694`
- 螢幕方向：Portrait
- 是否可使用相機：使用 `--use-fake-device-for-media-stream` 與 `--use-fake-ui-for-media-stream`
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
Start page 應顯示黑底中文說明與綠色啟動按鈕。透過 CDP 點擊 Start button 後應進入 Scanning page，fake camera 畫面、快門與 UI 應顯示。點擊 shutter 後應進入 Result page，並顯示生成昆蟲、儲存與返回按鈕。

### 實際觀察
CDP 回讀初始狀態為 `START`，`hasP5=true`，Start button 座標為 `(239, 537.6)`。點擊後狀態變為 `SCANNING`，`videoReady=true`，shutter 座標為 `(239, 614)`。再次點擊後狀態變為 `RESULT`，`hasResultPhoto=true`，並取得 `spawnPosition` 與 `spawnPositionRatio`。三張 CDP 截圖皆有實際畫面，不是空白圖。

### 截圖
- `docs/verify-cdp-start-2026-05-10.png`
- `docs/verify-cdp-scanning-2026-05-10.png`
- `docs/verify-cdp-result-2026-05-10.png`
- 另有一次 `docs/verify-start-abs-2026-05-10.png` 為基本 `--screenshot` 測試產生的白圖，保留作為「只看檔案存在不代表視覺成功」的佐證。

### Console 錯誤
本次未收集完整 browser console event。Chrome 曾輸出 managed web app 相關非頁面 fatal 訊息，未阻止 p5.js 頁面載入或互動流程。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常

### 備註 / 風險
CDP + fake camera 流程已確認可用於本機自動化視覺驗證，但真實相機、後鏡頭、DeviceOrientation 權限、觸控手感與行動裝置效能仍需實機測試。未來建議將 CDP 指令整理為可重跑腳本，並加入 console event 收集。

---

### 日期
2026-05-10

### 任務 / 功能
擴充 CDP 自動化視覺測試：console event 收集、不同 viewport、Result page 儲存與返回按鈕。

### 測試環境
- Local / GitHub Pages：Local Python static server
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：Chrome `--window-size=390,844`、`360,740`、`844,390`；runtime 約 `478x694`、`478x590`、`822x240`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 `--use-fake-device-for-media-stream` 與 `--use-fake-ui-for-media-stream`
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
三個 viewport 應可從 Start 進入 Scanning，再點擊 shutter 進入 Result。portrait viewport 應可點擊儲存並下載 PNG，點擊返回後應回到 Scanning，並清空 Result page 暫存資料。Console 不應出現阻斷流程的 JavaScript 錯誤。

### 實際觀察
`portrait-390x844` 完成 `START → SCANNING → RESULT`；儲存按鈕成功下載 `FlutterLens-result.png`，大小 43,501 bytes；返回後狀態為 `SCANNING`，且 `resultPhoto` 與 `spawnPosition` 清空。`compact-360x740` 完成 `START → SCANNING → RESULT`。`landscape-844x390` 停在 `START`，截圖顯示 Start button 掉到畫面下方不可見，無法操作進入 Scanning。Console event 收集在各 viewport 皆捕捉到 1 筆 404 resource 訊息，未阻止流程，未觀察到 fatal JS exception。

### 截圖
- `docs/extended-portrait-390x844-start.png`
- `docs/extended-portrait-390x844-scanning.png`
- `docs/extended-portrait-390x844-result.png`
- `docs/extended-portrait-390x844-after-back.png`
- `docs/extended-compact-360x740-start.png`
- `docs/extended-compact-360x740-scanning.png`
- `docs/extended-compact-360x740-result.png`
- `docs/extended-landscape-844x390-start.png`
- `docs/extended-landscape-844x390-scanning.png`
- `docs/extended-landscape-844x390-result.png`
- 下載驗證：`docs/cdp-downloads-2026-05-10/portrait-390x844/FlutterLens-result.png`

### Console 錯誤
捕捉到 `Failed to load resource: the server responded with a status of 404 (File not found)`。目前判斷不影響 p5.js 初始化、fake camera、Result render、Save 或 Back。仍需進一步確認來源是否為 favicon 或其他非必要資源。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 橫向手機 Start button 可見且可點擊
- [ ] 儲存流程在手機瀏覽器上符合預期

### 備註 / 風險
portrait 與 compact portrait 的自動化流程通過；landscape Start page 有明顯版面風險，需優先修正。CDP `Emulation.setDeviceMetricsOverride` 的精準 viewport 重跑本次發生 timeout，未納入穩定結果；未來應整理成獨立腳本後再補強。

---

### 日期
2026-05-10

### 任務 / 功能
驗證可重跑的 CDP 視覺測試腳本與 screenshots 命名規則。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 fake camera stream
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
執行 `.\scripts\run-cdp-visual-test.ps1 -RunId "codex-script-smoke"` 應產生 `docs/cdp-runs/codex-script-smoke/`，其中 screenshots 命名應符合 `<runId>-<viewportLabel>-<stage>.png`，並產出 summary / console JSON。portrait viewport 應完成 Save / Back 驗證。

### 實際觀察
腳本成功執行並回傳 JSON summary。`portrait-390x844` 完成 `START → SCANNING → RESULT`，Save 產生 `FlutterLens-result.png`，Back 回到 `SCANNING` 且 `backCleared=true`。`compact-360x740` 完成 `START → SCANNING → RESULT`。`landscape-844x390` 回報 `startVisible=false`，未硬點畫面外座標，保留為已知版面風險。

### 截圖
- `docs/cdp-runs/codex-script-smoke/screenshots/codex-script-smoke-portrait-390x844-start.png`
- `docs/cdp-runs/codex-script-smoke/screenshots/codex-script-smoke-portrait-390x844-scanning.png`
- `docs/cdp-runs/codex-script-smoke/screenshots/codex-script-smoke-portrait-390x844-result.png`
- `docs/cdp-runs/codex-script-smoke/screenshots/codex-script-smoke-portrait-390x844-after-back.png`
- `docs/cdp-runs/codex-script-smoke/screenshots/codex-script-smoke-compact-360x740-start.png`
- `docs/cdp-runs/codex-script-smoke/screenshots/codex-script-smoke-compact-360x740-scanning.png`
- `docs/cdp-runs/codex-script-smoke/screenshots/codex-script-smoke-compact-360x740-result.png`
- `docs/cdp-runs/codex-script-smoke/screenshots/codex-script-smoke-landscape-844x390-start.png`
- 下載驗證：`docs/cdp-runs/codex-script-smoke/downloads/portrait-390x844/FlutterLens-result.png`

### Console 錯誤
腳本產出 `docs/cdp-runs/codex-script-smoke/codex-script-smoke-console.json`。summary 顯示每個 viewport 收到 1 筆 console event；未阻止測試流程。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 橫向手機 Start button 可見且可點擊
- [ ] 儲存流程在手機瀏覽器上符合預期

### 備註 / 風險
可重跑腳本已成立，未來修正視覺問題後可用同一腳本回歸。landscape Start page 仍是目前最明確的可用性問題。

---

### 日期
2026-05-10

### 任務 / 功能
驗證 `RoughInsectWings.js` 的 `drawRoughWingColor()` 手繪上色筆觸調整。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 fake camera stream
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
Result page 的 rough wing 上色應呈現自然、手繪 marker / watercolor 筆觸，允許小幅溢出翅膀輪廓，不需要完全依照 Voronoi 網格形狀。Start → Scanning → Result 流程、portrait Save / Back 驗證不應因上色調整而回歸失敗。

### 實際觀察
`rough-wing-color-final-2026-05-10` 測試中，`portrait-390x844` 與 `compact-360x740` 均完成 `START → SCANNING → RESULT`。portrait 儲存後下載 `FlutterLens-result.png`，大小 64,350 bytes，返回後狀態為 `SCANNING` 且 `backCleared=true`。Result 截圖可看到翅膀色彩有鬆散暈染、淡色水痕與小幅出界，線稿與 Voronoi 紋理仍保持在上層。由於 fake camera 畫面是單一亮綠，色彩變化主要呈現淡綠與白色暈染；真實照片下的多色效果仍需實機確認。

### 截圖
- `docs/cdp-runs/rough-wing-color-final-2026-05-10/screenshots/rough-wing-color-final-2026-05-10-portrait-390x844-result.png`
- `docs/cdp-runs/rough-wing-color-final-2026-05-10/screenshots/rough-wing-color-final-2026-05-10-compact-360x740-result.png`
- 其他 Start / Scanning / after-back 截圖同樣位於 `docs/cdp-runs/rough-wing-color-final-2026-05-10/screenshots/`
- 下載驗證：`docs/cdp-runs/rough-wing-color-final-2026-05-10/downloads/portrait-390x844/FlutterLens-result.png`

### Console 錯誤
每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次 CDP 測試相同，未阻止 p5.js、fake camera、Result render、Save 或 Back。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實照片色彩下的 rough wing 上色不過淡也不過度偏色
- [ ] 筆觸溢出在不同手機尺寸下仍看起來自然

### 備註 / 風險
CDP fake camera 可確認流程與基本視覺層次，但不能代表真實環境照片的色彩分布。landscape Start page 仍回報 `startVisible=false`，此為既有版面風險，非本次 rough wing 上色修改造成。

---

### 日期
2026-05-10

### 任務 / 功能
驗證 rough wing 根部放射式上色，包含 p5.brush watercolor fill wedge 與 radial marker strokes。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 fake camera stream
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
rough wing 上色應從翅膀根部往上緣、尖端與尾端放射，筆觸可保留手繪 jitter 與小幅 overshoot，但不應再像隨機填幾筆。Result page 流程、Save 與 Back 不應回歸失敗。

### 實際觀察
`rough-wing-radial-final-2026-05-10` 測試中，`portrait-390x844` 與 `compact-360x740` 均完成 `START → SCANNING → RESULT`。portrait 儲存後下載 `FlutterLens-result.png`，大小 93,294 bytes，返回後狀態為 `SCANNING` 且 `backCleared=true`。Result 截圖可看到翅膀上色比前一版更集中於根部向外的方向，但 fake camera 單一亮綠使 watercolor wedge 偏白、偏發光；真實照片下仍需確認是否自然。

### 截圖
- `docs/cdp-runs/rough-wing-radial-final-2026-05-10/screenshots/rough-wing-radial-final-2026-05-10-portrait-390x844-result.png`
- `docs/cdp-runs/rough-wing-radial-final-2026-05-10/screenshots/rough-wing-radial-final-2026-05-10-compact-360x740-result.png`
- 其他 Start / Scanning / after-back 截圖同樣位於 `docs/cdp-runs/rough-wing-radial-final-2026-05-10/screenshots/`
- 下載驗證：`docs/cdp-runs/rough-wing-radial-final-2026-05-10/downloads/portrait-390x844/FlutterLens-result.png`

### Console 錯誤
每個 viewport 仍有一筆 `Failed to load resource: the server responded with a status of 404 (File not found)`，與前次 CDP 測試相同，未阻止 p5.js、fake camera、Result render、Save 或 Back。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實照片中放射筆觸方向自然
- [ ] watercolor wedge 不會像外圈發光
- [ ] 多色背景下的翅膀色彩不過白也不過度偏色

### 備註 / 風險
CDP fake camera 可驗證流程與基本視覺結構，但不適合判斷真實照片下的色彩自然度。若實機觀察仍偏亮，建議降低或移除 watercolor fill wedge，改由 radial marker strokes 主導上色。
