# 目前風險與建議下一步

本檔集中整理目前未解問題與最合理的下一步。完整背景仍以 `docs/codex-worklog.md` 為準。

## 高優先風險

- CDP + fake camera 不能取代真實手機 AR / camera 測試。
- 真實手機上的相機權限、後鏡頭、HTTPS、DeviceOrientation、觸控手感與效能仍需人工確認。
- Rough butterfly body 目前退回三個空心輪廓地基，並加回兩條簡單觸角；`brushWeight` helper option 已從 body 檔清掉，輪廓粗細統一由 `strokeWeight` 控制。加粗線條、拉長腹部與加入觸角後結構更可讀，但仍需使用者確認比例是否符合後續發展方向。
- rough insect 的整體畫布方向已改成離散 `screen rotation plan`，並移除雙重 random rotate；目前只控制整隻昆蟲的畫面朝向，不改 body 編排或翅膀變形。因 `sketch.js` 設定 `angleMode(DEGREES)`，`createRoughScreenRotationPlan()` 需直接使用 degree 數值。
- rough butterfly 翅膀斑點已改為共用 `spotPlan`，讓左右翅膀的斑點分布位置對稱，並依翅膀平均亮度切換亮斑 / 暗斑。已保留分布模式骨架，但目前只用 fake camera 驗證，仍需用真實背景或 fixtures 觀察斑點是否過淡、過密或被翅脈吃掉。
- 使用者在本輪前私下修改過翅膀斑點模式，日誌沒有完整記錄。後續若改斑點分布，必須先讀目前 `RoughInsectWings.js`，以現行程式為準，不可依舊 worklog 還原或覆蓋。
- rough butterfly 翅膀筆刷設定已抽到 `Pages/ResultPage/InsectGenerator/RoughWingBrushSettings.js`，包含外輪廓、Voronoi 翅脈、底色粒子、斑點、rim band、radial band、accent、specular、wash、loose patch 等 p5.brush 材質與粗細參數。後續調視覺強度優先改 settings 檔，除非要改斑點分布或筆觸路徑。
- 姿態暫時固定 / 停用 posePlan，尚未完成使用者期待的 body / wing 離散 pose preset。
- Result page 的 Save / Back 按鈕可能遮擋昆蟲，測試時需使用 forced spawn 或調整生成位置。
- Landscape 構圖與 forced spawn 位置仍需再評估。

## 已知測試風險

- 單純 Chrome `--screenshot` 曾產生白圖，不能作為唯一驗證。
- 應優先使用 CDP 讀取 runtime 狀態並截圖。
- 測試 rough butterfly body 時應使用 camera fixtures，至少包含 `greenPlants.jpg`。
- 若測試截圖沒有清楚拍到昆蟲本體或 body，該次視覺判讀不可視為通過。

## Rough Butterfly 下一步

目前最合理的下一輪方向取決於使用者對三輪廓 body 地基的評分：

- 若頭、胸、腹與觸角比例可接受：下一步可逐層加回腹部分節或少量筆觸質感。
- 若 body 線條太重或與翅膀內線搶視覺：先微調 `strokeWeight` 區間或降低翅膀內線干擾，不急著加姿態。
- 若使用者認為地基已穩：再開始設計離散 pose preset，並讓三輪廓 body 與 wing root 一起投影。
- 若要先確認整體轉向：調整 `Pages/ResultPage/InsectGenerator/InsectManager.js` 的 `createRoughScreenRotationPlan()`，觀察 `baseAngle`、`jitter`、`weight` 是否讓不同 plan 的方向差異足夠明顯。
- 若要繼續翅膀花紋：可在 `Pages/ResultPage/InsectGenerator/RoughInsectWings.js` 擴充 `createRoughWingSpotPlan()` 的 mode，例如外緣珠串、翅中黑點群、眼斑列、翅脈旁點列；調整前應先決定每種模式對應的真蝴蝶參考語法。

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
