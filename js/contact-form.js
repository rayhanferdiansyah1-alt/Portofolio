(() => {
  "use strict";

  const root = document.documentElement;
  const modal = document.getElementById("contactModal");
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactFormStatus");

  const closeButton =
    modal?.querySelector("[data-contact-close]");

  const openButtons =
    document.querySelectorAll("[data-contact-open]");

  const submitButton =
    form?.querySelector(".contact-form__submit");

  const submitLabel =
    form?.querySelector("[data-submit-label]");

  const firstField =
    document.getElementById("contactName");

  if (
    !modal ||
    !form ||
    !status ||
    !submitButton ||
    !submitLabel
  ) {
    return;
  }

  const supportsDialog =
    typeof modal.showModal === "function";

  /*
   * Jika browser tidak mendukung dialog,
   * link Email tetap bekerja melalui mailto.
   */
  if (!supportsDialog) {
    return;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const defaultSubmitLabel =
    submitLabel.textContent.trim();

  const closeDuration =
    reducedMotion ? 0 : 500;

  let lastFocusedElement = null;
  let closeTimer = null;
  let requestTimer = null;
  let activeRequest = null;
  let isSubmitting = false;


  /* =========================================================
     FORM STATUS
     ========================================================= */

  const setStatus = (
    message = "",
    state = ""
  ) => {
    status.textContent = message;

    if (state) {
      status.dataset.state = state;
    } else {
      delete status.dataset.state;
    }
  };


  /* =========================================================
     SUBMITTING STATE
     ========================================================= */

  const setSubmitting = (submitting) => {
    isSubmitting = submitting;

    form.classList.toggle(
      "is-submitting",
      submitting
    );

    form.setAttribute(
      "aria-busy",
      String(submitting)
    );

    submitButton.disabled = submitting;

    submitLabel.textContent = submitting
      ? "Sending..."
      : defaultSubmitLabel;
  };


  /* =========================================================
     PAGE SCROLL LOCK
     ========================================================= */

  const lockPageScroll = () => {
    root.classList.add(
      "contact-modal-open"
    );

    document.body.classList.add(
      "contact-modal-open"
    );
  };

  const unlockPageScroll = () => {
    root.classList.remove(
      "contact-modal-open"
    );

    document.body.classList.remove(
      "contact-modal-open"
    );
  };


  /* =========================================================
     FOCUS MANAGEMENT
     ========================================================= */

  const restoreFocus = () => {
    if (
      lastFocusedElement instanceof HTMLElement &&
      lastFocusedElement.isConnected
    ) {
      lastFocusedElement.focus({
        preventScroll: true
      });
    }

    lastFocusedElement = null;
  };


  /* =========================================================
     CLOSE MODAL
     ========================================================= */

  const finishClosing = () => {
    if (closeTimer !== null) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    modal.classList.remove(
      "is-visible",
      "is-closing"
    );

    if (modal.open) {
      modal.close();
    }

    unlockPageScroll();
    restoreFocus();
  };

  const closeModal = () => {
    if (
      !modal.open ||
      modal.classList.contains("is-closing")
    ) {
      return;
    }

    modal.classList.remove(
      "is-visible"
    );

    modal.classList.add(
      "is-closing"
    );

    if (closeDuration === 0) {
      finishClosing();
      return;
    }

    closeTimer = window.setTimeout(
      finishClosing,
      closeDuration
    );
  };


  /* =========================================================
     OPEN MODAL
     ========================================================= */

  const openModal = (event) => {
    event.preventDefault();

    if (modal.open) {
      return;
    }

    lastFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (closeTimer !== null) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }

    modal.classList.remove(
      "is-visible",
      "is-closing"
    );

    setStatus();

    modal.showModal();
    lockPageScroll();

    window.requestAnimationFrame(() => {
      modal.classList.add(
        "is-visible"
      );

      window.requestAnimationFrame(() => {
        firstField?.focus({
          preventScroll: true
        });
      });
    });
  };


  /* =========================================================
     OPEN BUTTONS
     ========================================================= */

  openButtons.forEach((button) => {
    button.addEventListener(
      "click",
      openModal
    );
  });


  /* =========================================================
     CLOSE BUTTON
     ========================================================= */

  closeButton?.addEventListener(
    "click",
    closeModal
  );


  /* =========================================================
     ESCAPE KEY
     ========================================================= */

  modal.addEventListener(
    "cancel",
    (event) => {
      event.preventDefault();
      closeModal();
    }
  );


  /* =========================================================
     BACKDROP CLICK
     ========================================================= */

  modal.addEventListener(
    "click",
    (event) => {
      if (event.target !== modal) {
        return;
      }

      const bounds =
        modal.getBoundingClientRect();

      const clickedInside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!clickedInside) {
        closeModal();
      }
    }
  );


  /* =========================================================
     NATIVE DIALOG CLOSE SAFETY
     ========================================================= */

  modal.addEventListener(
    "close",
    () => {
      modal.classList.remove(
        "is-visible",
        "is-closing"
      );

      unlockPageScroll();
    }
  );


  /* =========================================================
     FORM SUBMISSION
     ========================================================= */

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const endpoint =
        form
          .getAttribute("action")
          ?.trim() || "";

      if (
        !endpoint ||
        endpoint.includes("FORM_ID_KAMU")
      ) {
        setStatus(
          "Endpoint formulir belum dikonfigurasi.",
          "error"
        );

        return;
      }

      setSubmitting(true);

      setStatus(
        "Mengirim pesan...",
        "loading"
      );

      activeRequest =
        new AbortController();

      requestTimer =
        window.setTimeout(
          () => {
            activeRequest?.abort();
          },
          20000
        );

      try {
        const response = await fetch(
          endpoint,
          {
            method: "POST",

            body: new FormData(form),

            headers: {
              Accept: "application/json"
            },

            signal:
              activeRequest.signal
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        const payload =
          contentType.includes(
            "application/json"
          )
            ? await response
                .json()
                .catch(() => null)
            : null;

        if (!response.ok) {
          const serviceMessage =
            payload?.errors
              ?.map(
                (error) =>
                  error.message
              )
              .filter(Boolean)
              .join(" ");

          throw new Error(
            serviceMessage ||
            "Form service rejected the request."
          );
        }

        form.reset();

        setStatus(
          "Pesan berhasil dikirim. Terima kasih sudah menghubungi Rayhan.",
          "success"
        );
      } catch (error) {
        const timedOut =
          error?.name === "AbortError";

        setStatus(
          timedOut
            ? "Koneksi terlalu lama. Silakan coba kirim kembali."
            : "Pesan gagal dikirim. Silakan coba lagi atau gunakan email langsung.",
          "error"
        );

        console.warn(
          "Contact form submission failed.",
          error
        );
      } finally {
        if (requestTimer !== null) {
          window.clearTimeout(
            requestTimer
          );

          requestTimer = null;
        }

        activeRequest = null;

        setSubmitting(false);
      }
    }
  );


  /* =========================================================
     PAGE CLEANUP
     ========================================================= */

  window.addEventListener(
    "pagehide",
    () => {
      if (closeTimer !== null) {
        window.clearTimeout(
          closeTimer
        );
      }

      if (requestTimer !== null) {
        window.clearTimeout(
          requestTimer
        );
      }

      activeRequest?.abort();

      unlockPageScroll();
    },
    {
      once: true
    }
  );
})();