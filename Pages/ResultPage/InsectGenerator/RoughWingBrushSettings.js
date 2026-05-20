var ROUGH_WING_BRUSH_SETTINGS = {
  // ==========================================
  // 1. 基礎結構 (Structure)
  // ==========================================

  // 主輪廓線 (對應 drawEdgeWithOvershoot)
  outline: {
    brushName: "pencil1", // 使用的筆刷類型
    color: "#181817",     // 輪廓基礎顏色
    strokeWeightsByPass: [1.1, 0.6], // 畫兩次輪廓時的粗細 (第一次粗 1.1，第二次細 0.6)
    overshootByPass: [[-0.2, 0.2], [0.1, 0.3]] // 手繪端點超出範圍的亂數比例
  },

  // 翅脈 / 網格 Voronoi (對應 drawRoughVoronoiPattern)
  voronoi: {
    brushName: "pencil2",
    color: "#090907",
    strokeWeight: [0.48, 0.88], // 翅脈的粗細變化範圍
    repeatChance: 0.1,       // 同一條線重複描繪兩次的機率 (增加手繪感)
    shapeRoughness: 0.08,     // 傳給 brush.beginShape(curvature?) 的曲線鬆散度
    pressureBase: [0.48, 0.82], // brush.vertex 第三參數的基礎 pressure
    pressureTaper: [0.08, 0.28], // 線段中段 pressure 增量，形成收筆效果
    pressureNoise: 0.16,      // 壓力隨機噪聲強度
    pressureClamp: [0.42, 1.12]  // 壓力最終限制範圍
  },

  // ==========================================
  // 2. 底色填充 (Base Fill)
  // ==========================================

  // 粒子底色填充 (對應 drawRoughWingParticleStrokes)
  particleFill: {
    brushName: "marker1",
    shapeRoughness: 0.04,
    // 分多層堆疊底色，製造漸層與厚度
    layers: [
      {
        count: [50, 64],      // 該層的粒子(線段)數量
        alpha: 220,           // 透明度 (0-255)
        strokeWeight: [3.2, 5.4], // 筆刷粗細
        stepLength: [0.5, 1.0], // 每一步前進的距離倍率
        steps: [2, 4]         // 該粒子線段分幾步畫完
      },
      {
        count: [60, 78],
        alpha: 255,
        strokeWeight: [2.0, 3.4],
        stepLength: [0.34, 0.72],
        steps: [2, 3]
      }
    ],
    pressureBase: [0.24, 0.56],
    pressureTaper: [0.08, 0.24],
    pressureNoise: 0.1,
    pressureClamp: [0.18, 0.82]
  },

  // ==========================================
  // 3. 花紋與裝飾 (Patterns)
  // ==========================================

  // 邊緣色帶 (對應 drawRoughWingRimBand)
  rimBand: {
    brushName: "marker2",
    strokeWeight: [6, 8],
    shapeRoughness: 30,
    vertexPressure: [0.05, 0.07] // 頂點壓力，控制顏色的深淺與邊緣模糊度
  },

  // 放射狀色帶 (對應 drawRoughWingRadialBands)
  radialBand: {
    brushName: "marker1",
    highContrastStrokeWeight: [1.25, 2.1], // 高對比風格下的粗細
    softStrokeWeight: [1.8, 3.0],          // 柔和風格下的粗細 (較粗以達到暈染效果)
    shapeRoughness: 0.08,
    pressureBase: 0.22,
    pressureTaper: 0.44,
    pressureClamp: [0.16, 0.72]
  },

  // 預設斑點筆刷，作為缺少細分設定時的 fallback
  patternDot: {
    brushName: "marker1",
    strokeWeight: [0.24, 0.56]
  },

  // rim-chain 邊緣珠串斑點：偏乾、偏小，讓外緣像一串手點上的顆粒
  rimChainSpot: {
    brushName: "marker2",
    strokeWeight: [0.12, 0.24]
  },

  // inner-scatter 內部散點：比 rim-chain 稍厚、稍柔，避免像機械噴點
  innerScatterSpot: {
    brushName: "marker2",
    strokeWeight: [0.12, 0.24]
  },

  // 眼紋三層：外圈穩、中層柔、核心較銳利
  eyeSpot: {
    ring: {
      brushName: "marker1",
      strokeWeight: [1.46, 1.82]
    },
    middle: {
      brushName: "marker1",
      strokeWeight: [0.28, 0.58]
    },
    core: {
      brushName: "marker1",
      strokeWeight: [0.16, 0.34]
    }
  },

  // ==========================================
  // 4. 表面光澤與細節 (Details)
  // ==========================================

  // 點綴 / 亮色筆觸 (對應 drawRoughWingAccentStrokes)
  accent: {
    brushName: "marker1",
    alpha: 176,
    strokeWeight: [1.35, 2.25],
    stepLength: [0.42, 0.82],
    steps: [2, 3],
    shapeRoughness: 0.03,
    pressureBase: 0.2,
    pressureTaper: 0.32,
    pressureClamp: [0.16, 0.58]
  },

  // 高光與反光 (對應 drawRoughWingSpecularStrokes)
  // 模擬膜質翅膀或甲殼的光澤，同時包含深色反光與高亮反光
  specular: {
    brushName: "marker1",
    darkStrokeWeight: 0.8,      // 深色反光的粗細
    brightStrokeWeight: 0.46,   // 高亮的粗細
    strokeWeightJitter: [0.82, 1.18], // 粗細的隨機抖動倍率
    shapeRoughness: 0.02,
    pressureBase: 0.12,
    pressureTaper: 0.42,
    pressureClamp: [0.08, 0.54]
  },

  // 放射狀水彩渲染 (對應 drawRadialWingWash)
  // 製造大面積、無明顯邊界的底色暈染效果
  radialWash: {
    alpha: 9, // 極低的透明度，靠多次疊加產生效果
    fillBleed: [0.0, 0.008],         // p5.brush 的 fillBleed 參數，控制邊緣水彩滲透感
    fillTextureAmount: [0.06, 0.16], // 填充紋理的強度
    fillTextureBorderIntensity: [0.02, 0.08],  // p5.brush fillTexture 的 borderIntensity
    shapeRoughness: 0.16,
    vertexPressure: [0.28, 0.75]
  },

  // 鬆散色塊 (對應 drawLooseWingColorPatch)
  loosePatch: {
    brushName: "marker1",
    alpha: 52,
    strokeWeight: [3.2, 7.2],
    shapeRoughness: 0.1,
    vertexPressure: [0.22, 0.58]
  }
};
