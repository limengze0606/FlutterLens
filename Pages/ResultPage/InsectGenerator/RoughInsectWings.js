function drawRoughInsectWings(g, insectType, seedValue, flapAngle, color1, color2) {
  g.push();
  g.colorMode(HSB, 360, 100, 100, 255);
  
  // 這裡可以根據 insectType 呼叫對應的 drawRoughButterflyWings 等等...
  // 為了示範，我們先直接寫核心的 WingPair 邏輯
  let wingStyle = (insectType === 1) ? 1 : 0; 
  drawRoughWingPair(g, seedValue, 0.5 * insectBaseUnit, flapAngle, 1.0, color1, color2, wingStyle);

  g.pop();
}

function drawRoughWingPair(g, seedValue, yOff, rot, s, color1, color2, wingStyle) {
  g.push();
  g.translate(bodyHalfWidth, yOff); g.rotate(rot); g.scale(s);
  drawRoughWing(g, seedValue, color1, color2, wingStyle);
  g.pop();

  g.push();
  g.translate(-bodyHalfWidth, yOff); g.rotate(-rot); g.scale(-s, s);
  drawRoughWing(g, seedValue, color1, color2, wingStyle);
  g.pop();
}

// 全新的單邊手繪翅膀
// 全新的單邊手繪翅膀
function drawRoughWing(g, seedValue, color1, color2, wingStyle) {
  if (seedValue !== undefined) {
    g.randomSeed(seedValue);
    g.noiseSeed(seedValue);
  }

  // 取得基礎尺寸 (與原本邏輯相同)
  let screenMax = max(width, height);
  let screenMin = min(width, height);
  let wingBaseLen = (screenMax * 0.15 + screenMin * 0.4) * 0.01;
  let wLength = g.random(15 * wingBaseLen, 30 * wingBaseLen); 
  let wWidth = g.random(8 * insectBaseUnit, 22 * insectBaseUnit);
  let tipYOffset = g.random(-8 * insectBaseUnit, 8 * insectBaseUnit);
  let noiseStrength = g.random(2, 10);

  // ==========================================
  // 1. 生成【基礎輪廓】：用來限制 Voronoi 網格不要畫出界
  // ==========================================
  let baseOutline = generateWingOutline(wLength, wWidth, tipYOffset, noiseStrength, wingStyle);

  g.push(); 
  // 設定裁切 (使用原本沒有被隨機彎曲的基礎邊界)
  g.fill(0, 0, 98, 200);
  g.noStroke();
  //g.beginShape();
  //for (let p of baseOutline) g.vertex(p.x, p.y);
  //g.endShape(g.CLOSE);
  g.drawingContext.clip();

  // (這裡未來會放你的 Voronoi 繪製邏輯)
  // drawVoronoiPattern(g, wLength, wWidth, tipYOffset, color1, color2, fillType, baseOutline);

  g.pop(); 

  // ==========================================
  // 2. 生成並繪製【手繪彎曲輪廓】 (Multi-stroke)
  // ==========================================
  let strokeCount = 2; // 畫兩次
  let inkColor = g.color(0, 0, 255, 220);
  
  for (let s = 0; s < strokeCount; s++) {
    // 【關鍵】：每次迴圈，我們都重新呼叫函式，這會生成「控制點完全不同」的全新曲線！
    let bowedOutline = generateBowedWingOutline(g, wLength, wWidth, tipYOffset, noiseStrength, wingStyle);
    
    // 直接用最簡單平滑的方式畫出這條全新的線
    drawSimpleSmoothLine(g, bowedOutline, inkColor, 1.5);
  }
}

/**
 * 輔助函式：用極度平滑的方式畫出一組點陣列
 */
function drawSimpleSmoothLine(g, points, col, wt) {
  g.noFill();
  g.stroke(col);
  g.strokeWeight(wt);
  g.beginShape();
  
  // 手繪不完美閉合 (隨機丟棄頭尾幾點)
  let startIdx = g.floor(g.random(0, 4));
  let endIdx = points.length - g.floor(g.random(0, 4));

  if (endIdx - startIdx > 3) {
    g.curveVertex(points[startIdx].x, points[startIdx].y);
    for (let i = startIdx; i < endIdx; i++) {
      g.curveVertex(points[i].x, points[i].y);
    }
    g.curveVertex(points[endIdx - 1].x, points[endIdx - 1].y);
  }
  g.endShape();
}

/**
 * 生成帶有「真實控制點彎曲 (Bowing)」的手繪翅膀輪廓
 */
function generateBowedWingOutline(g, len, wid, tipY, noiseMax, wingStyle = 0) {
  let points = [];
  let resolution = 100; // 手繪線不需要切太細
  
  // 原本的控制點宣告
  let l_x1, l_y1, l_cx1, l_cy1, l_cx2, l_cy2, l_x2, l_y2;
  let t_x1, t_y1, t_cx1, t_cy1, t_cx2, t_cy2, t_x2, t_y2;

  // 1. 取得基礎控制點位置
  switch (wingStyle) {
    case 0: 
      l_x1 = 0;           l_y1 = 0;              
      l_cx1 = len * 0.3;  l_cy1 = -wid * 0.15;   
      l_cx2 = len * 0.7;  l_cy2 = tipY - wid * 0.1; 
      l_x2 = len;         l_y2 = tipY;           
      t_x1 = len;         t_y1 = tipY;           
      t_cx1 = len * 0.8;  t_cy1 = wid * 0.8;     
      t_cx2 = len * 0.3;  t_cy2 = wid * 1.2;     
      t_x2 = 0;           t_y2 = 0;              
      break;
    case 1: 
      // ... (省略蜻蜓翅膀的基礎設定，和原本相同)
      l_x1 = 0;           l_y1 = 0;              
      l_cx1 = len * 0.4;  l_cy1 = -wid * 0.05;      
      l_cx2 = len * 0.95; l_cy2 = tipY - wid * 0.25; 
      l_x2 = len;         l_y2 = tipY;           
      t_x1 = len;         t_y1 = tipY;           
      t_cx1 = len * 0.95; t_cy1 = tipY + wid * 0.25; 
      t_cx2 = len * 0.5;  t_cy2 = wid * 0.5;         
      t_x2 = 0;           t_y2 = 0;   
      break;
  }

  // 【核心精神：真實的 Bowing 彎曲效果】
  // 我們在這裡針對「控制點」進行隨機的大幅推移！
  // 這樣算出來的貝茲曲線，曲率會從根本上發生改變，這才是真正的 Rough.js 精神！
  let bowLevel = len * 0.08; // 允許彎曲的幅度 (與翅膀長度成正比)
  
  l_cx1 += g.random(-bowLevel, bowLevel);
  l_cy1 += g.random(-bowLevel, bowLevel);
  l_cx2 += g.random(-bowLevel, bowLevel);
  l_cy2 += g.random(-bowLevel, bowLevel);
  
  t_cx1 += g.random(-bowLevel, bowLevel);
  t_cy1 += g.random(-bowLevel, bowLevel);
  t_cx2 += g.random(-bowLevel, bowLevel);
  t_cy2 += g.random(-bowLevel, bowLevel);

  // 2. 利用被「弄歪」的控制點來計算真正的軌跡點
  // 上半部邊緣 (前緣)
  for (let i = 0; i <= resolution; i++) {
    let t = i / resolution;
    let x = g.bezierPoint(l_x1, l_cx1, l_cx2, l_x2, t);
    let y = g.bezierPoint(l_y1, l_cy1, l_cy2, l_y2, t);
    points.push({x: x, y: y});
  }

  // 下半部邊緣 (後緣)
  for (let i = 1; i < resolution; i++) { 
    let t = i / resolution;
    let x = g.bezierPoint(t_x1, t_cx1, t_cx2, t_x2, t);
    let y = g.bezierPoint(t_y1, t_cy1, t_cy2, t_y2, t);
    // (可選擇保留一點點 noise 模擬紙張粗糙度，這裡我先拿掉，突顯純粹的 Bowing 效果)
    points.push({x: x, y: y}); 
  }
  
  return points;
}