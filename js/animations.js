(() => {
  const root =
    document.documentElement;

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const revealSelector =
    ".reveal, .reveal-text";


  /* =========================================================
     REDUCED MOTION
     ========================================================= */

  const revealAllImmediately =
    () => {

      document
        .querySelectorAll(
          revealSelector
        )
        .forEach((el) => {
          el.classList.add(
            "is-visible"
          );
        });

    };


  if (reducedMotion) {
    revealAllImmediately();

    return;
  }


  /* =========================================================
     GSAP CHECK
     ========================================================= */

  const hasGSAP =
    Boolean(
      window.gsap &&
      window.ScrollTrigger
    );


  /* =========================================================
     FALLBACK TANPA GSAP
     ========================================================= */

  if (!hasGSAP) {

    const observer =
      new IntersectionObserver(

        (entries, obs) => {

          entries.forEach(
            (entry) => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target
                .classList
                .add(
                  "is-visible"
                );

              obs.unobserve(
                entry.target
              );

            }
          );

        },

        {
          threshold: 0.12,

          rootMargin:
            "0px 0px -6% 0px",
        }

      );


    document
      .querySelectorAll(
        revealSelector
      )
      .forEach((el) => {
        observer.observe(el);
      });


    return;
  }


  /* =========================================================
     GSAP MODE
     ========================================================= */

  root.classList.add(
    "has-gsap"
  );


  gsap.registerPlugin(
    ScrollTrigger
  );


  gsap.defaults({
    ease:
      "power3.out",
  });


  ScrollTrigger.config({
    limitCallbacks:
      true,

    ignoreMobileResize:
      true,
  });


  /* =========================================================
     HELPERS
     ========================================================= */

  const projectMobile =
    window.matchMedia(
      "(max-width: 700px)"
    ).matches;


  const clearRevealProps =
    (targets) => {

      gsap.set(
        targets,

        {
          clearProps:
            "opacity,transform",
        }
      );

    };


  const componentOwnedReveal =
    (el) => {

      return Boolean(

        el.closest(
          ".project"
        ) ||

        el.matches(
          ".about-stats .stat"
        ) ||

        el.matches(
          ".capability"
        ) ||

        el.matches(
          ".education-card"
        ) ||

        el.matches(
          ".contact-cta"
        )

      );

    };


  /* =========================================================
     HERO
     ========================================================= */

  const heroTimeline =
    gsap.timeline({

      defaults: {
        ease:
          "power4.out",
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

        duration:
          0.85,
      }

    )


    .fromTo(

      ".hero-title .hero-line",

      {
        opacity: 0,

        yPercent:
          115,

        rotate:
          1.8,
      },

      {
        opacity: 1,

        yPercent:
          0,

        rotate:
          0,

        duration:
          1.12,

        stagger:
          0.11,

        ease:
          "power4.out",
      },

      "-=0.50"

    )


    .fromTo(

      ".hero-intro",

      {
        opacity:
          0,

        y:
          26,
      },

      {
        opacity:
          1,

        y:
          0,

        duration:
          0.9,
      },

      "-=0.55"

    )


    .fromTo(

      ".hero-status",

      {
        opacity:
          0,

        y:
          20,
      },

      {
        opacity:
          1,

        y:
          0,

        duration:
          0.85,
      },

      "-=0.75"

    )


    .fromTo(

      ".hero-scroll",

      {
        opacity:
          0,
      },

      {
        opacity:
          1,

        duration:
          0.8,

        onComplete:
          () => {

            clearRevealProps(
              ".hero-topline, .hero-title .hero-line, .hero-intro, .hero-status, .hero-scroll"
            );

          },
      },

      "-=0.55"

    );


  /* =========================================================
     GLOBAL REVEAL
     ========================================================= */

  document
    .querySelectorAll(
      ".reveal"
    )
    .forEach((el) => {

      if (
        el.closest(".hero") ||
        componentOwnedReveal(el)
      ) {
        return;
      }


      gsap.fromTo(

        el,

        {
          opacity:
            0,

          y:
            32,
        },

        {
          opacity:
            1,

          y:
            0,

          duration:
            0.95,

          ease:
            "power3.out",

          onComplete:
            () => {
              clearRevealProps(
                el
              );
            },

          scrollTrigger: {
            trigger:
              el,

            start:
              "top 88%",

            once:
              true,
          },
        }

      );

    });


  /* =========================================================
     LARGE TEXT REVEAL
     ========================================================= */

  document
    .querySelectorAll(
      ".reveal-text"
    )
    .forEach((el) => {

      if (
        el.closest(".hero") ||
        el.matches(
          ".contact-heading"
        )
      ) {
        return;
      }


      gsap.fromTo(

        el,

        {
          opacity:
            0,

          y:
            52,
        },

        {
          opacity:
            1,

          y:
            0,

          duration:
            1.05,

          ease:
            "power4.out",

          onComplete:
            () => {
              clearRevealProps(
                el
              );
            },

          scrollTrigger: {
            trigger:
              el,

            start:
              "top 90%",

            once:
              true,
          },
        }

      );

    });


  /* =========================================================
     ABOUT STATS
     3 ITEMS — 1 TRIGGER
     ========================================================= */

  const aboutStats =
    gsap.utils.toArray(
      ".about-stats .stat"
    );


  if (
    aboutStats.length
  ) {

    gsap.fromTo(

      aboutStats,

      {
        opacity:
          0,

        y:
          28,
      },

      {
        opacity:
          1,

        y:
          0,

        duration:
          0.8,

        stagger:
          0.12,

        ease:
          "power3.out",

        onComplete:
          () => {

            clearRevealProps(
              aboutStats
            );

          },

        scrollTrigger: {
          trigger:
            ".about-stats",

          start:
            "top 86%",

          once:
            true,
        },
      }

    );

  }


  /* =========================================================
     PROJECTS
     ========================================================= */

  const projectItems =
    gsap.utils.toArray(
      ".project"
    );


  const setProjectFocus =
    (activeProject) => {

      projectItems.forEach(
        (item) => {

          item.classList.toggle(
            "is-focus",

            item ===
              activeProject
          );

        }
      );

    };


  const clearProjectFocus =
    (project) => {

      project.classList.remove(
        "is-focus"
      );

    };


  projectItems.forEach(
    (project) => {

      const meta =
        project.querySelector(
          ".project-meta"
        );

      const copy =
        project.querySelector(
          ".project-copy"
        );

      const visual =
        project.querySelector(
          ".project-visual"
        );

      const image =
        project.querySelector(
          ".project-shot img"
        );

      const overlay =
        project.querySelector(
          ".project-shot-overlay"
        );

      const footer =
        project.querySelector(
          ".project-footer"
        );


      const entranceTargets = [
        meta,
        copy,
        footer,
      ].filter(Boolean);


      /* =======================================================
         PROJECT ENTRANCE
         ======================================================= */

      const projectTimeline =
        gsap.timeline({

          scrollTrigger: {
            trigger:
              project,

            start:
              "top 82%",

            once:
              true,
          },

        });


      if (meta) {

        projectTimeline.fromTo(

          meta,

          {
            opacity:
              0,

            y:
              18,
          },

          {
            opacity:
              1,

            y:
              0,

            duration:
              0.75,

            ease:
              "power3.out",
          }

        );

      }


      if (copy) {

        projectTimeline.fromTo(

          copy,

          {
            opacity:
              0,

            y:
              42,
          },

          {
            opacity:
              1,

            y:
              0,

            duration:
              1,

            ease:
              "power3.out",
          },

          "-=0.42"

        );

      }


      if (visual) {

        projectTimeline.fromTo(

          visual,

          {
            opacity:
              0,
          },

          {
            opacity:
              1,

            duration:
              1.15,

            ease:
              "power4.out",
          },

          "-=0.58"

        );

      }


      if (footer) {

        projectTimeline.fromTo(

          footer,

          {
            opacity:
              0,

            y:
              16,
          },

          {
            opacity:
              1,

            y:
              0,

            duration:
              0.75,

            ease:
              "power3.out",
          },

          "-=0.52"

        );

      }


      projectTimeline.call(
        () => {

          if (
            entranceTargets.length
          ) {
            clearRevealProps(
              entranceTargets
            );
          }


          if (visual) {

            gsap.set(
              visual,

              {
                clearProps:
                  "opacity",
              }
            );

          }

        }
      );


      /* =======================================================
         PROJECT DEPTH
         SATU ScrollTrigger menangani:
         - visual parallax
         - image pan
         - overlay depth
         ======================================================= */

      if (
        visual ||
        image ||
        overlay
      ) {

        const setVisualY =
          visual
            ? gsap.quickSetter(
                visual,
                "yPercent"
              )
            : null;


        const setOverlayY =
          overlay
            ? gsap.quickSetter(
                overlay,
                "y",
                "px"
              )
            : null;


        const visualStart =
          projectMobile
            ? 1.2
            : 3.2;


        const visualEnd =
          -visualStart;


        const overlayStart =
          projectMobile
            ? 5
            : 13;


        const overlayEnd =
          projectMobile
            ? -3
            : -9;


        ScrollTrigger.create({

          trigger:
            project,

          start:
            "top bottom",

          end:
            "bottom top",

          invalidateOnRefresh:
            true,


          onUpdate:
            (self) => {

              const progress =
                self.progress;


              if (
                setVisualY
              ) {

                setVisualY(

                  visualStart +

                  (
                    visualEnd -
                    visualStart
                  ) *

                  progress

                );

              }


              if (image) {

                image.style.objectPosition =
                  `50% ${
                    42 +
                    16 *
                    progress
                  }%`;

              }


              if (
                setOverlayY
              ) {

                setOverlayY(

                  overlayStart +

                  (
                    overlayEnd -
                    overlayStart
                  ) *

                  progress

                );

              }

            },

        });

      }


      /* =======================================================
         PROJECT FOCUS
         ======================================================= */

      ScrollTrigger.create({

        trigger:
          project,

        start:
          "top 58%",

        end:
          "bottom 42%",


        onEnter:
          () => {

            setProjectFocus(
              project
            );

          },


        onEnterBack:
          () => {

            setProjectFocus(
              project
            );

          },


        onLeave:
          () => {

            clearProjectFocus(
              project
            );

          },


        onLeaveBack:
          () => {

            clearProjectFocus(
              project
            );

          },

      });

    }
  );


  /* =========================================================
     CAPABILITIES
     5 ITEMS — 1 TRIGGER
     ========================================================= */

  const capabilityItems =
    gsap.utils.toArray(
      ".capability"
    );


  if (
    capabilityItems.length
  ) {

    gsap.fromTo(

      capabilityItems,

      {
        opacity:
          0,

        y:
          24,
      },

      {
        opacity:
          1,

        y:
          0,

        duration:
          0.85,

        stagger:
          0.09,

        ease:
          "power3.out",

        onComplete:
          () => {

            clearRevealProps(
              capabilityItems
            );

          },

        scrollTrigger: {

          trigger:
            ".capabilities",

          start:
            "top 84%",

          once:
            true,

        },
      }

    );

  }


  /* =========================================================
     EDUCATION
     ========================================================= */

  const educationCard =
    document.querySelector(
      ".education-card"
    );


  if (educationCard) {

    gsap.fromTo(

      educationCard,

      {
        opacity:
          0,

        y:
          34,
      },

      {
        opacity:
          1,

        y:
          0,

        duration:
          1,

        ease:
          "power3.out",

        onComplete:
          () => {

            clearRevealProps(
              educationCard
            );

          },

        scrollTrigger: {

          trigger:
            educationCard,

          start:
            "top 86%",

          once:
            true,

        },
      }

    );

  }


  /* =========================================================
     CONTACT
     1 ScrollTrigger
     ========================================================= */

  const contact =
    document.querySelector(
      ".contact"
    );


  const contactHeading =
    document.querySelector(
      ".contact-heading"
    );


  const contactCta =
    document.querySelector(
      ".contact-cta"
    );


  if (
    contact &&
    (
      contactHeading ||
      contactCta
    )
  ) {

    const contactTimeline =
      gsap.timeline({

        scrollTrigger: {

          trigger:
            contact,

          start:
            "top 72%",

          once:
            true,

        },

      });


    if (contactHeading) {

      contactTimeline.fromTo(

        contactHeading,

        {
          opacity:
            0,

          y:
            60,
        },

        {
          opacity:
            1,

          y:
            0,

          duration:
            1.15,

          ease:
            "power4.out",

          onComplete:
            () => {

              clearRevealProps(
                contactHeading
              );

            },
        }

      );

    }


    if (contactCta) {

      contactTimeline.fromTo(

        contactCta,

        {
          opacity:
            0,
        },

        {
          opacity:
            1,

          duration:
            0.9,

          ease:
            "power3.out",

          onComplete:
            () => {

              gsap.set(
                contactCta,

                {
                  clearProps:
                    "opacity",
                }
              );

            },
        },

        contactHeading
          ? "-=0.62"
          : 0

      );

    }

  }


  /* =========================================================
     C5 SECTION BRIDGE
     ONE-TIME — NO SCRUB
     ========================================================= */

  const transitionSections =
    gsap.utils.toArray(
      ".about, .projects, .skills, .education, .contact"
    );


  transitionSections.forEach(
    (section, index) => {

      if (
        section.querySelector(
          ".section-bridge"
        )
      ) {
        return;
      }


      const bridge =
        document.createElement(
          "div"
        );


      const line =
        document.createElement(
          "span"
        );


      const glow =
        document.createElement(
          "span"
        );


      const point =
        document.createElement(
          "span"
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
        "true"
      );


      bridge.style.setProperty(

        "--bridge-origin",

        index % 2 === 0
          ? "38%"
          : "62%"

      );


      /*
       * Tidak mengalokasikan compositor layer
       * sebelum animation diperlukan.
       */

      line.style.willChange =
        "auto";

      glow.style.willChange =
        "auto";

      point.style.willChange =
        "auto";


      bridge.append(
        line,
        glow,
        point
      );


      section.prepend(
        bridge
      );


      /* =====================================================
         BRIDGE TIMELINE
         ===================================================== */

      const bridgeTimeline =
        gsap.timeline({

          paused:
            true,


          onStart:
            () => {

              line.style.willChange =
                "transform, opacity";

              glow.style.willChange =
                "transform, opacity";

              point.style.willChange =
                "transform, opacity";

            },


          onComplete:
            () => {

              line.style.willChange =
                "auto";

              glow.style.willChange =
                "auto";

              point.style.willChange =
                "auto";

            },

        });


      bridgeTimeline

        .fromTo(

          line,

          {
            scaleX:
              0,

            opacity:
              0,
          },

          {
            scaleX:
              1,

            opacity:
              1,

            duration:
              0.58,

            ease:
              "power2.out",
          },

          0

        )


        .to(

          line,

          {
            opacity:
              projectMobile
                ? 0.24
                : 0.34,

            duration:
              0.42,

            ease:
              "power1.out",
          },

          0.58

        )


        .fromTo(

          glow,

          {
            opacity:
              0,

            y:
              -18,
          },

          {
            opacity:
              projectMobile
                ? 0.32
                : 0.52,

            y:
              0,

            duration:
              0.48,

            ease:
              "power2.out",
          },

          0

        )


        .to(

          glow,

          {
            opacity:
              0,

            y:
              projectMobile
                ? 14
                : 24,

            duration:
              0.52,

            ease:
              "power1.out",
          },

          0.48

        )


        .fromTo(

          point,

          {
            opacity:
              0,

            scale:
              0,
          },

          {
            opacity:
              projectMobile
                ? 0.5
                : 0.8,

            scale:
              1,

            duration:
              0.32,

            ease:
              "power2.out",
          },

          0.18

        )


        .to(

          point,

          {
            opacity:
              0,

            scale:
              0.55,

            duration:
              0.4,

            ease:
              "power1.out",
          },

          0.5

        );


      ScrollTrigger.create({

        trigger:
          section,

        start:
          "top 92%",

        once:
          true,


        onEnter:
          () => {

            bridgeTimeline.play(
              0
            );

          },

      });

    }
  );


  /* =========================================================
     ACTIVE NAVIGATION
     ========================================================= */

  const navLinks =
    document.querySelectorAll(

      '.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]'

    );


  const navSections = [

    "about",

    "projects",

    "skills",

    "education",

    "contact",

  ];


  navSections.forEach(
    (id) => {

      const section =
        document.getElementById(
          id
        );


      if (!section) {
        return;
      }


      ScrollTrigger.create({

        trigger:
          section,

        start:
          "top 45%",

        end:
          "bottom 45%",


        onToggle:
          (self) => {

            if (
              !self.isActive
            ) {
              return;
            }


            navLinks.forEach(
              (link) => {

                const active =

                  link.getAttribute(
                    "href"
                  ) ===

                  `#${id}`;


                link.classList.toggle(
                  "is-active",
                  active
                );

              }
            );

          },

      });

    }
  );


  /* =========================================================
     FINAL REFRESH
     ========================================================= */

  window.addEventListener(

    "load",

    () => {

      requestAnimationFrame(
        () => {

          ScrollTrigger.refresh();

        }
      );

    },

    {
      once: true,
    }

  );
})();