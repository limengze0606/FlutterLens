let currentPagesState = PagesState.START;

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (typeof initStartButtonLayout === "function") {
    initStartButtonLayout();
  }
}

function draw() {
  background(0);

  switch (currentPagesState) {
    case PagesState.START:
      drawStartPage();
      break;
    case PagesState.SCANNING:
      drawScanningPage();
      break;
    case PagesState.RESULT:
      drawResultPage();
      break;
  }
}

function keyPressed() {
  if (key === '1') {
    currentPagesState = PagesState.START;
  } else if (key === '2') {
    currentPagesState = PagesState.SCANNING;
  } else if (key === '3') {
    currentPagesState = PagesState.RESULT;
  }
}

function mousePressed() {
  if (currentPagesState === PagesState.START) {
    // 點擊啟動按鈕
    if (dist(mouseX, mouseY, StartButton.ButtonX, StartButton.ButtonY) < StartButton.ButtonWidth / 2) {
      currentPagesState = PagesState.SCANNING;
    }
  }
}