// 負責把照片跟標記點「焊」在一起
let resultSceneFinalized = false;
let resultCaptureScheduled = false;
let resultRenderSeed = null;
let resultExportPending = false;
let resultExportReady = false;

function setupResultPhoto() {
    resultPhoto = video ? video.get() : null;
    resultCaptureLayout = {
        x: camLayout.x,
        y: camLayout.y,
        w: camLayout.w,
        h: camLayout.h
    };
    updateResultPhotoLayout();
    resultSceneFinalized = false;
    resultCaptureScheduled = false;
    resultRenderSeed = floor(random(1000000000));
}

function updateResultPhotoLayout() {
    if (!resultPhoto || resultPhoto.width === 0 || resultPhoto.height === 0) return;

    let photoAspect = resultCaptureLayout.w && resultCaptureLayout.h
        ? resultCaptureLayout.w / resultCaptureLayout.h
        : resultPhoto.width / resultPhoto.height;
    let canvasAspect = width / height;

    if (canvasAspect > photoAspect) {
        resultPhotoLayout.w = width;
        resultPhotoLayout.h = width / photoAspect;
    } else {
        resultPhotoLayout.h = height;
        resultPhotoLayout.w = height * photoAspect;
    }

    resultPhotoLayout.x = (width - resultPhotoLayout.w) / 2;
    resultPhotoLayout.y = (height - resultPhotoLayout.h) / 2;
}

function drawResultPage() {
    updateResultPhotoLayout();
    updateSpawnPositionForViewport();

    if (resultExportPending) {
        renderResultArtwork();
        resultExportReady = true;
        return;
    }

    renderResultArtwork();
    renderResultUi();

    if (!resultSceneFinalized) {
        resultSceneFinalized = true;
        noLoop();
    }
}

function renderResultScene(includeUi) {
    renderResultArtwork();

    if (includeUi) {
        renderResultUi();
    }
}

function renderResultArtwork() {
    if (resultPhoto) {
        updateResultPhotoLayout();
        push(); 
        image(resultPhoto, resultPhotoLayout.x, resultPhotoLayout.y, resultPhotoLayout.w, resultPhotoLayout.h);
        pop();  

        if (spawnPosition) {
            if (typeof setRoughSeed === "function" && resultRenderSeed !== null) {
                setRoughSeed(window, resultRenderSeed);
            }
            drawResultInsect();
        }
    }

}

function drawResultInsect() {
    let captureW = resultCaptureLayout.w || width;
    let captureH = resultCaptureLayout.h || height;
    let scaleX = resultPhotoLayout.w / captureW;
    let scaleY = resultPhotoLayout.h / captureH;
    let localX = spawnPositionRatio ? spawnPositionRatio.x * captureW : spawnPosition.x - resultCaptureLayout.x;
    let localY = spawnPositionRatio ? spawnPositionRatio.y * captureH : spawnPosition.y - resultCaptureLayout.y;

    push();
    translate(resultPhotoLayout.x, resultPhotoLayout.y);
    scale(scaleX, scaleY);
    drawRoughInsect(window, localX, localY);
    pop();
}

function renderResultUi() {
    drawBackButton(); 
    drawSaveButton();
}

function updateSpawnPositionForViewport() {
    if (!spawnPositionRatio) return;

    spawnPosition = {
        x: resultPhotoLayout.x + spawnPositionRatio.x * resultPhotoLayout.w,
        y: resultPhotoLayout.y + spawnPositionRatio.y * resultPhotoLayout.h
    };
}

function drawBackButton() {
  // 畫在畫面正下方，或是你想放左上角也可以
  let btnX = width / 2;
  let btnY = height - 80;
  
  // 半透明白底圓角矩形
  drawScreenRect(btnX, btnY, 140, 50, 25, { fill: [255, 255, 255, 200] });

  // 文字
  drawScreenText("返回", btnX, btnY, {
    fill: 0,
    size: 18,
    alignX: CENTER,
    alignY: CENTER
  });
}

function drawSaveButton() {
  let btnX = width / 2;
  let btnY = height - 145;

  drawScreenRect(btnX, btnY, 140, 50, 25, { fill: [255, 255, 255, 220] });

  drawScreenText("\u5132\u5b58", btnX, btnY, {
    fill: 0,
    size: 18,
    alignX: CENTER,
    alignY: CENTER
  });
}

// 檢查是否點擊到「返回」按鈕的範圍
function checkBackButtonClicked(mx, my) {
  let btnX = width / 2;
  let btnY = height - 80;
  let btnW = 140;
  let btnH = 50;

  // 簡單的矩形碰撞偵測 (AABB)
  if (mx > btnX - btnW/2 && mx < btnX + btnW/2 &&
      my > btnY - btnH/2 && my < btnY + btnH/2) {
    return true;
  }
  return false;
}

function checkSaveButtonClicked(mx, my) {
  let btnX = width / 2;
  let btnY = height - 145;
  let btnW = 140;
  let btnH = 50;

  if (mx > btnX - btnW/2 && mx < btnX + btnW/2 &&
      my > btnY - btnH/2 && my < btnY + btnH/2) {
    return true;
  }
  return false;
}

function exportResultImage() {
    if (!resultPhoto) return;

    clearScreenTextLayer();
    resultExportPending = true;
    resultExportReady = false;
    resultSceneFinalized = false;
    loop();
}

function completeResultExportIfReady() {
    if (!resultExportReady) return;

    resultExportReady = false;

    setTimeout(() => {
        if (drawingContext && typeof drawingContext.finish === "function") {
            drawingContext.finish();
        }

        saveCanvas("FlutterLens-result", "png");
        resultExportPending = false;
        clearScreenTextLayer();
        resultSceneFinalized = false;
        loop();
    }, 0);
}

function resetResultData() {
    spawnPosition = null;
    spawnPositionRatio = null;
    resultSceneFinalized = false;
    resultCaptureScheduled = false;
    resultRenderSeed = null;
    resultExportPending = false;
    resultExportReady = false;
    resultPhoto = null;
    resultPhotoLayout = { x: 0, y: 0, w: 0, h: 0 };
    resultCaptureLayout = { x: 0, y: 0, w: 0, h: 0 };
}
