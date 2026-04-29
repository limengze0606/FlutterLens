function drawInsectWings(g, insectType, seedValue, flapAngle, color1, color2, wingColorFillType, wingColorLineType) {
  g.push();
  resultCanvas.colorMode(HSB, 360, 100, 100);
  switch (insectType) {
    case 0:
      drawButterflyWings(g, seedValue, flapAngle, color1, color2, wingColorFillType, wingColorLineType);
      break;
    case 1:
      drawDragonflyWings(g, seedValue, flapAngle, color1, color2, wingColorFillType, wingColorLineType);
      break;
    case 2:
      drawMothWings(g, seedValue, flapAngle, color1, color2, wingColorFillType, wingColorLineType);
      break;
    default:
      drawButterflyWings(g, seedValue, flapAngle, color1, color2, wingColorFillType, wingColorLineType);
      break;
  }

  g.pop();
}

function drawButterflyWings(g, seedValue, flapAngle, color1, color2, wingColorFillType, wingColorLineType) {
  wingStyle = 0;
  drawWingPair(g, seedValue + 1, 10, flapAngle + PI/8, 0.65, color1, color2, wingColorFillType, wingColorLineType, wingStyle);
  drawWingPair(g, seedValue, 0, flapAngle, 1.0, color1, color2, wingColorFillType, wingColorLineType, wingStyle);
}

function drawDragonflyWings(g, seedValue, flapAngle, color1, color2, wingColorFillType, wingColorLineType) {
  wingStyle = 1;
  drawWingPair(g, seedValue + 1, -5, flapAngle * 0.6 + PI/12, 0.7, color1, color2, wingColorFillType, wingColorLineType, wingStyle);
  drawWingPair(g, seedValue, 5, flapAngle * 0.6 - PI/12, 0.7, color1, color2, wingColorFillType, wingColorLineType, wingStyle);
}

function drawMothWings(g, seedValue, flapAngle, color1, color2, wingColorFillType, wingColorLineType) {
  wingStyle = 0;
  drawWingPair(g, seedValue, 5, flapAngle * 0.8 + PI/10, 0.75, color1, color2, wingColorFillType, wingColorLineType, wingStyle);
}

function drawWingPair(g, seedValue, yOff, rot, s, color1, color2, wingColorFillType, wingColorLineType, wingStyle ) {
  // 右翅膀 (同步變換)
  g.push();
  g.translate(bodyHalfWidth, yOff);
  g.rotate(rot);
  g.scale(s);
  drawWing(g, seedValue, color1, color2, wingColorFillType, wingColorLineType, wingStyle);
  g.pop();

  // 左翅膀 (鏡像，同步變換)
  g.push();
  g.translate(-bodyHalfWidth, yOff);
  g.rotate(-rot);
  g.scale(-s, s);
  drawWing(g, seedValue, color1, color2, wingColorFillType, wingColorLineType, wingStyle);
  g.pop();
}

// 繪製單邊翅膀
function drawWing(g, seedValue, color1, color2, fillType, wingColorLineType, wingStyle) {
  if (seedValue !== undefined) {
    g.randomSeed(seedValue);
    g.noiseSeed(seedValue);
  }

  let wLength = g.random(g.width * 0.25, g.width * 0.5);
  let wWidth = g.random(g.width * 0.13, g.height * 0.5);
  let tipYOffset = g.random(-g.width * 0.13, g.height * 0.15);
  let noiseStrength = g.random(2, 10);

  let outline = generateWingOutline(wLength, wWidth, tipYOffset, noiseStrength, wingStyle);

  g.push(); 

  // 1. 主畫布設定裁切 (限制花紋不要畫出翅膀外)
  g.fill(250, 250, 250, 200); 
  g.noStroke();
  g.beginShape();
  for (let p of outline) g.vertex(p.x, p.y);
  g.endShape(g.CLOSE);
  g.drawingContext.clip();

  // 2. 繪製內部網格花紋
  drawVoronoiPattern(g, wLength, wWidth, tipYOffset, color1, color2, fillType, outline);

  g.pop(); 

  // 3. 補上最外層的輪廓
  drawGradualStroke(g, outline, wingColorLineType);
}

// 繪製 Voronoi 網格
function drawVoronoiPattern(g, wLength, wWidth, tipYOffset, color1, color2, fillType, outline) {
  let seedPoints = [];
  let strategyType = floor(g.random(3));

  switch (strategyType) {
    case 0: seedPoints = scatterUniform(g, wLength, wWidth, tipYOffset, outline); break;
    case 1: seedPoints = scatterSineDensity(g, wLength, wWidth, tipYOffset, outline); break;
    case 2: seedPoints = scatterJitteredGrid(g, wLength, wWidth, tipYOffset, outline); break;
  }

  if (seedPoints.length > 0) {
    const delaunay = d3.Delaunay.from(seedPoints);
    const voronoi = delaunay.voronoi([0, -wWidth * 2, wLength + 50, wWidth * 2]);

    for (let i = 0; i < seedPoints.length; i++) {
      let polygon = voronoi.cellPolygon(i);
      if (polygon) {
        let cellX = seedPoints[i][0];
        let cellY = seedPoints[i][1];
        let progress = g.constrain(cellX / wLength, 0, 1); 

        // 取得動態混色
        let fillCol = getVoronoiFillColor(g, progress, fillType, cellX, cellY, color1, color2);

        // 網格的框線統一使用半透明的白色，視覺上最百搭
        g.stroke(255, 180); 
        g.strokeWeight(1);
        g.fill(fillCol);

        g.beginShape();
        for (let pt of polygon) g.vertex(pt[0], pt[1]); 
        g.endShape(g.CLOSE);
      }
    }
  }
}

function getVoronoiFillColor(g, progress, fillType, cellX, cellY, color1, color2) {
  let c;
  // 複製顏色物件以避免修改到全域變數
  let c1 = g.color(color1.h_adj, color1.s_adj, color1.b_adj);
  let c2 = g.color(color2.h_adj, color2.s_adj, color2.b_adj);

  switch (fillType) {
    case 0: 
      // 策略 0：雲霧狀雜訊混合 (原本是粉紅配青色)
      let n = g.noise(cellX * 0.015, cellY * 0.015);
      c1.setAlpha(130); 
      c2.setAlpha(130);
      c = g.lerpColor(c1, c2, n);
      break;
      
    case 1: 
      // 策略 1：從翅膀根部向外發光的漸層 (原本是深藍配亮青)
      c1.setAlpha(180); // 核心色 (第一主色)
      c2.setAlpha(200); // 邊緣色 (第二主色)
      c = g.lerpColor(c2, c1, 1.0 - g.pow(progress, 0.6));
      break;
      
    case 2: 
      // 策略 2：從實色漸漸變透明消失 (原本是琥珀色配透明)
      c1.setAlpha(220); 
      c2.setAlpha(0);   // 將第二主色的透明度設為 0，達到漸隱效果
      c = g.lerpColor(c1, c2, progress * 1.5); 
      break;
  }
  return c;
}

function drawGradualStroke(g, outline, LineColorType) {
  let firstPoint = outline[0];
  let lastPoint = outline[outline.length - 1];
  let firstColor, lastColor, firstSW, lastSW;

  for (let i = 0; i < outline.length - 1; i++) {
    let p1 = outline[i];
    let p2 = outline[i + 1];
    let rawProgress = i / outline.length;
    let strokeCol;

    if (LineColorType === 0) strokeCol = getSimpleLerpColor(g, rawProgress, "#281E50", "#cae9f9");
    else strokeCol = getNMMColor(g, rawProgress, LineColorType);

    let weightPivot = 0.95;
    let wProgress = (rawProgress < weightPivot) ? g.map(rawProgress, 0, weightPivot, 0, 1) : g.map(rawProgress, weightPivot, 1, 1, 0);
    let sw = g.map(wProgress, 0, 1, 3, 0.7);

    if (i === 0) { firstColor = strokeCol; firstSW = sw; }
    if (i === outline.length - 2) { lastColor = strokeCol; lastSW = sw; }

    g.stroke(strokeCol);
    g.strokeWeight(sw);
    g.line(p1.x, p1.y, p2.x, p2.y);
  }

  let bridgeColor = g.lerpColor(lastColor, firstColor, 0.5);
  let bridgeSW = (lastSW + firstSW) / 2;

  g.stroke(bridgeColor);
  g.strokeWeight(bridgeSW);
  g.line(lastPoint.x, lastPoint.y, firstPoint.x, firstPoint.y);
}

function isPointInPolygon(px, py, poly) {
  let isInside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    let p1 = poly[i];
    let p2 = poly[j];
    let intersect = ((p1.y > py) !== (p2.y > py)) &&
                    (px < (p2.x - p1.x) * (py - p1.y) / (p2.y - p1.y) + p1.x);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}


function generateWingOutline(len, wid, tipY, noiseMax, wingStyle = 0) {
  let points = [];
  let resolution = 150; 
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

  for (let i = 0; i <= resolution; i++) {
    let t = i / resolution;
    let x = bezierPoint(l_x1, l_cx1, l_cx2, l_x2, t);
    let y = bezierPoint(l_y1, l_cy1, l_cy2, l_y2, t);
    let fade = sin(t * PI); 
    let currentNoiseMax = (wingStyle === 1) ? noiseMax * 0.3 : noiseMax;
    let n = map(noise(x * 0.01, y * 0.01), 0, 1, -currentNoiseMax * 0.5, currentNoiseMax * 0.5) * fade;
    points.push(createVector(x, y + n));
  }

  for (let i = 1; i < resolution; i++) { 
    let t = i / resolution;
    let x = bezierPoint(t_x1, t_cx1, t_cx2, t_x2, t);
    let y = bezierPoint(t_y1, t_cy1, t_cy2, t_y2, t);
    let fade = sin(t * PI);
    let currentNoiseMax = (wingStyle === 1) ? noiseMax * 0.8 : noiseMax;
    let n = map(noise(x * 0.03, y * 0.03 + 1000), 0, 1, -currentNoiseMax * 2, currentNoiseMax * 1.5) * fade;
    points.push(createVector(x + n * 0.5, y + n)); 
  }
  return points;
}

function scatterUniform(g, wLength, wWidth, tipYOffset, outline) {
  let pts = [];
  let numPoints = wLength * 1.5; 
  for (let i = 0; i < numPoints; i++) {
    let px = g.random(0, wLength + 50); 
    let py = g.random(-wWidth * 1.5, tipYOffset + wWidth * 1.5);
    if (isPointInPolygon(px, py, outline)) pts.push([px, py]); 
  }
  return pts;
}

function scatterSineDensity(g, wLength, wWidth, tipYOffset, outline) {
  let pts = [];
  let numPointsToTry = floor(g.random(500, 3000)); 
  let frequency = g.random(0.01, 0.08);
  let phaseOffset = g.random(0, TWO_PI);
  let minProb = g.random(0.0, 0.15); 
  let maxProb = g.random(0.6, 1.0);  
  let waveType = floor(g.random(2));

  for (let i = 0; i < numPointsToTry; i++) {
    let px = g.random(0, wLength + 50); 
    let py = g.random(-wWidth * 1.5, tipYOffset + wWidth * 1.5);
    if (isPointInPolygon(px, py, outline)) {
      let waveValue = 0;
      if (waveType === 0) waveValue = sin(px * frequency + phaseOffset); 
      else waveValue = sin(dist(0, 0, px, py) * frequency * 0.8 + phaseOffset); 
      
      if (g.random() < map(waveValue, -1, 1, minProb, maxProb)) pts.push([px, py]); 
    }
  }
  return pts;
}

function scatterJitteredGrid(g, wLength, wWidth, tipYOffset, outline) {
  let pts = [];
  let uStep = 10;  
  let vStep = 40; 
  let angle = atan2(tipYOffset, wLength);
  let totalLength = dist(0, 0, wLength, tipYOffset);
  
  for (let u = -50; u < totalLength + 50; u += uStep) {
    for (let v = -wWidth * 2; v < wWidth * 2; v += vStep) {
      let finalU = u + g.random(-uStep * 0.3, uStep * 0.3);
      let finalV = v + g.random(-vStep * 0.4, vStep * 0.4);
      let finalX = finalU * cos(angle) - finalV * sin(angle);
      let finalY = finalU * sin(angle) + finalV * cos(angle);

      if (isPointInPolygon(finalX, finalY, outline)) pts.push([finalX, finalY]); 
    }
  }
  return pts;
}


function getSimpleLerpColor(g, p, c1, c2) {
  let colorPivot = 0.7;  
  let n = g.noise(p * 10) * 0.3;
  let cProgress = (p < colorPivot) ? g.map(p, 0, colorPivot, 0, 1) : g.map(p, colorPivot, 1, 1, 0);
  return g.lerpColor(g.color(c1), g.color(c2), g.constrain(cProgress + n, 0, 1));
}

function getNMMColor(g, p, nmmColorSet) {
  let baseColor, midColor, highlightColor; 
  let peakHighlight = g.color("#FFFFFF"); 

  switch (nmmColorSet){
    case 0:
      baseColor = g.color("#222423"); midColor = g.color("#6D6F6E"); highlightColor = g.color("#C7C7C7"); break;
    case 1:
      baseColor = g.color("#6c5626"); midColor = g.color("#bd9b50"); highlightColor = g.color("#F2DFBA"); break;
  }

  let noiseVal = g.noise(p * 20); 
  let shineFactor = g.pow(noiseVal, 2);
  let finalC;
  let peakThreshold = 0.85; 

  if (shineFactor < 0.3) {
    finalC = g.lerpColor(baseColor, midColor, shineFactor * 2);
  } else if (shineFactor < peakThreshold) {
    finalC = g.lerpColor(midColor, highlightColor, g.map(shineFactor, 0.3, peakThreshold, 0, 1));
  } else {
    finalC = g.lerpColor(highlightColor, peakHighlight, g.map(shineFactor, peakThreshold, 1.0, 0, 1));
  }
  return finalC;
}

function applySimpleVoronoiStyle(g, progress, fillCol) {
  let strokeCol = getSimpleLerpColor(g, progress, "#281E50", "#80a9be");
  strokeCol.setAlpha(180); 
  g.stroke(strokeCol); g.fill(fillCol);
}

function applyNMMVoronoiStyle(g, progress, colorSet, fillCol) {
  let strokeCol = getNMMColor(g, progress, colorSet);
  strokeCol.setAlpha(200); 
  g.stroke(strokeCol); g.fill(fillCol);
}