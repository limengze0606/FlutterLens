// 全域的手繪設定面板 (方便你統一控制風格)
const globalRoughOptions = {
  roughness: 2.5,     // 端點偏移範圍 (像素)
  bowing: 0.08,       // 線條彎曲程度 (相對於線長的比例)
  strokeCount: 2      // 重複下筆次數 (2~3 次效果最好)
};

/**
 * 輔助函式：在目標點周圍取得帶有隨機偏移的新座標
 */
function getRoughPoint(g, x, y, roughness) {
  // 利用極座標產生圓形範圍內的隨機偏移
  let angle = g.random(g.TWO_PI);
  let r = g.random(roughness);
  return {
    x: x + r * g.cos(angle),
    y: y + r * g.sin(angle)
  };
}

/**
 * 核心函式：繪製手繪感線條
 */
function drawRoughLine(g, x1, y1, x2, y2, options = globalRoughOptions) {
  // 為了防止極端短線導致計算錯誤 (除以零)
  let dist = g.dist(x1, y1, x2, y2);
  if (dist < 0.1) return; 

  g.push();
  g.noFill(); // 確保只畫線，不填滿

  for (let i = 0; i < options.strokeCount; i++) {
    // 1. 端點隨機偏移
    let p1 = getRoughPoint(g, x1, y1, options.roughness);
    let p2 = getRoughPoint(g, x2, y2, options.roughness);

    // 2. 計算偏移後的中點
    let midX = (p1.x + p2.x) / 2;
    let midY = (p1.y + p2.y) / 2;

    // 3. 計算向量差
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;

    // 4. 計算單位法向量 (垂直於原線段的向量)
    // 向量 (dx, dy) 的垂直向量為 (-dy, dx)
    let currentDist = g.dist(p1.x, p1.y, p2.x, p2.y);
    let nx = -dy / currentDist;
    let ny = dx / currentDist;

    // 5. 決定彎曲的控制點 (Bowing)
    // 隨機乘上 -1 到 1，讓線條隨機向左彎或向右彎
    let bowDirection = g.random(-1, 1);
    let bowAmount = currentDist * options.bowing * bowDirection;
    let ctrlX = midX + nx * bowAmount;
    let ctrlY = midY + ny * bowAmount;

    // 6. 繪製二次貝茲曲線
    g.beginShape();
    g.vertex(p1.x, p1.y);
    g.quadraticVertex(ctrlX, ctrlY, p2.x, p2.y);
    g.endShape();
  }
  
  g.pop();
}