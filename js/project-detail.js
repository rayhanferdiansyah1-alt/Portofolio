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

  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const revealItems = Array.from(
    document.querySelectorAll("[data-reveal]")
  );

  const galleryItems = Array.from(
    document.querySelectorAll("[data-gallery-item]")
  );

  let observer = null;

  const resetRevealItem = (item) => {
    item.style.removeProperty("opacity");
    item.style.removeProperty("transform");
    item.style.removeProperty("will-change");
  };

  const revealImmediately = (item) => {
    item.getAnimations?.().forEach((animation) => {
      animation.cancel();
    });

    item.dataset.revealed = "true";
    resetRevealItem(item);
  };

  const revealAllImmediately = () => {
    observer?.disconnect();
    observer = null;
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

  const animateRevealItem = (item, delay = 0) => {
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
        resetRevealItem(item);
        animation.cancel();
      })
      .catch(() => {
        resetRevealItem(item);
      });
  };

  const prepareRevealItem = (item) => {
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

    revealItems.forEach(prepareRevealItem);

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
          animateRevealItem(entry.target, Math.min(index * 55, 220));
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

  const createLightbox = () => {
    if (!galleryItems.length) {
      return null;
    }

    const dialog = document.createElement("dialog");
    dialog.className = "case-lightbox";
    dialog.setAttribute("aria-labelledby", "caseLightboxTitle");

    dialog.innerHTML = `
      <div class="case-lightbox__panel">
        <header class="case-lightbox__header">
          <div class="case-lightbox__heading">
            <span class="case-lightbox__count" data-lightbox-count></span>

            <h2
              class="case-lightbox__title"
              id="caseLightboxTitle"
              data-lightbox-title
            ></h2>
          </div>

          <button
            class="case-lightbox__close"
            type="button"
            aria-label="Tutup dokumentasi"
            data-lightbox-close
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div class="case-lightbox__stage" data-lightbox-stage>
          <button
            class="case-lightbox__nav case-lightbox__nav--previous"
            type="button"
            aria-label="Gambar sebelumnya"
            data-lightbox-previous
          >
            <span aria-hidden="true">←</span>
          </button>

          <figure class="case-lightbox__figure">
            <img
              class="case-lightbox__image"
              src=""
              alt=""
              data-lightbox-image
            >
          </figure>

          <button
            class="case-lightbox__nav case-lightbox__nav--next"
            type="button"
            aria-label="Gambar berikutnya"
            data-lightbox-next
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <footer class="case-lightbox__footer">
          Gunakan tombol panah atau geser gambar untuk melihat dokumentasi lainnya
        </footer>
      </div>
    `;

    document.body.append(dialog);

    return dialog;
  };

  const initializeGallery = () => {
    const lightbox = createLightbox();

    if (!lightbox) {
      return null;
    }

    const image = lightbox.querySelector("[data-lightbox-image]");
    const title = lightbox.querySelector("[data-lightbox-title]");
    const count = lightbox.querySelector("[data-lightbox-count]");
    const closeButton = lightbox.querySelector("[data-lightbox-close]");
    const previousButton = lightbox.querySelector(
      "[data-lightbox-previous]"
    );
    const nextButton = lightbox.querySelector("[data-lightbox-next]");
    const stage = lightbox.querySelector("[data-lightbox-stage]");

    if (
      !image ||
      !title ||
      !count ||
      !closeButton ||
      !previousButton ||
      !nextButton ||
      !stage
    ) {
      lightbox.remove();
      return null;
    }

    let currentIndex = 0;
    let lastFocusedElement = null;
    let pointerStartX = null;
    let pointerStartY = null;

    const isOpen = () => lightbox.hasAttribute("open");

    const normalizeIndex = (index) => {
      const total = galleryItems.length;

      return ((index % total) + total) % total;
    };

    const getItemData = (item) => {
      const thumbnail = item.querySelector("img");

      return {
        source:
          item.getAttribute("href") ||
          thumbnail?.currentSrc ||
          thumbnail?.src ||
          "",

        title:
          item.dataset.galleryTitle?.trim() ||
          thumbnail?.alt?.trim() ||
          `Dokumentasi ${currentIndex + 1}`,

        alt:
          thumbnail?.alt?.trim() ||
          item.dataset.galleryTitle?.trim() ||
          `Dokumentasi proyek ${currentIndex + 1}`
      };
    };

    const preloadAdjacentImages = () => {
      if (galleryItems.length < 2) {
        return;
      }

      [currentIndex - 1, currentIndex + 1].forEach((index) => {
        const item = galleryItems[normalizeIndex(index)];
        const source = getItemData(item).source;

        if (source) {
          const preloadImage = new Image();
          preloadImage.src = source;
        }
      });
    };

    const renderItem = (index) => {
      currentIndex = normalizeIndex(index);

      const item = galleryItems[currentIndex];
      const itemData = getItemData(item);
      const displayIndex = String(currentIndex + 1).padStart(2, "0");
      const displayTotal = String(galleryItems.length).padStart(2, "0");

      count.textContent = `${displayIndex} / ${displayTotal}`;
      title.textContent = itemData.title;

      image.style.opacity = "0";
      image.alt = itemData.alt;

      const revealImage = () => {
        image.style.opacity = "1";
      };

      image.addEventListener("load", revealImage, {
        once: true
      });

      image.addEventListener("error", revealImage, {
        once: true
      });

      image.src = itemData.source;

      if (image.complete) {
        revealImage();
      }

      preloadAdjacentImages();
    };

    const openLightbox = (index, trigger) => {
      lastFocusedElement = trigger;

      renderItem(index);
      page.classList.add("is-lightbox-open");

      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      } else {
        lightbox.setAttribute("open", "");
      }

      window.requestAnimationFrame(() => {
        closeButton.focus({
          preventScroll: true
        });
      });
    };

    const closeLightbox = () => {
      if (!isOpen()) {
        return;
      }

      if (typeof lightbox.close === "function") {
        lightbox.close();
      } else {
        lightbox.removeAttribute("open");
      }

      page.classList.remove("is-lightbox-open");

      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus({
          preventScroll: true
        });
      }
    };

    const showPrevious = () => {
      renderItem(currentIndex - 1);
    };

    const showNext = () => {
      renderItem(currentIndex + 1);
    };

    galleryItems.forEach((item, index) => {
      item.addEventListener("click", (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        openLightbox(index, item);
      });
    });

    closeButton.addEventListener("click", closeLightbox);
    previousButton.addEventListener("click", showPrevious);
    nextButton.addEventListener("click", showNext);

    lightbox.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeLightbox();
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }

      if (event.key === "Home") {
        event.preventDefault();
        renderItem(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        renderItem(galleryItems.length - 1);
      }
    });

    stage.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") {
        return;
      }

      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
    });

    stage.addEventListener("pointerup", (event) => {
      if (
        event.pointerType === "mouse" ||
        pointerStartX === null ||
        pointerStartY === null
      ) {
        return;
      }

      const distanceX = event.clientX - pointerStartX;
      const distanceY = event.clientY - pointerStartY;

      pointerStartX = null;
      pointerStartY = null;

      if (
        Math.abs(distanceX) < 52 ||
        Math.abs(distanceX) <= Math.abs(distanceY)
      ) {
        return;
      }

      if (distanceX > 0) {
        showPrevious();
      } else {
        showNext();
      }
    });

    stage.addEventListener("pointercancel", () => {
      pointerStartX = null;
      pointerStartY = null;
    });

    return {
      close: closeLightbox
    };
  };

  const handleMotionPreference = (event) => {
    if (event.matches) {
      revealAllImmediately();
    }
  };

  let galleryController = null;

  try {
    initializeReveal();
    galleryController = initializeGallery();

    reduceMotionQuery.addEventListener?.(
      "change",
      handleMotionPreference
    );

    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        revealAllImmediately();
        galleryController?.close();
      }
    });

    window.addEventListener(
      "pagehide",
      () => {
        observer?.disconnect();
        galleryController?.close();
      },
      {
        once: true
      }
    );
  } catch (error) {
    revealAllImmediately();
    page.classList.remove("is-lightbox-open");
  }
})();