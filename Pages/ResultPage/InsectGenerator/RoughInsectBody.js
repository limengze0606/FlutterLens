function createRoughInsectBodyPlan(g, seedValue, insectType) {
  if (insectType !== 0) return null;

  setRoughSeed(g, seedValue + 313);

  let u = insectBaseUnit;
  let centerDriftX = roughRandom(g, -0.12 * u, 0.12 * u);
  let rootY = roughRandom(g, 0.12 * u, 0.42 * u);
  let bodyLength = roughRandom(g, 6.4 * u, 8.4 * u);
  let bodyCurve = roughRandom(g, -0.42 * u, 0.42 * u);
  let topY = rootY - roughRandom(g, 1.45 * u, 1.9 * u);
  let bottomY = topY + bodyLength;

  return {
    insectType,
    centerX: centerDriftX,
    topY,
    rootY,
    headY: topY + roughRandom(g, 0.28 * u, 0.56 * u),
    bottomY,
    curveX: bodyCurve,
    wingRootY: rootY,
    wingRootHalfWidth: roughRandom(g, 0.34 * u, 0.48 * u),
    antennaSpread: roughRandom(g, 1.55 * u, 2.2 * u),
    antennaLength: roughRandom(g, 2.6 * u, 3.4 * u)
  };
}

function drawRoughInsectBody(g, bodyPlan, seedValue) {
  if (!bodyPlan || bodyPlan.insectType !== 0) return;

  setRoughSeed(g, seedValue + 719);

  g.push();
  g.colorMode(RGB, 255, 255, 255, 255);
  g.noFill();
  g.strokeCap(ROUND);
  g.strokeJoin(ROUND);

  let u = insectBaseUnit;
  let ink = {
    r: 92,
    g: 36,
    b: 42
  };

  drawRoughBodyAxis(g, bodyPlan, ink, u);
  drawRoughBodyAccent(g, bodyPlan, ink, u);
  drawRoughBodyAntennae(g, bodyPlan, ink, u);

  g.pop();
}

function drawRoughBodyAxis(g, plan, ink, u) {
  let x = plan.centerX;
  let topY = plan.topY;
  let bottomY = plan.bottomY;
  let midY = (topY + bottomY) * 0.5;

  drawRoughBezierLine(
    g,
    x + roughRandom(g, -0.05 * u, 0.05 * u),
    topY,
    x + plan.curveX * 0.18,
    midY - 1.2 * u,
    x + plan.curveX,
    midY + 1.3 * u,
    x + plan.curveX * 0.28,
    bottomY,
    ink,
    0.14 * u,
    196,
    2
  );
}

function drawRoughBodyAccent(g, plan, ink, u) {
  let thoraxY = plan.rootY + roughRandom(g, -0.16 * u, 0.22 * u);
  let shortLen = roughRandom(g, 0.42 * u, 0.72 * u);

  g.stroke(ink.r, ink.g, ink.b, 190);
  g.strokeWeight(Math.max(0.55, 0.07 * u));
  g.line(
    plan.centerX - shortLen * 0.55,
    thoraxY + roughRandom(g, -0.05 * u, 0.05 * u),
    plan.centerX + shortLen * 0.55,
    thoraxY + roughRandom(g, -0.05 * u, 0.05 * u)
  );

  g.noStroke();
  g.fill(ink.r, ink.g, ink.b, 184);
  let dotSize = roughRandom(g, 0.16 * u, 0.24 * u);
  g.ellipse(
    plan.centerX + roughRandom(g, -0.04 * u, 0.04 * u),
    plan.headY,
    dotSize,
    dotSize
  );
  g.noFill();
}

function drawRoughBodyAntennae(g, plan, ink, u) {
  let baseX = plan.centerX;
  let baseY = plan.headY - 0.28 * u;
  let spread = plan.antennaSpread;
  let len = plan.antennaLength;
  let lift = roughRandom(g, 0.38 * u, 0.72 * u);

  drawRoughBezierLine(
    g,
    baseX - 0.08 * u,
    baseY,
    baseX - spread * 0.22,
    baseY - len * 0.2,
    baseX - spread * 0.72,
    baseY - len * 0.58,
    baseX - spread,
    baseY - len + lift,
    ink,
    0.075 * u,
    174,
    1
  );

  drawRoughBezierLine(
    g,
    baseX + 0.08 * u,
    baseY,
    baseX + spread * 0.22,
    baseY - len * 0.2,
    baseX + spread * 0.72,
    baseY - len * 0.58,
    baseX + spread,
    baseY - len + lift,
    ink,
    0.075 * u,
    174,
    1
  );
}

function drawRoughBezierLine(g, x1, y1, cx1, cy1, cx2, cy2, x2, y2, ink, weight, alpha, passes) {
  for (let i = 0; i < passes; i++) {
    let jitter = insectBaseUnit * (i === 0 ? 0.035 : 0.07);
    g.stroke(ink.r, ink.g, ink.b, alpha - i * 42);
    g.strokeWeight(Math.max(0.5, weight * (i === 0 ? 1 : 0.72)));
    g.bezier(
      x1 + roughRandom(g, -jitter, jitter),
      y1 + roughRandom(g, -jitter, jitter),
      cx1 + roughRandom(g, -jitter, jitter),
      cy1 + roughRandom(g, -jitter, jitter),
      cx2 + roughRandom(g, -jitter, jitter),
      cy2 + roughRandom(g, -jitter, jitter),
      x2 + roughRandom(g, -jitter, jitter),
      y2 + roughRandom(g, -jitter, jitter)
    );
  }
}
