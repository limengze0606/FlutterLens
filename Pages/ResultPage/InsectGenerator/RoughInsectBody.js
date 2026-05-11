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
  let pose = plan.posePlan || null;
  let rootY = plan.rootY;
  let bottomY = plan.bottomY;
  let poseLean = pose ? pose.yaw * 1.45 * u + pose.pitch * 0.45 * u : 0;
  let flapLean = pose ? pose.phase.lift * 0.58 * u : 0;
  let bellySwing = pose ? pose.nearSide * Math.abs(pose.yaw) * 1.15 * u : 0;
  let head = getRoughPoseBodyPoint(plan, -0.16, -side * 0.12 * u + poseLean * 0.18, -0.22 * u + flapLean * 0.22);
  let thorax = getRoughPoseBodyPoint(plan, 0.08, poseLean * 0.38, 0);
  let waist = getRoughPoseBodyPoint(plan, 0.34, poseLean * 0.7 + bellySwing * 0.22, 0.06 * u);
  let abdomen = getRoughPoseBodyPoint(plan, 0.68, poseLean + bellySwing * 0.45, 0.12 * u);
  let tail = getRoughPoseBodyPoint(plan, 1.0, poseLean * 1.2 + bellySwing, pose && pose.pitch > 0 ? 0.5 * u : 0);

  let points = [
    [head.x, head.y, 0.22],
    [thorax.x, thorax.y, 0.86],
    [waist.x, waist.y, 1.0],
    [abdomen.x, abdomen.y, 0.66],
    [tail.x, tail.y, 0.16]
  ];

  drawHumanBrushStroke(g, points, {
    brushName: "pencil1",
    color: ink,
    brushWeight: roughRandom(g, 0.72, 0.98),
    strokeWeight: roughRandom(g, 2.0, 2.85),
    curvature: 0.22,
    jitter: 0.035 * u
  });

  drawRoughThoraxMass(g, thorax.x, thorax.y, waist.x, waist.y, ink, u, pose);

  if (roughRandom(g, 0, 1) < 0.55) {
    let echoPoints = [
      [thorax.x - side * 0.28 * u, thorax.y + 0.1 * u, 0.1],
      [waist.x - side * 0.42 * u, waist.y + 0.2 * u, 0.32],
      [abdomen.x - side * 0.24 * u, abdomen.y + 0.08 * u, 0.18]
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
  let pose = plan.posePlan || null;
  let poseLean = pose ? pose.yaw * 0.68 * u + pose.phase.lift * 0.22 * u : 0;
  let collar = getRoughPoseBodyPoint(plan, 0.04, poseLean, roughRandom(g, -0.18 * u, 0.06 * u));
  let collarLen = roughRandom(g, 0.92 * u, 1.32 * u);

  drawHumanBrushStroke(g, [
    [collar.x - side * collarLen * 0.5, collar.y + 0.08 * u, 0.12],
    [collar.x - side * collarLen * 0.1, collar.y - 0.08 * u, 0.48],
    [collar.x + side * collarLen * 0.42, collar.y + 0.02 * u, 0.18]
  ], {
    brushName: "pencil1",
    color: softInk,
    brushWeight: roughRandom(g, 0.34, 0.52),
    strokeWeight: roughRandom(g, 0.68, 1.05),
    curvature: 0.2,
    jitter: 0.02 * u
  });

  let head = getRoughPoseBodyPoint(plan, -0.18, poseLean * 0.26, -0.2 * u);
  drawRoughPressureDot(g, head.x, head.y, ink, roughRandom(g, 0.36 * u, 0.52 * u));
}

function drawRoughBodyGestureAntennae(g, plan, ink, u) {
  let pose = plan.posePlan || null;
  let lean = pose ? pose.yaw * 0.52 * u + pose.phase.lift * 0.16 * u : 0;
  let head = getRoughPoseBodyPoint(plan, -0.2, lean, -0.22 * u);
  let baseX = head.x;
  let baseY = head.y - 0.12 * u;
  let spread = plan.antennaSpread;
  let len = plan.antennaLength * (pose ? 1 + Math.abs(pose.yaw) * 0.16 : 1);
  let lift = roughRandom(g, 0.22 * u, 0.58 * u);
  let curl = roughRandom(g, 0.08 * u, 0.28 * u);
  let antennaSkew = pose ? pose.yaw * 0.38 * u : 0;

  drawHumanBrushStroke(g, [
    [baseX - 0.04 * u, baseY, 0.08],
    [baseX - spread * 0.28 + antennaSkew * 0.3, baseY - len * 0.32, 0.32],
    [baseX - spread * 0.78 + antennaSkew * 0.62, baseY - len * 0.72, 0.2],
    [baseX - spread - curl + antennaSkew, baseY - len + lift, 0.04]
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
    [baseX + spread * 0.28 + antennaSkew * 0.3, baseY - len * 0.32, 0.32],
    [baseX + spread * 0.78 + antennaSkew * 0.62, baseY - len * 0.72, 0.2],
    [baseX + spread + curl + antennaSkew, baseY - len + lift, 0.04]
  ], {
    brushName: "pencil1",
    color: ink,
    brushWeight: roughRandom(g, 0.34, 0.48),
    strokeWeight: roughRandom(g, 0.36, 0.54),
    curvature: 0.28,
    jitter: 0.018 * u
  });
}

function getRoughPoseBodyPoint(plan, t, xOffset = 0, yOffset = 0) {
  let rootY = plan.rootY;
  let bodyLen = plan.bottomY - rootY;
  let curve = plan.curveX || 0;
  let tClamped = Math.max(-0.35, Math.min(1.15, t));
  let arc = Math.sin(Math.max(0, Math.min(1, tClamped)) * Math.PI);

  return {
    x: plan.centerX + curve * arc + xOffset,
    y: rootY + bodyLen * tClamped + yOffset
  };
}

function drawRoughThoraxMass(g, x1, y1, x2, y2, ink, u, pose) {
  g.push();
  g.noFill();
  g.stroke(ink);
  g.strokeCap(ROUND);
  g.strokeJoin(ROUND);
  g.strokeWeight(Math.max(1.2, u * 0.22));

  let angle = Math.atan2(y2 - y1, x2 - x1);
  let rx = u * (pose ? 0.62 + Math.abs(pose.yaw) * 0.18 : 0.62);
  let ry = u * 0.38;
  g.translate((x1 + x2) * 0.5, (y1 + y2) * 0.5);
  g.rotate(angle);
  g.ellipse(0, 0, rx, ry);
  g.pop();
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
