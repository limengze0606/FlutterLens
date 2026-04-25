function drawStartPage() {
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("生態偵探 AR", width / 2, height / 2 - 80);
    
  // 開始按鈕
  if (!StartButton && typeof initStartButtonLayout === "function") {
    initStartButtonLayout();
  }
  if (!StartButton) return;

  fill(StartButton.ButtonColor);
  rectMode(StartButton.ButtonRectMode);
  rect(StartButton.ButtonX, StartButton.ButtonY, StartButton.ButtonWidth, StartButton.ButtonHeight, StartButton.ButtonBorderRadius);
  fill(StartButton.TextColor);
  textSize(StartButton.TextSize);
  textAlign(StartButton.TextTextAlignX, StartButton.TextTextAlignY);
  text(StartButton.Text, StartButton.TextX, StartButton.TextY);
}