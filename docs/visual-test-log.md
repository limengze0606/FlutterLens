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
