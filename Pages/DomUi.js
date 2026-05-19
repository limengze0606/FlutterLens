const DomUi = {
  layer: null,
  pages: {},
  start: {},
  scanning: {},
  result: {},
  bound: false,
  activeState: null,
};

function initDomUi() {
  DomUi.layer = document.getElementById("dom-ui-layer");
  DomUi.pages.start = document.getElementById("start-page-ui");
  DomUi.pages.scanning = document.getElementById("scanning-page-ui");
  DomUi.pages.result = document.getElementById("result-page-ui");

  DomUi.start.title = document.getElementById("start-title");
  DomUi.start.intro = document.getElementById("start-intro");
  DomUi.start.hint = document.getElementById("start-permission-hint");
  DomUi.start.button = document.getElementById("start-action");

  DomUi.scanning.shutter = document.getElementById("shutter-action");

  DomUi.result.toast = document.getElementById("result-toast");
  DomUi.result.actions = document.getElementById("result-actions");
  DomUi.result.save = document.getElementById("result-save-action");
  DomUi.result.share = document.getElementById("result-share-action");
  DomUi.result.back = document.getElementById("result-back-action");

  bindDomUiEvents();
  syncDomUiState();
}

function bindDomUiEvents() {
  if (DomUi.bound) return;
  DomUi.bound = true;

  if (DomUi.start.button) {
    // 【核心修正】拋棄所有 pointerdown / touchstart！
    // 請求相機與陀螺儀權限，必須使用且只能使用最純粹的 "click" 事件
    DomUi.start.button.addEventListener("click", (event) => {
      stopDomUiEvent(event);
      handleDomStartAction(event);
    }, { passive: false });
  }

  if (DomUi.scanning.shutter) {
    // 這裡只是視覺上的縮放，可以用 pointerdown/up，沒問題
    DomUi.scanning.shutter.addEventListener("pointerdown", () => {
      isShutterPressed = true;
      syncShutterButtonDom();
    });
    DomUi.scanning.shutter.addEventListener("pointerup", () => {
      isShutterPressed = false;
      syncShutterButtonDom();
    });
    DomUi.scanning.shutter.addEventListener("pointercancel", () => {
      isShutterPressed = false;
      syncShutterButtonDom();
    });
    DomUi.scanning.shutter.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      triggerShutterCapture();
    });
  }

  if (DomUi.result.save) {
    DomUi.result.save.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      exportResultImage();
    });
  }

  if (DomUi.result.share) {
    DomUi.result.share.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      shareResultImage();
    });
  }

  if (DomUi.result.back) {
    DomUi.result.back.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      resetResultData();
      currentPagesState = PagesState.SCANNING;
      syncDomUiState();
      loop();
    });
  }
}

function stopDomUiEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}

function handleDomStartAction(event) {
  stopDomUiEvent(event);
  requestStartPermissions();
}

function syncDomUiState() {
  if (!DomUi.layer || typeof currentPagesState === "undefined") return;
  DomUi.activeState = currentPagesState;
  setDomPageActive(DomUi.pages.start, currentPagesState === PagesState.START);
  setDomPageActive(DomUi.pages.scanning, currentPagesState === PagesState.SCANNING);
  setDomPageActive(DomUi.pages.result, currentPagesState === PagesState.RESULT);
}

function setDomPageActive(page, isActive) {
  if (!page) return;
  page.classList.toggle("is-active", isActive);
  page.setAttribute("aria-hidden", isActive ? "false" : "true");
}

function syncStartPageDom(layout) {
  if (!DomUi.start.button || !layout) return;

  DomUi.pages.start.classList.toggle("is-landscape-compact", layout.compact);
  DomUi.start.title.style.cssText = positionTextStyle(layout.title);
  DomUi.start.intro.style.cssText = positionTextStyle(layout.intro);
  DomUi.start.hint.style.cssText = positionTextStyle(layout.hint);
  DomUi.start.button.style.width = `${StartButton.ButtonWidth}px`;
  DomUi.start.button.style.height = `${StartButton.ButtonHeight}px`;
  DomUi.start.button.style.borderRadius = `${StartButton.ButtonBorderRadius}px`;
  DomUi.start.button.style.left = `${StartButton.ButtonX}px`;
  DomUi.start.button.style.top = `${StartButton.ButtonY}px`;
  DomUi.start.button.style.fontSize = `${layout.buttonTextSize}px`;
  DomUi.start.button.textContent = StartButton.Text;

  DomUi.start.intro.textContent = layout.introText;
  DomUi.start.hint.textContent = layout.hintText;
}

function positionTextStyle(item) {
  const xTransform = item.alignX === "left" ? "0" : "-50%";
  const yTransform = item.alignY === "center" ? "-50%" : "0";
  return [
    `left:${item.x}px`,
    `top:${item.y}px`,
    `font-size:${item.size}px`,
    `line-height:${item.leading}px`,
    `text-align:${item.alignX}`,
    `color:${item.color}`,
    `transform:translate(${xTransform}, ${yTransform})`,
  ].join(";");
}

function syncShutterButtonDom() {
  if (!DomUi.scanning.shutter) return;
  const diameter = shutterR * 2;
  DomUi.scanning.shutter.style.width = `${diameter}px`;
  DomUi.scanning.shutter.style.height = `${diameter}px`;
  DomUi.scanning.shutter.style.left = `${shutterX}px`;
  DomUi.scanning.shutter.style.top = `${shutterY}px`;
  DomUi.scanning.shutter.classList.toggle("is-pressed", isShutterPressed);
}

function syncResultActionsDom() {
  if (!DomUi.result.actions || typeof getResultActionLayout !== "function") return;
  const layout = getResultActionLayout();
  positionResultButton(DomUi.result.save, layout.save, layout);
  positionResultButton(DomUi.result.share, layout.share, layout);
  positionResultButton(DomUi.result.back, layout.back, layout);
  syncResultToastDom();
}

function positionResultButton(button, buttonLayout, layout) {
  if (!button) return;
  button.style.width = `${layout.buttonW}px`;
  button.style.height = `${layout.buttonH}px`;
  button.style.borderRadius = `${layout.radius}px`;
  button.style.left = `${buttonLayout.x}px`;
  button.style.top = `${buttonLayout.y}px`;
  button.style.fontSize = `${layout.labelSize}px`;
}

function syncResultToastDom() {
  if (!DomUi.result.toast) return;
  const hasMessage = resultShareStatus.message && millis() <= resultShareMessageUntil;
  DomUi.result.toast.textContent = hasMessage ? resultShareStatus.message : "";
  DomUi.result.toast.classList.toggle("is-visible", !!hasMessage);

  if (typeof getResultActionLayout === "function") {
    const layout = getResultActionLayout();
    const messageH = height < 420 ? 34 : 38;
    DomUi.result.toast.style.minHeight = `${messageH}px`;
    DomUi.result.toast.style.left = `${width / 2}px`;
    DomUi.result.toast.style.top = `${layout.save.y - layout.buttonH / 2 - messageH / 2 - 12}px`;
  }
}
