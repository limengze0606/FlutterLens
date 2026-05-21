let currentPagesState = PagesState.START;
const startPermissionState = {
  camera: {
    status: "idle",
    granted: false,
    error: ""
  },
  motion: {
    status: "idle",
    granted: false,
    error: ""
  }
};

async function setup() {
  // 將 canvas 存起來
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  if (typeof initDomUi === "function") {
    initDomUi();
  }
  if (typeof drawStartPage === "function") {
    drawStartPage();
  }
  await Promise.all([
    preloadScanningPage(),
    typeof preloadStartDissolveTransition === "function"
      ? preloadStartDissolveTransition()
      : Promise.resolve()
  ]);

  angleMode(DEGREES);

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

  const startDissolving = typeof isStartDissolveTransitionActive === "function"
    && isStartDissolveTransitionActive();

  if (startDissolving) {
    drawInScreenSpace(() => {
      drawScanningPage();
    });
    drawStartDissolveTransition();
  } else {
    if (currentPagesState === PagesState.START && typeof drawStartDissolvePaperBase === "function") {
      drawStartDissolvePaperBase();
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
  }

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

function requestCameraPermission() {
  if (currentPagesState !== PagesState.START) return;
  if (startPermissionState.camera.status === "pending" || startPermissionState.camera.granted) return;

  startPermissionState.camera.status = "pending";
  startPermissionState.camera.error = "";
  syncStartPermissionDomIfReady();

  const constraints = {
    video: { facingMode: "environment" },
    audio: false
  };

  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    markCameraPermissionError("此瀏覽器不支援相機存取。");
    return;
  }

  console.log("相機權限按鈕觸發 getUserMedia");
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      attachNativeCameraStream(stream);
    })
    .catch(error => {
      console.error("相機權限請求錯誤:", error);
      markCameraPermissionError(formatPermissionError(error));
    });
}

function requestMotionPermission() {
  if (currentPagesState !== PagesState.START) return;
  if (startPermissionState.motion.status === "pending" || startPermissionState.motion.granted) return;

  startPermissionState.motion.status = "pending";
  startPermissionState.motion.error = "";
  syncStartPermissionDomIfReady();

  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          markMotionPermissionGranted();
        } else {
          console.warn("動作感測器權限未允許。");
          markMotionPermissionError("使用者未允許動作感測器權限。");
        }
      })
      .catch(err => {
        console.error("陀螺儀錯誤:", err);
        markMotionPermissionError(formatPermissionError(err));
      });
  } else {
    markMotionPermissionGranted();
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
    markCameraPermissionGranted();
    loop();
  }, { once: true });

  video.elt.addEventListener("error", (error) => {
    console.error("相機影像元素錯誤:", error);
    markCameraPermissionError("相機影像元素啟動失敗。");
  }, { once: true });
}

function requestStartPermissions() {
  if (currentPagesState !== PagesState.START) return;

  if (!startPermissionState.camera.granted || !startPermissionState.motion.granted) {
    syncStartPermissionDomIfReady();
    return;
  }

  const goToScanning = () => {
    currentPagesState = PagesState.SCANNING;
    if (typeof syncDomUiState === "function") {
      syncDomUiState();
    }
    loop();
  };

  if (typeof beginStartPageFadeOut === "function" && beginStartPageFadeOut(goToScanning)) {
    return;
  }

  goToScanning();
}

function markCameraPermissionGranted() {
  startPermissionState.camera.status = "granted";
  startPermissionState.camera.granted = true;
  startPermissionState.camera.error = "";
  syncStartPermissionDomIfReady();
}

function markMotionPermissionGranted() {
  startPermissionState.motion.status = "granted";
  startPermissionState.motion.granted = true;
  startPermissionState.motion.error = "";
  syncStartPermissionDomIfReady();
}

function markCameraPermissionError(message) {
  startPermissionState.camera.status = "error";
  startPermissionState.camera.granted = false;
  startPermissionState.camera.error = message;
  syncStartPermissionDomIfReady();
}

function markMotionPermissionError(message) {
  startPermissionState.motion.status = "error";
  startPermissionState.motion.granted = false;
  startPermissionState.motion.error = message;
  syncStartPermissionDomIfReady();
}

function formatPermissionError(error) {
  if (!error) return "未知錯誤。";
  const name = error.name || "Error";
  const message = error.message || "沒有錯誤訊息";
  const secure = typeof window !== "undefined" ? `secureContext=${window.isSecureContext}` : "";
  const protocol = typeof location !== "undefined" ? `protocol=${location.protocol}` : "";
  return `${name}: ${message}\n${secure} ${protocol}`.trim();
}

function syncStartPermissionDomIfReady() {
  if (typeof syncStartPermissionDom === "function") {
    syncStartPermissionDom();
  }
}
