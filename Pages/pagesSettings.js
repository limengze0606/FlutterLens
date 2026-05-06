const appFontFamily = 'TaipeiSansTCBeta, "PingFang TC", "Microsoft JhengHei", sans-serif';
let screenTextLayer;

const PagesState = Object.freeze({
    START: 'START',
    SCANNING: 'SCANNING',
    RESULT: 'RESULT',
});

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

function drawInScreenSpace(drawFn) {
  push();
  resetMatrix();
  imageMode(CORNER);
  translate(-width / 2, -height / 2);
  drawFn();
  pop();
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

function drawScreenImage(img, x, y, w, h, options = {}) {
  if (!img) return;
  const g = ensureScreenTextLayer();
  g.push();
  g.imageMode(options.mode || CORNER);
  g.image(img, x, y, w, h);
  g.pop();
}

function drawScreenRect(x, y, w, h, radius = 0, options = {}) {
  const g = ensureScreenTextLayer();
  g.push();
  g.rectMode(options.mode || CENTER);
  if (options.fill !== undefined) {
    if (Array.isArray(options.fill)) {
      g.fill(...options.fill);
    } else {
      g.fill(options.fill);
    }
  } else {
    g.fill(255);
  }
  if (options.stroke !== undefined) {
    if (Array.isArray(options.stroke)) {
      g.stroke(...options.stroke);
    } else {
      g.stroke(options.stroke);
    }
  } else {
    g.noStroke();
  }
  g.rect(x, y, w, h, radius);
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
