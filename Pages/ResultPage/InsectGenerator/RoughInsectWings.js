function setRoughSeed(g, seedValue) {
  if (seedValue === undefined) return;

  if (typeof brush !== "undefined") {
    if (typeof brush.seed === "function") brush.seed(seedValue);
    if (typeof brush.noiseSeed === "function") brush.noiseSeed(seedValue);
  }

  let isGlobalTarget = g === window || g === globalThis;

  if (isGlobalTarget && typeof randomSeed === "function") {
    randomSeed(seedValue);
  } else if (!isGlobalTarget && g && typeof g.randomSeed === "function") {
    g.randomSeed(seedValue);
  } else if (g && !isGlobalTarget) {
    g.randomSeed = seedValue;
  }

  if (isGlobalTarget && typeof noiseSeed === "function") {
    noiseSeed(seedValue);
  } else if (!isGlobalTarget && g && typeof g.noiseSeed === "function") {
    g.noiseSeed(seedValue);
  } else if (g && !isGlobalTarget) {
    g.noiseSeed = seedValue;
  }
}

function roughRandom(g, minValue, maxValue) {
  return g && typeof g.random === "function"
    ? g.random(minValue, maxValue)
    : random(minValue, maxValue);
}

function drawRoughInsectWings(g, insectType, seedValue, flapAngle, color1, color2) {
  g.push();
  g.colorMode(HSB, 360, 100, 100, 255);
  
  // 這裡可以根據 insectType 呼叫對應的 drawRoughButterflyWings 等等...
  // 為了示範，我們先直接寫核心的 WingPair 邏輯
  let wingStyle = (insectType === 1) ? 1 : 0; 
  drawRoughWingPair(g, seedValue, 0.5 * insectBaseUnit, flapAngle, 1.0, color1, color2, wingStyle);

  g.pop();
}

/**
 * 繪製一對手繪翅膀 (確保大結構對稱，但筆觸獨立)
 */
function drawRoughWingPair(g, seedValue, yOff, rot, s, color1, color2, wingStyle) {
  // 1. 先用原本的 seedValue 設定隨機種子，確保每次生成的「整體尺寸」固定不變
  setRoughSeed(g, seedValue);

  // 2. 在這裡統一把「大輪廓的基礎參數」算好
  let screenMax = max(width, height);
  let screenMin = min(width, height);
  let wingBaseLen = (screenMax * 0.15 + screenMin * 0.4) * 0.01;
  
  // 建立一個參數包，保證左右翅膀的基底長得一模一樣
  let wingParams = {
    length: roughRandom(g, 15 * wingBaseLen, 30 * wingBaseLen),
    width: roughRandom(g, 8 * insectBaseUnit, 22 * insectBaseUnit),
    tipY: roughRandom(g, -8 * insectBaseUnit, 8 * insectBaseUnit),
    noiseStrength: roughRandom(g, 2, 10)
  };

  // 3. 畫右翅膀 (使用原始種子)
  g.push();
  g.translate(bodyHalfWidth, yOff); 
  g.rotate(rot); 
  g.scale(s);
  drawRoughWing(g, seedValue, color1, color2, wingStyle, wingParams);
  g.pop();

  // 4. 畫左翅膀 (給予一個截然不同的種子，打破筆觸的鏡像對稱！)
  g.push();
  g.translate(-bodyHalfWidth, yOff); 
  g.rotate(-rot); 
  g.scale(-s, s);
  // 【關鍵】：把 seedValue 加上一個大數字，讓它的隨機軌跡完全改變
  drawRoughWing(g, seedValue + 9999, color1, color2, wingStyle, wingParams);
  g.pop();
}

/**
 * 全新的單邊手繪翅膀 (接收預先算好的輪廓參數)
 */
// 【修改點】：新增 wingParams 參數
function drawRoughWing(g, strokeSeed, color1, color2, wingStyle, params) {
  // 這裡設定的種子，只會影響接下來「手繪線條」的偏移跟彎曲
  setRoughSeed(g, strokeSeed);

  // 直接取出左右共通的大輪廓參數，不重新 randomize
  let wLength = params.length;
  let wWidth = params.width;
  let tipYOffset = params.tipY;
  let noiseStrength = params.noiseStrength;

  // ==========================================
  // 1. 生成【基礎輪廓】：用來限制 Voronoi 網格不要畫出界
  // ==========================================
  let baseOutline = generateWingOutline(wLength, wWidth, tipYOffset, noiseStrength, wingStyle);

  g.push(); 
  g.fill(0, 0, 98, 200);
  g.noStroke();
  
  // (如果你想把底色畫出來，可以解除這段註解，但改成用 baseOutline 畫)
  // g.beginShape();
  // for (let p of baseOutline) g.vertex(p.x, p.y);
  // g.endShape(g.CLOSE);
  
  //g.drawingContext.clip();

  // (這裡未來會放你的 Voronoi 繪製邏輯)

  g.pop(); 

  // ==========================================
  // 2. 生成並繪製【手繪彎曲輪廓】 (Multi-stroke)
  // ==========================================
  let strokeCount = 2; // 畫兩次

  for (let s = 0; s < strokeCount; s++) {
    // 因為左翅膀跟右翅膀的 strokeSeed 已經不同了，這裡算出來的彎曲與錯位會完全不一樣！
    let bowedEdges = generateBowedWingOutline(g, wLength, wWidth, tipYOffset, noiseStrength, wingStyle);
    
    // 將上緣和下緣完全分開畫，並帶有不同的延伸倍率
    drawEdgeWithOvershoot(g, bowedEdges.top, s);
    drawEdgeWithOvershoot(g, bowedEdges.bottom, s);
  }
}

/**
 * 輔助函式：使用 p5.brush 畫出一組點，並帶有甩筆長度與材質
 */
function drawEdgeWithOvershoot(g, points, strokeIndex = 0) {
  if (!points || points.length < 5) return;

  // 1. 算出甩筆的延伸倍率與座標 (保留原本的邏輯)
  let minMultiplier, maxMultiplier;
  if (strokeIndex === 0) {
    minMultiplier = -0.2;
    maxMultiplier = 0.2;
  } else {
    minMultiplier = 0.1;
    maxMultiplier = 0.3; 
  }
  
  let p0 = points[0];
  let p1 = points[3]; 
  let startOvershootX = p0.x + (p0.x - p1.x) * roughRandom(g, minMultiplier, maxMultiplier);
  let startOvershootY = p0.y + (p0.y - p1.y) * roughRandom(g, minMultiplier, maxMultiplier);

  let pLast = points[points.length - 1];
  let pPrev = points[points.length - 4];
  let endOvershootX = pLast.x + (pLast.x - pPrev.x) * roughRandom(g, minMultiplier, maxMultiplier);
  let endOvershootY = pLast.y + (pLast.y - pPrev.y) * roughRandom(g, minMultiplier, maxMultiplier);

  // 設定顏色與粗細 (p5.brush 通常吃 Hex 字串)
  brush.set("pencil1", "#FFFFFF");

  // 3. 繪製手繪曲線路徑
  brush.beginShape();
  
  // 起點延伸
  brush.vertex(startOvershootX, startOvershootY);
  
  // 畫出主體點位
  for (let i = 0; i < points.length; i++) {
    brush.vertex(points[i].x, points[i].y);
  }
  
  // 終點延伸
  brush.vertex(endOvershootX, endOvershootY);
  
  brush.endShape();
}

/**
 * 生成帶有「控制點彎曲」與「端點錯位」的手繪翅膀輪廓
 */
function generateBowedWingOutline(g, len, wid, tipY, noiseMax, wingStyle = 0) {
  let topPoints = [];
  let bottomPoints = [];
  let resolution = 100; 
  
  // 1. 取得基礎錨點與控制點位置
  let l_x1, l_y1, l_cx1, l_cy1, l_cx2, l_cy2, l_x2, l_y2;
  let t_x1, t_y1, t_cx1, t_cy1, t_cx2, t_cy2, t_x2, t_y2;

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

  // 【核心修正 1：端點偏移 (Anchor Offset)】
  // 讓每次下筆的「起點」和「終點」都不一樣，徹底打破釘死的交會點！
  let anchorOffset = len * 0.04; 
  l_x1 += roughRandom(g, -anchorOffset, anchorOffset);
  l_y1 += roughRandom(g, -anchorOffset, anchorOffset);
  l_x2 += roughRandom(g, -anchorOffset, anchorOffset);
  l_y2 += roughRandom(g, -anchorOffset, anchorOffset);
  t_x1 += roughRandom(g, -anchorOffset, anchorOffset);
  t_y1 += roughRandom(g, -anchorOffset, anchorOffset);
  t_x2 += roughRandom(g, -anchorOffset, anchorOffset);
  t_y2 += roughRandom(g, -anchorOffset, anchorOffset);

  // 【維持：全局控制點偏移 (Global Bowing)】
  let bowLevel = len * 0.03; 
  l_cx1 += roughRandom(g, -bowLevel, bowLevel);
  l_cy1 += roughRandom(g, -bowLevel, bowLevel);
  l_cx2 += roughRandom(g, -bowLevel, bowLevel);
  l_cy2 += roughRandom(g, -bowLevel, bowLevel);
  t_cx1 += roughRandom(g, -bowLevel, bowLevel);
  t_cy1 += roughRandom(g, -bowLevel, bowLevel);
  t_cx2 += roughRandom(g, -bowLevel, bowLevel);
  t_cy2 += roughRandom(g, -bowLevel, bowLevel);

  // 2. 計算點位
  for (let i = 0; i <= resolution; i++) {
    let t = i / resolution;
    topPoints.push({
      x: g.bezierPoint(l_x1, l_cx1, l_cx2, l_x2, t),
      y: g.bezierPoint(l_y1, l_cy1, l_cy2, l_y2, t)
    });
  }

  for (let i = 0; i <= resolution; i++) { 
    let t = i / resolution;
    bottomPoints.push({
      x: g.bezierPoint(t_x1, t_cx1, t_cx2, t_x2, t),
      y: g.bezierPoint(t_y1, t_cy1, t_cy2, t_y2, t)
    });
  }

  // 3. 【新增核心邏輯】局部平滑彎曲函式
  function applyLocalBends(pts, numBends) {
    for (let b = 0; b < numBends; b++) {
      // 隨機在線段「中間區域」(10% ~ 90%) 挑選一個中心點，避免破壞翅膀頭尾連接處
      let centerIdx = floor(roughRandom(g, pts.length * 0.1, pts.length * 0.9));

      // 決定這個彎曲的「方向」和「力度」
      let maxDist = roughRandom(g, len * 0.02, len * 0.05); // 最大偏移像素
      let angle = roughRandom(g, g.TWO_PI); 
      let dx = g.cos(angle) * maxDist;
      let dy = g.sin(angle) * maxDist;

      // 決定彎曲的「影響範圍」(Radius)
      let affectRadius = roughRandom(g, 10, 25); 

      // 遍歷所有點，依據距離施加偏移
      for (let i = 0; i < pts.length; i++) {
        let dist = abs(i - centerIdx);
        
        // 為了效能，只處理在影響範圍 3 倍以內的點
        if (dist < affectRadius * 3) {
          // 使用高斯常態分佈衰減，製造平滑的彎曲過渡
          let falloff = exp(-(dist * dist) / (2 * affectRadius * affectRadius));
          pts[i].x += dx * falloff;
          pts[i].y += dy * falloff;
        }
      }
    }
  }

  // 4. 對上緣和下緣分別施加 1 到 3 次的局部彎曲
  applyLocalBends(topPoints, floor(roughRandom(g, 1, 4)));
  applyLocalBends(bottomPoints, floor(roughRandom(g, 1, 4)));

  // 【核心修正 2：不合併陣列，拆開回傳】
  // 我們將上下緣作為物件的兩個屬性回傳，方便後續畫出獨立的交叉點
  return { top: topPoints, bottom: bottomPoints };
}
