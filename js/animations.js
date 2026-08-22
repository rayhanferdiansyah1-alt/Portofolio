(() => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const revealElements = () =>
    document.querySelectorAll(".reveal, .reveal-text");

  const revealAllImmediately = () => {
    revealElements().forEach((el) => {
      el.classList.add("is-visible");
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  };

  /* =========================================================
     REDUCED MOTION
     ========================================================= */

  if (reducedMotion) {
    revealAllImmediately();
    return;
  }

  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);

  /* =========================================================
     FALLBACK TANPA GSAP
     ========================================================= */

  if (!hasGSAP) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px",
      },
    );

    revealElements().forEach((el) => observer.observe(el));

    return;
  }

  /* =========================================================
     GSAP SETUP
     ========================================================= */

  gsap.registerPlugin(ScrollTrigger);

  gsap.defaults({
    ease: "power3.out",
  });

  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });

  /*
   * CSS .reveal / .reveal-text hanya menjadi fallback
   * jika GSAP tidak tersedia.
   *
   * Ketika GSAP aktif, state fallback dibuat visible.
   * Initial animation kemudian sepenuhnya diatur GSAP
   * melalui fromTo().
   *
   * Ini mencegah konflik transform antara:
   *
   * - CSS fallback
   * - project parallax
   * - component animation
   * - magnetic interaction
   */

  revealElements().forEach((el) => {
    el.classList.add("is-visible");
  });

  /* =========================================================
     HELPERS
     ========================================================= */

  const isComponentOwnedReveal = (el) => {
    return Boolean(
      el.closest(".project") ||
        el.matches(".about-stats .stat") ||
        el.matches(".capability") ||
        el.matches(".education-card") ||
        el.matches(".contact-cta"),
    );
  };

  const projectMobile = window.matchMedia(
    "(max-width: 700px)",
  ).matches;

  const transitionMobile = projectMobile;

  /* =========================================================
     HERO — CINEMATIC INTRO
     ========================================================= */

  const heroTimeline = gsap.timeline({
    defaults: {
      ease: "power4.out",
    },
  });

  heroTimeline
    .fromTo(
      ".hero-topline",

      {
        opacity: 0,
        y: 18,
      },

      {
        opacity: 1,
        y: 0,
        duration: 0.85,
      },
    )

    .fromTo(
      ".hero-title .hero-line",

      {
        opacity: 0,
        yPercent: 115,
        rotate: 1.8,
      },

      {
        opacity: 1,
        yPercent: 0,
        rotate: 0,

        duration: 1.12,

        stagger: 0.11,

        ease: "power4.out",
      },

      "-=0.50",
    )

    .fromTo(
      ".hero-intro",

      {
        opacity: 0,
        y: 26,
      },

      {
        opacity: 1,
        y: 0,

        duration: 0.9,
      },

      "-=0.55",
    )

    .fromTo(
      ".hero-status",

      {
        opacity: 0,
        y: 20,
      },

      {
        opacity: 1,
        y: 0,

        duration: 0.85,
      },

      "-=0.75",
    )

    .fromTo(
      ".hero-scroll",

      {
        opacity: 0,
      },

      {
        opacity: 1,

        duration: 0.8,
      },

      "-=0.55",
    );

  /* =========================================================
     GLOBAL REVEAL
     ========================================================= */

  document
    .querySelectorAll(".reveal")
    .forEach((el) => {
      /*
       * Hero punya timeline sendiri.
       *
       * Component-owned elements juga punya
       * animation controller sendiri.
       *
       * Karena itu GLOBAL REVEAL tidak boleh
       * menjalankannya lagi.
       */

      if (
        el.closest(".hero") ||
        isComponentOwnedReveal(el)
      ) {
        return;
      }

      gsap.fromTo(
        el,

        {
          opacity: 0,
          y: 32,
        },

        {
          opacity: 1,
          y: 0,

          duration: 0.95,

          ease: "power3.out",

          scrollTrigger: {
            trigger: el,

            start: "top 88%",

            once: true,
          },
        },
      );
    });

  /* =========================================================
     LARGE TEXT REVEAL
     ========================================================= */

  document
    .querySelectorAll(".reveal-text")
    .forEach((el) => {
      /*
       * Hero title punya cinematic timeline.
       *
       * Contact heading juga mempunyai
       * animation khusus.
       */

      if (
        el.closest(".hero") ||
        el.matches(".contact-heading")
      ) {
        return;
      }

      gsap.fromTo(
        el,

        {
          opacity: 0,
          y: 52,
        },

        {
          opacity: 1,
          y: 0,

          duration: 1.05,

          ease: "power4.out",

          scrollTrigger: {
            trigger: el,

            start: "top 90%",

            once: true,
          },
        },
      );
    });

  /* =========================================================
     ABOUT — STATS
     ========================================================= */

  const aboutStats = gsap.utils.toArray(
    ".about-stats .stat",
  );

  if (aboutStats.length) {
    gsap.fromTo(
      aboutStats,

      {
        opacity: 0,
        y: 28,
      },

      {
        opacity: 1,
        y: 0,

        duration: 0.8,

        stagger: 0.12,

        ease: "power3.out",

        scrollTrigger: {
          trigger: ".about-stats",

          start: "top 86%",

          once: true,
        },
      },
    );
  }

  /* =========================================================
     PROJECTS
     B2 + B3 CINEMATIC SHOWCASE
     ========================================================= */

  const projectItems = gsap.utils.toArray(
    ".project",
  );

  /* =========================================================
     PROJECT FOCUS HELPERS
     ========================================================= */

  const setProjectFocus = (
    activeProject,
  ) => {
    projectItems.forEach((item) => {
      item.classList.toggle(
        "is-focus",
        item === activeProject,
      );
    });
  };

  const clearProjectFocus = (
    project,
  ) => {
    project.classList.remove(
      "is-focus",
    );
  };

  /* =========================================================
     PROJECT LOOP
     ========================================================= */

  projectItems.forEach((project) => {
    const meta =
      project.querySelector(
        ".project-meta",
      );

    const copy =
      project.querySelector(
        ".project-copy",
      );

    const visual =
      project.querySelector(
        ".project-visual",
      );

    const image =
      project.querySelector(
        ".project-shot img",
      );

    const overlay =
      project.querySelector(
        ".project-shot-overlay",
      );

    const footer =
      project.querySelector(
        ".project-footer",
      );

    /* =======================================================
       PROJECT ENTRANCE
       ======================================================= */

    const projectTimeline =
      gsap.timeline({
        scrollTrigger: {
          trigger: project,

          start: "top 82%",

          once: true,
        },
      });

    /* =======================================================
       META
       ======================================================= */

    if (meta) {
      projectTimeline.fromTo(
        meta,

        {
          opacity: 0,
          y: 18,
        },

        {
          opacity: 1,
          y: 0,

          duration: 0.75,

          ease: "power3.out",
        },
      );
    }

    /* =======================================================
       COPY
       ======================================================= */

    if (copy) {
      projectTimeline.fromTo(
        copy,

        {
          opacity: 0,
          y: 42,
        },

        {
          opacity: 1,
          y: 0,

          duration: 1,

          ease: "power3.out",
        },

        "-=0.42",
      );
    }

    /* =======================================================
       VISUAL
       ======================================================= */

    if (visual) {
      projectTimeline.fromTo(
        visual,

        {
          opacity: 0,
        },

        {
          opacity: 1,

          duration: 1.15,

          ease: "power4.out",
        },

        "-=0.58",
      );
    }

    /* =======================================================
       FOOTER
       ======================================================= */

    if (footer) {
      projectTimeline.fromTo(
        footer,

        {
          opacity: 0,
          y: 16,
        },

        {
          opacity: 1,
          y: 0,

          duration: 0.75,

          ease: "power3.out",
        },

        "-=0.52",
      );
    }

    /* =======================================================
       B2 — VISUAL PARALLAX
       ======================================================= */

    if (visual) {
      gsap.fromTo(
        visual,

        {
          yPercent:
            projectMobile
              ? 1.2
              : 3.2,
        },

        {
          yPercent:
            projectMobile
              ? -1.2
              : -3.2,

          ease: "none",

          scrollTrigger: {
            trigger: project,

            start:
              "top bottom",

            end:
              "bottom top",

            scrub:
              projectMobile
                ? 1.6
                : 1.2,

            invalidateOnRefresh:
              true,
          },
        },
      );
    }

    /* =======================================================
       B2 — IMAGE INTERNAL PAN

       Menggunakan object-position.
       BUKAN transform.

       Hover scale image dari CSS tetap aman.
       ======================================================= */

    if (image && visual) {
      gsap.fromTo(
        image,

        {
          objectPosition:
            "50% 42%",
        },

        {
          objectPosition:
            "50% 58%",

          ease: "none",

          scrollTrigger: {
            trigger: visual,

            start:
              "top bottom",

            end:
              "bottom top",

            scrub:
              projectMobile
                ? 1.8
                : 1.35,

            invalidateOnRefresh:
              true,
          },
        },
      );
    }

    /* =======================================================
       B2 — OVERLAY DEPTH
       ======================================================= */

    if (overlay && visual) {
      gsap.fromTo(
        overlay,

        {
          y:
            projectMobile
              ? 5
              : 13,
        },

        {
          y:
            projectMobile
              ? -3
              : -9,

          ease: "none",

          scrollTrigger: {
            trigger: visual,

            start:
              "top bottom",

            end:
              "bottom top",

            scrub: 1.45,

            invalidateOnRefresh:
              true,
          },
        },
      );
    }

    /* =======================================================
       B3 — VIEWPORT FOCUS
       ======================================================= */

    ScrollTrigger.create({
      trigger: project,

      start: "top 58%",

      end: "bottom 42%",

      onEnter: () => {
        setProjectFocus(
          project,
        );
      },

      onEnterBack: () => {
        setProjectFocus(
          project,
        );
      },

      onLeave: () => {
        clearProjectFocus(
          project,
        );
      },

      onLeaveBack: () => {
        clearProjectFocus(
          project,
        );
      },
    });
  });

  /* =========================================================
     CAPABILITIES
     ========================================================= */

  const capabilityItems =
    gsap.utils.toArray(
      ".capability",
    );

  capabilityItems.forEach(
    (item, index) => {
      gsap.fromTo(
        item,

        {
          opacity: 0,
          y: 24,
        },

        {
          opacity: 1,
          y: 0,

          duration: 0.85,

          delay:
            Math.min(
              index * 0.025,
              0.12,
            ),

          ease: "power3.out",

          scrollTrigger: {
            trigger: item,

            start:
              "top 90%",

            once: true,
          },
        },
      );
    },
  );

  /* =========================================================
     EDUCATION
     ========================================================= */

  const educationCard =
    document.querySelector(
      ".education-card",
    );

  if (educationCard) {
    gsap.fromTo(
      educationCard,

      {
        opacity: 0,
        y: 34,
      },

      {
        opacity: 1,
        y: 0,

        duration: 1,

        ease: "power3.out",

        scrollTrigger: {
          trigger:
            educationCard,

          start:
            "top 86%",

          once: true,
        },
      },
    );
  }

  /* =========================================================
     CONTACT
     ========================================================= */

  const contactHeading =
    document.querySelector(
      ".contact-heading",
    );

  const contactCta =
    document.querySelector(
      ".contact-cta",
    );

  /* =========================================================
     CONTACT HEADING
     ========================================================= */

  if (contactHeading) {
    gsap.fromTo(
      contactHeading,

      {
        opacity: 0,
        y: 60,
      },

      {
        opacity: 1,
        y: 0,

        duration: 1.15,

        ease: "power4.out",

        scrollTrigger: {
          trigger:
            contactHeading,

          start:
            "top 88%",

          once: true,
        },
      },
    );
  }

  /* =========================================================
     CONTACT CTA
     ========================================================= */

  if (contactCta) {
    /*
     * contact-cta menggunakan magnetic transform
     * melalui main.js.
     *
     * Karena itu GSAP TIDAK lagi mengubah
     * transform / translateY CTA.
     *
     * GSAP hanya mengatur opacity.
     */

    gsap.fromTo(
      contactCta,

      {
        opacity: 0,
      },

      {
        opacity: 1,

        duration: 0.9,

        ease: "power3.out",

        scrollTrigger: {
          trigger:
            contactCta,

          start:
            "top 92%",

          once: true,
        },
      },
    );
  }

  /* =========================================================
     C5 — SECTION TRANSITIONS
     ========================================================= */

  const transitionSections =
    gsap.utils.toArray(
      ".about, .projects, .skills, .education, .contact",
    );

  transitionSections.forEach(
    (section, index) => {
      /*
       * Hindari bridge duplicate jika script
       * suatu saat dieksekusi ulang.
       */

      if (
        section.querySelector(
          ".section-bridge",
        )
      ) {
        return;
      }

      /* =====================================================
         CREATE ELEMENTS
         ===================================================== */

      const bridge =
        document.createElement(
          "div",
        );

      const line =
        document.createElement(
          "span",
        );

      const glow =
        document.createElement(
          "span",
        );

      const point =
        document.createElement(
          "span",
        );

      bridge.className =
        "section-bridge";

      line.className =
        "section-bridge-line";

      glow.className =
        "section-bridge-glow";

      point.className =
        "section-bridge-point";

      bridge.setAttribute(
        "aria-hidden",
        "true",
      );

      /* =====================================================
         ALTERNATE AMBIENT ORIGIN
         ===================================================== */

      bridge.style.setProperty(
        "--bridge-origin",

        index % 2 === 0
          ? "38%"
          : "62%",
      );

      bridge.append(
        line,
        glow,
        point,
      );

      section.prepend(
        bridge,
      );

      /* =====================================================
         TRANSITION TIMELINE
         ===================================================== */

      const transitionTimeline =
        gsap.timeline({
          scrollTrigger: {
            trigger:
              section,

            start:
              "top 98%",

            end:
              "top 54%",

            scrub:
              transitionMobile
                ? 1.5
                : 1.15,

            invalidateOnRefresh:
              true,
          },
        });

      /* =====================================================
         LINE ARRIVAL
         ===================================================== */

      transitionTimeline
        .fromTo(
          line,

          {
            scaleX: 0,
            opacity: 0,
          },

          {
            scaleX: 1,
            opacity: 1,

            duration: 0.58,

            ease: "none",
          },

          0,
        )

        /* ===================================================
           LINE SETTLE
           =================================================== */

        .to(
          line,

          {
            opacity:
              transitionMobile
                ? 0.24
                : 0.34,

            duration: 0.42,

            ease: "none",
          },

          0.58,
        )

        /* ===================================================
           GLOW ARRIVAL
           =================================================== */

        .fromTo(
          glow,

          {
            opacity: 0,
            y: -18,
          },

          {
            opacity:
              transitionMobile
                ? 0.32
                : 0.52,

            y: 0,

            duration: 0.48,

            ease: "none",
          },

          0,
        )

        /* ===================================================
           GLOW DISSOLVE
           =================================================== */

        .to(
          glow,

          {
            opacity: 0,

            y:
              transitionMobile
                ? 14
                : 24,

            duration: 0.52,

            ease: "none",
          },

          0.48,
        )

        /* ===================================================
           LIGHT POINT ARRIVAL
           =================================================== */

        .fromTo(
          point,

          {
            opacity: 0,
            scale: 0,
          },

          {
            opacity:
              transitionMobile
                ? 0.5
                : 0.8,

            scale: 1,

            duration: 0.32,

            ease: "none",
          },

          0.18,
        )

        /* ===================================================
           LIGHT POINT EXIT
           =================================================== */

        .to(
          point,

          {
            opacity: 0,

            scale: 0.55,

            duration: 0.4,

            ease: "none",
          },

          0.5,
        );
    },
  );

  /* =========================================================
     ACTIVE NAVIGATION
     ========================================================= */

  const navLinks =
    document.querySelectorAll(
      '.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]',
    );

  const navSections = [
    "about",
    "projects",
    "skills",
    "education",
    "contact",
  ];

  navSections.forEach((id) => {
    const section =
      document.getElementById(
        id,
      );

    if (!section) return;

    ScrollTrigger.create({
      trigger:
        section,

      start:
        "top 45%",

      end:
        "bottom 45%",

      onToggle: (self) => {
        if (!self.isActive) {
          return;
        }

        navLinks.forEach(
          (link) => {
            const active =
              link.getAttribute(
                "href",
              ) === `#${id}`;

            link.classList.toggle(
              "is-active",
              active,
            );
          },
        );
      },
    });
  });

  /* =========================================================
     FINAL REFRESH
     ========================================================= */

  window.addEventListener(
    "load",
    () => {
      requestAnimationFrame(
        () => {
          ScrollTrigger.refresh();
        },
      );
    },
  );
})();