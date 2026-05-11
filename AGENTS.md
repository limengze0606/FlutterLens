# AGENTS.md

## Project overview

This is a mobile-first AR project built mainly with p5.js and browser-based JavaScript.
The final output is hosted on GitHub Pages.

The project is developed in Visual Studio Code and tested locally through Live Server or a local static server.
Version control is handled with Git and GitHub. Feature work is usually done on branches.

The visual result is critical. Correct syntax is not enough: changes must be checked in a running browser, preferably with screenshots or visual notes.

## 終端機編碼注意事項

本專案的繁體中文文件與註解使用 UTF-8。

在 Windows PowerShell 讀寫中文專案檔案前，Codex 應先確認輸入與輸出採用 UTF-8：

```powershell
chcp 65001
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
```

使用 PowerShell 讀取繁體中文文件時，優先明確指定 UTF-8：

```powershell
Get-Content -Encoding UTF8 docs\codex-worklog.md
```

## 本機預覽與截圖流程

Codex 可以用本機靜態伺服器預覽專案，並透過 Chrome 或 Edge headless 截圖；但在目前 Windows 環境中，執行瀏覽器通常需要使用者允許沙盒外執行。

建議驗證流程：

1. 在同一個 PowerShell 命令中用 `Start-Job` 啟動臨時本機伺服器。
2. 用 Chrome 或 Edge headless 開啟 `http://127.0.0.1:<port>/`。
3. 使用手機尺寸 viewport，例如 `--window-size=390,844`。
4. 加上 `--virtual-time-budget=10000`；若沒有等待渲染，可能會在 p5.js 完成繪製前截到空白白畫面。
5. 截圖完成後停止並移除 server job。

範例：

```powershell
$shot = "docs\chrome-headless-wait-test.png"
$job = Start-Job -ScriptBlock {
  Set-Location "C:\Users\ja120\OneDrive\Desktop\FlutterLens"
  & "C:\Program Files\Python311\python.exe" -m http.server 8765 --bind 127.0.0.1
}
Start-Sleep -Seconds 2
try {
  & "C:\Program Files\Google\Chrome\Application\chrome.exe" `
    --headless=new `
    --disable-gpu `
    --no-sandbox `
    --disable-crash-reporter `
    --disable-breakpad `
    --user-data-dir="docs\chrome-profile-test" `
    --virtual-time-budget=10000 `
    --screenshot=$shot `
    --window-size=390,844 `
    "http://127.0.0.1:8765/"
} finally {
  Stop-Job -Job $job -ErrorAction SilentlyContinue
  Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
}
```

目前限制：

- Browser Use / in-app browser 目前可能在 Node REPL 啟動時遇到 Windows `Access is denied`。
- Chrome 或 Edge headless 截圖已確認可行，但需要使用者允許瀏覽器在沙盒外執行。
- 若要做互動測試，可用 Chrome DevTools Protocol 搭配 `--remote-debugging-port=<port>`，再透過 CDP 送出 mouse / touch events。此方式已驗證可點擊 Start button 進入 `PagesState.SCANNING`，再點擊 shutter 進入 `PagesState.RESULT` 並截圖。
- 若要自動化相機流程截圖，需加上 `--use-fake-device-for-media-stream` 與 `--use-fake-ui-for-media-stream`。這可以用 fake camera stream 驗證 Scanning page 與 Result page 的 UI，但最終 AR / camera 行為仍需要真實手機測試。

## Primary goals for Codex

Codex should help with:

- understanding the current architecture
- proposing implementation plans before coding
- implementing p5.js / AR features after the user approves the plan
- checking visual behavior in a browser
- documenting decisions, issues, and collaboration history
- helping future agents onboard quickly

## Required collaboration workflow

For any non-trivial feature, Codex must follow this workflow:

1. Read relevant files first.
2. Summarize the current structure and constraints.
3. Propose an implementation plan.
4. Wait for the user to review or adjust the plan.
5. Only after approval, edit code.
6. Run syntax/runtime checks where possible.
7. Run the project in a browser or local preview.
8. Capture screenshots or provide visual verification notes.
9. Update the worklog.
10. Summarize changed files, checks performed, visual observations, and unresolved risks.

Codex must not skip the planning step unless the user explicitly asks for a quick direct edit.

## Git restrictions

Codex must not:

- create commits
- push branches
- merge branches
- rebase branches
- delete branches
- force-push
- change remote repository settings

Codex may:

- inspect `git status`
- inspect `git diff`
- suggest commit messages
- help draft pull request descriptions

Final Git actions must be performed by the user.

## Visual verification requirements

Because this is a visual AR project, Codex must not claim a task is complete based only on syntax checks.

After code changes, Codex should verify by one or more of the following:

- run the project with Live Server or a local static server
- open the page in a browser
- check the browser console for errors
- capture screenshots
- compare expected vs actual visual behavior
- note mobile-specific concerns such as viewport, orientation, touch input, camera permission, and performance

If actual AR camera testing is not possible in the current environment, Codex must clearly state that limitation and provide a manual mobile test checklist.

## Aesthetic review requirements

Visual verification must include both functional correctness and aesthetic judgment.

After taking screenshots or otherwise visually inspecting a change, Codex must not stop at confirming that elements appeared on screen. Codex should also perform an explicit aesthetic review, especially for generated insects, hand-drawn graphics, AR overlays, layout, color, motion, and composition.

The aesthetic review should include:

- a short aesthetic score, recommended scale `1–10`
- a concise critique of what works visually
- a concise critique of what feels weak, awkward, generic, noisy, heavy, unbalanced, or inconsistent with the intended style
- whether Codex made any visual adjustment after seeing the screenshot
- if no adjustment was made, why Codex chose to stop
- what kind of user feedback would be most useful next

If Codex judges the result as functionally correct but visually weak, Codex should say so clearly and either make a small focused visual adjustment or record why further adjustment should wait for user direction.

User aesthetic feedback is part of the project knowledge. When the user gives a score, critique, preference, or visual reaction, Codex must record it in `docs/codex-worklog.md` in Traditional Chinese, preserving the meaning of the user's wording. Over time, this should help future agents build a shared aesthetic standard with the user.

## Mobile-first constraints

Assume the target device is a smartphone.

Codex should consider:

- portrait and landscape behavior
- device pixel ratio
- viewport size
- touch input
- camera permission flow
- HTTPS requirement for camera access on deployed GitHub Pages
- performance on mobile GPUs
- loading time and asset size
- fallback behavior if AR or camera access fails

## Code style

Prefer:

- small, focused changes
- clear function boundaries
- readable p5.js structure
- comments for non-obvious visual or AR math
- avoiding unnecessary frameworks or build tools unless requested

Avoid:

- large rewrites without approval
- unrelated formatting changes
- changing public file paths used by GitHub Pages unless necessary
- adding dependencies without explaining why

## Worklog requirements

## Worklog requirements

Codex must maintain `docs/codex-worklog.md`.

All worklog entries must be written in Traditional Chinese.

After each meaningful task, append an entry containing:

- 日期
- 任務摘要
- 使用者需求
- 實作前理解
- 實作方案
- 檢視過的檔案
- 修改過的檔案
- 決策紀錄
- 遇到的問題
- 嘗試過的解法
- 最終解法
- 視覺驗證紀錄
- Codex 審美自評
- 使用者審美回饋
- 尚未解決的風險
- 使用者回饋或修正
- 建議的下一步

The worklog should be specific enough that a future agent with no prior context can continue the project.
Even though the technical terms may remain in English when appropriate, the explanation, reasoning, collaboration notes, and summaries must be written in Traditional Chinese.

## Visual test log

When visual behavior changes, Codex must update `docs/visual-test-log.md`.

Include:

- date
- feature or scene tested
- browser/device/environment
- viewport size if known
- screenshots taken, if any
- expected behavior
- observed behavior
- aesthetic score and critique
- user aesthetic feedback, if available
- console errors
- mobile follow-up checklist

## Completion criteria

A task is complete only when Codex has provided:

- summary of changes
- list of files changed
- checks run
- browser or visual verification result
- known limitations
- worklog update
- next recommended action for the user

Codex must clearly say if any verification step could not be performed.

## Language requirements

All project-facing documentation written or updated by Codex must use Traditional Chinese.

This includes:

- `docs/codex-worklog.md`
- `docs/visual-test-log.md`
- architecture notes
- implementation notes
- collaboration records
- user feedback summaries

Technical identifiers, code comments, file names, library names, API names, and command names may remain in English when appropriate.

When summarizing user feedback, preserve the meaning of the user's original wording and write the summary in Traditional Chinese.
