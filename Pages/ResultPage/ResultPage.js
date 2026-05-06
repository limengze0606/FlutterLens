// 負責把照片跟標記點「焊」在一起
let resultCanvasFinalized = false;
let resultCaptureScheduled = false;

function setupResultCanvas() {
    // 1. 建立一個跟「當前螢幕」一模一樣大小的畫布
    resultCanvas = createGraphics(width, height);
    resultCanvasFinalized = false;
    resultCaptureScheduled = false;

    // 2. 直接把相機畫面用我們算好的無變形參數畫上去 (捕捉完美瞬間)
    if (video) {
        resultCanvas.image(video, camLayout.x, camLayout.y, camLayout.w, camLayout.h);
    }
}

function drawResultPage() {
    if (resultCanvas) {
        push(); 
        // 【修改點】：因為 resultCanvas 已經是螢幕大小了
        // 我們直接畫在 (0, 0) 並且填滿 width, height，完美覆蓋！
        image(resultCanvas, 0, 0, width, height); 
        pop();  

        if (!resultCanvasFinalized) {
            if (spawnPosition) {
                drawRoughInsect(window, spawnPosition.x, spawnPosition.y);
            }
            scheduleResultCapture();
            return;
        }
    }
    
    drawBackButton(); 
}

function scheduleResultCapture() {
    if (resultCaptureScheduled) return;

    resultCaptureScheduled = true;
    noLoop();
    requestAnimationFrame(() => {
        if (!resultCanvas) {
            resultCaptureScheduled = false;
            loop();
            return;
        }

        let finalFrame = get(0, 0, width, height);
        resultCanvas.clear();
        resultCanvas.image(finalFrame, 0, 0, width, height);
        resultCanvasFinalized = true;
        resultCaptureScheduled = false;
        loop();
    });
}

function drawBackButton() {
  push();
  // 畫在畫面正下方，或是你想放左上角也可以
  let btnX = width / 2;
  let btnY = height - 80;
  
  // 半透明白底圓角矩形
  fill(255, 255, 255, 200);
  noStroke();
  rectMode(CENTER);
  rect(btnX, btnY, 140, 50, 25); 

  // 文字
  drawScreenText("返回", btnX, btnY, {
    fill: 0,
    size: 18,
    alignX: CENTER,
    alignY: CENTER
  });
  pop();
}

// 檢查是否點擊到「返回」按鈕的範圍
function checkBackButtonClicked(mx, my) {
  let btnX = width / 2;
  let btnY = height - 80;
  let btnW = 140;
  let btnH = 50;

  // 簡單的矩形碰撞偵測 (AABB)
  if (mx > btnX - btnW/2 && mx < btnX + btnW/2 &&
      my > btnY - btnH/2 && my < btnY + btnH/2) {
    return true;
  }
  return false;
}

function resetResultData() {
    spawnPosition = null;
    resultCanvasFinalized = false;
    resultCaptureScheduled = false;
    if (resultCanvas) {
        resultCanvas.remove(); // 釋放記憶體
        resultCanvas = null;
    }
}
