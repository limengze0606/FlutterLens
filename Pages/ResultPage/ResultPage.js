// 負責把照片跟標記點「焊」在一起
let resultSceneFinalized = false;
let resultCaptureScheduled = false;
let resultRenderSeed = null;
let resultExportPending = false;
let resultExportReady = false;
let resultSaveInProgress = false;
let resultShareInProgress = false;
let resultShareStatus = { state: "idle", message: "" };
let resultShareMessageUntil = 0;

function setupResultPhoto() {
    if (typeof syncBrushToCanvas === "function") {
        syncBrushToCanvas();
    }

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
    createResultArtworkSnapshot();
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
    updateResultArtworkLayout();
    renderResultPageBackground();
    renderResultArtwork();
    renderResultUi();

    if (!resultSceneFinalized) {
        resultSceneFinalized = true;
        noLoop();
    }
}

function renderResultScene(includeUi) {
    updateResultArtworkLayout();
    renderResultPageBackground();
    renderResultArtwork();

    if (includeUi) {
        renderResultUi();
    }
}

function renderResultArtwork() {
    if (!resultArtworkImage) return;

    push();
    rectMode(CORNER);
    noStroke();
    fill(0, 0, 0, 82);
    rect(
        resultArtworkLayout.x + 3,
        resultArtworkLayout.y + 5,
        resultArtworkLayout.w,
        resultArtworkLayout.h,
        resultArtworkLayout.radius
    );
    fill(236, 234, 225, 245);
    rect(
        resultArtworkLayout.x - 4,
        resultArtworkLayout.y - 4,
        resultArtworkLayout.w + 8,
        resultArtworkLayout.h + 8,
        resultArtworkLayout.radius
    );
    imageMode(CORNER);
    image(
        resultArtworkImage,
        resultArtworkLayout.x,
        resultArtworkLayout.y,
        resultArtworkLayout.w,
        resultArtworkLayout.h
    );
    pop();
}

function renderResultArtworkSource() {
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

function createResultArtworkSnapshot() {
    if (!resultPhoto) return;

    if (typeof syncBrushToCanvas === "function") {
        syncBrushToCanvas();
    }

    clearScreenTextLayer();
    background(0);
    drawInScreenSpace(() => {
        updateResultPhotoLayout();
        updateSpawnPositionForViewport();
        renderResultArtworkSource();
    });

    if (drawingContext && typeof drawingContext.finish === "function") {
        drawingContext.finish();
    }

    resultArtworkImage = get(0, 0, width, height);
    resultArtworkSourceSize = {
        w: resultArtworkImage ? resultArtworkImage.width : width,
        h: resultArtworkImage ? resultArtworkImage.height : height
    };
    updateResultArtworkLayout();
}

function drawResultInsect() {
    let x = constrain(spawnPosition.x, width * 0.08, width * 0.92);
    let y = constrain(spawnPosition.y, height * 0.08, height * 0.92);
    drawRoughInsect(window, x, y);
}

function renderResultUi() {
    drawSaveButton();
    drawShareButton();
    drawBackButton();
    drawResultShareMessage();
}

function updateSpawnPositionForViewport() {
    if (!spawnPositionRatio) return;

    spawnPosition = {
        x: constrain(resultPhotoLayout.x + spawnPositionRatio.x * resultPhotoLayout.w, width * 0.08, width * 0.92),
        y: constrain(resultPhotoLayout.y + spawnPositionRatio.y * resultPhotoLayout.h, height * 0.08, height * 0.92)
    };
}

function getResultArtworkDisplayLayout() {
  let sourceW = resultArtworkSourceSize.w || (resultArtworkImage ? resultArtworkImage.width : width);
  let sourceH = resultArtworkSourceSize.h || (resultArtworkImage ? resultArtworkImage.height : height);
  let sourceAspect = sourceW / max(1, sourceH);
  let actions = getResultActionLayout();
  let sideMargin = constrain(width * 0.07, 18, 40);
  let topMargin = constrain(height * 0.07, 22, 54);
  let actionTop = actions.save.y - actions.buttonH / 2;
  let bottomGap = height < 420 ? 12 : 22;
  let availableW = max(120, width - sideMargin * 2);
  let availableH = max(120, actionTop - topMargin - bottomGap);
  let maxDisplayW = min(availableW, width * (height < 420 ? 0.62 : 0.9));
  let maxDisplayH = availableH;
  let displayW = maxDisplayW;
  let displayH = displayW / sourceAspect;

  if (displayH > maxDisplayH) {
    displayH = maxDisplayH;
    displayW = displayH * sourceAspect;
  }

  let yBias = height < 420 ? 0.52 : 0.47;
  let centerY = topMargin + availableH * yBias;

    return {
    x: (width - displayW) / 2,
    y: centerY - displayH / 2,
    w: displayW,
    h: displayH,
    radius: 6
  };
}

function updateResultArtworkLayout() {
  resultArtworkLayout = getResultArtworkDisplayLayout();
}

function renderResultPageBackground() {
  push();
  noStroke();
  background(18, 19, 17);
  fill(31, 33, 29);
  rectMode(CORNER);
  rect(0, 0, width, height);
  fill(9, 10, 9, 90);
  rect(0, height * 0.62, width, height * 0.38);
  fill(47, 51, 43, 72);
  rect(0, 0, width, height * 0.24);
  pop();
}

function getResultActionLayout() {
  let marginX = width < 380 ? 12 : 18;
  let gap = width < 380 ? 8 : 10;
  let buttonH = height < 420 ? 42 : 50;
  let maxButtonW = height < 420 ? 96 : 108;
  let buttonW = constrain((width - marginX * 2 - gap * 2) / 3, 78, maxButtonW);
  let bottomMargin = constrain(height * 0.06, 16, height < 420 ? 22 : 30);
  let y = height - bottomMargin - buttonH / 2;
  let radius = buttonH / 2;
  let labelSize = height < 420 ? 16 : 18;

  return {
    buttonW,
    buttonH,
    radius,
    labelSize,
    save: {
      x: marginX + buttonW / 2,
      y
    },
    share: {
      x: marginX + buttonW * 1.5 + gap,
      y
    },
    back: {
      x: width - marginX - buttonW / 2,
      y
    }
  };
}

function drawResultActionButton(button, label, fillColor) {
  drawScreenRect(button.x, button.y, button.w, button.h, button.radius, { fill: fillColor });
  drawScreenText(label, button.x, button.y, {
    fill: 0,
    size: button.labelSize,
    alignX: CENTER,
    alignY: CENTER
  });
}

function drawSaveButton() {
  let layout = getResultActionLayout();
  drawResultActionButton({
    ...layout.save,
    w: layout.buttonW,
    h: layout.buttonH,
    radius: layout.radius,
    labelSize: layout.labelSize
  }, "\u5132\u5b58", [255, 255, 255, 220]);
}

function drawShareButton() {
  let layout = getResultActionLayout();
  drawResultActionButton({
    ...layout.share,
    w: layout.buttonW,
    h: layout.buttonH,
    radius: layout.radius,
    labelSize: layout.labelSize
  }, "\u5206\u4eab", [255, 255, 255, 220]);
}

function drawBackButton() {
  let layout = getResultActionLayout();
  drawResultActionButton({
    ...layout.back,
    w: layout.buttonW,
    h: layout.buttonH,
    radius: layout.radius,
    labelSize: layout.labelSize
  }, "\u8fd4\u56de", [255, 255, 255, 200]);
}

function drawResultShareMessage() {
  if (!resultShareStatus.message || millis() > resultShareMessageUntil) return;

  let layout = getResultActionLayout();
  let messageW = min(width - 36, max(220, resultShareStatus.message.length * 15));
  let messageH = height < 420 ? 34 : 38;
  let messageY = layout.save.y - layout.buttonH / 2 - messageH / 2 - 12;

  drawScreenRect(width / 2, messageY, messageW, messageH, messageH / 2, {
    fill: [0, 0, 0, 150],
    stroke: [255, 255, 255, 90]
  });
  drawScreenText(resultShareStatus.message, width / 2, messageY, {
    fill: 255,
    size: height < 420 ? 13 : 14,
    alignX: CENTER,
    alignY: CENTER
  });
}

// 檢查是否點擊到「返回」按鈕的範圍
function checkBackButtonClicked(mx, my) {
  let layout = getResultActionLayout();
  return isPointInResultButton(mx, my, layout.back, layout);
}

function checkSaveButtonClicked(mx, my) {
  let layout = getResultActionLayout();
  return isPointInResultButton(mx, my, layout.save, layout);
}

function checkShareButtonClicked(mx, my) {
  let layout = getResultActionLayout();
  return isPointInResultButton(mx, my, layout.share, layout);
}

function isPointInResultButton(mx, my, button, layout) {
  return mx > button.x - layout.buttonW / 2 &&
      mx < button.x + layout.buttonW / 2 &&
      my > button.y - layout.buttonH / 2 &&
      my < button.y + layout.buttonH / 2;
}

function showResultShareMessage(message, state = "info") {
    resultShareStatus = { state, message };
    resultShareMessageUntil = millis() + 3000;
    resultSceneFinalized = false;
    loop();

    setTimeout(() => {
        resultSceneFinalized = false;
        loop();
    }, 3200);
}

function exportResultImage() {
    if (!resultArtworkImage || resultSaveInProgress || resultExportPending || resultExportReady) return;

    resultSaveInProgress = true;
    downloadResultArtworkImage();

    setTimeout(() => {
        resultSaveInProgress = false;
    }, 500);
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
        resultSaveInProgress = false;
        clearScreenTextLayer();
        resultSceneFinalized = false;
        loop();
    }, 0);
}

function renderResultArtworkForCanvasExport() {
    clearScreenTextLayer();
    background(0);
    drawInScreenSpace(() => {
        updateResultArtworkLayout();
        renderResultArtwork();
    });

    if (drawingContext && typeof drawingContext.finish === "function") {
        drawingContext.finish();
    }
}

function restoreResultSceneAfterCanvasExport() {
    clearScreenTextLayer();
    background(0);
    drawInScreenSpace(() => {
        updateResultArtworkLayout();
        renderResultPageBackground();
        renderResultArtwork();
        renderResultUi();
    });
    drawScreenTextLayer();
    resultSceneFinalized = true;
    noLoop();
}

function getResultCanvasBlob() {
    let canvasElement = getResultArtworkCanvas();

    return new Promise((resolve, reject) => {
        if (!canvasElement || typeof canvasElement.toBlob !== "function") {
            reject(new Error("Canvas export is not available."));
            return;
        }

        canvasElement.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Canvas export failed."));
            }
        }, "image/png");
    });
}

function getResultArtworkCanvas() {
    return resultArtworkImage && (resultArtworkImage.canvas || resultArtworkImage.elt)
        ? (resultArtworkImage.canvas || resultArtworkImage.elt)
        : null;
}

function downloadResultArtworkImage() {
    let canvasElement = getResultArtworkCanvas();
    if (!canvasElement || typeof canvasElement.toDataURL !== "function") {
        resultSaveInProgress = false;
        showResultShareMessage("\u5132\u5b58\u5931\u6557\uff0c\u8acb\u91cd\u65b0\u62cd\u651d", "error");
        return;
    }

    let link = document.createElement("a");
    link.download = "FlutterLens-result.png";
    link.href = canvasElement.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function shareResultImage() {
    if (!resultArtworkImage || resultShareInProgress || resultSaveInProgress || resultExportPending) return;

    if (!navigator.share) {
        showResultShareMessage("\u6b64\u700f\u89bd\u5668\u4e0d\u652f\u63f4\u5206\u4eab\uff0c\u8acb\u5148\u5132\u5b58\u5716\u7247", "unsupported");
        return;
    }

    resultShareInProgress = true;
    resultShareStatus = { state: "preparing", message: "\u6e96\u5099\u5206\u4eab\u5716\u7247..." };

    try {
        let blob = await getResultCanvasBlob();
        let file = new File([blob], "FlutterLens-result.png", { type: "image/png" });
        let fileShareData = {
            title: "FlutterLens",
            text: "\u6211\u7684 FlutterLens \u751f\u6210\u7d50\u679c",
            files: [file]
        };

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            resultShareStatus = { state: "sharing", message: "\u958b\u555f\u5206\u4eab\u9762\u677f..." };
            resultShareMessageUntil = millis() + 3000;
            resultSceneFinalized = false;
            loop();
            await navigator.share(fileShareData);
            showResultShareMessage("\u5df2\u958b\u555f\u5206\u4eab", "shared");
        } else {
            resultShareStatus = { state: "text-only", message: "\u6b64\u88dd\u7f6e\u4e0d\u652f\u63f4\u5716\u7247\u76f4\u63a5\u5206\u4eab" };
            resultShareMessageUntil = millis() + 3000;
            resultSceneFinalized = false;
            loop();
            await navigator.share({
                title: "FlutterLens",
                text: "\u6211\u7684 FlutterLens \u751f\u6210\u7d50\u679c"
            });
            showResultShareMessage("\u6b64\u88dd\u7f6e\u4e0d\u652f\u63f4\u5716\u7247\u76f4\u63a5\u5206\u4eab", "text-only");
        }
    } catch (error) {
        if (error && error.name === "AbortError") {
            showResultShareMessage("\u5df2\u53d6\u6d88\u5206\u4eab", "cancelled");
        } else {
            console.warn("Result share failed:", error);
            showResultShareMessage("\u5206\u4eab\u5931\u6557\uff0c\u8acb\u5148\u5132\u5b58\u5716\u7247", "error");
        }
    } finally {
        resultShareInProgress = false;
        resultSceneFinalized = false;
        loop();
    }
}

function resetResultData() {
    spawnPosition = null;
    spawnPositionRatio = null;
    resultSceneFinalized = false;
    resultCaptureScheduled = false;
    resultRenderSeed = null;
    resultExportPending = false;
    resultExportReady = false;
    resultSaveInProgress = false;
    resultShareInProgress = false;
    resultShareStatus = { state: "idle", message: "" };
    resultShareMessageUntil = 0;
    resultPhoto = null;
    resultArtworkImage = null;
    resultPhotoLayout = { x: 0, y: 0, w: 0, h: 0 };
    resultArtworkLayout = { x: 0, y: 0, w: 0, h: 0 };
    resultArtworkSourceSize = { w: 0, h: 0 };
    resultCaptureLayout = { x: 0, y: 0, w: 0, h: 0 };
}
