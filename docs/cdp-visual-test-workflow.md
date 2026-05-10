# CDP 視覺測試流程

本文件記錄可重跑的 Chrome DevTools Protocol 視覺測試流程與產物命名規則。

## 執行方式

在 PowerShell 中從專案根目錄執行：

```powershell
.\scripts\run-cdp-visual-test.ps1
```

腳本會啟動暫時的 Python static server、Chrome headless、fake camera stream，並透過 CDP 操作 Start、Scanning、Result、Save 與 Back 流程。

可指定 run id：

```powershell
.\scripts\run-cdp-visual-test.ps1 -RunId "manual-2026-05-10"
```

## 預設測試範圍

- `portrait-390x844`
- `compact-360x740`
- `landscape-844x390`

每個 viewport 會盡量執行 Start → Scanning → Result。`portrait-390x844` 會額外驗證 Save 與 Back。

## 產物命名規則

所有產物預設放在：

```text
docs/cdp-runs/<runId>/
```

截圖放在：

```text
docs/cdp-runs/<runId>/screenshots/<runId>-<viewportLabel>-<stage>.png
```

`stage` 固定使用：

- `start`
- `scanning`
- `result`
- `after-back`

下載檔放在：

```text
docs/cdp-runs/<runId>/downloads/<viewportLabel>/FlutterLens-result.png
```

測試摘要與 console event 放在：

```text
docs/cdp-runs/<runId>/<runId>-summary.json
docs/cdp-runs/<runId>/<runId>-console.json
```

## 判讀重點

- `initialState` 應為 `START`
- `scanState` 應為 `SCANNING`
- `resultState` 應為 `RESULT`
- `videoReady` 應為 `true`
- `hasResultPhoto` 應為 `true`
- Save 測試應在 downloads 中產生 `FlutterLens-result.png`
- Back 測試應讓 `backState` 回到 `SCANNING`，且 `backCleared` 為 `true`

## 已知限制

CDP + fake camera 可驗證本機 UI 流程，但不能取代真實手機的相機權限、DeviceOrientation 權限、後鏡頭畫面、觸控手感與效能測試。

目前穩定流程使用 Chrome `--window-size`。若未來要做更精準的 viewport 模擬，可再補強 `Emulation.setDeviceMetricsOverride`，但先前在 PowerShell WebSocket 流程中曾遇到 timeout，需獨立處理。
