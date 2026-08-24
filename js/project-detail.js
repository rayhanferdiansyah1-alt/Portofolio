(() => {
  "use strict";

  if (window.__rfmProjectDetailInitialized) {
    return;
  }

  const page = document.querySelector(".case-page");

  if (!page) {
    return;
  }

  window.__rfmProjectDetailInitialized = true;

  const revealItems = Array.from(
    document.querySelectorAll("[data-reveal]")
  );

  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let observer = null;

  const resetItem = (item) => {
    item.style.removeProperty("opacity");
    item.style.removeProperty("transform");
    item.style.removeProperty("will-change");
  };

  const revealImmediately = (item) => {
    item.getAnimations?.().forEach((animation) => {
      animation.cancel();
    });

    item.dataset.revealed = "true";
    resetItem(item);
  };

  const revealAllImmediately = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    revealItems.forEach(revealImmediately);
  };

  const getStartTransform = (item) => {
    if (item.classList.contains("case-section__label")) {
      return "translate3d(-18px, 0, 0)";
    }

    if (
      item.classList.contains("case-meta") ||
      item.classList.contains("case-next")
    ) {
      return "translate3d(18px, 0, 0)";
    }

    return "translate3d(0, 24px, 0)";
  };

  const animateItem = (item, delay = 0) => {
    if (item.dataset.revealed === "true") {
      return;
    }

    item.dataset.revealed = "true";

    const animation = item.animate(
      [
        {
          opacity: 0,
          transform: getStartTransform(item)
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0)"
        }
      ],
      {
        duration: 720,
        delay,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards"
      }
    );

    animation.finished
      .then(() => {
        resetItem(item);
        animation.cancel();
      })
      .catch(() => {
        resetItem(item);
      });
  };

  const prepareItem = (item) => {
    item.style.opacity = "0";
    item.style.transform = getStartTransform(item);
    item.style.willChange = "opacity, transform";
  };

  const initializeReveal = () => {
    if (
      reduceMotionQuery.matches ||
      !("IntersectionObserver" in window) ||
      !("animate" in Element.prototype)
    ) {
      revealAllImmediately();
      return;
    }

    revealItems.forEach(prepareItem);

    observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              first.boundingClientRect.top -
              second.boundingClientRect.top
          );

        visibleEntries.forEach((entry, index) => {
          observer?.unobserve(entry.target);

          animateItem(
            entry.target,
            Math.min(index * 55, 220)
          );
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08
      }
    );

    revealItems.forEach((item) => {
      observer.observe(item);
    });
  };

  const handleMotionPreference = (event) => {
    if (event.matches) {
      revealAllImmediately();
    }
  };

  const handlePageShow = (event) => {
    if (event.persisted) {
      revealAllImmediately();
    }
  };

  try {
    initializeReveal();

    reduceMotionQuery.addEventListener?.(
      "change",
      handleMotionPreference
    );

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    window.addEventListener(
      "pagehide",
      () => {
        observer?.disconnect();
      },
      {
        once: true
      }
    );
  } catch (error) {
    revealAllImmediately();
  }
})();