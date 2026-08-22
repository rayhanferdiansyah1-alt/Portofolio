(() => {
  if (!window.Lenis) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false,
  });

  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);

  let rafId = null;
  let gsapTick = null;

  /* =========================================================
     GSAP TICKER
     ========================================================= */

  if (hasGSAP) {
    lenis.on("scroll", window.ScrollTrigger.update);

    gsapTick = (time) => {
      lenis.raf(time * 1000);
    };

    window.gsap.ticker.add(gsapTick);

    window.gsap.ticker.lagSmoothing(0);
  } else {

  /* =========================================================
     FALLBACK TANPA GSAP
     ========================================================= */
    const raf = (time) => {
      lenis.raf(time);

      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);
  }

  /* =========================================================
     CLEANUP
     ========================================================= */

  window.addEventListener(
    "pagehide",

    () => {
      if (gsapTick) {
        window.gsap?.ticker.remove(gsapTick);
      }

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      lenis.destroy();
    },

    {
      once: true,
    },
  );
})();
