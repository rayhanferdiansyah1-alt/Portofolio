(() => {
  const hero =
    document.querySelector(
      ".hero"
    );

  const host =
    document.querySelector(
      ".hero-orbit"
    );


  if (
    !hero ||
    !host
  ) {
    return;
  }


  /* =========================================================
     DEVICE PROFILE
     ========================================================= */

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  const coarsePointer =
    window.matchMedia(
      "(pointer: coarse)"
    ).matches;


  const mobile =
    window.matchMedia(
      "(max-width: 900px)"
    ).matches;


  const connection =

    navigator.connection ||

    navigator.mozConnection ||

    navigator.webkitConnection;


  const saveData =
    connection?.saveData ===
    true;


  const deviceMemory =
    navigator.deviceMemory ||
    8;


  const cpuThreads =
    navigator.hardwareConcurrency ||
    8;


  const lowPower =

    deviceMemory <= 4 ||

    cpuThreads <= 4;


  if (
    reducedMotion ||
    saveData
  ) {
    return;
  }


  /* =========================================================
     LOAD THREE.JS
     ========================================================= */

  import(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
  )

    .then(
      initScene
    )

    .catch(
      (error) => {

        console.warn(

          "Three.js gagal dimuat. CSS visual tetap digunakan.",

          error

        );

      }
    );


  /* =========================================================
     SCENE
     ========================================================= */

  function initScene(
    THREE
  ) {

    const reducedQuality =

      mobile ||

      coarsePointer ||

      lowPower;


    /* =======================================================
       QUALITY PROFILE
       ======================================================= */

    const quality =

      reducedQuality

        ? {

            segments:
              60,

            pathSegments:
              20,

            pixelRatio:
              1,

            fps:
              30,

            antialias:
              false,

            edgeDetail:
              false,

            physicalMaterial:
              false,

            precision:
              "mediump",

          }

        : {

            segments:
              108,

            pathSegments:
              34,

            pixelRatio:
              Math.min(
                window.devicePixelRatio ||
                1,

                1.4
              ),

            fps:
              50,

            antialias:
              true,

            edgeDetail:
              true,

            physicalMaterial:
              true,

            precision:
              "highp",

          };


    const scene =
      new THREE.Scene();


    const camera =
      new THREE.PerspectiveCamera(

        34,

        1,

        0.1,

        100

      );


    camera.position.set(
      0,
      0,
      6.7
    );


    /* =======================================================
       RENDERER
       ======================================================= */

    let renderer;


    try {

      renderer =
        new THREE.WebGLRenderer({

          alpha:
            true,

          antialias:
            quality.antialias,

          precision:
            quality.precision,

          powerPreference:
            reducedQuality
              ? "low-power"
              : "high-performance",

          stencil:
            false,

          preserveDrawingBuffer:
            false,

        });

    }

    catch (error) {

      console.warn(

        "WebGL tidak tersedia.",

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
      1.38;


    /* =======================================================
       CANVAS
       ======================================================= */

    const canvas =
      renderer.domElement;


    canvas.setAttribute(
      "aria-hidden",
      "true"
    );


    Object.assign(

      canvas.style,

      {

        position:
          "absolute",

        inset:
          "0",

        width:
          "100%",

        height:
          "100%",

        display:
          "block",

        pointerEvents:
          "none",

        opacity:
          "0",

        transition:
          "opacity 1.2s cubic-bezier(.16,1,.3,1)",

      }

    );


    host.appendChild(
      canvas
    );


    /* =======================================================
       WORLD
       ======================================================= */

    const world =
      new THREE.Group();


    scene.add(
      world
    );


    /* =======================================================
       CURVE
       ======================================================= */

    const curvePoints =
      [];


    for (
      let i = 0;

      i <=
      quality.pathSegments;

      i++
    ) {

      const t =

        i /

        quality.pathSegments;


      const y =
        THREE.MathUtils.lerp(

          -1.55,

          1.55,

          t

        );


      const x =

        Math.sin(
          t *
          Math.PI *
          1.65
        ) *
        0.52 +

        Math.sin(
          t *
          Math.PI *
          3.15 +
          0.45
        ) *
        0.14 +

        Math.cos(
          t *
          Math.PI *
          0.82
        ) *
        0.1;


      const z =

        Math.cos(
          t *
          Math.PI *
          1.35 +
          0.25
        ) *
        0.38 +

        Math.sin(
          t *
          Math.PI *
          2.35
        ) *
        0.11;


      curvePoints.push(

        new THREE.Vector3(
          x,
          y,
          z
        )

      );

    }


    const curve =
      new THREE.CatmullRomCurve3(
        curvePoints
      );


    curve.curveType =
      "catmullrom";


    curve.tension =
      0.42;


    /* =======================================================
       RIBBON GEOMETRY
       ======================================================= */

    function createRibbonGeometry(
      segments
    ) {

      const geometry =
        new THREE.BufferGeometry();


      const positions =
        [];


      const uvs =
        [];


      const indices =
        [];


      const frames =
        curve.computeFrenetFrames(

          segments,

          false

        );


      for (
        let i = 0;

        i <= segments;

        i++
      ) {

        const u =
          i / segments;


        const center =
          curve.getPointAt(
            u
          );


        const normal =
          frames
            .normals[i]
            .clone();


        const binormal =
          frames
            .binormals[i]
            .clone();


        const twist =

          u *
          Math.PI *
          3.35 +

          Math.sin(
            u *
            Math.PI *
            1.65
          ) *
          0.42 +

          Math.sin(
            u *
            Math.PI *
            3.2
          ) *
          0.1;


        const cos =
          Math.cos(
            twist
          );


        const sin =
          Math.sin(
            twist
          );


        const widthAxis =

          normal
            .clone()
            .multiplyScalar(
              cos
            )

            .add(

              binormal
                .clone()
                .multiplyScalar(
                  sin
                )

            )

            .normalize();


        const depthAxis =

          normal
            .clone()
            .multiplyScalar(
              -sin
            )

            .add(

              binormal
                .clone()
                .multiplyScalar(
                  cos
                )

            )

            .normalize();


        const taper =

          0.48 +

          Math.pow(

            Math.sin(
              Math.PI *
              u
            ),

            0.58

          ) *

          0.72;


        const asymmetry =

          1 +

          Math.sin(
            u *
            Math.PI *
            2.6 +
            0.55
          ) *

          0.13;


        const halfWidth =

          0.96 *

          taper *

          asymmetry *

          0.5;


        const halfDepth =

          0.085 *

          0.5;


        const corners = [

          [
            halfWidth,
            halfDepth,
          ],

          [
            -halfWidth,
            halfDepth,
          ],

          [
            -halfWidth,
            -halfDepth,
          ],

          [
            halfWidth,
            -halfDepth,
          ],

        ];


        corners.forEach(

          (
            [
              width,
              depth,
            ],

            index

          ) => {

            const point =

              center
                .clone()

                .add(

                  widthAxis
                    .clone()
                    .multiplyScalar(
                      width
                    )

                )

                .add(

                  depthAxis
                    .clone()
                    .multiplyScalar(
                      depth
                    )

                );


            positions.push(

              point.x,

              point.y,

              point.z

            );


            uvs.push(

              u,

              index / 3

            );

          }

        );

      }


      /* =====================================================
         CONNECT SEGMENTS
         ===================================================== */

      for (
        let i = 0;

        i < segments;

        i++
      ) {

        for (
          let side = 0;

          side < 4;

          side++
        ) {

          const nextSide =
            (
              side + 1
            ) %
            4;


          const a =
            i *
            4 +
            side;


          const b =
            i *
            4 +
            nextSide;


          const c =
            (
              i + 1
            ) *
            4 +
            nextSide;


          const d =
            (
              i + 1
            ) *
            4 +
            side;


          indices.push(

            a,
            b,
            c,

            a,
            c,
            d

          );

        }

      }


      /* =====================================================
         CAPS
         ===================================================== */

      indices.push(

        0,
        2,
        1,

        0,
        3,
        2

      );


      const end =
        segments *
        4;


      indices.push(

        end,

        end + 1,

        end + 2,

        end,

        end + 2,

        end + 3

      );


      geometry.setAttribute(

        "position",

        new THREE.Float32BufferAttribute(

          positions,

          3

        )

      );


      geometry.setAttribute(

        "uv",

        new THREE.Float32BufferAttribute(

          uvs,

          2

        )

      );


      geometry.setIndex(
        indices
      );


      geometry.computeVertexNormals();


      geometry.computeBoundingSphere();


      return geometry;

    }


    /* =======================================================
       RIBBON
       ======================================================= */

    const ribbonGeometry =
      createRibbonGeometry(
        quality.segments
      );


    const ribbonMaterial =

      quality.physicalMaterial

        ? new THREE.MeshPhysicalMaterial({

            color:
              new THREE.Color(
                "#8f9da6"
              ),

            metalness:
              0.82,

            roughness:
              0.22,

            clearcoat:
              1,

            clearcoatRoughness:
              0.11,

            reflectivity:
              0.88,

            sheen:
              0.22,

            sheenColor:
              new THREE.Color(
                "#d9f4ff"
              ),

            side:
              THREE.DoubleSide,

          })

        : new THREE.MeshStandardMaterial({

            color:
              new THREE.Color(
                "#8f9da6"
              ),

            metalness:
              0.82,

            roughness:
              0.24,

            side:
              THREE.DoubleSide,

          });


    const ribbon =
      new THREE.Mesh(

        ribbonGeometry,

        ribbonMaterial

      );


    world.add(
      ribbon
    );


    /* =======================================================
       EDGE DETAIL
       Desktop only
       ======================================================= */

    let edgeGeometry =
      null;


    let edgeMaterial =
      null;


    if (
      quality.edgeDetail
    ) {

      edgeGeometry =
        new THREE.EdgesGeometry(

          ribbonGeometry,

          28

        );


      edgeMaterial =
        new THREE.LineBasicMaterial({

          color:
            new THREE.Color(
              "#bcecff"
            ),

          transparent:
            true,

          opacity:
            0.075,

          depthWrite:
            false,

        });


      ribbon.add(

        new THREE.LineSegments(

          edgeGeometry,

          edgeMaterial

        )

      );

    }


    /* =======================================================
       HALO
       ======================================================= */

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


    if (!glowContext) {

      renderer.dispose();

      return;

    }


    const glowCenter =
      glowSize /
      2;


    const gradient =
      glowContext
        .createRadialGradient(

          glowCenter,

          glowCenter,

          0,

          glowCenter,

          glowCenter,

          glowCenter

        );


    gradient.addColorStop(

      0,

      "rgba(130, 215, 245, .16)"

    );


    gradient.addColorStop(

      0.35,

      "rgba(105, 190, 225, .07)"

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


    const glowTexture =
      new THREE.CanvasTexture(
        glowCanvas
      );


    const glowMaterial =
      new THREE.SpriteMaterial({

        map:
          glowTexture,

        transparent:
          true,

        opacity:
          reducedQuality
            ? 0.34
            : 0.48,

        depthWrite:
          false,

      });


    const glow =
      new THREE.Sprite(
        glowMaterial
      );


    glow.scale.set(
      5.2,
      5.2,
      1
    );


    glow.position.set(
      0.25,
      0,
      -1.3
    );


    scene.add(
      glow
    );


    /* =======================================================
       LIGHTING
       ======================================================= */

    const ambient =
      new THREE.AmbientLight(

        0xc8e4ef,

        reducedQuality
          ? 0.58
          : 0.48

      );


    const keyLight =
      new THREE.PointLight(

        0xf4fcff,

        reducedQuality
          ? 22
          : 26,

        15,

        2

      );


    const rimLight =
      new THREE.PointLight(

        0x8bdcff,

        reducedQuality
          ? 15
          : 19,

        14,

        2

      );


    keyLight.position.set(
      3.5,
      3.3,
      4
    );


    rimLight.position.set(
      -3.7,
      0.5,
      2
    );


    scene.add(

      ambient,

      keyLight,

      rimLight

    );


    /*
     * Dua lampu tambahan hanya desktop.
     */

    if (
      !reducedQuality
    ) {

      const lowerLight =
        new THREE.PointLight(

          0x3a7895,

          8,

          11,

          2

        );


      const rearLight =
        new THREE.PointLight(

          0xffffff,

          8,

          11,

          2

        );


      lowerLight.position.set(
        1,
        -4,
        2.5
      );


      rearLight.position.set(
        -1,
        2,
        -4
      );


      scene.add(

        lowerLight,

        rearLight

      );

    }


    /* =======================================================
       INITIAL POSE
       ======================================================= */

    world.rotation.set(

      0.035,

      -0.48,

      -0.085

    );


    world.scale.setScalar(

      reducedQuality
        ? 1.02
        : 1.22

    );


    world.position.x =
      -0.32;


    /* =======================================================
       POINTER
       ======================================================= */

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


    function onPointerMove(
      event
    ) {

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

        -0.48 +

        pointer.x *
        0.12;


      targetRotation.x =

        0.04 +

        pointer.y *
        0.065;

    }


    if (
      !coarsePointer
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


    /* =======================================================
       RESIZE
       ======================================================= */

    let lastWidth =
      0;


    let lastHeight =
      0;


    let resizeRaf =
      null;


    let heroTop =
      0;


    let heroHeight =
      1;


    function updateMetrics() {

      const rect =
        hero.getBoundingClientRect();


      heroTop =

        rect.top +

        window.scrollY;


      heroHeight =
        Math.max(

          rect.height,

          1

        );

    }


    function resize() {

      resizeRaf =
        null;


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


      updateMetrics();


      /*
       * Tidak menjalankan renderer.setSize
       * kalau ukuran tidak berubah.
       */

      if (

        width ===
          lastWidth &&

        height ===
          lastHeight

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

        false

      );


      camera.aspect =

        width /

        height;


      camera.updateProjectionMatrix();


      renderer.render(

        scene,

        camera

      );

    }


    function scheduleResize() {

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

    }


    const resizeObserver =
      new ResizeObserver(
        scheduleResize
      );


    resizeObserver.observe(
      host
    );


    resize();


    /* =======================================================
       SCROLL

       Tidak ada getBoundingClientRect()
       setiap scroll event.
       ======================================================= */

    let currentScrollY =
      window.scrollY;


    let scrollDirty =
      true;


    let scrollProgress =
      0;


    function onScroll() {

      currentScrollY =
        window.scrollY;


      scrollDirty =
        true;

    }


    window.addEventListener(

      "scroll",

      onScroll,

      {
        passive:
          true,
      }

    );


    /* =======================================================
       VISIBILITY
       ======================================================= */

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


    function start() {

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
          animate
        );

    }


    function stop() {

      if (
        raf === null
      ) {
        return;
      }


      cancelAnimationFrame(
        raf
      );


      raf =
        null;

    }


    const heroObserver =
      new IntersectionObserver(

        (entries) => {

          heroVisible =

            entries[0]
              ?.isIntersecting

            ?? true;


          if (
            heroVisible
          ) {
            start();
          }

          else {
            stop();
          }

        },

        {
          threshold:
            0.01,
        }

      );


    heroObserver.observe(
      hero
    );


    function onVisibilityChange() {

      documentVisible =
        !document.hidden;


      if (
        documentVisible
      ) {
        start();
      }

      else {
        stop();
      }

    }


    document.addEventListener(

      "visibilitychange",

      onVisibilityChange

    );


    /* =======================================================
       RENDER LOOP
       ======================================================= */

    function animate(
      timestamp
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


      /*
       * FPS limiter.
       */

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


      const delta =
        Math.min(

          elapsed /
          16.667,

          2

        );


      previousTime =
        timestamp;


      const time =
        timestamp *
        0.001;


      /* =====================================================
         SCROLL CALCULATION
         ===================================================== */

      if (
        scrollDirty
      ) {

        scrollProgress =
          THREE.MathUtils.clamp(

            (
              currentScrollY -
              heroTop
            ) /

            heroHeight,

            0,

            1

          );


        scrollDirty =
          false;

      }


      /* =====================================================
         HEAVY POINTER RESPONSE
         ===================================================== */

      world.rotation.x +=

        (
          targetRotation.x -
          world.rotation.x
        ) *

        0.025 *

        delta;


      world.rotation.y +=

        (
          targetRotation.y -
          world.rotation.y
        ) *

        0.025 *

        delta;


      /* =====================================================
         AUTONOMOUS ROTATION
         ===================================================== */

      world.rotation.y +=

        0.0007 *

        delta;


      /* =====================================================
         FLOATING
         ===================================================== */

      world.position.y =

        Math.sin(
          time *
          0.42
        ) *

        0.035 -

        scrollProgress *

        0.18;


      /* =====================================================
         SCROLL ROTATION
         ===================================================== */

      world.rotation.z =

        -0.14 +

        scrollProgress *

        0.1;


      /* =====================================================
         LIGHT POINTER
         ===================================================== */

      if (
        !coarsePointer
      ) {

        keyLight.position.x =

          3.5 +

          pointer.x *

          0.85;


        keyLight.position.y =

          3.3 -

          pointer.y *

          0.45;

      }


      /* =====================================================
         GLOW BREATHING
         ===================================================== */

      const glowScale =

        5.2 +

        Math.sin(
          time *
          0.48
        ) *

        0.08;


      glow.scale.set(

        glowScale,

        glowScale,

        1

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


    /* =======================================================
       CSS FALLBACK
       ======================================================= */

    const fallback =
      host.querySelectorAll(

        ".hero-orbit-core, .hero-orbit-ring"

      );


    function hideFallback() {

      fallback.forEach(
        (element) => {

          element.style.transition =
            "opacity .8s ease";


          element.style.opacity =
            "0";

        }
      );

    }


    function showFallback() {

      fallback.forEach(
        (element) => {

          element.style.opacity =
            "";

        }
      );

    }


    /* =======================================================
       READY
       ======================================================= */

    renderer.render(

      scene,

      camera

    );


    requestAnimationFrame(
      () => {

        hideFallback();


        canvas.style.opacity =
          "1";


        start();

      }
    );


    /* =======================================================
       CONTEXT LOSS
       ======================================================= */

    function contextLost(
      event
    ) {

      event.preventDefault();


      stop();


      canvas.style.opacity =
        "0";


      showFallback();

    }


    canvas.addEventListener(

      "webglcontextlost",

      contextLost,

      false

    );


    /* =======================================================
       CLEANUP
       ======================================================= */

    function cleanup() {

      stop();


      if (
        resizeRaf !== null
      ) {

        cancelAnimationFrame(
          resizeRaf
        );

      }


      resizeObserver.disconnect();


      heroObserver.disconnect();


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

        contextLost

      );


      ribbonGeometry.dispose();


      ribbonMaterial.dispose();


      edgeGeometry?.dispose();


      edgeMaterial?.dispose();


      glowTexture.dispose();


      glowMaterial.dispose();


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


      showFallback();

    }


    window.addEventListener(

      "pagehide",

      cleanup,

      {
        once:
          true,
      }

    );

  }
})();