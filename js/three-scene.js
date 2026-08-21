(() => {
  const hero = document.querySelector(".hero");
  const host = document.querySelector(".hero-orbit");

  if (!hero || !host) return;

  /* =========================================================
     USER / DEVICE PREFERENCES
     ========================================================= */

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  const mobile = window.matchMedia("(max-width: 900px)").matches;

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const saveData = connection?.saveData === true;

  const deviceMemory = navigator.deviceMemory || 8;

  const cpuThreads = navigator.hardwareConcurrency || 8;

  const lowPower = deviceMemory <= 4 || cpuThreads <= 4;

  /*
  |--------------------------------------------------------------------------
  | FALLBACK
  |--------------------------------------------------------------------------
  */

  if (saveData || reducedMotion) {
    return;
  }

  /* =========================================================
     LOAD THREE.JS
     ========================================================= */

  import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js")
    .then((THREE) => {
      initScene(THREE);
    })
    .catch((error) => {
      console.warn("Three.js gagal dimuat. CSS visual tetap digunakan.", error);
    });

  /* =========================================================
     INITIALIZE
     ========================================================= */

  function initScene(THREE) {
    const reducedQuality = mobile || coarsePointer || lowPower;

    const quality = reducedQuality
      ? {
          segments: 64,
          pixelRatio: 1,
          fps: 30,
          antialias: false,
          edgeDetail: false,
        }
      : {
          segments: 120,
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
          fps: 60,
          antialias: true,
          edgeDetail: true,
        };

    /* =========================================================
       SCENE
       ========================================================= */

    const scene = new THREE.Scene();

    /* =========================================================
       CAMERA
       ========================================================= */

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

    camera.position.set(0, 0, 6.7);

    /* =========================================================
       RENDERER
       ========================================================= */

    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: quality.antialias,
        powerPreference: reducedQuality ? "low-power" : "high-performance",
        stencil: false,
        preserveDrawingBuffer: false,
      });
    } catch (error) {
      console.warn("WebGL tidak tersedia.", error);

      return;
    }

    renderer.setClearColor(0x000000, 0);

    renderer.setPixelRatio(quality.pixelRatio);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.38;

    /* =========================================================
       CANVAS
       ========================================================= */

    const canvas = renderer.domElement;

    canvas.setAttribute("aria-hidden", "true");

    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",

      width: "100%",
      height: "100%",

      display: "block",

      pointerEvents: "none",

      opacity: "0",

      transition: "opacity 1.2s cubic-bezier(.16,1,.3,1)",
    });

    host.appendChild(canvas);

    /* =========================================================
       WORLD
       ========================================================= */

    const world = new THREE.Group();

    scene.add(world);

    /* =========================================================
       CREATE TWISTED RIBBON CURVE
       ========================================================= */

    const curvePoints = [];

    const pathSegments = reducedQuality ? 20 : 34;

    for (let i = 0; i <= pathSegments; i++) {
      const t = i / pathSegments;

      /*
  |--------------------------------------------------------------------------
  | SHORTER VERTICAL BODY
  | Tidak setinggi versi DNA sebelumnya.
  |--------------------------------------------------------------------------
  */

      const y = THREE.MathUtils.lerp(-1.55, 1.55, t);

      /*
  |--------------------------------------------------------------------------
  | LARGE ORGANIC S-CURVE
  |--------------------------------------------------------------------------
  */

      const x =
        Math.sin(t * Math.PI * 1.65) * 0.52 +
        Math.sin(t * Math.PI * 3.15 + 0.45) * 0.14 +
        Math.cos(t * Math.PI * 0.82) * 0.1;

      /*
  |--------------------------------------------------------------------------
  | DEPTH
  | Membuat bentuk tidak terasa flat.
  |--------------------------------------------------------------------------
  */

      const z =
        Math.cos(t * Math.PI * 1.35 + 0.25) * 0.38 +
        Math.sin(t * Math.PI * 2.35) * 0.11;

      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints);

    curve.curveType = "catmullrom";

    curve.tension = 0.42;

    /* =========================================================
       RIBBON GEOMETRY
       ========================================================= */

    function createRibbonGeometry(segments) {
      const geometry = new THREE.BufferGeometry();

      const positions = [];
      const uvs = [];
      const indices = [];

      const frames = curve.computeFrenetFrames(segments, false);

      /*
      | Four corners = solid rectangular ribbon.
      */

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;

        const center = curve.getPointAt(u);

        const normal = frames.normals[i].clone();

        const binormal = frames.binormals[i].clone();

        /*
        | Twist amount.
        |
        | ~3.25 full rotations.
        */

        const twist =
          u * Math.PI * 3.35 +
          Math.sin(u * Math.PI * 1.65) * 0.42 +
          Math.sin(u * Math.PI * 3.2) * 0.1;

        /*
        | Rotate width/depth axes around path.
        */

        const widthAxis = normal
          .clone()
          .multiplyScalar(Math.cos(twist))
          .add(binormal.clone().multiplyScalar(Math.sin(twist)))
          .normalize();

        const depthAxis = normal
          .clone()
          .multiplyScalar(-Math.sin(twist))
          .add(binormal.clone().multiplyScalar(Math.cos(twist)))
          .normalize();

        /*
        | Wider in the center,
        | slightly tapered near the ends.
        */

        /*
|--------------------------------------------------------------------------
| ORGANIC WIDTH
|--------------------------------------------------------------------------
|
| Lebar terbesar berada di badan sculpture.
| Sedikit asymmetric supaya tidak terasa matematis.
|
*/

        const taper = 0.48 + Math.pow(Math.sin(Math.PI * u), 0.58) * 0.72;

        const asymmetry = 1 + Math.sin(u * Math.PI * 2.6 + 0.55) * 0.13;

        const width = 0.96 * taper * asymmetry;

        const thickness = 0.085;

        const halfWidth = width * 0.5;

        const halfDepth = thickness * 0.5;

        const corners = [
          center
            .clone()
            .add(widthAxis.clone().multiplyScalar(halfWidth))
            .add(depthAxis.clone().multiplyScalar(halfDepth)),

          center
            .clone()
            .add(widthAxis.clone().multiplyScalar(-halfWidth))
            .add(depthAxis.clone().multiplyScalar(halfDepth)),

          center
            .clone()
            .add(widthAxis.clone().multiplyScalar(-halfWidth))
            .add(depthAxis.clone().multiplyScalar(-halfDepth)),

          center
            .clone()
            .add(widthAxis.clone().multiplyScalar(halfWidth))
            .add(depthAxis.clone().multiplyScalar(-halfDepth)),
        ];

        corners.forEach((point, index) => {
          positions.push(point.x, point.y, point.z);

          uvs.push(u, index / 3);
        });
      }

      /*
      | Connect each cross-section.
      */

      for (let i = 0; i < segments; i++) {
        for (let side = 0; side < 4; side++) {
          const nextSide = (side + 1) % 4;

          const a = i * 4 + side;

          const b = i * 4 + nextSide;

          const c = (i + 1) * 4 + nextSide;

          const d = (i + 1) * 4 + side;

          indices.push(a, b, c);

          indices.push(a, c, d);
        }
      }

      /*
      | Bottom cap
      */

      indices.push(0, 2, 1);

      indices.push(0, 3, 2);

      /*
      | Top cap
      */

      const end = segments * 4;

      indices.push(end, end + 1, end + 2);

      indices.push(end, end + 2, end + 3);

      geometry.setAttribute(
        "position",

        new THREE.Float32BufferAttribute(positions, 3),
      );

      geometry.setAttribute(
        "uv",

        new THREE.Float32BufferAttribute(uvs, 2),
      );

      geometry.setIndex(indices);

      geometry.computeVertexNormals();

      geometry.computeBoundingSphere();

      return geometry;
    }

    const ribbonGeometry = createRibbonGeometry(quality.segments);

    /* =========================================================
       DARK CHROME MATERIAL
       ========================================================= */

    const ribbonMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#8f9da6"),

      metalness: 0.82,

      roughness: 0.22,

      clearcoat: 1,

      clearcoatRoughness: 0.11,

      reflectivity: 0.88,

      sheen: 0.22,

      sheenColor: new THREE.Color("#d9f4ff"),

      side: THREE.DoubleSide,
    });

    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);

    world.add(ribbon);

    /* =========================================================
       SUBTLE EDGE DETAIL
       Desktop only
       ========================================================= */

    let edgeLines = null;
    let edgeGeometry = null;
    let edgeMaterial = null;

    if (quality.edgeDetail) {
      edgeGeometry = new THREE.EdgesGeometry(ribbonGeometry, 28);

      edgeMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color("#bcecff"),

        transparent: true,

        opacity: 0.075,

        depthWrite: false,
      });

      edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);

      ribbon.add(edgeLines);
    }

    /* =========================================================
       SOFT HALO
       ========================================================= */

    const glowCanvas = document.createElement("canvas");

    glowCanvas.width = 256;

    glowCanvas.height = 256;

    const glowContext = glowCanvas.getContext("2d");

    const gradient = glowContext.createRadialGradient(
      128,
      128,
      0,

      128,
      128,
      128,
    );

    gradient.addColorStop(0, "rgba(130, 215, 245, .16)");

    gradient.addColorStop(0.35, "rgba(105, 190, 225, .07)");

    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    glowContext.fillStyle = gradient;

    glowContext.fillRect(0, 0, 256, 256);

    const glowTexture = new THREE.CanvasTexture(glowCanvas);

    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,

      transparent: true,

      opacity: reducedQuality ? 0.36 : 0.48,

      depthWrite: false,
    });

    const glow = new THREE.Sprite(glowMaterial);

    glow.scale.set(5.2, 5.2, 1);

    glow.position.set(0.25, 0, -1.3);

    scene.add(glow);

    /* =========================================================
       LIGHTING
       ========================================================= */

    /*
    | Ambient
    */

    const ambient = new THREE.AmbientLight(0xc8e4ef, 0.48);

    scene.add(ambient);

    /*
    | Main white light
    */

    const keyLight = new THREE.PointLight(0xf4fcff, 26, 15, 2);

    keyLight.position.set(3.5, 3.3, 4);

    scene.add(keyLight);

    /*
    | Ice-blue rim
    */

    const rimLight = new THREE.PointLight(0x8bdcff, 19, 14, 2);

    rimLight.position.set(-3.7, 0.5, 2);

    scene.add(rimLight);

    /*
    | Lower fill
    */

    const lowerLight = new THREE.PointLight(0x3a7895, 8, 11, 2);

    lowerLight.position.set(1, -4, 2.5);

    scene.add(lowerLight);

    /*
    | Rear highlight
    */

    const rearLight = new THREE.PointLight(0xffffff, 8, 11, 2);

    rearLight.position.set(-1, 2, -4);

    scene.add(rearLight);

    /* =========================================================
       INITIAL SCULPTURE POSE
       ========================================================= */

    world.rotation.set(0.035, -0.48, -0.085);

    world.scale.setScalar(reducedQuality ? 1.02 : 1.22);

    world.position.x = -0.32;

    /* =========================================================
       POINTER INTERACTION
       ========================================================= */

    const pointer = {
      x: 0,
      y: 0,
    };

    const targetRotation = {
      x: world.rotation.x,
      y: world.rotation.y,
    };

    function onPointerMove(event) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;

      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;

      targetRotation.y = -0.48 + pointer.x * 0.12;

      targetRotation.x = 0.04 + pointer.y * 0.065;
    }

    if (!coarsePointer) {
      window.addEventListener("pointermove", onPointerMove, {
        passive: true,
      });
    }

    /* =========================================================
       RESIZE
       ========================================================= */

    function resize() {
      const rect = host.getBoundingClientRect();

      const width = Math.max(Math.round(rect.width), 1);

      const height = Math.max(Math.round(rect.height), 1);

      renderer.setSize(width, height, false);

      camera.aspect = width / height;

      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(host);

    resize();

    /* =========================================================
       SCROLL REACTION
       Internal 3D only.
       CSS container position is NOT touched.
       ========================================================= */

    let scrollProgress = 0;

    function updateScroll() {
      const rect = hero.getBoundingClientRect();

      const height = Math.max(hero.offsetHeight, 1);

      scrollProgress = Math.min(Math.max(-rect.top / height, 0), 1);
    }

    window.addEventListener("scroll", updateScroll, {
      passive: true,
    });

    updateScroll();

    /* =========================================================
       VISIBILITY
       ========================================================= */

    let heroVisible = true;
    let documentVisible = !document.hidden;

    const heroObserver = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0]?.isIntersecting ?? true;

        if (heroVisible) {
          start();
        } else {
          stop();
        }
      },
      {
        threshold: 0.01,
      },
    );

    heroObserver.observe(hero);

    function visibilityChange() {
      documentVisible = !document.hidden;

      if (documentVisible) {
        start();
      } else {
        stop();
      }
    }

    document.addEventListener("visibilitychange", visibilityChange);

    /* =========================================================
       ANIMATION LOOP
       ========================================================= */

    let raf = null;

    let previousTime = performance.now();

    const frameDuration = 1000 / quality.fps;

    function start() {
      if (raf !== null || !heroVisible || !documentVisible) {
        return;
      }

      raf = requestAnimationFrame(animate);
    }

    function stop() {
      if (raf === null) {
        return;
      }

      cancelAnimationFrame(raf);

      raf = null;
    }

    function animate(timestamp) {
      raf = null;

      if (!heroVisible || !documentVisible) {
        return;
      }

      const elapsed = timestamp - previousTime;

      if (elapsed < frameDuration) {
        start();

        return;
      }

      const delta = Math.min(elapsed / 16.667, 2);

      previousTime = timestamp;

      const time = timestamp * 0.001;

      /*
      | Heavy, slow mouse response
      */

      world.rotation.x += (targetRotation.x - world.rotation.x) * 0.025 * delta;

      world.rotation.y += (targetRotation.y - world.rotation.y) * 0.025 * delta;

      /*
      | Autonomous sculpture rotation
      */

      world.rotation.y += 0.0007 * delta;

      /*
      | Slow floating
      */

      world.position.y = Math.sin(time * 0.42) * 0.035 - scrollProgress * 0.18;

      /*
      | Slight scroll rotation
      */

      world.rotation.z = -0.14 + scrollProgress * 0.1;

      /*
      | Mouse-responsive lighting
      */

      if (!coarsePointer) {
        keyLight.position.x = 3.5 + pointer.x * 0.85;

        keyLight.position.y = 3.3 - pointer.y * 0.45;
      }

      /*
      | Tiny breathing glow
      */

      const glowScale = 5.2 + Math.sin(time * 0.48) * 0.08;

      glow.scale.set(glowScale, glowScale, 1);

      renderer.render(scene, camera);

      start();
    }

    /* =========================================================
       CSS FALLBACK
       ========================================================= */

    const fallback = host.querySelectorAll(
      ".hero-orbit-core, .hero-orbit-ring",
    );

    function hideFallback() {
      fallback.forEach((element) => {
        element.style.transition = "opacity .8s ease";

        element.style.opacity = "0";
      });
    }

    function showFallback() {
      fallback.forEach((element) => {
        element.style.opacity = "";
      });
    }

    /* =========================================================
       WEBGL READY
       ========================================================= */

    renderer.render(scene, camera);

    requestAnimationFrame(() => {
      hideFallback();

      canvas.style.opacity = "1";

      previousTime = performance.now();

      start();
    });

    /* =========================================================
       WEBGL CONTEXT LOSS
       ========================================================= */

    function contextLost(event) {
      event.preventDefault();

      stop();

      canvas.style.opacity = "0";

      showFallback();
    }

    canvas.addEventListener("webglcontextlost", contextLost, false);

    /* =========================================================
       CLEANUP
       ========================================================= */

    function cleanup() {
      stop();

      resizeObserver.disconnect();

      heroObserver.disconnect();

      window.removeEventListener("scroll", updateScroll);

      window.removeEventListener("pointermove", onPointerMove);

      document.removeEventListener("visibilitychange", visibilityChange);

      canvas.removeEventListener("webglcontextlost", contextLost);

      ribbonGeometry.dispose();

      ribbonMaterial.dispose();

      if (edgeGeometry) {
        edgeGeometry.dispose();
      }

      if (edgeMaterial) {
        edgeMaterial.dispose();
      }

      glowTexture.dispose();

      glowMaterial.dispose();

      renderer.dispose();

      renderer.forceContextLoss();

      if (canvas.parentNode === host) {
        host.removeChild(canvas);
      }

      showFallback();
    }

    window.addEventListener("pagehide", cleanup, {
      once: true,
    });
  }
})();
