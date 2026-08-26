(() => {
  const root = document.documentElement;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const projectMobile = window.matchMedia("(max-width: 700px)").matches;

  const revealSelector = ".reveal, .reveal-text";

  const projectImages = Array.from(
    document.querySelectorAll(".project-shot img"),
  );

  const warmProjectImage = (image) => {
    if (image.dataset.warmed === "true") {
      return;
    }

    image.dataset.warmed = "true";

    image.loading = "eager";

    if (typeof image.decode === "function") {
      image.decode().catch(() => {});
    }
  };

  if (projectImages.length && "IntersectionObserver" in window) {
    const projectImageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          warmProjectImage(entry.target);

          observer.unobserve(entry.target);
        });
      },

      {
        threshold: 0.01,

        rootMargin: "120% 0px",
      },
    );

    projectImages.forEach((image) => {
      projectImageObserver.observe(image);
    });
  } else {
    projectImages.forEach(warmProjectImage);
  }

  const revealAllImmediately = () => {
    document.querySelectorAll(revealSelector).forEach((el) => {
      el.classList.add("is-visible");
    });
  };

  if (reducedMotion) {
    revealAllImmediately();

    return;
  }

  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);

  if (!hasGSAP) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          obs.unobserve(entry.target);
        });
      },

      {
        threshold: 0.12,

        rootMargin: "0px 0px -6% 0px",
      },
    );

    document.querySelectorAll(revealSelector).forEach((el) => {
      observer.observe(el);
    });

    return;
  }
  root.classList.add("has-gsap");

  gsap.registerPlugin(ScrollTrigger);

  gsap.defaults({
    ease: "power3.out",
  });

  ScrollTrigger.config({
    limitCallbacks: true,

    ignoreMobileResize: true,
  });

  const waitForPreloader = root.classList.contains("is-preloading");

  const clearRevealProps = (targets) => {
    gsap.set(
      targets,

      {
        clearProps: "opacity,transform",
      },
    );
  };

  const componentOwnedReveal = (el) => {
    return Boolean(
      el.closest(".project") ||
      el.closest("[data-project-carousel]") ||
      el.matches(".about-stats .stat") ||
      el.matches(".capability") ||
      el.matches(".certification-card") ||
      el.matches(".education-card") ||
      el.matches(".contact-cta"),
    );
  };

  if (waitForPreloader) {
    gsap.set(".hero-topline", {
      opacity: 0,
      y: 18,
    });

    gsap.set(".hero-title .hero-line", {
      opacity: 0,

      yPercent: 115,

      rotate: 1.8,
    });

    gsap.set(".hero-intro", {
      opacity: 0,
      y: 26,
    });

    gsap.set(".hero-status", {
      opacity: 0,
      y: 20,
    });

    gsap.set(".hero-scroll", {
      opacity: 0,
    });
  }

  const heroTimeline = gsap.timeline({
    paused: waitForPreloader,

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

        onComplete: () => {
          clearRevealProps(
            ".hero-topline, .hero-title .hero-line, .hero-intro, .hero-status, .hero-scroll",
          );
        },
      },

      "-=0.55",
    );

  let heroTimelineStarted = !waitForPreloader;

  let heroStartSafetyTimer = null;

  const startHeroTimeline = () => {
    if (heroTimelineStarted) {
      return;
    }

    heroTimelineStarted = true;

    if (heroStartSafetyTimer !== null) {
      clearTimeout(heroStartSafetyTimer);

      heroStartSafetyTimer = null;
    }

    window.removeEventListener("rfm:preloader-complete", startHeroTimeline);

    heroTimeline.play(0);
  };

  if (waitForPreloader) {
    window.addEventListener("rfm:preloader-complete", startHeroTimeline, {
      once: true,
    });

    if (!root.classList.contains("is-preloading")) {
      requestAnimationFrame(startHeroTimeline);
    } else {
      heroStartSafetyTimer = window.setTimeout(startHeroTimeline, 6200);
    }
  }

  document.querySelectorAll(".reveal").forEach((el) => {
    if (el.closest(".hero") || componentOwnedReveal(el)) {
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

        onComplete: () => {
          clearRevealProps(el);
        },

        scrollTrigger: {
          trigger: el,

          start: "top 88%",

          once: true,
        },
      },
    );
  });

  document.querySelectorAll(".reveal-text").forEach((el) => {
    if (el.closest(".hero") || el.matches(".contact-heading")) {
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

        onComplete: () => {
          clearRevealProps(el);
        },

        scrollTrigger: {
          trigger: el,

          start: "top 90%",

          once: true,
        },
      },
    );
  });

  const aboutStats = gsap.utils.toArray(".about-stats .stat");

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

        onComplete: () => {
          clearRevealProps(aboutStats);
        },

        scrollTrigger: {
          trigger: ".about-stats",

          start: "top 86%",

          once: true,
        },
      },
    );
  }

  const projectsCarousel = document.querySelector("[data-project-carousel]");

  if (projectsCarousel) {
    const carouselViewport = projectsCarousel.querySelector(
      "[data-carousel-viewport]",
    );

    const carouselControls = projectsCarousel.querySelector(
      ".projects-carousel__controls",
    );

    const carouselHint = projectsCarousel.querySelector(
      ".projects-carousel__hint",
    );

    const animateActiveProject = (slide) => {
      if (!(slide instanceof HTMLElement)) {
        return;
      }

      const frame = slide.querySelector(".browser-frame");

      const details = [
        slide.querySelector(".project-meta"),

        slide.querySelector(".project-copy"),

        slide.querySelector(".project-footer"),
      ].filter(Boolean);

      const animationTargets = [frame, ...details].filter(Boolean);

      if (animationTargets.length) {
        gsap.killTweensOf(animationTargets);
      }

      if (frame) {
        gsap.fromTo(
          frame,

          {
            opacity: 0.7,
            scale: 0.975,
          },

          {
            opacity: 1,
            scale: 1,

            duration: 0.72,

            ease: "power3.out",

            overwrite: "auto",

            onComplete: () => {
              gsap.set(
                frame,

                {
                  clearProps: "opacity,transform",
                },
              );
            },
          },
        );
      }

      if (details.length) {
        gsap.fromTo(
          details,

          {
            opacity: 0,
            y: 18,
          },

          {
            opacity: 1,
            y: 0,

            duration: 0.68,

            stagger: 0.07,

            ease: "power3.out",

            overwrite: "auto",

            onComplete: () => {
              clearRevealProps(details);
            },
          },
        );
      }
    };

    const entranceTargets = [
      carouselViewport,
      carouselControls,
      carouselHint,
    ].filter(Boolean);

    const carouselTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: projectsCarousel,

        start: "top 82%",

        once: true,
      },
    });

    if (carouselViewport) {
      carouselTimeline.fromTo(
        carouselViewport,

        {
          opacity: 0,

          y: projectMobile ? 30 : 48,

          scale: projectMobile ? 0.985 : 0.97,
        },

        {
          opacity: 1,

          y: 0,

          scale: 1,

          duration: projectMobile ? 0.85 : 1.05,

          ease: "power4.out",
        },
      );
    }

    if (carouselControls) {
      carouselTimeline.fromTo(
        carouselControls,

        {
          opacity: 0,
          y: 16,
        },

        {
          opacity: 1,
          y: 0,

          duration: 0.65,

          ease: "power3.out",
        },

        "-=0.52",
      );
    }

    if (carouselHint) {
      carouselTimeline.fromTo(
        carouselHint,

        {
          opacity: 0,
        },

        {
          opacity: 1,

          duration: 0.5,
        },

        "-=0.34",
      );
    }

    carouselTimeline.call(() => {
      clearRevealProps(entranceTargets);
    });

    const handleProjectChange = (event) => {
      animateActiveProject(event.detail?.slide);
    };

    window.addEventListener("rfm:project-change", handleProjectChange);

    window.addEventListener(
      "pagehide",

      () => {
        window.removeEventListener("rfm:project-change", handleProjectChange);
      },

      {
        once: true,
      },
    );
  }

  const capabilityItems = gsap.utils.toArray(".capability");

  if (capabilityItems.length) {
    gsap.fromTo(
      capabilityItems,

      {
        opacity: 0,

        y: 24,
      },

      {
        opacity: 1,

        y: 0,

        duration: 0.85,

        stagger: 0.09,

        ease: "power3.out",

        onComplete: () => {
          clearRevealProps(capabilityItems);
        },

        scrollTrigger: {
          trigger: ".capabilities",

          start: "top 84%",

          once: true,
        },
      },
    );
  }

  const certificationCards = gsap.utils.toArray(".certification-card");

  if (certificationCards.length) {
    gsap.fromTo(
      certificationCards,

      {
        opacity: 0,

        y: projectMobile ? 20 : 30,
      },

      {
        opacity: 1,
        y: 0,

        duration: projectMobile ? 0.72 : 0.9,

        stagger: projectMobile ? 0.07 : 0.11,

        ease: "power3.out",

        onComplete: () => {
          clearRevealProps(certificationCards);
        },

        scrollTrigger: {
          trigger: ".certifications-grid",

          start: projectMobile ? "top 90%" : "top 84%",

          once: true,
        },
      },
    );
  }

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

        onComplete: () => {
          clearRevealProps(educationCard);
        },

        scrollTrigger: {
          trigger: educationCard,

          start: "top 86%",

          once: true,
        },
      },
    );
  }

  const contact = document.querySelector(".contact");

  const contactHeading = document.querySelector(".contact-heading");

  const contactCta = document.querySelector(".contact-cta");

  if (contact && (contactHeading || contactCta)) {
    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: contact,

        start: "top 72%",

        once: true,
      },
    });

    if (contactHeading) {
      contactTimeline.fromTo(
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

          onComplete: () => {
            clearRevealProps(contactHeading);
          },
        },
      );
    }

    if (contactCta) {
      contactTimeline.fromTo(
        contactCta,

        {
          opacity: 0,
        },

        {
          opacity: 1,

          duration: 0.9,

          ease: "power3.out",

          onComplete: () => {
            gsap.set(
              contactCta,

              {
                clearProps: "opacity",
              },
            );
          },
        },

        contactHeading ? "-=0.62" : 0,
      );
    }
  }

  const transitionSections = gsap.utils.toArray(
    ".about, .projects, .skills, .certifications, .education, .contact",
  );

  transitionSections.forEach((section, index) => {
    if (section.querySelector(".section-bridge")) {
      return;
    }

    const bridge = document.createElement("div");

    const line = document.createElement("span");

    const glow = document.createElement("span");

    const point = document.createElement("span");

    bridge.className = "section-bridge";

    line.className = "section-bridge-line";

    glow.className = "section-bridge-glow";

    point.className = "section-bridge-point";

    bridge.setAttribute("aria-hidden", "true");

    bridge.style.setProperty(
      "--bridge-origin",

      index % 2 === 0 ? "38%" : "62%",
    );

    line.style.willChange = "auto";

    glow.style.willChange = "auto";

    point.style.willChange = "auto";

    bridge.append(line, glow, point);

    section.prepend(bridge);

    const bridgeTimeline = gsap.timeline({
      paused: true,

      onStart: () => {
        line.style.willChange = "transform, opacity";

        glow.style.willChange = "transform, opacity";

        point.style.willChange = "transform, opacity";
      },

      onComplete: () => {
        line.style.willChange = "auto";

        glow.style.willChange = "auto";

        point.style.willChange = "auto";
      },
    });

    bridgeTimeline

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

          ease: "power2.out",
        },

        0,
      )

      .to(
        line,

        {
          opacity: projectMobile ? 0.24 : 0.34,

          duration: 0.42,

          ease: "power1.out",
        },

        0.58,
      )

      .fromTo(
        glow,

        {
          opacity: 0,

          y: -18,
        },

        {
          opacity: projectMobile ? 0.32 : 0.52,

          y: 0,

          duration: 0.48,

          ease: "power2.out",
        },

        0,
      )

      .to(
        glow,

        {
          opacity: 0,

          y: projectMobile ? 14 : 24,

          duration: 0.52,

          ease: "power1.out",
        },

        0.48,
      )

      .fromTo(
        point,

        {
          opacity: 0,

          scale: 0,
        },

        {
          opacity: projectMobile ? 0.5 : 0.8,

          scale: 1,

          duration: 0.32,

          ease: "power2.out",
        },

        0.18,
      )

      .to(
        point,

        {
          opacity: 0,

          scale: 0.55,

          duration: 0.4,

          ease: "power1.out",
        },

        0.5,
      );

    ScrollTrigger.create({
      trigger: section,

      start: "top 92%",

      once: true,

      onEnter: () => {
        bridgeTimeline.play(0);
      },
    });
  });

  const navLinks = document.querySelectorAll(
    '.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]',
  );

  const navSections = ["about", "projects", "skills", "education", "contact"];

  navSections.forEach((id) => {
    const section = document.getElementById(id);

    if (!section) {
      return;
    }

    ScrollTrigger.create({
      trigger: section,

      start: "top 45%",

      end: "bottom 45%",

      onToggle: (self) => {
        if (!self.isActive) {
          return;
        }

        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${id}`;

          link.classList.toggle("is-active", active);
        });
      },
    });
  });

  window.addEventListener(
    "load",

    () => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    },

    {
      once: true,
    },
  );
})();
