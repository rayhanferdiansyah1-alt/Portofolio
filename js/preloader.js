(() => {
  const root = document.documentElement;

  const preloader = document.getElementById("sitePreloader");

  const meter = document.getElementById("preloaderMeter");

  const value = document.getElementById("preloaderValue");

  /*
   * Website harus tetap bisa digunakan
   * jika struktur PRE1 tidak ditemukan.
   */
  if (!preloader || !meter || !value) {
    root.classList.remove("is-preloading");

    if (window.__rfmPreloaderSafety) {
      clearTimeout(window.__rfmPreloaderSafety);
    }

    return;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const minimumVisibleDuration = reducedMotion ? 250 : 650;

  const maximumWaitDuration = 4200;

  const startedAt = performance.now();

  const state = {
    dom: document.readyState !== "loading",

    page: document.readyState === "complete",

    fonts: !document.fonts,

    dna: false,
  };

  let currentProgress = 0;

  let targetProgress = 8;

  let lastRenderedValue = -1;

  let completionRequested = false;

  let finished = false;

  let animationFrame = null;

  let dnaFallbackTimer = null;

  let maximumWaitTimer = null;

  /*
   * PRE3 mulai menampilkan loader.
   */
  preloader.hidden = false;

  root.classList.add("is-preloading");

  /* =========================================================
     PROGRESS RENDERER
     ========================================================= */

  const renderProgress = () => {
    const roundedProgress = Math.min(100, Math.round(currentProgress));

    const ringOffset = Math.max(0, 100 - currentProgress);

    preloader.style.setProperty("--preloader-offset", ringOffset.toFixed(2));

    if (roundedProgress === lastRenderedValue) {
      return;
    }

    lastRenderedValue = roundedProgress;

    value.textContent = `${roundedProgress}%`;

    meter.setAttribute("aria-valuenow", String(roundedProgress));
  };

  const setTarget = (nextTarget) => {
    targetProgress = Math.max(targetProgress, Math.min(nextTarget, 100));
  };

  /* =========================================================
     LOADING STATE
     ========================================================= */

  const synchronizeProgress = () => {
    let milestone = 8;

    if (state.dom) {
      milestone += 20;
    }

    if (state.fonts) {
      milestone += 26;
    }

    if (state.page) {
      milestone += 32;
    }

    if (state.dna) {
      milestone += 10;
    }

    setTarget(milestone);

    if (state.dom && state.fonts && state.page && state.dna) {
      completionRequested = true;

      setTarget(100);
    }
  };

  /* =========================================================
     READY HANDLERS
     ========================================================= */

  const markDomReady = () => {
    state.dom = true;

    synchronizeProgress();
  };

  const markPageReady = () => {
    state.page = true;

    synchronizeProgress();
  };

  const markFontsReady = () => {
    state.fonts = true;

    synchronizeProgress();
  };

  const markDnaReady = () => {
    if (state.dna) {
      return;
    }

    state.dna = true;

    if (dnaFallbackTimer !== null) {
      clearTimeout(dnaFallbackTimer);

      dnaFallbackTimer = null;
    }

    synchronizeProgress();
  };

  /* =========================================================
     FINISH
     ========================================================= */

  const finishPreloader = () => {
    if (finished) {
      return;
    }

    finished = true;

    currentProgress = 100;

    renderProgress();

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }

    if (dnaFallbackTimer !== null) {
      clearTimeout(dnaFallbackTimer);
    }

    if (maximumWaitTimer !== null) {
      clearTimeout(maximumWaitTimer);
    }

    if (window.__rfmPreloaderSafety) {
      clearTimeout(window.__rfmPreloaderSafety);

      window.__rfmPreloaderSafety = null;
    }

    document.removeEventListener("DOMContentLoaded", markDomReady);

    window.removeEventListener("load", markPageReady);

    window.removeEventListener("rfm:dna-ready", markDnaReady);

    window.removeEventListener("rfm:dna-fallback", markDnaReady);

    preloader.hidden = true;

    preloader.setAttribute("aria-hidden", "true");

    root.classList.remove("is-preloading");

    window.dispatchEvent(
      new CustomEvent("rfm:preloader-complete", {
        detail: {
          duration: performance.now() - startedAt,
        },
      }),
    );
  };

  /* =========================================================
     ANIMATION LOOP
     ========================================================= */

  const updateProgress = () => {
    if (finished) {
      return;
    }

    const distance = targetProgress - currentProgress;

    if (distance > 0.01) {
      const speed = reducedMotion
        ? Math.max(0.45, distance * 0.2)
        : Math.max(0.12, distance * 0.075);

      currentProgress = Math.min(targetProgress, currentProgress + speed);
    }

    renderProgress();

    const elapsed = performance.now() - startedAt;

    if (
      completionRequested &&
      currentProgress >= 99.7 &&
      elapsed >= minimumVisibleDuration
    ) {
      finishPreloader();

      return;
    }

    animationFrame = requestAnimationFrame(updateProgress);
  };

  /* =========================================================
     BROWSER EVENTS
     ========================================================= */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markDomReady, {
      once: true,
    });
  } else {
    markDomReady();
  }

  if (document.readyState === "complete") {
    markPageReady();
  } else {
    window.addEventListener("load", markPageReady, {
      once: true,
    });
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(markFontsReady).catch(markFontsReady);
  } else {
    markFontsReady();
  }

  /*
   * PRE4 akan mengirim salah satu event ini
   * setelah DNA WebGL atau fallback siap.
   */
  window.addEventListener("rfm:dna-ready", markDnaReady, {
    once: true,
  });

  window.addEventListener("rfm:dna-fallback", markDnaReady, {
    once: true,
  });

  /*
   * Fallback sementara sampai PRE4 dipasang.
   */
  /*
   * Safety fallback jika file Three.js
   * sama sekali tidak memberikan sinyal.
   */
  dnaFallbackTimer = window.setTimeout(markDnaReady, 3600);

  /*
   * Pengaman agar loader tidak pernah macet.
   */
  maximumWaitTimer = window.setTimeout(() => {
    state.dom = true;

    state.page = true;

    state.fonts = true;

    state.dna = true;

    completionRequested = true;

    setTarget(100);
  }, maximumWaitDuration);

  synchronizeProgress();
  renderProgress();

  animationFrame = requestAnimationFrame(updateProgress);
})();
