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
  // 假設我們希望「基準單位」是螢幕短邊的幾%
  let minDimension = min(width, height); 
  insectBaseUnit = minDimension * 0.022; // 你可以調整這個比例來讓昆蟲變大或變小
}

function createRoughScreenRotationPlan(seedValue) {
    const plans = [
        { id: "uprightHover", baseAngle: 0, jitter: 9, weight: 3 },
        { id: "diagonalRiseLeft", baseAngle: -32, jitter: 8, weight: 2 },
        { id: "diagonalRiseRight", baseAngle: 32, jitter: 8, weight: 2 },
        { id: "sideDriftLeft", baseAngle: -58, jitter: 7, weight: 1 },
        { id: "sideDriftRight", baseAngle: 58, jitter: 7, weight: 1 }
    ];

    let totalWeight = plans.reduce((sum, plan) => sum + plan.weight, 0);
    let roll = seededUnit(seedValue, 17) * totalWeight;
    let selectedPlan = plans[0];

    for (let plan of plans) {
        roll -= plan.weight;
        if (roll <= 0) {
            selectedPlan = plan;
            break;
        }
    }

    let jitterAmount = (seededUnit(seedValue, 53) * 2 - 1) * selectedPlan.jitter;

    return {
        id: selectedPlan.id,
        baseAngle: selectedPlan.baseAngle,
        jitter: selectedPlan.jitter,
        rotation: selectedPlan.baseAngle + jitterAmount
    };
}

function seededUnit(seedValue, salt) {
    let value = Math.sin((seedValue + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
}

function drawRoughInsect(insectLayer, x, y) {
    insectLayer.push(); // 鎖定狀態，避免影響其他繪圖
    
    // 這裡記得也要用 HSB 模式，因為傳進來的是 HSB 數值
    insectLayer.colorMode(HSB, 360, 100, 100);
    
    // 移動到指定的生成座標，這樣你畫蟲的時候就可以把 (0,0) 當作蟲的中心點
    insectLayer.translate(x, y); 

    updateInsectBaseUnit();
    bodyHalfWidth = 0.6 * insectBaseUnit;
    
    // --- 以下為昆蟲繪製邏輯 (雛形範例) ---
    currentSeed = floor(random(100000));
    let roughScreenRotationPlan = createRoughScreenRotationPlan(currentSeed);
    insectLayer.rotate(roughScreenRotationPlan.rotation);

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
    let roughBodyPlan = createRoughInsectBodyPlan(insectLayer, currentSeed, insectType);
    let roughPosePlan = null;

    if (roughPosePlan) {
        insectLayer.scale(roughPosePlan.bodyScaleX, roughPosePlan.bodyScaleY);
        roughBodyPlan.posePlan = roughPosePlan;
    }

    let color1 = topColors[0];
    let color2 = topColors[1];
    drawRoughInsectWings(insectLayer, insectType, currentSeed, flapAngle, color1, color2, wingColorFillType, wingColorLineType, wingLineColorSet, roughBodyPlan);
    drawRoughInsectBody(insectLayer, roughBodyPlan, currentSeed, color1, color2);
    
    insectLayer.pop();
}
