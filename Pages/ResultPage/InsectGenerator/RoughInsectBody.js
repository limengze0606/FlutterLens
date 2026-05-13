function createRoughInsectBodyPlan(g, seedValue, insectType) {
  if (insectType !== 0) return null;

  setRoughSeed(g, seedValue + 313);

  let u = insectBaseUnit;
  let centerDriftX = roughRandom(g, -0.12 * u, 0.12 * u);
  let rootY = roughRandom(g, 0.12 * u, 0.26 * u);
  let headY = rootY - roughRandom(g, 1.24 * u, 1.46 * u);
  let thoraxY = rootY + roughRandom(g, 0.18 * u, 0.36 * u);
  let abdomenY = rootY + roughRandom(g, 0.9 * u, 1.2 * u);
  let bottomY = abdomenY + roughRandom(g, 6 * u, 8 * u);
  let headRx = roughRandom(g, 0.5 * u, 0.62 * u);
  let thoraxRx = roughRandom(g, 0.76 * u, 0.94 * u);
  let abdomenRx = roughRandom(g, 0.66 * u, 0.82 * u);

  return {
    insectType,
    centerX: centerDriftX,
    topY: headY - headRx,
    rootY,
    headY,
    bottomY,
    curveX: 0,
    wingRootY: rootY,
    wingRootHalfWidth: roughRandom(g, 0.38 * u, 0.5 * u),
    anatomy: {
      head: {
        x: centerDriftX,
        y: headY,
        rx: headRx,
        ry: roughRandom(g, 0.58 * u, 0.72 * u),
        rotation: 0
      },
      thorax: {
        x: centerDriftX,
        y: thoraxY,
        rx: thoraxRx,
        ry: roughRandom(g, 0.96 * u, 1.18 * u),
        rotation: 0
      },
      abdomen: {
        x: centerDriftX,
        y: (abdomenY + bottomY) * 0.5,
        rx: abdomenRx,
        ry: (bottomY - abdomenY) * 0.5,
        rotation: 0
      }
    },
    antennaSpread: 0,
    antennaLength: 0,
    gestureSide: 1
  };
}

function drawRoughInsectBody(g, bodyPlan, seedValue) {
  if (!bodyPlan || bodyPlan.insectType !== 0) return;

  setRoughSeed(g, seedValue + 719);

  g.push();
  g.colorMode(RGB, 255, 255, 255, 255);

  let u = insectBaseUnit;
  let ink = "#050504";

  drawRoughBodySimpleOutline(g, bodyPlan, ink, u);

  g.pop();
}

function drawRoughBodySimpleOutline(g, plan, ink, u) {
  if (!plan.anatomy) return;

  let anatomy = getRoughSimpleBodyPoseAnatomy(plan, u);

  drawRoughOutlineOval(g, anatomy.abdomen, ink, {
    strokeWeight: roughRandom(g, 1.5, 1.8),
    wobble: 0.055 * u,
    passes: 2
  });
  drawRoughOutlineOval(g, anatomy.thorax, ink, {
    strokeWeight: roughRandom(g, 1.82, 2.36),
    wobble: 0.05 * u,
    passes: 2
  });
  drawRoughOutlineOval(g, anatomy.head, ink, {
    strokeWeight: roughRandom(g, 1.7, 2.02),
    wobble: 0.04 * u,
    passes: 2
  });
  drawRoughSimpleAntennae(g, anatomy.head, ink, u);
}

function getRoughSimpleBodyPoseAnatomy(plan, u) {
  let pose = plan.posePlan || null;
  if (!pose) return plan.anatomy;

  let lean = pose.bodyLeanX || 0;
  let tilt = ((pose.bodyTiltDegrees || 0) * Math.PI) / 180;
  let scaleX = pose.bodyScaleX || 1;
  let scaleY = pose.bodyScaleY || 1;
  let anchor = getRoughBodyPoseAnchor(plan);

  return {
    head: transformRoughSimpleBodyOval(plan.anatomy.head, plan, anchor, lean, tilt, scaleX, scaleY),
    thorax: transformRoughSimpleBodyOval(plan.anatomy.thorax, plan, anchor, lean, tilt, scaleX, scaleY),
    abdomen: transformRoughSimpleBodyOval(plan.anatomy.abdomen, plan, anchor, lean, tilt, scaleX, scaleY)
  };
}

function getRoughBodyPoseAnchor(plan) {
  let thorax = plan.anatomy && plan.anatomy.thorax ? plan.anatomy.thorax : null;

  return {
    x: thorax ? thorax.x : plan.centerX,
    y: thorax ? thorax.y : plan.rootY
  };
}

function transformRoughSimpleBodyOval(oval, plan, anchor, lean, rotation, scaleX, scaleY) {
  let bodyLen = Math.max(insectBaseUnit, plan.bottomY - plan.rootY);
  let axisT = (oval.y - anchor.y) / bodyLen;
  let localX = (oval.x - anchor.x) * scaleX + lean * axisT;
  let localY = (oval.y - anchor.y) * scaleY;
  let cosA = Math.cos(rotation);
  let sinA = Math.sin(rotation);

  return {
    x: anchor.x + localX * cosA - localY * sinA,
    y: anchor.y + localX * sinA + localY * cosA,
    rx: oval.rx * scaleX,
    ry: oval.ry * scaleY,
    rotation: (oval.rotation || 0) + rotation
  };
}

function drawRoughSimpleAntennae(g, head, ink, u) {
  let baseY = head.y - head.ry * 0.72;
  let baseGap = head.rx * 0.28;
  let reachX = roughRandom(g, 0.92 * u, 1.24 * u);
  let reachY = roughRandom(g, 3.26 * u, 4.64 * u);
  let curveOut = roughRandom(g, 0.18 * u, 0.34 * u);

  drawRoughAntennaLine(g, [
    [head.x - baseGap, baseY],
    [head.x - reachX * 0.52, baseY - reachY * 0.48],
    [head.x - reachX - curveOut, baseY - reachY]
  ], ink, {
    strokeWeight: roughRandom(g, 0.82, 1.18),
    jitter: 0.018 * u
  });

  drawRoughAntennaLine(g, [
    [head.x + baseGap, baseY],
    [head.x + reachX * 0.52, baseY - reachY * 0.48],
    [head.x + reachX + curveOut, baseY - reachY]
  ], ink, {
    strokeWeight: roughRandom(g, 0.82, 1.18),
    jitter: 0.018 * u
  });
}

function drawRoughAntennaLine(g, points, ink, options = {}) {
  let jitter = options.jitter || 0;

  if (typeof brush !== "undefined") {
    brush.noFill();
    brush.set("pencil1", ink, 1);
    brush.stroke(ink, 238);
    brush.strokeWeight(options.strokeWeight || 1);
    brush.beginShape(0.18);
    for (let point of points) {
      brush.vertex(
        point[0] + roughRandom(g, -jitter, jitter),
        point[1] + roughRandom(g, -jitter, jitter)
      );
    }
    brush.endShape();
    return;
  }

  g.push();
  g.noFill();
  g.stroke(ink);
  g.strokeWeight(options.strokeWeight || 1);
  g.beginShape();
  for (let point of points) {
    g.curveVertex(point[0], point[1]);
  }
  g.endShape();
  g.pop();
}

function drawRoughOutlineOval(g, oval, ink, options = {}) {
  let passes = options.passes || 1;
  let wobble = options.wobble || 0;
  let rotation = oval.rotation || 0;

  if (typeof brush !== "undefined") {
    brush.noFill();
    brush.set("pencil1", ink, 1);
    brush.stroke(ink, 248);
    brush.strokeWeight(options.strokeWeight || 1);

    for (let pass = 0; pass < passes; pass++) {
      brush.beginShape(0.12);
      let count = 28;
      for (let i = 0; i <= count; i++) {
        let t = (i / count) * Math.PI * 2;
        let localX = Math.cos(t) * (oval.rx + roughRandom(g, -wobble, wobble));
        let localY = Math.sin(t) * (oval.ry + roughRandom(g, -wobble, wobble));
        let point = rotateLocalPoint(oval.x, oval.y, localX, localY, rotation);
        brush.vertex(point.x, point.y, roughRandom(g, 0.32, 0.74));
      }
      brush.endShape(true);
    }
    return;
  }

  g.push();
  g.translate(oval.x, oval.y);
  g.rotate(rotation);
  g.noFill();
  g.stroke(ink);
  g.strokeWeight(options.strokeWeight || 1);
  g.ellipse(0, 0, oval.rx * 2, oval.ry * 2);
  g.pop();
}

function drawRoughBodyGestureAxis(g, plan, ink, u) {
  let side = plan.gestureSide || 1;
  let pose = plan.posePlan || null;
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
    strokeWeight: roughRandom(g, 1.1, 1.7),
    curvature: 0.22,
    jitter: 0.035 * u
  });

  if (roughRandom(g, 0, 1) < 0.55) {
    let echoPoints = [
      [thorax.x - side * 0.28 * u, thorax.y + 0.1 * u, 0.1],
      [waist.x - side * 0.42 * u, waist.y + 0.2 * u, 0.32],
      [abdomen.x - side * 0.24 * u, abdomen.y + 0.08 * u, 0.18]
    ];
    drawHumanBrushStroke(g, echoPoints, {
      brushName: "pencil1",
      color: ink,
      strokeWeight: roughRandom(g, 0.8, 1.5),
      curvature: 0.24,
      jitter: 0.025 * u
    });
  }
}

function drawRoughBodyFigurativeMasses(g, plan, ink, softInk, warmInk, u) {
  let anatomy = buildRoughBodyAnatomy(plan, u);
  let pose = plan.posePlan || null;
  let yawAmount = pose ? Math.abs(pose.yaw) : 0;
  let pitchAmount = pose ? Math.abs(pose.pitch) : 0;
  let bodyAngle = anatomy.angle - Math.PI / 2;

  drawRoughBrushOval(g, anatomy.abdomen.x, anatomy.abdomen.y, {
    rx: u * (0.56 + yawAmount * 0.12),
    ry: u * (2.2 + pitchAmount * 0.3),
    rotation: bodyAngle + anatomy.abdomenTwist,
    fill: warmInk,
    outline: ink,
    fillAlpha: 214,
    outlineWeight: roughRandom(g, 0.78, 1.2),
    passes: 3,
    wobble: 0.075 * u
  });

  drawRoughBrushOval(g, anatomy.thorax.x, anatomy.thorax.y, {
    rx: u * (0.86 + yawAmount * 0.2),
    ry: u * (1.06 + pitchAmount * 0.2),
    rotation: bodyAngle + anatomy.thoraxTwist,
    fill: ink,
    outline: ink,
    fillAlpha: 226,
    outlineWeight: roughRandom(g, 0.9, 1.35),
    passes: 4,
    wobble: 0.08 * u
  });

  drawRoughBrushOval(g, anatomy.head.x, anatomy.head.y, {
    rx: u * (0.5 + yawAmount * 0.06),
    ry: u * (0.58 + pitchAmount * 0.08),
    rotation: bodyAngle + anatomy.headTwist,
    fill: ink,
    outline: ink,
    fillAlpha: 230,
    outlineWeight: roughRandom(g, 0.72, 1.08),
    passes: 3,
    wobble: 0.05 * u
  });

  drawRoughAbdomenSegments(g, anatomy, ink, softInk, u);
  drawRoughBodyDorsalHighlight(g, anatomy, "#6d604c", u);
  drawRoughThoraxHairs(g, anatomy, softInk, u);
  drawRoughHeadMarks(g, anatomy, ink, u);
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
    strokeWeight: roughRandom(g, 0.68, 1.05),
    curvature: 0.2,
    jitter: 0.02 * u
  });

  let head = getRoughPoseBodyPoint(plan, -0.18, poseLean * 0.26, -0.2 * u);
  drawRoughPressureDot(g, head.x, head.y, ink, roughRandom(g, 0.16 * u, 0.26 * u));
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

function buildRoughBodyAnatomy(plan, u) {
  let pose = plan.posePlan || null;
  let side = plan.gestureSide || 1;
  let poseLean = pose ? pose.yaw * 1.42 * u + pose.pitch * 0.42 * u : 0;
  let flapLean = pose ? pose.phase.lift * 0.54 * u : 0;
  let bellySwing = pose ? pose.nearSide * Math.abs(pose.yaw) * 1.08 * u : 0;
  let head = getRoughPoseBodyPoint(plan, -0.18, -side * 0.1 * u + poseLean * 0.14, -0.2 * u + flapLean * 0.18);
  let thorax = getRoughPoseBodyPoint(plan, 0.1, poseLean * 0.36, 0);
  let abdomen = getRoughPoseBodyPoint(plan, 0.58, poseLean * 0.86 + bellySwing * 0.34, 0.08 * u);
  let tail = getRoughPoseBodyPoint(plan, 0.98, poseLean * 1.16 + bellySwing * 0.8, pose && pose.pitch > 0 ? 0.42 * u : 0.06 * u);
  let angle = Math.atan2(tail.y - head.y, tail.x - head.x);

  return {
    head,
    thorax,
    abdomen,
    tail,
    angle,
    normal: { x: -Math.sin(angle), y: Math.cos(angle) },
    axis: { x: Math.cos(angle), y: Math.sin(angle) },
    headTwist: pose ? pose.yaw * 0.18 : 0,
    thoraxTwist: pose ? pose.yaw * 0.24 + pose.phase.lift * 0.08 : 0,
    abdomenTwist: pose ? pose.yaw * 0.34 + pose.pitch * 0.12 : 0
  };
}

function drawRoughBrushOval(g, cx, cy, options) {
  let rx = options.rx;
  let ry = options.ry;
  let rotation = options.rotation || 0;
  let passes = options.passes || 2;
  let wobble = options.wobble || 0;

  if (typeof brush !== "undefined") {
    if (typeof brush.fill === "function") brush.fill(options.fill, options.fillAlpha || 220);
    if (typeof brush.fillBleed === "function") brush.fillBleed(0.003, "out");
    if (typeof brush.fillTexture === "function") brush.fillTexture(0.1, 0.04, false);
    brush.noStroke();

    for (let pass = 0; pass < passes; pass++) {
      brush.set("marker1", options.fill, roughRandom(g, 0.12, 0.22));
      brush.beginShape(0.12);
      let count = 14;
      for (let i = 0; i <= count; i++) {
        let t = (i / count) * Math.PI * 2;
        let grain = 1 + roughRandom(g, -0.075, 0.075);
        let localX = Math.cos(t) * rx * grain + roughRandom(g, -wobble, wobble);
        let localY = Math.sin(t) * ry * grain + roughRandom(g, -wobble, wobble);
        let point = rotateLocalPoint(cx, cy, localX, localY, rotation);
        brush.vertex(point.x, point.y, roughRandom(g, 0.34, 0.82));
      }
      brush.endShape(true);
    }

    brush.noFill();
    brush.set("pencil1", options.outline, roughRandom(g, 0.36, 0.54));
    brush.stroke(options.outline, 238);
    brush.strokeWeight(options.outlineWeight || 0.8);
    brush.beginShape(0.1);
    let outlineCount = 24;
    for (let i = 0; i <= outlineCount; i++) {
      let t = (i / outlineCount) * Math.PI * 2;
      let localX = Math.cos(t) * (rx + roughRandom(g, -wobble, wobble) * 0.5);
      let localY = Math.sin(t) * (ry + roughRandom(g, -wobble, wobble) * 0.5);
      let point = rotateLocalPoint(cx, cy, localX, localY, rotation);
      brush.vertex(point.x, point.y, roughRandom(g, 0.32, 0.78));
    }
    brush.endShape(true);
    return;
  }

  g.push();
  g.translate(cx, cy);
  g.rotate(rotation);
  g.noStroke();
  g.fill(options.fill);
  g.ellipse(0, 0, rx * 2, ry * 2);
  g.noFill();
  g.stroke(options.outline);
  g.strokeWeight(options.outlineWeight || 0.8);
  g.ellipse(0, 0, rx * 2, ry * 2);
  g.pop();
}

function drawRoughAbdomenSegments(g, anatomy, ink, softInk, u) {
  let count = 6;
  for (let i = 1; i <= count; i++) {
    let t = i / (count + 1);
    let center = interpolateBodyPoint(anatomy.thorax, anatomy.tail, t);
    let halfLen = u * roughRandom(g, 0.3, 0.54) * (1 - t * 0.18);
    let bow = Math.sin(t * Math.PI) * u * roughRandom(g, 0.05, 0.16);
    let start = {
      x: center.x - anatomy.normal.x * halfLen - anatomy.axis.x * bow,
      y: center.y - anatomy.normal.y * halfLen - anatomy.axis.y * bow
    };
    let mid = {
      x: center.x + anatomy.axis.x * bow * 0.36,
      y: center.y + anatomy.axis.y * bow * 0.36
    };
    let end = {
      x: center.x + anatomy.normal.x * halfLen - anatomy.axis.x * bow,
      y: center.y + anatomy.normal.y * halfLen - anatomy.axis.y * bow
    };

    drawHumanBrushStroke(g, [
      [start.x, start.y, 0.12],
      [mid.x, mid.y, 0.32],
      [end.x, end.y, 0.12]
    ], {
      brushName: "pencil1",
      color: i % 2 === 0 ? ink : "#5d5140",
      strokeWeight: roughRandom(g, 0.46, 0.82),
      curvature: 0.16,
      jitter: 0.018 * u,
      showPressureHints: false
    });
  }
}

function drawRoughBodyDorsalHighlight(g, anatomy, colorValue, u) {
  let shoulder = interpolateBodyPoint(anatomy.head, anatomy.thorax, 0.76);
  let belly = interpolateBodyPoint(anatomy.thorax, anatomy.tail, 0.62);
  let sideBias = roughRandom(g, -0.14 * u, 0.14 * u);
  let points = [
    [shoulder.x + anatomy.normal.x * sideBias, shoulder.y + anatomy.normal.y * sideBias, 0.08],
    [anatomy.thorax.x + anatomy.normal.x * sideBias * 0.5, anatomy.thorax.y + anatomy.normal.y * sideBias * 0.5, 0.34],
    [anatomy.abdomen.x - anatomy.normal.x * sideBias * 0.25, anatomy.abdomen.y - anatomy.normal.y * sideBias * 0.25, 0.42],
    [belly.x, belly.y, 0.1]
  ];

  drawHumanBrushStroke(g, points, {
    brushName: "pencil1",
    color: colorValue,
    strokeWeight: roughRandom(g, 0.5, 0.86),
    curvature: 0.2,
    jitter: 0.015 * u,
    showPressureHints: false
  });
}

function drawRoughThoraxHairs(g, anatomy, softInk, u) {
  let count = 5;
  for (let i = 0; i < count; i++) {
    let side = i % 2 === 0 ? -1 : 1;
    let anchor = interpolateBodyPoint(anatomy.head, anatomy.abdomen, roughRandom(g, 0.32, 0.58));
    let length = u * roughRandom(g, 0.34, 0.82);
    let start = {
      x: anchor.x + anatomy.normal.x * side * u * roughRandom(g, 0.1, 0.28),
      y: anchor.y + anatomy.normal.y * side * u * roughRandom(g, 0.1, 0.28)
    };
    let end = {
      x: start.x + anatomy.normal.x * side * length + anatomy.axis.x * roughRandom(g, -0.18 * u, 0.22 * u),
      y: start.y + anatomy.normal.y * side * length + anatomy.axis.y * roughRandom(g, -0.18 * u, 0.22 * u)
    };

    drawHumanBrushStroke(g, [
      [start.x, start.y, 0.08],
      [end.x, end.y, 0.02]
    ], {
      brushName: "pencil1",
      color: softInk,
      strokeWeight: roughRandom(g, 0.28, 0.48),
      curvature: 0.08,
      jitter: 0.012 * u,
      showPressureHints: false
    });
  }
}

function drawRoughHeadMarks(g, anatomy, ink, u) {
  let eyeOffset = u * 0.16;
  for (let side of [-1, 1]) {
    drawRoughPressureDot(
      g,
      anatomy.head.x + anatomy.normal.x * side * eyeOffset + anatomy.axis.x * u * 0.04,
      anatomy.head.y + anatomy.normal.y * side * eyeOffset + anatomy.axis.y * u * 0.04,
      ink,
      roughRandom(g, 0.08 * u, 0.14 * u)
    );
  }
}

function rotateLocalPoint(cx, cy, localX, localY, rotation) {
  let cosA = Math.cos(rotation);
  let sinA = Math.sin(rotation);
  return {
    x: cx + localX * cosA - localY * sinA,
    y: cy + localX * sinA + localY * cosA
  };
}

function interpolateBodyPoint(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  };
}

function drawHumanBrushStroke(g, points, options) {
  if (!points || points.length < 2) return;

  if (typeof brush !== "undefined") {
    brush.set(options.brushName || "pencil1", options.color, 1);
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
