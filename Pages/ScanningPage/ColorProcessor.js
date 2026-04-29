// ====== 色彩分桶設定 ======
const H_BINS = 15;
const S_BINS = 7;
const B_BINS = 7;

let lastTopKeys = []; 

// 新增：遲滯閾值 (Hysteresis Threshold)
// 比如設定為 0.08，代表新顏色必須比舊顏色「多出總像素的 8%」才能篡位
const THRESHOLD_BONUS = 0.08;


function analyzeColors() {
  // 直接從畫布擷取中央區域 (最符合肉眼看到的範圍)
  let img = get(scanArea.x, scanArea.y, scanArea.w, scanArea.h);
  // 呼叫 ColorProcessor.js 中的函式
  topColors = getTopColors(img);
}

function getTopColors(img) {
  img.loadPixels();
  let counts = {};
  let pixelCount = img.pixels.length / 4; 
  if (pixelCount === 0) return [];

  let step = Math.max(1, Math.floor(pixelCount / 300));
  let sampledCount = 0;

  for (let i = 0; i < img.pixels.length; i += 4 * step) {
    let r = img.pixels[i];
    let g = img.pixels[i + 1];
    let b = img.pixels[i + 2];
    let a = img.pixels[i + 3]; 

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
        key: key, // 把 key 存進物件裡方便後續使用
        h: hIdx * (360 / H_BINS) + (180 / H_BINS),
        s: sIdx * (100 / S_BINS) + (50 / S_BINS),
        b: vIdx * (100 / B_BINS) + (50 / B_BINS),
        count: 0
      };
    }
    counts[key].count++;
    sampledCount++;
  }

  // ==== 遲滯邏輯核心：計算「排序用分數 (sortScore)」 ====
  let bonusAmount = sampledCount * THRESHOLD_BONUS; // 換算成具體的像素數量加成

  Object.values(counts).forEach(bin => {
    // 如果這個顏色是上一輪的前三名 (衛冕者)，給它加上優勢分數
    if (lastTopKeys.includes(bin.key)) {
      bin.sortScore = bin.count + bonusAmount;
    } else {
      // 挑戰者只有真實的數量
      bin.sortScore = bin.count; 
    }
  });

  // 用「加成過的分數 (sortScore)」來決定排名，而不是真實數量
  let sortedBins = Object.values(counts).sort((a, b) => b.sortScore - a.sortScore);

  // 取出前三名
  let top3 = sortedBins.slice(0, 3);
  
  // 更新記憶：把這回合前三名的 Key 存起來，留給下一回合用
  lastTopKeys = top3.map(bin => bin.key);

  // 回傳時，依然使用「真實的 count」來計算顯示在 UI 上的百分比
  return top3.map(bin => {
    // 在這裡先計算好調整後的數值
    let displayS = Math.min(100, bin.s * 1.3); 
    let displayB = Math.min(100, bin.b * 1.1);

    return {
      // 原始資料 (供邏輯運算使用)
      h: bin.h,
      s: bin.s,
      b: bin.b,
      
      // 調整後資料 (供視覺呈現與結果生成使用)
      h_adj: bin.h,
      s_adj: displayS,
      b_adj: displayB,
      
      percent: ((bin.count / sampledCount) * 100).toFixed(1) 
    };
  });
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