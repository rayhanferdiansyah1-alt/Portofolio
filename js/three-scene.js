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
      initScene(THREE);
    })
    .catch((error) => {
      console.warn(
        "Three.js gagal dimuat. Hero CSS digunakan sebagai fallback.",
        error
      );
    });

  function initScene(THREE) {
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
      1.05;

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

        pointerEvents: "none",

        opacity: "0",

        zIndex: "5",

        transition:
          "opacity 1.3s cubic-bezier(.16,1,.3,1)"
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
        96,
        96
      );

    const sphereMaterial =
      new THREE.MeshPhysicalMaterial({
        color:
          new THREE.Color(
            "#0c1217"
          ),

        roughness: 0.16,

        metalness: 0.06,

        transmission: 0.26,

        thickness: 1.8,

        ior: 1.32,

        transparent: true,

        opacity: 0.94,

        clearcoat: 1,

        clearcoatRoughness: 0.10,

        reflectivity: 0.48,

        sheen: 0.14,

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
    | INNER DARK CORE
    |--------------------------------------------------------------------------
    */

    const coreGeometry =
      new THREE.IcosahedronGeometry(
        0.67,
        6
      );

    const coreMaterial =
      new THREE.MeshStandardMaterial({
        color:
          new THREE.Color(
            "#071017"
          ),

        roughness: 0.38,

        metalness: 0.28,

        transparent: true,

        opacity: 0.54
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
    | ULTRA SUBTLE WIREFRAME
    |--------------------------------------------------------------------------
    */

    const wireGeometry =
      new THREE.IcosahedronGeometry(
        1.305,
        2
      );

    const wireMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#a9e4fa"
          ),

        wireframe: true,

        transparent: true,

        opacity: 0.022,

        depthWrite: false
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
    | FRESNEL-LIKE GLASS EDGE
    |--------------------------------------------------------------------------
    */

    const fresnelGeometry =
      new THREE.SphereGeometry(
        1.32,
        72,
        72
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
            value: 0.18
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

            vec3 viewDir =
              normalize(
                vViewPosition
              );

            float fresnel =
              pow(
                1.0 -
                max(
                  dot(
                    normalize(vNormal),
                    viewDir
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
    | ORBIT RING — PRIMARY
    |--------------------------------------------------------------------------
    */

    const ringOneGeometry =
      new THREE.TorusGeometry(
        1.92,
        0.005,
        8,
        220
      );

    const ringOneMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#b4e8fb"
          ),

        transparent: true,

        opacity: 0.09,

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
    | ORBIT RING — SECONDARY
    |--------------------------------------------------------------------------
    */

    const ringTwoGeometry =
      new THREE.TorusGeometry(
        2.15,
        0.0035,
        8,
        220
      );

    const ringTwoMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#e8f8ff"
          ),

        transparent: true,

        opacity: 0.042,

        depthWrite: false
      });

    const ringTwo =
      new THREE.Mesh(
        ringTwoGeometry,
        ringTwoMaterial
      );

    ringTwo.rotation.x =
      Math.PI * 0.20;

    ringTwo.rotation.y =
      Math.PI * 0.52;

    world.add(
      ringTwo
    );

    /*
    |--------------------------------------------------------------------------
    | THIRD ARCH RING
    |--------------------------------------------------------------------------
    */

    const ringThreeGeometry =
      new THREE.TorusGeometry(
        1.70,
        0.0028,
        8,
        180
      );

    const ringThreeMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#ffffff"
          ),

        transparent: true,

        opacity: 0.026,

        depthWrite: false
      });

    const ringThree =
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

    /*
    |--------------------------------------------------------------------------
    | HALO
    |--------------------------------------------------------------------------
    */

    const haloGeometry =
      new THREE.SphereGeometry(
        1.52,
        64,
        64
      );

    const haloMaterial =
      new THREE.MeshBasicMaterial({
        color:
          new THREE.Color(
            "#78cbe8"
          ),

        transparent: true,

        opacity: 0.011,

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
    | LIGHTING — SOFTER
    |--------------------------------------------------------------------------
    */

    const ambientLight =
      new THREE.AmbientLight(
        0xdcefff,
        0.34
      );

    scene.add(
      ambientLight
    );

    /*
    | Main icy light
    */

    const keyLight =
      new THREE.PointLight(
        0xbbeeff,
        7.5,
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

    /*
    | Lower blue rim
    */

    const rimLight =
      new THREE.PointLight(
        0x4da5cf,
        5.2,
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

    /*
    | White soft top light
    */

    const topLight =
      new THREE.DirectionalLight(
        0xffffff,
        0.72
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
    | Very subtle fill
    */

    const fillLight =
      new THREE.DirectionalLight(
        0x7cc7e3,
        0.32
      );

    fillLight.position.set(
      -3,
      1,
      3
    );

    scene.add(
      fillLight
    );

    /*
    |--------------------------------------------------------------------------
    | POINTER INTERACTION
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
        pointer.x * 0.16;

      targetRotation.x =
        pointer.y * 0.085;

      targetPosition.x =
        pointer.x * 0.055;

      targetPosition.y =
        -pointer.y * 0.035;
    }

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

    function resize() {
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
    | VISIBILITY OPTIMIZATION
    |--------------------------------------------------------------------------
    */

    let heroVisible = true;

    const heroObserver =
      new IntersectionObserver(
        (entries) => {
          heroVisible =
            entries[0]
              ?.isIntersecting ??
            true;
        },
        {
          threshold: 0.02
        }
      );

    heroObserver.observe(
      hero
    );

    /*
    |--------------------------------------------------------------------------
    | SCROLL REACTION
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
    | CLOCK
    |--------------------------------------------------------------------------
    */

    const clock =
      new THREE.Clock();

    /*
    |--------------------------------------------------------------------------
    | ANIMATION
    |--------------------------------------------------------------------------
    */

    function animate() {
      requestAnimationFrame(
        animate
      );

      if (!heroVisible) {
        return;
      }

      const time =
        clock.getElapsedTime();

      /*
      | Elegant mouse follow
      */

      world.rotation.y +=
        (
          targetRotation.y -
          world.rotation.y
        ) * 0.028;

      world.rotation.x +=
        (
          targetRotation.x -
          world.rotation.x
        ) * 0.028;

      world.position.x +=
        (
          targetPosition.x -
          world.position.x
        ) * 0.025;

      /*
      | Floating
      */

      const floating =
        Math.sin(
          time * 0.48
        ) * 0.035;

      world.position.y =
        floating +
        targetPosition.y -
        scrollProgress * 0.18;

      /*
      | Very slow autonomous motion
      */

      if (!reducedMotion) {
        sphere.rotation.y +=
          0.00075;

        core.rotation.y -=
          0.00060;

        core.rotation.x +=
          0.00032;

        wire.rotation.y +=
          0.00030;

        ringOne.rotation.z +=
          0.00034;

        ringTwo.rotation.z -=
          0.00023;

        ringThree.rotation.y +=
          0.00018;
      }

      /*
      | Scroll depth
      */

      world.rotation.z =
        scrollProgress *
        0.045;

      /*
      | Interactive lighting
      */

      keyLight.position.x =
        4.2 +
        pointer.x * 0.75;

      keyLight.position.y =
        3.4 -
        pointer.y * 0.48;

      /*
      | Subtle breathing
      */

      const breathing =
        1 +
        Math.sin(
          time * 0.55
        ) * 0.004;

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
    | WEBGL READY
    |--------------------------------------------------------------------------
    */

    requestAnimationFrame(
      () => {
        container
          .querySelectorAll(
            ".hero-orbit-core, .hero-orbit-ring"
          )
          .forEach(
            (element) => {
              element.style.transition =
                "opacity .9s ease";

              element.style.opacity =
                "0";
            }
          );

        canvas.style.opacity =
          "1";
      }
    );

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
        heroObserver.disconnect();

        window.removeEventListener(
          "pointermove",
          handlePointer
        );

        renderer.dispose();

        sphereGeometry.dispose();
        sphereMaterial.dispose();

        coreGeometry.dispose();
        coreMaterial.dispose();

        wireGeometry.dispose();
        wireMaterial.dispose();

        fresnelGeometry.dispose();
        fresnelMaterial.dispose();

        ringOneGeometry.dispose();
        ringOneMaterial.dispose();

        ringTwoGeometry.dispose();
        ringTwoMaterial.dispose();

        ringThreeGeometry.dispose();
        ringThreeMaterial.dispose();

        haloGeometry.dispose();
        haloMaterial.dispose();
      },
      {
        once: true
      }
    );
  }
})();