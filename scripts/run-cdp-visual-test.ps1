param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [string]$OutputDir = "",
  [string]$RunId = (Get-Date -Format "yyyyMMdd-HHmmss"),
  [int]$ServerPort = 8780,
  [int]$DebugPortBase = 9330,
  [string]$ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe",
  [string]$PythonPath = "C:\Program Files\Python311\python.exe",
  [string]$CameraFixture = "default",
  [string]$CameraFixtureDir = "tests\fixtures\camera",
  [int]$CameraWidth = 720,
  [int]$CameraHeight = 1280,
  [double]$ForcedFinalPitch = [double]::NaN,
  [double]$ForcedSpawnRatioX = [double]::NaN,
  [double]$ForcedSpawnRatioY = [double]::NaN,
  [switch]$KeepProfiles
)

$ErrorActionPreference = "Stop"
chcp 65001 | Out-Null
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  $OutputDir = Join-Path $Root "docs\cdp-runs"
}

$RunDir = Join-Path $OutputDir $RunId
$ScreenshotDir = Join-Path $RunDir "screenshots"
$DownloadRoot = Join-Path $RunDir "downloads"
$ProfileRoot = Join-Path $RunDir "profiles"
New-Item -ItemType Directory -Force -Path $ScreenshotDir, $DownloadRoot, $ProfileRoot | Out-Null

# 產物命名規則：
# - 截圖：<runId>-<cameraLabel>-<viewportLabel>-<stage>.png
# - stage 固定使用 start / scanning / result / after-share / after-back
# - 下載：downloads/<cameraLabel>/<viewportLabel>/FlutterLens-result.png
# - 摘要：<runId>-summary.json
# - Console：<runId>-console.json
$Viewports = @(
  @{ label = "portrait-390x844"; width = 390; height = 844; testButtons = $true },
  @{ label = "compact-360x740"; width = 360; height = 740; testButtons = $false },
  @{ label = "landscape-844x390"; width = 844; height = 390; testButtons = $false }
)

function Get-SafeLabel {
  param([string]$Value)

  $label = [IO.Path]::GetFileNameWithoutExtension($Value)
  $label = $label -replace "[^A-Za-z0-9_-]", "-"
  $label = $label.Trim("-")
  if ([string]::IsNullOrWhiteSpace($label)) {
    return "camera"
  }
  return $label
}

function ConvertTo-RelativeUrlPath {
  param([string]$FullPath)

  $rootFull = [IO.Path]::GetFullPath($Root).TrimEnd("\", "/")
  $fileFull = [IO.Path]::GetFullPath($FullPath)
  if (-not $fileFull.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Camera fixture must be inside project root: $FullPath"
  }

  $relative = $fileFull.Substring($rootFull.Length).TrimStart("\", "/")
  return ($relative -replace "\\", "/")
}

function Resolve-CameraFixtures {
  $fixtureRoot = if ([IO.Path]::IsPathRooted($CameraFixtureDir)) {
    $CameraFixtureDir
  } else {
    Join-Path $Root $CameraFixtureDir
  }

  if ($CameraFixture -in @("", "default", "chrome", "fake")) {
    return @([pscustomobject]@{
      label = "default"
      mode = "chrome-fake"
      path = $null
      url = $null
    })
  }

  if (-not (Test-Path $fixtureRoot)) {
    throw "Camera fixture directory not found: $fixtureRoot"
  }

  $files = @()
  if ($CameraFixture -eq "all") {
    $files = @(Get-ChildItem -Path $fixtureRoot -File |
      Where-Object { $_.Extension -match "^\.(jpg|jpeg|png|webp)$" } |
      Sort-Object Name)
  } else {
    $candidate = if ([IO.Path]::IsPathRooted($CameraFixture)) {
      $CameraFixture
    } else {
      Join-Path $fixtureRoot $CameraFixture
    }

    if (-not (Test-Path $candidate)) {
      $matches = @(Get-ChildItem -Path $fixtureRoot -File |
        Where-Object {
          $_.BaseName -eq $CameraFixture -or
          $_.Name -eq $CameraFixture -or
          $_.Name -eq "$CameraFixture.jpg" -or
          $_.Name -eq "$CameraFixture.jpeg" -or
          $_.Name -eq "$CameraFixture.png" -or
          $_.Name -eq "$CameraFixture.webp"
        })
      if ($matches.Count -eq 0) {
        throw "Camera fixture not found: $CameraFixture"
      }
      $candidate = $matches[0].FullName
    }

    $files = @(Get-Item -LiteralPath $candidate)
  }

  if ($files.Count -eq 0) {
    throw "No camera fixture images found in $fixtureRoot"
  }

  return @($files | ForEach-Object {
    [pscustomobject]@{
      label = Get-SafeLabel $_.Name
      mode = "canvas-fixture"
      path = $_.FullName
      url = ConvertTo-RelativeUrlPath $_.FullName
    }
  })
}

function New-MockCameraScript {
  param(
    [string]$ImageUrl,
    [string]$CameraLabel
  )

  $imageUrlJson = $ImageUrl | ConvertTo-Json -Compress
  $cameraLabelJson = $CameraLabel | ConvertTo-Json -Compress

  return @"
(() => {
  const fixtureUrl = $imageUrlJson;
  const cameraLabel = $cameraLabelJson;
  const cameraWidth = $CameraWidth;
  const cameraHeight = $CameraHeight;
  const frameRate = 30;
  const canvas = document.createElement("canvas");
  canvas.width = cameraWidth;
  canvas.height = cameraHeight;
  const context = canvas.getContext("2d", { alpha: false });
  let imagePromise = null;

  function drawCover(image) {
    const scale = Math.max(cameraWidth / image.naturalWidth, cameraHeight / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = (cameraWidth - drawWidth) / 2;
    const drawY = (cameraHeight - drawHeight) / 2;
    context.fillStyle = "#111";
    context.fillRect(0, 0, cameraWidth, cameraHeight);
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  function loadFixtureImage() {
    if (imagePromise) {
      return imagePromise;
    }
    imagePromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to load mock camera fixture: " + fixtureUrl));
      image.src = fixtureUrl;
    });
    return imagePromise;
  }

  if (!navigator.mediaDevices) {
    Object.defineProperty(navigator, "mediaDevices", {
      value: {},
      configurable: true
    });
  }

  navigator.mediaDevices.getUserMedia = async () => {
    const image = await loadFixtureImage();
    drawCover(image);
    const interval = window.setInterval(() => drawCover(image), Math.max(33, Math.round(1000 / frameRate)));
    const stream = canvas.captureStream(frameRate);
    for (const track of stream.getVideoTracks()) {
      const originalStop = track.stop.bind(track);
      track.stop = () => {
        window.clearInterval(interval);
        originalStop();
      };
    }
    window.__flutterLensMockCamera = {
      label: cameraLabel,
      fixtureUrl,
      width: cameraWidth,
      height: cameraHeight,
      mode: "canvas-fixture"
    };
    return stream;
  };
})();
"@
}

function New-ScreenshotPath {
  param([string]$CameraLabel, [string]$ViewportLabel, [string]$Stage)
  return (Join-Path $ScreenshotDir "$RunId-$CameraLabel-$ViewportLabel-$Stage.png")
}

function Receive-CdpMessage {
  param(
    [System.Net.WebSockets.ClientWebSocket]$Socket,
    [System.Collections.Generic.List[object]]$Events
  )

  $buffer = New-Object byte[] 2097152
  $segment = [ArraySegment[byte]]::new($buffer)
  $result = $Socket.ReceiveAsync($segment, [Threading.CancellationToken]::None).Result
  $text = [Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count)
  if ([string]::IsNullOrWhiteSpace($text)) {
    return $null
  }

  $message = $text | ConvertFrom-Json
  if ($message.method -eq "Runtime.consoleAPICalled") {
    $values = @()
    foreach ($arg in @($message.params.args)) {
      if ($null -ne $arg.value) {
        $values += [string]$arg.value
      } elseif ($arg.description) {
        $values += [string]$arg.description
      } elseif ($arg.type) {
        $values += "[$($arg.type)]"
      }
    }
    $Events.Add([pscustomobject]@{
      source = "console"
      type = $message.params.type
      text = ($values -join " ")
    }) | Out-Null
  } elseif ($message.method -eq "Log.entryAdded") {
    $Events.Add([pscustomobject]@{
      source = "log"
      type = $message.params.entry.level
      text = $message.params.entry.text
    }) | Out-Null
  } elseif ($message.method -eq "Page.javascriptDialogOpening") {
    $Events.Add([pscustomobject]@{
      source = "dialog"
      type = $message.params.type
      text = $message.params.message
    }) | Out-Null
  }

  return $message
}

function Send-Cdp {
  param(
    [System.Net.WebSockets.ClientWebSocket]$Socket,
    [System.Collections.Generic.List[object]]$Events,
    [string]$Method,
    [hashtable]$Params = @{}
  )

  $script:CdpId += 1
  $payload = @{ id = $script:CdpId; method = $Method }
  if ($null -ne $Params) {
    $payload.params = $Params
  }

  $json = $payload | ConvertTo-Json -Depth 30 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $segment = [ArraySegment[byte]]::new($bytes)
  $Socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).Wait()

  while ($true) {
    $message = Receive-CdpMessage -Socket $Socket -Events $Events
    if ($null -eq $message) {
      continue
    }
    if ($message.id -eq $script:CdpId) {
      return $message
    }
  }
}

function Invoke-CdpEval {
  param(
    [System.Net.WebSockets.ClientWebSocket]$Socket,
    [System.Collections.Generic.List[object]]$Events,
    [string]$Expression
  )

  $response = Send-Cdp -Socket $Socket -Events $Events -Method "Runtime.evaluate" -Params @{
    expression = $Expression
    returnByValue = $true
    awaitPromise = $true
  }
  return $response.result.result.value
}

function Save-CdpScreenshot {
  param(
    [System.Net.WebSockets.ClientWebSocket]$Socket,
    [System.Collections.Generic.List[object]]$Events,
    [string]$Path
  )

  $response = Send-Cdp -Socket $Socket -Events $Events -Method "Page.captureScreenshot" -Params @{
    format = "png"
    captureBeyondViewport = $false
  }
  [IO.File]::WriteAllBytes($Path, [Convert]::FromBase64String($response.result.data))
}

function Invoke-CdpClick {
  param(
    [System.Net.WebSockets.ClientWebSocket]$Socket,
    [System.Collections.Generic.List[object]]$Events,
    [double]$X,
    [double]$Y
  )

  Send-Cdp -Socket $Socket -Events $Events -Method "Input.dispatchMouseEvent" -Params @{
    type = "mouseMoved"; x = $X; y = $Y; button = "none"
  } | Out-Null
  Send-Cdp -Socket $Socket -Events $Events -Method "Input.dispatchMouseEvent" -Params @{
    type = "mousePressed"; x = $X; y = $Y; button = "left"; clickCount = 1
  } | Out-Null
  Send-Cdp -Socket $Socket -Events $Events -Method "Input.dispatchMouseEvent" -Params @{
    type = "mouseReleased"; x = $X; y = $Y; button = "left"; clickCount = 1
  } | Out-Null
}

function Remove-TestChromeProcesses {
  param([string]$ProfilePath)

  $escaped = $ProfilePath.Replace("\", "\\")
  $processes = Get-CimInstance Win32_Process -Filter "name = 'chrome.exe'" |
    Where-Object { $_.CommandLine -like "*$ProfilePath*" -or $_.CommandLine -like "*$escaped*" }
  foreach ($process in $processes) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

$summary = @()
$allEvents = @()
$serverJob = $null
$cameraConfigs = Resolve-CameraFixtures
$testCaseIndex = 0

try {
  $serverJob = Start-Job -ScriptBlock {
    param($Root, $ServerPort, $PythonPath)
    Set-Location $Root
    & $PythonPath -m http.server $ServerPort --bind 127.0.0.1
  } -ArgumentList $Root, $ServerPort, $PythonPath

  Start-Sleep -Seconds 2

  foreach ($camera in $cameraConfigs) {
  for ($index = 0; $index -lt $Viewports.Count; $index++) {
    $viewport = $Viewports[$index]
    $label = $viewport.label
    $cameraLabel = $camera.label
    $debugPort = $DebugPortBase + $testCaseIndex
    $testCaseIndex += 1
    $profile = Join-Path $ProfileRoot "$cameraLabel-$label"
    $downloadDir = Join-Path (Join-Path $DownloadRoot $cameraLabel) $label
    New-Item -ItemType Directory -Force -Path $profile, $downloadDir | Out-Null

    $chromeArgs = @(
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-crash-reporter",
      "--disable-breakpad",
      "--remote-debugging-port=$debugPort",
      "--user-data-dir=$profile",
      "--window-size=$($viewport.width),$($viewport.height)",
      "--use-fake-ui-for-media-stream",
      "about:blank"
    )
    if ($camera.mode -eq "chrome-fake") {
      $chromeArgs = @(
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-crash-reporter",
        "--disable-breakpad",
        "--remote-debugging-port=$debugPort",
        "--user-data-dir=$profile",
        "--window-size=$($viewport.width),$($viewport.height)",
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
        "about:blank"
      )
    }

    $chrome = $null
    $socket = $null
    $events = [System.Collections.Generic.List[object]]::new()

    try {
      $chrome = Start-Process -FilePath $ChromePath -ArgumentList $chromeArgs -PassThru -WindowStyle Hidden
      Start-Sleep -Seconds 8

      $tabs = Invoke-RestMethod "http://127.0.0.1:$debugPort/json"
      $tab = @($tabs | Where-Object { $_.type -eq "page" })[0]
      if (-not $tab) {
        throw "CDP tab not found for $cameraLabel / $label"
      }

      $socket = [System.Net.WebSockets.ClientWebSocket]::new()
      $socket.ConnectAsync([Uri]$tab.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait()
      $script:CdpId = 0

      Send-Cdp -Socket $socket -Events $events -Method "Runtime.enable" | Out-Null
      Send-Cdp -Socket $socket -Events $events -Method "Log.enable" | Out-Null
      Send-Cdp -Socket $socket -Events $events -Method "Page.enable" | Out-Null
      if ($camera.mode -eq "canvas-fixture") {
        $fixtureUrl = "http://127.0.0.1:$ServerPort/$($camera.url)"
        Send-Cdp -Socket $socket -Events $events -Method "Page.addScriptToEvaluateOnNewDocument" -Params @{
          source = New-MockCameraScript -ImageUrl $fixtureUrl -CameraLabel $cameraLabel
        } | Out-Null
      }
      Send-Cdp -Socket $socket -Events $events -Method "Page.navigate" -Params @{
        url = "http://127.0.0.1:$ServerPort/"
      } | Out-Null
      Start-Sleep -Seconds 8
      Send-Cdp -Socket $socket -Events $events -Method "Browser.setDownloadBehavior" -Params @{
        behavior = "allow"
        downloadPath = $downloadDir
      } | Out-Null

      $initial = Invoke-CdpEval -Socket $socket -Events $events -Expression @"
(() => ({
  state: typeof currentPagesState !== 'undefined' ? currentPagesState : 'NO_STATE',
  hasP5: typeof p5 !== 'undefined',
  runtimeWidth: typeof width !== 'undefined' ? width : null,
  runtimeHeight: typeof height !== 'undefined' ? height : null,
  mockCamera: typeof window.__flutterLensMockCamera !== 'undefined' ? window.__flutterLensMockCamera : null,
  start: typeof StartButton !== 'undefined' && StartButton
    ? {
        x: StartButton.ButtonX,
        y: StartButton.ButtonY,
        w: StartButton.ButtonWidth,
        h: StartButton.ButtonHeight,
        visible: StartButton.ButtonY + StartButton.ButtonHeight / 2 <= height
      }
    : null
}))()
"@
      Save-CdpScreenshot -Socket $socket -Events $events -Path (New-ScreenshotPath -CameraLabel $cameraLabel -ViewportLabel $label -Stage "start")

      $scan = $null
      $result = $null
      $saveResult = $null
      $shareResult = $null
      $backResult = $null
      $downloads = @()

      if ($initial.start -and $initial.start.visible) {
        Invoke-CdpClick -Socket $socket -Events $events -X $initial.start.x -Y $initial.start.y
        Start-Sleep -Seconds 4

        $scan = Invoke-CdpEval -Socket $socket -Events $events -Expression @"
(() => ({
  state: currentPagesState,
  videoReady: !!video,
  runtimeWidth: width,
  runtimeHeight: height,
  shutter: { x: shutterX, y: shutterY, r: shutterR },
  cam: camLayout,
  mockCamera: typeof window.__flutterLensMockCamera !== 'undefined' ? window.__flutterLensMockCamera : null
}))()
"@
        Save-CdpScreenshot -Socket $socket -Events $events -Path (New-ScreenshotPath -CameraLabel $cameraLabel -ViewportLabel $label -Stage "scanning")

        if ($scan.state -eq "SCANNING") {
          if (-not [double]::IsNaN($ForcedFinalPitch)) {
            $pitchLiteral = [Globalization.CultureInfo]::InvariantCulture.NumberFormat
            $pitchValue = $ForcedFinalPitch.ToString($pitchLiteral)
            Invoke-CdpEval -Socket $socket -Events $events -Expression "(() => { finalPitch = $pitchValue; return finalPitch; })()" | Out-Null
          }

          Invoke-CdpClick -Socket $socket -Events $events -X $scan.shutter.x -Y $scan.shutter.y
          Start-Sleep -Seconds 4

          if (-not [double]::IsNaN($ForcedFinalPitch)) {
            $pitchLiteral = [Globalization.CultureInfo]::InvariantCulture.NumberFormat
            $pitchValue = $ForcedFinalPitch.ToString($pitchLiteral)
            Invoke-CdpEval -Socket $socket -Events $events -Expression "(() => { finalPitch = $pitchValue; return finalPitch; })()" | Out-Null
            Start-Sleep -Milliseconds 250
          }

          if (-not [double]::IsNaN($ForcedSpawnRatioX) -and -not [double]::IsNaN($ForcedSpawnRatioY)) {
            $ratioFormat = [Globalization.CultureInfo]::InvariantCulture.NumberFormat
            $ratioX = $ForcedSpawnRatioX.ToString($ratioFormat)
            $ratioY = $ForcedSpawnRatioY.ToString($ratioFormat)
            Invoke-CdpEval -Socket $socket -Events $events -Expression @"
(() => {
  spawnPositionRatio = { x: $ratioX, y: $ratioY };
  updateSpawnPositionForViewport();
  resultSceneFinalized = false;
  if (typeof loop === 'function') loop();
  if (typeof redraw === 'function') redraw();
  return { spawnPosition, spawnPositionRatio };
})()
"@ | Out-Null
            Start-Sleep -Milliseconds 700
          }

          $result = Invoke-CdpEval -Socket $socket -Events $events -Expression @"
(() => ({
  state: currentPagesState,
  finalPitch: typeof finalPitch !== 'undefined' ? finalPitch : null,
  hasResultPhoto: !!resultPhoto,
  runtimeWidth: width,
  runtimeHeight: height,
  actions: typeof getResultActionLayout === 'function'
    ? (() => {
        const layout = getResultActionLayout();
        const visible = (button) =>
          button.x - layout.buttonW / 2 >= 0 &&
          button.x + layout.buttonW / 2 <= width &&
          button.y - layout.buttonH / 2 >= 0 &&
          button.y + layout.buttonH / 2 <= height;
        return {
          buttonW: layout.buttonW,
          buttonH: layout.buttonH,
          save: { x: layout.save.x, y: layout.save.y, visible: visible(layout.save) },
          share: { x: layout.share.x, y: layout.share.y, visible: visible(layout.share) },
          back: { x: layout.back.x, y: layout.back.y, visible: visible(layout.back) }
        };
      })()
    : null,
  mockCamera: typeof window.__flutterLensMockCamera !== 'undefined' ? window.__flutterLensMockCamera : null,
  spawnPosition,
  spawnPositionRatio
}))()
"@
          Save-CdpScreenshot -Socket $socket -Events $events -Path (New-ScreenshotPath -CameraLabel $cameraLabel -ViewportLabel $label -Stage "result")

          if ($viewport.testButtons -and $result.state -eq "RESULT" -and $result.actions) {
            Invoke-CdpClick -Socket $socket -Events $events -X $result.actions.share.x -Y $result.actions.share.y
            Start-Sleep -Seconds 2

            $shareResult = Invoke-CdpEval -Socket $socket -Events $events -Expression @"
(() => ({
  state: currentPagesState,
  hasNavigatorShare: !!navigator.share,
  hasNavigatorCanShare: !!navigator.canShare,
  shareStatus: typeof resultShareStatus !== 'undefined' ? resultShareStatus : null,
  hasResultPhoto: !!resultPhoto
}))()
"@
            Save-CdpScreenshot -Socket $socket -Events $events -Path (New-ScreenshotPath -CameraLabel $cameraLabel -ViewportLabel $label -Stage "after-share")

            Invoke-CdpClick -Socket $socket -Events $events -X $result.actions.save.x -Y $result.actions.save.y
            Start-Sleep -Seconds 5

            $saveResult = Invoke-CdpEval -Socket $socket -Events $events -Expression @"
(() => ({
  state: currentPagesState,
  pending: resultExportPending,
  ready: resultExportReady,
  finalized: resultSceneFinalized,
  hasResultPhoto: !!resultPhoto
}))()
"@
            $downloads = @(Get-ChildItem -Path $downloadDir -File -ErrorAction SilentlyContinue |
              Select-Object Name, Length, LastWriteTime)

            Invoke-CdpClick -Socket $socket -Events $events -X $result.actions.back.x -Y $result.actions.back.y
            Start-Sleep -Seconds 2

            $backResult = Invoke-CdpEval -Socket $socket -Events $events -Expression @"
(() => ({
  state: currentPagesState,
  hasResultPhoto: !!resultPhoto,
  spawnPosition: typeof spawnPosition !== 'undefined' ? spawnPosition : null,
  spawnPositionRatio: typeof spawnPositionRatio !== 'undefined' ? spawnPositionRatio : null
}))()
"@
            Save-CdpScreenshot -Socket $socket -Events $events -Path (New-ScreenshotPath -CameraLabel $cameraLabel -ViewportLabel $label -Stage "after-back")
          }
        }
      }

      foreach ($event in $events) {
        $allEvents += [pscustomobject]@{
          camera = $cameraLabel
          viewport = $label
          source = $event.source
          type = $event.type
          text = $event.text
        }
      }

      $summary += [pscustomobject]@{
        camera = $cameraLabel
        cameraMode = $camera.mode
        cameraFixture = $camera.path
        cameraSize = if ($camera.mode -eq "canvas-fixture") { "$($CameraWidth)x$($CameraHeight)" } else { $null }
        viewport = $label
        requested = "$($viewport.width)x$($viewport.height)"
        runtime = if ($initial.runtimeWidth) { "$($initial.runtimeWidth)x$($initial.runtimeHeight)" } else { $null }
        startVisible = if ($initial.start) { [bool]$initial.start.visible } else { $false }
        initialState = $initial.state
        scanState = if ($scan) { $scan.state } else { $null }
        resultState = if ($result) { $result.state } else { $null }
        forcedFinalPitch = if (-not [double]::IsNaN($ForcedFinalPitch)) { $ForcedFinalPitch } else { $null }
        resultFinalPitch = if ($result) { $result.finalPitch } else { $null }
        videoReady = if ($scan) { [bool]$scan.videoReady } else { $null }
        hasResultPhoto = if ($result) { [bool]$result.hasResultPhoto } else { $null }
        resultActions = if ($result) { $result.actions } else { $null }
        shareState = if ($shareResult -and $shareResult.shareStatus) { $shareResult.shareStatus.state } else { $null }
        shareMessage = if ($shareResult -and $shareResult.shareStatus) { $shareResult.shareStatus.message } else { $null }
        saveState = if ($saveResult) { $saveResult.state } else { $null }
        downloads = $downloads
        backState = if ($backResult) { $backResult.state } else { $null }
        backCleared = if ($backResult) { (-not $backResult.hasResultPhoto -and $null -eq $backResult.spawnPosition) } else { $null }
        consoleCount = $events.Count
      }
    } catch {
      $summary += [pscustomobject]@{
        camera = $cameraLabel
        cameraMode = $camera.mode
        cameraFixture = $camera.path
        viewport = $label
        requested = "$($viewport.width)x$($viewport.height)"
        error = $_.Exception.Message
      }
    } finally {
      if ($socket) {
        $socket.Dispose()
      }
      if ($chrome -and -not $chrome.HasExited) {
        Stop-Process -Id $chrome.Id -Force -ErrorAction SilentlyContinue
      }
      Remove-TestChromeProcesses -ProfilePath $profile
      if (-not $KeepProfiles -and (Test-Path $profile)) {
        Remove-Item -LiteralPath $profile -Recurse -Force -ErrorAction SilentlyContinue
      }
    }
  }
  }
} finally {
  if ($serverJob) {
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $serverJob -Force -ErrorAction SilentlyContinue
  }
}

if (-not $KeepProfiles -and (Test-Path $ProfileRoot)) {
  Remove-Item -LiteralPath $ProfileRoot -Recurse -Force -ErrorAction SilentlyContinue
}

$summaryPath = Join-Path $RunDir "$RunId-summary.json"
$consolePath = Join-Path $RunDir "$RunId-console.json"
$summary | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $summaryPath
$allEvents | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 $consolePath

[pscustomobject]@{
  runId = $RunId
  runDir = $RunDir
  summary = $summaryPath
  console = $consolePath
  results = $summary
} | ConvertTo-Json -Depth 20
