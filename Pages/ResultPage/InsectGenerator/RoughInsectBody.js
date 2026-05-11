function createRoughInsectBodyPlan(g, seedValue, insectType) {
  if (insectType !== 0) return null;

  setRoughSeed(g, seedValue + 313);

  let u = insectBaseUnit;
  let centerDriftX = roughRandom(g, -0.12 * u, 0.12 * u);
  let rootY = roughRandom(g, 0.05 * u, 0.34 * u);
  let bodyLength = roughRandom(g, 5.8 * u, 7.2 * u);
  let gestureSide = roughRandom(g, 0, 1) < 0.5 ? -1 : 1;
  let bodyCurve = gestureSide * roughRandom(g, 0.22 * u, 0.62 * u);
  let topY = rootY - roughRandom(g, 0.74 * u, 1.04 * u);
  let bottomY = rootY + bodyLength;

  return {
    insectType,
    centerX: centerDriftX,
    topY,
    rootY,
    headY: topY + roughRandom(g, 0.12 * u, 0.28 * u),
    bottomY,
    curveX: bodyCurve,
    wingRootY: rootY,
    wingRootHalfWidth: roughRandom(g, 0.34 * u, 0.48 * u),
    antennaSpread: roughRandom(g, 1.65 * u, 2.35 * u),
    antennaLength: roughRandom(g, 2.2 * u, 3.1 * u),
    gestureSide
  };
}

function drawRoughInsectBody(g, bodyPlan, seedValue) {
  if (!bodyPlan || bodyPlan.insectType !== 0) return;

  setRoughSeed(g, seedValue + 719);

  g.push();
  g.colorMode(RGB, 255, 255, 255, 255);

  let u = insectBaseUnit;
  let ink = "#050504";
  let softInk = "#151511";

  drawRoughBodyGestureAxis(g, bodyPlan, ink, u);
  drawRoughBodyRhythmMarks(g, bodyPlan, ink, softInk, u);
  drawRoughBodyGestureAntennae(g, bodyPlan, ink, u);

  g.pop();
}

function drawRoughBodyGestureAxis(g, plan, ink, u) {
  let x = plan.centerX;
  let side = plan.gestureSide || 1;
  let rootY = plan.rootY;
  let bottomY = plan.bottomY;

  let points = [
    [x - side * 0.08 * u, rootY - 0.38 * u, 0.18],
    [x + side * 0.03 * u, rootY + 0.68 * u, 0.72],
    [x + plan.curveX * 0.58, rootY + 2.15 * u, 0.9],
    [x + plan.curveX * 0.78, rootY + 4.1 * u, 0.56],
    [x + plan.curveX * 0.28, bottomY, 0.1]
  ];

  drawHumanBrushStroke(g, points, {
    brushName: "pencil1",
    color: ink,
    brushWeight: roughRandom(g, 0.58, 0.82),
    strokeWeight: roughRandom(g, 1.3, 2),
    curvature: 0.18,
    jitter: 0.035 * u
  });

  if (roughRandom(g, 0, 1) < 0.55) {
    let echoPoints = [
      [x - side * 0.18 * u, rootY + 0.28 * u, 0.08],
      [x - side * 0.34 * u, rootY + 1.25 * u, 0.28],
      [x - side * 0.18 * u + plan.curveX * 0.2, rootY + 2.45 * u, 0.16]
    ];
    drawHumanBrushStroke(g, echoPoints, {
      brushName: "pencil1",
      color: ink,
      brushWeight: roughRandom(g, 0.32, 0.46),
      strokeWeight: roughRandom(g, 0.8, 1.5),
      curvature: 0.24,
      jitter: 0.025 * u
    });
  }
}

function drawRoughBodyRhythmMarks(g, plan, ink, softInk, u) {
  let side = plan.gestureSide || 1;
  let collarY = plan.rootY + roughRandom(g, -0.18 * u, 0.06 * u);
  let collarLen = roughRandom(g, 0.62 * u, 0.92 * u);

  drawHumanBrushStroke(g, [
    [plan.centerX - side * collarLen * 0.5, collarY + 0.08 * u, 0.1],
    [plan.centerX - side * collarLen * 0.1, collarY - 0.08 * u, 0.42],
    [plan.centerX + side * collarLen * 0.42, collarY + 0.02 * u, 0.16]
  ], {
    brushName: "pencil1",
    color: softInk,
    brushWeight: roughRandom(g, 0.26, 0.4),
    strokeWeight: roughRandom(g, 0.34, 0.52),
    curvature: 0.2,
    jitter: 0.02 * u
  });

  drawRoughPressureDot(g, plan.centerX, plan.headY, ink, roughRandom(g, 0.22 * u, 0.34 * u));
}

function drawRoughBodyGestureAntennae(g, plan, ink, u) {
  let baseX = plan.centerX;
  let baseY = plan.headY - 0.12 * u;
  let spread = plan.antennaSpread;
  let len = plan.antennaLength;
  let lift = roughRandom(g, 0.22 * u, 0.58 * u);
  let curl = roughRandom(g, 0.08 * u, 0.28 * u);

  drawHumanBrushStroke(g, [
    [baseX - 0.04 * u, baseY, 0.08],
    [baseX - spread * 0.28, baseY - len * 0.32, 0.32],
    [baseX - spread * 0.78, baseY - len * 0.72, 0.2],
    [baseX - spread - curl, baseY - len + lift, 0.04]
  ], {
    brushName: "pencil1",
    color: ink,
    brushWeight: roughRandom(g, 0.34, 0.48),
    strokeWeight: roughRandom(g, 0.36, 0.54),
    curvature: 0.28,
    jitter: 0.018 * u
  });

  drawHumanBrushStroke(g, [
    [baseX + 0.04 * u, baseY, 0.08],
    [baseX + spread * 0.28, baseY - len * 0.32, 0.32],
    [baseX + spread * 0.78, baseY - len * 0.72, 0.2],
    [baseX + spread + curl, baseY - len + lift, 0.04]
  ], {
    brushName: "pencil1",
    color: ink,
    brushWeight: roughRandom(g, 0.34, 0.48),
    strokeWeight: roughRandom(g, 0.36, 0.54),
    curvature: 0.28,
    jitter: 0.018 * u
  });
}

function drawHumanBrushStroke(g, points, options) {
  if (!points || points.length < 2) return;

  if (typeof brush !== "undefined") {
    brush.set(options.brushName || "pencil1", options.color, options.brushWeight || 0.3);
    brush.strokeWeight(options.strokeWeight || 0.35);
    brush.beginShape(options.curvature || 0.16);
    for (let i = 0; i < points.length; i++) {
      let point = points[i];
      let jitter = options.jitter || 0;
      brush.vertex(
        point[0] + roughRandom(g, -jitter, jitter),
        point[1] + roughRandom(g, -jitter, jitter)
      );
    }
    brush.endShape();
    drawNativePressureHints(g, points, options);
    return;
  }

  drawFallbackGestureStroke(g, points, options);
}

function drawNativePressureHints(g, points, options) {
  if (!options.showPressureHints && options.showPressureHints !== undefined) return;

  g.push();
  g.noFill();
  g.stroke(options.color || "#9b2f3d");
  g.strokeCap(ROUND);
  g.strokeJoin(ROUND);

  for (let i = 0; i < points.length - 1; i++) {
    let a = points[i];
    let b = points[i + 1];
    let pressure = Math.max(a[2] || 0.25, b[2] || 0.25);
    let weight = Math.max(0.45, (options.strokeWeight || 0.35) * pressure * 1.15);
    g.strokeWeight(weight);
    g.line(a[0], a[1], b[0], b[1]);
  }

  g.pop();
}

function drawFallbackGestureStroke(g, points, options) {
  g.noFill();
  g.stroke(options.color || "#702a32");
  g.strokeWeight(Math.max(0.5, (options.strokeWeight || 0.35) * 1.2));
  g.beginShape();
  for (let i = 0; i < points.length; i++) {
    g.curveVertex(points[i][0], points[i][1]);
  }
  g.endShape();
}

function drawRoughPressureDot(g, x, y, colorValue, size) {
  g.push();
  g.noStroke();
  g.fill(colorValue);
  g.ellipse(
    x + roughRandom(g, -0.05 * insectBaseUnit, 0.05 * insectBaseUnit),
    y + roughRandom(g, -0.05 * insectBaseUnit, 0.05 * insectBaseUnit),
    size,
    size * roughRandom(g, 0.72, 1.05)
  );
  g.pop();
}
