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

function drawRoughInsectWings(g, insectType, seedValue, flapAngle, color1, color2, wingColorFillType = 0, wingColorLineType = 0) {
  g.push();
  g.colorMode(HSB, 360, 100, 100, 255);
  
  let wingStyle = (insectType === 1) ? 1 : 0; 
  drawRoughWingPair(g, seedValue, 0.5 * insectBaseUnit, flapAngle, 1.0, color1, color2, wingStyle, wingColorFillType, wingColorLineType);

  g.pop(); 
}

/**
 * 繪製一對手繪翅膀 (確保大結構對稱，但筆觸獨立)
 */
function drawRoughWingPair(g, seedValue, yOff, rot, s, color1, color2, wingStyle, fillType, wingColorLineType) {
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
  let baseOutline = generateWingOutline(wingParams.length, wingParams.width, wingParams.tipY, wingParams.noiseStrength, wingStyle);
  let roughPattern = createRoughVoronoiPattern(g, wingParams.length, wingParams.width, wingParams.tipY, baseOutline);

  // 3. 畫右翅膀 (使用原始種子)
  g.push();
  g.translate(bodyHalfWidth, yOff); 
  g.rotate(rot); 
  g.scale(s);
  drawRoughWing(g, seedValue, color1, color2, wingStyle, wingParams, fillType, wingColorLineType, baseOutline, roughPattern);
  g.pop();

  // 4. 畫左翅膀 (給予一個截然不同的種子，打破筆觸的鏡像對稱！)
  g.push();
  g.translate(-bodyHalfWidth, yOff); 
  g.rotate(-rot); 
  g.scale(-s, s);
  // 【關鍵】：把 seedValue 加上一個大數字，讓它的隨機軌跡完全改變
  drawRoughWing(g, seedValue + 9999, color1, color2, wingStyle, wingParams, fillType, wingColorLineType, baseOutline, roughPattern);
  g.pop();
}

/**
 * 全新的單邊手繪翅膀 (接收預先算好的輪廓參數)
 */
// 【修改點】：新增 wingParams 參數
function drawRoughWing(g, strokeSeed, color1, color2, wingStyle, params, fillType, wingColorLineType, baseOutline, roughPattern) {
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
  g.push(); 
  g.fill(0, 0, 98, 110);
  g.noStroke();
  
  // (如果你想把底色畫出來，可以解除這段註解，但改成用 baseOutline 畫)
  g.beginShape();
  for (let p of baseOutline) g.vertex(p.x, p.y);
  g.endShape(g.CLOSE);
  
  if (g.drawingContext && typeof g.drawingContext.clip === "function") {
    g.drawingContext.clip();
  }
  //drawRoughWatercolorWash(g, wLength, wWidth, tipYOffset, color1, color2, baseOutline);
  drawRoughVoronoiPattern(g, wLength, roughPattern, wingColorLineType, baseOutline);

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
  brush.set("pencil1", "#181817");
  brush.strokeWeight(strokeIndex === 0 ? 1.1 : 0.6);

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

function drawRoughWatercolorWash(g, wLength, wWidth, tipYOffset, color1, color2, outline) {
  if (typeof brush === "undefined" || !outline || outline.length < 3) return;

  resetRoughBrushFillState();

  let basePaint = colorToBrushPaint(g.color(54, 16, 96, 90), 90);
  brush.noStroke();
  brush.fillBleed(0.14, "in");
  brush.fillTexture(0.78, 0.22, true);
  brush.fill(basePaint.color, basePaint.alpha);
  drawBrushPolygon(outlineToBrushPoints(outline));

  let palette = getRoughWatercolorPalette(g, color1, color2);
  let washCount = floor(roughRandom(g, 16, 24));

  brush.fillBleed(0.22, "out");
  brush.fillTexture(0.92, 0.24, true);

  for (let i = 0; i < washCount; i++) {
    let center = pickPointInOutline(g, wLength, wWidth, tipYOffset, outline);
    if (!center) continue;

    let blob = makeWatercolorBlob(g, center.x, center.y, roughRandom(g, wLength * 0.07, wLength * 0.17), roughRandom(g, 9, 15));
    let visibleBlob = constrainBlobToOutline(blob, center, outline);
    if (!visibleBlob || visibleBlob.length < 3) continue;

    let paint = palette[floor(roughRandom(g, 0, palette.length))];
    brush.noStroke();
    brush.fill(paint.color, paint.alpha);
    drawBrushPolygon(visibleBlob);
  }

  brush.noFill();
  if (typeof brush.noWash === "function") brush.noWash();
}

function createRoughVoronoiPattern(g, wLength, wWidth, tipYOffset, outline) {
  let seedPoints = [];
  //let strategyType = floor(roughRandom(g, 0, 3));
  let strategyType = 0;

  switch (strategyType) {
    case 0: seedPoints = scatterUniform(g, wLength, wWidth, tipYOffset, outline); break;
    case 1: seedPoints = scatterSineDensity(g, wLength, wWidth, tipYOffset, outline); break;
    case 2: seedPoints = scatterJitteredGrid(g, wLength, wWidth, tipYOffset, outline); break;
  }

  if (seedPoints.length <= 0) return [];

  const delaunay = d3.Delaunay.from(seedPoints);
  const voronoi = delaunay.voronoi([0, -wWidth * 2, wLength + 50, wWidth * 2]);
  let lineMap = new Map();

  for (let i = 0; i < seedPoints.length; i++) {
    let polygon = voronoi.cellPolygon(i);
    if (!polygon || polygon.length < 3) continue;
    let center = { x: seedPoints[i][0], y: seedPoints[i][1] };
    let clippedPolygon = clipPolygonToOutline(polygon, outline);
    let visiblePolygon = clippedPolygon && clippedPolygon.length >= 3
      ? clippedPolygon
      : constrainPolygonToOutline(polygon, center, outline);
    if (!visiblePolygon || visiblePolygon.length < 3) continue;
    visiblePolygon = constrainPolygonToOutline(visiblePolygon, center, outline);
    if (!visiblePolygon || visiblePolygon.length < 3) continue;

    let progress = g.constrain(seedPoints[i][0] / wLength, 0, 1);
    addRoughVoronoiEdges(g, lineMap, visiblePolygon, center, progress, outline);
  }

  return Array.from(lineMap.values())
    .filter((segment) => segment.length > insectBaseUnit * 0.7)
    .sort((a, b) => a.progress - b.progress);
}

function drawRoughVoronoiPattern(g, wLength, roughPattern, wingColorLineType, outline) {
  if (typeof brush === "undefined" || !roughPattern || roughPattern.length <= 0) return;

  brush.set("pencil2", "#090907", 0.5);
  brush.stroke("#090907");
  brush.noFill();
  if (typeof brush.noHatch === "function") brush.noHatch();

  for (let segment of roughPattern) {
    //let strokeCol = getRoughVoronoiStrokeColor(g, segment.progress, wingColorLineType);
    //let strokePaint = colorToBrushPaint(strokeCol, 190);
    let pressure = roughRandom(g, 0.72, 1.08);

    brush.set("pencil2", "#090907", pressure);
    brush.stroke("#090907");
    brush.strokeWeight(roughRandom(g, 0.55, 0.95));
    brush.noFill();

    let repeats = roughRandom(g, 0, 1) < 0.22 ? 2 : 1;
    for (let pass = 0; pass < repeats; pass++) {
      let linePoints = makeRoughSegmentPolyline(g, segment, outline, pass);
      if (!linePoints || linePoints.length < 2) continue;

      brush.beginShape(0.08);
      for (let pt of linePoints) {
        brush.vertex(pt[0], pt[1], roughRandom(g, 0.68, 1.05));
      }
      brush.endShape();
    }
  }

  brush.noFill();
}

function addRoughVoronoiEdges(g, lineMap, polygon, center, progress, outline) {
  for (let i = 0; i < polygon.length; i++) {
    let a = polygon[i];
    let b = polygon[(i + 1) % polygon.length];
    if (!a || !b) continue;

    let length = dist2D(a[0], a[1], b[0], b[1]);
    if (length < insectBaseUnit * 0.45) continue;

    let mx = (a[0] + b[0]) * 0.5;
    let my = (a[1] + b[1]) * 0.5;
    if (!isPointInPolygon(mx, my, outline)) continue;
    if (isNearOutline(mx, my, outline, insectBaseUnit * 0.28)) continue;

    let key = makeSegmentKey(a, b);
    let safeA = nudgePointInsideOutline(a[0], a[1], center, outline, insectBaseUnit * 0.08);
    let safeB = nudgePointInsideOutline(b[0], b[1], center, outline, insectBaseUnit * 0.08);
    let existing = lineMap.get(key);
    if (existing && existing.length >= length) continue;

    lineMap.set(key, {
      a: safeA,
      b: safeB,
      center,
      progress,
      length
    });
  }
}

function makeRoughSegmentPolyline(g, segment, outline, pass = 0) {
  let points = [];
  let steps = Math.max(3, Math.floor(segment.length / (insectBaseUnit * 0.55)));
  let jitter = insectBaseUnit * (pass === 0 ? 0.035 : 0.055);
  let normal = getSegmentNormal(segment.a, segment.b);

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let ease = Math.sin(t * Math.PI);
    let x = segment.a[0] + (segment.b[0] - segment.a[0]) * t;
    let y = segment.a[1] + (segment.b[1] - segment.a[1]) * t;
    let wobble = (g.noise(x * 0.035, y * 0.035, pass * 31.7) - 0.5) * jitter * 2 * ease;
    let scratch = roughRandom(g, -jitter, jitter) * 0.35 * ease;

    x += normal.x * wobble + scratch;
    y += normal.y * wobble + roughRandom(g, -jitter, jitter) * 0.28 * ease;

    let safePoint = jitterPointInsideOutline(g, x, y, segment.center, outline, insectBaseUnit * 0.012);
    points.push(safePoint);
  }

  return points;
}

function nudgePointInsideOutline(x, y, center, outline, insetAmount) {
  if (isPointInPolygon(x, y, outline)) {
    let dx = center.x - x;
    let dy = center.y - y;
    let d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.0001) return [x, y];
    return [x + (dx / d) * insetAmount, y + (dy / d) * insetAmount];
  }

  let t = 0.86;
  while (t > 0.08) {
    let ix = center.x + (x - center.x) * t;
    let iy = center.y + (y - center.y) * t;
    if (isPointInPolygon(ix, iy, outline)) return [ix, iy];
    t *= 0.72;
  }

  return [center.x, center.y];
}

function makeSegmentKey(a, b) {
  let qa = quantizeVoronoiPoint(a);
  let qb = quantizeVoronoiPoint(b);
  return qa < qb ? `${qa}|${qb}` : `${qb}|${qa}`;
}

function quantizeVoronoiPoint(pt) {
  let grid = Math.max(1, insectBaseUnit * 0.22);
  return `${Math.round(pt[0] / grid)},${Math.round(pt[1] / grid)}`;
}

function getSegmentNormal(a, b) {
  let dx = b[0] - a[0];
  let dy = b[1] - a[1];
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d < 0.0001) return { x: 0, y: 1 };
  return { x: -dy / d, y: dx / d };
}

function dist2D(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function isNearOutline(x, y, outline, threshold) {
  for (let i = 0; i < outline.length; i++) {
    let a = outline[i];
    let b = outline[(i + 1) % outline.length];
    if (distanceToSegment(x, y, a.x, a.y, b.x, b.y) < threshold) return true;
  }
  return false;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let lenSq = dx * dx + dy * dy;
  if (lenSq < 0.0001) return dist2D(px, py, x1, y1);

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return dist2D(px, py, x1 + dx * t, y1 + dy * t);
}

function getRoughVoronoiStrokeColor(g, progress, wingColorLineType) {
  let inkA = g.color("#050504");
  let inkB = g.color("#151511");
  let strokeCol = g.lerpColor(inkA, inkB, g.noise(progress * 12));
  strokeCol.setAlpha(255);
  return strokeCol;
}

function getRoughWatercolorPalette(g, color1, color2) {
  let sourceA = g.color(color1.h_adj, color1.s_adj * 0.62, min(100, color1.b_adj + 14), 118);
  let sourceB = g.color(color2.h_adj, color2.s_adj * 0.62, min(100, color2.b_adj + 14), 112);

  return [
    colorToBrushPaint(sourceA, 118),
    colorToBrushPaint(sourceB, 112),
    colorToBrushPaint(g.color(92, 30, 58, 116), 116),
    colorToBrushPaint(g.color(190, 32, 76, 108), 108),
    colorToBrushPaint(g.color(12, 58, 94, 118), 118),
    colorToBrushPaint(g.color(258, 28, 84, 104), 104)
  ];
}

function pickPointInOutline(g, wLength, wWidth, tipYOffset, outline) {
  for (let tries = 0; tries < 80; tries++) {
    let px = roughRandom(g, wLength * 0.08, wLength * 0.95);
    let py = roughRandom(g, -wWidth * 0.65, tipYOffset + wWidth * 0.85);
    if (isPointInPolygon(px, py, outline)) return { x: px, y: py };
  }
  return null;
}

function makeWatercolorBlob(g, cx, cy, radius, pointCount) {
  let points = [];
  let yScale = roughRandom(g, 0.35, 0.75);
  let rot = roughRandom(g, -0.45, 0.45);

  for (let i = 0; i < pointCount; i++) {
    let a = (TWO_PI * i) / pointCount;
    let r = radius * roughRandom(g, 0.55, 1.15);
    let localX = cos(a) * r;
    let localY = sin(a) * r * yScale;
    points.push([
      cx + localX * cos(rot) - localY * sin(rot),
      cy + localX * sin(rot) + localY * cos(rot)
    ]);
  }

  return points;
}

function constrainBlobToOutline(blob, center, outline) {
  return insetPolygonTowardsPoint(
    constrainPolygonToOutline(blob, center, outline),
    center,
    insectBaseUnit * 0.08
  );
}

function constrainPolygonToOutline(polygon, center, outline) {
  return polygon.map((pt) => {
    if (isPointInPolygon(pt[0], pt[1], outline)) return pt;

    let t = 0.72;
    let x = center.x + (pt[0] - center.x) * t;
    let y = center.y + (pt[1] - center.y) * t;

    while (t > 0.18 && !isPointInPolygon(x, y, outline)) {
      t *= 0.72;
      x = center.x + (pt[0] - center.x) * t;
      y = center.y + (pt[1] - center.y) * t;
    }

    return [x, y];
  });
}

function colorToBrushPaint(c, fallbackAlpha = 255) {
  if (!c || !c.levels) return { color: "#ffffff", alpha: fallbackAlpha };

  let r = c.levels[0];
  let g = c.levels[1];
  let b = c.levels[2];
  let a = c.levels.length > 3 ? c.levels[3] : fallbackAlpha;

  return {
    color: `rgb(${r}, ${g}, ${b})`,
    alpha: a
  };
}

function resetRoughBrushFillState() {
  brush.noStroke();
  brush.noFill();
  if (typeof brush.noHatch === "function") brush.noHatch();
  if (typeof brush.noWash === "function") brush.noWash();
  if (typeof brush.noMass === "function") brush.noMass();
}

function outlineToBrushPoints(outline) {
  return outline.map((p) => [p.x, p.y]);
}

function drawBrushPolygon(points) {
  if (!points || points.length < 3) return;

  let brushPoints = ensureClockwiseBrushPoints(points);
  if (typeof brush.polygon === "function") {
    brush.polygon(brushPoints);
    return;
  }

  brush.beginShape();
  for (let pt of brushPoints) brush.vertex(pt[0], pt[1]);
  brush.endShape(true);
}

function ensureClockwiseBrushPoints(points) {
  let normalized = points.map((pt) => [pt[0], pt[1]]);
  return getPointArraySignedArea(normalized) >= 0 ? normalized : normalized.reverse();
}

function getPointArraySignedArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    let p1 = points[i];
    let p2 = points[(i + 1) % points.length];
    area += p1[0] * p2[1] - p2[0] * p1[1];
  }
  return area * 0.5;
}

function insetPolygonTowardsPoint(polygon, center, insetAmount) {
  if (!polygon || polygon.length < 3 || !center) return polygon;

  return polygon.map((pt) => {
    let dx = center.x - pt[0];
    let dy = center.y - pt[1];
    let d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.0001) return pt;

    let t = Math.min(0.35, insetAmount / d);
    return [
      pt[0] + dx * t,
      pt[1] + dy * t
    ];
  });
}

function jitterPointInsideOutline(g, x, y, center, outline, jitter) {
  let px = x + roughRandom(g, -jitter, jitter);
  let py = y + roughRandom(g, -jitter, jitter);

  if (!outline || isPointInPolygon(px, py, outline)) return [px, py];
  if (!center) return [x, y];

  let t = 0.82;
  while (t > 0.08) {
    let ix = center.x + (px - center.x) * t;
    let iy = center.y + (py - center.y) * t;
    if (isPointInPolygon(ix, iy, outline)) return [ix, iy];
    t *= 0.7;
  }

  return [center.x, center.y];
}

function clipPolygonToOutline(polygon, outline) {
  let output = polygon.map((pt) => [pt[0], pt[1]]);
  let isCounterClockwise = getOutlineSignedArea(outline) > 0;

  for (let i = 0; i < outline.length; i++) {
    let clipStart = outline[i];
    let clipEnd = outline[(i + 1) % outline.length];
    let input = output;
    output = [];
    if (input.length === 0) break;

    let previous = input[input.length - 1];
    for (let current of input) {
      let currentInside = isInsideClipEdge(current, clipStart, clipEnd, isCounterClockwise);
      let previousInside = isInsideClipEdge(previous, clipStart, clipEnd, isCounterClockwise);

      if (currentInside) {
        if (!previousInside) output.push(intersectClipEdge(previous, current, clipStart, clipEnd));
        output.push(current);
      } else if (previousInside) {
        output.push(intersectClipEdge(previous, current, clipStart, clipEnd));
      }
      previous = current;
    }
  }

  return output;
}

function getOutlineSignedArea(outline) {
  let area = 0;
  for (let i = 0; i < outline.length; i++) {
    let p1 = outline[i];
    let p2 = outline[(i + 1) % outline.length];
    area += p1.x * p2.y - p2.x * p1.y;
  }
  return area * 0.5;
}

function isInsideClipEdge(point, edgeStart, edgeEnd, isCounterClockwise) {
  let cross = (edgeEnd.x - edgeStart.x) * (point[1] - edgeStart.y) -
              (edgeEnd.y - edgeStart.y) * (point[0] - edgeStart.x);
  return isCounterClockwise ? cross >= 0 : cross <= 0;
}

function intersectClipEdge(segmentStart, segmentEnd, edgeStart, edgeEnd) {
  let a1 = segmentEnd[1] - segmentStart[1];
  let b1 = segmentStart[0] - segmentEnd[0];
  let c1 = a1 * segmentStart[0] + b1 * segmentStart[1];
  let a2 = edgeEnd.y - edgeStart.y;
  let b2 = edgeStart.x - edgeEnd.x;
  let c2 = a2 * edgeStart.x + b2 * edgeStart.y;
  let det = a1 * b2 - a2 * b1;

  if (Math.abs(det) < 0.00001) return segmentEnd;

  return [
    (b2 * c1 - b1 * c2) / det,
    (a1 * c2 - a2 * c1) / det
  ];
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
