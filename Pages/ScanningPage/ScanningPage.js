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
}

async function requestGyroPermission() {
  // iOS 13+ 需要在使用者手勢內呼叫 requestPermission()
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    try {
      const permissionState = await DeviceOrientationEvent.requestPermission();
      if (permissionState !== "granted") {
        alert("必須允許動作感測器權限，才能進行環境探索喔！");
        return false;
      }
    } catch (error) {
      console.error("陀螺儀權限請求錯誤:", error);
      return false;
    }
  }

  // 非 iOS（或不需要顯式 permission 的環境）視為可用
  return true;
}

function startCamera() {
  let constraints = {
    video: {
      facingMode: "environment" // 關鍵字：強制要求使用後置(環境)鏡頭
    },
    audio: false // 確保不要求麥克風權限
  };

  // 啟動 p5.js 相機，並傳入我們設定的條件
  video = createCapture(constraints, function() {
    currentPagesState = PagesState.SCANNING;
  });
  
  // 隱藏原始的 HTML <video> 標籤
  video.hide(); 
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

  let boxW = 60;
  let boxH = 40;
  let spacing = 10;
  
  // 讓三個色塊在九宮格下方置中
  let totalW = (boxW * 3) + (spacing * 2);
  let startX = scanArea.x + (scanArea.w - totalW) / 2;
  let startY = scanArea.y + scanArea.h + 20;

  push();
  textAlign(CENTER, TOP);
  noStroke();
  
  topColors.forEach((c, i) => {
    let currentX = startX + i * (boxW + spacing);
    
    // 切換到 HSB 模式來畫色塊
    colorMode(HSB, 360, 100, 100);
    fill(c.h, c.s, c.b);
    rect(currentX, startY, boxW, boxH, 5);
    
    // 切回 RGB 模式畫文字，避免影響其他元件
    colorMode(RGB, 255);
    fill(255);
    textSize(12);
    text(`${c.percent}%`, currentX + boxW / 2, startY + boxH + 5);
    
    textSize(10);
    text(`Top ${i+1}`, currentX + boxW / 2, startY - 15);
  });
  pop();
}