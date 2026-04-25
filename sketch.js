let currentPagesState = PagesState.START;

function setup() {
  createCanvas(windowWidth, windowHeight);
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