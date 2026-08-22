(() => {
  if (!window.Lenis) return;

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return;
  }

  const lenis =
    new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
    });

  const hasGSAP =
    Boolean(
      window.gsap &&
      window.ScrollTrigger
    );

  let rafId =
    null;

  let gsapTick =
    null;

  let fallbackTick =
    null;

  const stopFallback =
    () => {
      if (
        rafId === null
      ) {
        return;
      }

      cancelAnimationFrame(
        rafId
      );

      rafId =
        null;
    };

  const startFallback =
    () => {
      if (
        hasGSAP ||
        document.hidden ||
        rafId !== null ||
        !fallbackTick
      ) {
        return;
      }

      rafId =
        requestAnimationFrame(
          fallbackTick
        );
    };

  /* =========================================================
     GSAP TICKER
     ========================================================= */

  if (hasGSAP) {
    lenis.on(
      "scroll",
      window.ScrollTrigger.update
    );

    gsapTick =
      (time) => {
        if (!document.hidden) {
          lenis.raf(
            time * 1000
          );
        }
      };

    window.gsap.ticker.add(
      gsapTick
    );

    window.gsap.ticker.lagSmoothing(
      0
    );
  } else {
    /* =======================================================
       FALLBACK TANPA GSAP
       ======================================================= */

    fallbackTick =
      (time) => {
        rafId =
          null;

        if (document.hidden) {
          return;
        }

        lenis.raf(
          time
        );

        startFallback();
      };

    startFallback();
  }

  /* =========================================================
     PAGE VISIBILITY
     ========================================================= */

  const onVisibilityChange =
    () => {
      if (document.hidden) {
        lenis.stop();
        stopFallback();

        return;
      }

      lenis.start();
      startFallback();

      window.ScrollTrigger
        ?.update();
    };

  document.addEventListener(
    "visibilitychange",
    onVisibilityChange
  );

  /* =========================================================
     CLEANUP
     ========================================================= */

  window.addEventListener(
    "pagehide",
    () => {
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );

      if (gsapTick) {
        window.gsap
          ?.ticker
          .remove(
            gsapTick
          );
      }

      stopFallback();
      lenis.destroy();
    },
    {
      once: true,
    }
  );
})();
