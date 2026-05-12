# 測試與截圖 Playbook

本檔整理目前可用的本機視覺驗證流程。完整測試紀錄仍以 `docs/visual-test-log.md` 與 `docs/codex-worklog.md` 為準。

## 基本原則

- 本專案不能只靠語法檢查宣稱完成；視覺或互動修改後應做瀏覽器驗證。
- Windows PowerShell 讀寫中文文件前先設 UTF-8。
- Chrome / Edge headless 在目前環境通常需要使用者允許沙盒外執行。
- Browser Use / in-app browser 可能遇到 Windows `Access is denied`，目前較可靠的是 Chrome headless + CDP。

## 已知可行流程

目前已驗證的主要路線是：

1. 用 Python static server 啟動本機網站。
2. 用 Chrome headless 搭配 `--remote-debugging-port`。
3. 加上 fake camera 參數：
   - `--use-fake-device-for-media-stream`
   - `--use-fake-ui-for-media-stream`
4. 透過 Chrome DevTools Protocol 讀 runtime 狀態與按鈕座標。
5. 用 CDP 點擊 Start button 進入 `SCANNING`。
6. 點擊 shutter 進入 `RESULT`。
7. 用 `Page.captureScreenshot` 截圖。
8. 收集 console / log event，檢查是否有 fatal JS exception。

不要只檢查 screenshot 檔案是否存在。過去曾出現 Chrome `--screenshot` 產生白圖，但流程其實沒有視覺成功。

## 可重跑腳本

優先使用：

```powershell
.\scripts\run-cdp-visual-test.ps1
```

已知支援或曾使用的重要參數：

- `-RunId`：指定輸出資料夾名稱。
- `-CameraFixture greenPlants`：使用 `tests/fixtures/camera/greenPlants.jpg` 等 fixtures 作為假相機背景。
- `-ForcedFinalPitch 0`：固定最終生成類型 / pitch 相關測試條件。
- `-ForcedSpawnRatioX 0.34`
- `-ForcedSpawnRatioY 0.36`

Forced spawn 用於避免 Result page 的 Save / Back 按鈕遮擋昆蟲，特別適合評估 rough butterfly body。

## 常用 viewport

- `portrait-390x844`
- `compact-360x740`
- `landscape-844x390`

過去 runtime 約為：

- portrait：`478x694`
- compact：`478x590`
- landscape：`822x240`

實際值可能受 Chrome headless 與 device metrics 影響，測試紀錄需寫下當次觀察值。

## 目前常見輸出

CDP run 通常輸出到：

```text
docs/cdp-runs/<runId>/
```

常見內容：

- `screenshots/`
- `downloads/`
- summary JSON
- console JSON

截圖命名通常包含 run id、viewport label 與 stage，例如 start、scanning、result、after-back。

## 已知 console 狀態

- 多次測試都捕捉到 1 筆 `404 File not found` resource event。
- 目前判斷這筆 404 未阻止 p5.js 初始化、fake camera、Result render、Save 或 Back。
- 若出現新的 JavaScript exception、p5 / brush undefined、camera promise error，必須另外追查。

## 視覺驗證應記錄

- 測試環境與瀏覽器。
- viewport 與方向。
- 是否使用 fake camera 或 fixture。
- screenshot 路徑。
- 預期畫面與實際畫面。
- console 錯誤。
- 審美分數與簡短批評。
- 有無自我調整；若沒有，原因是什麼。
- 真機 mobile / AR 尚未確認的項目。

## 真機限制

CDP + fake camera 可以驗證 UI、頁面狀態、截圖流程、Save / Back 與基礎構圖，但不能取代：

- 真實手機相機權限。
- 後鏡頭選擇。
- GitHub Pages HTTPS 權限流程。
- DeviceOrientation 權限。
- 真實背景下的 AR 疊合。
- 手機 GPU 效能與觸控手感。

