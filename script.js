/* =========================================================
   RFM PORTFOLIO — PREMIUM INTERACTION
   Vanilla JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     ELEMENTS
     ======================================================= */

  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const navList = document.getElementById("navList");
  const navLinks = [...document.querySelectorAll(".nav-list a")];

  const sections = [
    ...document.querySelectorAll("main section[id]")
  ];

  const revealItems = [
    ...document.querySelectorAll(".reveal")
  ];

  const cursorGlow =
    document.getElementById("cursorGlow");

  const profileCard =
    document.querySelector(".profile-card");

  const buttons =
    document.querySelectorAll(".btn");

  const projectCards =
    document.querySelectorAll(".project-card");

  /* =======================================================
     YEAR
     ======================================================= */

  const year = document.getElementById("year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

  /* =======================================================
     PAGE LOADER
     ======================================================= */

  document.body.classList.add("page-loading");

  window.addEventListener("load", () => {

    setTimeout(() => {

      document.body.classList.remove(
        "page-loading"
      );

      document.body.classList.add(
        "page-loaded"
      );

    }, 350);

  });


  /* =======================================================
     HEADER SCROLL
     ======================================================= */

  const updateHeader = () => {

    if (!header) return;

    header.classList.toggle(
      "scrolled",
      window.scrollY > 25
    );

  };

  window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
  );

  updateHeader();


  /* =======================================================
     MOBILE NAVIGATION
     ======================================================= */

  if (navToggle && navList) {

    navToggle.addEventListener(
      "click",
      () => {

        const isOpen =
          navList.classList.toggle(
            "is-open"
          );

        navToggle.setAttribute(
          "aria-expanded",
          String(isOpen)
        );

        navToggle.setAttribute(
          "aria-label",
          isOpen
            ? "Tutup menu"
            : "Buka menu"
        );

      }
    );

  }


  /* =======================================================
     CLOSE MOBILE MENU
     ======================================================= */

  navLinks.forEach(link => {

    link.addEventListener(
      "click",
      () => {

        if (!navList || !navToggle)
          return;

        navList.classList.remove(
          "is-open"
        );

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        navToggle.setAttribute(
          "aria-label",
          "Buka menu"
        );

      }
    );

  });


  /* =======================================================
     ACTIVE NAVIGATION
     ======================================================= */

  const sectionObserver =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting)
            return;

          const currentId =
            entry.target.id;

          navLinks.forEach(link => {

            const href =
              link.getAttribute("href");

            link.classList.toggle(
              "active",
              href === `#${currentId}`
            );

          });

        });

      },
      {
        rootMargin:
          "-35% 0px -55% 0px"
      }
    );

  sections.forEach(section => {

    sectionObserver.observe(section);

  });


  /* =======================================================
     SCROLL REVEAL
     ======================================================= */

  const revealObserver =
    new IntersectionObserver(
      (entries, observer) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting)
            return;

          entry.target.classList.add(
            "is-visible"
          );

          observer.unobserve(
            entry.target
          );

        });

      },
      {
        threshold: 0.12
      }
    );

  revealItems.forEach(item => {

    revealObserver.observe(item);

  });


  /* =======================================================
     STAGGER ANIMATION
     ======================================================= */

  document
    .querySelectorAll(
      ".projects-grid .project-card, " +
      ".skills-grid .skill-card, " +
      ".contact-grid .contact-card"
    )
    .forEach((item, index) => {

      item.style.transitionDelay =
        `${index * 80}ms`;

    });


  /* =======================================================
     CURSOR GLOW
     ======================================================= */

  if (
    cursorGlow &&
    window.matchMedia(
      "(pointer: fine)"
    ).matches
  ) {

    let mouseX = 0;
    let mouseY = 0;

    let glowX = 0;
    let glowY = 0;

    window.addEventListener(
      "pointermove",
      event => {

        mouseX = event.clientX;
        mouseY = event.clientY;

      },
      { passive: true }
    );

    const animateGlow = () => {

      glowX +=
        (mouseX - glowX) * 0.08;

      glowY +=
        (mouseY - glowY) * 0.08;

      cursorGlow.style.left =
        `${glowX}px`;

      cursorGlow.style.top =
        `${glowY}px`;

      requestAnimationFrame(
        animateGlow
      );

    };

    animateGlow();

  }


  /* =======================================================
     3D PROFILE CARD
     ======================================================= */

  if (
    profileCard &&
    window.matchMedia(
      "(pointer: fine)"
    ).matches
  ) {

    profileCard.addEventListener(
      "pointermove",
      event => {

        const rect =
          profileCard.getBoundingClientRect();

        const x =
          event.clientX - rect.left;

        const y =
          event.clientY - rect.top;

        const centerX =
          rect.width / 2;

        const centerY =
          rect.height / 2;

        const rotateX =
          ((y - centerY) /
            centerY) *
          -4;

        const rotateY =
          ((x - centerX) /
            centerX) *
          5;

        profileCard.style.transform =
          `perspective(1000px)
           rotateX(${rotateX}deg)
           rotateY(${rotateY}deg)
           translateY(-5px)`;

      }
    );

    profileCard.addEventListener(
      "pointerleave",
      () => {

        profileCard.style.transform =
          "";

      }
    );

  }


  /* =======================================================
     MAGNETIC BUTTON
     ======================================================= */

  if (
    window.matchMedia(
      "(pointer: fine)"
    ).matches
  ) {

    buttons.forEach(button => {

      button.addEventListener(
        "pointermove",
        event => {

          const rect =
            button.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left -
            rect.width / 2;

          const y =
            event.clientY -
            rect.top -
            rect.height / 2;

          button.style.transform =
            `translate(
              ${x * 0.12}px,
              ${y * 0.12}px
            )`;

        }
      );

      button.addEventListener(
        "pointerleave",
        () => {

          button.style.transform =
            "";

        }
      );

    });

  }


  /* =======================================================
     PROJECT CARD LIGHT TRACKING
     ======================================================= */

  if (
    window.matchMedia(
      "(pointer: fine)"
    ).matches
  ) {

    projectCards.forEach(card => {

      card.addEventListener(
        "pointermove",
        event => {

          const rect =
            card.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left;

          const y =
            event.clientY -
            rect.top;

          card.style.setProperty(
            "--mouse-x",
            `${x}px`
          );

          card.style.setProperty(
            "--mouse-y",
            `${y}px`
          );

        }
      );

    });

  }


  /* =======================================================
     PARALLAX HERO
     ======================================================= */

  const hero =
    document.querySelector(".hero");

  const heroCopy =
    document.querySelector(".hero-copy");

  if (
    hero &&
    heroCopy &&
    window.matchMedia(
      "(pointer: fine)"
    ).matches
  ) {

    window.addEventListener(
      "scroll",
      () => {

        const scroll =
          window.scrollY;

        if (scroll > window.innerHeight)
          return;

        heroCopy.style.transform =
          `translateY(${scroll * 0.08}px)`;

      },
      { passive: true }
    );

  }


  /* =======================================================
     SMOOTH ANCHOR NAVIGATION
     ======================================================= */

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const targetId =
            link.getAttribute("href");

          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }

          const target =
            document.querySelector(
              targetId
            );

          if (!target)
            return;

          event.preventDefault();

          const headerHeight =
            header
              ? header.offsetHeight
              : 0;

          const targetPosition =
            target.getBoundingClientRect()
              .top +
            window.scrollY -
            headerHeight -
            15;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
          });

        }
      );

    });


  /* =======================================================
     KEYBOARD ACCESSIBILITY
     ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        navList &&
        navToggle
      ) {

        navList.classList.remove(
          "is-open"
        );

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        navToggle.focus();

      }

    }
  );


  /* =======================================================
     PERFORMANCE:
     DISABLE HEAVY EFFECTS ON MOBILE
     ======================================================= */

  const isMobile =
    window.matchMedia(
      "(max-width: 700px)"
    ).matches;

  if (isMobile && cursorGlow) {

    cursorGlow.style.display =
      "none";

  }


});