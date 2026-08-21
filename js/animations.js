(() => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const revealAllImmediately = () => {
    document.querySelectorAll(".reveal, .reveal-text").forEach((el) => {
      el.classList.add("is-visible");
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  };

  if (reducedMotion) {
    revealAllImmediately();
    return;
  }

  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);

  /*
  |--------------------------------------------------------------------------
  | FALLBACK TANPA GSAP
  |--------------------------------------------------------------------------
  */

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

    document.querySelectorAll(".reveal, .reveal-text").forEach((el) => {
      observer.observe(el);
    });

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | GSAP SETUP
  |--------------------------------------------------------------------------
  */

  gsap.registerPlugin(ScrollTrigger);

  gsap.defaults({
    ease: "power3.out",
  });

  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });

  /*
  |--------------------------------------------------------------------------
  | HERO — CINEMATIC INTRO
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | HERO POSITIONING
  |--------------------------------------------------------------------------
  |
  | The hero title and the Three.js mount are intentionally NOT translated
  | on scroll. Their alignment is owned only by CSS (hero.css/responsive.css).
  | Three.js still animates the sculpture inside the orbit container.
  |
  */

  /*
  |--------------------------------------------------------------------------
  | GLOBAL REVEAL
  |--------------------------------------------------------------------------
  */

  document.querySelectorAll(".reveal").forEach((el) => {
    /*
      Jangan jalankan ulang elemen Hero.
      Hero sudah mempunyai timeline sendiri.
      */

    if (el.closest(".hero") || el.closest(".project")) {
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

  /*
  |--------------------------------------------------------------------------
  | LARGE TEXT REVEAL
  |--------------------------------------------------------------------------
  */

  document.querySelectorAll(".reveal-text").forEach((el) => {
    if (el.closest(".hero")) return;

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

  /*
  |--------------------------------------------------------------------------
  | ABOUT
  |--------------------------------------------------------------------------
  */

  const aboutSection = document.querySelector(".about");

  if (aboutSection) {
    gsap.fromTo(
      ".about-stats .stat",

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

  /*
|--------------------------------------------------------------------------
| PROJECTS — B2 + B3 CINEMATIC SHOWCASE
|--------------------------------------------------------------------------
*/

  const projectMobile = window.matchMedia("(max-width: 700px)").matches;

  /*
|--------------------------------------------------------------------------
| B3 — PROJECT FOCUS STATE
|--------------------------------------------------------------------------
*/

  const projectItems = gsap.utils.toArray(".project");

  const setProjectFocus = (activeProject) => {
    projectItems.forEach((item) => {
      item.classList.toggle("is-focus", item === activeProject);
    });
  };

  const clearProjectFocus = (project) => {
    project.classList.remove("is-focus");
  };

  /*
|--------------------------------------------------------------------------
| PROJECT LOOP
|--------------------------------------------------------------------------
*/

  projectItems.forEach((project) => {
    const meta = project.querySelector(".project-meta");

    const copy = project.querySelector(".project-copy");

    const visual = project.querySelector(".project-visual");

    const image = project.querySelector(".project-shot img");

    const overlay = project.querySelector(".project-shot-overlay");

    const footer = project.querySelector(".project-footer");

    /*
    |--------------------------------------------------------------------------
    | PROJECT ENTRANCE
    |--------------------------------------------------------------------------
    */

    const projectTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: project,

        start: "top 82%",

        once: true,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | META
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | PROJECT COPY
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | PROJECT VISUAL
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | PROJECT FOOTER
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | B2 — VISUAL PARALLAX
    |--------------------------------------------------------------------------
    */

    if (visual) {
      gsap.fromTo(
        visual,

        {
          yPercent: projectMobile ? 1.2 : 3.2,
        },

        {
          yPercent: projectMobile ? -1.2 : -3.2,

          ease: "none",

          scrollTrigger: {
            trigger: project,

            start: "top bottom",

            end: "bottom top",

            scrub: projectMobile ? 1.6 : 1.2,

            invalidateOnRefresh: true,
          },
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | B2 — IMAGE INTERNAL PAN
    |--------------------------------------------------------------------------
    |
    | Pakai object-position.
    | Tidak mengubah transform image,
    | jadi hover scale dari CSS tetap aman.
    |
    */

    if (image) {
      gsap.fromTo(
        image,

        {
          objectPosition: "50% 42%",
        },

        {
          objectPosition: "50% 58%",

          ease: "none",

          scrollTrigger: {
            trigger: visual,

            start: "top bottom",

            end: "bottom top",

            scrub: projectMobile ? 1.8 : 1.35,

            invalidateOnRefresh: true,
          },
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | B2 — OVERLAY DEPTH
    |--------------------------------------------------------------------------
    */

    if (overlay) {
      gsap.fromTo(
        overlay,

        {
          y: projectMobile ? 5 : 13,
        },

        {
          y: projectMobile ? -3 : -9,

          ease: "none",

          scrollTrigger: {
            trigger: visual,

            start: "top bottom",

            end: "bottom top",

            scrub: 1.45,

            invalidateOnRefresh: true,
          },
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | B3 — PROJECT VIEWPORT FOCUS
    |--------------------------------------------------------------------------
    |
    | Project aktif saat melewati area fokus
    | di tengah viewport.
    |
    */

    ScrollTrigger.create({
      trigger: project,

      start: "top 58%",

      end: "bottom 42%",

      /*
      | Scroll turun
      */

      onEnter: () => {
        setProjectFocus(project);
      },

      /*
      | Scroll naik
      */

      onEnterBack: () => {
        setProjectFocus(project);
      },

      /*
      | Keluar ke bawah
      */

      onLeave: () => {
        clearProjectFocus(project);
      },

      /*
      | Keluar ke atas
      */

      onLeaveBack: () => {
        clearProjectFocus(project);
      },
    });
  });
  /*
  |--------------------------------------------------------------------------
  | CAPABILITIES
  |--------------------------------------------------------------------------
  */

  const capabilityItems = gsap.utils.toArray(".capability");

  capabilityItems.forEach((item, index) => {
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

        delay: Math.min(index * 0.025, 0.12),

        ease: "power3.out",

        scrollTrigger: {
          trigger: item,

          start: "top 90%",

          once: true,
        },
      },
    );
  });

  /*
  |--------------------------------------------------------------------------
  | EDUCATION
  |--------------------------------------------------------------------------
  */

  const educationCard = document.querySelector(".education-card");

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
          trigger: educationCard,

          start: "top 86%",

          once: true,
        },
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CONTACT
  |--------------------------------------------------------------------------
  */

  const contact = document.querySelector(".contact");

  if (contact) {
    gsap.fromTo(
      ".contact-heading",

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
          trigger: ".contact-heading",

          start: "top 88%",

          once: true,
        },
      },
    );

    gsap.fromTo(
      ".contact-cta",

      {
        opacity: 0,
        y: 22,
      },

      {
        opacity: 1,
        y: 0,

        duration: 0.9,

        ease: "power3.out",

        scrollTrigger: {
          trigger: ".contact-cta",

          start: "top 92%",

          once: true,
        },
      },
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ACTIVE NAVIGATION
  |--------------------------------------------------------------------------
  */

  const navLinks = document.querySelectorAll(
    '.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]',
  );

  const navSections = ["about", "projects", "skills", "education", "contact"];

  navSections.forEach((id) => {
    const section = document.getElementById(id);

    if (!section) return;

    ScrollTrigger.create({
      trigger: section,

      start: "top 45%",
      end: "bottom 45%",

      onToggle: (self) => {
        if (!self.isActive) return;

        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${id}`;

          link.classList.toggle("is-active", active);
        });
      },
    });
  });

  /*
  |--------------------------------------------------------------------------
  | REFRESH SETELAH WEBSITE SELESAI LOAD
  |--------------------------------------------------------------------------
  */

  window.addEventListener("load", () => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  });
})();
