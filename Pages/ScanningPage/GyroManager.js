let finalPitch = 0; // 客觀平視仰俯角 (手機完全直立時為 0)
let currentOrientation = 0;

function wrapToPlusMinus180(angleDeg) {
  let a = angleDeg;
  while (a > 180) a -= 360;
  while (a < -180) a += 360;
  return a;
}

function clampToPlusMinus90(angleDeg) {
  return Math.max(-90, Math.min(90, angleDeg));
}

// 把角度「縫合」成穩定的 -90~90（避免 180/-180 跳點造成顯示爆掉）
function normalizeToPlusMinus90(angleDeg) {
  let a = angleDeg;

  // 先把角度拉回到 [-180, 180]
  a = wrapToPlusMinus180(a);

  // 再把超出 [-90, 90] 的部分折回來
  if (a > 90) a = 180 - a;
  else if (a < -90) a = -180 - a;

  return a;
}

function drawGyroManager() {
    updateNormalizedPitch();
    textSize(20);
    text(`螢幕方向: ${currentOrientation}°`, width / 2, height / 2 - 60);

    textSize(32);
    fill(0, 255, 0); // 綠色大字顯示最終的 Pitch
    text(`仰俯角 (Pitch): ${nf(finalPitch, 1, 1)}°`, width / 2, height / 2);
}

// ==========================================
// 專注處理仰俯角的翻譯官
// ==========================================
function updateNormalizedPitch() {
  currentOrientation = window.orientation || 0;
  let rawX = rotationX;
  let rawY = rotationY;
  
  if (currentOrientation === 90) {
    // 橫向 (頂端在左)：垂直時，rawY 會在 90 與 -90 之間跳動。
    // 以 90° 為基準歸零：水平時 0、仰看為正、俯看為負
    // 用 wrap 接起 rawY 在 90/-90 的跳點，再 clamp 到 [-90, 90]
    const delta = wrapToPlusMinus180(rawY - 90);
    finalPitch = clampToPlusMinus90(-delta);
    
  } else if (currentOrientation === -90 || currentOrientation === 270) {
    // 橫向 (頂端在右)：反向縫合，確保仰俯方向與左橫向一致
    const delta = wrapToPlusMinus180(rawY - 90);
    finalPitch = clampToPlusMinus90(delta);
    
  } else if (currentOrientation === 180) {
    // 直向 (倒拿)：反轉後減 90
    finalPitch = normalizeToPlusMinus90(((-rawX) - 90));
    
  } else {
    // 直向 (正常)：垂直時 rawX 為 90，直接減 90 歸零
    finalPitch = normalizeToPlusMinus90(rawX - 90);
  }
}