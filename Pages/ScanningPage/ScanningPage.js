let video;

function drawScanningPage() {
  if (video) {
    image(video, 0, 0, width, height);
  }
  //drawGyroVisualizer();
  drawGyroManager();
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
  // 設定儀表板的位置與大小
  let cx = width - 70;
  let cy = height - 90;
  let maxRadius = 40;

  // 畫儀表板底框 (半透明黑底)
  fill(0, 150);
  noStroke();
  circle(cx, cy, maxRadius * 2);
  
  // 畫十字準星 (代表絕對水平/靜止中心)
  stroke(255, 100);
  strokeWeight(1);
  line(cx - maxRadius, cy, cx + maxRadius, cy);
  line(cx, cy - maxRadius, cx, cy + maxRadius);

  // === 讀取 p5.js 內建的陀螺儀變數 ===
  // rotationX: 手機前後傾斜 (Pitch)
  // rotationY: 手機左右傾斜 (Roll)
  
  // 將角度數值對應到畫面上的像素位移 (限制在儀表板範圍內)
  let markerX = map(rotationY, -90, 90, -maxRadius, maxRadius, true);
  let markerY = map(rotationX, -90, 90, -maxRadius, maxRadius, true);

  // 畫出代表手機姿態的「綠色游標」
  fill(0, 255, 0);
  noStroke();
  circle(cx + markerX, cy + markerY, 15);

  // 顯示原始數據 (除錯用)
  fill(255);
  textSize(12);
  text(`X: ${Math.round(rotationX)}°`, cx, cy + maxRadius + 15);
  text(`Y: ${Math.round(rotationY)}°`, cx, cy + maxRadius + 30);
}