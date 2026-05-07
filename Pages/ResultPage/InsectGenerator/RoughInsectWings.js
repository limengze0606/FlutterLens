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
  
  drawRoughWingColor(g, color1, color2, fillType, baseOutline);
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

function createRoughVoronoiPattern(g, wLength, wWidth, tipYOffset, outline) {
  let seedPoints = [];
  let strategyType = floor(roughRandom(g, 0, 3));
  //let strategyType = 1;

  switch (strategyType) {
    case 0: seedPoints = scatterUniform(g, wLength, wWidth, tipYOffset, outline); break;
    case 1: seedPoints = scatterSineDensity(g, wLength, wWidth, tipYOffset, outline); break;
    case 2: seedPoints = scatterJitteredGrid(g, wLength, wWidth, tipYOffset, outline); break;
  }

  seedPoints = seedPoints
    .filter((pt) => isPointInsideOrOnOutline(pt[0], pt[1], outline, insectBaseUnit * 0.05))
    .filter(() => roughRandom(g, 0, 1) < 0.38);
  seedPoints = seedPoints.concat(sampleOutlineVoronoiSeeds(g, outline, wWidth));

  if (seedPoints.length <= 0) return [];

  const delaunay = d3.Delaunay.from(seedPoints);
  const bounds = getOutlineBounds(outline, insectBaseUnit * 2);
  const voronoi = delaunay.voronoi([bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);
  let segments = [];

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
    addRoughVoronoiEdges(g, segments, visiblePolygon, center, progress, outline);
  }

  return segments
    .filter((segment) => segment.length > insectBaseUnit * 0.4)
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
    brush.strokeWeight(roughRandom(g, 0.48, 0.88));
    brush.noFill();

    let repeats = roughRandom(g, 0, 1) < 0.22 ? 2 : 1;
    for (let pass = 0; pass < repeats; pass++) {
      let linePoints = makeRoughSegmentPolyline(g, segment, outline, pass);
      linePoints = trimPolylineToOutline(linePoints, outline);
      if (!linePoints || linePoints.length < 2) continue;

      brush.beginShape(0.08);
      for (let i = 0; i < linePoints.length; i++) {
        let pt = linePoints[i];
        let t = linePoints.length <= 1 ? 0 : i / (linePoints.length - 1);
        let taper = Math.sin(t * Math.PI);
        let grain = g.noise(pt[0] * 0.045, pt[1] * 0.045, pass * 19.3);
        let pointPressure = roughRandom(g, 0.48, 0.82) + taper * roughRandom(g, 0.08, 0.28) + grain * 0.16;
        brush.vertex(pt[0], pt[1], g.constrain(pointPressure, 0.42, 1.12));
      }
      brush.endShape();
    }
  }

  brush.noFill();
}

function addRoughVoronoiEdges(g, segments, polygon, center, progress, outline) {
  for (let i = 0; i < polygon.length; i++) {
    let a = polygon[i];
    let b = polygon[(i + 1) % polygon.length];
    if (!a || !b) continue;

    let length = dist2D(a[0], a[1], b[0], b[1]);
    if (length < insectBaseUnit * 0.45) continue;

    let mx = (a[0] + b[0]) * 0.5;
    let my = (a[1] + b[1]) * 0.5;
    let aNearOutline = isNearOutline(a[0], a[1], outline, insectBaseUnit * 0.18);
    let bNearOutline = isNearOutline(b[0], b[1], outline, insectBaseUnit * 0.18);
    if (!isPointInsideOrOnOutline(mx, my, outline, insectBaseUnit * 0.04)) continue;
    if (aNearOutline && bNearOutline && isNearOutline(mx, my, outline, insectBaseUnit * 0.32)) continue;

    let insetAmount = (aNearOutline || bNearOutline) ? insectBaseUnit * 0.015 : insectBaseUnit * 0.08;
    let safeA = nudgePointInsideOutline(a[0], a[1], center, outline, insetAmount);
    let safeB = nudgePointInsideOutline(b[0], b[1], center, outline, insetAmount);

    segments.push({
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
  let direction = getSegmentDirection(segment.a, segment.b);
  let endpointJitter = insectBaseUnit * (pass === 0 ? 0.055 : 0.085);
  let bowAmount = roughRandom(g, -insectBaseUnit * 0.18, insectBaseUnit * 0.18) * (pass === 0 ? 1 : 1.35);
  let bowSkew = roughRandom(g, -0.28, 0.28);
  let start = [
    segment.a[0] + direction.x * roughRandom(g, -endpointJitter, endpointJitter * 0.4) + normal.x * roughRandom(g, -endpointJitter, endpointJitter),
    segment.a[1] + direction.y * roughRandom(g, -endpointJitter, endpointJitter * 0.4) + normal.y * roughRandom(g, -endpointJitter, endpointJitter)
  ];
  let end = [
    segment.b[0] + direction.x * roughRandom(g, -endpointJitter * 0.4, endpointJitter) + normal.x * roughRandom(g, -endpointJitter, endpointJitter),
    segment.b[1] + direction.y * roughRandom(g, -endpointJitter * 0.4, endpointJitter) + normal.y * roughRandom(g, -endpointJitter, endpointJitter)
  ];

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let ease = Math.sin(t * Math.PI);
    let x = start[0] + (end[0] - start[0]) * t;
    let y = start[1] + (end[1] - start[1]) * t;
    let bow = ease * bowAmount * (1 + (t - 0.5) * bowSkew);
    let wobble = (g.noise(x * 0.035, y * 0.035, pass * 31.7) - 0.5) * jitter * 2 * ease;
    let scratch = roughRandom(g, -jitter, jitter) * 0.35 * ease;

    x += normal.x * (bow + wobble) + scratch + direction.x * roughRandom(g, -jitter, jitter) * 0.18 * ease;
    y += normal.y * (bow + wobble) + roughRandom(g, -jitter, jitter) * 0.28 * ease + direction.y * roughRandom(g, -jitter, jitter) * 0.18 * ease;

    let safePoint = jitterPointInsideOutline(g, x, y, segment.center, outline, insectBaseUnit * 0.012);
    points.push(safePoint);
  }

  return points;
}

function sampleOutlineVoronoiSeeds(g, outline, wWidth) {
  if (!outline || outline.length < 3) return [];

  let seeds = [];
  let perimeter = getOutlinePerimeter(outline);
  let targetCount = Math.max(6, Math.min(22, Math.floor(perimeter / Math.max(1, insectBaseUnit * 2.8))));
  let startOffset = roughRandom(g, 0, perimeter / targetCount);
  let center = getOutlineCentroid(outline);

  for (let i = 0; i < targetCount; i++) {
    let distance = startOffset + (perimeter * i) / targetCount + roughRandom(g, -wWidth * 0.04, wWidth * 0.04);
    let point = getPointOnOutlineAtDistance(outline, distance);
    if (!point) continue;

    let inset = roughRandom(g, insectBaseUnit * 0.015, insectBaseUnit * 0.09);
    let dx = center.x - point.x;
    let dy = center.y - point.y;
    let d = Math.sqrt(dx * dx + dy * dy);
    if (d > 0.0001) {
      point.x += (dx / d) * inset;
      point.y += (dy / d) * inset;
    }

    if (isPointInsideOrOnOutline(point.x, point.y, outline, insectBaseUnit * 0.12)) {
      seeds.push([point.x, point.y]);
    }
  }

  return seeds;
}

function getOutlineBounds(outline, padding = 0) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let p of outline) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding
  };
}

function getOutlinePerimeter(outline) {
  let perimeter = 0;
  for (let i = 0; i < outline.length; i++) {
    let a = outline[i];
    let b = outline[(i + 1) % outline.length];
    perimeter += dist2D(a.x, a.y, b.x, b.y);
  }
  return perimeter;
}

function getPointOnOutlineAtDistance(outline, targetDistance) {
  let perimeter = getOutlinePerimeter(outline);
  if (perimeter <= 0) return null;

  let remaining = ((targetDistance % perimeter) + perimeter) % perimeter;
  for (let i = 0; i < outline.length; i++) {
    let a = outline[i];
    let b = outline[(i + 1) % outline.length];
    let edgeLength = dist2D(a.x, a.y, b.x, b.y);
    if (edgeLength < 0.0001) continue;
    if (remaining <= edgeLength) {
      let t = remaining / edgeLength;
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
      };
    }
    remaining -= edgeLength;
  }

  return { x: outline[0].x, y: outline[0].y };
}

function getOutlineCentroid(outline) {
  let x = 0;
  let y = 0;
  for (let p of outline) {
    x += p.x;
    y += p.y;
  }
  return {
    x: x / outline.length,
    y: y / outline.length
  };
}

function isPointInsideOrOnOutline(x, y, outline, edgeTolerance = 0) {
  if (!outline || outline.length < 3) return false;
  return isPointInPolygon(x, y, outline) || isNearOutline(x, y, outline, edgeTolerance);
}

function trimPolylineToOutline(points, outline) {
  if (!points || !outline) return points;
  return points.filter((pt) => isPointInsideOrOnOutline(pt[0], pt[1], outline, insectBaseUnit * 0.03));
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

function getSegmentNormal(a, b) {
  let dx = b[0] - a[0];
  let dy = b[1] - a[1];
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d < 0.0001) return { x: 0, y: 1 };
  return { x: -dy / d, y: dx / d };
}

function getSegmentDirection(a, b) {
  let dx = b[0] - a[0];
  let dy = b[1] - a[1];
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d < 0.0001) return { x: 1, y: 0 };
  return { x: dx / d, y: dy / d };
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

function drawRoughWingColor(g, color1, color2, fillType, baseOutline){
  if (typeof brush === "undefined" || !baseOutline || baseOutline.length < 3) return;

  let bounds = getOutlineBounds(baseOutline, 0);
  let center = getOutlineCentroid(baseOutline);
  let markerCount = Math.floor(roughRandom(g, 3, 6));

  brush.noFill();
  if (typeof brush.noHatch === "function") brush.noHatch();

  for (let i = 0; i < markerCount; i++) {
    let markerColor = getRoughWingMarkerColor(g, i / Math.max(1, markerCount - 1), fillType, color1, color2);
    let markerPaint = colorToBrushPaint(markerColor, 90);
    let start = samplePointInsideOutline(g, baseOutline, bounds, center);
    let end = samplePointInsideOutline(g, baseOutline, bounds, center);
    if (!start || !end) continue;

    let linePoints = makeRoughMarkerStroke(g, start, end, center, baseOutline);
    linePoints = trimPolylineToOutline(linePoints, baseOutline);
    if (!linePoints || linePoints.length < 2) continue;

    brush.set("marker1", "#0000FF", roughRandom(g, 0.7, 1.08));
    brush.strokeWeight(roughRandom(g, 4.8, 8.2));
    brush.noFill();

    brush.beginShape(0.12);
    for (let j = 0; j < linePoints.length; j++) {
      let pt = linePoints[j];
      let t = linePoints.length <= 1 ? 0 : j / (linePoints.length - 1);
      let taper = Math.sin(t * Math.PI);
      let pressure = roughRandom(g, 0.5, 0.86) + taper * roughRandom(g, 0.1, 0.28);
      brush.vertex(pt[0], pt[1], g.constrain(pressure, 0.42, 1.05));
    }
    brush.endShape();
  }
}

function getRoughWingMarkerColor(g, progress, fillType, color1, color2) {
  let c1 = g.color(color1.h_adj, color1.s_adj, color1.b_adj);
  let c2 = g.color(color2.h_adj, color2.s_adj, color2.b_adj);

  switch (fillType) {
    case 1:
      return g.lerpColor(c2, c1, 1.0 - g.pow(progress, 0.6));
    case 2:
      return g.lerpColor(c1, c2, progress * 0.65);
    default:
      return g.lerpColor(c1, c2, roughRandom(g, 0.15, 0.85));
  }
}

function samplePointInsideOutline(g, outline, bounds, center) {
  for (let i = 0; i < 40; i++) {
    let x = roughRandom(g, bounds.minX, bounds.maxX);
    let y = roughRandom(g, bounds.minY, bounds.maxY);
    if (isPointInsideOrOnOutline(x, y, outline, insectBaseUnit * 0.08)) {
      return nudgePointInsideOutline(x, y, center, outline, insectBaseUnit * 0.04);
    }
  }

  return [center.x, center.y];
}

function makeRoughMarkerStroke(g, start, end, center, outline) {
  let length = dist2D(start[0], start[1], end[0], end[1]);
  let steps = Math.max(3, Math.floor(length / Math.max(1, insectBaseUnit * 0.8)));
  let normal = getSegmentNormal(start, end);
  let bowAmount = roughRandom(g, -insectBaseUnit * 0.55, insectBaseUnit * 0.55);
  let jitter = insectBaseUnit * 0.16;
  let points = [];

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let ease = Math.sin(t * Math.PI);
    let x = start[0] + (end[0] - start[0]) * t;
    let y = start[1] + (end[1] - start[1]) * t;
    let wobble = (g.noise(x * 0.03, y * 0.03, i * 0.2) - 0.5) * jitter * 2;

    x += normal.x * (bowAmount * ease + wobble * ease) + roughRandom(g, -jitter, jitter) * 0.35 * ease;
    y += normal.y * (bowAmount * ease + wobble * ease) + roughRandom(g, -jitter, jitter) * 0.35 * ease;
    points.push(jitterPointInsideOutline(g, x, y, center, outline, insectBaseUnit * 0.02));
  }

  return points;
}
