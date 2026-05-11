function drawStartPage() {
  if (!StartButton && typeof initStartButtonLayout === "function") {
    initStartButtonLayout();
  }
  if (!StartButton) return;

  if (width > height && height < 360) {
    drawStartPageLandscapeCompact();
  } else {
    drawStartPagePortraitLayout();
  }
}

function drawStartPagePortraitLayout() {
  const cx = width / 2;
  const titleSize = constrain(min(width * 0.085, height * 0.07), 28, 44);
  const bodySize = constrain(min(width * 0.043, height * 0.028), 14, 19);
  const leading = bodySize * 1.52;
  const hintSize = constrain(width * 0.032, 12, 16);

  updateStartButtonMetrics(
    constrain(width * 0.48, 168, 210),
    constrain(height * 0.085, 48, 58),
    constrain(height * 0.085, 24, 30)
  );

  const titleY = max(42, height * 0.095);
  const bodyY = max(titleY + titleSize + 34, height * 0.255);
  const buttonBottomMargin = max(58, height * 0.085);
  const buttonY = height - buttonBottomMargin;
  const hintY = buttonY - StartButton.ButtonHeight / 2 - 28;

  drawScreenText("匿跡蟲蹤調查員", cx, titleY, {
    fill: 255,
    size: titleSize,
    alignX: CENTER,
    alignY: TOP
  });

  const introText =
    "大自然裡，許多未知昆蟲正以保護色隱身於周遭。\n" +
    "請透過鏡頭捕捉環境的色彩，揭開牠們的偽裝。\n\n" +
    "不同的昆蟲有著各自偏好的棲地與習性。\n" +
    "試著改變你觀察的角度——\n" +
    "無論是低頭探尋、平視周圍，抑或仰望天際，\n" +
    "都可能遇見截然不同的驚喜。";

  drawScreenText(introText, cx, bodyY, {
    fill: 210,
    size: bodySize,
    leading: leading,
    alignX: CENTER,
    alignY: TOP
  });

  drawScreenText("( 進入時需允許相機與動作感測器權限 )", cx, hintY, {
    fill: 150,
    size: hintSize,
    alignX: CENTER,
    alignY: TOP
  });

  drawStartButton(cx, buttonY, bodySize);
}

function drawStartPageLandscapeCompact() {
  const marginX = max(28, width * 0.055);
  const titleSize = constrain(height * 0.13, 24, 34);
  const bodySize = constrain(height * 0.058, 12, 16);
  const hintSize = constrain(height * 0.052, 11, 14);
  const leading = bodySize * 1.42;

  updateStartButtonMetrics(
    constrain(width * 0.22, 150, 178),
    constrain(height * 0.2, 44, 50),
    constrain(height * 0.1, 22, 25)
  );

  const leftX = marginX;
  const titleY = max(26, height * 0.18);
  const bodyY = titleY + titleSize + max(12, height * 0.055);
  const rightX = width - marginX - StartButton.ButtonWidth / 2;
  const buttonY = height * 0.61;
  const hintY = buttonY - StartButton.ButtonHeight / 2 - 24;

  drawScreenText("匿跡蟲蹤調查員", leftX, titleY, {
    fill: 255,
    size: titleSize,
    alignX: LEFT,
    alignY: TOP
  });

  drawScreenText("捕捉環境色彩，\n揭開未知昆蟲的偽裝。\n換個角度，也許會遇見新的驚喜。", leftX, bodyY, {
    fill: 210,
    size: bodySize,
    leading: leading,
    alignX: LEFT,
    alignY: TOP
  });

  drawScreenText("需允許相機與動作感測器", rightX, hintY, {
    fill: 150,
    size: hintSize,
    alignX: CENTER,
    alignY: TOP
  });

  drawStartButton(rightX, buttonY, bodySize);
}

function updateStartButtonMetrics(buttonWidth, buttonHeight, borderRadius) {
  StartButton.ButtonWidth = buttonWidth;
  StartButton.ButtonHeight = buttonHeight;
  StartButton.ButtonBorderRadius = borderRadius;
}

function drawStartButton(x, y, textSize) {
  StartButton.ButtonX = x;
  StartButton.ButtonY = y;

  fill(StartButton.ButtonColor);
  rectMode(StartButton.ButtonRectMode);
  rect(
    StartButton.ButtonX,
    StartButton.ButtonY,
    StartButton.ButtonWidth,
    StartButton.ButtonHeight,
    StartButton.ButtonBorderRadius
  );

  drawScreenText(StartButton.Text, StartButton.ButtonX, StartButton.ButtonY, {
    fill: StartButton.TextColor,
    size: constrain(textSize, 14, 18),
    alignX: CENTER,
    alignY: CENTER
  });
}
