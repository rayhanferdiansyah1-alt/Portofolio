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

  const maximumWaitDuration = reducedMotion ? 2000 : 4200;

  const completionHoldDuration = reducedMotion ? 0 : 180;

  const exitAnimationDuration = reducedMotion ? 0 : 720;

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

  let completionHoldTimer = null;

  let exitTimer = null;

  let exitStarted = false;

  let previousProgressFrame = performance.now();

  /*
   * PRE3 mulai menampilkan loader.
   */
  preloader.hidden = false;

  preloader.removeAttribute("aria-hidden");

  root.classList.add("is-preloading");

  document.body.setAttribute("aria-busy", "true");

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

  /* =========================================================
   PRE6 — EXIT CONTROLLER
   ========================================================= */

  const clearLoadingController = () => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);

      animationFrame = null;
    }

    if (dnaFallbackTimer !== null) {
      clearTimeout(dnaFallbackTimer);

      dnaFallbackTimer = null;
    }

    if (maximumWaitTimer !== null) {
      clearTimeout(maximumWaitTimer);

      maximumWaitTimer = null;
    }

    document.removeEventListener("DOMContentLoaded", markDomReady);

    window.removeEventListener("load", markPageReady);

    window.removeEventListener("rfm:dna-ready", markDnaReady);

    window.removeEventListener("rfm:dna-fallback", markDnaReady);

    if (window.__rfmPreloaderSafety) {
      clearTimeout(window.__rfmPreloaderSafety);

      window.__rfmPreloaderSafety = null;
    }
  };

  const finalizePreloader = () => {
    if (finished) {
      return;
    }

    finished = true;

    clearLoadingController();

    if (completionHoldTimer !== null) {
      clearTimeout(completionHoldTimer);

      completionHoldTimer = null;
    }

    if (exitTimer !== null) {
      clearTimeout(exitTimer);

      exitTimer = null;
    }

    preloader.removeEventListener("transitionend", handleExitTransitionEnd);

    preloader.hidden = true;

    preloader.setAttribute("aria-hidden", "true");

    root.classList.remove("is-preloading");

    document.body.removeAttribute("aria-busy");

    window.dispatchEvent(
      new CustomEvent("rfm:preloader-complete", {
        detail: {
          duration: performance.now() - startedAt,
        },
      }),
    );
  };

  const handleExitTransitionEnd = (event) => {
    if (event.target !== preloader || event.propertyName !== "opacity") {
      return;
    }

    finalizePreloader();
  };

  const startPreloaderExit = () => {
    if (exitStarted || finished) {
      return;
    }

    exitStarted = true;

    currentProgress = 100;

    renderProgress();

    clearLoadingController();

    preloader.classList.add("is-complete");

    completionHoldTimer = window.setTimeout(() => {
      if (reducedMotion) {
        preloader.classList.add("is-leaving");

        finalizePreloader();

        return;
      }

      preloader.addEventListener("transitionend", handleExitTransitionEnd);

      preloader.classList.add("is-leaving");

      /*
       * Safety apabila transitionend
       * tidak dikirim browser.
       */
      exitTimer = window.setTimeout(
        finalizePreloader,
        exitAnimationDuration + 160,
      );
    }, completionHoldDuration);
  };

  /* =========================================================
     ANIMATION LOOP
     ========================================================= */

  /* =========================================================
   PRE7 — FRAME-STABLE PROGRESS LOOP
   ========================================================= */

  const updateProgress = (timestamp) => {
    if (finished || exitStarted) {
      return;
    }

    const frameElapsed = timestamp - previousProgressFrame;

    /*
     * Progress ring cukup diperbarui sekitar 30 FPS.
     * Three.js dan GSAP tetap mendapatkan frame lebih banyak.
     */
    if (!reducedMotion && frameElapsed < 30) {
      animationFrame = requestAnimationFrame(updateProgress);

      return;
    }

    previousProgressFrame = timestamp;

    const deltaTime = Math.min(Math.max(frameElapsed, 1) / 1000, 0.1);

    const distance = targetProgress - currentProgress;

    if (distance > 0.01) {
      const smoothing = 1 - Math.exp(-(reducedMotion ? 13 : 6.5) * deltaTime);

      const minimumStep = (reducedMotion ? 22 : 4) * deltaTime;

      currentProgress = Math.min(
        targetProgress,

        currentProgress + Math.max(minimumStep, distance * smoothing),
      );
    }

    renderProgress();

    const elapsed = performance.now() - startedAt;

    if (
      completionRequested &&
      currentProgress >= 99.7 &&
      elapsed >= minimumVisibleDuration
    ) {
      startPreloaderExit();

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

    /*
     * Kondisi darurat tidak perlu
     * menunggu progress terlalu lama.
     */
    currentProgress = Math.max(currentProgress, 99.8);

    setTarget(100);
  }, maximumWaitDuration);

  synchronizeProgress();
  renderProgress();

  animationFrame = requestAnimationFrame(updateProgress);

  /* =========================================================
   PRE7 — BACK/FORWARD CACHE SAFETY
   ========================================================= */

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) {
      return;
    }

    /*
     * Saat halaman dipulihkan dari cache browser,
     * preloader tidak perlu diputar ulang.
     */
    if (!finished) {
      finalizePreloader();

      return;
    }

    preloader.hidden = true;

    preloader.setAttribute("aria-hidden", "true");

    root.classList.remove("is-preloading");

    document.body.removeAttribute("aria-busy");
  });
})();
