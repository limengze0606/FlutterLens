const START_DISSOLVE_TOTAL_MS = 7000;
const START_DISSOLVE_HOLD_MS = 200;
const START_DISSOLVE_NOISE_SCALE = 7.5;
const START_DISSOLVE_EDGE_WIDTH = 0.065;
const START_DISSOLVE_BURN_TINT = [0.64, 0.43, 0.19];
const START_DISSOLVE_ZOOM_AMOUNT = 2.2;
const START_DISSOLVE_REVEAL_CURVE = [0.22, 0.3, 0.36, 0.8];
const START_DISSOLVE_ZOOM_CURVE = [0.16, 0.3, 0.3, 0.8];

let startDissolveShader = null;
let startDissolvePaperTexture = null;
let startDissolveStartedAt = 0;
let startDissolveActive = false;

const startDissolveVertexShader = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

const startDissolveFragmentShader = `
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uUvScale;
uniform vec2 uUvOffset;
uniform float uProgress;
uniform float uNoiseScale;
uniform float uEdgeWidth;
uniform float uZoom;
uniform vec3 uBurnTint;

varying vec2 vTexCoord;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(0.8, -0.6, 0.6, 0.8);

  for (int i = 0; i < 5; i++) {
    value += amplitude * valueNoise(p);
    p = rotate * p * 2.05 + 13.7;
    amplitude *= 0.52;
  }

  return value;
}

void main() {
  vec2 screenUv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  vec2 zoomedScreenUv = (screenUv - 0.5) / uZoom + 0.5;
  vec2 paperUv = uUvOffset + zoomedScreenUv * uUvScale;
  vec4 paper = texture2D(uTexture, paperUv);

  float grain = fbm(zoomedScreenUv * uNoiseScale);
  float fibers = fbm(vec2(zoomedScreenUv.x * 18.0, zoomedScreenUv.y * 5.0 + grain * 0.7));
  float travel = smoothstep(
    -0.14,
    1.12,
    zoomedScreenUv.y * 0.82 + zoomedScreenUv.x * 0.18 + 0.08 * sin(zoomedScreenUv.x * 6.0)
  );
  float dissolveField = grain * 0.76 + fibers * 0.2 + travel * 0.18;
  float threshold = mix(-0.16, 1.34, uProgress);
  float remaining = smoothstep(threshold - uEdgeWidth, threshold + uEdgeWidth, dissolveField);
  float edge = smoothstep(threshold - uEdgeWidth * 1.7, threshold, dissolveField)
    - smoothstep(threshold, threshold + uEdgeWidth * 1.35, dissolveField);

  vec3 litPaper = mix(paper.rgb, uBurnTint, edge * 0.32);
  litPaper = mix(litPaper, vec3(0.28, 0.18, 0.08), edge * 0.1);

  float alpha = paper.a * remaining;
  gl_FragColor = vec4(litPaper * alpha, alpha);
}
`;

async function preloadStartDissolveTransition() {
  try {
    startDissolvePaperTexture = await loadImage("assets/background/old-paper-texture.jpg");
    startDissolveShader = createShader(startDissolveVertexShader, startDissolveFragmentShader);
  } catch (error) {
    console.warn("Start dissolve transition failed to initialize:", error);
    startDissolvePaperTexture = null;
    startDissolveShader = null;
  }
}

function beginStartDissolveTransition() {
  if (!startDissolveShader || !startDissolvePaperTexture) return 0;
  startDissolveStartedAt = millis();
  startDissolveActive = true;
  loop();
  return START_DISSOLVE_TOTAL_MS;
}

function isStartDissolveTransitionActive() {
  return startDissolveActive;
}

function drawStartDissolveTransition() {
  if (!startDissolveActive || !startDissolveShader || !startDissolvePaperTexture) return;

  const elapsed = millis() - startDissolveStartedAt;
  const dissolveElapsed = max(0, elapsed - START_DISSOLVE_HOLD_MS);
  const dissolveDuration = max(1, START_DISSOLVE_TOTAL_MS - START_DISSOLVE_HOLD_MS);
  const progress = constrain(dissolveElapsed / dissolveDuration, 0, 1);

  drawStartDissolvePaperShader(progress);

  if (progress >= 1) {
    startDissolveActive = false;
  }
}

function drawStartDissolvePaperBase() {
  if (!startDissolveShader || !startDissolvePaperTexture) return;
  drawStartDissolvePaperShader(0);
}

function drawStartDissolvePaperShader(progress) {
  const cover = getStartDissolveCoverUv();
  const revealProgress = sampleStartDissolveCurve(progress, START_DISSOLVE_REVEAL_CURVE);
  const zoomProgress = sampleStartDissolveCurve(progress, START_DISSOLVE_ZOOM_CURVE);
  const zoom = 1 + START_DISSOLVE_ZOOM_AMOUNT * zoomProgress;

  push();
  resetMatrix();
  noStroke();
  shader(startDissolveShader);
  startDissolveShader.setUniform("uTexture", startDissolvePaperTexture);
  startDissolveShader.setUniform("uUvScale", [cover.scaleX, cover.scaleY]);
  startDissolveShader.setUniform("uUvOffset", [cover.offsetX, cover.offsetY]);
  startDissolveShader.setUniform("uProgress", revealProgress);
  startDissolveShader.setUniform("uNoiseScale", START_DISSOLVE_NOISE_SCALE);
  startDissolveShader.setUniform("uEdgeWidth", START_DISSOLVE_EDGE_WIDTH);
  startDissolveShader.setUniform("uZoom", zoom);
  startDissolveShader.setUniform("uBurnTint", START_DISSOLVE_BURN_TINT);
  plane(width, height);
  resetShader();
  pop();
}

function getStartDissolveCoverUv() {
  if (!startDissolvePaperTexture || !width || !height) {
    return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
  }

  const canvasRatio = width / height;
  const imageRatio = startDissolvePaperTexture.width / startDissolvePaperTexture.height;
  let scaleX = 1;
  let scaleY = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > canvasRatio) {
    scaleX = canvasRatio / imageRatio;
    offsetX = (1 - scaleX) * 0.5;
  } else {
    scaleY = imageRatio / canvasRatio;
    offsetY = (1 - scaleY) * 0.5;
  }

  return { scaleX, scaleY, offsetX, offsetY };
}

function sampleStartDissolveCurve(progress, curve) {
  const t = constrain(progress, 0, 1);
  if (!Array.isArray(curve) || curve.length !== 4) return t;

  const x1 = curve[0];
  const y1 = curve[1];
  const x2 = curve[2];
  const y2 = curve[3];
  let lower = 0;
  let upper = 1;
  let sampleT = t;

  for (let i = 0; i < 8; i++) {
    const x = cubicBezierValue(sampleT, x1, x2);
    if (x < t) {
      lower = sampleT;
    } else {
      upper = sampleT;
    }
    sampleT = (lower + upper) * 0.5;
  }

  return cubicBezierValue(sampleT, y1, y2);
}

function cubicBezierValue(t, p1, p2) {
  const invT = 1 - t;
  return 3 * invT * invT * t * p1 + 3 * invT * t * t * p2 + t * t * t;
}
