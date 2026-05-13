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

---

### 日期
2026-05-11

### 任務 / 功能
驗證 Start page responsive layout：直向改為上中下分區，橫向短高度改為左文右按鈕，修正 landscape Start button 不可見。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 CDP 注入的 canvas mock camera，fixture 為 `tests/fixtures/camera/greenPlants.jpg`
- 是否可測試 AR：可測 UI 流程與 Result 視覺回歸，仍不能取代真實手機 AR 測試

### 預期行為
直向 Start page 不應把標題、說明、提示與按鈕全部集中在中央；按鈕應接近下方操作區且可讀可點。短高度橫向應改用精簡版面，Start button 必須可見，CDP 應可從 `START` 進入 `SCANNING` 並拍照進 `RESULT`。

### 實際觀察
`portrait-390x844` 與 `compact-360x740` 的 Start page 呈現上方標題、中段說明、下方提示與按鈕，空間分配比前版更清楚。`landscape-844x390` 改為左側短版標題 / 說明、右側權限提示 / 按鈕，按鈕可見。CDP summary 顯示三個 viewport 均 `startVisible=true`，並皆完成 `START → SCANNING → RESULT`。portrait Save 下載 `FlutterLens-result.png`，大小 771,398 bytes，Back 回到 `SCANNING` 且 `backCleared=true`。

### 截圖
- `docs/cdp-runs/start-layout-responsive-2026-05-11/screenshots/start-layout-responsive-2026-05-11-greenPlants-portrait-390x844-start.png`
- `docs/cdp-runs/start-layout-responsive-2026-05-11/screenshots/start-layout-responsive-2026-05-11-greenPlants-compact-360x740-start.png`
- `docs/cdp-runs/start-layout-responsive-2026-05-11/screenshots/start-layout-responsive-2026-05-11-greenPlants-landscape-844x390-start.png`
- 其他 Scanning / Result / after-back 截圖同樣位於 `docs/cdp-runs/start-layout-responsive-2026-05-11/screenshots/`
- 下載驗證：`docs/cdp-runs/start-layout-responsive-2026-05-11/downloads/greenPlants/portrait-390x844/FlutterLens-result.png`

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start page、mock camera、Result render、Save 或 Back。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實手機直向 Start page 的上中下分區看起來自然
- [ ] 真實手機橫向 Start button 可見且容易點擊

### 備註 / 風險
CDP 截圖確認 layout 與互動流程已改善，但仍需真實手機檢查 Safari / Android Chrome 的 viewport、安全區域、字體渲染與觸控手感。橫向版面刻意使用短文案，避免在低高度硬塞完整說明文字。

---

### 日期
2026-05-11

### 任務 / 功能
測試橫向頁面搭配全部 camera fixtures 的 Scanning / Result 結果。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：主要檢視 `landscape-844x390`，腳本同時跑 `portrait-390x844` 與 `compact-360x740`
- 螢幕方向：Landscape 為本次重點
- 是否可使用相機：使用 CDP 注入的 canvas mock camera
- 是否可測試 AR：可測 fixture 背景下的 UI 與 Result 視覺回歸，仍不能取代真實手機 AR 測試

### 預期行為
五張 fixture：`cementWall`、`colorfulToys`、`darkWood`、`greenPlants`、`streets` 在橫向 viewport 都應可從 Start 進入 Scanning，再點擊 shutter 進入 Result，並產生橫向 Result 截圖。

### 實際觀察
五張 fixture 的 `landscape-844x390` 皆完成 `START → SCANNING → RESULT`，且 `startVisible=true`、`videoReady=true`、`hasResultPhoto=true`。橫向 Result 截圖顯示背景照片與生成昆蟲皆有出現；但 Save / Back 按鈕位於畫面中央偏上，部分結果會和昆蟲或主視覺區域重疊，顯示 Result page 橫向 layout 仍可再優化。

### 截圖
- `docs/cdp-runs/landscape-fixtures-all-2026-05-11/landscape-result-montage.png`
- `docs/cdp-runs/landscape-fixtures-all-2026-05-11/screenshots/` 中包含各 fixture 的 `*-landscape-844x390-scanning.png` 與 `*-landscape-844x390-result.png`

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實手機橫向 Result page 的 Save / Back 不遮住昆蟲
- [ ] 真實手機橫向拍攝時昆蟲生成位置與按鈕安全區保持距離

### 備註 / 風險
本次確認橫向流程已可搭配所有 fixture 跑到 Result。下一個橫向視覺風險是 Result page 的操作按鈕與生成昆蟲可能重疊，尤其在短高度 landscape viewport 中更明顯。

---

### 日期
2026-05-11

### 任務 / 功能
驗證 `drawRoughInsect()` 中 `insectType === 0` 的 rough butterfly 極簡符號式身體。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 CDP 注入的 canvas mock camera，fixture 為 `tests/fixtures/camera/greenPlants.jpg`
- 是否可測試 AR：可測 UI 流程與 Result 視覺回歸，仍不能取代真實手機 AR 測試

### 預期行為
rough butterfly 應在翅膀交會處出現極簡 body：一條細長直線或微彎弧線向下延伸，小點或短線暗示頭部 / 胸部，兩條柔軟外彎觸角自然收尾。body 應只套用於 `insectType === 0`，且不應讓其他 rough insect 類型改變。

### 實際觀察
第一輪 `rough-butterfly-body-2026-05-11` 的 body 主軸太厚，視覺上像紅色柱狀筆畫。收細後執行 `rough-butterfly-body-thin-2026-05-11`，`portrait-390x844`、`compact-360x740`、`landscape-844x390` 都完成 `START → SCANNING → RESULT`，且 `videoReady=true`、`hasResultPhoto=true`。portrait Result 中可見細線 body 與外彎觸角，位置接近翅膀交會處，整體比第一版輕盈。

### 截圖
- `docs/cdp-runs/rough-butterfly-body-thin-2026-05-11/screenshots/rough-butterfly-body-thin-2026-05-11-greenPlants-portrait-390x844-result.png`
- `docs/cdp-runs/rough-butterfly-body-thin-2026-05-11/screenshots/rough-butterfly-body-thin-2026-05-11-greenPlants-compact-360x740-result.png`
- `docs/cdp-runs/rough-butterfly-body-thin-2026-05-11/screenshots/rough-butterfly-body-thin-2026-05-11-greenPlants-landscape-844x390-result.png`
- 第一輪對照：`docs/cdp-runs/rough-butterfly-body-2026-05-11/screenshots/rough-butterfly-body-2026-05-11-greenPlants-portrait-390x844-result.png`

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實手機上 body 線條在亮 / 暗背景都可讀
- [ ] 不同 seed 下 body 與翅膀交會點保持自然
- [ ] 橫向 Result page 的按鈕不應遮住主要昆蟲視覺

### 備註 / 風險
CDP fixture camera 可確認 body 大方向與流程未壞，但不能代表真實手機鏡頭曝光、對焦、噪訊與效能。細線 body 可能在深色或複雜背景下被 wing pattern 吃掉；後續建議用 `-CameraFixture all` 跑完整照片矩陣。橫向 Result page 的 Save / Back 按鈕遮擋風險仍存在，本次未處理。

---

### 日期
2026-05-11

### 任務 / 功能
驗證以 p5.brush 運筆系統重畫的 `insectType === 0` rough butterfly body，並驗證 CDP `-ForcedFinalPitch` 可穩定截取 butterfly。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 CDP 注入的 canvas mock camera，fixture 為 `tests/fixtures/camera/greenPlants.jpg`
- 是否可測試 AR：可測 UI 流程與 Result 視覺回歸，仍不能取代真實手機 AR 測試
- Forced pitch：`-ForcedFinalPitch 0`，summary 顯示 `resultFinalPitch=0`

### 預期行為
Result 應穩定生成 `insectType === 0` butterfly，body 應以紅墨色 brush gesture 出現在翅膀交會處，具備起筆、轉折、收筆與裝飾性節奏，而不是只有一條機械中心線。

### 實際觀察
`portrait-390x844`、`compact-360x740`、`landscape-844x390` 都完成 `START → SCANNING → RESULT`。portrait Save 下載 `FlutterLens-result.png`，大小 781,165 bytes，Back 回到 `SCANNING` 且 `backCleared=true`。body 在 forced type0 截圖中可見，compact result 較容易判讀；portrait result 的生成位置接近 Save / Back，按鈕遮擋影響美感評估。整體比上一版更有紅墨筆勢，但還未達到參考圖那種自然書寫感。

### 截圖
- `docs/cdp-runs/rough-butterfly-body-forced-type0-visible-2026-05-11/screenshots/rough-butterfly-body-forced-type0-visible-2026-05-11-greenPlants-portrait-390x844-result.png`
- `docs/cdp-runs/rough-butterfly-body-forced-type0-visible-2026-05-11/screenshots/rough-butterfly-body-forced-type0-visible-2026-05-11-greenPlants-compact-360x740-result.png`
- `docs/cdp-runs/rough-butterfly-body-forced-type0-visible-2026-05-11/screenshots/rough-butterfly-body-forced-type0-visible-2026-05-11-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`6/10`。優點是紅墨 body 比前版更有存在感，主軸開始有下壓、轉折、收筆概念，觸角也較像從頭部長出的筆勢。弱點是線條仍偏程式化，胸部節奏筆與翅膀根部融合不足；portrait 截圖又被按鈕遮擋，降低整體觀感。下一輪應讓 body 成為更流暢的一筆，而不是分段可見的折線。

### 使用者審美回饋
使用者評分為 `5/10`，認為結果「還可以」。主要問題是整體平衡：目前身體比例相較於翅膀過於細長。使用者建議未來截圖後的自我調整要更大膽，讓每次調整差異明顯，必要時可故意調過頭來找到適當範圍；但 Codex 自行重複調整最好不要超過三次，之後應交給使用者提供意見。使用者也已自行修改身體顏色與筆刷粗細。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實手機上 body 線條在亮 / 暗背景都可讀
- [ ] 不同 seed 下 body 與翅膀交會點保持自然
- [ ] Result spawn 不被 Save / Back 按鈕遮擋

### 備註 / 風險
`-ForcedFinalPitch` 解決了測特定 insect type 的可重現性問題。`drawRoughInsect()` 仍有每幀重新 random 的既有風險，會讓審美比較不穩定。Result page 的 spawn safe area 仍需處理，否則 body 美感會被按鈕遮擋干擾。下一輪 body 調整應優先處理比例平衡，並採用更大幅、少輪次的審美迭代。

---

### 日期
2026-05-11

### 任務 / 功能
驗證 `drawRoughInsect()` 中 `insectType === 0` rough butterfly 新增第二對翅膀，並確認前後翅共用顏色與 pattern 選用。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 CDP 注入的 canvas mock camera，fixture 為 `tests/fixtures/camera/greenPlants.jpg`
- 是否可測試 AR：可測 UI 流程與 Result 視覺回歸，仍不能取代真實手機 AR 測試
- Forced pitch：`-ForcedFinalPitch 0`，summary 顯示 `resultFinalPitch=0`

### 預期行為
rough butterfly 應出現前翅與後翅兩對翅膀。兩對翅膀都從 body plan 的對照點附近長出，可使用不同根點；前後翅應靠近貼合但輪廓可辨，不應完全重疊成單一翅形。同一隻昆蟲的前後翅需共享顏色與 pattern archetype 選用。

### 實際觀察
第一輪 `rough-butterfly-double-wings-v1-2026-05-11` 三個 viewport 都完成 `START → SCANNING → RESULT`，portrait Save 下載 `FlutterLens-result.png`，Back 回到 `SCANNING` 且 `backCleared=true`。但後翅幾乎被前翅吃掉，視覺上仍像單一長翅。

第二輪 `rough-butterfly-double-wings-v2-2026-05-11` 調整前後翅比例、根點與 scale 後，後翅已明顯成為下方翅瓣，與前翅貼近但可辨識。三個 viewport 都完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，大小 772,128 bytes，Back 回到 `SCANNING` 且 `backCleared=true`。三個 viewport 的 consoleCount 皆為 1，仍是既有 404 resource event，未觀察到新增 JavaScript exception。

### 截圖
- 最終第二輪 portrait：`docs/cdp-runs/rough-butterfly-double-wings-v2-2026-05-11/screenshots/rough-butterfly-double-wings-v2-2026-05-11-greenPlants-portrait-390x844-result.png`
- 最終第二輪 compact：`docs/cdp-runs/rough-butterfly-double-wings-v2-2026-05-11/screenshots/rough-butterfly-double-wings-v2-2026-05-11-greenPlants-compact-360x740-result.png`
- 最終第二輪 landscape：`docs/cdp-runs/rough-butterfly-double-wings-v2-2026-05-11/screenshots/rough-butterfly-double-wings-v2-2026-05-11-greenPlants-landscape-844x390-result.png`
- 第一輪對照 portrait：`docs/cdp-runs/rough-butterfly-double-wings-v1-2026-05-11/screenshots/rough-butterfly-double-wings-v1-2026-05-11-greenPlants-portrait-390x844-result.png`
- 第一輪對照 compact：`docs/cdp-runs/rough-butterfly-double-wings-v1-2026-05-11/screenshots/rough-butterfly-double-wings-v1-2026-05-11-greenPlants-compact-360x740-result.png`
- 第一輪對照 landscape：`docs/cdp-runs/rough-butterfly-double-wings-v1-2026-05-11/screenshots/rough-butterfly-double-wings-v1-2026-05-11-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`7/10`。優點是第二輪的四翅 silhouette 已可辨識，後翅像從 body 下方對照點長出，和前翅貼近但不再完全消失；前後翅的綠色系上色與紋路選用一致，沒有同一隻昆蟲內部風格分裂。弱點是後翅仍稍微尾狀，還可以更圓鈍、更像真實蝴蝶後翅；在 `greenPlants` 背景上，翅膀綠色與植物背景接近，主要靠黑色外輪廓維持可讀性。第一輪截圖後做了一次大幅調整；第二輪已足夠提供使用者判斷，因此沒有進行第三輪私下調整。

### 使用者審美回饋
使用者針對本次改動本身給 `8/10`，不是只針對美觀程度。使用者認為本次 Codex 判斷準確：有正確辨認第一次繪製出現的問題，後續改動也能明顯看出差異，並且適當地收手給使用者看。使用者觀察到橫向時的翅膀輪廓比例較自然，問題可能出在翅膀輪廓參照螢幕或畫布的長或寬；直向時翅膀太向下延伸而不自然，橫向時比較剛好。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實手機上前後翅在亮 / 暗背景都可讀
- [ ] 不同 seed 下前後翅貼合但不完全重疊
- [ ] Result spawn 不被 Save / Back 按鈕遮擋
- [ ] 多種相機 fixture 下前後翅 pattern 選用維持一致

### 備註 / 風險
CDP fake camera 可確認流程、截圖與基本視覺方向，但不能代表真實手機鏡頭曝光、背景色彩與效能。`drawRoughInsect()` 仍有每幀重新 random 的既有風險，會影響審美比較穩定性。Result page 的按鈕與生成位置仍可能干擾昆蟲觀察，尤其 landscape 或生成位置偏低時。使用者指出下一個比例風險：portrait / compact 中翅膀可能因參照螢幕或畫布長寬而過度向下延伸；下一輪應以 landscape 較自然的輪廓作為比例參考，修正直向 viewport 的雙翅高度與後翅下垂量。

---

### 日期
2026-05-11

### 任務 / 功能
驗證 rough butterfly 直向雙翅比例修正，讓 portrait / compact 的前後翅不再因畫布長邊參照而過度向下延伸。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 CDP 注入的 canvas mock camera，fixture 為 `tests/fixtures/camera/greenPlants.jpg`
- 是否可測試 AR：可測 UI 流程與 Result 視覺回歸，仍不能取代真實手機 AR 測試
- Forced pitch：`-ForcedFinalPitch 0`，summary 顯示 `resultFinalPitch=0`

### 預期行為
portrait / compact 的 rough butterfly 雙翅應比上一輪更接近 landscape 的自然比例，後翅不應明顯向下拖成長尾瓣。landscape 因上一輪比例較自然，應保持不被本次 portrait-specific 修正破壞。Start → Scanning → Result、portrait Save / Back 不應回歸失敗。

### 實際觀察
第一輪 `rough-butterfly-double-wings-portrait-ratio-v1-2026-05-11` 完成三個 viewport 流程，但 portrait 昆蟲位置剛好被 Save / Back 部分遮擋；compact 顯示比例有改善但後翅仍偏向下拖。第二輪 `rough-butterfly-double-wings-portrait-ratio-v2-2026-05-11` 加強短邊基準與垂直壓縮後，portrait / compact 的整體雙翅高度更收斂，後翅仍可辨但不再一路往下延伸；landscape 仍保持可讀的四翅輪廓。portrait Save 下載 `FlutterLens-result.png`，大小 779,393 bytes，Back 回到 `SCANNING` 且 `backCleared=true`。

### 截圖
- 最終第二輪 portrait：`docs/cdp-runs/rough-butterfly-double-wings-portrait-ratio-v2-2026-05-11/screenshots/rough-butterfly-double-wings-portrait-ratio-v2-2026-05-11-greenPlants-portrait-390x844-result.png`
- 最終第二輪 compact：`docs/cdp-runs/rough-butterfly-double-wings-portrait-ratio-v2-2026-05-11/screenshots/rough-butterfly-double-wings-portrait-ratio-v2-2026-05-11-greenPlants-compact-360x740-result.png`
- 最終第二輪 landscape：`docs/cdp-runs/rough-butterfly-double-wings-portrait-ratio-v2-2026-05-11/screenshots/rough-butterfly-double-wings-portrait-ratio-v2-2026-05-11-greenPlants-landscape-844x390-result.png`
- 第一輪對照 portrait：`docs/cdp-runs/rough-butterfly-double-wings-portrait-ratio-v1-2026-05-11/screenshots/rough-butterfly-double-wings-portrait-ratio-v1-2026-05-11-greenPlants-portrait-390x844-result.png`
- 第一輪對照 compact：`docs/cdp-runs/rough-butterfly-double-wings-portrait-ratio-v1-2026-05-11/screenshots/rough-butterfly-double-wings-portrait-ratio-v1-2026-05-11-greenPlants-compact-360x740-result.png`
- 第一輪對照 landscape：`docs/cdp-runs/rough-butterfly-double-wings-portrait-ratio-v1-2026-05-11/screenshots/rough-butterfly-double-wings-portrait-ratio-v1-2026-05-11-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`7.5/10`。優點是本輪直接回應使用者指出的 viewport 比例問題，直向雙翅高度與後翅下垂量比上一輪自然，且 landscape 沒有被破壞。弱點是後翅末端仍略尖，若要更像真實蝴蝶可下一輪改為更圓鈍的後翅輪廓，而不是繼續壓縮整體比例。綠色背景下翅膀與植物仍接近，輪廓主要靠黑線支撐。

### 使用者審美回饋
使用者對 `portrait-ratio-v2` 給 `6/10`。使用者認為本輪有改善問題，但沒有到差很多；這點可以接受。使用者也認同 Codex 提到的「後翅專屬輪廓」是很好的下一步方向。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後仍正常
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實手機 portrait 下雙翅不過度向下延伸
- [ ] 真實手機 landscape 下雙翅比例仍自然
- [ ] 不同 seed 下前後翅貼合但不完全重疊
- [ ] Result spawn 不被 Save / Back 按鈕遮擋

### 備註 / 風險
本次用 `portraitAmount` 保護 landscape 並壓縮 portrait / compact，但使用者回饋顯示此方向雖有改善，幅度不夠大。下一輪應轉向後翅專屬的圓鈍輪廓設計，而不是繼續只靠 scale、tipY 或 yOff 壓縮。不同手機實際 viewport 與 DPR 仍可能讓壓縮曲線需要微調。

---

### 日期
2026-05-11

### 任務 / 功能
驗證 rough butterfly 新增偽 3D 姿態矩陣與離散振翅 phase 後的視覺效果。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 CDP 注入的 canvas mock camera，fixture 為 `tests/fixtures/camera/greenPlants.jpg`
- 是否可測試 AR：可測 UI 流程與 Result 視覺回歸，仍不能取代真實手機 AR 測試
- Forced pitch：`-ForcedFinalPitch 0`，summary 顯示 `resultFinalPitch=0`

### 預期行為
rough butterfly 應不再只有平面旋轉，而是透過 `posePlan` 呈現不同 roll / yaw / pitch 的飛行姿態。左右翅膀應有近遠側大小差、垂直位移、旋轉差與遮擋順序，振翅 phase 應讓翅膀出現半收、平展或下拍的 silhouette 差異。Start → Scanning → Result、portrait Save / Back 不應回歸失敗。

### 實際觀察
第一輪 `rough-butterfly-pose-flap-v1-2026-05-11` 功能流程通過，但 portrait / compact 的蝴蝶太像兩片直立葉片，折翅幅度過大，四翅與身體不易讀出。第二輪 `rough-butterfly-pose-flap-v2-2026-05-11` 降低折翅與近遠側變形強度後，compact / landscape 的輪廓較穩定，能看出半收翅與飛行角度；portrait 仍被 Save / Back 按鈕遮到，身體與後翅可讀性偏弱。三個 viewport 都完成 `START → SCANNING → RESULT`；portrait Save 下載 `FlutterLens-result.png`，大小 770,028 bytes，Back 回到 `SCANNING` 且 `backCleared=true`。

### 截圖
- 最終第二輪 portrait：`docs/cdp-runs/rough-butterfly-pose-flap-v2-2026-05-11/screenshots/rough-butterfly-pose-flap-v2-2026-05-11-greenPlants-portrait-390x844-result.png`
- 最終第二輪 compact：`docs/cdp-runs/rough-butterfly-pose-flap-v2-2026-05-11/screenshots/rough-butterfly-pose-flap-v2-2026-05-11-greenPlants-compact-360x740-result.png`
- 最終第二輪 landscape：`docs/cdp-runs/rough-butterfly-pose-flap-v2-2026-05-11/screenshots/rough-butterfly-pose-flap-v2-2026-05-11-greenPlants-landscape-844x390-result.png`
- 第一輪對照 portrait：`docs/cdp-runs/rough-butterfly-pose-flap-v1-2026-05-11/screenshots/rough-butterfly-pose-flap-v1-2026-05-11-greenPlants-portrait-390x844-result.png`
- 第一輪對照 compact：`docs/cdp-runs/rough-butterfly-pose-flap-v1-2026-05-11/screenshots/rough-butterfly-pose-flap-v1-2026-05-11-greenPlants-compact-360x740-result.png`
- 第一輪對照 landscape：`docs/cdp-runs/rough-butterfly-pose-flap-v1-2026-05-11/screenshots/rough-butterfly-pose-flap-v1-2026-05-11-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`6.5/10`。優點是姿態系統已經開始工作，昆蟲不再只是平面旋轉；第二輪也比第一輪更像半收翅飛行姿態。弱點是後翅與身體仍不夠明確，portrait 受按鈕遮擋很嚴重，參考圖中那種輕盈、多角度線稿感還只做到骨架，沒有完全到位。本次做了一次明顯調整後停止，因為第二輪已足以讓使用者判斷方向。

### 使用者審美回饋
使用者給 `6.5/10`。使用者認為有變化但還不夠明顯，且身體本身需要更大的角度變化來帶動全身。使用者也指出目前截圖流程或判讀沒有成功取到真正的蝴蝶部分，因為看到的是沒有身體的蛾模板；後續測試必須把「body 清楚可見並帶動翅膀」列為通過條件。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後姿態不會每幀抖動
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實手機上不同 seed 能看出不同姿態
- [ ] 半收翅、平展、下拍階段都能清楚辨識
- [ ] Result spawn 不被 Save / Back 按鈕遮擋

### 備註 / 風險
目前只完成第一版偽 3D pose，不是真正透視投影。使用者回饋顯示本次結果不能只看翅膀 silhouette，還必須確認 body 是否存在且足以帶動全身姿態。下一步應讓 body stroke 直接讀取 posePlan 做更明顯的軸線彎折，並改善 Result spawn 與按鈕遮擋；若截圖中 body 不清楚，該截圖不應作為成功視覺驗證。

---

### 日期
2026-05-11

### 任務 / 功能
驗證 rough butterfly body axis 讀取 `posePlan` 後，身體是否能清楚可見並帶動翅膀姿態。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：使用 CDP 注入的 canvas mock camera，fixture 為 `tests/fixtures/camera/greenPlants.jpg`
- 是否可測試 AR：可測 UI 流程與 Result 視覺回歸，仍不能取代真實手機 AR 測試
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：第二輪使用 `-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`，避免 Save / Back 按鈕遮住昆蟲

### 預期行為
body 不應只是細線或消失在翅膀中，而應作為清楚的黑色主軸出現。身體的頭、胸、腰、腹、尾應依 `posePlan` 產生可見的偏移與角度，翅根、前翅、後翅應像是被 body axis 帶動，而不是單獨變形成無身體的蛾模板。

### 實際觀察
第一輪 `rough-butterfly-body-axis-pose-v1-2026-05-11` 中，compact 的 body 已比前版清楚，但 portrait / landscape 仍被 Save / Back 按鈕遮擋，無法公平評估。第二輪在 CDP 腳本新增 forced spawn ratio 後，`rough-butterfly-body-axis-pose-v2-2026-05-11` 的三個 viewport 都能清楚看到 body；portrait 與 compact 可讀出頭部、觸角、胸部與腹部主軸，已不再像無身體模板。landscape 仍靠近按鈕，但昆蟲本體位於上方，body 可見。

### 截圖
- 最終第二輪 portrait：`docs/cdp-runs/rough-butterfly-body-axis-pose-v2-2026-05-11/screenshots/rough-butterfly-body-axis-pose-v2-2026-05-11-greenPlants-portrait-390x844-result.png`
- 最終第二輪 compact：`docs/cdp-runs/rough-butterfly-body-axis-pose-v2-2026-05-11/screenshots/rough-butterfly-body-axis-pose-v2-2026-05-11-greenPlants-compact-360x740-result.png`
- 最終第二輪 landscape：`docs/cdp-runs/rough-butterfly-body-axis-pose-v2-2026-05-11/screenshots/rough-butterfly-body-axis-pose-v2-2026-05-11-greenPlants-landscape-844x390-result.png`
- 第一輪對照 portrait：`docs/cdp-runs/rough-butterfly-body-axis-pose-v1-2026-05-11/screenshots/rough-butterfly-body-axis-pose-v1-2026-05-11-greenPlants-portrait-390x844-result.png`
- 第一輪對照 compact：`docs/cdp-runs/rough-butterfly-body-axis-pose-v1-2026-05-11/screenshots/rough-butterfly-body-axis-pose-v1-2026-05-11-greenPlants-compact-360x740-result.png`
- 第一輪對照 landscape：`docs/cdp-runs/rough-butterfly-body-axis-pose-v1-2026-05-11/screenshots/rough-butterfly-body-axis-pose-v1-2026-05-11-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`7/10`。優點是 body 真的成為視覺骨架，頭部、觸角、胸腹主軸都能讀出來，蝴蝶不再像無身體的蛾模板；CDP forced spawn 也讓截圖評估更可靠。弱點是 body 的角度變化仍偏正面，尚未出現參考圖中那種明顯側飛、俯仰或翻轉的姿態差異；翅膀的近遠側投影也還偏保守。下一輪若繼續，應用更明確的 pose preset，而不是只靠連續 random。

### 使用者審美回饋
使用者回饋：Codex 的自評準確，提出的修改方向也合理。也就是目前 `7/10` 的判斷可沿用：body 已清楚可見，但姿態仍偏正面，下一輪應以離散 pose preset 做出更明顯的側飛、俯仰、翻轉差異。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 重新整理後姿態不會每幀抖動
- [ ] 在 GitHub Pages HTTPS 網址上正常
- [ ] 真實手機上 body 不會被背景吃掉
- [ ] 真實手機上 body 與翅膀角度連動可讀
- [ ] 多個 seed 中能出現明顯側飛 / 俯仰 / 翻轉差異

### 備註 / 風險
本輪改善了 body 可見度與測試截圖位置，但仍未解決「姿態差異要更大」的核心美術目標。若下一輪繼續，應設計離散 pose preset，例如正面展翅、三分之二側飛、側身上拍、俯視下拍，而不是只靠 random yaw / pitch 小幅變化。

---

### 日期
2026-05-12

### 任務 / 功能
驗證 rough butterfly 身體改為 p5.brush 具象頭、胸、腹結構後，是否比原本 body axis 更接近 `InsectBody.js` 的具象昆蟲身體。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- 螢幕方向：Portrait、compact portrait、landscape
- 是否可使用相機：第一次測試誤用 Chrome 預設 fake camera；使用者提醒後補跑 canvas fixture `tests/fixtures/camera/greenPlants.jpg`
- 是否可測試 AR：可測 UI 流程與 Result 視覺回歸，仍不能取代真實手機 AR 測試
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`

### 預期行為
Result page 的 rough butterfly body 應可讀出頭、胸、腹與腹部分節，而不是只有中線、黑色中心點或無身體蛾模板。p5.brush 的筆觸應保留 rough 手繪質感，不能變成 `InsectBody.js` 那種完全乾淨的 native ellipse。

### 實際觀察
第一輪 `rough-butterfly-figurative-brush-body-v1-2026-05-12` 的功能流程通過，body 也出現，但遠看仍偏小偏黑，容易糊成中心黑點。第二輪 `rough-butterfly-figurative-brush-body-v2-2026-05-12` 放大頭胸腹並加入暖色 dorsal highlight 後，portrait / compact 都能看出具象身體。此時仍是預設 fake camera，未使用 fixtures，是本輪驗證疏漏。使用者提醒後補跑 `rough-butterfly-figurative-brush-body-greenPlants-v2-2026-05-12`，使用 `greenPlants.jpg` fixture；在植物背景中，portrait / compact 都能讀出頭、胸、腹與腹部分節，compact 最清楚。landscape 可見 body，但 forced spawn 位置偏上，昆蟲接近畫面上緣。

### 截圖
- 補測 greenPlants portrait：`docs/cdp-runs/rough-butterfly-figurative-brush-body-greenPlants-v2-2026-05-12/screenshots/rough-butterfly-figurative-brush-body-greenPlants-v2-2026-05-12-greenPlants-portrait-390x844-result.png`
- 補測 greenPlants compact：`docs/cdp-runs/rough-butterfly-figurative-brush-body-greenPlants-v2-2026-05-12/screenshots/rough-butterfly-figurative-brush-body-greenPlants-v2-2026-05-12-greenPlants-compact-360x740-result.png`
- 補測 greenPlants landscape：`docs/cdp-runs/rough-butterfly-figurative-brush-body-greenPlants-v2-2026-05-12/screenshots/rough-butterfly-figurative-brush-body-greenPlants-v2-2026-05-12-greenPlants-landscape-844x390-result.png`
- 第二輪預設 fake camera portrait：`docs/cdp-runs/rough-butterfly-figurative-brush-body-v2-2026-05-12/screenshots/rough-butterfly-figurative-brush-body-v2-2026-05-12-default-portrait-390x844-result.png`
- 第二輪預設 fake camera compact：`docs/cdp-runs/rough-butterfly-figurative-brush-body-v2-2026-05-12/screenshots/rough-butterfly-figurative-brush-body-v2-2026-05-12-default-compact-360x740-result.png`
- 第二輪預設 fake camera landscape：`docs/cdp-runs/rough-butterfly-figurative-brush-body-v2-2026-05-12/screenshots/rough-butterfly-figurative-brush-body-v2-2026-05-12-default-landscape-844x390-result.png`
- 第一輪對照 portrait：`docs/cdp-runs/rough-butterfly-figurative-brush-body-v1-2026-05-12/screenshots/rough-butterfly-figurative-brush-body-v1-2026-05-12-default-portrait-390x844-result.png`
- 第一輪對照 compact：`docs/cdp-runs/rough-butterfly-figurative-brush-body-v1-2026-05-12/screenshots/rough-butterfly-figurative-brush-body-v1-2026-05-12-default-compact-360x740-result.png`
- 第一輪對照 landscape：`docs/cdp-runs/rough-butterfly-figurative-brush-body-v1-2026-05-12/screenshots/rough-butterfly-figurative-brush-body-v1-2026-05-12-default-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`7.2/10`。優點是 rough butterfly body 已從線稿骨架變成較具象的 head / thorax / abdomen，分節與背線 highlight 讓腹部比前版更可讀，也保留 p5.brush 的手繪感。補測 `greenPlants.jpg` 後，確認植物背景中 body 仍可讀，但深綠葉叢會吃掉一部分黑色線條。弱點是 body 在整隻昆蟲比例中仍偏小，深色身體仍容易依賴輪廓與 highlight 判讀；姿態本身還沒有本輪改動，只是把既有 pose body 變得更具象。

### 使用者審美回饋
使用者指出本輪最初沒有使用 fixtures 內的圖片測試。已補跑 `greenPlants.jpg` fixture 並更新紀錄。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 真實手機上 body 不會被背景吃掉
- [ ] 真實手機上頭、胸、腹與分節仍可讀
- [ ] 真實手機上 p5.brush body 不會太重或太髒
- [ ] landscape spawn 不貼近畫面上緣

### 備註 / 風險
本輪驗證的是具象 body，而不是新的姿態 preset。第一次測試漏用 fixtures 是驗證流程疏漏；已補跑 `greenPlants.jpg`，但尚未跑 `-CameraFixture all` 的完整背景壓力測試。CDP canvas fixture 可以確認 UI 與 rough body 視覺回歸，但不能替代真實手機 AR 測試。下一輪若使用者認可 body 方向，可回到離散 pose preset；若 body 仍不夠具象，建議先放大 body 或提高 highlight 對比。

---

### 日期
2026-05-12

### 任務 / 功能
驗證 `RoughInsectBody.js` 回到基礎三段式 body：頭、胸、腹三個空心輪廓，內部不填色、不畫分節，並暫時固定 rough butterfly pose。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Camera size：`720x1280`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`
- 是否可測試 AR：可測 UI 流程與 Result 視覺回歸，仍不能取代真實手機 AR 測試

### 預期行為
Result page 的 rough butterfly body 應清楚退回三個空心輪廓：頭、胸、腹。內部不應再有填色、highlight、腹部分節、胸毛、頭部點或觸角。body 與 wings 暫時不套用 pseudo-3D posePlan，以便先評估基礎比例與結構。

### 實際觀察
第一輪 `rough-body-three-outline-2026-05-12` 成功顯示三個空心輪廓，但在 `greenPlants.jpg` 背景與翅膀內部線條上偏淡，頭胸腹不夠像主結構。第二輪 `rough-body-three-outline-bolder-2026-05-12` 放大三個輪廓並加粗線寬後，portrait / compact 都能讀出三段式 body。landscape 也可見 body，但畫面高度較低且 Save / Back 按鈕靠近昆蟲，構圖判讀仍受限制。三個 viewport 都成功完成 Start → Scanning → Result；portrait 也完成 Save / Back。

### 截圖
- 第二輪 portrait：`docs/cdp-runs/rough-body-three-outline-bolder-2026-05-12/screenshots/rough-body-three-outline-bolder-2026-05-12-greenPlants-portrait-390x844-result.png`
- 第二輪 compact：`docs/cdp-runs/rough-body-three-outline-bolder-2026-05-12/screenshots/rough-body-three-outline-bolder-2026-05-12-greenPlants-compact-360x740-result.png`
- 第二輪 landscape：`docs/cdp-runs/rough-body-three-outline-bolder-2026-05-12/screenshots/rough-body-three-outline-bolder-2026-05-12-greenPlants-landscape-844x390-result.png`
- 第一輪對照 portrait：`docs/cdp-runs/rough-body-three-outline-2026-05-12/screenshots/rough-body-three-outline-2026-05-12-greenPlants-portrait-390x844-result.png`
- 第一輪對照 compact：`docs/cdp-runs/rough-body-three-outline-2026-05-12/screenshots/rough-body-three-outline-2026-05-12-greenPlants-compact-360x740-result.png`
- 第一輪對照 landscape：`docs/cdp-runs/rough-body-three-outline-2026-05-12/screenshots/rough-body-three-outline-2026-05-12-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`6.8/10`。優點是這版很誠實地回到 body 地基，頭、胸、腹三段比前一版填色具象 body 更容易被單獨檢查，也不會被 highlight、分節或觸角干擾。第二輪加粗後，三段輪廓在植物背景中可讀性明顯改善。弱點是視覺魅力刻意收掉了，目前更像骨架草圖，而不是已完成的昆蟲；頭胸腹與翅根的融合仍偏機械，landscape 構圖也受按鈕干擾。本輪做了一次視覺調整後停止，因任務目標是建立地基，不是追求最終美感。

### 使用者審美回饋
尚未收到本輪截圖後的使用者評分。使用者本輪需求是「回頭打好 `RoughInsectBody.js` 的地基，先不考慮或固定住翅膀或身體本身的角度，將身體構造簡化為頭、胸、腹三個圖形，只畫輪廓，內部不用填滿顏色」。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] Canvas 符合 viewport
- [ ] 觸控互動正常
- [ ] AR 疊合位置可接受
- [ ] 沒有明顯掉幀
- [ ] 真實手機上三個 body 輪廓不會被背景吃掉
- [ ] 真實手機上 head / thorax / abdomen 比例仍可讀
- [ ] 後續加回觸角或分節時不會破壞目前地基
- [ ] 後續 pose preset 能讓三輪廓 body 與 wing root 一起連動

### 備註 / 風險
CDP canvas fixture 可以確認 UI 與 rough body 視覺回歸，但不能替代真實手機 AR 測試。這版刻意停用 rough butterfly posePlan，因此姿態暫時變得較正面；若後續要做側飛、俯仰或翻轉，需要先決定三輪廓 body 如何投影，而不是直接回到連續隨機扭曲。尚未跑 `-CameraFixture all` 的完整背景壓力測試。

---

### 日期
2026-05-12

### 任務 / 功能
修正 `RoughInsectBody.js` 中 `brushWeight` 與 `strokeWeight` 容易混淆的 helper 設計，並加粗 body 輪廓、拉長腹部輪廓。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Camera size：`720x1280`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`

### 預期行為
`RoughInsectBody.js` 中不應再有自訂 `brushWeight` option；body 筆觸粗細應統一由 `strokeWeight` 控制。Result page 應顯示更粗的頭、胸、腹輪廓，且腹部比前一版更長。

### 實際觀察
`rg` 已確認 `RoughInsectBody.js` 中沒有殘留 `brushWeight`。視覺測試 `rough-body-outline-weight-cleanup-2026-05-12` 中，portrait / compact 的腹部輪廓明顯拉長，三段 body 比上一版更像主結構。landscape 仍可見 body，但按鈕與低畫面高度仍干擾構圖判讀。三個 viewport 都成功完成 Start → Scanning → Result；portrait 完成 Save / Back。

### 截圖
- portrait：`docs/cdp-runs/rough-body-outline-weight-cleanup-2026-05-12/screenshots/rough-body-outline-weight-cleanup-2026-05-12-greenPlants-portrait-390x844-result.png`
- compact：`docs/cdp-runs/rough-body-outline-weight-cleanup-2026-05-12/screenshots/rough-body-outline-weight-cleanup-2026-05-12-greenPlants-compact-360x740-result.png`
- landscape：`docs/cdp-runs/rough-body-outline-weight-cleanup-2026-05-12/screenshots/rough-body-outline-weight-cleanup-2026-05-12-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`7.1/10`。優點是腹部長度更有昆蟲身體主軸感，三段輪廓在植物背景上更穩定可讀，且筆觸參數語意更乾淨。弱點是黑色輪廓現在存在感較強，會和翅膀內部線條競爭；若後續加回分節或觸角，需小心不要讓中心 body 變成過重黑線團。

### 使用者審美回饋
使用者指出 `brushWeight` 與 `strokeWeight` 的語意問題，並要求趁現在修正，同時加粗身體輪廓線、拉長腹部輪廓。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 相機權限流程正常
- [ ] 真實手機上加粗輪廓不會顯得過黑
- [ ] 真實手機上腹部拉長後不會被 Save / Back 或畫面邊緣遮擋
- [ ] 後續加回細節時仍維持 `strokeWeight` 為唯一 body 粗細參數

### 備註 / 風險
本輪只清理 `RoughInsectBody.js`，沒有同步修改 `RoughInsectWings.js` 中既有 wing pattern 的 `brushWeight` 參數命名。若後續要全專案一致化，需要另開一輪檢查 wings 的筆觸 helper，避免一次重構影響太多視覺輸出。

---

### 日期
2026-05-12

### 任務 / 功能
在目前三段式 rough butterfly body 地基上，加回兩條簡單觸角線。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Camera size：`720x1280`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`

### 預期行為
Result page 的 rough butterfly body 應維持頭、胸、腹三個空心輪廓，並在頭部上方出現左右各一條簡單觸角線。觸角不應加入端點球、填色或其他裝飾，也不應重新引入 `brushWeight`。

### 實際觀察
`rough-body-simple-antennae-2026-05-12` 中，portrait / compact 都能看到兩條觸角線，觸角從頭部上緣向左右上方延伸，沒有破壞三段 body 地基。landscape 仍可見觸角，但受畫面高度與按鈕遮擋風險影響，構圖判讀較弱。三個 viewport 都成功完成 Start → Scanning → Result；portrait 完成 Save / Back。

### 截圖
- portrait：`docs/cdp-runs/rough-body-simple-antennae-2026-05-12/screenshots/rough-body-simple-antennae-2026-05-12-greenPlants-portrait-390x844-result.png`
- compact：`docs/cdp-runs/rough-body-simple-antennae-2026-05-12/screenshots/rough-body-simple-antennae-2026-05-12-greenPlants-compact-360x740-result.png`
- landscape：`docs/cdp-runs/rough-body-simple-antennae-2026-05-12/screenshots/rough-body-simple-antennae-2026-05-12-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`7.2/10`。優點是兩條觸角讓頭部方向更像昆蟲，且沒有把 body 地基重新複雜化。觸角線長度與粗細在 portrait / compact 中可讀，不會明顯壓過頭胸腹輪廓。弱點是觸角目前仍偏符號化，缺少更自然的起筆、彎曲與收筆魅力；但本輪目標是「兩條線」，因此先不加額外裝飾。

### 使用者審美回饋
使用者要求「加上觸角，兩條線」。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 可在手機載入
- [ ] 真實手機上觸角不會被背景吃掉
- [ ] 真實手機上觸角不會與翅膀上緣混在一起
- [ ] 後續若加腹部分節，仍維持 body 地基清楚

### 備註 / 風險
本輪只加兩條簡單觸角，尚未重新設計更有手繪運筆意圖的 antenna stroke grammar。若使用者覺得方向正確，後續可再調觸角長度、外彎幅度或起筆位置；若覺得目前已足夠，下一步可改處理腹部分節。

---

### 日期
2026-05-12

### 任務 / 功能
整理 rough insect 的整體畫布旋轉，改成先決定離散 screen rotation plan，再只套用一次 `rotate()`。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Camera size：`720x1280`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`

### 預期行為
rough insect 應先由 `createRoughScreenRotationPlan()` 選出整體畫布方向，並只在 `drawRoughInsect()` 中套用一次 `insectLayer.rotate()`。翅膀、身體與觸角應同步跟著同一個畫布旋轉；本階段不應改變 body 編排、翅膀形變或 posePlan。

### 實際觀察
`rough-screen-rotation-plan-2026-05-12` 中，三個 viewport 都成功完成 Start → Scanning → Result；portrait 完成 Save / Back。截圖中的翅膀、身體與觸角維持同步，沒有出現翅膀與 body 分離或各自旋轉的現象。本次實際抽到的方向接近直立 hover，因此視覺截圖驗證了單一整體旋轉與同步性，但尚未用截圖覆蓋所有 screen rotation plan 分支。

### 截圖
- portrait：`docs/cdp-runs/rough-screen-rotation-plan-2026-05-12/screenshots/rough-screen-rotation-plan-2026-05-12-greenPlants-portrait-390x844-result.png`
- compact：`docs/cdp-runs/rough-screen-rotation-plan-2026-05-12/screenshots/rough-screen-rotation-plan-2026-05-12-greenPlants-compact-360x740-result.png`
- landscape：`docs/cdp-runs/rough-screen-rotation-plan-2026-05-12/screenshots/rough-screen-rotation-plan-2026-05-12-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`7.2/10`。優點是整體方向控制變乾淨，body、wing、antennae 仍像同一隻昆蟲，不再有雙重旋轉造成的不可控斜角。弱點是本次截圖抽到的方向偏直立，還沒有把 `diagonalRise` 與 `sideDrift` 的視覺差異完整展示出來；因此目前更像技術地基確認，不是完整姿態審美評分。

### 使用者審美回饋
使用者要求這階段只確認整體轉向正確性，不改變身體編排或翅膀變形；並指出旋轉角度應先決定 plan，再讓每個 plan 有各自範圍，使 plan 間差異更明顯。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 真實手機上不同 seed 的 screen rotation plan 差異是否足夠明顯
- [ ] 真實手機上整體轉向後昆蟲不會被 Save / Back 遮擋
- [ ] 真實手機上背景運動與昆蟲方向不會產生不自然的貼圖感
- [ ] 後續若加入 body / wing posePlan，需維持 screen rotation 與內部姿態分層清楚

### 備註 / 風險
本輪只確認單一整體旋轉與同步性，沒有改 body 編排、wing root、near / far wing scale 或翅膀變形。若要驗證所有 plan 的審美差異，後續需要加入可強制指定 screen rotation plan 的測試入口，或用多 seed 截圖比較。

---

### 日期
2026-05-12

### 任務 / 功能
修正 `createRoughScreenRotationPlan()` 的角度單位，讓 screen rotation plan 配合目前全域 `angleMode(DEGREES)`。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Camera fixture：`tests/fixtures/camera/greenPlants.jpg`
- Camera size：`720x1280`
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`

### 預期行為
因 `sketch.js` 在 setup 中呼叫 `angleMode(DEGREES)`，`createRoughScreenRotationPlan()` 應直接輸出 degree 角度給 `insectLayer.rotate()`。不同 plan 的 `baseAngle` 應產生可見的整體旋轉差異；本輪仍不改 body 編排、翅膀變形或內部 pose。

### 實際觀察
修正前，以弧度值傳入 degree 模式時，`diagonalRiseLeft` 約只會旋轉 `-0.559°`、`sideDriftLeft` 約只會旋轉 `-1.012°`，幾乎看不出 plan 差異。修正後的 Node 模擬確認不同 seed 可得到 `38.30°`、`-52.63°`、`56.73°`、`-8.22°`、`-31.31°` 等明顯角度。`rough-screen-rotation-degrees-2026-05-12` 截圖中，compact viewport 明顯呈現側向飛行，portrait 與 landscape 也可見整體斜向；翅膀、身體與觸角仍同步旋轉。

### 截圖
- portrait：`docs/cdp-runs/rough-screen-rotation-degrees-2026-05-12/screenshots/rough-screen-rotation-degrees-2026-05-12-greenPlants-portrait-390x844-result.png`
- compact：`docs/cdp-runs/rough-screen-rotation-degrees-2026-05-12/screenshots/rough-screen-rotation-degrees-2026-05-12-greenPlants-compact-360x740-result.png`
- landscape：`docs/cdp-runs/rough-screen-rotation-degrees-2026-05-12/screenshots/rough-screen-rotation-degrees-2026-05-12-greenPlants-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`7.4/10`。優點是 plan 差異終於清楚進到畫面，compact 的側向姿態讓「不同方向」變得可判讀，而不是微小旋轉。弱點是目前只是整體貼圖式旋轉，側向時 body / wing 內部仍沒有真正的姿態投影；但這符合本階段只驗整體轉向的限制。

### 使用者審美回饋
使用者要求先只改 `createRoughScreenRotationPlan()`，用來修正角度模式問題，不擴大到 body 或 wing 內部 rotate。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 真實手機上 degree 角度是否過大或過小
- [ ] 側向 plan 是否容易被按鈕或畫面邊界遮擋
- [ ] 若日後改回 `angleMode(RADIANS)`，需同步調整 screen rotation plan 單位
- [ ] 後續仍需分開處理 screen rotation 與 body / wing pose

### 備註 / 風險
本輪只修正 `createRoughScreenRotationPlan()`；專案其他 `rotate()` 仍可能受到全域 `angleMode(DEGREES)` 影響，但依使用者要求，本輪沒有擴大修改。後續若檢查 body 或 wing 內部角度，應另開一輪避免混入本次地基修正。

---

### 日期
2026-05-13

### 任務 / 功能
讓 rough butterfly 翅膀花紋上的斑點分布位置左右對稱，並依翅膀本體亮度選擇暗底白斑或亮底黑斑。

### 測試環境
- Local / GitHub Pages：Local Python static server，由 `scripts/run-cdp-visual-test.ps1` 啟動
- 瀏覽器：Google Chrome headless，透過 Chrome DevTools Protocol 操作
- 裝置：桌機模擬手機視窗
- Viewport：`portrait-390x844`、`compact-360x740`、`landscape-844x390`
- Camera：Chrome fake camera 預設亮綠畫面
- Forced pitch：`-ForcedFinalPitch 0`
- Forced spawn：`-ForcedSpawnRatioX 0.34 -ForcedSpawnRatioY 0.36`

### 預期行為
同一對翅膀應共用一份 `spotPlan`，讓 rim spots、inner spots、eye spots 的分布位置經由既有左右鏡像 transform 呈現對稱。翅膀平均亮度偏暗時應產生白斑 / 淺斑，平均亮度偏亮時應產生黑斑 / 深斑。斑點位置應對稱，但筆刷粗糙邊緣仍可保留手繪感。

### 實際觀察
`sym-spots-20260513-v2` 中三個 viewport 都成功完成 Start → Scanning → Result；portrait 完成 Save / Back。compact viewport 中蝴蝶本體較清楚，可看到左右翅斑點與點列有成對呼應，不再像各側獨立亂數散布。因 fake camera 與翅膀顏色都偏亮綠，本輪實際呈現以暗斑為主；暗斑比第一輪加強後更可讀，但仍會與翅脈線競爭。

### 截圖
- portrait：`docs/cdp-runs/sym-spots-20260513-v2/screenshots/sym-spots-20260513-v2-default-portrait-390x844-result.png`
- compact：`docs/cdp-runs/sym-spots-20260513-v2/screenshots/sym-spots-20260513-v2-default-compact-360x740-result.png`
- landscape：`docs/cdp-runs/sym-spots-20260513-v2/screenshots/sym-spots-20260513-v2-default-landscape-844x390-result.png`

### 審美評分與評語
Codex 自評：`7.1/10`。優點是斑點開始有真蝴蝶常見的左右呼應感，並且明暗斑點規則已進入可擴充架構。弱點是目前 fake camera 的亮綠背景讓亮綠翅膀與暗斑都不夠漂亮，黑點容易和翅脈混成一團；視覺方向成立，但還需要用更接近真實相機的背景測白斑 / 黑斑的細節比例。

### 使用者審美回饋
使用者希望翅膀花紋上的斑點分布位置左右對稱，並補充：若翅膀本體顏色偏暗，可能應畫白斑；若本體偏亮，則畫黑斑；之後也可能擴充不同斑點分布模式。

### Console 錯誤
每個 viewport 仍有一筆已知 404 resource event，未阻止 Start、Scanning、Result、Save 或 Back；未觀察到新增 JavaScript exception。

### 手機檢查清單
- [ ] 真實手機相機背景下，暗底白斑與亮底黑斑是否都清楚
- [ ] 斑點對稱是否自然，不會像太機械的印章
- [ ] 小螢幕上斑點是否被翅脈、body 或 Save / Back 按鈕遮擋
- [ ] 後續新增分布模式時，確認每種模式都保留左右對稱位置

### 備註 / 風險
本輪主要驗證 fake camera 和三個 viewport。尚未用真實手機 AR / camera 驗證，也尚未針對暗色翅膀 seed 截圖確認白斑效果。若後續要精修，應加入可指定或固定深色 / 淺色 wing palette 的測試入口。
