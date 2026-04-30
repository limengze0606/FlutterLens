let currentPagesState = PagesState.START;

function setup() {
  // 將 canvas 存起來
  let canvas = createCanvas(windowWidth, windowHeight);
  
  if (typeof initStartButtonLayout === "function") {
    initStartButtonLayout();
  }
  angleMode(DEGREES);

  // 【核心修改】繞過 p5.js，直接在畫布上掛載原生點擊事件
  // 使用 touchend 和 click 確保在所有裝置上都能抓到最純粹的點擊
  canvas.elt.addEventListener('touchend', handleStartButtonNative, false);
  canvas.elt.addEventListener('click', handleStartButtonNative, false);
}

function draw() {
  background(0);

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
}

// 建立一個共用的互動處理函數
function handleInteraction() {
  switch (currentPagesState) {
    case PagesState.START:
      if (dist(mouseX, mouseY, StartButton.ButtonX, StartButton.ButtonY) < StartButton.ButtonWidth / 2) {
        //requestAccess();
      }
      break;
      
    case PagesState.SCANNING:
      if (checkShutterClicked(mouseX, mouseY)) {
        isShutterPressed = true;  
        
        // 1. 【刪除這行】：不再抓取錯誤比例的原始像素
        // capturedImage = video.get(); 
        
        // 2. 直接在螢幕畫面上隨機決定生成範圍
        let screenSpawnX = random(width * 0.2, width * 0.8);
        let screenSpawnY = random(height * 0.2, height * 0.8);

        // 3. 【修改點】：直接使用螢幕座標！完全不需要除以 camLayout.scale 換算了
        spawnPosition = {
          x: screenSpawnX,
          y: screenSpawnY
        };

        setupResultCanvas();
        currentPagesState = PagesState.RESULT;
      }
      break;
      
    case PagesState.RESULT:
      if (checkBackButtonClicked(mouseX, mouseY)) {
        resetResultData();
        currentPagesState = PagesState.SCANNING;
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
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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
      
      // 先處理音效權限 (如果有用到的話)
      if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
      }

      // 【直接請求陀螺儀】因為是原生事件，Safari 絕對會乖乖彈出視窗
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              // 陀螺儀允許後，才安全地去開相機
              startCameraSafe();
            } else {
              alert("必須允許動作感測器，才能進入專案喔！");
            }
          })
          .catch(err => console.error("陀螺儀錯誤:", err));
      } else {
        // Android 系統直接開相機
        startCameraSafe();
      }
    }
  }
}

// 獨立的相機啟動函數
function startCameraSafe() {
  let constraints = {
    video: { facingMode: "environment" },
    audio: false
  };

  video = createCapture(constraints, function() {
    video.hide();
    // 相機確實啟動後，才切換到 ScanningPage
    currentPagesState = PagesState.SCANNING;
  });
}