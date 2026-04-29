function drawStartPage() {
  // 動態取得畫面中心點
  let cx = width / 2;
  let cy = height / 2;

  // 1. 繪製主標題
  fill(255);
  textSize(34); 
  textAlign(CENTER, CENTER);
  // 將標題往上推一點，留空間給多行說明文字
  text("匿跡蟲蹤調查員", cx, cy - 130);
    
  // 2. 繪製情境導引文字 (使用文字區塊來自動換行與置中)
  let introText = 
    "大自然裡，許多未知昆蟲正以保護色隱身於周遭。\n" +
    "請透過鏡頭捕捉環境的色彩，揭開牠們的偽裝。\n\n" +
    "不同的昆蟲有著各自偏好的棲地與習性。\n" +
    "試著改變你觀察的角度——\n" +
    "無論是低頭探尋、平視周圍，抑或仰望天際，\n" +
    "都可能遇見截然不同的驚喜。";

  fill(210); // 柔和的淺灰色
  // 為了讓文字在各種尺寸的手機上都不會太擁擠，可以設定稍小的字級搭配適當行距
  textLeading(24); // 設定行距
  textSize(15);
  text(introText, cx, cy - 15);

  // 3. 權限小提示
  fill(150);
  textSize(12);
  text("( 進入時需允許相機與動作感測器權限 )", cx, cy + 90);

  // 4. 確保按鈕已經初始化
  if (!StartButton && typeof initStartButtonLayout === "function") {
    initStartButtonLayout();
  }
  if (!StartButton) return;

  // 5. 動態更新按鈕的碰撞座標 (放在更下方的位置)
  StartButton.ButtonX = cx;
  StartButton.ButtonY = cy + 150;

  // 6. 繪製按鈕背景
  fill(StartButton.ButtonColor);
  rectMode(StartButton.ButtonRectMode);
  rect(StartButton.ButtonX, StartButton.ButtonY, StartButton.ButtonWidth, StartButton.ButtonHeight, StartButton.ButtonBorderRadius);
  
  // 7. 繪製按鈕文字
  fill(StartButton.TextColor);
  textSize(StartButton.TextSize);
  textAlign(CENTER, CENTER);
  text(StartButton.Text, StartButton.ButtonX, StartButton.ButtonY);
}