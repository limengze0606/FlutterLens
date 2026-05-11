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

---

### 日期
2026-05-10

### 任務 / 功能
驗證 rough wing 鮮艷乾筆放射式上色，降低 watercolor 暈染成本，改由 `markerBrush` 承擔主要色彩。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 fake camera stream
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
rough wing 色彩應比前一版更鮮艷，但不依賴大量 `brush.fillBleed()` 或 `fillTexture()`。筆觸仍應從翅膀根部往外放射，Voronoi 翅脈需維持可讀。Result page 流程、Save 與 Back 不應回歸失敗。

### 實際觀察
`rough-wing-vivid-balanced-final-2026-05-10` 測試中，`portrait-390x844` 與 `compact-360x740` 均完成 `START → SCANNING → RESULT`。portrait 儲存後下載 `FlutterLens-result.png`，大小 46,875 bytes，返回後狀態為 `SCANNING` 且 `backCleared=true`。Result 截圖顯示 rough wing 已出現明顯紅、紫、藍綠、黃褐色塊，色彩比前版更鮮艷；筆觸仍偏大塊，需真實手機與真實照片確認是否自然。

### 截圖
- `docs/cdp-runs/rough-wing-vivid-balanced-final-2026-05-10/screenshots/rough-wing-vivid-balanced-final-2026-05-10-portrait-390x844-result.png`
- `docs/cdp-runs/rough-wing-vivid-balanced-final-2026-05-10/screenshots/rough-wing-vivid-balanced-final-2026-05-10-compact-360x740-result.png`
- 其他 Start / Scanning / after-back 截圖同樣位於 `docs/cdp-runs/rough-wing-vivid-balanced-final-2026-05-10/screenshots/`
- 下載驗證：`docs/cdp-runs/rough-wing-vivid-balanced-final-2026-05-10/downloads/portrait-390x844/FlutterLens-result.png`

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
- [ ] 真實照片下的鮮艷色相不會過度突兀
- [ ] `markerBrush` 色塊在手機上不會蓋掉翅脈
- [ ] 降低 watercolor 暈染後效能與觸控流暢度可接受

### 備註 / 風險
本次最終視覺驗證使用 fake camera，因此只能確認流程與鮮艷色塊大方向，不能代表真實照片的色彩自然度。landscape Start page 仍回報 `startVisible=false`，此為既有版面風險。視覺驗證後曾將未使用於主上色路徑的 `marker1` opacity 收回原值，並以 Node REPL parse 檢查 `sketch.js` 與 `RoughInsectWings.js` 語法通過。

---

### 日期
2026-05-10

### 任務 / 功能
驗證 rough wing 一幀式小筆觸粒子上色，參考粒子 flow 程式但不使用動畫逐幀累積。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 fake camera stream
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
rough wing 上色應由多段短小筆觸累積，而不是少數大塊色帶或大量 watercolor 暈染。畫面需一幀內完成，不依賴動畫 loop。翅脈與外輪廓仍需可讀，Start → Scanning → Result、portrait Save / Back 不應回歸失敗。

### 實際觀察
`rough-wing-particle-strokes-2026-05-10` 測試中，`portrait-390x844` 與 `compact-360x740` 均完成 `START → SCANNING → RESULT`。portrait 儲存後下載 `FlutterLens-result.png`，大小 52,836 bytes，返回後狀態為 `SCANNING` 且 `backCleared=true`。Result 截圖顯示 rough wing 色彩由許多短筆觸堆疊，翅脈仍可讀；比前一版大色塊更接近參考程式的粒子筆觸感。

### 截圖
- `docs/cdp-runs/rough-wing-particle-strokes-2026-05-10/screenshots/rough-wing-particle-strokes-2026-05-10-portrait-390x844-result.png`
- `docs/cdp-runs/rough-wing-particle-strokes-2026-05-10/screenshots/rough-wing-particle-strokes-2026-05-10-compact-360x740-result.png`
- 其他 Start / Scanning / after-back 截圖同樣位於 `docs/cdp-runs/rough-wing-particle-strokes-2026-05-10/screenshots/`
- 下載驗證：`docs/cdp-runs/rough-wing-particle-strokes-2026-05-10/downloads/portrait-390x844/FlutterLens-result.png`

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
- [ ] 一幀式短筆觸在真實手機上生成速度可接受
- [ ] 真實照片下的短筆觸色彩自然，不過度斑駁或過暗
- [ ] 翅脈與小筆觸在高 DPR 手機上仍清楚

### 備註 / 風險
本次 CDP fake camera 可確認流程、截圖與基本視覺方向，但不能代表真實照片下的色彩自然度與手機 GPU 實際效能。短筆觸數量目前約每側翅膀 82 到 118 條，若實機卡頓，可優先降低 layer count 或改用更低成本的 p5 native 小線段。

---

### 日期
2026-05-10

### 任務 / 功能
驗證 rough wing 小筆觸上色改為只使用第一主色與第二主色之間的漸變，並限制筆觸在翅膀輪廓內。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 fake camera stream
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
rough wing 色彩只應取自第一主色到第二主色的漸變，不再使用額外 accent hue。筆觸應限制在翅膀輪廓內，不再出界。填滿感應比前一版更明顯，但仍需控制筆觸數量以考慮手機效能。

### 實際觀察
`rough-wing-contained-gradient-filled-2026-05-10` 測試中，`portrait-390x844` 與 `compact-360x740` 均完成 `START → SCANNING → RESULT`。portrait 儲存後下載 `FlutterLens-result.png`，大小 64,227 bytes，返回後狀態為 `SCANNING` 且 `backCleared=true`。Result 截圖顯示筆觸比前一版更厚、填滿感較高，且沒有明顯出界；fake camera 下第一與第二主色接近綠色，因此截圖主要呈現綠色系漸變。

### 截圖
- `docs/cdp-runs/rough-wing-contained-gradient-filled-2026-05-10/screenshots/rough-wing-contained-gradient-filled-2026-05-10-portrait-390x844-result.png`
- `docs/cdp-runs/rough-wing-contained-gradient-filled-2026-05-10/screenshots/rough-wing-contained-gradient-filled-2026-05-10-compact-360x740-result.png`
- 其他 Start / Scanning / after-back 截圖同樣位於 `docs/cdp-runs/rough-wing-contained-gradient-filled-2026-05-10/screenshots/`
- 下載驗證：`docs/cdp-runs/rough-wing-contained-gradient-filled-2026-05-10/downloads/portrait-390x844/FlutterLens-result.png`

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
- [ ] 真實照片下第一 / 第二主色漸變足夠可辨識
- [ ] 筆觸在高 DPR 手機上不會因粗度而明顯溢出輪廓
- [ ] 小幅增加筆觸數與粗度後，Result 生成速度仍可接受

### 備註 / 風險
本次為了限制出界已移除 watercolor wash，並將每個粒子點位往翅膀內側推。p5.brush 筆刷本身有寬度，因此嚴格像 mask 一樣完全不出界仍需真正 polygon clipping；目前是以中心線內縮避免可見溢出。若實機仍覺得不夠滿，可先微增 brush weight，而不是大幅增加 count。

---

### 日期
2026-05-11

### 任務 / 功能
驗證 rough wing 新增雙主色關係判斷、裝飾色短筆觸與 NMM 式亮暗高光。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 fake camera stream
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
rough wing 應保留第一主色與第二主色之間的主漸變，並在兩主色對比不足時加入較明顯的裝飾色；若兩主色本來差異大，裝飾色應減量。NMM 式高光應提供亮暗節奏與金屬反射感，但不能蓋掉翅脈或造成明顯出界。Start → Scanning → Result、portrait Save / Back 不應回歸失敗。

### 實際觀察
`rough-wing-accent-nmm-2026-05-11` 測試中，`portrait-390x844` 與 `compact-360x740` 均完成 `START → SCANNING → RESULT`。portrait 儲存後下載 `FlutterLens-result.png`，大小 63,654 bytes，返回後狀態為 `SCANNING` 且 `backCleared=true`。Result 截圖顯示翅膀內有更細的亮暗節奏，翅脈仍可讀，未觀察到明顯外溢。fake camera 讓主色偏綠，因此自動截圖只能確認流程與保守高光方向，無法完整判斷真實照片下的裝飾色選擇。

### 截圖
- `docs/cdp-runs/rough-wing-accent-nmm-2026-05-11/screenshots/rough-wing-accent-nmm-2026-05-11-portrait-390x844-result.png`
- `docs/cdp-runs/rough-wing-accent-nmm-2026-05-11/screenshots/rough-wing-accent-nmm-2026-05-11-compact-360x740-result.png`
- 其他 Start / Scanning / after-back 截圖同樣位於 `docs/cdp-runs/rough-wing-accent-nmm-2026-05-11/screenshots/`
- 下載驗證：`docs/cdp-runs/rough-wing-accent-nmm-2026-05-11/downloads/portrait-390x844/FlutterLens-result.png`

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
- [ ] 兩主色差異大時，裝飾色不會讓畫面變髒
- [ ] 兩主色接近或偏灰時，裝飾色能增加層次
- [ ] NMM 高光有金屬反射感，但不蓋掉翅脈
- [ ] 新增少量 stroke 後 Result 生成速度仍可接受

### 備註 / 風險
本次自動測試使用 fake camera，主色高度偏綠，不能代表真實照片下的配色決策。新增的 accent 與高光層目前刻意偏保守；若真實手機上效果太弱，可微增高光數量或 alpha。landscape Start page 仍回報 `startVisible=false`，此為既有版面風險。

---

### 日期
2026-05-11

### 任務 / 功能
驗證 rough wing 參考實際蝴蝶影像後新增的 pattern layer：深色外緣、邊緣點列、放射色帶與少量眼斑。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 fake camera stream
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
rough wing 應比上一輪更明顯具有蝴蝶翅膀 pattern，包含深色外緣、邊緣淺色點列、放射色帶或少量眼斑。翅脈應仍可讀。Start → Scanning → Result、portrait Save / Back 不應回歸失敗。

### 實際觀察
`rough-wing-butterfly-pattern-2026-05-11` 測試中，`portrait-390x844` 與 `compact-360x740` 均完成 `START → SCANNING → RESULT`。portrait 儲存後下載 `FlutterLens-result.png`，大小 91,947 bytes，返回後狀態為 `SCANNING` 且 `backCleared=true`。compact Result 截圖可清楚看到深色外緣與白點列，辨識度比上一輪提高。portrait Result 中昆蟲位置偏低，被儲存 / 返回按鈕遮住部分翅膀，需另行評估 Result spawn 位置。

### 截圖
- `docs/cdp-runs/rough-wing-butterfly-pattern-2026-05-11/screenshots/rough-wing-butterfly-pattern-2026-05-11-portrait-390x844-result.png`
- `docs/cdp-runs/rough-wing-butterfly-pattern-2026-05-11/screenshots/rough-wing-butterfly-pattern-2026-05-11-compact-360x740-result.png`
- 其他 Start / Scanning / after-back 截圖同樣位於 `docs/cdp-runs/rough-wing-butterfly-pattern-2026-05-11/screenshots/`
- 下載驗證：`docs/cdp-runs/rough-wing-butterfly-pattern-2026-05-11/downloads/portrait-390x844/FlutterLens-result.png`

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
- [ ] 真實照片下深色外緣不會過重
- [ ] 邊緣白點列在高 DPR 手機上仍清楚
- [ ] 放射色帶與翅脈不互相打架
- [ ] Result 昆蟲不會被儲存 / 返回按鈕遮住
- [ ] 新增 pattern layer 後 Result 生成速度仍可接受

### 備註 / 風險
pattern layer 明顯增加畫面資訊，下載 PNG 大小也從上一輪約 63KB 增加到約 92KB。fake camera 背景與主色偏綠，不能代表真實照片下的配色自然度。portrait 截圖出現按鈕遮擋翅膀，這可能是 Result spawn 位置或隨機生成風險，後續可獨立處理。

---

### 日期
2026-05-11

### 任務 / 功能
驗證 rough wing pattern layer 收斂為乾淨內縮版本，降低深色髒邊、過大白點與出界風險。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 fake camera stream
- 是否可測試 AR：只能測試 fake camera UI 流程，不能取代真實手機 AR 測試

### 預期行為
rough wing 應保留蝴蝶翅膀 pattern 的方向，但不再出現上一版的深黑髒邊、大白點列與明顯外溢。圖案應更內縮、較淡，並保留翅脈可讀性。Start → Scanning → Result、portrait Save / Back 不應回歸失敗。

### 實際觀察
`rough-wing-clean-pattern-2026-05-11` 測試中，`portrait-390x844` 與 `compact-360x740` 均完成 `START → SCANNING → RESULT`。portrait 儲存後下載 `FlutterLens-result.png`，大小 76,871 bytes，返回後狀態為 `SCANNING` 且 `backCleared=true`。截圖顯示黑色髒邊與大白點明顯退掉，圖案變成更淡的蝶翼紋理；出界感較上一版降低。compact Result 仍可見儲存 / 返回按鈕遮擋昆蟲，需後續另行處理 Result spawn 安全區域。

### 截圖
- `docs/cdp-runs/rough-wing-clean-pattern-2026-05-11/screenshots/rough-wing-clean-pattern-2026-05-11-portrait-390x844-result.png`
- `docs/cdp-runs/rough-wing-clean-pattern-2026-05-11/screenshots/rough-wing-clean-pattern-2026-05-11-compact-360x740-result.png`
- 其他 Start / Scanning / after-back 截圖同樣位於 `docs/cdp-runs/rough-wing-clean-pattern-2026-05-11/screenshots/`
- 下載驗證：`docs/cdp-runs/rough-wing-clean-pattern-2026-05-11/downloads/portrait-390x844/FlutterLens-result.png`

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
- [ ] clean pattern 在真實照片上不會太淡
- [ ] 筆觸在高 DPR 手機上不會外溢成髒邊
- [ ] Result 昆蟲不會被儲存 / 返回按鈕遮住
- [ ] 新增圖案層後 Result 生成速度仍可接受

### 備註 / 風險
本版將 pattern 從高辨識度改為較乾淨的淡紋理，可能在真實照片上顯得偏弱。若需要再加強，建議只微增 radial band alpha 或 count，不建議恢復深色 rim band。CDP fake camera 無法取代真實手機色彩與效能測試。

---

### 日期
2026-05-11

### 任務 / 功能
驗證 CDP 視覺測試腳本新增 canvas fixture camera，可用本機照片取代 Chrome 預設綠色 fake camera。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 CDP 注入的 canvas mock camera，fixture 為 `tests/fixtures/camera/greenPlants.jpg`
- 是否可測試 AR：可測試不同背景照片下的 UI 與 Result 視覺回歸，仍不能取代真實手機 AR 測試

### 預期行為
執行 `.\scripts\run-cdp-visual-test.ps1 -RunId cdp-fixture-greenPlants-2026-05-11 -CameraFixture greenPlants -CameraWidth 720 -CameraHeight 1280` 時，Scanning 與 Result 背景應顯示 `greenPlants.jpg`，不再是 Chrome 預設綠色 fake camera。portrait / compact 應完成 Start → Scanning → Result；portrait 應完成 Save / Back。

### 實際觀察
`portrait-390x844` 完成 `START → SCANNING → RESULT`，`videoReady=true`，`hasResultPhoto=true`，Save 下載 `FlutterLens-result.png`，大小 772,584 bytes，Back 回到 `SCANNING` 且 `backCleared=true`。`compact-360x740` 完成 `START → SCANNING → RESULT`。`landscape-844x390` 仍因 Start button 不可見停在 `START`，這是既有橫向版面風險。截圖確認 Scanning 與 Result 背景為真實植物照片。

### 截圖
- `docs/cdp-runs/cdp-fixture-greenPlants-2026-05-11/screenshots/cdp-fixture-greenPlants-2026-05-11-greenPlants-portrait-390x844-scanning.png`
- `docs/cdp-runs/cdp-fixture-greenPlants-2026-05-11/screenshots/cdp-fixture-greenPlants-2026-05-11-greenPlants-portrait-390x844-result.png`
- 其他 Start / compact / landscape 截圖同樣位於 `docs/cdp-runs/cdp-fixture-greenPlants-2026-05-11/screenshots/`
- 下載驗證：`docs/cdp-runs/cdp-fixture-greenPlants-2026-05-11/downloads/greenPlants/portrait-390x844/FlutterLens-result.png`

### Console 錯誤
每個 viewport 仍有一筆 console event，與前次已知的非阻斷 404 resource 訊息一致，未阻止 p5.js、mock camera、Result render、Save 或 Back。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實手機相機下的取色與 fixture 測試結果趨勢一致
- [ ] 用其他 fixture，如 `darkWood`、`cementWall`、`colorfulToys`、`streets`，檢查 rough wing 與 Result UI 的穩定性

### 備註 / 風險
canvas fixture camera 可以改善「永遠綠色 fake camera」造成的視覺判斷盲點，也能分開測 viewport 與 camera stream 解析度。但它仍是合成 video stream，不能代表手機鏡頭曝光、對焦、噪訊、權限流程與裝置效能。`tests/` 已被 `.gitignore` 忽略，fixture 圖片保留為本機測試資產。
