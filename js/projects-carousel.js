(() => {
  "use strict";

  const carousel = document.querySelector("[data-project-carousel]");

  if (!carousel || carousel.dataset.carouselReady === "true") {
    return;
  }

  const viewport = carousel.querySelector("[data-carousel-viewport]");
  const slides = Array.from(
    carousel.querySelectorAll("[data-carousel-slide]"),
  );
  const previousButton = carousel.querySelector("[data-carousel-previous]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const currentLabel = carousel.querySelector("[data-carousel-current]");
  const totalLabel = carousel.querySelector("[data-carousel-total]");
  const liveRegion = carousel.querySelector("[data-carousel-live]");

  if (!viewport || slides.length < 2 || !previousButton || !nextButton) {
    return;
  }

  carousel.dataset.carouselReady = "true";
  carousel.setAttribute("role", "region");
  carousel.setAttribute("tabindex", "0");

  previousButton.disabled = false;
  nextButton.disabled = false;

  const total = slides.length;

  if (totalLabel) {
    totalLabel.textContent = String(total).padStart(2, "0");
  }

  let activeIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains("is-active")),
  );

  let lastDirection = 1;
  let resizeFrame = null;
  let dragFrame = null;
  let pendingDragOffset = 0;
  let suppressClick = false;

  const pointer = {
    id: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    dragging: false,
    horizontalIntent: false,
  };

  const normalizeIndex = (index) => {
    return ((index % total) + total) % total;
  };

  const clamp = (value, minimum, maximum) => {
    return Math.min(maximum, Math.max(minimum, value));
  };

  const getCircularOffset = (index) => {
    let offset = index - activeIndex;

    if (offset > total / 2) {
      offset -= total;
    }

    if (offset < -total / 2) {
      offset += total;
    }

    if (total % 2 === 0 && Math.abs(offset) === total / 2) {
      offset = Math.abs(offset) * lastDirection;
    }

    return offset;
  };

  const getLayout = () => {
    const width = window.innerWidth;

    if (width <= 700) {
      return {
        side: width * 0.72,
        far: width * 1.28,
        sideScale: 0.72,
        farScale: 0.6,
        sideOpacity: 0.42,
        farOpacity: 0.08,
        sideRotation: 5,
      };
    }

    if (width <= 900) {
      return {
        side: clamp(width * 0.38, 220, 350),
        far: clamp(width * 0.68, 390, 620),
        sideScale: 0.76,
        farScale: 0.62,
        sideOpacity: 0.46,
        farOpacity: 0.1,
        sideRotation: 6,
      };
    }

    return {
      side: clamp(width * 0.28, 250, 430),
      far: clamp(width * 0.49, 430, 760),
      sideScale: 0.78,
      farScale: 0.64,
      sideOpacity: 0.5,
      farOpacity: 0.14,
      sideRotation: 7,
    };
  };

  const setFocusableState = (slide, isActive) => {
    slide
      .querySelectorAll("a, button, input, textarea, select, [tabindex]")
      .forEach((element) => {
        if (!(element instanceof HTMLElement)) {
          return;
        }

        if (!element.hasAttribute("data-carousel-tabindex")) {
          element.dataset.carouselTabindex =
            element.getAttribute("tabindex") ?? "";
        }

        if (isActive) {
          const originalTabindex = element.dataset.carouselTabindex;

          if (originalTabindex) {
            element.setAttribute("tabindex", originalTabindex);
          } else {
            element.removeAttribute("tabindex");
          }
        } else {
          element.setAttribute("tabindex", "-1");
        }
      });
  };

  const getSlideTitle = (slide) => {
    return (
      slide.querySelector(".project-copy h3")?.textContent
        ?.replace(/\s+/g, " ")
        .trim() || `Proyek ${activeIndex + 1}`
    );
  };

  const getSlidePresentation = (offset, layout, dragOffset) => {
    if (offset === 0) {
      return {
        x: dragOffset,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        zIndex: 5,
        position: "active",
      };
    }

    const direction = Math.sign(offset) || 1;
    const distance = Math.abs(offset);
    const isSide = distance === 1;

    return {
      x:
        direction * (isSide ? layout.side : layout.far) +
        dragOffset * (isSide ? 0.72 : 0.46),

      y: isSide ? 14 : 28,
      scale: isSide ? layout.sideScale : layout.farScale,
      rotation: direction * -layout.sideRotation,
      opacity: isSide ? layout.sideOpacity : layout.farOpacity,
      zIndex: isSide ? 3 : 1,

      position: isSide
        ? direction < 0
          ? "previous"
          : "next"
        : "far",
    };
  };

  const renderSlides = (dragOffset = 0) => {
    const layout = getLayout();

    slides.forEach((slide, index) => {
      const offset = getCircularOffset(index);
      const presentation = getSlidePresentation(
        offset,
        layout,
        dragOffset,
      );

      const isActive = index === activeIndex;

      slide.style.setProperty(
        "--slide-x",
        `${presentation.x.toFixed(2)}px`,
      );

      slide.style.setProperty(
        "--slide-y",
        `${presentation.y}px`,
      );

      slide.style.setProperty(
        "--slide-scale",
        String(presentation.scale),
      );

      slide.style.setProperty(
        "--slide-rotate",
        `${presentation.rotation}deg`,
      );

      slide.style.setProperty(
        "--slide-opacity",
        String(presentation.opacity),
      );

      slide.style.setProperty(
        "--slide-z",
        String(presentation.zIndex),
      );

      slide.dataset.carouselPosition = presentation.position;
      slide.classList.toggle("is-active", isActive);

      if (isActive) {
        slide.removeAttribute("aria-hidden");
      } else {
        slide.setAttribute("aria-hidden", "true");
      }

      setFocusableState(slide, isActive);
    });
  };

  const announceActiveSlide = () => {
    const activeSlide = slides[activeIndex];
    const number = String(activeIndex + 1).padStart(2, "0");
    const title = getSlideTitle(activeSlide);

    if (currentLabel) {
      currentLabel.textContent = number;
    }

    if (liveRegion) {
      liveRegion.textContent =
        `Proyek ${activeIndex + 1} dari ${total}: ${title}`;
    }

    window.dispatchEvent(
      new CustomEvent("rfm:project-change", {
        detail: {
          index: activeIndex,
          number,
          projectId: `project-${number}`,
          title,
          slide: activeSlide,
        },
      }),
    );
  };

  const resolveDirection = (nextIndex) => {
    let difference = nextIndex - activeIndex;

    if (difference > total / 2) {
      difference -= total;
    }

    if (difference < -total / 2) {
      difference += total;
    }

    return Math.sign(difference) || lastDirection;
  };

  const goTo = (index, { announce = true } = {}) => {
    const nextIndex = normalizeIndex(index);

    if (nextIndex !== activeIndex) {
      lastDirection = resolveDirection(nextIndex);
      activeIndex = nextIndex;
    }

    renderSlides();

    if (announce) {
      announceActiveSlide();
    }
  };

  const goToPrevious = () => {
    lastDirection = -1;
    goTo(activeIndex - 1);
  };

  const goToNext = () => {
    lastDirection = 1;
    goTo(activeIndex + 1);
  };

  const scheduleDragRender = (offset) => {
    pendingDragOffset = offset;

    if (dragFrame !== null) {
      return;
    }

    dragFrame = requestAnimationFrame(() => {
      dragFrame = null;
      renderSlides(pendingDragOffset);
    });
  };

  const resetPointer = () => {
    if (dragFrame !== null) {
      cancelAnimationFrame(dragFrame);
      dragFrame = null;
    }

    pointer.id = null;
    pointer.dragging = false;
    pointer.horizontalIntent = false;
    pointer.velocityX = 0;
    pendingDragOffset = 0;

    carousel.classList.remove("is-dragging");

    slides.forEach((slide) => {
      slide.style.removeProperty("transition");
    });
  };

  const finishPointer = (event, cancelled = false) => {
    if (
      pointer.id === null ||
      event.pointerId !== pointer.id
    ) {
      return;
    }

    const distance =
      event.clientX -
      pointer.startX;

    const velocityX =
      pointer.velocityX;

    const threshold =
      clamp(
        viewport.clientWidth * 0.12,
        50,
        110,
      );

    const shouldChange =
      !cancelled &&
      pointer.horizontalIntent &&
      (
        Math.abs(distance) >= threshold ||
        Math.abs(velocityX) >= 0.45
      );

    if (
      viewport.hasPointerCapture?.(
        event.pointerId,
      )
    ) {
      viewport.releasePointerCapture(
        event.pointerId,
      );
    }

    const wasDragging =
      pointer.dragging;

    resetPointer();

    void carousel.offsetWidth;

    if (wasDragging) {
      suppressClick = true;

      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    }

    if (shouldChange) {
      const directionSignal =
        Math.abs(distance) >= threshold
          ? distance
          : velocityX;

      if (directionSignal < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    } else {
      renderSlides();
    }
  };

  viewport.addEventListener(
    "pointerdown",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target
          : null;

      if (
        event.button !== 0 ||
        target?.closest(
          "a, button, input, textarea, select",
        )
      ) {
        return;
      }

      pointer.id =
        event.pointerId;

      pointer.startX =
        event.clientX;

      pointer.startY =
        event.clientY;

      pointer.lastX =
        event.clientX;

      pointer.lastTime =
        performance.now();

      pointer.velocityX = 0;
      pointer.dragging = false;
      pointer.horizontalIntent = false;

      viewport.setPointerCapture?.(
        event.pointerId,
      );
    },
  );

  viewport.addEventListener(
    "pointermove",
    (event) => {
      if (
        pointer.id === null ||
        event.pointerId !== pointer.id
      ) {
        return;
      }

      const deltaX =
        event.clientX -
        pointer.startX;

      const deltaY =
        event.clientY -
        pointer.startY;

      if (!pointer.horizontalIntent) {
        if (
          Math.abs(deltaY) >
            Math.abs(deltaX) &&
          Math.abs(deltaY) >
            8
        ) {
          return;
        }

        if (
          Math.abs(deltaX) >
          8
        ) {
          pointer.horizontalIntent = true;
          pointer.dragging = true;

          carousel.classList.add(
            "is-dragging",
          );

          slides.forEach((slide) => {
            slide.style.setProperty(
              "transition",
              "none",
            );
          });
        }
      }

      if (!pointer.horizontalIntent) {
        return;
      }

      event.preventDefault();

      const now =
        performance.now();

      const elapsed =
        Math.max(
          now - pointer.lastTime,
          1,
        );

      pointer.velocityX =
        (
          event.clientX -
          pointer.lastX
        ) /
        elapsed;

      pointer.lastX =
        event.clientX;

      pointer.lastTime =
        now;

      scheduleDragRender(
        deltaX * 0.72,
      );
    },
    {
      passive: false,
    },
  );

  viewport.addEventListener(
    "pointerup",
    (event) => {
      finishPointer(event);
    },
  );

  viewport.addEventListener(
    "pointercancel",
    (event) => {
      finishPointer(
        event,
        true,
      );
    },
  );

  carousel.addEventListener(
    "click",
    (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const target =
        event.target instanceof Element
          ? event.target
          : null;

      const slide =
        target?.closest(
          "[data-carousel-slide]",
        );

      if (
        !slide ||
        slide.classList.contains(
          "is-active",
        )
      ) {
        return;
      }

      event.preventDefault();

      goTo(
        slides.indexOf(slide),
      );
    },
    true,
  );

  previousButton.addEventListener(
    "click",
    goToPrevious,
  );

  nextButton.addEventListener(
    "click",
    goToNext,
  );

  carousel.addEventListener(
    "keydown",
    (event) => {
      if (
        event.target instanceof
          HTMLInputElement ||
        event.target instanceof
          HTMLTextAreaElement ||
        event.target instanceof
          HTMLSelectElement
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
      }

      else if (
        event.key === "ArrowRight"
      ) {
        event.preventDefault();
        goToNext();
      }

      else if (
        event.key === "Home"
      ) {
        event.preventDefault();
        goTo(0);
      }

      else if (
        event.key === "End"
      ) {
        event.preventDefault();
        goTo(total - 1);
      }
    },
  );

  slides.forEach((slide) => {
    slide
      .querySelectorAll("img")
      .forEach((image) => {
        image.draggable = false;
      });
  });

  const scheduleResize = () => {
    if (resizeFrame !== null) {
      return;
    }

    resizeFrame =
      requestAnimationFrame(() => {
        resizeFrame = null;
        renderSlides();
      });
  };

  window.addEventListener(
    "resize",
    scheduleResize,
    {
      passive: true,
    },
  );

  renderSlides();
  announceActiveSlide();
})();