# Agent 快速上手摘要

本檔是後續 agent 的第一層導覽。它只保留目前最重要的結論，完整歷史仍以 `docs/codex-worklog.md` 為準。

## 專案狀態

- 專案是手機優先的 p5.js / browser JavaScript AR 視覺實驗，最終部署到 GitHub Pages。
- 視覺結果很重要，不能只靠語法檢查宣稱完成。
- 非瑣碎功能需先讀相關檔案、摘要現況、提出方案，等使用者同意後才改程式。
- Agent 不得自行 commit、push、merge、rebase、刪 branch 或改 remote。
- 專案文件與協作紀錄一律使用繁體中文；技術識別字可保留英文。

## 先讀哪些檔案

1. 一般接手：先讀本檔。
2. 視覺或昆蟲生成：讀 `docs/visual-style-guide.md`。
3. 截圖、CDP、fake camera、fixtures：讀 `docs/testing-playbook.md`。
4. 判斷下一步或風險：讀 `docs/current-risks-and-next-steps.md`。
5. 需要追溯原始決策或使用者回饋時，才讀完整 `docs/codex-worklog.md`。

## 目前功能重點

- 已建立可重跑的 CDP 視覺測試流程，可操作 Start -> Scanning -> Result。
- 測試腳本支援 fake camera、camera fixtures、forced pitch、forced spawn ratio、Save / Back 驗證與 console event 摘要。
- Rough butterfly 已經歷多輪視覺迭代：翅膀圖案、雙翅、偽 3D pose / flap phase、body axis、p5.brush 具象頭胸腹。
- 最近一次成果是把 rough butterfly body 從線稿骨架改成 p5.brush 畫出的頭、胸、腹與腹部分節，並用 `greenPlants.jpg` fixture 補測。

## 目前使用者偏好

- 使用者重視「看起來真的有身體帶動姿態」的昆蟲，不接受像無身體模板的蛾形。
- 使用者認同目前 body 已較清楚，但後續仍需要更明顯的離散姿態 preset，例如側飛、俯仰、翻轉、半收翅。
- 使用者會給審美分數與具體批評，這些回饋必須記進 `docs/codex-worklog.md`，並同步整理到 `docs/visual-style-guide.md`。

## 本輪文件維護規則

- `docs/codex-worklog.md`：完整歷史與每次 meaningful task 的正式紀錄。
- `docs/agent-quickstart.md`：快速 onboarding，只放目前最重要的總覽。
- `docs/visual-style-guide.md`：審美標準、使用者回饋、視覺方向與失敗條件。
- `docs/testing-playbook.md`：可重跑測試方法、截圖流程與已知限制。
- `docs/current-risks-and-next-steps.md`：目前風險、未解問題與建議下一步。

