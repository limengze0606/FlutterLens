let video;
let topColors = [];

function drawScanningPage() {
  if (video && video.width > 0) {
    // 每次繪製前更新佈局 (計算量極小，放這可避免因裝置轉向而破版)
    updateCameraLayout(); 
    
    // 【修改點】不再強制拉伸[cite: 2]，而是使用計算後的 cover 參數
    image(video, camLayout.x, camLayout.y, camLayout.w, camLayout.h);
  }
  
  // 1. 更新九宮格區域數值
  initScanArea();
  
  // 2. 降低分析頻率 (利用 frameCount)
  if (video && video.width > 0) {
    // 預設 60 FPS 的情況下，每 30 幀執行一次，等於每秒只更新 2 次
    // 你可以修改這個數字：數字越大更新越慢，畫面越穩定
    if (frameCount % 30 === 0) { 
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
  let cx = width - 80; 
  let cy = height - 90;

  push(); // 隔離樣式，避免污染到主畫布其他元素

  // 3. 根據 finalPitch 的條件判斷要顯示哪一張圖片
  let iconToShow;
  if (finalPitch < -50) {
    iconToShow = iconLookDown;      // 俯視 (finalPitch < -50)
  } else if (finalPitch >= -50 && finalPitch < 20) {
    iconToShow = iconLookStraight;  // 平視 (finalPitch >= -50 且 < 20)
  } else {
    iconToShow = iconLookUp;        // 仰視 (其餘狀況，即 finalPitch >= 20)
  }

  // 4. 繪製對應的圖片
  if (iconToShow) {
    imageMode(CENTER);
    // 假設圖示畫成 50x50 大小，你可以根據實際圖檔的精緻度自行放大或縮小
    image(iconToShow, cx, cy, 150, 150);
  }
  
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
  // 確保至少有抓到兩個顏色才繪製
  if (topColors.length < 2) return;

  // 1. 設定面板位置 (對稱於右下角的陀螺儀)
  let cx = 110;          
  let cy = height - 90;  

  push();
  
  // 2. 畫一個半透明黑底「膠囊」 (高度縮小，寬度包覆兩顆圓形)
  rectMode(CENTER);
  fill(0, 150);
  noStroke();
  // 寬度 120，高度 70，圓角 25 (高度的一半即為完美膠囊形狀)
  rect(cx, cy, 120, 70, 25); 

  // 3. 繪製圓形色票
  let circleSize = 45; // 色票大小
  let offset = 28;     // 左右偏移量

  // 為了讓色票在黑底上更突出，加上淡淡的白邊
  strokeWeight(2);
  stroke(255, 150); 

  // 繪製第一主色 (左)
  colorMode(HSB, 360, 100, 100);
  fill(topColors[0].h_adj, topColors[0].s_adj, topColors[0].b_adj); 
  ellipse(cx - offset, cy, circleSize, circleSize);

  // 繪製第二主色 (右)
  fill(topColors[1].h_adj, topColors[1].s_adj, topColors[1].b_adj); 
  ellipse(cx + offset, cy, circleSize, circleSize);

  pop();
}

// 計算相機影像置中覆蓋 (Center-Crop) 的渲染參數
function updateCameraLayout() {
  // 確保相機影像已經準備好
  if (!video || video.width === 0) return;

  let videoAspect = video.width / video.height;
  let canvasAspect = width / height;

  if (canvasAspect > videoAspect) {
    // 畫布比影像「寬」：以畫布寬度為基準縮放，裁掉上下多餘部分
    camLayout.w = width;
    camLayout.h = width / videoAspect;
    camLayout.scale = width / video.width;
  } else {
    // 畫布比影像「窄」或相等：以畫布高度為基準縮放，裁掉左右多餘部分
    camLayout.h = height;
    camLayout.w = height * videoAspect;
    camLayout.scale = height / video.height;
  }

  // 計算置中偏移量 (如果是裁掉邊緣，這兩個值可能會是負數)
  camLayout.x = (width - camLayout.w) / 2;
  camLayout.y = (height - camLayout.h) / 2;
}