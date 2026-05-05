const appFontFamily = 'TaipeiSansTCBeta, "PingFang TC", "Microsoft JhengHei", sans-serif';
let screenTextLayer;

const PagesState = Object.freeze({
    START: 'START',
    SCANNING: 'SCANNING',
    RESULT: 'RESULT',
});

function preload() {
  preloadScanningPage();
}

function ensureScreenTextLayer() {
  if (!screenTextLayer || screenTextLayer.width !== width || screenTextLayer.height !== height) {
    if (screenTextLayer) screenTextLayer.remove();
    screenTextLayer = createGraphics(width, height);
    screenTextLayer.textFont(appFontFamily);
  }
  return screenTextLayer;
}

function clearScreenTextLayer() {
  ensureScreenTextLayer().clear();
}

function drawScreenText(content, x, y, options = {}) {
  const g = ensureScreenTextLayer();
  g.push();
  g.textFont(appFontFamily);
  g.textSize(options.size || 16);
  g.textLeading(options.leading || (options.size || 16) * 1.2);
  g.textAlign(options.alignX || CENTER, options.alignY || BASELINE);
  if (options.fill !== undefined) {
    g.fill(options.fill);
  } else {
    g.fill(255);
  }
  g.noStroke();
  g.text(content, x, y);
  g.pop();
}

function drawScreenTextLayer() {
  if (!screenTextLayer) return;
  push();
  resetMatrix();
  imageMode(CORNER);
  image(screenTextLayer, -width / 2, -height / 2, width, height);
  pop();
}
