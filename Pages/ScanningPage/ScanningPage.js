let video;

function drawScanningPage() {
  if (video) {
    image(video, 0, 0, width, height);
  }
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