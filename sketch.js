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
        isShutterPressed = true; // 給予視覺回饋
        console.log("快門被點擊了！");
        
        // 【雛形測試】擷取影像
        if (typeof video !== 'undefined' && video !== null) {
          capturedImage = video.get(); 
          console.log("成功擷取影像：", capturedImage);
          
          currentPagesState = PagesState.RESULT;
        }
      }
      break;
      
    case PagesState.RESULT:
      if (checkBackButtonClicked(mouseX, mouseY)) {
        // 清空暫存並回到掃描頁面
        capturedImage = null;
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

async function requestAccess(){
  const gyroOk = await requestGyroPermission();
  if (!gyroOk) return;

  startCamera();
}