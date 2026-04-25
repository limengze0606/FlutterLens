let video;

function drawScanningPage() {
  if (video) {
    image(video, 0, 0, width, height);
  }
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