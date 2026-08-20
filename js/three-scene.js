(() => {
  const hero = document.querySelector(".hero");
  const container = document.querySelector(".hero-orbit");

  if (!hero || !container) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /*
  |--------------------------------------------------------------------------
  | LOAD THREE.JS
  |--------------------------------------------------------------------------
  */

  import(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
  )
    .then((THREE) => {
      initThreeScene(THREE);
    })
    .catch((error) => {
      console.warn(
        "Three.js gagal dimuat. CSS hero tetap digunakan sebagai fallback.",
        error
      );
    });

  function initThreeScene(THREE) {
    /*
    |--------------------------------------------------------------------------
    | SCENE
    |--------------------------------------------------------------------------
    */

    const scene = new THREE.Scene();

    /*
    |--------------------------------------------------------------------------
    | CAMERA
    |--------------------------------------------------------------------------
    */

    const camera = new THREE.PerspectiveCamera(
      36,
      1,
      0.1,
      100
    );

    camera.position.set(
      0,
      0,
      6.4
    );

    /*
    |--------------------------------------------------------------------------
    | RENDERER
    |--------------------------------------------------------------------------
    */

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setClearColor(
      0x000000,
      0
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1.5
      )
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
      1.15;

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

        zIndex: "5",

        opacity: "0",

        transition:
          "opacity 1.2s cubic-bezier(.16,1,.3,1)"
      }
    );

    container.appendChild(
      canvas
    );

    /*
    |--------------------------------------------------------------------------
    | GROUP
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
        64,
        64
      );

    const sphereMaterial =
      new THREE.MeshPhysicalMaterial({
        color:
          new THREE.Color(
            "#10171c"
          ),

        metalness: 0.08,

        roughness: 0.12,

        transmission: 0.62,

        thickness: 1.5,

        ior: 1.34,

        transparent: true,

        opacity: 0.92,

        clearcoat: 1,

        clearcoatRoughness: 0.08,

        reflectivity: 0.7
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
        0.62,
        5
      );

    const coreMaterial =
      new THREE.MeshStandardMaterial({
        color:
          new THREE.Color(
            "#0d161d"
          ),

        roughness: 0.24,

        metalness: 0.42,

        transparent: true,

        opacity: 0.78
      });

    const core =
      new THREE.Mesh(
        coreGeometry,
        coreMaterial
      );

    core.scale.setScalar(
      0.92
    );

    world.add(
      core
    );

    /*
    |--------------------------------------------------------------------------
    | SUBTLE WIREFRAME
    |--------------------------------------------------------------------------
    */

    const wireGeometry =
      new THREE.IcosahedronGeometry(
        1.31,
        2
      );

    const wireMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#9ed9ef"
          ),

        wireframe: true,

        transparent: true,

        opacity: 0.035
      });

    const wire =
      new THREE.Mesh(
        wireGeometry,
        wireMaterial
      );

    world.add(
      wire
    );

    /*
    |--------------------------------------------------------------------------
    | ORBIT RING 01
    |--------------------------------------------------------------------------
    */

    const ringOneGeometry =
      new THREE.TorusGeometry(
        1.92,
        0.008,
        10,
        180
      );

    const ringMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#b8e7f8"
          ),

        transparent: true,

        opacity: 0.13
      });

    const ringOne =
      new THREE.Mesh(
        ringOneGeometry,
        ringMaterial
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
    | ORBIT RING 02
    |--------------------------------------------------------------------------
    */

    const ringTwoGeometry =
      new THREE.TorusGeometry(
        2.12,
        0.006,
        10,
        180
      );

    const ringTwoMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#ffffff"
          ),

        transparent: true,

        opacity: 0.065
      });

    const ringTwo =
      new THREE.Mesh(
        ringTwoGeometry,
        ringTwoMaterial
      );

    ringTwo.rotation.x =
      Math.PI * 0.22;

    ringTwo.rotation.y =
      Math.PI * 0.52;

    world.add(
      ringTwo
    );

    /*
    |--------------------------------------------------------------------------
    | OUTER HALO
    |--------------------------------------------------------------------------
    */

    const haloGeometry =
      new THREE.SphereGeometry(
        1.55,
        48,
        48
      );

    const haloMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#79c6e5"
          ),

        transparent: true,

        opacity: 0.018,

        side:
          THREE.BackSide
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
        0xffffff,
        0.46
      );

    scene.add(
      ambientLight
    );

    /*
    | Ice blue key light
    */

    const keyLight =
      new THREE.PointLight(
        0xb6e9ff,
        22,
        15,
        2
      );

    keyLight.position.set(
      3.8,
      3,
      4
    );

    scene.add(
      keyLight
    );

    /*
    | Cold rim light
    */

    const rimLight =
      new THREE.PointLight(
        0x5aaed3,
        16,
        12,
        2
      );

    rimLight.position.set(
      -4,
      -2,
      2
    );

    scene.add(
      rimLight
    );

    /*
    | Soft white upper light
    */

    const topLight =
      new THREE.DirectionalLight(
        0xffffff,
        1.6
      );

    topLight.position.set(
      0,
      5,
      3
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

    const handlePointer =
      (event) => {

        const normalizedX =
          event.clientX /
          window.innerWidth;

        const normalizedY =
          event.clientY /
          window.innerHeight;

        pointer.x =
          normalizedX * 2 - 1;

        pointer.y =
          normalizedY * 2 - 1;

        targetRotation.y =
          pointer.x * 0.22;

        targetRotation.x =
          pointer.y * 0.12;
      };

    if (
      !reducedMotion &&
      window.matchMedia(
        "(pointer: fine)"
      ).matches
    ) {
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

    const resize =
      () => {

        const rect =
          container.getBoundingClientRect();

        const width =
          Math.max(
            rect.width,
            1
          );

        const height =
          Math.max(
            rect.height,
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
      };

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
    | HERO VISIBILITY
    |--------------------------------------------------------------------------
    */

    let heroVisible =
      true;

    const visibilityObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              heroVisible =
                entry.isIntersecting;

            }
          );

        },
        {
          threshold: 0.02
        }
      );

    visibilityObserver.observe(
      hero
    );

    /*
    |--------------------------------------------------------------------------
    | SCROLL DEPTH
    |--------------------------------------------------------------------------
    */

    let scrollProgress =
      0;

    const updateScroll =
      () => {

        const rect =
          hero.getBoundingClientRect();

        const heroHeight =
          Math.max(
            hero.offsetHeight,
            1
          );

        scrollProgress =
          Math.min(
            Math.max(
              -rect.top /
              heroHeight,
              0
            ),
            1
          );
      };

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
    | CLOCK
    |--------------------------------------------------------------------------
    */

    const clock =
      new THREE.Clock();

    /*
    |--------------------------------------------------------------------------
    | ANIMATION LOOP
    |--------------------------------------------------------------------------
    */

    function animate() {

      requestAnimationFrame(
        animate
      );

      if (!heroVisible) {
        return;
      }

      const elapsed =
        clock.getElapsedTime();

      /*
      | Smooth mouse follow
      */

      world.rotation.y +=
        (
          targetRotation.y -
          world.rotation.y
        ) * 0.035;

      world.rotation.x +=
        (
          targetRotation.x -
          world.rotation.x
        ) * 0.035;

      /*
      | Slow autonomous rotation
      */

      if (!reducedMotion) {

        sphere.rotation.y +=
          0.0015;

        sphere.rotation.x =
          Math.sin(
            elapsed * 0.25
          ) * 0.025;

        core.rotation.x +=
          0.001;

        core.rotation.y -=
          0.0014;

        wire.rotation.y +=
          0.0008;

        wire.rotation.z -=
          0.00045;

        ringOne.rotation.z +=
          0.0009;

        ringTwo.rotation.z -=
          0.00065;

      }

      /*
      | Subtle floating
      */

      world.position.y =
        Math.sin(
          elapsed * 0.55
        ) * 0.035;

      /*
      | Scroll reaction
      */

      world.position.y -=
        scrollProgress * 0.22;

      world.rotation.z =
        scrollProgress * 0.08;

      /*
      | Light follows mouse
      */

      keyLight.position.x =
        3.8 +
        pointer.x * 1.15;

      keyLight.position.y =
        3 -
        pointer.y * 0.8;

      /*
      | Tiny breathing effect
      */

      const breathing =
        1 +
        Math.sin(
          elapsed * 0.65
        ) * 0.006;

      halo.scale.setScalar(
        breathing
      );

      renderer.render(
        scene,
        camera
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ACTIVATE WEBGL
    |--------------------------------------------------------------------------
    */

    requestAnimationFrame(
      () => {

        /*
        Hide CSS fallback object only
        after WebGL initializes successfully.
        */

        container
          .querySelectorAll(
            ".hero-orbit-core, .hero-orbit-ring"
          )
          .forEach(
            (element) => {

              element.style.opacity =
                "0";

              element.style.transition =
                "opacity .8s ease";

            }
          );

        canvas.style.opacity =
          "1";

      }
    );

    /*
    |--------------------------------------------------------------------------
    | START
    |--------------------------------------------------------------------------
    */

    animate();

    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    window.addEventListener(
      "pagehide",
      () => {

        resizeObserver.disconnect();

        visibilityObserver.disconnect();

        renderer.dispose();

        sphereGeometry.dispose();

        sphereMaterial.dispose();

        coreGeometry.dispose();

        coreMaterial.dispose();

        wireGeometry.dispose();

        wireMaterial.dispose();

        ringOneGeometry.dispose();

        ringMaterial.dispose();

        ringTwoGeometry.dispose();

        ringTwoMaterial.dispose();

        haloGeometry.dispose();

        haloMaterial.dispose();

      },
      {
        once: true
      }
    );

  }

})();