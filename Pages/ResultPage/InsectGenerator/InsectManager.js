let insectBaseUnit = 1;

/**
 * 繪製生成的昆蟲
 * @param {p5.Graphics} insectLayer - 用於繪製昆蟲的圖層
 * @param {number} x - 生成的 X 座標
 * @param {number} y - 生成的 Y 座標
 * @param {Object} mainColor - 昆蟲的主要顏色 (HSB 數值)
 */
function drawInsect(insectLayer, x, y) {
    insectLayer.push(); // 鎖定狀態，避免影響其他繪圖
    
    // 這裡記得也要用 HSB 模式，因為傳進來的是 HSB 數值
    insectLayer.colorMode(HSB, 360, 100, 100);
    
    // 移動到指定的生成座標，這樣你畫蟲的時候就可以把 (0,0) 當作蟲的中心點
    insectLayer.translate(x, y); 

    // 賦予隨機旋轉角度
    // TWO_PI 等於 360 度，這樣昆蟲生成的方向就會是 360 度全隨機
    let randomRot = random(-PI/4, PI/4); 
    insectLayer.rotate(randomRot);

    updateInsectBaseUnit();
    bodyHalfWidth = 0.6 * insectBaseUnit;
    
    // --- 以下為昆蟲繪製邏輯 (雛形範例) ---
    currentSeed = floor(random(100000));
    if (finalPitch < -50) {
        insectType = 2;
    }
    else if (finalPitch < 20 && finalPitch >= -50) {
        insectType = 0;
    }
    else {
        insectType = 1;
    }
    //flapAngle =random(-PI / 4, PI / 4);
    flapAngle = 0;
    wingColorFillType = floor(random(3)); // 0, 1, 或 2
    wingColorLineType = floor(random(2)); // 0 或 1
    wingLineColorSet = floor(random(20)); // 調整稀有度

    if (insectType === 2) {
        drawInsectBody(insectLayer, insectType, currentSeed);
        let color1 = topColors[0];
        let color2 = topColors[1];
        drawInsectWings(insectLayer, insectType, currentSeed, flapAngle, color1, color2, wingColorFillType, wingColorLineType, wingLineColorSet);
        applyNoise(insectLayer, 0.1);
    }
    else {
        let color1 = topColors[0];
        let color2 = topColors[1];
        drawInsectWings(insectLayer, insectType, currentSeed, flapAngle, color1, color2, wingColorFillType, wingColorLineType, wingLineColorSet);
        applyNoise(insectLayer, 0.1);

        drawInsectBody(insectLayer, insectType, currentSeed);
    }
    
    insectLayer.pop();
}

function updateInsectBaseUnit() {
  // 假設我們希望「基準單位」是螢幕短邊的 1%
  let minDimension = min(width, height); 
  insectBaseUnit = minDimension * 0.01; 
  
  // 假設原本寫死 thoraxW = 18。
  // 在 1000px 寬度的螢幕下，insectBaseUnit = 10。
  // 我們稍後會把 thoraxW 變成 1.8 * insectBaseUnit = 18，比例就完美對應了。
}