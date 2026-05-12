# 目前風險與建議下一步

本檔集中整理目前未解問題與最合理的下一步。完整背景仍以 `docs/codex-worklog.md` 為準。

## 高優先風險

- CDP + fake camera 不能取代真實手機 AR / camera 測試。
- 真實手機上的相機權限、後鏡頭、HTTPS、DeviceOrientation、觸控手感與效能仍需人工確認。
- Rough butterfly body 在深色或複雜植物背景上可能仍不夠穩定可讀。
- 姿態仍不夠戲劇化，尚未完成使用者期待的離散 pose preset。
- Result page 的 Save / Back 按鈕可能遮擋昆蟲，測試時需使用 forced spawn 或調整生成位置。
- Landscape 構圖與 forced spawn 位置仍需再評估。

## 已知測試風險

- 單純 Chrome `--screenshot` 曾產生白圖，不能作為唯一驗證。
- 應優先使用 CDP 讀取 runtime 狀態並截圖。
- 測試 rough butterfly body 時應使用 camera fixtures，至少包含 `greenPlants.jpg`。
- 若測試截圖沒有清楚拍到昆蟲本體或 body，該次視覺判讀不可視為通過。

## Rough Butterfly 下一步

目前最合理的下一輪方向取決於使用者對最新具象 body 的評分：

- 若 body 具象程度可接受：優先做離散 pose preset。
- 若 body 仍太小或不夠像 `InsectBody.js`：先放大 body 10-20%、提高 highlight 對比、加強 abdomen 長度與分節。

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

