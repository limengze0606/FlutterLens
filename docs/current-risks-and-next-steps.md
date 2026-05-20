# 目前風險與建議下一步

本檔集中整理目前未解問題與最合理的下一步。完整背景仍以 `docs/codex-worklog.md` 為準。

## 高優先風險

- CDP + fake camera 不能取代真實手機 AR / camera 測試。
- Start page 的 DOM layout ownership 已交給 `style.css`，p5 不再計算 Start 文字與按鈕座標，也不再使用 `StartButton` 做開始按鈕 hit-test。後續若調整 Start page 位置、間距、尺寸或橫向版面，應優先改 CSS 的 `.dom-page-start`、`#start-intro`、`.permission-actions`、`.permission-button`、`#start-action` 與對應 media query；不要重新把座標計算加回 p5。
- Start 權限流程已改為分離式：使用者需分別點擊「相機權限」與「陀螺儀權限」，兩者同意後才可按「開始探索」。CDP fake camera 已確認此流程可進入 Scanning / Result，但真實手機上的相機權限、後鏡頭、HTTPS、DeviceOrientation、觸控手感與效能仍需人工確認。
- Rough butterfly body 已從三個空心輪廓推進到 p5.brush 填色版本，包含頭胸腹填色與腹部環狀紋理。Body 色彩可取自然黑 / 褐、翅膀主色或翅膀對比色；依使用者修正，主色或對比色不必一律降彩度。仍需使用者確認高彩度 body 是否太搶，以及深綠黑 body 在葉片背景上是否足夠可讀。
- rough insect 的整體畫布方向已改成離散 `screen rotation plan`，並移除雙重 random rotate；目前只控制整隻昆蟲的畫面朝向，不改 body 編排或翅膀變形。因 `sketch.js` 設定 `angleMode(DEGREES)`，`createRoughScreenRotationPlan()` 需直接使用 degree 數值。
- rough butterfly 翅膀斑點已改為共用 `spotPlan`，讓左右翅膀的斑點分布位置對稱。一般 rim / inner 斑點仍依翅膀平均亮度切換亮斑 / 暗斑；只有 EyeSpots 改用獨立 `eyeSpotPalette`，依 `stronger.h` 取高彩度互補色。仍需用多 seed 或強制模式確認互補色眼紋在不同底色下是否過飽和、過重或被翅脈吃掉。
- rough insect 已解除 rough mode 中硬鎖 `insectType = 0` 的限制，並新增第一版 rough dragonfly / rough moth。蜻蜓目前以長細腹、寬頭、短胸與兩對狹長翅辨識；蛾依使用者要求只畫一對大翅，並強制多排眼斑。兩者已通過 CDP 預設 fake camera portrait / compact / landscape 基本流程，但尚未用真實手機或 fixtures 做完整審美壓力測試。
- 使用者在本輪前私下修改過翅膀斑點模式，日誌沒有完整記錄。後續若改斑點分布，必須先讀目前 `RoughInsectWings.js`，以現行程式為準，不可依舊 worklog 還原或覆蓋。
- rough butterfly 翅膀筆刷設定已抽到 `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`，包含外輪廓、Voronoi 翅脈、底色粒子、斑點、rim band、radial band、accent、specular、wash、loose patch 等參數。依 `docs/llms.txt`，目前已移除容易混淆的 `brushLoad`，`brush.set()` 第三參數固定為 `1`，後續調粗細優先改 `strokeWeight`，調頂點濃淡 / 收筆優先改 pressure 相關參數。斑點筆刷目前已拆成 `rimChainSpot`、`innerScatterSpot` 與 `eyeSpot.ring / middle / core`，但仍需用多 seed 或強制模式確認三種模式的視覺差異是否足夠明顯。
- 姿態暫時固定 / 停用 posePlan，尚未完成使用者期待的 body / wing 離散 pose preset。
- Result page 已重構為「固定作品圖 + 結果展示頁」：拍攝進入結果頁時會把相機截圖與昆蟲先渲染並擷取成 `resultArtworkImage`，之後畫面旋轉只會透過 `getResultArtworkDisplayLayout()` 重算展示位置，不再重新裁切相機照、重抽昆蟲或改變昆蟲尺寸。底部 actions 仍為左下 `儲存` / `分享`、右下 `返回`，並透過 `getResultActionLayout()` 依 viewport 重算。CDP 已確認 portrait / compact / landscape 的作品區與按鈕可見，但仍需真機確認「直向拍攝後旋轉到橫向」的體感與安全區。
- Web Share API 已接入 Result page，可嘗試分享不含 UI 的 PNG；但 Chrome headless 只能驗證 `sharing` / fallback 狀態，不能取代 iOS / Android 真機系統分享面板與社群 app 接收測試。
- Landscape 構圖與 forced spawn 位置仍需再評估。
- 2026-05-14 rough moth landscape 截圖仍被 Save / Back 按鈕遮住，不可視為蛾構圖已通過；portrait 截圖較能判讀單翅對與多眼斑。

## 已知測試風險

- 單純 Chrome `--screenshot` 曾產生白圖，不能作為唯一驗證。
- 應優先使用 CDP 讀取 runtime 狀態並截圖。
- 測試 rough butterfly body 時應使用 camera fixtures，至少包含 `greenPlants.jpg`。
- 若測試截圖沒有清楚拍到昆蟲本體或 body，該次視覺判讀不可視為通過。

## Rough Butterfly 下一步

目前最合理的下一輪方向取決於使用者對三輪廓 body 地基的評分：

- 若頭、胸、腹填色與環紋比例可接受：下一步可逐層加回姿態投影、腿部暗示或更細的觸角 / 頭部細節。
- 若 body 色彩太搶或與翅膀內線競爭：先調 `createRoughBodyColorPlan()` 的亮度 / 彩度區間、`drawRoughFilledBodyOval()` 的 alpha / passes，或降低 body 輪廓與環紋重量，不急著加姿態。
- 若使用者認為地基已穩：再開始設計離散 pose preset，並讓三輪廓 body 與 wing root 一起投影。
- 若要先確認整體轉向：調整 `Pages/ResultPage/InsectGenerator/InsectManager.js` 的 `createRoughScreenRotationPlan()`，觀察 `baseAngle`、`jitter`、`weight` 是否讓不同 plan 的方向差異足夠明顯。
- 若要繼續翅膀花紋：可在 `Pages/ResultPage/InsectGenerator/RoughInsectWings.js` 擴充 `createRoughWingSpotPlan()` 的 mode，例如外緣珠串、翅中黑點群、眼斑列、翅脈旁點列；調整前應先決定每種模式對應的真蝴蝶參考語法。若要專門精修眼紋，建議先增加 forced eye-spot 測試入口，避免每輪都賭隨機 seed。

建議的 pose preset：

- 正面展翅。
- 三分之二側飛。
- 側身上拍。
- 俯視下拍。
- 仰角半收。

每個 preset 應明確指定：

- body lean / yaw / pitch / roll。
- head、thorax、abdomen 的軸線偏移。
- wing root 位置。
- near / far wing scale。
- fore / hind wing 的遮擋順序。
- flap phase 與 silhouette。

## 文件維護下一步

- 每次 meaningful task 仍需 append `docs/codex-worklog.md`。
- 若任務改變目前結論，需同步更新本檔或其他摘要檔。
- 視覺規則或使用者分數改變時，更新 `docs/visual-style-guide.md`。
- 測試流程或腳本參數改變時，更新 `docs/testing-playbook.md`。
- 新 agent onboarding 方式改變時，更新 `docs/agent-quickstart.md` 與 `AGENTS.md`。
