let video;
let topColors = [];

function drawScanningPage() {
  if (video) {
    image(video, 0, 0, width, height);
  }
  
  // 1. 更新九宮格區域數值
  initScanArea();
  
  // 2. 降低分析頻率 (利用 frameCount)
  if (video && video.width > 0) {
    // 預設 60 FPS 的情況下，每 20 幀執行一次，等於每秒只更新 3 次
    // 你可以修改這個數字：數字越大更新越慢，畫面越穩定
    if (frameCount % 20 === 0) { 
      analyzeColors();
    }
  }
  
  // 3. 分析完之後，再來繪製九宮格線條與外框
  drawGrid();

  // 4. 繪製擷取到的顏色 UI
  drawColorUI();

  // 5. 繪製原有的陀螺儀資訊
  drawGyroVisualizer();

  // 6. 更新座標並繪製快門按鈕
  updateShutterPosition();
  drawShutterButton();
}

function drawGyroVisualizer() {
  // 1. 確保每一幀都呼叫翻譯官，更新最新的 finalPitch
  updateNormalizedPitch();

  // 2. 設定位置 (與原本的右下角位置相同)
  let cx = width - 80; // 稍微往左移一點點，避免文字貼齊螢幕邊緣
  let cy = height - 90;

  push(); // 隔離樣式，避免污染到主畫布其他元素
  
  // 畫一個半透明黑底圓角矩形，確保文字在相機畫面上不會糊掉
  rectMode(CENTER);
  fill(0, 150);
  noStroke();
  rect(cx, cy, 120, 70, 10);

  // 設定文字對齊與樣式
  textAlign(CENTER, CENTER);
  
  // 顯示螢幕目前的硬體方向 (除錯用，白色小字)
  fill(255);
  textSize(14);
  text(`方向: ${currentOrientation}°`, cx, cy - 15);
  
  // 顯示最重要的「客觀平視仰俯角」 (綠色大字)
  fill(0, 255, 0);
  textSize(18);
  text(`仰俯: ${nf(finalPitch, 1, 1)}°`, cx, cy + 15);
  
  pop();
}

function drawGrid() {
  stroke(255, 150); // 半透明白線
  strokeWeight(1);
  
  // 垂直線
  line(width / 3, 0, width / 3, height);
  line((width / 3) * 2, 0, (width / 3) * 2, height);
  // 水平線
  line(0, height / 3, width, height / 3);
  line(0, (height / 3) * 2, width, (height / 3) * 2);

  // 黃色框線強調中央偵測區域
  push();
  rectMode(CORNER); // <--- 強制設定為以左上角為起點
  noFill();
  stroke(255, 255, 0); 
  strokeWeight(2);
  rect(scanArea.x, scanArea.y, scanArea.w, scanArea.h);
  pop();
}

function drawColorUI() {
  if (topColors.length === 0) return;

  // 稍微把色塊縮小一點點，讓左下角的 UI 面板看起來更精緻不笨重
  let boxW = 50; 
  let boxH = 30;
  let spacing = 10;
  let totalW = (boxW * 3) + (spacing * 2);

  // 1. 設定面板位置 (對稱於右下角的陀螺儀)
  let cx = 110;          // 面板中心 X (距離左邊緣留點空隙)
  let cy = height - 90;  // 面板中心 Y (與陀螺儀 cy = height - 90 完美對齊)

  push();
  
  // 2. 畫一個半透明黑底圓角矩形 (比照陀螺儀的視覺風格)
  rectMode(CENTER);
  fill(0, 150);
  noStroke();
  // 面板寬高稍微比色塊總寬度大一點，留出 padding
  rect(cx, cy, totalW + 30, boxH + 45, 10);

  // 3. 繪製色塊與文字
  rectMode(CORNER); // 切換回 CORNER 方便畫內部的色塊
  textAlign(CENTER, TOP);
  
  // 計算最左邊第一個色塊的起點座標
  let startX = cx - (totalW / 2);
  let startY = cy - (boxH / 2); 

  topColors.forEach((c, i) => {
    let currentX = startX + i * (boxW + spacing);
    
    // 畫色塊 (使用預先算好的調整後顏色)
    colorMode(HSB, 360, 100, 100);
    fill(c.h_adj, c.s_adj, c.b_adj); 
    rect(currentX, startY, boxW, boxH, 5);
    
    // 畫文字
    colorMode(RGB, 255);
    fill(255);
    
    // 百分比顯示在色塊下方
    textSize(12);
    text(`${c.percent}%`, currentX + boxW / 2, startY + boxH + 4);
    
    // 名次顯示在色塊上方
    textSize(10);
    text(`Top ${i+1}`, currentX + boxW / 2, startY - 14);
  });
  
  pop();
}