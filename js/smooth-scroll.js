(() => {
  if (!window.Lenis) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    syncTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  if (window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }
})();
