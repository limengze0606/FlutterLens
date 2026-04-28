function drawResultPage() {
  // 1. 繪製擷取到的乾淨照片
  if (capturedImage) {
    image(capturedImage, 0, 0, width, height);
  } else {
    // 防呆：萬一沒抓到照片
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("尚未擷取影像", width / 2, height / 2);
  }

  // 2. 繪製「返回」按鈕
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