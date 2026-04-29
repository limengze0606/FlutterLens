function drawStartPage() {
  let cx = width / 2;
  let isPortrait = height > width;

  // 1. 響應式字級計算 (調高比例並放寬上下限)
  // 將直式的標題比例調高至 0.12，上限放寬至 56
  let titleSize = constrain(isPortrait ? width * 0.12 : height * 0.12, 28, 56); 
  
  // 將直式的內文比例調高至 0.06 (甚至可以試試 0.07)，下限提高至 16，上限放寬至 28
  let bodySize = constrain(isPortrait ? width * 0.06 : height * 0.06, 16, 28); 
  
  let leading = bodySize * 1.6;

  // 2. 確保按鈕已經初始化
  if (!StartButton && typeof initStartButtonLayout === "function") {
    initStartButtonLayout();
  }
  if (!StartButton) return;

  // 3. 【核心修正】計算所有元素的總高度
  let introLines = 7; // 我們的說明文字包含空白行總共有 7 行
  let textBlockHeight = introLines * leading;
  let gap = isPortrait ? 25 : 15; // 元素之間的間距 (直向寬鬆、橫向緊湊)
  
  // 總高度 = 標題 + 間距 + 說明文字 + 間距 + 提示文字 + 間距 + 按鈕高度
  let totalHeight = titleSize + gap + textBlockHeight + gap + 12 + gap + StartButton.ButtonHeight;

  // 4. 計算起始 Y 座標 (讓整組內容完美置中)
  // 如果螢幕真的扁到裝不下，至少確保從距離頂部 20px 開始畫，不要被裁掉頭
  let currentY = max((height - totalHeight) / 2, 20);

  // --- 開始由上而下依序繪製，絕對不可能重疊 ---

  // [第一塊：標題]
  fill(255);
  textAlign(CENTER, TOP); // 改用 TOP 對齊，方便向下推算座標
  textSize(titleSize);
  text("匿跡蟲蹤調查員", cx, currentY);
  currentY += titleSize + gap; // 畫完後，Y 座標往下推

  // [第二塊：說明文字]
  let introText = 
    "大自然裡，許多未知昆蟲正以保護色隱身於周遭。\n" +
    "請透過鏡頭捕捉環境的色彩，揭開牠們的偽裝。\n\n" +
    "不同的昆蟲有著各自偏好的棲地與習性。\n" +
    "試著改變你觀察的角度——\n" +
    "無論是低頭探尋、平視周圍，抑或仰望天際，\n" +
    "都可能遇見截然不同的驚喜。";

  fill(210);
  textLeading(leading); 
  textSize(bodySize);
  text(introText, cx, currentY);
  currentY += textBlockHeight + gap; // Y 座標繼續往下推

  // [第三塊：權限提示]
  fill(150);
  textSize(12);
  text("( 進入時需允許相機與動作感測器權限 )", cx, currentY);
  currentY += 12 + gap; // Y 座標繼續往下推

  // [第四塊：按鈕]
  // 因為原本設定按鈕是 CENTER 模式，所以要把中心點往下加一半的高度
  StartButton.ButtonX = cx;
  StartButton.ButtonY = currentY + (StartButton.ButtonHeight / 2);

  fill(StartButton.ButtonColor);
  rectMode(StartButton.ButtonRectMode);
  rect(StartButton.ButtonX, StartButton.ButtonY, StartButton.ButtonWidth, StartButton.ButtonHeight, StartButton.ButtonBorderRadius);
  
  fill(StartButton.TextColor);
  textSize(bodySize);
  textAlign(CENTER, CENTER); // 按鈕裡的文字維持置中對齊
  text(StartButton.Text, StartButton.ButtonX, StartButton.ButtonY);
}