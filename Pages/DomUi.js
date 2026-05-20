const DomUi = {
  layer: null,
  pages: {},
  start: {},
  scanning: {},
  result: {},
  bound: false,
  activeState: null,
};
const START_PAGE_FADE_OUT_MS = 420;
let startPageFadeOutPending = false;

function initDomUi() {
  DomUi.layer = document.getElementById("dom-ui-layer");
  DomUi.pages.start = document.getElementById("start-page-ui");
  DomUi.pages.scanning = document.getElementById("scanning-page-ui");
  DomUi.pages.result = document.getElementById("result-page-ui");

  DomUi.start.title = document.getElementById("start-title");
  DomUi.start.intro = document.getElementById("start-intro");
  DomUi.start.hint = document.getElementById("start-permission-hint");
  DomUi.start.permissionActions = document.getElementById("start-permission-actions");
  DomUi.start.camera = document.getElementById("camera-permission-action");
  DomUi.start.motion = document.getElementById("motion-permission-action");
  DomUi.start.status = document.getElementById("start-permission-status");
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

  if (DomUi.start.camera) {
    DomUi.start.camera.addEventListener("click", (event) => {
      stopDomUiEvent(event);
      requestCameraPermission();
    }, { passive: false });
  }

  if (DomUi.start.motion) {
    DomUi.start.motion.addEventListener("click", (event) => {
      stopDomUiEvent(event);
      requestMotionPermission();
    }, { passive: false });
  }

  if (DomUi.start.button) {
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

function beginStartPageFadeOut(onComplete) {
  if (!DomUi.pages.start || startPageFadeOutPending) return false;

  startPageFadeOutPending = true;
  DomUi.pages.start.classList.add("is-exiting");
  DomUi.pages.start.style.pointerEvents = "none";
  if (DomUi.start.button) {
    DomUi.start.button.disabled = true;
  }

  window.setTimeout(() => {
    startPageFadeOutPending = false;
    if (typeof onComplete === "function") {
      onComplete();
    }
  }, START_PAGE_FADE_OUT_MS);

  return true;
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
  const keepStartExitState = page === DomUi.pages.start && startPageFadeOutPending;
  if (isActive && !keepStartExitState) {
    page.classList.remove("is-exiting");
    page.style.pointerEvents = "";
  }
  page.setAttribute("aria-hidden", isActive ? "false" : "true");
}

function syncStartPageDom(layout) {
  if (!DomUi.start.button || !layout) return;

  DomUi.pages.start.classList.toggle("is-landscape-compact", layout.compact);
  DomUi.start.intro.textContent = layout.introText;
  DomUi.start.hint.textContent = layout.hintText;

  syncStartPermissionDom();
  markBootLayoutReady();
}

function markBootLayoutReady() {
  if (document.body.classList.contains("app-ready")) return;
  document.body.classList.add("app-ready");
}

function syncStartPermissionDom() {
  if (!DomUi.start.button) return;
  const state = typeof startPermissionState !== "undefined" ? startPermissionState : null;
  const cameraGranted = !!(state && state.camera.granted);
  const motionGranted = !!(state && state.motion.granted);
  const ready = cameraGranted && motionGranted;

  syncPermissionButtonState(DomUi.start.camera, state ? state.camera : null, "相機權限");
  syncPermissionButtonState(DomUi.start.motion, state ? state.motion : null, "陀螺儀權限");

  DomUi.start.button.disabled = !ready || startPageFadeOutPending;
  DomUi.start.button.classList.toggle("is-ready", ready);
  DomUi.start.button.textContent = ready ? "開始探索" : "等待權限";

  if (DomUi.start.status) {
    DomUi.start.status.textContent = state ? getStartPermissionStatusMessage(state) : "";
    DomUi.start.status.style.color = state && (state.camera.error || state.motion.error)
      ? "rgb(255, 180, 150)"
      : "rgb(180, 180, 180)";
  }
}

function syncPermissionButtonState(button, permission, defaultLabel) {
  if (!button) return;
  const status = permission ? permission.status : "idle";
  button.disabled = status === "pending" || status === "granted";
  button.classList.toggle("is-granted", status === "granted");
  button.classList.toggle("is-denied", status === "denied" || status === "error");
  button.classList.toggle("is-pending", status === "pending");
  button.textContent = getPermissionButtonLabel(defaultLabel, status);
}

function getPermissionButtonLabel(defaultLabel, status) {
  if (status === "granted") return `${defaultLabel} ✓`;
  if (status === "pending") return "詢問中...";
  if (status === "denied" || status === "error") return `重試${defaultLabel}`;
  return defaultLabel;
}

function getStartPermissionStatusMessage(state) {
  if (state.camera.error) return `相機：${state.camera.error}`;
  if (state.motion.error) return `陀螺儀：${state.motion.error}`;
  if (state.camera.granted && state.motion.granted) return "兩項權限已允許，可以開始探索。";
  if (state.camera.granted) return "相機已允許，請再允許陀螺儀。";
  if (state.motion.granted) return "陀螺儀已允許，請再允許相機。";
  return "";
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
