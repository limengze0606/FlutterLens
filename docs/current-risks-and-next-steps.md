# 目前風險與建議下一步

本檔集中整理目前未解問題與最合理的下一步。完整背景仍以 `docs/codex-worklog.md` 為準。

## 高優先風險

- CDP + fake camera 不能取代真實手機 AR / camera 測試。
- 真實手機上的相機權限、後鏡頭、HTTPS、DeviceOrientation、觸控手感與效能仍需人工確認。
- Rough butterfly body 目前退回三個空心輪廓地基，並加回兩條簡單觸角；`brushWeight` helper option 已從 body 檔清掉，輪廓粗細統一由 `strokeWeight` 控制。加粗線條、拉長腹部與加入觸角後結構更可讀，但仍需使用者確認比例是否符合後續發展方向。
- rough insect 的整體畫布方向已改成離散 `screen rotation plan`，並移除雙重 random rotate；此層只控制整隻昆蟲的畫面朝向。因 `sketch.js` 設定 `angleMode(DEGREES)`，`createRoughScreenRotationPlan()` 需直接使用 degree 數值。
- rough butterfly 已新增 `createRoughWingPerspectivePlan()`，提供 `frontOpen`、`threeQuarterRise`、`sideFold`、`sideProfileFold` 離散 wing perspective preset。這是用誇張近遠側比例與畫布 transform 建立方向感，不是精準 3D 投影。最新 `sideProfileFold` 會在 `sideDriftLeft/Right` screen plan 中自然出現，將 fore / hind 兩片主翅集中在身體同一側；v2 比 v1 乾淨，但下方小翅仍偏弱。
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
- 若使用者認為共同軸心修正後的 wing perspective 方向可行：下一步可依截圖評分調整 `frontOpen`、`threeQuarterRise`、`sideFold` 的近遠側比例、root skew 與 depth tilt，或新增俯視 / 仰角 preset。
- 若使用者認可 `sideProfileFold` 方向：下一步優先調整 hind wing 的 scale / lift / overlap，讓兩片翅膀都飽滿可讀並更像側面參考圖。
- 若仍覺得 body 不像一體：下一步應加極簡胸腹連接線或 body axis，而不是回到各橢圓獨立旋轉。
- 若要先確認整體轉向：調整 `Pages/ResultPage/InsectGenerator/InsectManager.js` 的 `createRoughScreenRotationPlan()`，觀察 `baseAngle`、`jitter`、`weight` 是否讓不同 plan 的方向差異足夠明顯。

目前已有 / 建議的 pose preset：

- `frontOpen`：正面展翅，近遠側差異小。
- `threeQuarterRise`：三分之二側飛，近側較大、遠側壓縮。
- `sideFold`：側身半收翅，立體感最明顯。
- `sideProfileFold`：側面疊翅，搭配接近水平的 `sideDriftLeft/Right` screen plan；目前 v2 是兩片主翅，但 hind wing 偏弱。
- 尚未做：俯視下拍。
- 尚未做：仰角半收。

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
