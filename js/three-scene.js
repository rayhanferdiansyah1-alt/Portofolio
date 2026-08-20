(() => {
  const hero = document.querySelector(".hero");
  const container = document.querySelector(".hero-orbit");

  if (!hero || !container) return;

  /*
  |--------------------------------------------------------------------------
  | DEVICE / USER PREFERENCES
  |--------------------------------------------------------------------------
  */

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const coarsePointer = window.matchMedia(
    "(pointer: coarse)"
  ).matches;

  const mobileViewport = window.matchMedia(
    "(max-width: 900px)"
  ).matches;

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const saveData =
    connection?.saveData === true;

  const deviceMemory =
    navigator.deviceMemory || 8;

  const cpuThreads =
    navigator.hardwareConcurrency || 8;

  const lowPowerDevice =
    deviceMemory <= 4 ||
    cpuThreads <= 4;

  const reducedQuality =
    mobileViewport ||
    coarsePointer ||
    lowPowerDevice;


  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |
  | Kalau user menggunakan:
  | - Save Data
  | - Reduced Motion
  |
  | Three.js tidak perlu diload.
  | CSS orb lama otomatis tetap tampil sebagai fallback.
  |--------------------------------------------------------------------------
  */

  if (saveData || reducedMotion) {
    return;
  }


  /*
  |--------------------------------------------------------------------------
  | LOAD THREE.JS
  |--------------------------------------------------------------------------
  */

  import(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
  )
    .then((THREE) => {
      initScene(THREE);
    })
    .catch((error) => {
      console.warn(
        "Three.js gagal dimuat. CSS orb digunakan sebagai fallback.",
        error
      );
    });


  /*
  |--------------------------------------------------------------------------
  | SCENE
  |--------------------------------------------------------------------------
  */

  function initScene(THREE) {
    let destroyed = false;
    let heroVisible = true;
    let documentVisible = !document.hidden;

    let rafId = null;
    let previousTime = 0;

    /*
    |--------------------------------------------------------------------------
    | QUALITY PROFILE
    |--------------------------------------------------------------------------
    */

    const quality = reducedQuality
      ? {
          sphereSegments: 48,
          fresnelSegments: 40,
          pixelRatio: 1,
          fps: 30,
          antialias: false,
          wireframe: false,
          thirdRing: false
        }
      : {
          sphereSegments: 72,
          fresnelSegments: 64,
          pixelRatio: Math.min(
            window.devicePixelRatio,
            1.5
          ),
          fps: 60,
          antialias: true,
          wireframe: true,
          thirdRing: true
        };


    /*
    |--------------------------------------------------------------------------
    | SCENE
    |--------------------------------------------------------------------------
    */

    const scene =
      new THREE.Scene();


    /*
    |--------------------------------------------------------------------------
    | CAMERA
    |--------------------------------------------------------------------------
    */

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
      6.8
    );


    /*
    |--------------------------------------------------------------------------
    | RENDERER
    |--------------------------------------------------------------------------
    */

    let renderer;

    try {
      renderer =
        new THREE.WebGLRenderer({
          alpha: true,

          antialias:
            quality.antialias,

          powerPreference:
            reducedQuality
              ? "low-power"
              : "high-performance",

          depth: true,

          stencil: false,

          preserveDrawingBuffer: false
        });
    } catch (error) {
      console.warn(
        "WebGL tidak tersedia. Menggunakan CSS orb.",
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
      1.02;


    /*
    |--------------------------------------------------------------------------
    | CANVAS
    |--------------------------------------------------------------------------
    */

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

        pointerEvents: "none",

        opacity: "0",

        zIndex: "5",

        transition:
          "opacity 1.2s cubic-bezier(.16,1,.3,1)"
      }
    );

    container.appendChild(
      canvas
    );


    /*
    |--------------------------------------------------------------------------
    | WORLD
    |--------------------------------------------------------------------------
    */

    const world =
      new THREE.Group();

    scene.add(
      world
    );


    /*
    |--------------------------------------------------------------------------
    | MAIN GLASS ORB
    |--------------------------------------------------------------------------
    */

    const sphereGeometry =
      new THREE.SphereGeometry(
        1.28,

        quality.sphereSegments,

        quality.sphereSegments
      );


    const sphereMaterial =
      new THREE.MeshPhysicalMaterial({
        color:
          new THREE.Color(
            "#0c1217"
          ),

        roughness:
          reducedQuality
            ? 0.2
            : 0.16,

        metalness: 0.06,

        transmission:
          reducedQuality
            ? 0.18
            : 0.26,

        thickness: 1.7,

        ior: 1.32,

        transparent: true,

        opacity: 0.94,

        clearcoat:
          reducedQuality
            ? 0.75
            : 1,

        clearcoatRoughness: 0.1,

        reflectivity: 0.46,

        sheen:
          reducedQuality
            ? 0.06
            : 0.12,

        sheenColor:
          new THREE.Color(
            "#8ed9f4"
          )
      });


    const sphere =
      new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
      );

    world.add(
      sphere
    );


    /*
    |--------------------------------------------------------------------------
    | INNER CORE
    |--------------------------------------------------------------------------
    */

    const coreGeometry =
      new THREE.IcosahedronGeometry(
        0.67,

        reducedQuality
          ? 3
          : 5
      );


    const coreMaterial =
      new THREE.MeshStandardMaterial({
        color:
          new THREE.Color(
            "#071017"
          ),

        roughness: 0.4,

        metalness: 0.28,

        transparent: true,

        opacity: 0.52
      });


    const core =
      new THREE.Mesh(
        coreGeometry,
        coreMaterial
      );

    core.scale.setScalar(
      0.96
    );

    world.add(
      core
    );


    /*
    |--------------------------------------------------------------------------
    | OPTIONAL WIREFRAME
    |
    | Desktop:
    | aktif
    |
    | Mobile / low-power:
    | tidak dibuat sama sekali
    |--------------------------------------------------------------------------
    */

    let wire = null;
    let wireGeometry = null;
    let wireMaterial = null;

    if (quality.wireframe) {
      wireGeometry =
        new THREE.IcosahedronGeometry(
          1.305,
          2
        );

      wireMaterial =
        new THREE.MeshBasicMaterial({
          color:
            new THREE.Color(
              "#a9e4fa"
            ),

          wireframe: true,

          transparent: true,

          opacity: 0.018,

          depthWrite: false
        });

      wire =
        new THREE.Mesh(
          wireGeometry,
          wireMaterial
        );

      world.add(
        wire
      );
    }


    /*
    |--------------------------------------------------------------------------
    | FRESNEL EDGE
    |--------------------------------------------------------------------------
    */

    const fresnelGeometry =
      new THREE.SphereGeometry(
        1.32,

        quality.fresnelSegments,

        quality.fresnelSegments
      );


    const fresnelMaterial =
      new THREE.ShaderMaterial({
        transparent: true,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        uniforms: {
          glowColor: {
            value:
              new THREE.Color(
                "#8edbf7"
              )
          },

          intensity: {
            value:
              reducedQuality
                ? 0.12
                : 0.17
          }
        },

        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vViewPosition;

          void main() {

            vec4 mvPosition =
              modelViewMatrix *
              vec4(position, 1.0);

            vViewPosition =
              -mvPosition.xyz;

            vNormal =
              normalize(
                normalMatrix *
                normal
              );

            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,

        fragmentShader: `
          uniform vec3 glowColor;
          uniform float intensity;

          varying vec3 vNormal;
          varying vec3 vViewPosition;

          void main() {

            vec3 viewDirection =
              normalize(
                vViewPosition
              );

            float fresnel =
              pow(
                1.0 -
                max(
                  dot(
                    normalize(vNormal),
                    viewDirection
                  ),
                  0.0
                ),
                3.4
              );

            float alpha =
              fresnel *
              intensity;

            gl_FragColor =
              vec4(
                glowColor,
                alpha
              );
          }
        `
      });


    const fresnel =
      new THREE.Mesh(
        fresnelGeometry,
        fresnelMaterial
      );

    world.add(
      fresnel
    );


    /*
    |--------------------------------------------------------------------------
    | PRIMARY ORBIT
    |--------------------------------------------------------------------------
    */

    const ringOneGeometry =
      new THREE.TorusGeometry(
        1.92,
        0.005,
        6,
        reducedQuality
          ? 120
          : 180
      );


    const ringOneMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#b4e8fb"
          ),

        transparent: true,

        opacity: 0.085,

        depthWrite: false
      });


    const ringOne =
      new THREE.Mesh(
        ringOneGeometry,
        ringOneMaterial
      );

    ringOne.rotation.x =
      Math.PI * 0.56;

    ringOne.rotation.y =
      Math.PI * 0.16;

    world.add(
      ringOne
    );


    /*
    |--------------------------------------------------------------------------
    | SECONDARY ORBIT
    |--------------------------------------------------------------------------
    */

    const ringTwoGeometry =
      new THREE.TorusGeometry(
        2.15,
        0.0035,
        6,
        reducedQuality
          ? 100
          : 160
      );


    const ringTwoMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#e8f8ff"
          ),

        transparent: true,

        opacity: 0.038,

        depthWrite: false
      });


    const ringTwo =
      new THREE.Mesh(
        ringTwoGeometry,
        ringTwoMaterial
      );

    ringTwo.rotation.x =
      Math.PI * 0.2;

    ringTwo.rotation.y =
      Math.PI * 0.52;

    world.add(
      ringTwo
    );


    /*
    |--------------------------------------------------------------------------
    | THIRD ORBIT
    |
    | Desktop only
    |--------------------------------------------------------------------------
    */

    let ringThree = null;
    let ringThreeGeometry = null;
    let ringThreeMaterial = null;

    if (quality.thirdRing) {
      ringThreeGeometry =
        new THREE.TorusGeometry(
          1.7,
          0.0028,
          6,
          140
        );


      ringThreeMaterial =
        new THREE.MeshBasicMaterial({
          color:
            new THREE.Color(
              "#ffffff"
            ),

          transparent: true,

          opacity: 0.024,

          depthWrite: false
        });


      ringThree =
        new THREE.Mesh(
          ringThreeGeometry,
          ringThreeMaterial
        );

      ringThree.rotation.x =
        Math.PI * 0.82;

      ringThree.rotation.z =
        Math.PI * 0.24;

      world.add(
        ringThree
      );
    }


    /*
    |--------------------------------------------------------------------------
    | HALO
    |--------------------------------------------------------------------------
    */

    const haloGeometry =
      new THREE.SphereGeometry(
        1.52,

        reducedQuality
          ? 32
          : 48,

        reducedQuality
          ? 32
          : 48
      );


    const haloMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#78cbe8"
          ),

        transparent: true,

        opacity: 0.01,

        side:
          THREE.BackSide,

        depthWrite: false
      });


    const halo =
      new THREE.Mesh(
        haloGeometry,
        haloMaterial
      );

    world.add(
      halo
    );


    /*
    |--------------------------------------------------------------------------
    | LIGHTING
    |--------------------------------------------------------------------------
    */

    const ambientLight =
      new THREE.AmbientLight(
        0xdcefff,
        0.3
      );

    scene.add(
      ambientLight
    );


    const keyLight =
      new THREE.PointLight(
        0xbbeeff,

        reducedQuality
          ? 5
          : 7,

        16,

        2
      );

    keyLight.position.set(
      4.2,
      3.4,
      5
    );

    scene.add(
      keyLight
    );


    const rimLight =
      new THREE.PointLight(
        0x4da5cf,

        reducedQuality
          ? 3.5
          : 5,

        14,

        2
      );

    rimLight.position.set(
      -4.5,
      -2.8,
      3.5
    );

    scene.add(
      rimLight
    );


    const topLight =
      new THREE.DirectionalLight(
        0xffffff,
        0.68
      );

    topLight.position.set(
      0,
      5,
      5
    );

    scene.add(
      topLight
    );


    /*
    |--------------------------------------------------------------------------
    | POINTER
    |--------------------------------------------------------------------------
    */

    const pointer = {
      x: 0,
      y: 0
    };


    const targetRotation = {
      x: 0,
      y: 0
    };


    const targetPosition = {
      x: 0,
      y: 0
    };


    function handlePointer(event) {
      const nx =
        event.clientX /
        window.innerWidth;

      const ny =
        event.clientY /
        window.innerHeight;


      pointer.x =
        nx * 2 - 1;

      pointer.y =
        ny * 2 - 1;


      targetRotation.y =
        pointer.x * 0.15;

      targetRotation.x =
        pointer.y * 0.08;


      targetPosition.x =
        pointer.x * 0.05;

      targetPosition.y =
        -pointer.y * 0.03;
    }


    /*
    | Pointer interaction desktop only.
    */

    if (!coarsePointer) {
      window.addEventListener(
        "pointermove",
        handlePointer,
        {
          passive: true
        }
      );
    }


    /*
    |--------------------------------------------------------------------------
    | RESIZE
    |--------------------------------------------------------------------------
    */

    function resize() {
      if (destroyed) return;

      const rect =
        container.getBoundingClientRect();


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


      renderer.setSize(
        width,
        height,
        false
      );


      camera.aspect =
        width / height;


      camera.updateProjectionMatrix();


      /*
      | Render sekali agar resize tidak
      | meninggalkan canvas lama.
      */

      renderer.render(
        scene,
        camera
      );
    }


    const resizeObserver =
      new ResizeObserver(
        resize
      );


    resizeObserver.observe(
      container
    );


    resize();


    /*
    |--------------------------------------------------------------------------
    | SCROLL
    |--------------------------------------------------------------------------
    */

    let scrollProgress = 0;


    function updateScroll() {
      const rect =
        hero.getBoundingClientRect();


      const height =
        Math.max(
          hero.offsetHeight,
          1
        );


      scrollProgress =
        Math.min(
          Math.max(
            -rect.top /
            height,
            0
          ),
          1
        );
    }


    window.addEventListener(
      "scroll",
      updateScroll,
      {
        passive: true
      }
    );


    updateScroll();


    /*
    |--------------------------------------------------------------------------
    | FPS LIMIT
    |--------------------------------------------------------------------------
    */

    const frameDuration =
      1000 /
      quality.fps;


    /*
    |--------------------------------------------------------------------------
    | ANIMATION LOOP
    |--------------------------------------------------------------------------
    */

    function animate(timestamp) {
      rafId = null;

      if (
        destroyed ||
        !heroVisible ||
        !documentVisible
      ) {
        return;
      }


      if (
        timestamp -
        previousTime <
        frameDuration
      ) {
        startAnimation();

        return;
      }


      const delta =
        Math.min(
          (
            timestamp -
            previousTime
          ) / 16.667,

          2
        );


      previousTime =
        timestamp;


      const time =
        timestamp *
        0.001;


      /*
      | Smooth pointer movement
      */

      world.rotation.y +=
        (
          targetRotation.y -
          world.rotation.y
        ) *
        0.03 *
        delta;


      world.rotation.x +=
        (
          targetRotation.x -
          world.rotation.x
        ) *
        0.03 *
        delta;


      world.position.x +=
        (
          targetPosition.x -
          world.position.x
        ) *
        0.025 *
        delta;


      /*
      | Floating
      */

      const floating =
        Math.sin(
          time * 0.48
        ) *
        0.033;


      world.position.y =
        floating +
        targetPosition.y -
        scrollProgress *
        0.17;


      /*
      | Autonomous movement
      */

      sphere.rotation.y +=
        0.0007 *
        delta;


      core.rotation.y -=
        0.00055 *
        delta;


      core.rotation.x +=
        0.00028 *
        delta;


      if (wire) {
        wire.rotation.y +=
          0.00025 *
          delta;
      }


      ringOne.rotation.z +=
        0.00031 *
        delta;


      ringTwo.rotation.z -=
        0.0002 *
        delta;


      if (ringThree) {
        ringThree.rotation.y +=
          0.00016 *
          delta;
      }


      /*
      | Scroll depth
      */

      world.rotation.z =
        scrollProgress *
        0.042;


      /*
      | Lighting reaction
      |
      | Desktop pointer:
      | dynamic
      |
      | Touch/mobile:
      | mostly static
      */

      if (!coarsePointer) {
        keyLight.position.x =
          4.2 +
          pointer.x *
          0.7;


        keyLight.position.y =
          3.4 -
          pointer.y *
          0.45;
      }


      /*
      | Tiny breathing
      */

      const breathing =
        1 +
        Math.sin(
          time * 0.55
        ) *
        0.0035;


      halo.scale.setScalar(
        breathing
      );


      renderer.render(
        scene,
        camera
      );


      startAnimation();
    }


    /*
    |--------------------------------------------------------------------------
    | START / STOP RAF
    |--------------------------------------------------------------------------
    */

    function startAnimation() {
      if (
        destroyed ||
        rafId !== null ||
        !heroVisible ||
        !documentVisible
      ) {
        return;
      }

      rafId =
        requestAnimationFrame(
          animate
        );
    }


    function stopAnimation() {
      if (rafId === null) {
        return;
      }

      cancelAnimationFrame(
        rafId
      );

      rafId = null;
    }


    /*
    |--------------------------------------------------------------------------
    | HERO VISIBILITY
    |
    | Orb berhenti total ketika Hero
    | sudah keluar viewport.
    |--------------------------------------------------------------------------
    */

    const heroObserver =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          heroVisible =
            entry?.isIntersecting ??
            true;


          if (heroVisible) {
            previousTime =
              performance.now();

            startAnimation();
          } else {
            stopAnimation();
          }
        },
        {
          threshold: 0.01
        }
      );


    heroObserver.observe(
      hero
    );


    /*
    |--------------------------------------------------------------------------
    | TAB VISIBILITY
    |
    | Ketika user pindah tab:
    | render loop berhenti.
    |--------------------------------------------------------------------------
    */

    function handleVisibilityChange() {
      documentVisible =
        !document.hidden;


      if (documentVisible) {
        previousTime =
          performance.now();

        startAnimation();
      } else {
        stopAnimation();
      }
    }


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    /*
    |--------------------------------------------------------------------------
    | WEBGL CONTEXT LOST
    |--------------------------------------------------------------------------
    */

    function handleContextLost(
      event
    ) {
      event.preventDefault();

      stopAnimation();

      canvas.style.opacity =
        "0";

      showCssFallback();
    }


    canvas.addEventListener(
      "webglcontextlost",
      handleContextLost,
      false
    );


    /*
    |--------------------------------------------------------------------------
    | CSS FALLBACK
    |--------------------------------------------------------------------------
    */

    const fallbackElements =
      container.querySelectorAll(
        ".hero-orbit-core, .hero-orbit-ring"
      );


    function hideCssFallback() {
      fallbackElements.forEach(
        (element) => {
          element.style.transition =
            "opacity .9s ease";

          element.style.opacity =
            "0";
        }
      );
    }


    function showCssFallback() {
      fallbackElements.forEach(
        (element) => {
          element.style.opacity =
            "";
        }
      );
    }


    /*
    |--------------------------------------------------------------------------
    | FIRST FRAME
    |--------------------------------------------------------------------------
    */

    renderer.render(
      scene,
      camera
    );


    requestAnimationFrame(
      () => {
        if (destroyed) return;

        hideCssFallback();

        canvas.style.opacity =
          "1";

        previousTime =
          performance.now();

        startAnimation();
      }
    );


    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    function cleanup() {
      if (destroyed) return;

      destroyed = true;


      stopAnimation();


      resizeObserver.disconnect();

      heroObserver.disconnect();


      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );


      window.removeEventListener(
        "scroll",
        updateScroll
      );


      window.removeEventListener(
        "pointermove",
        handlePointer
      );


      canvas.removeEventListener(
        "webglcontextlost",
        handleContextLost
      );


      /*
      | Geometry
      */

      sphereGeometry.dispose();

      coreGeometry.dispose();

      fresnelGeometry.dispose();

      ringOneGeometry.dispose();

      ringTwoGeometry.dispose();

      haloGeometry.dispose();


      if (wireGeometry) {
        wireGeometry.dispose();
      }


      if (ringThreeGeometry) {
        ringThreeGeometry.dispose();
      }


      /*
      | Material
      */

      sphereMaterial.dispose();

      coreMaterial.dispose();

      fresnelMaterial.dispose();

      ringOneMaterial.dispose();

      ringTwoMaterial.dispose();

      haloMaterial.dispose();


      if (wireMaterial) {
        wireMaterial.dispose();
      }


      if (ringThreeMaterial) {
        ringThreeMaterial.dispose();
      }


      /*
      | Renderer
      */

      renderer.dispose();

      renderer.forceContextLoss();


      if (
        canvas.parentNode ===
        container
      ) {
        container.removeChild(
          canvas
        );
      }


      showCssFallback();
    }


    window.addEventListener(
      "pagehide",
      cleanup,
      {
        once: true
      }
    );
  }
})();