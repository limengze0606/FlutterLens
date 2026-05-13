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
- Rough butterfly 已經歷多輪視覺迭代：翅膀圖案、雙翅、偽 3D pose / flap phase、body axis、p5.brush 具象頭胸腹、三輪廓 body 地基、screen rotation plan、離散 wing perspective preset。
- 最新狀態：`createRoughScreenRotationPlan()` 仍只控制整隻昆蟲的螢幕朝向，並使用 degree 數值。`createRoughWingPerspectivePlan()` 已重新啟用 rough butterfly 的內部翅膀姿態，先提供 `frontOpen`、`threeQuarterRise`、`sideFold` 三個 preset。最新修正把 body 三段改成共用 thorax / wing root 附近 anchor 做姿態轉位，前後翅也共用 side hinge，再只做小幅 local root offset，降低胸腹與翅根斷開感。body 仍是頭、胸、腹三個空心輪廓加觸角，尚未回到填色或分節。

## 目前使用者偏好

- 使用者重視「看起來真的有身體帶動姿態」的昆蟲，不接受像無身體模板的蛾形。
- 使用者目前希望透視不必幾何精確，但要用來強調方向與立體感。後續評估 rough butterfly pose 時，應看 preset 是否一眼可讀出飛行方向、近遠側與半收 / 展開，而不是只檢查矩陣或 rotate 是否正確。
- 使用者會給審美分數與具體批評，這些回饋必須記進 `docs/codex-worklog.md`，並同步整理到 `docs/visual-style-guide.md`。

## 本輪文件維護規則

- `docs/codex-worklog.md`：完整歷史與每次 meaningful task 的正式紀錄。
- `docs/agent-quickstart.md`：快速 onboarding，只放目前最重要的總覽。
- `docs/visual-style-guide.md`：審美標準、使用者回饋、視覺方向與失敗條件。
- `docs/testing-playbook.md`：可重跑測試方法、截圖流程與已知限制。
- `docs/current-risks-and-next-steps.md`：目前風險、未解問題與建議下一步。
