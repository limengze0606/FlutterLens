function drawStartPage() {
  syncStartPageDomIfReady({
    compact: isStartPageLandscapeCompact(),
    introText: getStartPageIntroText(),
    hintText: getStartPageHintText()
  });
}

function isStartPageLandscapeCompact() {
  return width > height && height < 360;
}

function getStartPageIntroText() {
  if (isStartPageLandscapeCompact()) {
    return "捕捉環境色彩，\n揭開未知昆蟲的偽裝。\n換個角度，也許會遇見新的驚喜。";
  }

  return (
    "大自然裡，許多未知昆蟲正以保護色隱身於周遭。\n" +
    "請透過鏡頭捕捉環境的色彩，揭開牠們的偽裝。\n\n" +
    "不同的昆蟲有著各自偏好的棲地與習性。\n" +
    "試著改變你觀察的角度——\n" +
    "無論是低頭探尋、平視周圍，抑或仰望天際，\n" +
    "都可能遇見截然不同的驚喜。"
  );
}

function getStartPageHintText() {
  return isStartPageLandscapeCompact()
    ? "先允許兩項權限"
    : "請先分別允許相機與陀螺儀權限";
}

function syncStartPageDomIfReady(layout) {
  if (typeof syncStartPageDom === "function") {
    syncStartPageDom(layout);
  }
}
