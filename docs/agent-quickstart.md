# Agent 快速上手摘要

本檔是後續 agent 的第一層導覽。它只保留目前最重要的結論，完整歷史仍以 `docs/codex-worklog.md` 為準。

## 專案狀態

- 專案是手機優先的 p5.js / browser JavaScript AR 視覺實驗，最終部署到 GitHub Pages。
- 視覺結果很重要，不能只靠語法檢查宣稱完成。
- 非瑣碎功能需先讀相關檔案、摘要現況、提出方案，等使用者同意後才改程式。
- Agent 不得自行 commit、push、merge、rebase、刪 branch 或改 remote。
- 專案文件與協作紀錄一律使用繁體中文；技術識別字可保留英文。
- 每次新增功能或調整視覺後，總結時需告訴使用者可手動微調的參數：檔案、function、參數名稱，以及數值調大 / 調小的效果。

## 先讀哪些檔案

1. 一般接手：先讀本檔。
2. 視覺或昆蟲生成：讀 `docs/visual-style-guide.md`。
3. 截圖、CDP、fake camera、fixtures：讀 `docs/testing-playbook.md`。
4. 判斷下一步或風險：讀 `docs/current-risks-and-next-steps.md`。
5. 需要追溯原始決策或使用者回饋時，才讀完整 `docs/codex-worklog.md`。

## 目前功能重點

- 已建立可重跑的 CDP 視覺測試流程，可操作 Start -> Scanning -> Result。
- 測試腳本支援 fake camera、camera fixtures、forced pitch、forced spawn ratio、Save / Back 驗證與 console event 摘要。
- 目前已採 hybrid UI 架構：`index.html` 內有 DOM app shell，`Pages/DomUi.js` 負責 Start / Scanning / Result 的 DOM 按鈕、toast、頁面 active 狀態與事件接線；p5 canvas 仍負責相機畫面、色彩分析、結果作品圖、昆蟲與 p5.brush。Start page 文字、相機權限按鈕、陀螺儀權限按鈕、開始按鈕、Scanning shutter、Result 的 Save / Share / Back / toast 已移到 HTML / CSS；尚未加入頁面轉場動畫。
- Start page 的位置、尺寸與 responsive layout 已從 p5 計算移到 `style.css`。`Pages/StartPage/StartPage.js` 只同步 portrait / compact landscape 的文案與 hint，`Pages/DomUi.js` 不再替 Start page 寫入 `left/top/width/height/font-size` inline style，`sketch.js` 也不再用 `StartButton` 做 Start page hit-test；Start page 點擊由 DOM button 處理。
- Start -> Scanning 已有第一段 DOM 轉場：按下「開始探索」且權限齊全後，`sketch.js` 的 `requestStartPermissions()` 會先呼叫 `Pages/DomUi.js` 的 `beginStartPageFadeOut()`，替 Start page 加上 `.is-exiting`，讓 `style.css` 中 Start page 文字與按鈕以 `opacity 420ms ease` 淡出；淡出 timeout 完成後才切到 `PagesState.SCANNING`。目前只做 Start 內容 fadeout，尚未做 Scanning fadein 或相機畫面轉場。
- Start page 目前有一個極簡初始 loader：`index.html` 的 `#boot-loader` 與 `style.css` 的 `.boot-loader-spinner` 會在頁面 first paint 時遮住畫面；`Pages/DomUi.js` 的 `markBootLayoutReady()` 會在第一次 `syncStartPageDom()` 後替 `body` 加上 `app-ready`。`style.css` 已將 loader 分層：`#boot-loader` 只當容器，`#boot-loader::before` 是淺褐米色 `#e9deca` 背景層，`.boot-loader-spinner` 是深褐灰動畫層。`body.app-ready` 後 spinner 先用 `220ms var(--motion-soft-out)` 淡出，背景再用 `4000ms var(--motion-soft-out) 360ms` 慢慢淡出至紙質 Start page；`#boot-loader` 的 `visibility` 會在 4360ms 後隱藏。`sketch.js` 的 `setup()` 會在等待掃描圖示與 brush 資源前先呼叫一次 `drawStartPage()`，避免 DOM UI 未定位時短暫擠到左上角。
- Start page 已接上 `assets/background/old-paper-texture.jpg` 作為滿版淺色紙質背景，未加 CSS 亮度、暗角、漸層或混色；文字與按鈕色彩已從黑底版白字 / 亮綠調整為深墨褐文字、紙色權限按鈕與深綠主按鈕。若使用者改放 PNG，需同步更新 `style.css` 的 `.dom-page-start background-image` 路徑。此背景檔目前約 5.86 MB，GitHub Pages / 真機首屏速度仍需觀察。
- Start 權限流程已改為分離式：使用者需先分別點擊「相機權限」與「陀螺儀權限」，兩者都 granted 後「開始探索」才會啟用。相機按鈕用原生 `navigator.mediaDevices.getUserMedia()` 取得 stream，再接到 p5 `createVideo([])`；陀螺儀按鈕在 iOS 會呼叫 `DeviceOrientationEvent.requestPermission()`，在不需要該 API 的環境會視為已允許。
- Rough butterfly 已經歷多輪視覺迭代：翅膀圖案、雙翅、偽 3D pose / flap phase、body axis、p5.brush 具象頭胸腹。
- Rough butterfly body 目前以頭、胸、腹三個輪廓為地基，已加回兩條簡單觸角，並新增 p5.brush 身體填色與腹部環狀紋理。Body 色彩可從常見黑 / 褐色、翅膀主色、翅膀對比色中選擇；依使用者修正，使用翅膀主色或對比色時不一定要降彩度，可保留較高彩度作為設計感。rough insect 的整體畫布旋轉已改由 `createRoughScreenRotationPlan()` 選離散 degree plan，再只套用一次 `rotate()`。
- Rough butterfly 翅膀斑點目前有 plan-based 對稱分布；一般 rim / inner 斑點仍使用 `spotPalette` 的亮斑 / 暗斑規則，只有 EyeSpots 另外使用 `eyeSpotPalette`，依 `stronger.h` 取高彩度互補色。一般斑點模式曾被使用者私下修改過，日誌不一定完整記錄，因此後續改 `createRoughWingSpotPlan()` 前需以目前檔案內容為準，不要用舊日誌覆蓋。
- 翅膀 p5.brush 筆刷材質與粗細已集中到 `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`。依 `docs/llms.txt`，`brush.set(name, color, weight)` 與 `brush.strokeWeight(weight)` 都是 weight multiplier；為避免混淆，rough wing 目前不再暴露 `brushLoad`，`brush.set()` 第三參數固定為 `1`，可調粗細集中在 `strokeWeight`，頂點濃淡 / 收筆則用 `pressureBase`、`pressureTaper`、`vertexPressure`。2026-05-13 已進一步將斑點筆刷拆成 `rimChainSpot`、`innerScatterSpot` 與 `eyeSpot.ring / middle / core`，讓 rim-chain、inner-scatter、眼紋可分別調整筆刷。
- Result page 目前不是把作品全螢幕鋪底，而是在拍攝進入結果頁時先把相機截圖與昆蟲固定成 `resultArtworkImage`，再由 `getResultArtworkDisplayLayout()` 放進中上方展示區。使用者若直向拍攝後旋轉螢幕，作品圖本身不會重新裁切或重抽昆蟲，只會改變展示尺寸與位置。Save / Share 會直接使用這張固定作品圖，不含結果頁背景與按鈕。

## 目前使用者偏好

- 使用者重視「看起來真的有身體帶動姿態」的昆蟲，不接受像無身體模板的蛾形。
- 使用者目前希望先把 body 基礎結構打穩，再回頭處理姿態、翅膀角度或更豐富的手繪細節；後續仍需要更明顯的離散姿態 preset，例如側飛、俯仰、翻轉、半收翅。
- 使用者會給審美分數與具體批評，這些回饋必須記進 `docs/codex-worklog.md`，並同步整理到 `docs/visual-style-guide.md`。

## 本輪文件維護規則

- `docs/codex-worklog.md`：完整歷史與每次 meaningful task 的正式紀錄。
- `docs/agent-quickstart.md`：快速 onboarding，只放目前最重要的總覽。
- `docs/visual-style-guide.md`：審美標準、使用者回饋、視覺方向與失敗條件。
- `docs/testing-playbook.md`：可重跑測試方法、截圖流程與已知限制。
- `docs/current-risks-and-next-steps.md`：目前風險、未解問題與建議下一步。
