(() => {
  const header =
    document.getElementById(
      "siteHeader"
    );


  const mobileToggle =
    document.getElementById(
      "mobileToggle"
    );


  const mobileNav =
    document.getElementById(
      "mobileNav"
    );


  const year =
    document.getElementById(
      "year"
    );


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  const desktopMedia =
    window.matchMedia(
      "(min-width: 901px)"
    );


  /* =========================================================
     CURRENT YEAR
     ========================================================= */

  if (year) {

    year.textContent =
      new Date()
        .getFullYear();

  }


  /* =========================================================
     HEADER SCROLL STATE
     ========================================================= */

  let headerTicking =
    false;


  const updateHeader =
    () => {

      headerTicking =
        false;


      if (!header) {
        return;
      }


      header.classList.toggle(

        "is-scrolled",

        window.scrollY >
          24

      );

    };


  const requestHeaderUpdate =
    () => {

      if (
        headerTicking
      ) {
        return;
      }


      headerTicking =
        true;


      requestAnimationFrame(
        updateHeader
      );

    };


  updateHeader();


  window.addEventListener(

    "scroll",

    requestHeaderUpdate,

    {
      passive:
        true,
    }

  );


  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  if (
    mobileToggle &&
    mobileNav
  ) {

    /*
     * HTML saat ini memakai div.
     *
     * Role ini memberi semantic navigation
     * tanpa membutuhkan perubahan struktur HTML.
     */

    mobileNav.setAttribute(
      "role",
      "navigation"
    );


    mobileNav.setAttribute(
      "aria-label",
      "Navigasi mobile"
    );


    /*
     * Closed state tidak boleh dapat
     * difokuskan screen reader / keyboard.
     */

    mobileNav.hidden =
      true;


    const navLinks =

      Array.from(

        mobileNav.querySelectorAll(
          "a"
        )

      );


    const isMenuOpen =
      () => {

        return (
          mobileToggle.getAttribute(
            "aria-expanded"
          ) ===
          "true"
        );

      };


    /* =======================================================
       OPEN MENU
       ======================================================= */

    const openMenu =
      () => {

        mobileNav.hidden =
          false;


        mobileToggle.classList.add(
          "is-open"
        );


        mobileNav.classList.add(
          "is-open"
        );


        mobileToggle.setAttribute(
          "aria-expanded",
          "true"
        );


        mobileToggle.setAttribute(
          "aria-label",
          "Tutup navigasi"
        );


        document.body.classList.add(
          "menu-open"
        );


        /*
         * Setelah menu terbuka,
         * fokus pindah ke link pertama.
         */

        requestAnimationFrame(
          () => {

            navLinks[0]
              ?.focus();

          }
        );

      };


    /* =======================================================
       CLOSE MENU
       ======================================================= */

    const closeMenu =
      ({
        restoreFocus =
          false,
      } = {}) => {

        mobileToggle.classList.remove(
          "is-open"
        );


        mobileNav.classList.remove(
          "is-open"
        );


        mobileToggle.setAttribute(
          "aria-expanded",
          "false"
        );


        mobileToggle.setAttribute(
          "aria-label",
          "Buka navigasi"
        );


        document.body.classList.remove(
          "menu-open"
        );


        mobileNav.hidden =
          true;


        if (
          restoreFocus
        ) {

          mobileToggle.focus();

        }

      };


    /* =======================================================
       TOGGLE
       ======================================================= */

    mobileToggle.addEventListener(

      "click",

      () => {

        if (
          isMenuOpen()
        ) {

          closeMenu({
            restoreFocus:
              true,
          });

        }

        else {

          openMenu();

        }

      }

    );


    /* =======================================================
       NAV LINKS
       ======================================================= */

    navLinks.forEach(
      (link) => {

        link.addEventListener(

          "click",

          () => {

            closeMenu();

          }

        );

      }
    );


    /* =======================================================
       KEYBOARD
       ESCAPE + FOCUS TRAP
       ======================================================= */

    document.addEventListener(

      "keydown",

      (event) => {

        if (
          !isMenuOpen()
        ) {
          return;
        }


        /*
         * ESC closes menu.
         */

        if (
          event.key ===
          "Escape"
        ) {

          event.preventDefault();


          closeMenu({
            restoreFocus:
              true,
          });


          return;

        }


        /*
         * Trap Tab inside:
         *
         * toggle +
         * navigation links
         */

        if (
          event.key !==
          "Tab"
        ) {
          return;
        }


        const focusable = [

          mobileToggle,

          ...navLinks,

        ].filter(
          (element) => {

            return (
              !element.hidden &&
              element.offsetParent !==
                null
            );

          }
        );


        if (
          !focusable.length
        ) {
          return;
        }


        const first =
          focusable[0];


        const last =
          focusable[
            focusable.length -
            1
          ];


        if (

          event.shiftKey &&

          document.activeElement ===
            first

        ) {

          event.preventDefault();

          last.focus();

        }

        else if (

          !event.shiftKey &&

          document.activeElement ===
            last

        ) {

          event.preventDefault();

          first.focus();

        }

      }

    );


    /* =======================================================
       DESKTOP RESIZE
       ======================================================= */

    const handleDesktopChange =
      (event) => {

        if (
          !event.matches
        ) {
          return;
        }


        if (
          isMenuOpen()
        ) {

          closeMenu();

        }

      };


    desktopMedia.addEventListener?.(

      "change",

      handleDesktopChange

    );

  }


  /* =========================================================
     MAGNETIC INTERACTION
     ========================================================= */

  const finePointer =
    window.matchMedia(
      "(pointer: fine)"
    ).matches;


  /*
   * Jangan aktifkan magnetic movement
   * untuk user reduced-motion.
   */

  if (
    finePointer &&
    !reducedMotion
  ) {

    document
      .querySelectorAll(
        ".magnetic"
      )
      .forEach(
        (item) => {

          let frame =
            null;


          let nextX =
            0;


          let nextY =
            0;


          const render =
            () => {

              frame =
                null;


              item.style.transform =
                `translate(${nextX}px, ${nextY}px)`;

            };


          const onPointerMove =
            (event) => {

              const rect =
                item.getBoundingClientRect();


              const x =

                event.clientX -

                rect.left -

                rect.width /
                2;


              const y =

                event.clientY -

                rect.top -

                rect.height /
                2;


              nextX =
                x *
                0.05;


              nextY =
                y *
                0.08;


              if (
                frame !==
                null
              ) {
                return;
              }


              frame =
                requestAnimationFrame(
                  render
                );

            };


          const reset =
            () => {

              if (
                frame !==
                null
              ) {

                cancelAnimationFrame(
                  frame
                );


                frame =
                  null;

              }


              item.style.transform =
                "";

            };


          item.addEventListener(

            "pointermove",

            onPointerMove,

            {
              passive:
                true,
            }

          );


          item.addEventListener(

            "pointerleave",

            reset

          );


          item.addEventListener(

            "blur",

            reset

          );

        }
      );

  }

})();