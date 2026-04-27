// ====== 色彩分桶設定 ======
const H_BINS = 8;
const S_BINS = 3;
const B_BINS = 3;


function analyzeColors() {
  // 直接從畫布擷取中央區域 (最符合肉眼看到的範圍)
  let img = get(scanArea.x, scanArea.y, scanArea.w, scanArea.h);
  // 呼叫 ColorProcessor.js 中的函式
  topColors = getTopColors(img);
}

function getTopColors(img) {
  img.loadPixels();
  
  let counts = {};
  
  // 取得真實的硬體像素總數 (陣列長度除以 4，因為包含 R,G,B,A)
  let pixelCount = img.pixels.length / 4; 
  
  if (pixelCount === 0) return [];

  // 動態計算跳躍步數，目標是大約抽樣 1000~1500 個點，確保效能順暢
  let step = Math.max(1, Math.floor(pixelCount / 1500));
  let sampledCount = 0;

  // 直接用 1D 陣列跑迴圈，避開高解析度螢幕 2D 座標計算的坑
  for (let i = 0; i < img.pixels.length; i += 4 * step) {
    let r = img.pixels[i];
    let g = img.pixels[i + 1];
    let b = img.pixels[i + 2];
    let a = img.pixels[i + 3]; // 抓取 Alpha 頻道

    // 【關鍵防呆】如果完全透明 (a=0)，代表是系統產生的無效像素，直接跳過，不當作黑色！
    if (a === 0) continue; 

    let hsb = rgbToHsb(r, g, b);
    let h = hsb[0];
    let s = hsb[1];
    let v = hsb[2];

    let hIdx = Math.floor(h / (360 / H_BINS));
    let sIdx = Math.floor(s / (101 / S_BINS));
    let vIdx = Math.floor(v / (101 / B_BINS));

    let key = `${hIdx}-${sIdx}-${vIdx}`;
    if (!counts[key]) {
      counts[key] = {
        h: hIdx * (360 / H_BINS) + (180 / H_BINS),
        s: sIdx * (100 / S_BINS) + (50 / S_BINS),
        b: vIdx * (100 / B_BINS) + (50 / B_BINS),
        count: 0
      };
    }
    counts[key].count++;
    sampledCount++; // 確實記錄了幾個「有效像素」
  }

  let sortedBins = Object.values(counts).sort((a, b) => b.count - a.count);

  // 計算比例時，分母改用實際「有效採樣數 (sampledCount)」
  return sortedBins.slice(0, 3).map(bin => ({
    h: bin.h,
    s: bin.s,
    b: bin.b,
    percent: ((bin.count / sampledCount) * 100).toFixed(1) 
  }));
}

// 效能優化用的輕量級轉換函式，避免大量呼叫 p5 的 color()
function rgbToHsb(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0; // 灰色調
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, v * 100];
}