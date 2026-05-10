# AGENTS.md

## Project overview

This is a mobile-first AR project built mainly with p5.js and browser-based JavaScript.
The final output is hosted on GitHub Pages.

The project is developed in Visual Studio Code and tested locally through Live Server or a local static server.
Version control is handled with Git and GitHub. Feature work is usually done on branches.

The visual result is critical. Correct syntax is not enough: changes must be checked in a running browser, preferably with screenshots or visual notes.

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