/**
 * 繪製昆蟲的身體模組
 * @param {p5.Graphics} g - 主要畫布
 * @param {number} bodyType - 身體種類
 * @param {number} seedValue - 隨機種子
 */
function drawInsectBody(g, bodyType, seedValue) {
  if (seedValue !== undefined) {
    g.randomSeed(seedValue);
    g.noiseSeed(seedValue);
  }

  g.push();
  g.colorMode(RGB, 255, 255, 255, 255);
  switch (bodyType) {
    case 0:
      drawButterflyBody(g);
      break;
    case 1:
      drawDragonflyBody(g);
      break;
    case 2:
      drawMothBody(g);
      break;
    default:
      drawButterflyBody(g);
      break;
  }

  g.pop();
}

/**
 * 實作第一種身體：蝴蝶 (Butterfly Body)
 */
function drawButterflyBody(g) {
  let u = insectBaseUnit; // 為了程式碼簡潔，用 u 代替

  let bodyColor = g.color(30, 30, 32);      
  let highlightColor = g.color(80, 80, 85, 150); 
  let segmentColor = g.color(50, 50, 55);   

  let thoraxW = 1.8 * u;
  let thoraxH = 3.5 * u;
  drawPart(g, 0, 0, thoraxW, thoraxH, bodyColor, highlightColor);

  let headSize = 1.4 * u;
  let headY = -thoraxH * 0.6;
  drawPart(g, 0, headY, headSize, headSize * 1.1, bodyColor, highlightColor);

  drawAntennae(g, 0, headY - (0.5 * u), 1.5 * u, 3.0 * u);

  let abdomenW = 1.4 * u;
  let abdomenH = 8 * u;
  let abdomenY = thoraxH * 0.4 + abdomenH * 0.5;
  drawPart(g, 0, abdomenY, abdomenW, abdomenH, bodyColor, highlightColor);

  drawSegments(g, 0, abdomenY, abdomenW, abdomenH, 7, segmentColor);
}

/**
 * 實作第二種身體：蜻蜓 (Dragonfly Body)
 */
function drawDragonflyBody(g) {
  let u = insectBaseUnit;

  let bodyColor = g.color(20, 25, 30);      
  let highlightColor = g.color(70, 90, 100, 160); 
  let segmentColor = g.color(40, 50, 60);   

  let thoraxW = 2.0 * u;
  let thoraxH = 3.0 * u;
  drawPart(g, 0, 0, thoraxW, thoraxH, bodyColor, highlightColor);

  let headW = 2.5 * u;
  let headH = 1.6 * u;
  // 讓頭的 Y 座標等於胸部高度的一半再往上移一點點，確保接合
  let headY = -(thoraxH / 2) - (headH / 4); 
  drawPart(g, 0, headY, headW, headH, bodyColor, highlightColor);

  let abdomenW = 1.0 * u;
  let abdomenH = 14.0 * u;
  // 讓腹部的中心點 Y 座標等於：胸部下邊緣 + 腹部高度的一半
  let abdomenY = (thoraxH / 2) + (abdomenH / 2) - (0.5 * u); // 扣掉 0.5*u 是為了讓它們互相重疊一點點，避免斷開
  drawPart(g, 0, abdomenY, abdomenW, abdomenH, bodyColor, highlightColor);

  drawSegments(g, 0, abdomenY, abdomenW, abdomenH, 10, segmentColor);
}

/**
 * 實作第三種身體：蛾 (Moth Body)
 */
function drawMothBody(g) {
  let u = insectBaseUnit; // 為了程式碼簡潔，用 u 代替

  // 蛾的顏色通常比較偏向大地色系、棕灰色，這裡調暖一點點
  let bodyColor = g.color(45, 40, 38);      
  let highlightColor = g.color(90, 85, 80, 150); 
  let segmentColor = g.color(30, 25, 25);   

  // 1. 繪製胸部 (Thorax) - 蛾的胸部非常寬大且毛茸茸
  let thoraxW = 2.6 * u;
  let thoraxH = 3.6 * u;
  drawPart(g, 0, 0, thoraxW, thoraxH, bodyColor, highlightColor);

  // 2. 繪製頭部 (Head) - 頭部相對較小，常被胸部的毛遮住一半
  let headSize = 1.2 * u;
  let headY = -thoraxH * 0.55;
  drawPart(g, 0, headY, headSize, headSize, bodyColor, highlightColor);

  // 3. 繪製觸角 - 蛾的專屬羽狀觸角
  drawMothAntennae(g, 0, headY - (0.5 * u), 2.2 * u, 3.5 * u);

  // 4. 繪製腹部 (Abdomen) - 蛾的腹部短而粗胖
  let abdomenW = 1.4 * u;
  let abdomenH = 4.5 * u;
  let abdomenY = thoraxH * 0.4 + abdomenH * 0.5;
  drawPart(g, 0, abdomenY, abdomenW, abdomenH, bodyColor, highlightColor);

  // 5. 繪製腹部節理 - 因為毛多，節理不需要像蜻蜓那麼密集
  drawSegments(g, 0, abdomenY, abdomenW, abdomenH, 6, segmentColor);
}

/**
 * 輔助函式：同步繪製部位到主畫布與遮罩
 */
function drawPart(g, x, y, w, h, col) {
  g.noStroke();
  g.fill(col);
  g.ellipse(x, y, w, h);
}

/**
 * 繪製腹部節理
 */
function drawSegments(g, x, y, w, h, count) {
  g.stroke(60, 60, 65, 150);
  g.strokeWeight(1.5);
  g.noFill();
  
  let startY = y - h * 0.4;
  let endY = y + h * 0.4;
  
  for (let i = 1; i < count; i++) {
    let segmentY = g.map(i, 0, count, startY, endY);
    // 繪製稍微彎曲的節理線
    g.arc(x, segmentY, w * 0.9, 5, 0, g.PI);
  }
}

/**
 * 繪製觸角
 * @param {number} spread - 觸角向外展開的寬度 (預設 15)
 * @param {number} len - 觸角的長度/高度 (預設 30)
 */
function drawAntennae(g, x, y, spread = 15, len = 30) {
  g.stroke(30, 30, 32);
  g.strokeWeight(1.2);
  g.noFill();

  // 根據展開寬度與長度，自動計算控制點的弧度
  let ctrl1X = spread * 0.4; // 稍微往外擴展
  let ctrl1Y = len * 0.4;    // 高度的一半不到
  let ctrl2X = spread * 0.8; // 更靠近末端
  let ctrl2Y = len * 0.6;    

  // === 右觸角 ===
  g.bezier(x, y, x + ctrl1X, y - ctrl1Y, x + ctrl2X, y - ctrl2Y, x + spread, y - len);
  g.fill(30, 30, 32); // 小球填滿顏色
  let knobSize = len * 0.1;
  g.ellipse(x + spread, y - len - (knobSize/3), knobSize, knobSize); // 觸角末端小球
  g.noFill(); // 畫完小球記得取消填滿，以免影響其他線條
  
  // === 左觸角 (左右對稱，只要把 X 相關的加號變減號) ===
  g.bezier(x, y, x - ctrl1X, y - ctrl1Y, x - ctrl2X, y - ctrl2Y, x - spread, y - len);
  g.fill(30, 30, 32);
  g.ellipse(x - spread, y - len - (knobSize/3), knobSize, knobSize);
  g.noFill();
}

/**
 * 繪製羽毛狀觸角 (專屬於蛾)
 */
/**
 * 繪製羽毛狀觸角 (蛾專屬 - 雙向羽狀)
 */
function drawMothAntennae(g, x, y, spread = 22, len = 35) {
  g.stroke(45, 40, 38);
  g.strokeWeight(1.5);
  g.noFill();

  // 控制點計算
  let ctrl1X = spread * 0.4; 
  let ctrl1Y = len * 0.3;    
  let ctrl2X = spread * 0.8; 
  let ctrl2Y = len * 0.7;    

  // === 畫主幹 ===
  // 右觸角主幹
  g.bezier(x, y, x + ctrl1X, y - ctrl1Y, x + ctrl2X, y - ctrl2Y, x + spread, y - len);
  // 左觸角主幹
  g.bezier(x, y, x - ctrl1X, y - ctrl1Y, x - ctrl2X, y - ctrl2Y, x - spread, y - len);

  // === 畫羽毛分支 (雙向櫛齒) ===
  // 建議稍微增加 steps (例如從 7 改為 10)，雙向羽毛密集一點會更像蛾
  let steps = 10; 
  g.strokeWeight(1);

  // 讓分支長度跟隨 spread 動態縮放 (響應式修改)
  let branchLen = spread * 0.25; 

  for (let i = 1; i <= steps; i++) {
    let t = i / (steps + 1); // 取得貝茲曲線上的進度 (0~1)
    
    // 取得右觸角當下的中心點座標
    let pxR = g.bezierPoint(x, x + ctrl1X, x + ctrl2X, x + spread, t);
    let pyR = g.bezierPoint(y, y - ctrl1Y, y - ctrl2Y, y - len, t);
    
    // 取得左觸角當下的中心點座標
    let pxL = g.bezierPoint(x, x - ctrl1X, x - ctrl2X, x - spread, t);
    let pyL = g.bezierPoint(y, y - ctrl1Y, y - ctrl2Y, y - len, t);

    // --- 右觸角的雙向分支 ---
    // 1. 向外側長 (往右下)
    g.line(pxR, pyR, pxR + branchLen, pyR + branchLen * 0.3);
    // 2. 向內側長 (往左下) -> 只要把 X 軸的方向加上負號
    g.line(pxR, pyR, pxR - branchLen, pyR + branchLen * 0.3);

    // --- 左觸角的雙向分支 ---
    // 1. 向外側長 (往左下)
    g.line(pxL, pyL, pxL - branchLen, pyL + branchLen * 0.3);
    // 2. 向內側長 (往右下) -> 同理，方向反轉
    g.line(pxL, pyL, pxL + branchLen, pyL + branchLen * 0.3);
  }
}