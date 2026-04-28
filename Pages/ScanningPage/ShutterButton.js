let shutterX = 0;
let shutterY = 0;
let shutterR = 35;        // 快門外圈半徑
let shutterInnerR = 28;   // 快門內圈半徑
let isShutterPressed = false; // 紀錄是否正在按壓
let capturedImage = null; // 暫存相機截圖

// --- 新增：繪製快門按鈕 ---
function drawShutterButton() {
  push();
  translate(shutterX, shutterY);
  
  // 繪製外圈 (半透明或白框)
  noFill();
  stroke(255, 200); 
  strokeWeight(4);
  ellipse(0, 0, shutterR * 2);

  // 繪製內圈 (實心白)
  fill(255);
  noStroke();
  // 按下時內圈縮小，放開時恢復
  let currentInnerR = isShutterPressed ? shutterInnerR * 0.85 : shutterInnerR;
  ellipse(0, 0, currentInnerR * 2);
  
  pop();
}

// --- 新增：依據手機物理旋轉角度，更新快門位置 ---
function updateShutterPosition() {
  // 設定按鈕距離「實體底部」的邊距
  let margin = 80; // 可以依喜好微調，例如改成 60 或 100

  // 根據旋轉角度決定位置
  if (currentOrientation === 90) {
    // 【手機向左橫放】：實體底部會跑到畫面的「右側」
    shutterX = width - margin;
    shutterY = height / 2;
  } else if (currentOrientation === -90 || currentOrientation === 270) {
    // 【手機向右橫放】：實體底部會跑到畫面的「左側」
    shutterX = margin;
    shutterY = height / 2;
  } else {
    // 【直立模式】 (0 或 180 度)：實體底部在畫面的「正下方」
    shutterX = width / 2;
    shutterY = height - margin;
  }
}

// --- 新增：檢查快門是否被點擊 ---
function checkShutterClicked(mx, my) {
  let d = dist(mx, my, shutterX, shutterY);
  return d <= shutterR;
}