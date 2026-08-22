(() => {
  const hero = document.querySelector(".hero");
  const host = document.querySelector(".hero-orbit");
  if (!hero || !host) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const coarsePointer =
    window.matchMedia("(pointer: coarse)").matches;

  const mobile =
    window.matchMedia("(max-width: 900px)").matches;

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const saveData =
    connection?.saveData === true;

  const lowPower =
    (navigator.deviceMemory || 8) <= 4 ||
    (navigator.hardwareConcurrency || 8) <= 4;

  if (reducedMotion || saveData) return;

  import(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
  )
    .then(initScene)
    .catch((error) =>
      console.warn(
        "Three.js gagal dimuat. CSS fallback tetap digunakan.",
        error,
      ),
    );

  function initScene(THREE) {
    const reducedQuality =
      mobile ||
      coarsePointer ||
      lowPower;

    const quality = reducedQuality
      ? {
          tubeSegments: 76,
          radialSegments: 7,
          helixSamples: 64,
          rungCount: 14,
          pixelRatio: 1,
          fps: 30,
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
          pixelRatio: Math.min(
            window.devicePixelRatio || 1,
            1.4,
          ),
          fps: 50,
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
        100,
      );

    camera.position.set(
      0,
      0,
      7.25,
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
        "WebGL tidak tersedia.",
        error,
      );

      return;
    }

    renderer.setClearColor(
      0x000000,
      0,
    );

    renderer.setPixelRatio(
      quality.pixelRatio,
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
      "true",
    );

    Object.assign(
      canvas.style,
      {
        position: "absolute",
        inset: "0",

        width: "100%",
        height: "100%",

        display: "block",

        pointerEvents: "none",

        opacity: "0",

        transition:
          "opacity 1.2s cubic-bezier(.16,1,.3,1)",
      },
    );

    host.appendChild(
      canvas,
    );

    /* =========================================================
       WORLD
       ========================================================= */

    const world =
      new THREE.Group();

    const dna =
      new THREE.Group();

    world.add(
      dna,
    );

    scene.add(
      world,
    );

    /* =========================================================
       DNA1 GEOMETRY — LOCKED
       ========================================================= */

    const HELIX_HEIGHT =
      3.75;

    const HELIX_RADIUS =
      0.68;

    const HELIX_TURNS =
      2.72;

    const helixPoint = (
      t,
      phase = 0,
    ) => {
      const y =
        THREE.MathUtils.lerp(
          -HELIX_HEIGHT / 2,
          HELIX_HEIGHT / 2,
          t,
        );

      const organicRadius =
        HELIX_RADIUS *
        (
          0.965 +

          Math.sin(
            t * Math.PI,
          ) *
          0.065 +

          Math.sin(
            t *
              Math.PI *
              4.4 +
              0.3,
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
            2.2,
        ) *
        0.07;

      return new THREE.Vector3(
        Math.cos(angle) *
          organicRadius,

        y,

        Math.sin(angle) *
          organicRadius,
      );
    };

    const createHelixCurve = (
      phase,
    ) => {
      const points =
        [];

      for (
        let i = 0;
        i <= quality.helixSamples;
        i++
      ) {
        points.push(
          helixPoint(
            i /
              quality.helixSamples,

            phase,
          ),
        );
      }

      const curve =
        new THREE.CatmullRomCurve3(
          points,
          false,
          "catmullrom",
          0.35,
        );

      curve.tension =
        0.35;

      return curve;
    };

    const curveA =
      createHelixCurve(
        0,
      );

    const curveB =
      createHelixCurve(
        Math.PI,
      );

    /* =========================================================
       DNA2 — PROCEDURAL STUDIO REFLECTION

       Desktop only.
       Dirender satu kali, bukan setiap frame.
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

        const environmentScene =
          new THREE.Scene();

        environmentScene.background =
          new THREE.Color(
            0x050608,
          );

        const cardGeometry =
          new THREE.PlaneGeometry(
            1,
            1,
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
                  color,
                ),

              side:
                THREE.DoubleSide,
            });

          const card =
            new THREE.Mesh(
              cardGeometry,
              material,
            );

          card.position.set(
            ...position,
          );

          card.scale.set(
            ...scale,
          );

          card.rotation.set(
            ...rotation,
          );

          environmentScene.add(
            card,
          );

          cardMaterials.push(
            material,
          );
        };

        /*
         * Main white reflection strip
         */
        addCard({
          color:
            "#f7fcff",

          position:
            [3.4, 2.8, 2.2],

          scale:
            [3.7, 1.0, 1],

          rotation:
            [0.18, -0.72, -0.12],
        });

        /*
         * Cyan vertical rim
         */
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

        /*
         * Dark blue floor card
         */
        addCard({
          color:
            "#345364",

          position:
            [1.2, -3.5, 1.0],

          scale:
            [2.8, 0.72, 1],

          rotation:
            [-0.48, -0.18, 0.04],
        });

        /*
         * Rear silver reflection
         */
        addCard({
          color:
            "#aebdc4",

          position:
            [-0.8, 2.0, -3.4],

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
            },
          );

        const cubeCamera =
          new THREE.CubeCamera(
            0.1,
            30,
            environmentTarget,
          );

        cubeCamera.update(
          renderer,
          environmentScene,
        );

        cardGeometry.dispose();

        cardMaterials.forEach(
          (material) =>
            material.dispose(),
        );

        environmentScene.clear();

        return environmentTarget.texture;
      };

    const studioEnvironment =
      createStudioEnvironment();

    /* =========================================================
       DNA2 — PREMIUM MATERIALS
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
              color,
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
              "#dff7ff",
            ),

          envMap:
            studioEnvironment,

          envMapIntensity:
            envIntensity,
        });
      }

      return new THREE.MeshStandardMaterial({
        color:
          new THREE.Color(
            color,
          ),

        metalness:
          0.82,

        roughness:
          Math.min(
            roughness +
              0.07,

            0.34,
          ),
      });
    };

    /*
     * Strand A:
     * polished silver chrome.
     */

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

    /*
     * Strand B:
     * darker blue / gunmetal.
     */

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

    /*
     * Base pairs:
     * translucent cyan metal.
     */

    const rungMaterial =
      quality.physicalMaterial

        ? new THREE.MeshPhysicalMaterial({
            color:
              new THREE.Color(
                "#7bb9d0",
              ),

            emissive:
              new THREE.Color(
                "#123746",
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
              0.9,

            transparent:
              true,

            opacity:
              0.72,
          })

        : new THREE.MeshStandardMaterial({
            color:
              new THREE.Color(
                "#6fa9c0",
              ),

            emissive:
              new THREE.Color(
                "#102c37",
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

        false,
      );

    const strandGeometryB =
      new THREE.TubeGeometry(
        curveB,

        quality.tubeSegments,

        reducedQuality
          ? 0.052
          : 0.058,

        quality.radialSegments,

        false,
      );

    const strandA =
      new THREE.Mesh(
        strandGeometryA,
        strandMaterialA,
      );

    const strandB =
      new THREE.Mesh(
        strandGeometryB,
        strandMaterialB,
      );

    dna.add(
      strandA,
      strandB,
    );

    /* =========================================================
       DNA2 — SUBTLE CYAN EDGE SHELL

       Desktop only.
       Bukan cartoon outline.
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
              "#bfeeff",
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
          shellMaterialA,
        );

      const shellB =
        new THREE.Mesh(
          strandGeometryB,
          shellMaterialB,
        );

      shellA.scale.setScalar(
        1.055,
      );

      shellB.scale.setScalar(
        1.05,
      );

      dna.add(
        shellA,
        shellB,
      );
    }

    /* =========================================================
       BASE PAIRS — INSTANCED
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

        false,
      );

    const rungMesh =
      new THREE.InstancedMesh(
        rungGeometry,
        rungMaterial,
        quality.rungCount,
      );

    rungMesh.instanceMatrix.setUsage(
      THREE.StaticDrawUsage,
    );

    const dummy =
      new THREE.Object3D();

    const up =
      new THREE.Vector3(
        0,
        1,
        0,
      );

    const direction =
      new THREE.Vector3();

    const midpoint =
      new THREE.Vector3();

    for (
      let i = 0;
      i < quality.rungCount;
      i++
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
              ),
        );

      const pointA =
        helixPoint(
          t,
          0,
        );

      const pointB =
        helixPoint(
          t,
          Math.PI,
        );

      direction.subVectors(
        pointB,
        pointA,
      );

      const distance =
        direction.length();

      direction.normalize();

      midpoint
        .addVectors(
          pointA,
          pointB,
        )
        .multiplyScalar(
          0.5,
        );

      dummy.position.copy(
        midpoint,
      );

      dummy.quaternion
        .setFromUnitVectors(
          up,
          direction,
        );

      dummy.scale.set(
        1,
        distance * 0.9,
        1,
      );

      dummy.updateMatrix();

      rungMesh.setMatrixAt(
        i,
        dummy.matrix,
      );
    }

    rungMesh.instanceMatrix.needsUpdate =
      true;

    dna.add(
      rungMesh,
    );

    /* =========================================================
       END CAPS
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
          : 12,
      );

    const caps = [
      [
        0,
        0,
        strandMaterialA,
      ],

      [
        1,
        0,
        strandMaterialA,
      ],

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
    ].map(
      ([
        t,
        phase,
        material,
      ]) => {
        const cap =
          new THREE.Mesh(
            capGeometry,
            material,
          );

        cap.position.copy(
          helixPoint(
            t,
            phase,
          ),
        );

        dna.add(
          cap,
        );

        return cap;
      },
    );

    /* =========================================================
       AMBIENT HALO
       ========================================================= */

    const glowCanvas =
      document.createElement(
        "canvas",
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
        "2d",
      );

    if (!glowContext) {
      renderer.dispose();

      return;
    }

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
          center,
        );

    gradient.addColorStop(
      0,
      "rgba(175, 236, 255, .17)",
    );

    gradient.addColorStop(
      0.28,
      "rgba(95, 190, 226, .072)",
    );

    gradient.addColorStop(
      0.62,
      "rgba(61, 129, 155, .025)",
    );

    gradient.addColorStop(
      1,
      "rgba(0, 0, 0, 0)",
    );

    glowContext.fillStyle =
      gradient;

    glowContext.fillRect(
      0,
      0,
      glowSize,
      glowSize,
    );

    const glowTexture =
      new THREE.CanvasTexture(
        glowCanvas,
      );

    const glowMaterial =
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

    const glow =
      new THREE.Sprite(
        glowMaterial,
      );

    glow.scale.set(
      5.15,
      5.15,
      1,
    );

    glow.position.set(
      0.16,
      0,
      -1.4,
    );

    scene.add(
      glow,
    );

    /* =========================================================
       DNA2 — CINEMATIC LIGHT RIG
       ========================================================= */

    const ambient =
      new THREE.AmbientLight(
        0xc5d6dd,

        reducedQuality
          ? 0.5
          : 0.32,
      );

    /*
     * Main studio white.
     */

    const keyLight =
      new THREE.PointLight(
        0xf9fdff,

        reducedQuality
          ? 18
          : 23,

        15,

        2,
      );

    /*
     * Ice-blue rim.
     */

    const cyanRim =
      new THREE.PointLight(
        0x7fdcff,

        reducedQuality
          ? 13
          : 19,

        14,

        2,
      );

    /*
     * Deep blue lower fill.
     */

    const blueFill =
      new THREE.PointLight(
        0x315d71,

        reducedQuality
          ? 7
          : 9,

        12,

        2,
      );

    keyLight.position.set(
      3.4,
      3.7,
      4.4,
    );

    cyanRim.position.set(
      -3.7,
      0.35,
      2.15,
    );

    blueFill.position.set(
      1.0,
      -3.7,
      2.3,
    );

    scene.add(
      ambient,
      keyLight,
      cyanRim,
      blueFill,
    );

    /*
     * Rear highlight desktop only.
     */

    let rearLight =
      null;

    if (!reducedQuality) {
      rearLight =
        new THREE.PointLight(
          0xffffff,
          6,
          12,
          2,
        );

      rearLight.position.set(
        -1.4,
        2.2,
        -4.1,
      );

      scene.add(
        rearLight,
      );
    }

    /* =========================================================
       INITIAL POSE
       ========================================================= */

    world.scale.setScalar(
      reducedQuality
        ? 1.02
        : 1.16,
    );

    world.position.set(
      -0.18,
      0,
      0,
    );

    world.rotation.set(
      0.16,
      -0.38,
      -0.08,
    );

    dna.rotation.y =
      0.24;

    /* =========================================================
       POINTER RESPONSE
       ========================================================= */

    const pointer = {
      x: 0,
      y: 0,
    };

    const targetRotation = {
      x:
        world.rotation.x,

      y:
        world.rotation.y,
    };

    const onPointerMove = (
      event,
    ) => {
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

      targetRotation.y =
        -0.38 +
        pointer.x *
          0.11;

      targetRotation.x =
        0.16 +
        pointer.y *
          0.055;
    };

    if (!coarsePointer) {
      window.addEventListener(
        "pointermove",
        onPointerMove,
        {
          passive: true,
        },
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

    const resize = () => {
      resizeRaf =
        null;

      const rect =
        host.getBoundingClientRect();

      const width =
        Math.max(
          Math.round(
            rect.width,
          ),
          1,
        );

      const height =
        Math.max(
          Math.round(
            rect.height,
          ),
          1,
        );

      if (
        width === lastWidth &&
        height === lastHeight
      ) {
        return;
      }

      lastWidth =
        width;

      lastHeight =
        height;

      renderer.setSize(
        width,
        height,
        false,
      );

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.render(
        scene,
        camera,
      );
    };

    const scheduleResize =
      () => {
        if (
          resizeRaf !== null
        ) {
          return;
        }

        resizeRaf =
          requestAnimationFrame(
            resize,
          );
      };

    let resizeObserver =
      null;

    if (
      "ResizeObserver" in window
    ) {
      resizeObserver =
        new ResizeObserver(
          scheduleResize,
        );

      resizeObserver.observe(
        host,
      );
    } else {
      window.addEventListener(
        "resize",
        scheduleResize,
        {
          passive: true,
        },
      );
    }

    resize();

    /* =========================================================
       VISIBILITY / RAF
       ========================================================= */

    let heroVisible =
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

    const start = () => {
      if (
        raf !== null ||
        !heroVisible ||
        !documentVisible
      ) {
        return;
      }

      previousTime =
        performance.now();

      raf =
        requestAnimationFrame(
          animate,
        );
    };

    const stop = () => {
      if (
        raf === null
      ) {
        return;
      }

      cancelAnimationFrame(
        raf,
      );

      raf =
        null;
    };

    const heroObserver =
      new IntersectionObserver(
        (entries) => {
          heroVisible =
            entries[0]
              ?.isIntersecting
              ?? true;

          heroVisible
            ? start()
            : stop();
        },

        {
          threshold:
            0.01,
        },
      );

    heroObserver.observe(
      hero,
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
      onVisibilityChange,
    );

    /* =========================================================
       DNA2 — IDLE MATERIAL / LIGHT MOTION
       ========================================================= */

    function animate(
      timestamp,
    ) {
      raf =
        null;

      if (
        !heroVisible ||
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
            animate,
          );

        return;
      }

      const delta =
        Math.min(
          elapsed /
            16.667,

          2,
        );

      const time =
        timestamp *
        0.001;

      previousTime =
        timestamp;

      /*
       * Mouse / pointer response.
       */

      world.rotation.x +=
        (
          targetRotation.x -
          world.rotation.x
        ) *
        0.024 *
        delta;

      world.rotation.y +=
        (
          targetRotation.y -
          world.rotation.y
        ) *
        0.024 *
        delta;

      /*
       * Slow DNA turn.
       */

      dna.rotation.y +=
        0.0009 *
        delta;

      dna.rotation.z =
        Math.sin(
          time *
          0.27,
        ) *
        0.022;

      /*
       * Tiny floating movement.
       */

      world.position.y =
        Math.sin(
          time *
          0.4,
        ) *
        0.04;

      /*
       * Interactive studio lights.
       */

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

      /*
       * Very subtle light breathing.
       */

      const lightBreath =
        1 +
        Math.sin(
          time *
          0.56,
        ) *
        0.035;

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
            0.48,
          ) *
          0.045
        );

      /*
       * Halo breathing.
       */

      const glowScale =
        5.15 +
        Math.sin(
          time *
          0.44,
        ) *
        0.07;

      glow.scale.set(
        glowScale,
        glowScale,
        1,
      );

      renderer.render(
        scene,
        camera,
      );

      raf =
        requestAnimationFrame(
          animate,
        );
    }

    /* =========================================================
       CSS FALLBACK
       ========================================================= */

    const fallback =
      host.querySelectorAll(
        ".hero-orbit-core, .hero-orbit-ring",
      );

    const hideFallback =
      () => {
        fallback.forEach(
          (element) => {
            element.style.transition =
              "opacity .8s ease";

            element.style.opacity =
              "0";
          },
        );
      };

    const showFallback =
      () => {
        fallback.forEach(
          (element) => {
            element.style.opacity =
              "";
          },
        );
      };

    renderer.render(
      scene,
      camera,
    );

    requestAnimationFrame(
      () => {
        hideFallback();

        canvas.style.opacity =
          "1";

        start();
      },
    );

    /* =========================================================
       CONTEXT LOSS
       ========================================================= */

    const onContextLost = (
      event,
    ) => {
      event.preventDefault();

      stop();

      canvas.style.opacity =
        "0";

      showFallback();
    };

    canvas.addEventListener(
      "webglcontextlost",
      onContextLost,
      false,
    );

    /* =========================================================
       CLEANUP
       ========================================================= */

    const cleanup =
      () => {
        stop();

        if (
          resizeRaf !== null
        ) {
          cancelAnimationFrame(
            resizeRaf,
          );
        }

        resizeObserver?.disconnect();

        heroObserver.disconnect();

        if (!resizeObserver) {
          window.removeEventListener(
            "resize",
            scheduleResize,
          );
        }

        window.removeEventListener(
          "pointermove",
          onPointerMove,
        );

        document.removeEventListener(
          "visibilitychange",
          onVisibilityChange,
        );

        canvas.removeEventListener(
          "webglcontextlost",
          onContextLost,
        );

        strandGeometryA.dispose();

        strandGeometryB.dispose();

        rungGeometry.dispose();

        capGeometry.dispose();

        strandMaterialA.dispose();

        strandMaterialB.dispose();

        rungMaterial.dispose();

        shellMaterialA?.dispose();

        shellMaterialB?.dispose();

        glowTexture.dispose();

        glowMaterial.dispose();

        environmentTarget?.dispose();

        renderer.dispose();

        renderer.forceContextLoss();

        if (
          canvas.parentNode ===
          host
        ) {
          host.removeChild(
            canvas,
          );
        }

        showFallback();
      };

    window.addEventListener(
      "pagehide",
      cleanup,
      {
        once: true,
      },
    );
  }
})();