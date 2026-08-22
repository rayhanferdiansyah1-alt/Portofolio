(() => {
  const hero = document.querySelector(".hero");
  const host = document.querySelector(".hero-orbit");
  const main = document.querySelector("main");

  if (!hero || !host || !main) return;

  /* =========================================================
     DNA10 FINAL
     DEVICE / ACCESSIBILITY
     ========================================================= */

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const coarsePointer = window.matchMedia(
    "(pointer: coarse)"
  ).matches;

  const mobileAtLoad = window.matchMedia(
    "(max-width: 900px)"
  ).matches;

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const saveData = connection?.saveData === true;

  const lowPower =
    (navigator.deviceMemory || 8) <= 4 ||
    (navigator.hardwareConcurrency || 8) <= 4;

  /*
   * Data Saver sengaja memakai CSS fallback.
   * Reduced motion TIDAK lagi menghilangkan DNA.
   */
  if (saveData) return;

  /* =========================================================
     LOAD THREE.JS
     ========================================================= */

  import(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
  )
    .then(initScene)
    .catch((error) => {
      console.warn(
        "DNA scene gagal diinisialisasi. CSS fallback tetap digunakan.",
        error
      );
    });

  /* =========================================================
     INIT
     ========================================================= */

  function initScene(THREE) {
    const reducedQuality =
      reducedMotion ||
      mobileAtLoad ||
      coarsePointer ||
      lowPower;

    const quality = reducedQuality
      ? {
          tubeSegments: 76,
          radialSegments: 7,
          helixSamples: 64,
          rungCount: 14,

          pixelRatio: 1,

          fps:
            reducedMotion
              ? 20
              : 30,

          antialias: false,

          physicalMaterial: false,
          studioEnvironment: false,

          precision: "mediump",
        }
      : {
          tubeSegments: 132,
          radialSegments: 10,
          helixSamples: 110,
          rungCount: 20,

          /*
           * DNA10:
           * 1.40 -> 1.25.
           *
           * Sedikit lebih ringan,
           * hampir tidak terlihat bedanya.
           */
          pixelRatio: Math.min(
            window.devicePixelRatio || 1,
            1.25
          ),

          /*
           * DNA10:
           * 50 -> 45 FPS.
           */
          fps: 45,

          antialias: true,

          physicalMaterial: true,
          studioEnvironment: true,

          precision: "highp",
        };

    /* =========================================================
       SCENE / CAMERA
       ========================================================= */

    const scene =
      new THREE.Scene();

    const camera =
      new THREE.PerspectiveCamera(
        32,
        1,
        0.1,
        100
      );

    camera.position.set(
      0,
      0,
      7.25
    );

    /* =========================================================
       RENDERER
       ========================================================= */

    let renderer;

    try {
      renderer =
        new THREE.WebGLRenderer({
          alpha: true,

          antialias:
            quality.antialias,

          precision:
            quality.precision,

          powerPreference:
            reducedQuality
              ? "low-power"
              : "high-performance",

          stencil: false,

          preserveDrawingBuffer:
            false,
        });
    } catch (error) {
      console.warn(
        "WebGL tidak tersedia. CSS fallback tetap digunakan.",
        error
      );

      return;
    }

    renderer.setClearColor(
      0x000000,
      0
    );

    renderer.setPixelRatio(
      quality.pixelRatio
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
      reducedQuality
        ? 1.18
        : 1.24;

    /* =========================================================
       CANVAS
       ========================================================= */

    const canvas =
      renderer.domElement;

    canvas.setAttribute(
      "aria-hidden",
      "true"
    );

    Object.assign(
      canvas.style,
      {
        position: "absolute",

        inset: "0",

        width: "100%",
        height: "100%",

        display: "block",

        pointerEvents:
          "none",

        opacity: "0",

        transition:
          "opacity 1.2s cubic-bezier(.16,1,.3,1)",
      }
    );

    host.appendChild(
      canvas
    );

    /* =========================================================
       WORLD
       ========================================================= */

    const world =
      new THREE.Group();

    const dna =
      new THREE.Group();

    world.add(
      dna
    );

    scene.add(
      world
    );

    /* =========================================================
       DNA GEOMETRY
       ========================================================= */

    const HELIX_HEIGHT =
      3.75;

    const HELIX_RADIUS =
      0.68;

    const HELIX_TURNS =
      2.72;

    const helixPoint = (
      t,
      phase = 0
    ) => {
      const y =
        THREE.MathUtils.lerp(
          -HELIX_HEIGHT / 2,

          HELIX_HEIGHT / 2,

          t
        );

      const organicRadius =
        HELIX_RADIUS *
        (
          0.965 +

          Math.sin(
            t *
            Math.PI
          ) *
          0.065 +

          Math.sin(
            t *
            Math.PI *
            4.4 +
            0.3
          ) *
          0.018
        );

      const angle =
        t *
        Math.PI *
        2 *
        HELIX_TURNS +

        phase +

        Math.sin(
          t *
          Math.PI *
          2.2
        ) *
        0.07;

      return new THREE.Vector3(
        Math.cos(
          angle
        ) *
        organicRadius,

        y,

        Math.sin(
          angle
        ) *
        organicRadius
      );
    };

    const createHelixCurve = (
      phase
    ) => {
      const points =
        [];

      for (
        let i = 0;

        i <=
        quality.helixSamples;

        i += 1
      ) {
        points.push(
          helixPoint(
            i /
              quality.helixSamples,

            phase
          )
        );
      }

      const curve =
        new THREE.CatmullRomCurve3(
          points,

          false,

          "catmullrom",

          0.35
        );

      curve.tension =
        0.35;

      return curve;
    };

    const curveA =
      createHelixCurve(
        0
      );

    const curveB =
      createHelixCurve(
        Math.PI
      );

    /* =========================================================
       STUDIO ENVIRONMENT
       ========================================================= */

    let environmentTarget =
      null;

    const createStudioEnvironment =
      () => {
        if (
          !quality.studioEnvironment
        ) {
          return null;
        }

        /*
         * Kalau GPU tertentu gagal
         * membuat cube environment,
         * DNA tetap dirender.
         */
        try {
          const environmentScene =
            new THREE.Scene();

          environmentScene.background =
            new THREE.Color(
              0x050608
            );

          const cardGeometry =
            new THREE.PlaneGeometry(
              1,
              1
            );

          const cardMaterials =
            [];

          const addCard = ({
            color,
            position,
            scale,
            rotation,
          }) => {
            const material =
              new THREE.MeshBasicMaterial({
                color:
                  new THREE.Color(
                    color
                  ),

                side:
                  THREE.DoubleSide,
              });

            const card =
              new THREE.Mesh(
                cardGeometry,
                material
              );

            card.position.set(
              ...position
            );

            card.scale.set(
              ...scale
            );

            card.rotation.set(
              ...rotation
            );

            environmentScene.add(
              card
            );

            cardMaterials.push(
              material
            );
          };

          addCard({
            color:
              "#f7fcff",

            position:
              [3.4, 2.8, 2.2],

            scale:
              [3.7, 1, 1],

            rotation:
              [0.18, -0.72, -0.12],
          });

          addCard({
            color:
              "#84d7f5",

            position:
              [-3.2, 0.4, 1.7],

            scale:
              [1.1, 4.2, 1],

            rotation:
              [0.06, 0.92, 0.08],
          });

          addCard({
            color:
              "#345364",

            position:
              [1.2, -3.5, 1],

            scale:
              [2.8, 0.72, 1],

            rotation:
              [-0.48, -0.18, 0.04],
          });

          addCard({
            color:
              "#aebdc4",

            position:
              [-0.8, 2, -3.4],

            scale:
              [2.4, 2.4, 1],

            rotation:
              [0, Math.PI, 0],
          });

          environmentTarget =
            new THREE.WebGLCubeRenderTarget(
              128,
              {
                type:
                  THREE.HalfFloatType,

                generateMipmaps:
                  true,

                minFilter:
                  THREE.LinearMipmapLinearFilter,
              }
            );

          const cubeCamera =
            new THREE.CubeCamera(
              0.1,
              30,
              environmentTarget
            );

          cubeCamera.update(
            renderer,
            environmentScene
          );

          cardGeometry.dispose();

          cardMaterials.forEach(
            (material) =>
              material.dispose()
          );

          environmentScene.clear();

          return environmentTarget.texture;
        } catch (error) {
          console.warn(
            "Studio reflection tidak tersedia. DNA tetap dirender tanpa environment map.",
            error
          );

          environmentTarget
            ?.dispose();

          environmentTarget =
            null;

          return null;
        }
      };

    const studioEnvironment =
      createStudioEnvironment();

    /* =========================================================
       MATERIALS
       ========================================================= */

    const createStrandMaterial = ({
      color,
      roughness,
      envIntensity,
      sheen,
    }) => {
      if (
        quality.physicalMaterial
      ) {
        return new THREE.MeshPhysicalMaterial({
          color:
            new THREE.Color(
              color
            ),

          metalness:
            0.94,

          roughness,

          clearcoat:
            1,

          clearcoatRoughness:
            0.075,

          reflectivity:
            1,

          sheen,

          sheenRoughness:
            0.34,

          sheenColor:
            new THREE.Color(
              "#dff7ff"
            ),

          envMap:
            studioEnvironment,

          envMapIntensity:
            studioEnvironment
              ? envIntensity
              : 0,
        });
      }

      return new THREE.MeshStandardMaterial({
        color:
          new THREE.Color(
            color
          ),

        metalness:
          0.82,

        roughness:
          Math.min(
            roughness +
            0.07,

            0.34
          ),
      });
    };

    const strandMaterialA =
      createStrandMaterial({
        color:
          "#909aa1",

        roughness:
          0.165,

        envIntensity:
          1.28,

        sheen:
          0.24,
      });

    const strandMaterialB =
      createStrandMaterial({
        color:
          "#3f525e",

        roughness:
          0.205,

        envIntensity:
          1.12,

        sheen:
          0.16,
      });

    const rungMaterial =
      quality.physicalMaterial

        ? new THREE.MeshPhysicalMaterial({
            color:
              new THREE.Color(
                "#7bb9d0"
              ),

            emissive:
              new THREE.Color(
                "#123746"
              ),

            emissiveIntensity:
              0.42,

            metalness:
              0.7,

            roughness:
              0.24,

            clearcoat:
              1,

            clearcoatRoughness:
              0.12,

            envMap:
              studioEnvironment,

            envMapIntensity:
              studioEnvironment
                ? 0.9
                : 0,

            transparent:
              true,

            opacity:
              0.72,
          })

        : new THREE.MeshStandardMaterial({
            color:
              new THREE.Color(
                "#6fa9c0"
              ),

            emissive:
              new THREE.Color(
                "#102c37"
              ),

            emissiveIntensity:
              0.28,

            metalness:
              0.48,

            roughness:
              0.3,

            transparent:
              true,

            opacity:
              0.64,
          });

    /* =========================================================
       STRANDS
       ========================================================= */

    const strandGeometryA =
      new THREE.TubeGeometry(
        curveA,

        quality.tubeSegments,

        reducedQuality
          ? 0.052
          : 0.058,

        quality.radialSegments,

        false
      );

    const strandGeometryB =
      new THREE.TubeGeometry(
        curveB,

        quality.tubeSegments,

        reducedQuality
          ? 0.052
          : 0.058,

        quality.radialSegments,

        false
      );

    const strandA =
      new THREE.Mesh(
        strandGeometryA,
        strandMaterialA
      );

    const strandB =
      new THREE.Mesh(
        strandGeometryB,
        strandMaterialB
      );

    dna.add(
      strandA,
      strandB
    );

    /* =========================================================
       EDGE SHELL
       ========================================================= */

    let shellMaterialA =
      null;

    let shellMaterialB =
      null;

    if (!reducedQuality) {
      shellMaterialA =
        new THREE.MeshBasicMaterial({
          color:
            new THREE.Color(
              "#bfeeff"
            ),

          transparent:
            true,

          opacity:
            0.055,

          side:
            THREE.BackSide,

          blending:
            THREE.AdditiveBlending,

          depthWrite:
            false,
        });

      shellMaterialB =
        shellMaterialA.clone();

      shellMaterialB.opacity =
        0.038;

      const shellA =
        new THREE.Mesh(
          strandGeometryA,
          shellMaterialA
        );

      const shellB =
        new THREE.Mesh(
          strandGeometryB,
          shellMaterialB
        );

      shellA.scale.setScalar(
        1.055
      );

      shellB.scale.setScalar(
        1.05
      );

      dna.add(
        shellA,
        shellB
      );
    }

    /* =========================================================
       BASE PAIRS
       ========================================================= */

    const rungGeometry =
      new THREE.CylinderGeometry(
        reducedQuality
          ? 0.018
          : 0.021,

        reducedQuality
          ? 0.018
          : 0.021,

        1,

        reducedQuality
          ? 6
          : 8,

        1,

        false
      );

    const rungMesh =
      new THREE.InstancedMesh(
        rungGeometry,
        rungMaterial,
        quality.rungCount
      );

    rungMesh.instanceMatrix.setUsage(
      THREE.StaticDrawUsage
    );

    const dummy =
      new THREE.Object3D();

    const up =
      new THREE.Vector3(
        0,
        1,
        0
      );

    const direction =
      new THREE.Vector3();

    const midpoint =
      new THREE.Vector3();

    for (
      let i = 0;

      i <
      quality.rungCount;

      i += 1
    ) {
      const t =
        THREE.MathUtils.lerp(
          0.055,

          0.945,

          quality.rungCount === 1
            ? 0.5
            : i /
              (
                quality.rungCount -
                1
              )
        );

      const pointA =
        helixPoint(
          t,
          0
        );

      const pointB =
        helixPoint(
          t,
          Math.PI
        );

      direction.subVectors(
        pointB,
        pointA
      );

      const distance =
        direction.length();

      direction.normalize();

      midpoint
        .addVectors(
          pointA,
          pointB
        )
        .multiplyScalar(
          0.5
        );

      dummy.position.copy(
        midpoint
      );

      dummy.quaternion
        .setFromUnitVectors(
          up,
          direction
        );

      dummy.scale.set(
        1,
        distance * 0.9,
        1
      );

      dummy.updateMatrix();

      rungMesh.setMatrixAt(
        i,
        dummy.matrix
      );
    }

    rungMesh.instanceMatrix.needsUpdate =
      true;

    dna.add(
      rungMesh
    );

    /* =========================================================
       CAPS
       ========================================================= */

    const capGeometry =
      new THREE.SphereGeometry(
        reducedQuality
          ? 0.072
          : 0.078,

        reducedQuality
          ? 10
          : 16,

        reducedQuality
          ? 8
          : 12
      );

    [
      [0, 0, strandMaterialA],
      [1, 0, strandMaterialA],

      [
        0,
        Math.PI,
        strandMaterialB,
      ],

      [
        1,
        Math.PI,
        strandMaterialB,
      ],
    ].forEach(
      ([
        t,
        phase,
        material,
      ]) => {
        const cap =
          new THREE.Mesh(
            capGeometry,
            material
          );

        cap.position.copy(
          helixPoint(
            t,
            phase
          )
        );

        dna.add(
          cap
        );
      }
    );

    /* =========================================================
       HALO
       ========================================================= */

    let glowTexture =
      null;

    let glowMaterial =
      null;

    let glow =
      null;

    try {
      const glowCanvas =
        document.createElement(
          "canvas"
        );

      const glowSize =
        reducedQuality
          ? 128
          : 192;

      glowCanvas.width =
        glowSize;

      glowCanvas.height =
        glowSize;

      const glowContext =
        glowCanvas.getContext(
          "2d"
        );

      if (glowContext) {
        const center =
          glowSize / 2;

        const gradient =
          glowContext
            .createRadialGradient(
              center,
              center,
              0,

              center,
              center,
              center
            );

        gradient.addColorStop(
          0,
          "rgba(175, 236, 255, .17)"
        );

        gradient.addColorStop(
          0.28,
          "rgba(95, 190, 226, .072)"
        );

        gradient.addColorStop(
          0.62,
          "rgba(61, 129, 155, .025)"
        );

        gradient.addColorStop(
          1,
          "rgba(0, 0, 0, 0)"
        );

        glowContext.fillStyle =
          gradient;

        glowContext.fillRect(
          0,
          0,
          glowSize,
          glowSize
        );

        glowTexture =
          new THREE.CanvasTexture(
            glowCanvas
          );

        glowMaterial =
          new THREE.SpriteMaterial({
            map:
              glowTexture,

            transparent:
              true,

            opacity:
              reducedQuality
                ? 0.27
                : 0.38,

            depthWrite:
              false,

            blending:
              THREE.AdditiveBlending,
          });

        glow =
          new THREE.Sprite(
            glowMaterial
          );

        glow.scale.set(
          5.15,
          5.15,
          1
        );

        glow.position.set(
          0.16,
          0,
          -1.4
        );

        scene.add(
          glow
        );
      }
    } catch (error) {
      console.warn(
        "Halo DNA dilewati karena tidak tersedia.",
        error
      );
    }

    /* =========================================================
       LIGHTING
       ========================================================= */

    const ambient =
      new THREE.AmbientLight(
        0xc5d6dd,

        reducedQuality
          ? 0.5
          : 0.32
      );

    const keyLight =
      new THREE.PointLight(
        0xf9fdff,

        reducedQuality
          ? 18
          : 23,

        15,
        2
      );

    const cyanRim =
      new THREE.PointLight(
        0x7fdcff,

        reducedQuality
          ? 13
          : 19,

        14,
        2
      );

    const blueFill =
      new THREE.PointLight(
        0x315d71,

        reducedQuality
          ? 7
          : 9,

        12,
        2
      );

    keyLight.position.set(
      3.4,
      3.7,
      4.4
    );

    cyanRim.position.set(
      -3.7,
      0.35,
      2.15
    );

    blueFill.position.set(
      1,
      -3.7,
      2.3
    );

    scene.add(
      ambient,
      keyLight,
      cyanRim,
      blueFill
    );

    let rearLight =
      null;

    if (!reducedQuality) {
      rearLight =
        new THREE.PointLight(
          0xffffff,
          6,
          12,
          2
        );

      rearLight.position.set(
        -1.4,
        2.2,
        -4.1
      );

      scene.add(
        rearLight
      );
    }

    /* =========================================================
       GLOBAL DNA STAGE
       ========================================================= */

    const originalParent =
      host.parentNode;

    const originalNextSibling =
      host.nextSibling;

    const originalHostStyle =
      host.getAttribute(
        "style"
      );

    document.body.classList.add(
      "dna-experience"
    );

    host.classList.add(
      "dna-stage"
    );

    Object.assign(
      host.style,
      {
        position:
          "fixed",

        left:
          "50%",

        top:
          "50%",

        right:
          "auto",

        bottom:
          "auto",

        margin:
          "0",

        zIndex:
          "2",

        pointerEvents:
          "none",

        transform:
          "translate(-50%, -50%)",

        transformOrigin:
          "50% 50%",

        willChange:
          reducedMotion
            ? "auto"
            : "transform, opacity",
      }
    );

    document.body.appendChild(
      host
    );

    /* =========================================================
       DNA9 + DNA10
       RESPONSIVE STAGE
       ========================================================= */

    const getStageWidth =
      () => {
        const viewportWidth =
          window.innerWidth;

        if (
          viewportWidth <=
          430
        ) {
          return Math.min(
            430,

            viewportWidth *
            1.12
          );
        }

        if (
          viewportWidth <=
          700
        ) {
          return Math.min(
            520,

            viewportWidth *
            1.08
          );
        }

        if (
          viewportWidth <=
          900
        ) {
          return Math.min(
            640,

            viewportWidth *
            0.78
          );
        }

        return Math.min(
          viewportWidth *
          0.56,

          860
        );
      };

    /* =========================================================
       PAGE ELEMENTS
       ========================================================= */

    const aboutSection =
      document.querySelector(
        ".about"
      );

    const projectsSection =
      document.querySelector(
        ".projects"
      );

    const projectsIntro =
      document.querySelector(
        ".projects-intro"
      ) ||
      projectsSection;

    const projectCards =
      Array.from(
        document.querySelectorAll(
          ".projects .project"
        )
      );

    const skillsSection =
      document.querySelector(
        ".skills"
      );

    const educationSection =
      document.querySelector(
        ".education"
      );

    const contactSection =
      document.querySelector(
        ".contact"
      );

    /* =========================================================
       DESKTOP SCENES
       ========================================================= */

    const SCENE_DEFINITIONS = [
      {
        id:
          "hero",

        element:
          hero,

        anchorRatio:
          0.45,

        x:
          0.09,

        y:
          -0.02,

        scale:
          1,

        opacity:
          1,

        rotX:
          0.16,

        rotY:
          -0.38,

        rotZ:
          -0.08,
      },

      {
        id:
          "about-entry",

        element:
          aboutSection,

        anchorRatio:
          0.06,

        x:
          0.15,

        y:
          -0.025,

        scale:
          0.98,

        opacity:
          0.94,

        rotX:
          0.22,

        rotY:
          -0.02,

        rotZ:
          -0.2,
      },

      {
        id:
          "about-focus",

        element:
          aboutSection,

        anchorRatio:
          0.34,

        x:
          0.27,

        y:
          0.005,

        scale:
          0.94,

        opacity:
          0.88,

        rotX:
          0.34,

        rotY:
          0.4,

        rotZ:
          -0.62,
      },

      {
        id:
          "about-exit",

        element:
          aboutSection,

        anchorRatio:
          0.73,

        x:
          0.18,

        y:
          0.045,

        scale:
          0.85,

        /*
         * Dinaikkan.
         * Jangan sampai DNA terasa hilang.
         */
        opacity:
          0.72,

        rotX:
          0.28,

        rotY:
          0.72,

        rotZ:
          -0.36,
      },

      {
        id:
          "projects-intro",

        element:
          projectsIntro,

        anchorRatio:
          0.24,

        x:
          -0.05,

        y:
          0.015,

        scale:
          0.92,

        opacity:
          0.72,

        rotX:
          0.28,

        rotY:
          0.9,

        rotZ:
          0.2,
      },

      {
        id:
          "project-01",

        element:
          projectCards[0],

        anchorRatio:
          0.3,

        x:
          0.25,

        y:
          -0.025,

        scale:
          1.12,

        opacity:
          0.78,

        rotX:
          0.18,

        rotY:
          1.14,

        rotZ:
          -0.52,
      },

      {
        id:
          "project-02",

        element:
          projectCards[1],

        anchorRatio:
          0.3,

        x:
          -0.26,

        y:
          0.015,

        scale:
          1.18,

        opacity:
          0.74,

        rotX:
          0.42,

        rotY:
          1.64,

        rotZ:
          0.58,
      },

      {
        id:
          "project-03",

        element:
          projectCards[2],

        anchorRatio:
          0.3,

        x:
          0.27,

        y:
          0.02,

        scale:
          1.27,

        opacity:
          0.8,

        rotX:
          0.24,

        rotY:
          2.2,

        rotZ:
          -0.78,
      },

      {
        id:
          "project-04",

        element:
          projectCards[3],

        anchorRatio:
          0.31,

        x:
          -0.23,

        y:
          0.035,

        scale:
          1.16,

        opacity:
          0.74,

        rotX:
          0.48,

        rotY:
          2.74,

        rotZ:
          0.46,
      },

      {
        id:
          "skills-entry",

        element:
          skillsSection,

        anchorRatio:
          0.08,

        x:
          -0.08,

        y:
          0.02,

        scale:
          1.12,

        opacity:
          0.72,

        rotX:
          0.48,

        rotY:
          3.12,

        rotZ:
          0.64,
      },

      {
        id:
          "skills-focus",

        element:
          skillsSection,

        anchorRatio:
          0.4,

        x:
          0.015,

        y:
          0,

        scale:
          1.48,

        opacity:
          0.7,

        rotX:
          0.64,

        rotY:
          3.58,

        rotZ:
          1.08,
      },

      {
        id:
          "skills-exit",

        element:
          skillsSection,

        anchorRatio:
          0.78,

        x:
          0.13,

        y:
          0.035,

        scale:
          1.16,

        opacity:
          0.72,

        rotX:
          0.46,

        rotY:
          4.02,

        rotZ:
          0.58,
      },

      {
        id:
          "education-entry",

        element:
          educationSection,

        anchorRatio:
          0.08,

        x:
          0.18,

        y:
          -0.015,

        scale:
          1,

        opacity:
          0.74,

        rotX:
          0.36,

        rotY:
          4.22,

        rotZ:
          0.26,
      },

      {
        id:
          "education-focus",

        element:
          educationSection,

        anchorRatio:
          0.4,

        x:
          0.27,

        y:
          0.025,

        scale:
          0.82,

        opacity:
          0.78,

        rotX:
          0.24,

        rotY:
          4.55,

        rotZ:
          -0.34,
      },

      {
        id:
          "education-exit",

        element:
          educationSection,

        anchorRatio:
          0.76,

        x:
          0.17,

        y:
          0.045,

        scale:
          0.9,

        opacity:
          0.74,

        rotX:
          0.3,

        rotY:
          4.86,

        rotZ:
          -0.08,
      },

      {
        id:
          "contact-entry",

        element:
          contactSection,

        anchorRatio:
          0.08,

        x:
          0.18,

        y:
          0.02,

        scale:
          0.96,

        opacity:
          0.82,

        rotX:
          0.22,

        rotY:
          5.16,

        rotZ:
          -0.08,
      },

      {
        id:
          "contact-focus",

        element:
          contactSection,

        anchorRatio:
          0.38,

        x:
          0.25,

        y:
          -0.015,

        scale:
          1.16,

        opacity:
          0.92,

        rotX:
          0.12,

        rotY:
          5.62,

        rotZ:
          -0.48,
      },

      {
        id:
          "contact-final",

        element:
          contactSection,

        anchorRatio:
          0.76,

        x:
          0.09,

        y:
          0.025,

        scale:
          1.3,

        opacity:
          1,

        rotX:
          0.18,

        rotY:
          6.16,

        rotZ:
          0.14,
      },
    ].filter(
      (sceneItem) =>
        sceneItem.element
    );

    /* =========================================================
       TABLET OVERRIDES
       ========================================================= */

    const TABLET_SCENE_OVERRIDES = {
      hero: {
        x: 0.08,
        y: -0.02,
        scale: 0.95,
        opacity: 1,
      },

      "about-entry": {
        x: 0.12,
        y: 0,
        scale: 0.9,
        opacity: 0.9,
      },

      "about-focus": {
        x: 0.22,
        y: 0.01,
        scale: 0.86,
        opacity: 0.84,
      },

      "about-exit": {
        x: 0.14,
        y: 0.04,
        scale: 0.82,
        opacity: 0.74,
      },

      "projects-intro": {
        x: -0.03,
        y: 0.02,
        scale: 0.86,
        opacity: 0.72,
      },

      "project-01": {
        x: 0.2,
        y: -0.02,
        scale: 0.92,
        opacity: 0.76,
      },

      "project-02": {
        x: -0.2,
        y: 0.02,
        scale: 0.94,
        opacity: 0.74,
      },

      "project-03": {
        x: 0.21,
        y: 0.02,
        scale: 1,
        opacity: 0.78,
      },

      "project-04": {
        x: -0.18,
        y: 0.03,
        scale: 0.94,
        opacity: 0.74,
      },

      "skills-entry": {
        x: -0.05,
        y: 0.01,
        scale: 0.92,
        opacity: 0.72,
      },

      "skills-focus": {
        x: 0,
        y: 0,
        scale: 1.16,
        opacity: 0.68,
      },

      "skills-exit": {
        x: 0.08,
        y: 0.03,
        scale: 0.96,
        opacity: 0.72,
      },

      "education-entry": {
        x: 0.12,
        y: 0,
        scale: 0.88,
        opacity: 0.74,
      },

      "education-focus": {
        x: 0.2,
        y: 0.02,
        scale: 0.78,
        opacity: 0.76,
      },

      "education-exit": {
        x: 0.12,
        y: 0.04,
        scale: 0.82,
        opacity: 0.74,
      },

      "contact-entry": {
        x: 0.12,
        y: 0.01,
        scale: 0.86,
        opacity: 0.82,
      },

      "contact-focus": {
        x: 0.2,
        y: -0.01,
        scale: 0.98,
        opacity: 0.9,
      },

      "contact-final": {
        x: 0.07,
        y: 0.02,
        scale: 1.08,
        opacity: 0.96,
      },
    };

    /* =========================================================
       MOBILE OVERRIDES
       ========================================================= */

    const MOBILE_SCENE_OVERRIDES = {
      hero: {
        x: 0.12,
        y: -0.05,
        scale: 0.85,
        opacity: 0.96,
      },

      "about-entry": {
        x: 0.18,
        y: 0,
        scale: 0.78,
        opacity: 0.84,
      },

      "about-focus": {
        x: 0.26,
        y: 0.02,
        scale: 0.76,
        opacity: 0.8,
      },

      "about-exit": {
        x: 0.18,
        y: 0.05,
        scale: 0.72,
        opacity: 0.72,
      },

      "projects-intro": {
        x: -0.1,
        y: 0.02,
        scale: 0.74,
        opacity: 0.68,
      },

      "project-01": {
        x: 0.28,
        y: -0.02,
        scale: 0.8,
        opacity: 0.72,
      },

      "project-02": {
        x: -0.28,
        y: 0.02,
        scale: 0.8,
        opacity: 0.7,
      },

      "project-03": {
        x: 0.3,
        y: 0.02,
        scale: 0.86,
        opacity: 0.74,
      },

      "project-04": {
        x: -0.26,
        y: 0.03,
        scale: 0.8,
        opacity: 0.7,
      },

      "skills-entry": {
        x: -0.1,
        y: 0.02,
        scale: 0.8,
        opacity: 0.68,
      },

      "skills-focus": {
        x: 0.04,
        y: 0,
        scale: 0.98,
        opacity: 0.62,
      },

      "skills-exit": {
        x: 0.12,
        y: 0.04,
        scale: 0.82,
        opacity: 0.68,
      },

      "education-entry": {
        x: 0.18,
        y: 0,
        scale: 0.74,
        opacity: 0.7,
      },

      "education-focus": {
        x: 0.28,
        y: 0.03,
        scale: 0.68,
        opacity: 0.74,
      },

      "education-exit": {
        x: 0.18,
        y: 0.05,
        scale: 0.72,
        opacity: 0.7,
      },

      "contact-entry": {
        x: 0.18,
        y: 0.01,
        scale: 0.76,
        opacity: 0.78,
      },

      "contact-focus": {
        x: 0.28,
        y: -0.02,
        scale: 0.88,
        opacity: 0.86,
      },

      "contact-final": {
        x: 0.1,
        y: 0.03,
        scale: 0.96,
        opacity: 0.94,
      },
    };

    /* =========================================================
       SMALL MOBILE OVERRIDES
       ========================================================= */

    const SMALL_MOBILE_SCENE_OVERRIDES = {
      hero: {
        x: 0.16,
        y: -0.05,
        scale: 0.78,
        opacity: 0.92,
      },

      "about-entry": {
        x: 0.22,
        y: 0,
        scale: 0.7,
        opacity: 0.8,
      },

      "about-focus": {
        x: 0.3,
        y: 0.02,
        scale: 0.68,
        opacity: 0.76,
      },

      "about-exit": {
        x: 0.22,
        y: 0.05,
        scale: 0.66,
        opacity: 0.68,
      },

      "projects-intro": {
        x: -0.12,
        y: 0.02,
        scale: 0.66,
        opacity: 0.64,
      },

      "project-01": {
        x: 0.32,
        y: -0.02,
        scale: 0.72,
        opacity: 0.68,
      },

      "project-02": {
        x: -0.32,
        y: 0.02,
        scale: 0.72,
        opacity: 0.66,
      },

      "project-03": {
        x: 0.33,
        y: 0.02,
        scale: 0.76,
        opacity: 0.7,
      },

      "project-04": {
        x: -0.3,
        y: 0.03,
        scale: 0.72,
        opacity: 0.66,
      },

      "skills-entry": {
        x: -0.12,
        y: 0.02,
        scale: 0.7,
        opacity: 0.64,
      },

      "skills-focus": {
        x: 0.06,
        y: 0,
        scale: 0.88,
        opacity: 0.58,
      },

      "skills-exit": {
        x: 0.14,
        y: 0.04,
        scale: 0.72,
        opacity: 0.64,
      },

      "education-entry": {
        x: 0.2,
        y: 0,
        scale: 0.66,
        opacity: 0.66,
      },

      "education-focus": {
        x: 0.3,
        y: 0.03,
        scale: 0.62,
        opacity: 0.7,
      },

      "education-exit": {
        x: 0.2,
        y: 0.05,
        scale: 0.66,
        opacity: 0.66,
      },

      "contact-entry": {
        x: 0.2,
        y: 0.01,
        scale: 0.68,
        opacity: 0.74,
      },

      "contact-focus": {
        x: 0.3,
        y: -0.02,
        scale: 0.78,
        opacity: 0.82,
      },

      "contact-final": {
        x: 0.12,
        y: 0.03,
        scale: 0.88,
        opacity: 0.9,
      },
    };

    /* =========================================================
       RESPONSIVE RESOLVER
       ========================================================= */

    const resolveSceneDefinition =
      (sceneItem) => {
        const width =
          window.innerWidth;

        let overrides =
          null;

        if (
          width <=
          430
        ) {
          overrides =
            SMALL_MOBILE_SCENE_OVERRIDES;
        }

        else if (
          width <=
          700
        ) {
          overrides =
            MOBILE_SCENE_OVERRIDES;
        }

        else if (
          width <=
          900
        ) {
          overrides =
            TABLET_SCENE_OVERRIDES;
        }

        if (!overrides) {
          return sceneItem;
        }

        const override =
          overrides[
            sceneItem.id
          ];

        return override
          ? {
              ...sceneItem,
              ...override,
            }
          : sceneItem;
      };

    /* =========================================================
       SCENE STATE
       ========================================================= */

    const sceneMetrics =
      [];

    const firstScene =
      resolveSceneDefinition(
        SCENE_DEFINITIONS[0]
      );

    const currentScene = {
      x:
        firstScene?.x ??
        0.09,

      y:
        firstScene?.y ??
        -0.02,

      scale:
        firstScene?.scale ??
        1,

      opacity:
        firstScene?.opacity ??
        1,

      rotX:
        firstScene?.rotX ??
        0.16,

      rotY:
        firstScene?.rotY ??
        -0.38,

      rotZ:
        firstScene?.rotZ ??
        -0.08,
    };

    const targetScene = {
      ...currentScene,
    };

    let activeSceneId =
      "hero";

    let lastStageWidth =
      0;

    let scrollDirty =
      true;

    /* =========================================================
       MATH
       ========================================================= */

    const clamp01 =
      (value) =>
        Math.min(
          1,

          Math.max(
            0,
            value
          )
        );

    const smoothstep =
      (value) => {
        const t =
          clamp01(
            value
          );

        return (
          t *
          t *
          (
            3 -
            2 *
            t
          )
        );
      };

    const mix =
      (
        a,
        b,
        t
      ) =>
        a +
        (
          b -
          a
        ) *
        t;

    const damp =
      (
        current,
        target,
        speed,
        dt
      ) =>
        THREE.MathUtils.lerp(
          current,

          target,

          1 -
          Math.exp(
            -speed *
            dt
          )
        );

    /* =========================================================
       DNA10 CRITICAL FIX
       SECTION METRICS
       ========================================================= */

    /*
     * INI yang hilang di file kamu sebelumnya.
     *
     * Tanpa wrapper ini:
     * - viewportHeight undefined
     * - updateSceneMetrics undefined
     * - Three.js berhenti
     * - CSS fallback muncul
     */

    const updateSceneMetrics =
      () => {
        sceneMetrics.length =
          0;

        const viewportHeight =
          Math.max(
            window.innerHeight,
            1
          );

        SCENE_DEFINITIONS.forEach(
          (sceneItem) => {
            const resolvedScene =
              resolveSceneDefinition(
                sceneItem
              );

            const rect =
              resolvedScene
                .element
                .getBoundingClientRect();

            const top =
              rect.top +
              window.scrollY;

            const height =
              Math.max(
                rect.height,
                1
              );

            const anchorOffset =
              Math.min(
                height *
                resolvedScene.anchorRatio,

                viewportHeight *
                0.82
              );

            sceneMetrics.push({
              ...resolvedScene,

              anchor:
                top +
                anchorOffset,
            });
          }
        );

        scrollDirty =
          true;
      };

    /* =========================================================
       ACTIVE CSS STATES
       ========================================================= */

    const syncSceneStateClasses =
      (sceneId) => {
        host.dataset.dnaScene =
          sceneId;

        document.body.dataset.dnaScene =
          sceneId;

        /* ABOUT */

        const aboutActive =
          sceneId.startsWith(
            "about"
          );

        document.body.classList.toggle(
          "dna-about-active",
          aboutActive
        );

        document.body.classList.toggle(
          "dna-about-entry",

          sceneId ===
          "about-entry"
        );

        document.body.classList.toggle(
          "dna-about-focus",

          sceneId ===
          "about-focus"
        );

        document.body.classList.toggle(
          "dna-about-exit",

          sceneId ===
          "about-exit"
        );

        /* PROJECTS */

        const projectMatch =
          sceneId.match(
            /^project-(\d{2})$/
          );

        const activeProjectIndex =
          projectMatch
            ? Number(
                projectMatch[1]
              ) - 1
            : -1;

        const projectsActive =
          sceneId ===
            "projects-intro" ||

          activeProjectIndex >=
            0;

        projectsSection
          ?.classList.toggle(
            "dna-projects-active",
            projectsActive
          );

        projectCards.forEach(
          (
            project,
            index
          ) => {
            project.classList.toggle(
              "dna-project-active",

              index ===
              activeProjectIndex
            );
          }
        );
      };

    /* =========================================================
       TARGET SCENE
       ========================================================= */

    const updateTargetScene =
      () => {
        if (
          !sceneMetrics.length
        ) {
          return;
        }

        const viewportProbe =
          window.scrollY +
          window.innerHeight *
          0.5;

        let from =
          sceneMetrics[0];

        let to =
          sceneMetrics[0];

        let t =
          0;

        if (
          viewportProbe <=
          sceneMetrics[0].anchor
        ) {
          from =
            sceneMetrics[0];

          to =
            from;
        }

        else if (
          viewportProbe >=
          sceneMetrics[
            sceneMetrics.length -
            1
          ].anchor
        ) {
          from =
            sceneMetrics[
              sceneMetrics.length -
              1
            ];

          to =
            from;
        }

        else {
          for (
            let i = 0;

            i <
            sceneMetrics.length -
            1;

            i += 1
          ) {
            const a =
              sceneMetrics[i];

            const b =
              sceneMetrics[
                i + 1
              ];

            if (
              viewportProbe >=
                a.anchor &&

              viewportProbe <=
                b.anchor
            ) {
              from =
                a;

              to =
                b;

              const range =
                Math.max(
                  b.anchor -
                  a.anchor,

                  1
                );

              t =
                smoothstep(
                  (
                    viewportProbe -
                    a.anchor
                  ) /
                  range
                );

              break;
            }
          }
        }

        targetScene.x =
          mix(
            from.x,
            to.x,
            t
          );

        targetScene.y =
          mix(
            from.y,
            to.y,
            t
          );

        targetScene.scale =
          mix(
            from.scale,
            to.scale,
            t
          );

        /*
         * DNA10 safety:
         *
         * DNA tidak akan pernah
         * interpolasi di bawah 55%.
         */
        targetScene.opacity =
          Math.max(
            0.55,

            mix(
              from.opacity,
              to.opacity,
              t
            )
          );

        targetScene.rotX =
          mix(
            from.rotX,
            to.rotX,
            t
          );

        targetScene.rotY =
          mix(
            from.rotY,
            to.rotY,
            t
          );

        targetScene.rotZ =
          mix(
            from.rotZ,
            to.rotZ,
            t
          );

        activeSceneId =
          t <
          0.5
            ? from.id
            : to.id;

        syncSceneStateClasses(
          activeSceneId
        );

        scrollDirty =
          false;
      };

    /* =========================================================
       INITIAL 3D POSE
       ========================================================= */

    const baseWorldScale =
      reducedQuality
        ? 1.02
        : 1.16;

    world.scale.setScalar(
      baseWorldScale
    );

    world.position.set(
      -0.18,
      0,
      0
    );

    world.rotation.set(
      currentScene.rotX,
      currentScene.rotY,
      currentScene.rotZ
    );

    dna.rotation.y =
      0.24;

    /* =========================================================
       POINTER
       ========================================================= */

    const pointer = {
      x: 0,
      y: 0,
    };

    const onPointerMove =
      (event) => {
        pointer.x =
          (
            event.clientX /
            window.innerWidth
          ) *
          2 -
          1;

        pointer.y =
          (
            event.clientY /
            window.innerHeight
          ) *
          2 -
          1;
      };

    if (
      !coarsePointer &&
      !reducedMotion
    ) {
      window.addEventListener(
        "pointermove",
        onPointerMove,
        {
          passive:
            true,
        }
      );
    }

    /* =========================================================
       RESIZE
       ========================================================= */

    let lastWidth =
      0;

    let lastHeight =
      0;

    let resizeRaf =
      null;

    const resize =
      () => {
        resizeRaf =
          null;

        const stageWidth =
          getStageWidth();

        if (
          stageWidth !==
          lastStageWidth
        ) {
          lastStageWidth =
            stageWidth;

          host.style.width =
            `${stageWidth}px`;

          host.style.height =
            `${stageWidth}px`;
        }

        const rect =
          host.getBoundingClientRect();

        const width =
          Math.max(
            Math.round(
              rect.width
            ),
            1
          );

        const height =
          Math.max(
            Math.round(
              rect.height
            ),
            1
          );

        if (
          width !==
            lastWidth ||

          height !==
            lastHeight
        ) {
          lastWidth =
            width;

          lastHeight =
            height;

          renderer.setSize(
            width,
            height,
            false
          );

          camera.aspect =
            width /
            height;

          camera.updateProjectionMatrix();
        }

        /*
         * FIX penting.
         */
        updateSceneMetrics();

        updateTargetScene();

        renderer.render(
          scene,
          camera
        );
      };

    const scheduleResize =
      () => {
        if (
          resizeRaf !==
          null
        ) {
          return;
        }

        resizeRaf =
          requestAnimationFrame(
            resize
          );
      };

    let resizeObserver =
      null;

    if (
      "ResizeObserver" in window
    ) {
      resizeObserver =
        new ResizeObserver(
          scheduleResize
        );

      /*
       * Observe MAIN,
       * bukan documentElement.
       *
       * Jika image/font mengubah
       * tinggi halaman, anchor DNA
       * dihitung ulang.
       */
      resizeObserver.observe(
        main
      );
    }

    window.addEventListener(
      "resize",
      scheduleResize,
      {
        passive:
          true,
      }
    );

    /* =========================================================
       SCROLL
       ========================================================= */

    const onScroll =
      () => {
        scrollDirty =
          true;

        /*
         * Reduced motion:
         * update DNA tanpa continuous RAF.
         */
        if (reducedMotion) {
          requestAnimationFrame(
            () => {
              updateTargetScene();

              Object.assign(
                currentScene,
                targetScene
              );

              applySceneToObjects(
                performance.now(),
                0
              );

              renderer.render(
                scene,
                camera
              );
            }
          );
        }
      };

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive:
          true,
      }
    );

    /* =========================================================
       VISIBILITY
       ========================================================= */

    let mainVisible =
      true;

    let documentVisible =
      !document.hidden;

    let raf =
      null;

    let previousTime =
      performance.now();

    const frameDuration =
      1000 /
      quality.fps;

    const start =
      () => {
        if (
          reducedMotion ||
          raf !== null ||
          !mainVisible ||
          !documentVisible
        ) {
          return;
        }

        previousTime =
          performance.now();

        raf =
          requestAnimationFrame(
            animate
          );
      };

    const stop =
      () => {
        if (
          raf ===
          null
        ) {
          return;
        }

        cancelAnimationFrame(
          raf
        );

        raf =
          null;
      };

    const mainObserver =
      new IntersectionObserver(
        (entries) => {
          mainVisible =
            entries[0]
              ?.isIntersecting
              ?? true;

          mainVisible
            ? start()
            : stop();
        },

        {
          threshold:
            0.001,
        }
      );

    mainObserver.observe(
      main
    );

    const onVisibilityChange =
      () => {
        documentVisible =
          !document.hidden;

        documentVisible
          ? start()
          : stop();
      };

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange
    );

    /* =========================================================
       DNA10 DOM WRITE CACHE
       ========================================================= */

    let lastHostTransform =
      "";

    let lastHostOpacity =
      "";

    /* =========================================================
       APPLY SCENE
       ========================================================= */

    const applySceneToObjects =
      (
        timestamp,
        dt
      ) => {
        const stageX =
          currentScene.x *
          window.innerWidth;

        const stageY =
          currentScene.y *
          window.innerHeight;

        const nextHostTransform =
          `translate(-50%, -50%) ` +

          `translate3d(` +
          `${stageX.toFixed(2)}px, ` +
          `${stageY.toFixed(2)}px, ` +
          `0) ` +

          `scale(` +
          `${currentScene.scale.toFixed(4)}` +
          `)`;

        if (
          nextHostTransform !==
          lastHostTransform
        ) {
          host.style.transform =
            nextHostTransform;

          lastHostTransform =
            nextHostTransform;
        }

        /*
         * Safety kedua:
         * host sendiri minimal opacity 55%.
         */
        const nextHostOpacity =
          Math.max(
            0.55,

            currentScene.opacity
          ).toFixed(
            3
          );

        if (
          nextHostOpacity !==
          lastHostOpacity
        ) {
          host.style.opacity =
            nextHostOpacity;

          lastHostOpacity =
            nextHostOpacity;
        }

        const pointerX =
          coarsePointer ||
          reducedMotion
            ? 0
            : pointer.x *
              0.09;

        const pointerY =
          coarsePointer ||
          reducedMotion
            ? 0
            : pointer.y *
              0.045;

        /*
         * Reduced motion:
         * pose ada, idle motion mati.
         */
        if (reducedMotion) {
          world.rotation.set(
            currentScene.rotX,
            currentScene.rotY,
            currentScene.rotZ
          );

          world.position.y =
            0;

          return;
        }

        world.rotation.x =
          damp(
            world.rotation.x,

            currentScene.rotX +
            pointerY,

            5.2,

            dt
          );

        world.rotation.y =
          damp(
            world.rotation.y,

            currentScene.rotY +
            pointerX,

            5.2,

            dt
          );

        world.rotation.z =
          damp(
            world.rotation.z,

            currentScene.rotZ,

            5.2,

            dt
          );

        const time =
          timestamp *
          0.001;

        /* =====================================================
           DNA10 — FINAL IDLE MOTION
           ===================================================== */

        const idleSpeed =
          reducedQuality
            ? 0.00055
            : 0.00078;

        const delta60 =
          Math.min(
            dt *
            60,

            2
          );

        dna.rotation.y +=
          idleSpeed *
          delta60;

        dna.rotation.z =
          Math.sin(
            time *
            0.25
          ) *
          (
            reducedQuality
              ? 0.016
              : 0.02
          );

        world.position.y =
          Math.sin(
            time *
            0.36
          ) *
          (
            reducedQuality
              ? 0.026
              : 0.036
          );

        /* =====================================================
           LIGHT POINTER RESPONSE
           ===================================================== */

        if (!coarsePointer) {
          keyLight.position.x =
            3.4 +
            pointer.x *
            0.78;

          keyLight.position.y =
            3.7 -
            pointer.y *
            0.38;

          cyanRim.position.y =
            0.35 +
            pointer.y *
            0.22;
        }

        /* =====================================================
           DNA10 — SUBTLE LIGHT BREATHING
           ===================================================== */

        const lightBreath =
          1 +
          Math.sin(
            time *
            0.42
          ) *
          0.022;

        keyLight.intensity =
          (
            reducedQuality
              ? 18
              : 23
          ) *
          lightBreath;

        cyanRim.intensity =
          (
            reducedQuality
              ? 13
              : 19
          ) *
          (
            1 +
            Math.cos(
              time *
              0.38
            ) *
            0.032
          );

        /* =====================================================
           DNA10 — SUBTLE HALO
           ===================================================== */

        if (glow) {
          const glowScale =
            5.15 +
            Math.sin(
              time *
              0.34
            ) *
            0.045;

          glow.scale.set(
            glowScale,
            glowScale,
            1
          );
        }
      };

    /* =========================================================
       MAIN ANIMATION LOOP
       ========================================================= */

    function animate(
      timestamp
    ) {
      raf =
        null;

      if (
        !mainVisible ||
        !documentVisible
      ) {
        return;
      }

      const elapsed =
        timestamp -
        previousTime;

      if (
        elapsed <
        frameDuration
      ) {
        raf =
          requestAnimationFrame(
            animate
          );

        return;
      }

      const dt =
        Math.min(
          elapsed /
          1000,

          0.05
        );

      previousTime =
        timestamp;

      if (
        scrollDirty
      ) {
        updateTargetScene();
      }

      /* =====================================================
         SCENE DAMPING
         ===================================================== */

      currentScene.x =
        damp(
          currentScene.x,
          targetScene.x,
          5.8,
          dt
        );

      currentScene.y =
        damp(
          currentScene.y,
          targetScene.y,
          5.8,
          dt
        );

      currentScene.scale =
        damp(
          currentScene.scale,
          targetScene.scale,
          5.4,
          dt
        );

      currentScene.opacity =
        damp(
          currentScene.opacity,
          targetScene.opacity,
          6.2,
          dt
        );

      currentScene.rotX =
        damp(
          currentScene.rotX,
          targetScene.rotX,
          4.6,
          dt
        );

      currentScene.rotY =
        damp(
          currentScene.rotY,
          targetScene.rotY,
          4.6,
          dt
        );

      currentScene.rotZ =
        damp(
          currentScene.rotZ,
          targetScene.rotZ,
          4.6,
          dt
        );

      applySceneToObjects(
        timestamp,
        dt
      );

      renderer.render(
        scene,
        camera
      );

      raf =
        requestAnimationFrame(
          animate
        );
    }

    /* =========================================================
       FALLBACK
       ========================================================= */

    const fallback =
      host.querySelectorAll(
        ".hero-orbit-core, .hero-orbit-ring"
      );

    const hideFallback =
      () => {
        fallback.forEach(
          (element) => {
            element.style.transition =
              "opacity .8s ease";

            element.style.opacity =
              "0";
          }
        );
      };

    const showFallback =
      () => {
        fallback.forEach(
          (element) => {
            element.style.opacity =
              "";
          }
        );
      };

    /* =========================================================
       READY
       ========================================================= */

    /*
     * Metrics WAJIB siap sebelum
     * DNA fallback disembunyikan.
     */

    resize();

    /*
     * Tidak tunggu damping pada frame pertama.
     */
    Object.assign(
      currentScene,
      targetScene
    );

    applySceneToObjects(
      performance.now(),
      0
    );

    renderer.render(
      scene,
      camera
    );

    requestAnimationFrame(
      () => {
        hideFallback();

        /*
         * Pastikan host sendiri
         * tidak tersembunyi.
         */
        host.style.opacity =
          Math.max(
            0.55,
            currentScene.opacity
          ).toFixed(
            3
          );

        canvas.style.opacity =
          "1";

        if (!reducedMotion) {
          start();
        }
      }
    );

    /* =========================================================
       WEBGL CONTEXT LOSS
       ========================================================= */

    const onContextLost =
      (event) => {
        event.preventDefault();

        stop();

        canvas.style.opacity =
          "0";

        /*
         * PENTING:
         *
         * Fallback adalah anak host.
         * Jadi host TIDAK boleh opacity 0.
         */
        host.style.opacity =
          "1";

        showFallback();
      };

    canvas.addEventListener(
      "webglcontextlost",
      onContextLost,
      false
    );

    /* =========================================================
       CLEANUP
       ========================================================= */

    const cleanup =
      () => {
        stop();

        if (
          resizeRaf !==
          null
        ) {
          cancelAnimationFrame(
            resizeRaf
          );
        }

        resizeObserver
          ?.disconnect();

        mainObserver.disconnect();

        window.removeEventListener(
          "resize",
          scheduleResize
        );

        window.removeEventListener(
          "scroll",
          onScroll
        );

        window.removeEventListener(
          "pointermove",
          onPointerMove
        );

        document.removeEventListener(
          "visibilitychange",
          onVisibilityChange
        );

        canvas.removeEventListener(
          "webglcontextlost",
          onContextLost
        );

        strandGeometryA.dispose();
        strandGeometryB.dispose();

        rungGeometry.dispose();
        capGeometry.dispose();

        strandMaterialA.dispose();
        strandMaterialB.dispose();

        rungMaterial.dispose();

        shellMaterialA
          ?.dispose();

        shellMaterialB
          ?.dispose();

        glowTexture
          ?.dispose();

        glowMaterial
          ?.dispose();

        environmentTarget
          ?.dispose();

        renderer.dispose();

        renderer.forceContextLoss();

        if (
          canvas.parentNode ===
          host
        ) {
          host.removeChild(
            canvas
          );
        }

        /* BODY STATES */

        document.body.classList.remove(
          "dna-experience",
          "dna-about-active",
          "dna-about-entry",
          "dna-about-focus",
          "dna-about-exit"
        );

        delete document.body.dataset.dnaScene;

        /* HOST */

        host.classList.remove(
          "dna-stage"
        );

        host.removeAttribute(
          "data-dna-scene"
        );

        /* PROJECT STATE */

        projectCards.forEach(
          (project) => {
            project.classList.remove(
              "dna-project-active"
            );
          }
        );

        projectsSection
          ?.classList.remove(
            "dna-projects-active"
          );

        /* RESTORE STYLE */

        if (
          originalHostStyle ===
          null
        ) {
          host.removeAttribute(
            "style"
          );
        }

        else {
          host.setAttribute(
            "style",
            originalHostStyle
          );
        }

        /* RESTORE DOM POSITION */

        if (originalParent) {
          if (
            originalNextSibling &&

            originalNextSibling.parentNode ===
              originalParent
          ) {
            originalParent.insertBefore(
              host,
              originalNextSibling
            );
          }

          else {
            originalParent.appendChild(
              host
            );
          }
        }

        showFallback();
      };

    window.addEventListener(
      "pagehide",
      cleanup,
      {
        once: true,
      }
    );
  }
})();