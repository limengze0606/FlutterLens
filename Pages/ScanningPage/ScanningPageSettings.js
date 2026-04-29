let scanArea = { x: 0, y: 0, w: 0, h: 0 };

// 儲存相機畫面「置中填充 (Cover)」的計算結果與縮放比例
let camLayout = {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  scale: 1 // 用於後續將「畫布座標」轉換回「原始照片座標」
};

function initScanArea(){
    scanArea = {
        x: width / 3,
        y: height / 3,
        w: width / 3,
        h: height / 3
      };
}