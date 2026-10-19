/* ============================================================
   PAWFFICE — simulasi kantor kucing, tanpa backend atau API AI.

   Urutan kode:
   1. Data karakter dan simulasi
   2. Bentuk dasar serta tekstur
   3. Ruangan dan furnitur
   4. Avatar kucing
   5. Navigasi dan aktivitas
   6. Antarmuka, kamera, dan render
   ============================================================ */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  if (!window.THREE) {
    $("loading").lastElementChild.textContent =
      "Three.js belum terbaca. Pastikan file Three.js ada di folder yang sama.";
    return;
  }

  // Ubah bagian ini kalau ingin mengganti nama, peran, atau warna kucing.
  const TEAM = [
    {
      id: "miko",
      name: "Miko",
      gender: "♂",
      role: "Project Coordinator",
      title: "THE PLANNER",
      bio: "Penggemar to-do list, kopi hangat, dan memastikan semua ide punya tempat.",
      fur: 0xd99553,
      patch: 0xf4d9ac,
      darkFur: 0xb7703e,
      shirt: 0xf5eedc,
      pants: 0x3c5950,
      accent: 0x4c7463,
      portrait: 0xe9d7b9,
      desk: new THREE.Vector3(-2.25, 0, -2.08),
      tasks: [
        "Menyusun rencana",
        "Merapikan to-do list",
        "Mengecek ide tim",
      ],
    },
    {
      id: "luna",
      name: "Luna",
      gender: "♀",
      role: "Visual Designer",
      title: "THE DAYDREAMER",
      bio: "Meramu warna, menggambar ide, dan menemukan inspirasi di sela-sela rebahan.",
      fur: 0x929da3,
      patch: 0xf2ece0,
      darkFur: 0x6c777e,
      shirt: 0x849878,
      pants: 0x555d62,
      accent: 0xd99a77,
      portrait: 0xd9e2d1,
      desk: new THREE.Vector3(1.65, 0, -2.08),
      tasks: [
        "Menggambar ide",
        "Memilih palet warna",
        "Membuat moodboard",
      ],
    },
  ];

  const simulation = {
    paused: false,
    speed: 1,
    night: false,
    minutes: 9 * 60,
    elapsed: 0,
    focusSeconds: 0,
    day: 1,
    seen: new Set(["miko"]),
    coffee: false,
    missions: [false, false, false],
    events: [],
  };

  const materials = new Map();
  const geometries = new Map();
  const obstacles = [];
  const cats = [];
  const steamPuffs = [];
  const windowMaterials = [];
  const lampMaterials = [];
  const wallGroups = [];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();

  let renderer;
  let scene;
  let camera;
  let sunlight;
  let ambient;
  let selected;
  let selectionRing;
  let clockMinute;
  let clockHour;
  let toastTimeout;
  let lastUIUpdate = 0;
  let lastMissionSignature = "";

  const orbit = {
    theta: 0.62,
    phi: 0.90,
    zoom: 1,
    target: new THREE.Vector3(0, 0.8, 0),
    goalTheta: 0.62,
    goalPhi: 0.90,
    goalZoom: 1,
    goalTarget: new THREE.Vector3(0, 0.8, 0),
    follow: false,
  };

  // ---------- Bentuk dasar yang dipakai berulang kali ----------

  function material(color, options = {}) {
    const key = `${color}:${JSON.stringify(options)}`;

    if (!materials.has(key)) {
      materials.set(key, new THREE.MeshStandardMaterial({
        color,
        roughness: 0.82,
        ...options,
      }));
    }

    return materials.get(key);
  }

  function addMesh(geometry, surface, position, parent = scene) {
    const mesh = new THREE.Mesh(geometry, surface);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function roundedGeometry(width, height, depth, radius) {
    const key = [width, height, depth, radius].join(":");

    if (geometries.has(key)) {
      return geometries.get(key);
    }

    const r = Math.min(radius, width / 3, height / 3, depth / 3);
    const x = -width / 2 + r;
    const y = -height / 2 + r;
    const w = width - r * 2;
    const h = height - r * 2;
    const shape = new THREE.Shape();

    shape.moveTo(x, y);
    shape.lineTo(x + w, y);
    shape.lineTo(x + w, y + h);
    shape.lineTo(x, y + h);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: depth - r * 2,
      bevelEnabled: true,
      bevelThickness: r,
      bevelSize: r,
      bevelSegments: 3,
      steps: 1,
      curveSegments: 1,
    });

    geometry.translate(0, 0, -depth / 2 + r);
    geometry.computeVertexNormals();
    geometries.set(key, geometry);
    return geometry;
  }

  function box(width, height, depth, color, x, y, z, parent = scene) {
    const geometry = roundedGeometry(width, height, depth, 0.055);
    const mesh = addMesh(geometry, material(color), [x, y, z], parent);
    mesh.castShadow = Math.min(width, height, depth) > 0.04;
    return mesh;
  }

  function sphere(radius, color, x, y, z, parent = scene, scale = [1, 1, 1]) {
    const key = `sphere:${radius}`;

    if (!geometries.has(key)) {
      geometries.set(key, new THREE.SphereGeometry(radius, 20, 14));
    }

    const mesh = addMesh(geometries.get(key), material(color), [x, y, z], parent);
    mesh.scale.set(...scale);
    return mesh;
  }

  function cylinder(top, bottom, height, color, x, y, z, parent = scene) {
    const key = `cylinder:${top}:${bottom}:${height}`;

    if (!geometries.has(key)) {
      geometries.set(key, new THREE.CylinderGeometry(top, bottom, height, 20));
    }

    return addMesh(geometries.get(key), material(color), [x, y, z], parent);
  }

  function tube(points, radius, color, parent = scene) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(...point))
    );
    const geometry = new THREE.TubeGeometry(curve, 20, radius, 7, false);
    return addMesh(geometry, material(color), [0, 0, 0], parent);
  }

  function createTexture(draw, width = 512, height = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext("2d"), width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  function label(text, width, height, background, foreground, parent = scene) {
    const texture = createTexture((context, w, h) => {
      context.fillStyle = background;
      context.fillRect(0, 0, w, h);
      context.fillStyle = foreground;
      context.font = "600 65px 'Segoe UI', sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      const lines = text.split("\n");
      const lineHeight = 76;

      lines.forEach((line, index) => {
        const offset = (index - (lines.length - 1) / 2) * lineHeight;
        context.fillText(line, w / 2, h / 2 + offset, w - 35);
      });
    });
    const surface = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), surface);
    parent.add(mesh);
    return mesh;
  }

  function obstacle(x, z, width, depth) {
    obstacles.push({ x, z, width, depth });
  }

  // ---------- Ruangan: lantai kayu, dinding, dan jendela ----------

  function createRoom() {
    box(12.6, 0.42, 9.6, 0xbda686, 0, -0.23, 0);
    box(12.45, 0.12, 9.45, 0xe2caa5, 0, 0.02, 0);

    for (let row = 0; row < 18; row += 1) {
      const z = -4.45 + row * 0.52;
      const color = row % 3 === 0 ? 0xddc29a : 0xe5cfac;
      box(12.2, 0.018, 0.505, color, 0, 0.087, z);

      for (let column = 0; column < 4; column += 1) {
        const x = -4.6 + column * 3.0 + (row % 2) * 1.1;
        box(0.012, 0.008, 0.49, 0xd4b98f, x, 0.101, z);
      }
    }

    const back = new THREE.Group();
    scene.add(back);
    wallGroups.push({ group: back, axis: "z" });

    box(12.5, 0.9, 0.18, 0xe8e3cf, 0, 0.55, -4.7, back);
    box(12.5, 0.3, 0.2, 0xe8e3cf, 0, 3.45, -4.7, back);
    box(3.2, 2.3, 0.18, 0xe8e3cf, -4.65, 2.1, -4.7, back);
    box(3.2, 2.3, 0.18, 0xe8e3cf, 4.65, 2.1, -4.7, back);
    box(12.5, 0.13, 0.26, 0xa6b09a, 0, 0.2, -4.55, back);
    box(12.5, 0.1, 0.28, 0xf8f0da, 0, 3.62, -4.7, back);

    const sky = new THREE.MeshBasicMaterial({ color: 0xc7dcd9 });
    windowMaterials.push(sky);
    addMesh(new THREE.PlaneGeometry(6.0, 2.4), sky, [0, 2.1, -4.85], back);

    for (const x of [-2.9, -1.0, 0.95, 2.9]) {
      box(0.09, 2.46, 0.17, 0xf8f0da, x, 2.1, -4.5, back);
    }

    box(5.9, 0.09, 0.16, 0xf8f0da, 0, 2.35, -4.49, back);
    box(6.1, 0.13, 0.38, 0xf8f0da, 0, 0.98, -4.46, back);

    // Tumbuhan di luar jendela memakai bentuk sederhana, tanpa gambar eksternal.
    for (const x of [-2.0, 0.4, 2.0]) {
      sphere(0.66, 0x9daf94, x, 1.35, -4.71, back, [0.9, 1.4, 0.08]);
      sphere(0.48, 0xb4c4a5, x + 0.4, 1.1, -4.69, back, [1, 1.5, 0.09]);
    }

    const left = new THREE.Group();
    scene.add(left);
    wallGroups.push({ group: left, axis: "x" });
    box(0.18, 3.6, 9.4, 0xb9c4ab, -6.2, 1.87, 0, left);
    box(0.25, 0.12, 9.4, 0xe7e4d2, -6.12, 0.2, 0, left);
    box(0.28, 0.10, 9.5, 0xd6dcc9, -6.2, 3.7, 0, left);

    const wallLogo = label("pawffice.", 2.5, 0.65, "#e8e3cf", "#4b6250", back);
    wallLogo.position.set(-4.55, 2.95, -4.59);
    createPinboard(-4.55, 1.87, -4.52, back);
    createWallClock(4.55, 2.8, -4.5, back);

    const art = new THREE.Group();
    art.position.set(-6.075, 2.3, 1.1);
    art.rotation.y = Math.PI / 2;
    left.add(art);
    box(1.3, 1.6, 0.07, 0xe8d6b6, 0, 0, 0, art);
    const print = label("MAKE\nROOM", 1.13, 1.4, "#f3efdf", "#576d55", art);
    print.position.z = 0.045;
    sphere(0.28, 0xc38d67, 0, -0.28, 0.07, art, [1, 0.85, 0.07]);

    createPlant(-5.35, -3.75, 1.22);
    createPlant(5.35, 3.65, 1.25);
    createPlant(-5.28, 3.9, 0.75);

    // Hanya hamparan bayangan, dengan latar mengikuti tema CSS halaman.
    const shadowGround = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 150),
      new THREE.ShadowMaterial({ opacity: 0.10 })
    );
    shadowGround.rotation.x = -Math.PI / 2;
    shadowGround.position.y = -0.48;
    shadowGround.receiveShadow = true;
    scene.add(shadowGround);
  }

  function createPinboard(x, y, z, parent) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    parent.add(group);
    box(2.45, 1.15, 0.10, 0xd0b58d, 0, 0, 0, group);
    box(2.29, 1.0, 0.03, 0xb9956e, 0, 0, 0.07, group);

    const colors = [0xeee1aa, 0xc4d2b7, 0xe5b2a0, 0xf0e9d4];

    for (let i = 0; i < 6; i += 1) {
      const note = box(
        0.45, 0.33, 0.015, colors[i % 4],
        -0.75 + (i % 3) * 0.72,
        i < 3 ? 0.22 : -0.23,
        0.1,
        group
      );
      note.rotation.z = (i % 2 ? 1 : -1) * 0.09;
    }
  }

  function createWallClock(x, y, z, parent) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    parent.add(group);
    const face = cylinder(0.37, 0.37, 0.08, 0xf6efdf, 0, 0, 0, group);
    face.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.37, 0.035, 8, 32),
      material(0x596c58)
    );
    rim.position.z = 0.05;
    group.add(rim);

    for (let i = 0; i < 12; i += 1) {
      const angle = i * Math.PI / 6;
      sphere(0.013, 0x687561,
        Math.sin(angle) * 0.29,
        Math.cos(angle) * 0.29,
        0.07,
        group
      );
    }

    clockMinute = new THREE.Group();
    clockHour = new THREE.Group();
    group.add(clockMinute, clockHour);
    box(0.025, 0.26, 0.018, 0x53624e, 0, 0.1, 0.08, clockMinute);
    box(0.035, 0.18, 0.018, 0x53624e, 0, 0.06, 0.10, clockHour);
    sphere(0.036, 0xc69362, 0, 0, 0.13, group);
  }

  function createPlant(x, z, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0.10, z);
    group.scale.setScalar(scale);
    scene.add(group);
    cylinder(0.30, 0.23, 0.45, 0xd8b58e, 0, 0.23, 0, group);
    cylinder(0.31, 0.31, 0.07, 0xe2c5a4, 0, 0.46, 0, group);
    cylinder(0.265, 0.265, 0.015, 0x625340, 0, 0.5, 0, group);

    for (let i = 0; i < 7; i += 1) {
      const angle = i * 2.4;
      const leaf = sphere(
        0.24,
        i % 2 ? 0x7e9a68 : 0x5c8056,
        Math.sin(angle) * 0.26,
        0.85 + (i % 3) * 0.22,
        Math.cos(angle) * 0.26,
        group,
        [0.55, 1.65, 0.65]
      );
      leaf.rotation.z = Math.sin(angle) * 0.65;
      leaf.rotation.x = Math.cos(angle) * 0.65;
    }

    obstacle(x, z, 0.70 * scale, 0.70 * scale);
  }

  // ---------- Meja kerja dan area santai ----------

  function createMonitor(design, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 1.0, z);
    group.rotation.y = design ? -0.18 : 0.18;
    scene.add(group);
    box(0.52, 0.055, 0.34, 0x5b635b, 0, 0, 0, group);
    box(0.075, 0.27, 0.075, 0x5b635b, 0, 0.14, 0, group);
    box(1.05, 0.67, 0.08, 0x47554d, 0, 0.57, 0, group);

    const texture = createTexture((context, w, h) => {
      context.fillStyle = design ? "#e7dfc8" : "#263c36";
      context.fillRect(0, 0, w, h);
      context.fillStyle = design ? "#486b5a" : "#314b43";
      context.fillRect(0, 0, w, 30);

      for (let i = 0; i < 3; i += 1) {
        context.fillStyle = ["#d39c79", "#d7bf78", "#9bb19a"][i];
        context.beginPath();
        context.arc(18 + i * 16, 15, 4, 0, Math.PI * 2);
        context.fill();
      }

      if (design) {
        context.fillStyle = "#faf5e6";
        context.fillRect(22, 47, 298, 187);
        context.fillStyle = "#c68d64";
        context.beginPath();
        context.arc(170, 125, 60, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#879d77";
        context.fillRect(75, 137, 175, 63);

        for (let i = 0; i < 4; i += 1) {
          context.fillStyle = ["#c68d64", "#879d77", "#e6cf9b", "#536c5b"][i];
          context.fillRect(345, 52 + i * 43, 130, 28);
        }
      } else {
        const lengths = [230, 320, 180, 280, 350, 230, 270, 170];

        lengths.forEach((length, i) => {
          context.fillStyle = i % 3 ? "#b6c8ab" : "#d7af7e";
          context.fillRect(32 + (i % 3) * 18, 52 + i * 23, length, 8);
        });
      }
    });

    const screenSurface = new THREE.MeshBasicMaterial({ map: texture });
    const screen = addMesh(
      new THREE.PlaneGeometry(0.94, 0.55),
      screenSurface,
      [0, 0.57, -0.047],
      group
    );
    screen.rotation.y = Math.PI;

    // Logo kecil di belakang monitor, terlihat dari kamera utama.
    sphere(0.06, 0xaab5a4, 0, 0.57, 0.049, group, [1, 1, 0.12]);
  }

  function createDesk(data, index) {
    const x = data.desk.x;
    const z = -0.96;
    const wood = 0xe4ccaa;
    box(2.8, 0.15, 1.25, wood, x, 0.98, z);
    box(2.7, 0.08, 1.17, 0xcfb18a, x, 0.88, z);

    for (const side of [-1, 1]) {
      box(0.09, 0.82, 0.93, 0x65735e, x + side * 1.18, 0.51, z);
    }

    obstacle(x, z, 2.85, 1.29);
    createMonitor(index === 1, x - 0.35, z - 0.14);
    box(0.8, 0.035, 0.27, 0xdddcd0, x - 0.32, 1.08, z - 0.43);

    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 9; column += 1) {
        box(0.055, 0.013, 0.035, 0xc2c6b8,
          x - 0.63 + column * 0.076,
          1.105,
          z - 0.51 + row * 0.066
        );
      }
    }

    sphere(0.09, 0xf2ead7, x + 0.25, 1.10, z - 0.42, scene, [0.7, 0.4, 1]);
    createMug(x + 0.91, 1.075, z - 0.25, data.accent);
    box(0.45, 0.045, 0.54, data.accent, x + 0.75, 1.08, z + 0.22);
    box(0.40, 0.018, 0.49, 0xf6eed9, x + 0.75, 1.11, z + 0.22);

    const plate = label(data.name.toUpperCase(), 0.55, 0.17, "#e4ccaa", "#5e6c56");
    plate.position.set(x + 0.55, 0.98, z + 0.637);
    createChair(x, data.desk.z, index ? 0x9eaa8d : 0xb69672);
  }

  function createChair(x, z, color) {
    cylinder(0.08, 0.08, 0.42, 0x5c655b, x, 0.32, z);
    box(0.72, 0.13, 0.68, color, x, 0.56, z);
    box(0.70, 0.67, 0.12, color, x, 0.95, z - 0.31);

    for (let i = 0; i < 5; i += 1) {
      const angle = i * Math.PI * 2 / 5;
      const foot = box(0.09, 0.065, 0.45, 0x5c655b,
        x + Math.sin(angle) * 0.14,
        0.14,
        z + Math.cos(angle) * 0.14
      );
      foot.rotation.y = angle;
      sphere(0.055, 0x424e45,
        x + Math.sin(angle) * 0.32,
        0.13,
        z + Math.cos(angle) * 0.32
      );
    }
  }

  function createMug(x, y, z, color, parent = scene) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    parent.add(group);
    cylinder(0.10, 0.085, 0.19, color, 0, 0.10, 0, group);
    cylinder(0.083, 0.083, 0.01, 0x67503c, 0, 0.20, 0, group);
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.07, 0.021, 7, 16),
      material(color)
    );
    handle.position.set(0.11, 0.11, 0);
    group.add(handle);
    return group;
  }

  function createCoffeeCorner() {
    box(2.05, 0.94, 0.85, 0x91a082, 4.8, 0.59, -3.6);
    box(2.17, 0.12, 0.97, 0xe2c9a5, 4.8, 1.10, -3.6);

    for (const x of [4.30, 5.30]) {
      box(0.91, 0.74, 0.03, 0xa1ad91, x, 0.57, -3.155);
      box(0.13, 0.035, 0.04, 0x5d7059, x + 0.22, 0.76, -3.12);
    }

    box(0.62, 0.59, 0.49, 0x4b5a51, 4.45, 1.46, -3.57);
    box(0.51, 0.06, 0.36, 0xb7b9a5, 4.45, 1.20, -3.43);
    box(0.12, 0.06, 0.08, 0xe1d8bc, 4.45, 1.53, -3.29);
    sphere(0.026, 0xb5cf96, 4.61, 1.65, -3.31);
    createMug(4.45, 1.23, -3.35, 0xeedcba);
    createMug(5.27, 1.18, -3.50, 0xbd8868);
    cylinder(0.13, 0.13, 0.33, 0xe3ccb0, 5.55, 1.35, -3.65);

    const coffeeLabel = label("BUT FIRST, COFFEE", 1.9, 0.35, "#e8e3cf", "#708168");
    coffeeLabel.position.set(4.65, 2.16, -4.58);
    obstacle(4.8, -3.6, 2.10, 0.90);

    for (let i = 0; i < 4; i += 1) {
      const puff = sphere(0.06, 0xf7f2df, 4.45, 1.65 + i * 0.16, -3.35);
      puff.material = new THREE.MeshBasicMaterial({
        color: 0xf7f2df,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      });
      steamPuffs.push({ mesh: puff, offset: i / 4 });
    }
  }

  function createLounge() {
    // Karpet meja kerja dengan jahitan di pinggirnya.
    box(8.3, 0.022, 3.85, 0xb0b99b, -0.3, 0.115, -1.05);

    for (const z of [-2.88, 0.78]) {
      box(8.08, 0.006, 0.025, 0xcbd1b8, -0.3, 0.13, z);
    }

    // Sofa dan bantal di sisi kiri.
    box(1.23, 0.40, 2.35, 0xb48767, -4.87, 0.42, 1.75);
    box(1.13, 0.24, 1.90, 0xceaa86, -4.82, 0.68, 1.75);
    box(0.25, 0.85, 2.35, 0xc09b76, -5.43, 0.78, 1.75);

    for (const z of [0.64, 2.86]) {
      box(1.2, 0.61, 0.22, 0xc09b76, -4.88, 0.76, z);
    }

    const pillow = box(0.27, 0.51, 0.55, 0xe9d8b5, -5.09, 1.02, 1.1);
    pillow.rotation.x = 0.16;
    obstacle(-4.87, 1.75, 1.35, 2.40);

    cylinder(0.55, 0.55, 0.10, 0xd5b98f, -3.20, 0.64, 2.2);
    cylinder(0.13, 0.20, 0.5, 0x748568, -3.20, 0.35, 2.2);
    box(0.34, 0.035, 0.42, 0x748568, -3.18, 0.72, 2.2);
    obstacle(-3.20, 2.2, 1.1, 1.1);

    // Karpet lingkaran, meja rapat, dan dua bangku bundar.
    cylinder(1.85, 1.85, 0.018, 0xd4bba0, 1.7, 0.12, 2.25);
    cylinder(0.93, 0.93, 0.13, 0xe7d2af, 1.7, 0.95, 2.15);
    cylinder(0.14, 0.30, 0.77, 0x819070, 1.7, 0.52, 2.15);
    obstacle(1.7, 2.15, 1.82, 1.82);

    for (const x of [0.2, 3.2]) {
      cylinder(0.34, 0.34, 0.13, 0x93a185, x, 0.54, 2.85);
      cylinder(0.08, 0.15, 0.39, 0x687a5e, x, 0.29, 2.85);
    }

    createMug(1.4, 1.025, 2.10, 0xbd8868);
    box(0.46, 0.025, 0.36, 0x8b9b7e, 1.9, 1.04, 2.25);

    // Lampu lantai menyala ketika suasana berubah malam.
    cylinder(0.27, 0.30, 0.06, 0x596b53, -5.25, 0.15, -0.1);
    cylinder(0.025, 0.025, 2.5, 0x596b53, -5.25, 1.4, -0.1);
    const shade = cylinder(0.28, 0.47, 0.45, 0xeee0be, -5.25, 2.65, -0.1);
    shade.material = material(0xeee0be, {
      emissive: 0xe4b064,
      emissiveIntensity: 0.05,
    }).clone();
    lampMaterials.push(shade.material);
    obstacle(-5.25, -0.1, 0.45, 0.45);

    const meetingText = label("good things take a team.", 2.6, 0.36, "#e2caa5", "#9c8668");
    meetingText.rotation.x = -Math.PI / 2;
    meetingText.position.set(1.7, 0.112, 4.15);
  }

  // ---------- Avatar: kepala, telinga, kumis, baju, dan kartu pegawai ----------

  function createEar(color, x, angle, parent) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.19, 0);
    shape.lineTo(0, 0.43);
    shape.lineTo(0.19, 0);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 2,
    });
    const ear = new THREE.Group();
    ear.position.set(x, 0.23, -0.01);
    ear.rotation.z = angle;
    parent.add(ear);
    addMesh(geometry, material(color), [0, 0, 0], ear);

    const inner = new THREE.Mesh(geometry, material(0xd7a09a));
    inner.scale.set(0.58, 0.63, 0.2);
    inner.position.set(0, 0.065, 0.145);
    ear.add(inner);
  }

  function createCat(data) {
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);
    root.position.copy(data.desk);
    root.position.y = 0.10;
    scene.add(root);

    sphere(0.38, data.shirt, 0, 1.02, 0, body, [1, 1.2, 0.77]);
    sphere(0.32, data.pants, 0, 0.73, -0.01, body, [1, 0.52, 0.79]);
    cylinder(0.16, 0.17, 0.13, data.patch, 0, 1.40, 0, body);

    // Kerah dan dasi dibuat dari objek terpisah agar mudah diedit.
    const collarLeft = box(0.17, 0.13, 0.045, 0xfaf4e6, -0.095, 1.34, 0.27, body);
    const collarRight = box(0.17, 0.13, 0.045, 0xfaf4e6, 0.095, 1.34, 0.27, body);
    collarLeft.rotation.z = -0.40;
    collarRight.rotation.z = 0.40;

    if (data.id === "miko") {
      box(0.10, 0.11, 0.045, data.accent, 0, 1.28, 0.30, body);
      const tie = box(0.12, 0.30, 0.035, data.accent, 0, 1.08, 0.30, body);
      tie.rotation.z = 0.05;
    } else {
      box(0.20, 0.49, 0.055, 0xf5edda, 0, 1.05, 0.283, body);

      for (const x of [-0.16, 0.16]) {
        const cord = box(0.018, 0.44, 0.023, 0xd5ab7f, x / 2, 1.12, 0.32, body);
        cord.rotation.z = x > 0 ? -0.28 : 0.28;
      }
    }

    box(0.15, 0.19, 0.026, 0xf8f2df, 0.20, 0.99, 0.30, body);
    box(0.10, 0.025, 0.01, data.accent, 0.20, 1.04, 0.32, body);
    box(0.05, 0.05, 0.01, data.fur, 0.18, 0.98, 0.32, body);

    const head = new THREE.Group();
    head.position.set(0, 1.68, 0);
    body.add(head);
    sphere(0.43, data.fur, 0, 0, 0, head, [1.04, 0.94, 0.93]);
    createEar(data.fur, -0.29, 0.15, head);
    createEar(data.fur, 0.29, -0.15, head);

    sphere(0.28, data.patch, 0, -0.12, 0.29, head, [1.03, 0.72, 0.51]);
    sphere(0.13, 0xf6e8d2, -0.10, -0.12, 0.385, head, [1, 0.66, 0.5]);
    sphere(0.13, 0xf6e8d2, 0.10, -0.12, 0.385, head, [1, 0.66, 0.5]);
    sphere(0.047, 0xb57b76, 0, -0.073, 0.44, head, [1, 0.66, 0.6]);

    tube([[0, -0.10, 0.44], [0, -0.17, 0.443], [-0.05, -0.19, 0.43]],
      0.009, 0x73594b, head);
    tube([[0, -0.17, 0.443], [0.035, -0.19, 0.44], [0.06, -0.17, 0.43]],
      0.009, 0x73594b, head);

    const eyes = [];

    for (const sign of [-1, 1]) {
      const eye = new THREE.Group();
      eye.position.set(sign * 0.175, 0.047, 0.361);
      head.add(eye);
      sphere(0.075, 0x2b3a32, 0, 0, 0, eye, [0.85, 1.08, 0.52]);
      sphere(0.021, 0xfff8e9, -0.016, 0.025, 0.037, eye);
      eyes.push(eye);
      sphere(0.067, 0xd69a86, sign * 0.29, -0.078, 0.316, head, [1, 0.43, 0.19]);

      for (let i = 0; i < 3; i += 1) {
        tube([
          [sign * 0.21, -0.11 - i * 0.033, 0.383],
          [sign * 0.37, -0.09 - i * 0.052, 0.36],
          [sign * 0.49, -0.065 - i * 0.075, 0.30],
        ], 0.006, 0x796d5f, head);
      }
    }

    // Tiga garis khas kucing tabby di dahi.
    for (let i = -1; i <= 1; i += 1) {
      const stripe = box(0.043, 0.12, 0.018, data.darkFur,
        i * 0.1, 0.24, 0.326, head);
      stripe.rotation.z = -i * 0.18;
    }

    if (data.id === "miko") {
      for (const sign of [-1, 1]) {
        const glasses = new THREE.Mesh(
          new THREE.TorusGeometry(0.12, 0.012, 7, 28),
          material(0x55664e)
        );
        glasses.position.set(sign * 0.175, 0.045, 0.412);
        head.add(glasses);
      }

      box(0.11, 0.016, 0.018, 0x55664e, 0, 0.065, 0.417, head);
    }

    const arms = [];
    const legs = [];
    let heldMug;

    for (const sign of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(sign * 0.37, 1.30, 0);
      body.add(arm);
      cylinder(0.13, 0.12, 0.30, data.shirt, 0, -0.12, 0, arm);
      cylinder(0.10, 0.10, 0.24, data.fur, 0, -0.36, 0, arm);
      sphere(0.115, data.patch, 0, -0.49, 0, arm);
      arms.push(arm);

      if (sign === 1) {
        heldMug = createMug(0, -0.49, 0.07, data.accent, arm);
        heldMug.visible = false;
      }

      const leg = new THREE.Group();
      leg.position.set(sign * 0.17, 0.70, 0);
      body.add(leg);
      cylinder(0.13, 0.115, 0.43, data.pants, 0, -0.20, 0, leg);
      sphere(0.14, 0x444d43, 0, -0.43, 0.06, leg, [0.94, 0.55, 1.35]);
      legs.push(leg);
    }

    const tail = new THREE.Group();
    tail.position.set(0, 0.75, -0.21);
    body.add(tail);
    tube([
      [0, 0, 0],
      [0.22, -0.05, -0.40],
      [0.52, 0.15, -0.58],
      [0.57, 0.55, -0.42],
    ], 0.09, data.fur, tail);
    sphere(0.094, data.darkFur, 0.57, 0.55, -0.42, tail);

    const speech = createSpeech(data.id === "miko" ? "one paw at a time." : "ideas need naps.");
    speech.position.set(0, 2.66, 0);
    root.add(speech);

    root.traverse((object) => {
      if (object.isMesh) {
        object.userData.catId = data.id;
      }
    });

    const cat = {
      data,
      root,
      body,
      head,
      eyes,
      arms,
      legs,
      heldMug,
      tail,
      speech,
      mode: "work",
      activity: "work",
      task: data.tasks[0],
      route: [],
      energy: data.id === "miko" ? 92 : 88,
      mood: data.id === "miko" ? 94 : 97,
      timer: data.id === "miko" ? 32 : 43,
      workProgress: 0,
      facing: 0,
      phase: cats.length * 2.7,
      portrait: "",
    };
    cats.push(cat);
    return cat;
  }

  function createSpeech(text) {
    const texture = createTexture((context, w, h) => {
      context.fillStyle = "#f9f5e8";
      context.beginPath();
      context.roundRect(4, 4, w - 8, h - 30, 40);
      context.fill();
      context.beginPath();
      context.moveTo(w / 2 - 25, h - 35);
      context.lineTo(w / 2, h);
      context.lineTo(w / 2 + 25, h - 35);
      context.fill();
      context.fillStyle = "#5b6b55";
      context.font = "500 32px 'Segoe UI', sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, w / 2, h / 2 - 10);
    }, 512, 140);
    const surface = new THREE.SpriteMaterial({
      map: texture,
      depthWrite: false,
      transparent: true,
    });
    const sprite = new THREE.Sprite(surface);
    sprite.scale.set(2.0, 0.55, 1);
    sprite.visible = false;
    return sprite;
  }

  function createPortraits() {
    const portraitRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    portraitRenderer.setSize(180, 210);
    portraitRenderer.setPixelRatio(1);
    portraitRenderer.outputColorSpace = THREE.SRGBColorSpace;
    portraitRenderer.toneMapping = THREE.ACESFilmicToneMapping;

    for (const cat of cats) {
      const portraitScene = new THREE.Scene();
      portraitScene.background = new THREE.Color(cat.data.portrait);
      const portraitCamera = new THREE.OrthographicCamera(-0.68, 0.68, 0.79, -0.79, 0.1, 20);
      portraitCamera.position.set(0.38, 1.92, 5);
      portraitCamera.lookAt(0, 1.53, 0);
      portraitScene.add(new THREE.HemisphereLight(0xfff4df, 0x8b9d8b, 2.5));
      const key = new THREE.DirectionalLight(0xffefd7, 2.5);
      key.position.set(-3, 5, 4);
      portraitScene.add(key);

      const model = cat.body.clone(true);
      model.rotation.y = -0.10;
      portraitScene.add(model);
      portraitRenderer.render(portraitScene, portraitCamera);
      cat.portrait = portraitRenderer.domElement.toDataURL("image/png");
      $(`portrait-${cat.data.id}`).src = cat.portrait;
    }

    portraitRenderer.dispose();
    portraitRenderer.forceContextLoss();
  }

  // ---------- Navigasi A*: cari jalur yang tidak menembus furnitur ----------

  const navigation = {
    minX: -5.72,
    minZ: -4.12,
    step: 0.34,
    columns: 34,
    rows: 25,
    radius: 0.29,
  };

  function blocked(x, z) {
    if (x < -5.85 || x > 5.85 || z < -4.25 || z > 4.25) {
      return true;
    }

    return obstacles.some((item) => {
      const paddedWidth = item.width / 2 + navigation.radius;
      const paddedDepth = item.depth / 2 + navigation.radius;
      return Math.abs(x - item.x) < paddedWidth
        && Math.abs(z - item.z) < paddedDepth;
    });
  }

  function segmentClear(start, end) {
    const distance = Math.hypot(end.x - start.x, end.z - start.z);
    const samples = Math.max(1, Math.ceil(distance / 0.09));

    for (let i = 1; i <= samples; i += 1) {
      const t = i / samples;
      const x = start.x + (end.x - start.x) * t;
      const z = start.z + (end.z - start.z) * t;

      if (blocked(x, z)) {
        return false;
      }
    }

    return true;
  }

  class MinHeap {
    constructor() {
      this.items = [];
    }

    push(value) {
      const items = this.items;
      items.push(value);
      let index = items.length - 1;

      while (index > 0) {
        const parent = (index - 1) >> 1;

        if (items[parent].score <= value.score) {
          break;
        }

        items[index] = items[parent];
        index = parent;
      }

      items[index] = value;
    }

    pop() {
      const items = this.items;
      const first = items[0];
      const last = items.pop();

      if (items.length > 0) {
        let index = 0;

        while (index * 2 + 1 < items.length) {
          const left = index * 2 + 1;
          const right = left + 1;
          let child = left;

          if (right < items.length && items[right].score < items[left].score) {
            child = right;
          }

          if (items[child].score >= last.score) {
            break;
          }

          items[index] = items[child];
          index = child;
        }

        items[index] = last;
      }

      return first;
    }
  }

  function findPath(start, end) {
    if (blocked(end.x, end.z)) {
      return [];
    }

    if (segmentClear(start, end)) {
      return [end.clone()];
    }

    const grid = navigation;
    const count = grid.columns * grid.rows;
    const point = (index) => new THREE.Vector3(
      grid.minX + (index % grid.columns) * grid.step,
      0,
      grid.minZ + Math.floor(index / grid.columns) * grid.step
    );
    const walkable = new Uint8Array(count);

    for (let i = 0; i < count; i += 1) {
      const position = point(i);
      walkable[i] = blocked(position.x, position.z) ? 0 : 1;
    }

    function nearest(position) {
      let bestIndex = -1;
      let bestDistance = Infinity;

      for (let i = 0; i < count; i += 1) {
        if (!walkable[i]) {
          continue;
        }

        const candidate = point(i);
        const distance = Math.hypot(
          candidate.x - position.x,
          candidate.z - position.z
        );

        if (distance < bestDistance && segmentClear(position, candidate)) {
          bestIndex = i;
          bestDistance = distance;
        }
      }

      return bestIndex;
    }

    const first = nearest(start);
    const last = nearest(end);

    if (first < 0 || last < 0) {
      return [];
    }

    const open = new MinHeap();
    const costs = new Float32Array(count).fill(Infinity);
    const parents = new Int32Array(count).fill(-1);
    const closed = new Uint8Array(count);
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];
    const destination = point(last);

    costs[first] = 0;
    open.push({ index: first, score: 0 });

    while (open.items.length > 0) {
      const current = open.pop().index;

      if (closed[current]) {
        continue;
      }

      if (current === last) {
        const route = [end.clone()];
        let cursor = last;

        while (cursor !== -1) {
          route.push(point(cursor));
          cursor = parents[cursor];
        }

        route.push(new THREE.Vector3(start.x, 0, start.z));
        route.reverse();
        const simplified = [route[0]];

        for (let i = 1; i < route.length; i += 1) {
          const previous = simplified[simplified.length - 1];

          if (i === route.length - 1 || !segmentClear(previous, route[i + 1])) {
            simplified.push(route[i]);
          }
        }

        return simplified;
      }

      closed[current] = 1;
      const column = current % grid.columns;
      const row = Math.floor(current / grid.columns);

      for (const [dx, dz] of directions) {
        const nextX = column + dx;
        const nextZ = row + dz;

        if (nextX < 0 || nextX >= grid.columns || nextZ < 0 || nextZ >= grid.rows) {
          continue;
        }

        const next = nextZ * grid.columns + nextX;

        if (!walkable[next] || closed[next]) {
          continue;
        }

        if (dx && dz) {
          const sideX = row * grid.columns + nextX;
          const sideZ = nextZ * grid.columns + column;

          if (!walkable[sideX] || !walkable[sideZ]) {
            continue;
          }
        }

        const nextPoint = point(next);

        if (!segmentClear(point(current), nextPoint)) {
          continue;
        }

        const cost = costs[current] + Math.hypot(dx, dz);

        if (cost >= costs[next]) {
          continue;
        }

        costs[next] = cost;
        parents[next] = current;
        const heuristic = Math.hypot(
          destination.x - nextPoint.x,
          destination.z - nextPoint.z
        ) / grid.step;
        open.push({ index: next, score: cost + heuristic });
      }
    }

    return [];
  }

  function navigate(cat, activity) {
    const index = cats.indexOf(cat);
    const targets = {
      work: cat.data.desk,
      coffee: new THREE.Vector3(3.85 + index * 0.95, 0, -2.45),
      lounge: new THREE.Vector3(-3.70, 0, 0.95 + index * 0.18),
      meeting: new THREE.Vector3(index === 0 ? 0.05 : 3.35, 0, 2.65),
    };
    const route = findPath(cat.root.position, targets[activity]);

    if (!route.length) {
      toast(`${cat.data.name} belum menemukan jalan. Coba aktivitas lain.`);
      return false;
    }

    cat.route = route;
    cat.mode = "walk";
    cat.activity = activity;
    cat.task = {
      work: "Kembali ke meja",
      coffee: "Menuju coffee corner",
      lounge: "Cari inspirasi sebentar",
      meeting: "Menuju meja diskusi",
    }[activity];
    return true;
  }

  function arrive(cat) {
    cat.mode = cat.activity;
    cat.timer = cat.mode === "work" ? 28 + Math.random() * 22 : 8 + Math.random() * 5;
    cat.task = {
      work: cat.data.tasks[Math.floor(Math.random() * cat.data.tasks.length)],
      coffee: "Menikmati kopi hangat",
      lounge: "Mengumpulkan inspirasi",
      meeting: "Tukar ide bareng tim",
    }[cat.mode];

    if (cat.mode === "work") {
      cat.facing = 0;
    } else if (cat.mode === "coffee") {
      cat.facing = Math.PI;
      simulation.coffee = true;
      addEvent(cat.data.name, "menemukan kebahagiaan dalam secangkir kopi.");
    } else if (cat.mode === "meeting") {
      cat.facing = cats.indexOf(cat) === 0 ? Math.PI / 2 : -Math.PI / 2;
      addEvent(cat.data.name, "siap bertukar ide di meja diskusi.");
    } else {
      cat.facing = -Math.PI / 2;
      addEvent(cat.data.name, "istirahat sebentar. Ide juga perlu ruang.");
    }
  }

  function moveCat(cat, dt) {
    if (cat.route.length === 0) {
      arrive(cat);
      return;
    }

    const position = cat.root.position;
    const target = cat.route[0];
    const dx = target.x - position.x;
    const dz = target.z - position.z;
    const distance = Math.hypot(dx, dz);
    const speed = cat.data.id === "miko" ? 1.12 : 1.27;
    const step = Math.min(distance, speed * dt);

    if (distance < 0.08) {
      cat.route.shift();
      return;
    }

    let nextX = position.x + dx / distance * step;
    let nextZ = position.z + dz / distance * step;

    // Sedikit mengalah ketika dua kucing berpapasan.
    for (const other of cats) {
      if (other === cat) {
        continue;
      }

      const gap = Math.hypot(nextX - other.root.position.x, nextZ - other.root.position.z);

      if (gap < 0.62) {
        nextX = position.x - dz / distance * step;
        nextZ = position.z + dx / distance * step;
      }
    }

    if (segmentClear(position, { x: nextX, z: nextZ })) {
      position.x = nextX;
      position.z = nextZ;
    }

    cat.facing = Math.atan2(dx, dz);
  }

  // ---------- Kebutuhan karakter dan jadwal sederhana ----------

  function updateSimulation(dt) {
    if (dt <= 0) {
      return;
    }

    simulation.elapsed += dt;
    simulation.minutes += dt * 0.8;

    if (simulation.minutes >= 17 * 60) {
      simulation.minutes = 9 * 60;
      simulation.day += 1;
      addEvent("Kantor", "memulai hari baru. Semoga banyak ide bagus!");
    }

    if (cats.some((cat) => cat.mode === "work")) {
      simulation.focusSeconds += dt;
    }

    for (const cat of cats) {
      if (cat.mode === "walk") {
        moveCat(cat, dt);
        cat.energy = Math.max(20, cat.energy - dt * 0.12);
      } else {
        cat.timer -= dt;

        if (cat.mode === "work") {
          cat.energy = Math.max(20, cat.energy - dt * 0.17);
          cat.mood = Math.max(45, cat.mood - dt * 0.025);
          cat.workProgress += dt;

          if (cat.workProgress > 18) {
            cat.workProgress = 0;
            cat.task = cat.data.tasks[Math.floor(Math.random() * cat.data.tasks.length)];
          }
        } else {
          cat.energy = Math.min(100, cat.energy + dt * 1.15);
          cat.mood = Math.min(100, cat.mood + dt * 0.48);
        }

        if (cat.timer <= 0) {
          if (cat.mode === "work") {
            navigate(cat, cat.data.id === "miko" ? "coffee" : "lounge");
          } else {
            navigate(cat, "work");
          }
        }
      }
    }

    checkMissions();
  }

  function animateCat(cat, dt) {
    const t = simulation.elapsed + cat.phase;
    const walking = cat.mode === "walk";
    const working = cat.mode === "work";
    const targetY = walking ? 0.105 + Math.sin(t * 12) * 0.035 : 0.10;
    const blend = 1 - Math.exp(-12 * dt);
    cat.root.position.y = THREE.MathUtils.lerp(cat.root.position.y, targetY, blend);

    const angle = Math.atan2(
      Math.sin(cat.facing - cat.root.rotation.y),
      Math.cos(cat.facing - cat.root.rotation.y)
    );
    cat.root.rotation.y += angle * blend;
    cat.body.rotation.z = Math.sin(t * (walking ? 10 : 1.7)) * (walking ? 0.035 : 0.012);
    cat.head.rotation.y = working ? Math.sin(t * 0.7) * 0.10 : Math.sin(t * 0.9) * 0.15;
    cat.head.rotation.x = working ? 0.08 : Math.sin(t * 1.3) * 0.025;
    cat.tail.rotation.y = Math.sin(t * 2.2) * 0.25;
    cat.heldMug.visible = cat.mode === "coffee";
    cat.heldMug.rotation.x = -cat.arms[1].rotation.x;

    cat.arms.forEach((arm, index) => {
      let target;

      if (walking) {
        target = Math.sin(t * 9 + index * Math.PI) * 0.45;
      } else if (working) {
        target = -1.0 + Math.sin(t * 9 + index * 2) * 0.09;
      } else if (cat.mode === "meeting") {
        target = -0.35 + Math.sin(t * 3 + index) * 0.35;
      } else if (cat.mode === "coffee" && index === 1) {
        target = -1.3 + Math.sin(t * 1.8) * 0.12;
      } else {
        target = -0.10;
      }

      arm.rotation.x = THREE.MathUtils.lerp(arm.rotation.x, target, blend);
      arm.rotation.z = index === 0 ? -0.07 : 0.07;
    });

    cat.legs.forEach((leg, index) => {
      let target = 0;

      if (walking) {
        target = Math.sin(t * 9 + index * Math.PI) * 0.55;
      } else if (working) {
        target = -1.15;
      }

      leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, target, blend);
    });

    const blinkPhase = t % 4.7;
    const blink = blinkPhase > 4.50 && blinkPhase < 4.66;

    for (const eye of cat.eyes) {
      eye.scale.y = blink ? 0.12 : 1;
    }

    cat.speech.visible = cat === selected
      && !walking
      && simulation.elapsed % 13 < 4.2;
    cat.speech.position.y = 2.62 + Math.sin(t * 2) * 0.035;
  }

  // ---------- Panel karakter, misi, notifikasi, dan log ----------

  function formatTime() {
    const hour = Math.floor(simulation.minutes / 60);
    const minute = Math.floor(simulation.minutes % 60);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  function toast(message) {
    clearTimeout(toastTimeout);
    $("toast").textContent = message;
    $("toast").classList.add("show");
    toastTimeout = setTimeout(() => $("toast").classList.remove("show"), 3200);
  }

  function addEvent(name, text) {
    simulation.events.unshift({ time: formatTime(), name, text });
    simulation.events.length = Math.min(simulation.events.length, 3);
    const list = $("activity-list");
    list.replaceChildren();

    for (const event of simulation.events) {
      const row = document.createElement("li");
      const time = document.createElement("time");
      const content = document.createElement("span");
      const strong = document.createElement("b");
      time.textContent = event.time;
      strong.textContent = event.name;
      content.append(strong, ` ${event.text}`);
      row.append(time, content);
      list.append(row);
    }
  }

  function selectCat(cat) {
    selected = cat;
    simulation.seen.add(cat.data.id);
    $("selected-portrait").src = cat.portrait;
    $("selected-portrait").alt = `Avatar ${cat.data.name}`;
    $("selected-name").textContent = cat.data.name;
    const gender = document.createElement("span");
    gender.textContent = cat.data.gender;
    $("selected-name").append(gender);
    $("selected-role").textContent = cat.data.title;
    $("selected-job").textContent = cat.data.role;
    $("selected-bio").textContent = cat.data.bio;

    for (const member of cats) {
      const button = $(`crew-${member.data.id}`);
      const active = member === cat;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    }

    checkMissions();
    updateUI();
  }

  function checkMissions() {
    const next = [
      simulation.seen.size >= 2,
      simulation.focusSeconds >= 30,
      simulation.coffee,
    ];

    next.forEach((done, index) => {
      if (done && !simulation.missions[index]) {
        simulation.missions[index] = true;
        const names = ["Kenalan dengan tim", "Satu putaran fokus", "Coffee break dulu"];
        toast(`Misi selesai: ${names[index]} ✧`);
        addEvent("Misi", `“${names[index]}” selesai. Kantor makin happy.`);
      }
    });

    renderMissions();
  }

  function renderMissions() {
    const progress = Math.min(30, Math.floor(simulation.focusSeconds));
    const signature = `${simulation.missions}:${simulation.seen.size}:${progress}`;

    if (signature === lastMissionSignature) {
      return;
    }

    lastMissionSignature = signature;
    const missions = [
      ["Kenalan dengan tim", `Pilih Miko dan Luna · ${simulation.seen.size}/2`],
      ["Satu putaran fokus", `Biarkan tim bekerja · ${progress}/30 dtk`],
      ["Coffee break dulu", "Ajak tim mampir ke coffee corner"],
    ];
    const container = $("mission-list");
    container.replaceChildren();

    missions.forEach(([title, detail], index) => {
      const row = document.createElement("div");
      const checkbox = document.createElement("span");
      const content = document.createElement("div");
      const heading = document.createElement("strong");
      const description = document.createElement("p");
      row.className = simulation.missions[index] ? "mission done" : "mission";
      checkbox.className = "mission-check";
      checkbox.innerHTML = '<svg><use href="#i-check"/></svg>';
      heading.textContent = title;
      description.textContent = detail;
      content.append(heading, description);
      row.append(checkbox, content);
      container.append(row);
    });

    const completed = simulation.missions.filter(Boolean).length;
    $("mission-total").textContent = `${completed} / 3`;
    $("happiness").textContent = `+${completed * 25}`;
  }

  function updateUI() {
    $("clock").textContent = formatTime();
    const days = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];
    const day = String(simulation.day).padStart(2, "0");
    $("day-label").textContent = `${days[(simulation.day - 1) % 7]} · HARI ${day}`;

    for (const cat of cats) {
      $(`state-${cat.data.id}`).textContent = `● ${cat.task}`;
    }

    if (selected) {
      $("selected-task").textContent = selected.task;
      $("energy-bar").style.width = `${selected.energy}%`;
      $("mood-bar").style.width = `${selected.mood}%`;
      $("energy-value").textContent = Math.round(selected.energy);
      $("mood-value").textContent = Math.round(selected.mood);
    }

    clockMinute.rotation.z = -simulation.minutes % 60 * Math.PI / 30;
    clockHour.rotation.z = -(simulation.minutes / 60) * Math.PI / 6;
  }

  // ---------- Kamera orbit: seret, zoom, fokus, dan kembali ----------

  function resize() {
    const bounds = $("scene").getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const aspect = width / height;
    const viewHeight = Math.max(12.7, 16.2 / aspect);
    camera.left = -viewHeight * aspect / 2;
    camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }

  function updateCamera(dt) {
    const blend = 1 - Math.exp(-8 * dt);

    if (orbit.follow && selected) {
      orbit.goalTarget.set(selected.root.position.x, 1.12, selected.root.position.z);
    }

    orbit.theta = THREE.MathUtils.lerp(orbit.theta, orbit.goalTheta, blend);
    orbit.phi = THREE.MathUtils.lerp(orbit.phi, orbit.goalPhi, blend);
    orbit.zoom = THREE.MathUtils.lerp(orbit.zoom, orbit.goalZoom, blend);
    orbit.target.lerp(orbit.goalTarget, blend);

    const radius = 24;
    camera.position.set(
      orbit.target.x + radius * Math.sin(orbit.phi) * Math.sin(orbit.theta),
      orbit.target.y + radius * Math.cos(orbit.phi),
      orbit.target.z + radius * Math.sin(orbit.phi) * Math.cos(orbit.theta)
    );
    camera.lookAt(orbit.target);

    if (Math.abs(camera.zoom - orbit.zoom) > 0.0001) {
      camera.zoom = orbit.zoom;
      camera.updateProjectionMatrix();
    }

    // Dinding di sisi kamera disembunyikan ketika dilihat dari belakang.
    for (const wall of wallGroups) {
      wall.group.visible = camera.position[wall.axis] > -0.5;
    }
  }

  function resetCamera() {
    orbit.follow = false;
    orbit.goalTheta = 0.62;
    orbit.goalPhi = 0.90;
    orbit.goalZoom = 1;
    orbit.goalTarget.set(0, 0.8, 0);
  }

  function installCameraControls() {
    const canvas = renderer.domElement;
    const pointers = new Map();
    let press = null;
    let previousPinch = 0;

    canvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      canvas.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1) {
        press = { x: event.clientX, y: event.clientY, moved: 0 };
      } else {
        press = null;
        previousPinch = 0;
      }
    });

    canvas.addEventListener("pointermove", (event) => {
      const previous = pointers.get(event.pointerId);

      if (!previous) {
        return;
      }

      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size > 1) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        if (previousPinch > 0) {
          orbit.goalZoom = THREE.MathUtils.clamp(
            orbit.goalZoom * distance / previousPinch,
            0.65,
            3.5
          );
        }

        previousPinch = distance;
        return;
      }

      if (press) {
        press.moved += Math.hypot(dx, dy);
      }

      orbit.goalTheta -= dx * 0.007;
      orbit.goalPhi = THREE.MathUtils.clamp(orbit.goalPhi + dy * 0.005, 0.25, 1.38);
    });

    canvas.addEventListener("pointerup", (event) => {
      const isClick = press && press.moved < 7 && pointers.size === 1;
      pointers.delete(event.pointerId);
      canvas.releasePointerCapture(event.pointerId);

      if (isClick) {
        const bounds = canvas.getBoundingClientRect();
        pointer.set(
          (event.clientX - bounds.left) / bounds.width * 2 - 1,
          -(event.clientY - bounds.top) / bounds.height * 2 + 1
        );
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(cats.map((cat) => cat.root), true);
        const hit = hits.find((item) => item.object.userData.catId);

        if (hit) {
          const cat = cats.find((item) => item.data.id === hit.object.userData.catId);
          selectCat(cat);
        }
      }

      press = null;
      previousPinch = 0;
    });

    canvas.addEventListener("pointercancel", (event) => {
      pointers.delete(event.pointerId);
      press = null;
      previousPinch = 0;
    });

    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      orbit.goalZoom = THREE.MathUtils.clamp(
        orbit.goalZoom * Math.exp(-event.deltaY * 0.001),
        0.65,
        3.5
      );
    }, { passive: false });

    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  // ---------- Tombol interaksi ----------

  function togglePause() {
    simulation.paused = !simulation.paused;
    const button = $("pause-button");
    button.setAttribute("aria-pressed", String(simulation.paused));
    button.setAttribute("aria-label", simulation.paused ? "Lanjutkan simulasi" : "Jeda simulasi");
    button.classList.toggle("active", simulation.paused);
    button.querySelector("use").setAttribute("href", simulation.paused ? "#i-play" : "#i-pause");
    toast(simulation.paused ? "Waktu dijeda. Kameranya tetap bisa diputar." : "Para meng kembali beraktivitas.");
  }

  function toggleTheme() {
    simulation.night = !simulation.night;
    document.body.classList.toggle("night", simulation.night);
    sunlight.intensity = simulation.night ? 0.9 : 3.0;
    sunlight.color.setHex(simulation.night ? 0x9bbbd2 : 0xffedd1);
    ambient.intensity = simulation.night ? 1.25 : 2.3;
    ambient.color.setHex(simulation.night ? 0xabbac7 : 0xfff3df);

    for (const surface of windowMaterials) {
      surface.color.setHex(simulation.night ? 0x385467 : 0xc7dcd9);
    }

    for (const surface of lampMaterials) {
      surface.emissiveIntensity = simulation.night ? 1.5 : 0.05;
    }

    $("theme-button").querySelector("use").setAttribute(
      "href", simulation.night ? "#i-sun" : "#i-moon"
    );
    $("theme-button").setAttribute(
      "aria-label", simulation.night ? "Ganti suasana siang" : "Ganti suasana malam"
    );
    $("world-label").textContent = simulation.night
      ? "THE STUDIO · AFTER HOURS"
      : "THE STUDIO · MORNING LIGHT";
    toast(simulation.night ? "Lampu hangat, suasana malam." : "Selamat datang kembali, matahari.");
  }

  function installButtons() {
    for (const cat of cats) {
      $(`crew-${cat.data.id}`).addEventListener("click", () => selectCat(cat));
    }

    $("home-button").addEventListener("click", resetCamera);
    $("pause-button").addEventListener("click", togglePause);
    $("theme-button").addEventListener("click", toggleTheme);

    $("focus-button").addEventListener("click", () => {
      orbit.follow = true;
      orbit.goalZoom = 2.55;
      orbit.goalTheta = 0.28;
      orbit.goalPhi = 1.16;
      toast(`Kenalan lebih dekat dengan ${selected.data.name}. Overview untuk kembali.`);
    });

    $("speed-button").addEventListener("click", () => {
      const speeds = [1, 2, 4];
      simulation.speed = speeds[(speeds.indexOf(simulation.speed) + 1) % speeds.length];
      $("speed-button").textContent = `${simulation.speed}×`;
      toast(`Kecepatan simulasi ${simulation.speed}×`);
    });

    $("coffee-button").addEventListener("click", () => {
      let moved = false;

      for (const cat of cats) {
        moved = navigate(cat, "coffee") || moved;
      }

      if (moved) {
        toast(simulation.paused
          ? "Coffee break siap. Lanjutkan waktu agar tim mulai berjalan."
          : "Kopi dulu! Miko dan Luna menuju coffee corner."
        );
        addEvent("Tim", "mengambil jeda kopi bersama.");
      }
    });

    $("meeting-button").addEventListener("click", () => {
      let moved = false;

      for (const cat of cats) {
        moved = navigate(cat, "meeting") || moved;
      }

      if (moved) {
        toast(simulation.paused
          ? "Diskusi siap. Lanjutkan waktu agar tim berkumpul."
          : "Saatnya tukar ide di meja bundar."
        );
        addEvent("Tim", "menjadwalkan diskusi kecil.");
      }
    });

    document.addEventListener("keydown", (event) => {
      const tag = event.target.tagName;

      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || event.target.isContentEditable) {
        return;
      }

      if (event.code === "Space" && tag !== "BUTTON" && tag !== "A") {
        event.preventDefault();
        togglePause();
      } else if (event.key.toLowerCase() === "r" || event.key === "Escape") {
        resetCamera();
      } else if (event.key === "1") {
        selectCat(cats[0]);
      } else if (event.key === "2") {
        selectCat(cats[1]);
      }
    });
  }

  // ---------- Render utama ----------

  function frame() {
    const realDelta = Math.min(clock.getDelta(), 0.06);
    const dt = simulation.paused ? 0 : realDelta * simulation.speed;
    updateSimulation(dt);
    updateCamera(realDelta);

    for (const cat of cats) {
      if (dt > 0) {
        animateCat(cat, dt);
      }
    }

    selectionRing.position.set(selected.root.position.x, 0.135, selected.root.position.z);
    selectionRing.material.opacity = 0.55 + Math.sin(simulation.elapsed * 2) * 0.10;

    for (const puff of steamPuffs) {
      const phase = (simulation.elapsed * 0.35 + puff.offset) % 1;
      puff.mesh.position.y = 1.50 + phase * 0.70;
      puff.mesh.position.x = 4.45 + Math.sin(phase * 5) * 0.05;
      puff.mesh.scale.setScalar(0.6 + phase * 1.3);
      puff.mesh.material.opacity = Math.sin(phase * Math.PI) * 0.14;
    }

    if (performance.now() - lastUIUpdate > 250) {
      lastUIUpdate = performance.now();
      updateUI();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  function boot() {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    $("scene").append(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-10, 10, 8, -8, 0.1, 100);
    ambient = new THREE.HemisphereLight(0xfff3df, 0x819071, 2.3);
    scene.add(ambient);

    sunlight = new THREE.DirectionalLight(0xffedd1, 3.0);
    sunlight.position.set(-3, 10, 5);
    sunlight.castShadow = true;
    sunlight.shadow.mapSize.set(2048, 2048);
    sunlight.shadow.camera.left = -11;
    sunlight.shadow.camera.right = 11;
    sunlight.shadow.camera.top = 10;
    sunlight.shadow.camera.bottom = -10;
    sunlight.shadow.normalBias = 0.035;
    sunlight.shadow.bias = -0.0002;
    sunlight.shadow.radius = 3;
    scene.add(sunlight);

    const fill = new THREE.DirectionalLight(0xdde8d1, 0.65);
    fill.position.set(6, 5, -4);
    scene.add(fill);
    const warmLamp = new THREE.PointLight(0xffcb85, 9, 6, 2);
    warmLamp.position.set(-5.0, 2.4, 0.1);
    scene.add(warmLamp);

    createRoom();
    createLounge();
    TEAM.forEach(createDesk);
    createCoffeeCorner();
    TEAM.forEach(createCat);
    createPortraits();

    selectionRing = new THREE.Mesh(
      new THREE.RingGeometry(0.47, 0.51, 48),
      new THREE.MeshBasicMaterial({
        color: 0x56764d,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    selectionRing.rotation.x = -Math.PI / 2;
    scene.add(selectionRing);

    selectCat(cats[0]);
    addEvent("Miko", "menyiapkan rencana untuk hari yang menyenangkan.");
    addEvent("Luna", "membuka kanvas baru. Banyak ide menunggu.");
    installCameraControls();
    installButtons();
    resize();
    updateCamera(1);
    new ResizeObserver(resize).observe($("scene"));

    // Saat tab tersembunyi, jam simulasi tidak mengejar waktu yang terlewat.
    document.addEventListener("visibilitychange", () => clock.getDelta());
    renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      simulation.paused = true;
      $("loading").hidden = false;
      $("loading").lastElementChild.textContent =
        "Koneksi grafis terjeda. Muat ulang halaman untuk melanjutkan.";
    });

    $("loading").hidden = true;
    frame();
  }

  try {
    boot();
  } catch (error) {
    console.error("Pawffice tidak dapat dibuka:", error);
    $("loading").hidden = false;
    $("loading").lastElementChild.textContent =
      "Kantor belum bisa dirender. Coba browser dengan WebGL aktif. Detail: "
      + error.message;
  }
})();
