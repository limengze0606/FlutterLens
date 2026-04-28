// 負責把照片跟標記點「焊」在一起
function setupResultCanvas() {
    // 1. 根據截圖大小創建畫布
    resultCanvas = createGraphics(capturedImage.width, capturedImage.height);
    
    // 2. 畫上照片
    resultCanvas.image(capturedImage, 0, 0);
    
    // 3. 畫上標記點
    if (spawnPosition) {
        // 在 ResultPage.js 的 setupResultCanvas 中：
        if (typeof topColors !== 'undefined' && topColors.length > 0) {
            let tc = topColors[0]; // 取得陣列的第一個物件
            
            // 1. 切換畫布為 HSB 模式 (對應你的 360, 100, 100)
            resultCanvas.colorMode(HSB, 360, 100, 100);
            
            // 2. 填入你精心調整過的 _adj 數值
            resultCanvas.fill(tc.h_adj, tc.s_adj, tc.b_adj);
        } else {
            // 防呆機制：如果抓不到顏色就用白色
            resultCanvas.fill(255); 
        }

        // 畫出圓形
        resultCanvas.stroke(0, 0, 100); // HSB 的白色
        resultCanvas.strokeWeight(4);
        resultCanvas.ellipse(spawnPosition.x, spawnPosition.y, 30, 30);

        // 3. 畫完記得切回 RGB 模式，避免影響其他元件
        resultCanvas.colorMode(RGB, 255);
    }
}

function drawResultPage() {
    background(0);
    
    if (resultCanvas) {
        push(); // 儲存目前的繪圖狀態 
        image(resultCanvas, 0, 0, width, height); 
        pop();  // 恢復原本的繪圖狀態
    }
    
    drawBackButton(); 
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
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("返回", btnX, btnY);
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
    if (resultCanvas) {
        resultCanvas.remove(); // 釋放記憶體
        resultCanvas = null;
    }
}