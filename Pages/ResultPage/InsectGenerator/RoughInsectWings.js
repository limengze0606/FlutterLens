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

function getRoughWingBrushSettings() {
  return typeof ROUGH_WING_BRUSH_SETTINGS !== "undefined"
    ? ROUGH_WING_BRUSH_SETTINGS
    : {};
}

function roughSettingValue(g, value) {
  if (Array.isArray(value)) return roughRandom(g, value[0], value[1]);
  return value;
}

function roughSettingInt(g, value) {
  return Math.floor(roughSettingValue(g, value));
}

function roughClampSetting(g, value, clampRange) {
  return g.constrain(value, clampRange[0], clampRange[1]);
}

function createRoughInsectPosePlan(g, seedValue) {
  setRoughSeed(g, seedValue + 4517);

  let yaw = roughRandom(g, -0.78, 0.78);
  let pitch = roughRandom(g, -0.48, 0.58);
  let roll = roughRandom(g, -0.82, 0.82);
  let phaseIndex = Math.floor(roughRandom(g, 0, 5));
  let phaseSet = [
    { lift: -0.46, spread: 0.86, fold: 0.72, rot: -0.14 },
    { lift: -0.24, spread: 0.94, fold: 0.84, rot: -0.06 },
    { lift: 0.0, spread: 1.04, fold: 1.0, rot: 0.02 },
    { lift: 0.28, spread: 0.96, fold: 0.86, rot: 0.1 },
    { lift: 0.46, spread: 0.86, fold: 0.74, rot: 0.16 }
  ];
  let phase = phaseSet[phaseIndex];
  let yawAmount = Math.abs(yaw);
  let pitchAmount = Math.abs(pitch);
  let nearSide = yaw >= 0 ? 1 : -1;

  return {
    yaw,
    pitch,
    roll,
    phaseIndex,
    phase,
    nearSide,
    bodyScaleX: 1 - yawAmount * 0.14,
    bodyScaleY: 1 - pitchAmount * 0.12,
    nearScale: 1 + yawAmount * 0.18,
    farScale: 1 - yawAmount * 0.22,
    nearYOffset: insectBaseUnit * (pitch * 0.55 + phase.lift * 0.12),
    farYOffset: insectBaseUnit * (-pitch * 0.45 - phase.lift * 0.18),
    rootSkew: insectBaseUnit * yaw * 0.52,
    depthTilt: yaw * 0.16 + pitch * 0.08,
    topWingCompression: 1 - pitchAmount * 0.1
  };
}

function drawRoughInsectWings(g, insectType, seedValue, flapAngle, color1, color2, wingColorFillType = 0, wingColorLineType = 0, wingLineColorSet = 0, bodyPlan = null) {
  g.push();
  g.colorMode(HSB, 360, 100, 100, 255);
  
  let wingStyle = (insectType === 1) ? 1 : 0; 
  let wingRootY = bodyPlan && typeof bodyPlan.wingRootY === "number" ? bodyPlan.wingRootY : 0.5 * insectBaseUnit;
  let wingRootHalfWidth = bodyPlan && typeof bodyPlan.wingRootHalfWidth === "number" ? bodyPlan.wingRootHalfWidth : bodyHalfWidth;

  if (insectType === 0 && bodyPlan) {
    drawRoughButterflyWingPairs(g, seedValue, bodyPlan, flapAngle, color1, color2, wingColorFillType, wingColorLineType);
  } else {
    drawRoughWingPair(g, seedValue, wingRootY, flapAngle, 1.0, color1, color2, wingStyle, wingColorFillType, wingColorLineType, wingRootHalfWidth);
  }

  g.pop(); 
}

function drawRoughButterflyWingPairs(g, seedValue, bodyPlan, flapAngle, color1, color2, fillType, wingColorLineType) {
  setRoughSeed(g, seedValue + 1207);

  let wingStylePlan = createRoughButterflyWingStylePlan(g, color1, color2);
  let wingSets = createRoughButterflyWingPairPlans(g, bodyPlan);
  let posePlan = bodyPlan.posePlan || null;

  // Hindwings are placed first so the forewings and body can sit naturally above them.
  drawRoughWingPairFromPlan(g, seedValue + 2719, wingSets.hind, flapAngle - 0.04, color1, color2, 0, fillType, wingColorLineType, wingStylePlan, posePlan);
  drawRoughWingPairFromPlan(g, seedValue + 151, wingSets.fore, flapAngle + 0.02, color1, color2, 0, fillType, wingColorLineType, wingStylePlan, posePlan);
}

function createRoughButterflyWingPairPlans(g, bodyPlan) {
  let u = insectBaseUnit;
  let screenMax = max(width, height);
  let screenMin = min(width, height);
  let baseFromCanvas = (screenMax * 0.15 + screenMin * 0.4) * 0.01;
  let baseFromShortEdge = screenMin * 0.44 * 0.01;
  let portraitRatio = height > width ? height / Math.max(1, width) : 1;
  let portraitAmount = g.constrain((portraitRatio - 1) / 0.45, 0, 1);
  let wingBaseLen = baseFromCanvas + (baseFromShortEdge - baseFromCanvas) * portraitAmount;
  let verticalCompression = 1 - portraitAmount * 0.3;
  let hindDropCompression = 1 - portraitAmount * 0.42;
  let rootY = bodyPlan.wingRootY;
  let rootHalfWidth = bodyPlan.wingRootHalfWidth;

  let posePlan = bodyPlan.posePlan || null;
  let phase = posePlan ? posePlan.phase : { lift: 0, spread: 1, fold: 1, rot: 0 };
  let poseLengthScale = posePlan ? phase.spread * (1 - Math.abs(posePlan.pitch) * 0.06) : 1;
  let poseHeightScale = posePlan ? phase.fold * posePlan.topWingCompression : 1;

  let foreLength = roughRandom(g, 18.5 * wingBaseLen, 27.5 * wingBaseLen) * poseLengthScale;
  let foreWidth = roughRandom(g, 9.2 * u, 14.5 * u);
  let foreTipY = (roughRandom(g, -7.2 * u, -2.4 * u) + phase.lift * 2.4 * u) * verticalCompression * poseHeightScale;
  let hindLength = foreLength * roughRandom(g, 0.58, 0.72);
  let hindWidth = foreWidth * roughRandom(g, 0.94, 1.18);
  let hindTipY = (roughRandom(g, 4.8 * u, 8.4 * u) + phase.lift * 1.4 * u) * verticalCompression * (0.92 + poseHeightScale * 0.08);

  return {
    fore: {
      yOff: rootY - roughRandom(g, 0.28 * u, 0.52 * u) + phase.lift * 0.28 * u,
      rootHalfWidth: rootHalfWidth * roughRandom(g, 0.88, 1.08),
      rotation: roughRandom(g, -0.13, -0.02) + phase.rot,
      scaleX: 1,
      scaleY: roughRandom(g, 0.72, 0.82) * (1 - portraitAmount * 0.1),
      params: {
        length: foreLength,
        width: foreWidth,
        tipY: foreTipY,
        noiseStrength: roughRandom(g, 2.5, 7.0)
      }
    },
    hind: {
      yOff: rootY + roughRandom(g, 2.05 * u, 2.75 * u) * hindDropCompression + phase.lift * 0.16 * u,
      rootHalfWidth: rootHalfWidth * roughRandom(g, 0.58, 0.76),
      rotation: roughRandom(g, 0.22, 0.38) + phase.rot * 0.62,
      scaleX: roughRandom(g, 0.9, 1.02),
      scaleY: roughRandom(g, 0.88, 1.06) * (1 - portraitAmount * 0.22),
      params: {
        length: hindLength,
        width: hindWidth,
        tipY: hindTipY,
        noiseStrength: roughRandom(g, 2.0, 5.8)
      }
    }
  };
}

function createRoughButterflyWingStylePlan(g, color1, color2) {
  let colorProfile = analyzeRoughWingColorPair(g, color1, color2);
  let archetypeRoll = roughRandom(g, 0, 1);
  let highContrast = colorProfile.contrastScore > 0.5 || colorProfile.hueDistance > 82 || colorProfile.brightnessDistance > 32;

  return {
    colorProfile,
    pattern: {
      highContrast,
      useEyeSpots: !highContrast && archetypeRoll > 0.78,
      useRadialBands: highContrast || archetypeRoll < 0.72
    }
  };
}

/**
 * 繪製一對手繪翅膀 (確保大結構對稱，但筆觸獨立)
 */
function drawRoughWingPair(g, seedValue, yOff, rot, s, color1, color2, wingStyle, fillType, wingColorLineType, rootHalfWidth = bodyHalfWidth) {
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
  drawRoughWingPairFromPlan(g, seedValue, {
    yOff,
    rootHalfWidth,
    rotation: 0,
    scale: s,
    params: wingParams
  }, rot, color1, color2, wingStyle, fillType, wingColorLineType);
}

function drawRoughWingPairFromPlan(g, seedValue, pairPlan, rot, color1, color2, wingStyle, fillType, wingColorLineType, wingStylePlan = null, posePlan = null) {
  let pairRot = (pairPlan.rotation || 0) + rot;
  let pairScaleX = pairPlan.scaleX || pairPlan.scale || 1;
  let pairScaleY = pairPlan.scaleY || pairPlan.scale || 1;
  let wingParams = pairPlan.params;
  let baseOutline = generateWingOutline(wingParams.length, wingParams.width, wingParams.tipY, wingParams.noiseStrength, wingStyle);
  let roughPattern = createRoughVoronoiPattern(g, wingParams.length, wingParams.width, wingParams.tipY, baseOutline);
  let bounds = getOutlineBounds(baseOutline, insectBaseUnit * 1.25);
  let center = getOutlineCentroid(baseOutline);
  let colorProfile = wingStylePlan && wingStylePlan.colorProfile
    ? wingStylePlan.colorProfile
    : analyzeRoughWingColorPair(g, color1, color2);
  let patternPlan = wingStylePlan && wingStylePlan.pattern ? wingStylePlan.pattern : {};
  let symmetricSpotPlan = createRoughWingSpotPlan(g, seedValue + 6047, baseOutline, bounds, center, colorProfile, patternPlan);
  let resolvedWingStylePlan = Object.assign({}, wingStylePlan || {}, {
    colorProfile,
    pattern: Object.assign({}, patternPlan, { spotPlan: symmetricSpotPlan })
  });
  let sideOrder = posePlan && posePlan.nearSide < 0 ? [1, -1] : [-1, 1];

  for (let side of sideOrder) {
    drawRoughWingSideFromPlan(
      g,
      seedValue,
      side,
      pairPlan,
      pairRot,
      pairScaleX,
      pairScaleY,
      color1,
      color2,
      wingStyle,
      wingParams,
      fillType,
      wingColorLineType,
      baseOutline,
      roughPattern,
      resolvedWingStylePlan,
      posePlan
    );
  }
}

function drawRoughWingSideFromPlan(g, seedValue, side, pairPlan, pairRot, pairScaleX, pairScaleY, color1, color2, wingStyle, wingParams, fillType, wingColorLineType, baseOutline, roughPattern, wingStylePlan, posePlan) {
  let isNear = posePlan && side === posePlan.nearSide;
  let depthScale = posePlan ? (isNear ? posePlan.nearScale : posePlan.farScale) : 1;
  let depthY = posePlan ? (isNear ? posePlan.nearYOffset : posePlan.farYOffset) : 0;
  let rootSkew = posePlan ? posePlan.rootSkew * (isNear ? 0.34 : -0.2) : 0;
  let depthRot = posePlan ? posePlan.depthTilt * (isNear ? 1 : -0.7) : 0;
  let strokeSeed = side > 0 ? seedValue : seedValue + 9999;

  g.push();
  g.translate(side * pairPlan.rootHalfWidth + rootSkew, pairPlan.yOff + depthY);
  g.rotate(side * pairRot + depthRot);
  g.scale(side * pairScaleX * depthScale, pairScaleY * (posePlan && !isNear ? 0.82 : 1));
  drawRoughWing(g, strokeSeed, color1, color2, wingStyle, wingParams, fillType, wingColorLineType, baseOutline, roughPattern, wingStylePlan);
  g.pop();
}

/**
 * 全新的單邊手繪翅膀 (接收預先算好的輪廓參數)
 */
// 【修改點】：新增 wingParams 參數
function drawRoughWing(g, strokeSeed, color1, color2, wingStyle, params, fillType, wingColorLineType, baseOutline, roughPattern, wingStylePlan = null) {
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
  
  drawRoughWingColor(g, color1, color2, fillType, baseOutline, wingStylePlan);
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

  let settings = getRoughWingBrushSettings().outline;
  let overshootRange = settings.overshootByPass[Math.min(strokeIndex, settings.overshootByPass.length - 1)];
  let strokeWeight = settings.strokeWeightsByPass[Math.min(strokeIndex, settings.strokeWeightsByPass.length - 1)];
  let minMultiplier = overshootRange[0];
  let maxMultiplier = overshootRange[1];
  
  let p0 = points[0];
  let p1 = points[3]; 
  let startOvershootX = p0.x + (p0.x - p1.x) * roughRandom(g, minMultiplier, maxMultiplier);
  let startOvershootY = p0.y + (p0.y - p1.y) * roughRandom(g, minMultiplier, maxMultiplier);

  let pLast = points[points.length - 1];
  let pPrev = points[points.length - 4];
  let endOvershootX = pLast.x + (pLast.x - pPrev.x) * roughRandom(g, minMultiplier, maxMultiplier);
  let endOvershootY = pLast.y + (pLast.y - pPrev.y) * roughRandom(g, minMultiplier, maxMultiplier);

  brush.set(settings.brushName, settings.color, settings.brushLoad);
  brush.strokeWeight(strokeWeight);

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

  let settings = getRoughWingBrushSettings().voronoi;

  brush.set(settings.brushName, settings.color, settings.initialBrushLoad);
  brush.stroke(settings.color);
  brush.noFill();
  if (typeof brush.noHatch === "function") brush.noHatch();

  for (let segment of roughPattern) {
    //let strokeCol = getRoughVoronoiStrokeColor(g, segment.progress, wingColorLineType);
    //let strokePaint = colorToBrushPaint(strokeCol, 190);
    let brushLoad = roughSettingValue(g, settings.brushLoad);

    brush.set(settings.brushName, settings.color, brushLoad);
    brush.stroke(settings.color);
    brush.strokeWeight(roughSettingValue(g, settings.strokeWeight));
    brush.noFill();

    let repeats = roughRandom(g, 0, 1) < settings.repeatChance ? 2 : 1;
    for (let pass = 0; pass < repeats; pass++) {
      let linePoints = makeRoughSegmentPolyline(g, segment, outline, pass);
      linePoints = trimPolylineToOutline(linePoints, outline);
      if (!linePoints || linePoints.length < 2) continue;

      brush.beginShape(settings.shapeRoughness);
      for (let i = 0; i < linePoints.length; i++) {
        let pt = linePoints[i];
        let t = linePoints.length <= 1 ? 0 : i / (linePoints.length - 1);
        let taper = Math.sin(t * Math.PI);
        let grain = g.noise(pt[0] * 0.045, pt[1] * 0.045, pass * 19.3);
        let pointPressure = roughSettingValue(g, settings.pressureBase) + taper * roughSettingValue(g, settings.pressureTaper) + grain * settings.pressureNoise;
        brush.vertex(pt[0], pt[1], roughClampSetting(g, pointPressure, settings.pressureClamp));
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
  if (c && c.roughPaintColor) {
    return {
      color: c.roughPaintColor,
      alpha: Math.min(c.roughPaintAlpha ?? fallbackAlpha, fallbackAlpha)
    };
  }

  if (!c || !c.levels) return { color: "#ffffff", alpha: fallbackAlpha };

  let r = typeof red === "function" ? red(c) : c.levels[0];
  let g = typeof green === "function" ? green(c) : c.levels[1];
  let b = typeof blue === "function" ? blue(c) : c.levels[2];
  let a = typeof alpha === "function"
    ? alpha(c)
    : (c.levels.length > 3 ? c.levels[3] : fallbackAlpha);

  return {
    color: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
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

function drawRoughWingColor(g, color1, color2, fillType, baseOutline, wingStylePlan = null){
  if (typeof brush === "undefined" || !baseOutline || baseOutline.length < 3) return;

  let bounds = getOutlineBounds(baseOutline, insectBaseUnit * 1.25);
  let center = getOutlineCentroid(baseOutline);
  let root = getRoughWingRootPoint(g, baseOutline);

  if (typeof brush.noHatch === "function") brush.noHatch();

  brush.noFill();
  brush.noStroke();

  let colorProfile = wingStylePlan && wingStylePlan.colorProfile
    ? wingStylePlan.colorProfile
    : analyzeRoughWingColorPair(g, color1, color2);
  drawRoughWingParticleStrokes(g, root, center, baseOutline, bounds, fillType, color1, color2);
  drawRoughWingButterflyPattern(g, root, center, baseOutline, bounds, colorProfile, wingStylePlan && wingStylePlan.pattern);
  drawRoughWingAccentStrokes(g, root, center, baseOutline, bounds, colorProfile);
  drawRoughWingSpecularStrokes(g, root, center, baseOutline, bounds, colorProfile);
}

function drawRoughWingParticleStrokes(g, root, center, outline, bounds, fillType, color1, color2) {
  let settings = getRoughWingBrushSettings().particleFill;
  let layers = settings.layers.map((layer) => Object.assign({}, layer, {
    count: roughSettingInt(g, layer.count)
  }));

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    let layer = layers[layerIndex];
    for (let i = 0; i < layer.count; i++) {
      let start = sampleRoughWingParticleStart(g, outline, bounds, center, root, layerIndex);
      let progress = getRoughWingParticleProgress(g, start, root, bounds);
      let particleColor = getRoughWingGradientColor(g, progress, color1, color2);
      let particlePaint = colorToBrushPaint(particleColor, layer.alpha);
      let points = makeRoughWingParticleStroke(g, start, root, center, outline, progress, layer, i);

      if (!points || points.length < 2) continue;

      brush.set(settings.brushName, particlePaint.color, roughSettingValue(g, layer.brushLoad));
      brush.stroke(particlePaint.color, particlePaint.alpha);
      brush.strokeWeight(roughSettingValue(g, layer.strokeWeight));
      brush.noFill();

      brush.beginShape(settings.shapeRoughness);
      for (let j = 0; j < points.length; j++) {
        let pt = points[j];
        let t = points.length <= 1 ? 0 : j / (points.length - 1);
        let taper = Math.sin(t * Math.PI);
        let grain = g.noise(pt[0] * 0.12, pt[1] * 0.12, i * 0.23 + layerIndex * 11.7);
        let pressure = roughSettingValue(g, settings.pressureBase) + taper * roughSettingValue(g, settings.pressureTaper) + grain * settings.pressureNoise;
        brush.vertex(pt[0], pt[1], roughClampSetting(g, pressure, settings.pressureClamp));
      }
      brush.endShape();
    }
  }
}

function sampleRoughWingParticleStart(g, outline, bounds, center, root, layerIndex) {
  let preferEdge = roughRandom(g, 0, 1) < (layerIndex === 0 ? 0.22 : 0.12);
  let point = preferEdge
    ? samplePointNearOutlineEdge(g, outline, center)
    : samplePointInsideOutline(g, outline, bounds, center);

  if (!point) return [center.x, center.y];

  let rootPull = layerIndex === 0 ? roughRandom(g, 0.02, 0.12) : roughRandom(g, -0.04, 0.08);
  point[0] = point[0] + (root[0] - point[0]) * rootPull;
  point[1] = point[1] + (root[1] - point[1]) * rootPull;

  point = keepRoughParticlePointInsideWing(point[0], point[1], center, outline, insectBaseUnit * 0.24);

  return point;
}

function getRoughWingParticleProgress(g, point, root, bounds) {
  let wingWidth = Math.max(1, bounds.maxX - root[0]);
  let progress = (point[0] - root[0]) / wingWidth;
  let yDrift = (point[1] - root[1]) / Math.max(1, bounds.maxY - bounds.minY);
  return g.constrain(progress + yDrift * 0.08 + roughRandom(g, -0.035, 0.035), 0.06, 0.96);
}

function makeRoughWingParticleStroke(g, start, root, center, outline, progress, layer, particleIndex) {
  let steps = Math.floor(roughRandom(g, layer.steps[0], layer.steps[1] + 1));
  let stepLength = insectBaseUnit * roughRandom(g, layer.stepLength[0], layer.stepLength[1]);
  let radialAngle = Math.atan2(start[1] - root[1], start[0] - root[0]);
  let flowNoise = (g.noise(start[0] * 0.055, start[1] * 0.055, particleIndex * 0.19) - 0.5) * 1.25;
  let fanBend = (progress - 0.5) * roughRandom(g, -0.35, 0.45);
  let angle = radialAngle + flowNoise + fanBend;
  let points = [];
  let x = start[0] + roughRandom(g, -insectBaseUnit * 0.1, insectBaseUnit * 0.1);
  let y = start[1] + roughRandom(g, -insectBaseUnit * 0.1, insectBaseUnit * 0.1);
  let edgeInset = insectBaseUnit * (layer.alpha < 155 ? 0.26 : 0.18);

  for (let i = 0; i <= steps; i++) {
    let t = steps <= 0 ? 1 : i / steps;
    let ease = Math.sin(t * Math.PI);
    let localNoise = (g.noise(x * 0.08, y * 0.08, particleIndex * 0.31 + i * 0.17) - 0.5);
    let normalAngle = angle + Math.PI / 2;
    let px = x + Math.cos(normalAngle) * localNoise * insectBaseUnit * 0.22 * ease;
    let py = y + Math.sin(normalAngle) * localNoise * insectBaseUnit * 0.22 * ease;

    points.push(keepRoughParticlePointInsideWing(px, py, center, outline, edgeInset));

    angle += (g.noise(px * 0.04, py * 0.04, i * 0.41) - 0.5) * 0.36;
    x += Math.cos(angle) * stepLength;
    y += Math.sin(angle) * stepLength;
  }

  return points;
}

function keepRoughParticlePointInsideWing(x, y, center, outline, insetAmount) {
  let point = isPointInPolygon(x, y, outline)
    ? [x, y]
    : nudgePointInsideOutline(x, y, center, outline, insetAmount);

  if (isNearOutline(point[0], point[1], outline, insetAmount)) {
    return nudgePointInsideOutline(point[0], point[1], center, outline, insetAmount);
  }

  return point;
}

function analyzeRoughWingColorPair(g, color1, color2) {
  let first = makeRoughWingColorStats(color1);
  let second = makeRoughWingColorStats(color2);
  let hueDistance = getHueDistance(first.h, second.h);
  let saturationDistance = Math.abs(first.s - second.s);
  let brightnessDistance = Math.abs(first.b - second.b);
  let contrastScore = g.constrain(
    hueDistance / 180 * 0.46 +
    saturationDistance / 100 * 0.2 +
    brightnessDistance / 100 * 0.34,
    0,
    1
  );
  let averageSaturation = (first.s + second.s) * 0.5;
  let averageBrightness = (first.b + second.b) * 0.5;
  let stronger = first.s + first.b * 0.35 >= second.s + second.b * 0.35 ? first : second;
  let quieter = stronger === first ? second : first;
  let alreadyContrasty = hueDistance > 86 || brightnessDistance > 34 || contrastScore > 0.52;
  let mutedPair = averageSaturation < 38;
  let closeHuePair = hueDistance < 34;
  let accentStrength = alreadyContrasty
    ? g.constrain(0.32 - contrastScore * 0.24, 0.06, 0.18)
    : g.constrain(0.42 + (0.52 - contrastScore) * 0.72 + (mutedPair ? 0.16 : 0), 0.24, 0.86);

  let accentHue = stronger.h;
  let accentSaturation = g.constrain(stronger.s + 18, 44, 94);
  let accentBrightness = averageBrightness > 62 ? 28 : 76;

  if (alreadyContrasty) {
    accentHue = quieter.h;
    accentSaturation = g.constrain(quieter.s + 8, 30, 70);
    accentBrightness = averageBrightness > 58 ? 24 : 82;
  } else if (closeHuePair && mutedPair) {
    accentHue = wrapHue(stronger.h + (stronger.h < 180 ? 158 : -158));
    accentSaturation = 66;
    accentBrightness = averageBrightness > 56 ? 32 : 74;
  } else if (closeHuePair) {
    accentHue = stronger.h;
    accentSaturation = g.constrain(stronger.s + 12, 50, 88);
    accentBrightness = averageBrightness > 58 ? 26 : 80;
  } else if (mutedPair) {
    accentHue = wrapHue(stronger.h + (hueDistance < 90 ? 132 : -42));
    accentSaturation = 62;
    accentBrightness = averageBrightness > 55 ? 34 : 76;
  }

  let accentRgb = hsbToRgb(accentHue, accentSaturation, accentBrightness);
  let darkHue = wrapHue(stronger.h + (hueDistance > 86 ? 18 : 205));
  let darkRgb = hsbToRgb(darkHue, g.constrain(stronger.s * 0.55 + 22, 28, 66), averageBrightness > 58 ? 18 : 26);
  let highlightHue = wrapHue(stronger.h + roughRandom(g, -8, 12));
  let highlightRgb = hsbToRgb(highlightHue, g.constrain(stronger.s * 0.16, 4, 18), averageBrightness > 70 ? 92 : 98);
  let rimRgb = hsbToRgb(darkHue, g.constrain(stronger.s * 0.28 + 12, 16, 42), averageBrightness > 48 ? 24 : 32);
  let spotPalette = createRoughWingSpotPalette(g, stronger, quieter, averageBrightness, hueDistance, alreadyContrasty);
  let bandHue = alreadyContrasty ? quieter.h : accentHue;
  let bandRgb = hsbToRgb(
    wrapHue(bandHue + roughRandom(g, -10, 10)),
    g.constrain((alreadyContrasty ? quieter.s : accentSaturation) + 6, 38, 88),
    alreadyContrasty ? g.constrain(quieter.b + 6, 42, 86) : accentBrightness
  );

  return {
    first,
    second,
    stronger,
    quieter,
    hueDistance,
    saturationDistance,
    brightnessDistance,
    averageBrightness,
    averageSaturation,
    contrastScore,
    accentStrength,
    specularStrength: g.constrain(0.34 + averageSaturation / 220 - contrastScore * 0.16, 0.24, 0.62),
    accentPaint: {
      roughPaintColor: `rgb(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b})`,
      roughPaintAlpha: Math.round(120 + accentStrength * 100),
      levels: [accentRgb.r, accentRgb.g, accentRgb.b, Math.round(120 + accentStrength * 100)]
    },
    darkReflectionPaint: {
      roughPaintColor: `rgb(${darkRgb.r}, ${darkRgb.g}, ${darkRgb.b})`,
      roughPaintAlpha: 128,
      levels: [darkRgb.r, darkRgb.g, darkRgb.b, 128]
    },
    highlightPaint: {
      roughPaintColor: `rgb(${highlightRgb.r}, ${highlightRgb.g}, ${highlightRgb.b})`,
      roughPaintAlpha: 176,
      levels: [highlightRgb.r, highlightRgb.g, highlightRgb.b, 176]
    },
    rimPaint: {
      roughPaintColor: `rgb(${rimRgb.r}, ${rimRgb.g}, ${rimRgb.b})`,
      roughPaintAlpha: 132,
      levels: [rimRgb.r, rimRgb.g, rimRgb.b, 132]
    },
    spotPaint: {
      roughPaintColor: spotPalette.primary.roughPaintColor,
      roughPaintAlpha: spotPalette.primary.roughPaintAlpha,
      levels: spotPalette.primary.levels
    },
    spotPalette,
    bandPaint: {
      roughPaintColor: `rgb(${bandRgb.r}, ${bandRgb.g}, ${bandRgb.b})`,
      roughPaintAlpha: alreadyContrasty ? 116 : 142,
      levels: [bandRgb.r, bandRgb.g, bandRgb.b, alreadyContrasty ? 116 : 142]
    }
  };
}

function createRoughWingSpotPalette(g, stronger, quieter, averageBrightness, hueDistance, alreadyContrasty) {
  let useDarkSpots = averageBrightness >= 100;
  let primaryHue = useDarkSpots
    ? wrapHue(stronger.h + (alreadyContrasty ? 10 : 205))
    : wrapHue(stronger.h + roughRandom(g, -10, 14));
  let secondaryHue = useDarkSpots
    ? wrapHue(quieter.h + (hueDistance > 80 ? -8 : 160))
    : wrapHue(stronger.h + (hueDistance > 80 ? 8 : -24));
  let coreHue = useDarkSpots ? wrapHue(primaryHue + 26) : wrapHue(primaryHue + 18);
  let primaryRgb = hsbToRgb(
    primaryHue,
    useDarkSpots ? g.constrain(stronger.s * 0.38 + 10, 14, 48) : g.constrain(stronger.s * 0.08, 0, 14),
    useDarkSpots ? g.constrain(13 + (averageBrightness - 58) * 0.06, 12, 24) : g.constrain(92 + (58 - averageBrightness) * 0.08, 90, 98)
  );
  let secondaryRgb = hsbToRgb(
    secondaryHue,
    useDarkSpots ? g.constrain(quieter.s * 0.32 + 8, 12, 42) : g.constrain(stronger.s * 0.2 + 4, 6, 24),
    useDarkSpots ? g.constrain(24 + quieter.b * 0.12, 22, 38) : g.constrain(78 + averageBrightness * 0.12, 82, 96)
  );
  let coreRgb = hsbToRgb(
    coreHue,
    useDarkSpots ? g.constrain(stronger.s * 0.16 + 4, 8, 30) : g.constrain(stronger.s * 0.28 + 10, 14, 40),
    useDarkSpots ? 6 : 34
  );

  return {
    tone: useDarkSpots ? "dark-on-light" : "light-on-dark",
    primary: makeRoughWingPaint(primaryRgb, useDarkSpots ? 184 : 172),
    secondary: makeRoughWingPaint(secondaryRgb, useDarkSpots ? 138 : 132),
    core: makeRoughWingPaint(coreRgb, useDarkSpots ? 176 : 158)
  };
}

function makeRoughWingPaint(rgb, alphaValue) {
  return {
    roughPaintColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    roughPaintAlpha: alphaValue,
    levels: [rgb.r, rgb.g, rgb.b, alphaValue]
  };
}

function makeRoughWingColorStats(sourceColor) {
  return {
    h: wrapHue(sourceColor.h_adj),
    s: Math.max(0, Math.min(100, sourceColor.s_adj)),
    b: Math.max(0, Math.min(100, sourceColor.b_adj))
  };
}

function getHueDistance(a, b) {
  let diff = Math.abs(wrapHue(a) - wrapHue(b));
  return Math.min(diff, 360 - diff);
}

function wrapHue(hueValue) {
  return ((hueValue % 360) + 360) % 360;
}

function drawRoughWingButterflyPattern(g, root, center, outline, bounds, colorProfile, patternPlan = null) {
  if (!colorProfile) return;

  let highContrast = patternPlan && typeof patternPlan.highContrast === "boolean"
    ? patternPlan.highContrast
    : colorProfile.contrastScore > 0.5 || colorProfile.hueDistance > 82 || colorProfile.brightnessDistance > 32;
  let useEyeSpots = patternPlan && typeof patternPlan.useEyeSpots === "boolean"
    ? patternPlan.useEyeSpots
    : !highContrast && roughRandom(g, 0, 1) > 0.78;
  let useRadialBands = patternPlan && typeof patternPlan.useRadialBands === "boolean"
    ? patternPlan.useRadialBands
    : highContrast || roughRandom(g, 0, 1) < 0.72;

  drawRoughWingRimBand(g, center, outline, colorProfile);
  if (useRadialBands) drawRoughWingRadialBands(g, root, center, outline, bounds, colorProfile, highContrast);
  if (patternPlan && patternPlan.spotPlan) {
    drawRoughWingSpotPlan(g, root, center, outline, bounds, colorProfile, patternPlan.spotPlan, useEyeSpots);
  } else {
    drawRoughWingRimSpots(g, center, outline, colorProfile);
    if (useEyeSpots) drawRoughWingEyeSpots(g, root, center, outline, bounds, colorProfile);
  }

  brush.noFill();
  brush.noStroke();
}

function createRoughWingSpotPlan(g, seedValue, outline, bounds, center, colorProfile, patternPlan = {}) {
  setRoughSeed(g, seedValue);

  let perimeter = getOutlinePerimeter(outline);
  let highContrast = patternPlan && typeof patternPlan.highContrast === "boolean"
    ? patternPlan.highContrast
    : colorProfile.contrastScore > 0.5 || colorProfile.hueDistance > 82 || colorProfile.brightnessDistance > 32;
  
  // 決定是否要畫眼紋
  let useEyeSpots = patternPlan && typeof patternPlan.useEyeSpots === "boolean"
    ? patternPlan.useEyeSpots
    : !highContrast && roughRandom(g, 0, 1) > 0.78;

  let mode = "none";
  let rimCount = 0;
  let innerCount = 0;

  // 一般斑點與眼紋互斥
  if (!useEyeSpots) {
    // 【修改點 1】：如果這隻蝴蝶還沒決定整體的斑點風格，先決定好 (只會在畫第一對翅膀時執行)
    if (!patternPlan.globalSpotMode) {
      patternPlan.globalSpotMode = roughRandom(g, 0, 1) < 0.5 ? "inner-scatter" : "rim-chain";
    }
    
    // 讀取全局風格
    mode = patternPlan.globalSpotMode;

    // 【修改點 2】：嚴格限制 inner-scatter 只出現在一對翅膀上
    if (mode === "inner-scatter") {
      if (patternPlan.hasDrawnInnerScatter) {
        // 如果已經畫過了，這對翅膀強制設定為沒有花紋
        mode = "none"; 
      } else {
        // 還沒畫過，標記為已畫，並給予斑點數量
        patternPlan.hasDrawnInnerScatter = true; 
        innerCount = Math.floor(roughRandom(g, highContrast ? 4 : 5, highContrast ? 8 : 10));
      }
    } else if (mode === "rim-chain") {
      // 如果是 rim-chain，則照常繪製 (兩對翅膀都會有邊緣斑點)
      rimCount = Math.floor(roughRandom(g, 7, 12));
    }
  }

  let rimSpots = [];
  let innerSpots = [];
  let eyeSpots = [];
  // 設定邊緣斑點出現的進度區間 (避開 0~0.15 的上緣根部，與 0.85~1.0 的下緣根部)
  let startProgress = roughRandom(g, 0.15, 0.25);
  let endProgress = roughRandom(g, 0.75, 0.85);
  let progressRange = endProgress - startProgress;
  let progressStep = rimCount > 1 ? progressRange / (rimCount - 1) : 0;

  for (let i = 0; i < rimCount; i++) {
    if (roughRandom(g, 0, 1) < 0.2) continue; // 20% 機率不畫，產生自然留白
    
    // 計算該斑點的基準進度，並加上微小的隨機偏移
    let baseProgress = startProgress + i * progressStep;
    let spotProgress = baseProgress + roughRandom(g, -progressStep * 0.15, progressStep * 0.15);
    
    rimSpots.push({
      progress: g.constrain(spotProgress, 0.4, 0.7),
      inset: insectBaseUnit * roughRandom(g, 0.7, 1.12),
      radius: insectBaseUnit * roughRandom(g, 0.12, 0.24),
      paintRole: roughRandom(g, 0, 1) < 0.22 ? "secondary" : "primary"
    });
  }

  // 產生內部斑點 (如果 mode 是 none，這裡的 innerCount 會是 0，直接跳過)
  for (let i = 0; i < innerCount; i++) {
    let point = sampleSymmetricInnerSpotPoint(g, outline, bounds, center);
    if (!point) continue;
    innerSpots.push({
      x: point[0],
      y: point[1],
      radius: insectBaseUnit * roughRandom(g, 0.1, 0.22),
      paintRole: roughRandom(g, 0, 1) < 0.32 ? "secondary" : "primary"
    });
  }

  // 產生眼紋
  if (useEyeSpots) {
    let count = highContrast ? 1 : Math.floor(roughRandom(g, 1, 3));
    for (let i = 0; i < count; i++) {
      eyeSpots.push({
        progress: g.constrain(roughRandom(g, 0.56, 0.86) - i * roughRandom(g, 0.04, 0.08), 0.48, 0.88),
        yBias: roughRandom(g, -0.36, 0.36),
        radius: insectBaseUnit * roughRandom(g, 1.1, 1.3),
        coreOffsetX: -roughRandom(g, 0.08, 0.2),
        coreOffsetY: -roughRandom(g, 0.06, 0.18)
      });
    }
  }

  return {
    mode: useEyeSpots ? "eye-spots-only" : mode,
    tone: colorProfile.spotPalette ? colorProfile.spotPalette.tone : "auto",
    root: outline && outline.length > 0 ? { x: outline[0].x, y: outline[0].y } : { x: 0, y: 0 },
    rimSpots,
    innerSpots,
    eyeSpots
  };
}

function sampleSymmetricInnerSpotPoint(g, outline, bounds, center) {
  let root = outline && outline.length > 0 ? outline[0] : { x: 0, y: 0 };

  for (let i = 0; i < 34; i++) {
    let progress = roughRandom(g, 0.5, 0.6);
    let edge = getWingOutlinePointAtProgress(g, outline, progress, -insectBaseUnit * roughRandom(g, 0.38, 0.6));
    if (!edge) continue;
    let towardEdge = roughRandom(g, 0.82, 0.95);
    let x = root.x + (edge[0] - root.x) * towardEdge + roughRandom(g, -insectBaseUnit * 0.26, insectBaseUnit * 0.26);
    let y = root.y + (edge[1] - root.y) * towardEdge + roughRandom(g, -insectBaseUnit * 0.36, insectBaseUnit * 0.36);
    if (isPointInsideOrOnOutline(x, y, outline, insectBaseUnit * 0.08)) {
      return nudgePointInsideOutline(x, y, center, outline, insectBaseUnit * 0.04);
    }
  }

  return samplePointInsideOutline(g, outline, bounds, center);
}

function drawRoughWingSpotPlan(g, root, center, outline, bounds, colorProfile, spotPlan, includeEyeSpots) {
  if (!spotPlan) return;

  drawRoughWingRimSpotPlan(g, center, outline, colorProfile, spotPlan.rimSpots || []);
  drawRoughWingInnerSpotPlan(g, center, outline, colorProfile, spotPlan.innerSpots || []);
  if (includeEyeSpots) {
    drawRoughWingEyeSpotPlan(g, spotPlan.root || root, center, outline, bounds, colorProfile, spotPlan.eyeSpots || []);
  }
}

function drawRoughWingRimSpotPlan(g, center, outline, colorProfile, rimSpots) {
  for (let spot of rimSpots) {
    // 【修改點】：使用 progress 來取得輪廓點 (回傳的是 [x, y] 陣列)
    let pt = getWingOutlinePointAtProgress(g, outline, spot.progress, 0);
    if (!pt) continue;
    
    // 將點往內推 (inset)，避免畫出界，注意這裡傳入的是 pt[0] 和 pt[1]
    let point = nudgePointInsideOutline(pt[0], pt[1], center, outline, spot.inset);
    
    drawRoughWingPatternDot(g, point[0], point[1], spot.radius, getRoughWingSpotPaint(colorProfile, spot.paintRole), 0.16);
  }
}

function drawRoughWingInnerSpotPlan(g, center, outline, colorProfile, innerSpots) {
  for (let spot of innerSpots) {
    let point = keepRoughParticlePointInsideWing(spot.x, spot.y, center, outline, insectBaseUnit * 0.55);
    drawRoughWingPatternDot(g, point[0], point[1], spot.radius, getRoughWingSpotPaint(colorProfile, spot.paintRole), 0.18);
  }
}

function drawRoughWingEyeSpotPlan(g, root, center, outline, bounds, colorProfile, eyeSpots) {
  let ringPaint = getRoughWingSpotPaint(colorProfile, "primary");
  let middlePaint = getRoughWingSpotPaint(colorProfile, "secondary");
  let centerPaint = getRoughWingSpotPaint(colorProfile, "core");

  for (let spot of eyeSpots) {
    let x = root.x + (bounds.maxX - root.x) * spot.progress;
    let y = center.y + (bounds.maxY - bounds.minY) * spot.yBias * 0.28;
    let point = keepRoughParticlePointInsideWing(x, y, center, outline, insectBaseUnit * 1.05);
    let radius = spot.radius;

    drawRoughWingPatternDot(g, point[0], point[1], radius, ringPaint, 0.45);
    drawRoughWingPatternDot(g, point[0], point[1], radius * 0.62, middlePaint, 0.34);
    drawRoughWingPatternDot(
      g,
      point[0] + radius * spot.coreOffsetX,
      point[1] + radius * spot.coreOffsetY,
      radius * 0.22,
      centerPaint,
      0.2
    );
  }
}

function getRoughWingSpotPaint(colorProfile, role = "primary") {
  let palette = colorProfile && colorProfile.spotPalette;
  if (palette && palette[role]) {
    let alphaCap = role === "primary" ? 220 : (role === "core" ? 205 : 184);
    return colorToBrushPaint(palette[role], alphaCap);
  }
  return colorToBrushPaint(colorProfile && colorProfile.spotPaint, 190);
}

function drawRoughWingRimBand(g, center, outline, colorProfile) {
  let settings = getRoughWingBrushSettings().rimBand;
  let paint = colorToBrushPaint(colorProfile.rimPaint, 118);
  let perimeter = getOutlinePerimeter(outline);
  let step = Math.max(1, insectBaseUnit * roughRandom(g, 1.25, 1.8));
  let count = Math.max(7, Math.floor(perimeter / step));
  let inset = insectBaseUnit * roughRandom(g, 0.62, 0.92);

  brush.set(settings.brushName, paint.color, roughSettingValue(g, settings.brushLoad));
  brush.stroke(paint.color, paint.alpha);
  brush.strokeWeight(roughSettingValue(g, settings.strokeWeight));
  brush.noFill();

  for (let pass = 0; pass < 1; pass++) {
    brush.beginShape(settings.shapeRoughness);
    for (let i = 0; i < count; i++) {
      if (roughRandom(g, 0, 1) < 0.3) continue;
      let perimeterPoint = getPointOnOutlineAtDistance(outline, (perimeter * i) / count + roughRandom(g, -step * 0.18, step * 0.18));
      if (!perimeterPoint) continue;
      let point = nudgePointInsideOutline(perimeterPoint.x, perimeterPoint.y, center, outline, inset);
      let wobble = roughRandom(g, -insectBaseUnit * 0.045, insectBaseUnit * 0.045);
      brush.vertex(point[0] + wobble, point[1] - wobble * 0.35, roughSettingValue(g, settings.vertexPressure));
    }
    brush.endShape(false);
  }
}

function drawRoughWingRimSpots(g, center, outline, colorProfile) {
  let perimeter = getOutlinePerimeter(outline);
  let count = Math.floor(roughRandom(g, 5, 10));
  let offset = roughRandom(g, 0, perimeter / Math.max(1, count));
  let lightPaint = colorToBrushPaint(colorProfile.spotPaint, 150);

  for (let i = 0; i < count; i++) {
    if (roughRandom(g, 0, 1) < 0.28) continue;
    let distance = offset + (perimeter * i) / count + roughRandom(g, -perimeter / count * 0.18, perimeter / count * 0.18);
    let perimeterPoint = getPointOnOutlineAtDistance(outline, distance);
    if (!perimeterPoint) continue;
    let point = nudgePointInsideOutline(perimeterPoint.x, perimeterPoint.y, center, outline, insectBaseUnit * roughRandom(g, 0.72, 1.05));
    let radius = insectBaseUnit * roughRandom(g, 0.08, 0.16);

    drawRoughWingPatternDot(g, point[0], point[1], radius, lightPaint, 0.16);
  }
}

function drawRoughWingRadialBands(g, root, center, outline, bounds, colorProfile, highContrast) {
  let settings = getRoughWingBrushSettings().radialBand;
  let bandCount = highContrast ? Math.floor(roughRandom(g, 1, 3)) : Math.floor(roughRandom(g, 2, 4));
  let paintOptions = [
    colorToBrushPaint(colorProfile.bandPaint, 126),
    colorToBrushPaint(colorProfile.accentPaint, 112)
  ];

  for (let i = 0; i < bandCount; i++) {
    let progress = g.constrain((i + 1) / (bandCount + 1) + roughRandom(g, -0.08, 0.08), 0.18, 0.88);
    let edge = getWingOutlinePointAtProgress(g, outline, progress, -insectBaseUnit * roughRandom(g, 0.8, 1.2));
    if (!edge) continue;
    let start = interpolatePoint(root, edge, roughRandom(g, 0.12, 0.28));
    let end = interpolatePoint(root, edge, roughRandom(g, 0.68, 0.92));
    let paint = paintOptions[i % paintOptions.length];
    let width = highContrast ? roughSettingValue(g, settings.highContrastStrokeWeight) : roughSettingValue(g, settings.softStrokeWeight);

    drawRoughWingPatternStroke(g, start, end, center, outline, paint, roughSettingValue(g, settings.brushLoad), width, i + 137);
  }
}

function drawRoughWingEyeSpots(g, root, center, outline, bounds, colorProfile) {
  let count = 1;
  let ringPaint = colorToBrushPaint(colorProfile.rimPaint, 118);
  let middlePaint = colorToBrushPaint(colorProfile.accentPaint, 136);
  let centerPaint = colorToBrushPaint(colorProfile.spotPaint, 150);

  for (let i = 0; i < count; i++) {
    let progress = roughRandom(g, 0.56, 0.86);
    let yBias = roughRandom(g, -0.36, 0.36);
    let x = root[0] + (bounds.maxX - root[0]) * progress;
    let y = center.y + (bounds.maxY - bounds.minY) * yBias * 0.28;
    let point = keepRoughParticlePointInsideWing(x, y, center, outline, insectBaseUnit * 1.05);
    let radius = insectBaseUnit * roughRandom(g, 0.24, 0.42);

    drawRoughWingPatternDot(g, point[0], point[1], radius, ringPaint, 0.45);
    drawRoughWingPatternDot(g, point[0], point[1], radius * 0.62, middlePaint, 0.34);
    drawRoughWingPatternDot(
      g,
      point[0] - radius * roughRandom(g, 0.08, 0.2),
      point[1] - radius * roughRandom(g, 0.06, 0.18),
      radius * 0.22,
      centerPaint,
      0.2
    );
  }
}

function drawRoughWingPatternDot(g, x, y, radius, paint, roughness) {
  let settings = getRoughWingBrushSettings().patternDot;

  brush.set(settings.brushName, paint.color, roughSettingValue(g, settings.brushLoad));
  brush.stroke(paint.color, paint.alpha);
  brush.fill(paint.color, paint.alpha);
  brush.strokeWeight(roughSettingValue(g, settings.strokeWeight));
  brush.circle(x, y, radius, roughness);
  if (typeof brush.noWash === "function") brush.noWash();
  brush.noFill();
}

function drawRoughWingPatternStroke(g, start, end, center, outline, paint, brushLoad, strokeWeight, noiseIndex) {
  let settings = getRoughWingBrushSettings().radialBand;
  let length = dist2D(start[0], start[1], end[0], end[1]);
  let steps = Math.max(3, Math.floor(length / Math.max(1, insectBaseUnit * 0.5)));
  let normal = getSegmentNormal(start, end);

  brush.set(settings.brushName, paint.color, brushLoad);
  brush.stroke(paint.color, paint.alpha);
  brush.strokeWeight(strokeWeight);
  brush.noFill();
  brush.beginShape(settings.shapeRoughness);
  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let ease = Math.sin(t * Math.PI);
    let x = start[0] + (end[0] - start[0]) * t;
    let y = start[1] + (end[1] - start[1]) * t;
    let wobble = (g.noise(x * 0.08, y * 0.08, noiseIndex * 0.21 + i * 0.17) - 0.5) * insectBaseUnit * 0.55 * ease;
    let point = keepRoughParticlePointInsideWing(
      x + normal.x * wobble,
      y + normal.y * wobble,
      center,
      outline,
      insectBaseUnit * 0.92
    );
    let pressure = settings.pressureBase + ease * settings.pressureTaper;
    brush.vertex(point[0], point[1], roughClampSetting(g, pressure, settings.pressureClamp));
  }
  brush.endShape();
}

function drawRoughWingAccentStrokes(g, root, center, outline, bounds, colorProfile) {
  if (!colorProfile || colorProfile.accentStrength <= 0.08) return;

  let settings = getRoughWingBrushSettings().accent;
  let count = Math.floor(roughRandom(g, 8, 15) * colorProfile.accentStrength);
  let layer = settings;
  let paint = colorToBrushPaint(colorProfile.accentPaint, settings.alpha);

  for (let i = 0; i < count; i++) {
    let start = sampleRoughWingParticleStart(g, outline, bounds, center, root, 1);
    let progress = getRoughWingParticleProgress(g, start, root, bounds);
    if (roughRandom(g, 0, 1) < 0.58) {
      start = samplePointNearOutlineEdge(g, outline, center) || start;
      start = keepRoughParticlePointInsideWing(start[0], start[1], center, outline, insectBaseUnit * 0.28);
    }
    let points = makeRoughWingParticleStroke(g, start, root, center, outline, progress, layer, i + 307);
    if (!points || points.length < 2) continue;

    brush.set(layer.brushName, paint.color, roughSettingValue(g, layer.brushLoad));
    brush.stroke(paint.color, paint.alpha);
    brush.strokeWeight(roughSettingValue(g, layer.strokeWeight));
    brush.noFill();

    brush.beginShape(layer.shapeRoughness);
    for (let j = 0; j < points.length; j++) {
      let pt = points[j];
      let t = points.length <= 1 ? 0 : j / (points.length - 1);
      let pressure = layer.pressureBase + Math.sin(t * Math.PI) * layer.pressureTaper;
      brush.vertex(pt[0], pt[1], roughClampSetting(g, pressure, layer.pressureClamp));
    }
    brush.endShape();
  }
}

function drawRoughWingSpecularStrokes(g, root, center, outline, bounds, colorProfile) {
  if (!colorProfile) return;

  let settings = getRoughWingBrushSettings().specular;
  let ridgeCount = Math.floor(roughRandom(g, 5, 9) * colorProfile.specularStrength);
  let highlightPaint = colorToBrushPaint(colorProfile.highlightPaint, 160);
  let darkPaint = colorToBrushPaint(colorProfile.darkReflectionPaint, 118);

  for (let i = 0; i < ridgeCount; i++) {
    let progress = g.constrain(roughRandom(g, 0.42, 0.92), 0.08, 0.96);
    let edge = getWingOutlinePointAtProgress(g, outline, progress, -insectBaseUnit * roughRandom(g, 0.28, 0.72));
    if (!edge) continue;

    let baseAngle = Math.atan2(edge[1] - root[1], edge[0] - root[0]);
    let length = insectBaseUnit * roughRandom(g, 0.65, 1.45);
    let sweep = roughRandom(g, -0.42, 0.42);
    let darkStart = [
      edge[0] - Math.cos(baseAngle) * insectBaseUnit * roughRandom(g, 0.18, 0.42),
      edge[1] - Math.sin(baseAngle) * insectBaseUnit * roughRandom(g, 0.18, 0.42)
    ];
    let brightStart = [
      edge[0] - Math.cos(baseAngle + sweep) * insectBaseUnit * roughRandom(g, 0.05, 0.18),
      edge[1] - Math.sin(baseAngle + sweep) * insectBaseUnit * roughRandom(g, 0.05, 0.18)
    ];

    drawRoughWingGlintStroke(g, darkStart, baseAngle + sweep, length * 1.12, center, outline, darkPaint, settings.darkBrushLoad, settings.darkStrokeWeight, i + 601);
    drawRoughWingGlintStroke(g, brightStart, baseAngle + sweep * 0.65, length * 0.72, center, outline, highlightPaint, settings.brightBrushLoad, settings.brightStrokeWeight, i + 719);
  }
}

function drawRoughWingGlintStroke(g, start, angle, length, center, outline, paint, brushLoad, strokeWeight, noiseIndex) {
  let settings = getRoughWingBrushSettings().specular;
  let steps = Math.max(2, Math.floor(length / Math.max(1, insectBaseUnit * 0.45)));
  let points = [];
  let normalAngle = angle + Math.PI / 2;

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let flare = Math.sin(t * Math.PI);
    let x = start[0] + Math.cos(angle) * length * t;
    let y = start[1] + Math.sin(angle) * length * t;
    let wobble = (g.noise(x * 0.11, y * 0.11, noiseIndex * 0.19 + i) - 0.5) * insectBaseUnit * 0.16 * flare;
    points.push(keepRoughParticlePointInsideWing(
      x + Math.cos(normalAngle) * wobble,
      y + Math.sin(normalAngle) * wobble,
      center,
      outline,
      insectBaseUnit * 0.32
    ));
  }

  if (points.length < 2) return;

  brush.set(settings.brushName, paint.color, brushLoad * roughSettingValue(g, settings.brushLoadJitter));
  brush.stroke(paint.color, paint.alpha);
  brush.strokeWeight(strokeWeight * roughSettingValue(g, settings.strokeWeightJitter));
  brush.noFill();
  brush.beginShape(settings.shapeRoughness);
  for (let i = 0; i < points.length; i++) {
    let t = points.length <= 1 ? 0 : i / (points.length - 1);
    let pressure = roughClampSetting(g, settings.pressureBase + Math.sin(t * Math.PI) * settings.pressureTaper, settings.pressureClamp);
    brush.vertex(points[i][0], points[i][1], pressure);
  }
  brush.endShape();
}

function getRoughWingGradientColor(g, progress, color1, color2) {
  let c1 = g.color(color1.h_adj, color1.s_adj, color1.b_adj);
  let c2 = g.color(color2.h_adj, color2.s_adj, color2.b_adj);
  let band = g.constrain(progress + roughRandom(g, -0.055, 0.055), 0, 1);
  let mixed = g.lerpColor(c1, c2, band);
  let hueValue = g.hue(mixed);
  let satValue = g.constrain(g.saturation(mixed) + roughRandom(g, 6, 18), 28, 90);
  let briValue = g.constrain(g.brightness(mixed) + roughRandom(g, -8, 6), 30, 84);
  let rgb = hsbToRgb(hueValue, satValue, briValue);

  return {
    roughPaintColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    roughPaintAlpha: 210,
    levels: [rgb.r, rgb.g, rgb.b, 210]
  };
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

function tintRoughWingBrushColor(g, baseColor, colorIndex) {
  let hueShiftSet = [-132, 92, 146, -84, 54, 174];
  let hueShift = hueShiftSet[colorIndex % hueShiftSet.length] + roughRandom(g, -12, 12);
  let sourceHue = g.hue(baseColor);
  let sourceSat = g.saturation(baseColor);
  let sourceBri = g.brightness(baseColor);
  let hueValue = (sourceHue + hueShift + 360) % 360;
  let satValue = g.constrain(sourceSat + roughRandom(g, 44, 64), 68, 100);
  let briValue = g.constrain(sourceBri + roughRandom(g, -30, -6), 34, 72);
  let rgb = hsbToRgb(hueValue, satValue, briValue);

  return {
    roughPaintColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    roughPaintAlpha: 238,
    levels: [rgb.r, rgb.g, rgb.b, 238]
  };
}

function hsbToRgb(h, s, b) {
  let hue = ((h % 360) + 360) % 360;
  let sat = Math.max(0, Math.min(100, s)) / 100;
  let val = Math.max(0, Math.min(100, b)) / 100;
  let chroma = val * sat;
  let x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  let m = val - chroma;
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hue < 60) {
    r1 = chroma;
    g1 = x;
  } else if (hue < 120) {
    r1 = x;
    g1 = chroma;
  } else if (hue < 180) {
    g1 = chroma;
    b1 = x;
  } else if (hue < 240) {
    g1 = x;
    b1 = chroma;
  } else if (hue < 300) {
    r1 = x;
    b1 = chroma;
  } else {
    r1 = chroma;
    b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

function getRoughWingRootPoint(g, outline) {
  let root = outline && outline.length > 0 ? outline[0] : { x: 0, y: 0 };
  return [
    root.x + roughRandom(g, -insectBaseUnit * 0.16, insectBaseUnit * 0.16),
    root.y + roughRandom(g, -insectBaseUnit * 0.22, insectBaseUnit * 0.22)
  ];
}

function getRadialWingProgress(g, index, count, broadPatch = false) {
  let t = count <= 1 ? 0.5 : index / (count - 1);
  let bandRoll = roughRandom(g, 0, 1);
  let progress;

  if (broadPatch) {
    progress = 0.18 + t * 0.68;
  } else if (bandRoll < 0.3) {
    progress = roughRandom(g, 0.12, 0.38);
  } else if (bandRoll < 0.62) {
    progress = roughRandom(g, 0.38, 0.62);
  } else {
    progress = roughRandom(g, 0.62, 0.92);
  }

  return g.constrain(progress + roughRandom(g, -0.035, 0.035), 0.08, 0.94);
}

function getWingOutlinePointAtProgress(g, outline, progress, overshoot = 0) {
  if (!outline || outline.length < 2) return null;

  let indexFloat = g.constrain(progress, 0, 1) * (outline.length - 1);
  let indexA = Math.floor(indexFloat);
  let indexB = Math.min(outline.length - 1, indexA + 1);
  let t = indexFloat - indexA;
  let a = outline[indexA];
  let b = outline[indexB];
  let x = a.x + (b.x - a.x) * t;
  let y = a.y + (b.y - a.y) * t;
  let root = outline[0];
  let dx = x - root.x;
  let dy = y - root.y;
  let d = Math.sqrt(dx * dx + dy * dy);

  if (d > 0.0001) {
    x += (dx / d) * overshoot;
    y += (dy / d) * overshoot;
  }

  return [x, y];
}

function makeRadialWingStrokeStart(g, root, progress) {
  let rootDrift = insectBaseUnit * roughRandom(g, 0.1, 0.75);
  let fanAngle = g.map(progress, 0.08, 0.94, -0.55, 0.72);
  return [
    root[0] + Math.cos(fanAngle) * rootDrift + roughRandom(g, -insectBaseUnit * 0.22, insectBaseUnit * 0.22),
    root[1] + Math.sin(fanAngle) * rootDrift + roughRandom(g, -insectBaseUnit * 0.28, insectBaseUnit * 0.28)
  ];
}

function makeRadialWingMarkerStroke(g, start, end, root, center, outline, progress) {
  let length = dist2D(start[0], start[1], end[0], end[1]);
  let steps = Math.max(4, Math.floor(length / Math.max(1, insectBaseUnit * 0.62)));
  let normal = getSegmentNormal(start, end);
  let direction = getSegmentDirection(start, end);
  let points = [];
  let jitter = insectBaseUnit * 0.18;
  let bowAmount = roughRandom(g, -insectBaseUnit * 0.55, insectBaseUnit * 0.55);
  let wingFlow = progress < 0.5 ? -1 : 1;
  let endOvershoot = insectBaseUnit * roughRandom(g, 0.25, 1.25);

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let ease = Math.sin(t * Math.PI);
    let x = start[0] + (end[0] + direction.x * endOvershoot - start[0]) * t;
    let y = start[1] + (end[1] + direction.y * endOvershoot - start[1]) * t;
    let grain = g.noise(root[0] * 0.03 + t * 2.4, root[1] * 0.03 + progress * 6.0, i * 0.17);
    let sideSlip = (grain - 0.5) * jitter * 2 + bowAmount * ease;
    let dryBrushGap = roughRandom(g, 0, 1) < 0.08 && t > 0.18 && t < 0.92;

    if (dryBrushGap) continue;

    x += normal.x * sideSlip + wingFlow * roughRandom(g, -jitter, jitter) * 0.24 * ease;
    y += normal.y * sideSlip + roughRandom(g, -jitter, jitter) * 0.36 * ease;

    if (isPointInsideOrOnOutline(x, y, outline, insectBaseUnit * 1.25) || roughRandom(g, 0, 1) < 0.9) {
      points.push([x, y]);
    }
  }

  return points;
}

function drawRadialWingWash(g, root, center, outline, bounds, washColor, progress, patchIndex) {
  let settings = getRoughWingBrushSettings().radialWash;
  let spread = roughRandom(g, 0.08, 0.18);
  let p1 = g.constrain(progress - spread, 0.08, 0.94);
  let p2 = g.constrain(progress + spread * roughRandom(g, 0.75, 1.25), 0.08, 0.94);
  let edgeA = getWingOutlinePointAtProgress(g, outline, p1, insectBaseUnit * roughRandom(g, 0.0, 0.65));
  let edgeB = getWingOutlinePointAtProgress(g, outline, p2, insectBaseUnit * roughRandom(g, 0.0, 0.75));
  if (!edgeA || !edgeB) return;

  let paint = colorToBrushPaint(washColor, settings.alpha);
  let innerA = interpolatePoint(root, edgeA, roughRandom(g, 0.12, 0.28));
  let innerB = interpolatePoint(root, edgeB, roughRandom(g, 0.16, 0.34));
  let mid = interpolatePoint(root, [
    (edgeA[0] + edgeB[0]) * 0.5,
    (edgeA[1] + edgeB[1]) * 0.5
  ], roughRandom(g, 0.55, 0.78));
  let polygonPoints = [
    jitterArrayPoint(g, innerA, insectBaseUnit * 0.22),
    jitterArrayPoint(g, mid, insectBaseUnit * 0.55),
    jitterArrayPoint(g, edgeB, insectBaseUnit * 0.42),
    jitterArrayPoint(g, interpolatePoint(edgeB, edgeA, 0.45), insectBaseUnit * 0.5),
    jitterArrayPoint(g, edgeA, insectBaseUnit * 0.42),
    jitterArrayPoint(g, innerB, insectBaseUnit * 0.2)
  ];

  if (typeof brush.fill === "function") brush.fill(paint.color, paint.alpha);
  if (typeof brush.fillBleed === "function") brush.fillBleed(roughSettingValue(g, settings.fillBleed), "out");
  if (typeof brush.fillTexture === "function") brush.fillTexture(roughSettingValue(g, settings.fillTextureAmount), roughSettingValue(g, settings.fillTextureScale), false);
  brush.noStroke();

  brush.beginShape(settings.shapeRoughness);
  for (let pt of polygonPoints) {
    let x = pt[0];
    let y = pt[1];
    if (!isPointInsideOrOnOutline(x, y, outline, insectBaseUnit * 1.2) && roughRandom(g, 0, 1) < 0.55) {
      let nudged = nudgePointInsideOutline(x, y, center, outline, insectBaseUnit * 0.04);
      x = nudged[0];
      y = nudged[1];
    }
    brush.vertex(x, y, roughSettingValue(g, settings.vertexPressure));
  }
  brush.endShape(true);
  brush.noFill();
}

function interpolatePoint(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t
  ];
}

function jitterArrayPoint(g, point, amount) {
  return [
    point[0] + roughRandom(g, -amount, amount),
    point[1] + roughRandom(g, -amount, amount)
  ];
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

function sampleLooseWingBrushPoint(g, outline, bounds, center, preferEdge = false) {
  let point = preferEdge
    ? samplePointNearOutlineEdge(g, outline, center)
    : samplePointInsideOutline(g, outline, bounds, center);
  if (!point) return [center.x, center.y];

  let overshoot = insectBaseUnit * roughRandom(g, -0.28, 0.72);
  let dx = point[0] - center.x;
  let dy = point[1] - center.y;
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d > 0.0001) {
    point[0] += (dx / d) * overshoot;
    point[1] += (dy / d) * overshoot;
  }

  return point;
}

function samplePointNearOutlineEdge(g, outline, center) {
  if (!outline || outline.length < 2) return null;

  let edgeIndex = Math.floor(roughRandom(g, 0, outline.length));
  let a = outline[edgeIndex];
  let b = outline[(edgeIndex + 1) % outline.length];
  let t = roughRandom(g, 0, 1);
  let x = a.x + (b.x - a.x) * t;
  let y = a.y + (b.y - a.y) * t;
  let inset = insectBaseUnit * roughRandom(g, 0.05, 0.5);
  let dx = center.x - x;
  let dy = center.y - y;
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d > 0.0001) {
    x += (dx / d) * inset;
    y += (dy / d) * inset;
  }
  return [x, y];
}

function makeRoughMarkerStroke(g, start, end, center, outline, allowOvershoot = false) {
  let length = dist2D(start[0], start[1], end[0], end[1]);
  let steps = Math.max(3, Math.floor(length / Math.max(1, insectBaseUnit * 0.8)));
  let normal = getSegmentNormal(start, end);
  let direction = getSegmentDirection(start, end);
  let bowAmount = roughRandom(g, -insectBaseUnit * 0.85, insectBaseUnit * 0.85);
  let jitter = insectBaseUnit * (allowOvershoot ? 0.28 : 0.16);
  let endpointOvershoot = allowOvershoot ? insectBaseUnit * roughRandom(g, 0.25, 1.15) : 0;
  let looseStart = [
    start[0] - direction.x * endpointOvershoot + normal.x * roughRandom(g, -jitter, jitter),
    start[1] - direction.y * endpointOvershoot + normal.y * roughRandom(g, -jitter, jitter)
  ];
  let looseEnd = [
    end[0] + direction.x * endpointOvershoot + normal.x * roughRandom(g, -jitter, jitter),
    end[1] + direction.y * endpointOvershoot + normal.y * roughRandom(g, -jitter, jitter)
  ];
  let points = [];

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let ease = Math.sin(t * Math.PI);
    let x = looseStart[0] + (looseEnd[0] - looseStart[0]) * t;
    let y = looseStart[1] + (looseEnd[1] - looseStart[1]) * t;
    let wobble = (g.noise(x * 0.03, y * 0.03, i * 0.2) - 0.5) * jitter * 2;

    x += normal.x * (bowAmount * ease + wobble * ease) + roughRandom(g, -jitter, jitter) * 0.35 * ease;
    y += normal.y * (bowAmount * ease + wobble * ease) + roughRandom(g, -jitter, jitter) * 0.35 * ease;
    if (allowOvershoot) {
      let maxLooseDistance = insectBaseUnit * 1.35;
      if (isPointInsideOrOnOutline(x, y, outline, maxLooseDistance) || roughRandom(g, 0, 1) < 0.88) {
        points.push([x, y]);
      }
    } else {
      points.push(jitterPointInsideOutline(g, x, y, center, outline, insectBaseUnit * 0.02));
    }
  }

  return points;
}

function drawLooseWingColorPatch(g, outline, bounds, center, patchColor, patchIndex) {
  let settings = getRoughWingBrushSettings().loosePatch;
  let anchor = sampleLooseWingBrushPoint(g, outline, bounds, center, patchIndex % 2 === 0);
  if (!anchor) return;

  let paint = colorToBrushPaint(patchColor, settings.alpha);
  let radiusX = roughRandom(g, insectBaseUnit * 0.7, insectBaseUnit * 2.2);
  let radiusY = roughRandom(g, insectBaseUnit * 0.35, insectBaseUnit * 1.25);
  let rotation = roughRandom(g, -0.9, 0.9);
  let vertexCount = Math.floor(roughRandom(g, 7, 12));

  brush.set(settings.brushName, paint.color, roughSettingValue(g, settings.brushLoad));
  brush.stroke(paint.color, paint.alpha);
  brush.strokeWeight(roughSettingValue(g, settings.strokeWeight));
  brush.noFill();

  for (let pass = 0; pass < 2; pass++) {
    brush.beginShape(settings.shapeRoughness);
    for (let i = 0; i <= vertexCount; i++) {
      let a = (i / vertexCount) * g.TWO_PI;
      let grain = roughRandom(g, 0.72, 1.25);
      let lx = Math.cos(a) * radiusX * grain;
      let ly = Math.sin(a) * radiusY * roughRandom(g, 0.65, 1.35);
      let x = anchor[0] + lx * Math.cos(rotation) - ly * Math.sin(rotation);
      let y = anchor[1] + lx * Math.sin(rotation) + ly * Math.cos(rotation);
      x += roughRandom(g, -insectBaseUnit * 0.24, insectBaseUnit * 0.24);
      y += roughRandom(g, -insectBaseUnit * 0.24, insectBaseUnit * 0.24);

      if (!isPointInsideOrOnOutline(x, y, outline, insectBaseUnit * 1.15) && roughRandom(g, 0, 1) < 0.65) {
        let nudged = nudgePointInsideOutline(x, y, center, outline, insectBaseUnit * 0.08);
        x = nudged[0];
        y = nudged[1];
      }

      brush.vertex(x, y, roughSettingValue(g, settings.vertexPressure));
    }
    brush.endShape();
  }
}
