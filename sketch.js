let currentPagesState = PagesState.START;
let startPermissionRequestInProgress = false;

async function setup() {
  // 將 canvas 存起來
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  if (typeof initDomUi === "function") {
    initDomUi();
  }
  await preloadScanningPage();
  
  if (typeof initStartButtonLayout === "function") {
    initStartButtonLayout();
  }
  angleMode(DEGREES);

  // 【核心修改】繞過 p5.js，直接在畫布上掛載原生點擊事件
  // 使用 touchend 和 click 確保在所有裝置上都能抓到最純粹的點擊
  canvas.elt.addEventListener('touchend', handleStartButtonNative, false);
  canvas.elt.addEventListener('click', handleStartButtonNative, false);

  syncBrushToCanvas();
  brush.add("default", {
    type:    "default",
    weight:  0.9,
    scatter: 1.8,
    sharpness: 0.3,
    grain:     0.9,
    opacity: 170,
    spacing: 0.3,
    noise:   0.5,
    pressure: [1.1, 0.9],
    rotate:  "natural",
  });

  brush.add("markerBrush", {
    type:    "marker",
    weight:  6,
    scatter: 0.35,
    opacity: 32,
    spacing: 0.09,
    noise:   1,
    pressure: [1.2, 0.86],
    rotate:  "none",
    markerTip: true,
  });

  await brush.add("pencil1", {
    type:    "image",
    weight:  2.5,
    scatter: 0.4,
    opacity: 150,
    spacing: 1.1,
    noise:   1,
    pressure: {
      mode: "gaussian",
      curve: [0, 0.09],
      min_max: [0.6, 1.14],
    },
    rotate:  "random",
    markerTip: true,
    image: {src: "assets/brushTips/pencil1.jpg"},
  });

  await brush.add("pencil2", {
    type:    "image",
    weight:  1.5,
    scatter: 0.2,
    opacity: 150,
    spacing: 0.6,
    noise:   1,
    pressure: {
      mode: "gaussian",
      curve: [0, 0.09],
      min_max: [0.6, 1.14],
    },
    rotate:  "random",
    markerTip: true,
    image: {src: "assets/brushTips/pencil1.jpg"},
  });

  await brush.add("marker1", {
    type:    "image",
    weight:  3,
    scatter: 1,
    opacity: 140,
    spacing: 0.8,
    noise:   1,
    pressure: [0.8, 1.2],
    rotate:  "random",
    markerTip: true,
    image: {src: "assets/brushTips/marker1.jpg"},
  });

  await brush.add("marker2", {
    type:    "image",
    weight:  12,
    scatter: 1,
    opacity: 200,
    spacing: 0.8,
    noise:   1,
    pressure: [0.8, 1.2],
    rotate:  "random",
    markerTip: true,
    image: {src: "assets/brushTips/marker1.jpg"},
  });
}

function draw() {
  background(0);
  clearScreenTextLayer();
  if (typeof syncDomUiState === "function") {
    syncDomUiState();
  }

  drawInScreenSpace(() => {
    switch (currentPagesState) {
      case PagesState.START:
        drawStartPage();
        break;
      case PagesState.SCANNING:
        drawScanningPage();
        break;
      case PagesState.RESULT:
        drawResultPage();
        break;
    }
  });

  if (!(currentPagesState === PagesState.RESULT && resultExportPending)) {
    drawScreenTextLayer();
  }

  if (currentPagesState === PagesState.RESULT && typeof completeResultExportIfReady === "function") {
    completeResultExportIfReady();
  }
}

// 建立一個共用的互動處理函數
function handleInteraction() {
  switch (currentPagesState) {
    case PagesState.START:
      if (dist(mouseX, mouseY, StartButton.ButtonX, StartButton.ButtonY) < StartButton.ButtonWidth / 2) {
        requestStartPermissions();
      }
      break;
      
    case PagesState.SCANNING:
      if (checkShutterClicked(mouseX, mouseY)) {
        triggerShutterCapture();
      }
      break;
      
    case PagesState.RESULT:
      if (checkSaveButtonClicked(mouseX, mouseY)) {
        exportResultImage();
      } else if (checkShareButtonClicked(mouseX, mouseY)) {
        shareResultImage();
      } else if (checkBackButtonClicked(mouseX, mouseY)) {
        resetResultData();
        currentPagesState = PagesState.SCANNING;
        loop();
      }
      break;
  }
}

// 電腦版滑鼠點擊
function mousePressed() {
  handleInteraction();
}

// 手機版/iPad 觸控點擊 (iOS 救星)
function touchStarted() {
  handleInteraction();
  return false; // ⚠️超級重要：這行會阻止 iOS 預設的滑動、縮放行為，讓權限請求能順利彈出！
}

// 同理，放開的動作也補上 touchEnded
function touchEnded() {
  if (currentPagesState === PagesState.SCANNING) {
    isShutterPressed = false;
    if (typeof syncShutterButtonDom === "function") {
      syncShutterButtonDom();
    }
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  syncBrushToCanvas();
  if (typeof syncDomUiState === "function") {
    syncDomUiState();
  }

  if (screenTextLayer) {
    screenTextLayer.remove();
    screenTextLayer = null;
  }

  if (currentPagesState === PagesState.RESULT) {
    if (typeof updateResultArtworkLayout === "function") {
      updateResultArtworkLayout();
    }
    resultSceneFinalized = false;
    loop();
  }
}

function syncBrushToCanvas() {
  if (typeof brush !== "undefined" && typeof brush.load === "function") {
    try {
      brush.load();
    } catch (error) {
      console.warn("brush failed to sync with canvas:", error);
    }
  }
}

function triggerShutterCapture() {
  if (currentPagesState !== PagesState.SCANNING || !video) return;

  isShutterPressed = true;
  if (typeof syncShutterButtonDom === "function") {
    syncShutterButtonDom();
  }

  // 直接在螢幕畫面上隨機決定生成範圍。
  let screenSpawnX = random(width * 0.2, width * 0.8);
  let screenSpawnY = random(height * 0.2, height * 0.8);

  spawnPosition = {
    x: screenSpawnX,
    y: screenSpawnY
  };
  spawnPositionRatio = {
    x: (screenSpawnX - camLayout.x) / camLayout.w,
    y: (screenSpawnY - camLayout.y) / camLayout.h
  };

  setupResultPhoto();
  currentPagesState = PagesState.RESULT;
  isShutterPressed = false;
  if (typeof syncDomUiState === "function") {
    syncDomUiState();
  }
  if (typeof syncShutterButtonDom === "function") {
    syncShutterButtonDom();
  }
}

// 修改後的版本
function requestAccess() {
  // 1. 同步觸發相機請求 (必須第一時間立刻呼叫，不能等 await！)
  // 我們先偷偷把相機打開，但不要馬上切換頁面
  let constraints = {
    video: {
      facingMode: "environment" 
    },
    audio: false 
  };
  
  // 開始請求相機
  video = createCapture(constraints, function() {
    video.hide();
    // 注意：我們把「切換頁面」的動作移出去了，等確認陀螺儀也 OK 後再切換
  });


  // 2. 觸發陀螺儀權限請求
  // 雖然這是非同步的，但相機已經在上一行開始請求了，所以不會被 Safari 擋住
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === "granted") {
          // 3. 確保相機和陀螺儀都沒問題後，才切換到掃描頁面
          currentPagesState = PagesState.SCANNING;
        } else {
          alert("必須允許動作感測器權限，才能進行環境探索喔！");
          // 如果拒絕了，你可以考慮把剛才開啟的 video 給停掉
          if (video && video.elt && video.elt.srcObject) {
            video.elt.srcObject.getTracks().forEach(track => track.stop());
          }
        }
      })
      .catch(error => {
        console.error("陀螺儀權限請求錯誤:", error);
      });
  } else {
    // 針對非 iOS 或不需權限的裝置 (例如 Android)
    // 直接切換頁面
    currentPagesState = PagesState.SCANNING;
  }
}

// 這是專門用來應付 iOS 權限的原生事件處理器
function handleStartButtonNative(e) {
  // 只在起始畫面生效
  if (currentPagesState === PagesState.START) {
    
    // 檢查點擊位置是否在 StartButton 範圍內
    if (dist(mouseX, mouseY, StartButton.ButtonX, StartButton.ButtonY) < StartButton.ButtonWidth / 2) {
      requestStartPermissions();
    }
  }
}

function requestStartPermissions() {
  if (currentPagesState !== PagesState.START) return;
  
  console.log("透過 HTML 按鈕 Click 成功觸發權限鏈！");

  // 1. 先處理對手勢最敏感的 iOS 陀螺儀
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          console.log("陀螺儀授權成功");
        } else {
          console.warn("陀螺儀被拒絕");
        }
        // 無論陀螺儀成不成功，緊接著啟動相機（保持在同一個手勢鏈內）
        startCameraSafe();
      })
      .catch(err => {
        console.error("陀螺儀錯誤:", err);
        startCameraSafe(); // 防呆
      });
  } else {
    // 2. Android 或 PC 裝置，直接叫起相機
    startCameraSafe();
  }
}

function requestMotionPermissionAfterCameraStart() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState !== 'granted') {
          console.warn("動作感測器權限未允許，仍會進入相機掃描流程。");
        }
      })
      .catch(err => {
        console.error("陀螺儀錯誤:", err);
      });
  }
}

// 獨立的相機啟動函數
async function startCameraSafe() {
  let constraints = {
    video: { facingMode: "environment" },
    audio: false
  };

  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    startPermissionRequestInProgress = false;
    alert("此瀏覽器不支援相機存取，請改用支援相機的手機瀏覽器。");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    attachNativeCameraStream(stream);
  } catch (error) {
    startPermissionRequestInProgress = false;
    console.error("相機權限請求錯誤:", error);
    alert("無法啟動相機，請確認瀏覽器已允許相機權限，且頁面使用 HTTPS 開啟。");
  }
}

function attachNativeCameraStream(stream) {
  if (video && video.elt && video.elt.srcObject) {
    video.elt.srcObject.getTracks().forEach(track => track.stop());
  }

  video = createVideo([]);
  video.elt.setAttribute("playsinline", "");
  video.elt.setAttribute("webkit-playsinline", "");
  video.elt.muted = true;
  video.elt.autoplay = true;
  video.elt.srcObject = stream;
  video.hide();

  video.elt.addEventListener("loadedmetadata", () => {
    if (video && typeof video.size === "function") {
      video.size(video.elt.videoWidth || 640, video.elt.videoHeight || 480);
    }
    video.elt.play().catch(error => {
      console.warn("相機影像播放啟動失敗:", error);
    });
    startPermissionRequestInProgress = false;
    currentPagesState = PagesState.SCANNING;
    if (typeof syncDomUiState === "function") {
      syncDomUiState();
    }
    loop();
  }, { once: true });

  video.elt.addEventListener("error", (error) => {
    startPermissionRequestInProgress = false;
    console.error("相機影像元素錯誤:", error);
  }, { once: true });
}
