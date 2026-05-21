function drawStartPage() {
  syncStartPageDomIfReady({
    compact: isStartPageLandscapeCompact(),
    introText: getStartPageIntroText()
  });
}

function isStartPageLandscapeCompact() {
  return width > height && height < 360;
}

function getStartPageIntroText() {
  if (isStartPageLandscapeCompact()) {
    return "以鏡頭採集環境色彩，尋找隱身其中的未知昆蟲。";
  }

  return "以鏡頭採集環境色彩，尋找隱身其中的未知昆蟲。";
}

function syncStartPageDomIfReady(layout) {
  if (typeof syncStartPageDom === "function") {
    syncStartPageDom(layout);
  }
}
