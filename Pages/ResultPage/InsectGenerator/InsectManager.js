/**
 * 繪製生成的昆蟲
 * @param {p5.Graphics} targetCanvas - 要畫上去的目標畫布 (即 resultCanvas)
 * @param {number} x - 生成的 X 座標
 * @param {number} y - 生成的 Y 座標
 * @param {Object} mainColor - 昆蟲的主要顏色 (HSB 數值)
 */
function drawInsect(targetCanvas, x, y) {
    targetCanvas.push(); // 鎖定狀態，避免影響其他繪圖
    
    // 這裡記得也要用 HSB 模式，因為傳進來的是 HSB 數值
    targetCanvas.colorMode(HSB, 360, 100, 100);
    
    // 移動到指定的生成座標，這樣你畫蟲的時候就可以把 (0,0) 當作蟲的中心點
    targetCanvas.translate(x, y); 
    
    // --- 以下為昆蟲繪製邏輯 (雛形範例) ---
    currentSeed = floor(random(100000));
    insectType = floor(random(3)); // 0, 1, 或 2
    flapAngle =random(-PI / 4, PI / 4);
    wingColorFillType = floor(random(3)); // 0, 1, 或 2
    wingColorLineType = floor(random(2)); // 0 或 1

    let color1 = topColors[0];
    let color2 = topColors[1];
    drawInsectWings(targetCanvas, insectType, currentSeed, flapAngle, color1, color2, wingColorFillType, wingColorLineType);

    drawInsectBody(targetCanvas, insectType, currentSeed);
    
    targetCanvas.pop();
}