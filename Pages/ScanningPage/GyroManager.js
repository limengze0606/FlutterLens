let normPitch = 0; // 只保留仰俯角
let currentOrientation = 0;

function drawGyroManager() {
    updateNormalizedPitch();
    textSize(20);
    text(`螢幕方向: ${currentOrientation}°`, width / 2, height / 2 - 60);

    textSize(32);
    fill(0, 255, 0); // 綠色大字顯示最終的 Pitch
    text(`仰俯角 (Pitch): ${nf(normPitch, 1, 1)}°`, width / 2, height / 2);
}

// ==========================================
// 專注處理仰俯角的翻譯官
// ==========================================
function updateNormalizedPitch() {
    currentOrientation = window.orientation || 0;
    let rawX = rotationX;
    let rawY = rotationY;
    
    if (currentOrientation === 90) {
      // 橫向 (頂端在左)：原本繞著短邊轉(X)，現在變成繞著長邊轉(Y)
      normPitch = rawY;
    } else if (currentOrientation === -90 || currentOrientation === 270) {
      // 橫向 (頂端在右)：反向的橫向，所以加上負號修正
      normPitch = -rawY;
    } else if (currentOrientation === 180) {
      // 直向 (倒拿)
      normPitch = -rawX;
    } else {
      // 直向 (正常)
      normPitch = rawX;
    }
  }