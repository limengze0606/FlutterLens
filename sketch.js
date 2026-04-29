let currentPagesState = PagesState.START;

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (typeof initStartButtonLayout === "function") {
    initStartButtonLayout();
  }
  angleMode(DEGREES);
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

function keyPressed() {
  if (key === '1') {
    currentPagesState = PagesState.START;
  } else if (key === '2') {
    currentPagesState = PagesState.SCANNING;
  } else if (key === '3') {
    currentPagesState = PagesState.RESULT;
  }
}

function mousePressed() {
  switch (currentPagesState) {
    case PagesState.START:
      // 點擊啟動按鈕
      if (dist(mouseX, mouseY, StartButton.ButtonX, StartButton.ButtonY) < StartButton.ButtonWidth / 2) {
        requestAccess();
      }
      break;
      
    case PagesState.SCANNING:
      // 檢查是否點擊到快門按鈕
      if (checkShutterClicked(mouseX, mouseY)) {
        isShutterPressed = true;  

        // 1. 截圖
          capturedImage = video.get();
          
          // 2. 計算隨機座標 (Safe Zone)
          // 假設 Safe Zone 是 螢幕寬度 20%~80%, 高度 20%~70%
          spawnPosition = {
          x: random(capturedImage.width * 0.2, capturedImage.width * 0.8),
          y: random(capturedImage.height * 0.2, capturedImage.height * 0.7)
      };
          
          // 3. 預先生成好要儲存的影像
          setupResultCanvas();
          
          // 4. 切換頁面
          currentPagesState = PagesState.RESULT;
      }
      break;
      
    case PagesState.RESULT:
      if (checkBackButtonClicked(mouseX, mouseY)) {
        // 清空暫存並回到掃描頁面
        capturedImage = null;
        resetResultData();
        currentPagesState = PagesState.SCANNING;
      }
      break;
  }
}

// 處理放開的手勢，恢復按鈕外觀
function mouseReleased() {
  if (currentPagesState === PagesState.SCANNING) {
    isShutterPressed = false;
  }
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