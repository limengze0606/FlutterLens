let video;

function drawScanningPage() {
  if (video) {
    image(video, 0, 0, width, height);
  }
}

function startCamera() {
  // 啟動 p5.js 相機，並在成功讀取後切換到掃描狀態
  video = createCapture(VIDEO, function() {
    currentPagesState = PagesState.SCANNING;
  });
  
  // 隱藏原始的 HTML <video> 標籤
  video.hide(); 
}