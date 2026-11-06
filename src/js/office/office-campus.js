/* Wing fasilitas dan parkir; semua bentuk tetap dibuat dengan Three.js. */
(() => {
  "use strict";
  const ROOMS = {
    lobby: { name: "Lobby & resepsionis", x: 0, z: 17.2, zoom: 2.1, minX: -19.2, maxX: 19.2, minZ: 11.2, maxZ: 23.2 },
    staff: { name: "Ruang staf operasional", x: -14.4, z: -18.6, zoom: 4.0, minX: -19.2, maxX: -9.6, minZ: -23.2, maxZ: -14 },
    bathroom: { name: "Kamar mandi", x: -6.1, z: -18.6, zoom: 4.5, minX: -9.6, maxX: -2.6, minZ: -23.2, maxZ: -14 },
    prayer: { name: "Musala", x: 4.8, z: -18.6, zoom: 3.8, minX: -2.6, maxX: 12.2, minZ: -23.2, maxZ: -14 },
    wudu: { name: "Tempat wudu", x: 15.7, z: -18.6, zoom: 4.5, minX: 12.2, maxX: 19.2, minZ: -23.2, maxZ: -14 },
    parking: { name: "Parkir kendaraan", x: 30, z: -1, zoom: 2.1, minX: 23, maxX: 37, minZ: -19, maxZ: 17 },
    grounds: { name: "Halaman kantor", x: 3.5, z: 1, zoom: 1, minX: -33, maxX: 40, minZ: -32, maxZ: 34 },
  };
  const TRANSPORT = { miko: "car", nori: "motorcycle", luna: "walk", kiko: "motorcycle", bimo: "motorcycle", piko: "walk", owner: "car", sasa: "motorcycle", rani: "motorcycle", tomo: "motorcycle" };
  const CLEANING = [
    { room: "Lobby", x: -6, z: 17 }, { room: "Ruang kerja", x: -8.1, z: -4.1 },
    { room: "Meeting", x: 5.0, z: -2.0 }, { room: "Owner + PA", x: 11.1, z: 7.8 },
    { room: "Pantry", x: -8.5, z: 9.8 }, { room: "Kamar mandi", x: -6.1, z: -16.2 },
    { room: "Tempat wudu", x: 15.7, z: -16.2 }, { room: "Musala", x: 10.5, z: -19 },
    { room: "Ruang staf", x: -11.5, z: -17.8 }, { room: "Lobby", x: 7, z: 20 },
    { room: "Musala", x: 10.5, z: -21.5 }, { room: "Merapikan alat", x: -11.5, z: -17.8 },
  ];
  const DOORS = [
    { x: -14.4, z: -14, axis: "x", width: 2.8, label: "STAFF" },
    { x: -6.1, z: -14, axis: "x", width: 2.6, label: "TOILET" },
    { x: 4.8, z: -14, axis: "x", width: 3.2, label: "MUSALA" },
    { x: 15.7, z: -14, axis: "x", width: 2.6, label: "WUDU" },
    { x: 0.5, z: -11.2, axis: "x", width: 3.2, label: "SERVICE" },
    { x: -8.5, z: 11.2, axis: "x", width: 3.2, label: "STUDIO" },
    { x: 4.8, z: 11.2, axis: "x", width: 3.2, label: "OFFICE" },
    { x: 0, z: 23.2, axis: "x", width: 5.0, label: "WELCOME" },
  ];

  const STAFF_REST = [
    { ownerId: "rani", x: -17.2, z: -16.4, heading: Math.PI },
    { ownerId: "tomo", x: -12.8, z: -16.4, heading: Math.PI },
  ];
  function facilityTarget(activity, index) {
    if (activity === "bathroom") return { x: index % 2 ? -4.2 : -8.1, z: -18.5 };
    if (activity === "wudu") return { x: [13.7, 15.7, 17.7][index % 3], z: -19.8 };
    return { x: -0.5 + index % 5 * 2.1, z: -21 + Math.floor(index / 5) * 3.5 };
  }

  function parkingSpot(personId) {
    const transport = TRANSPORT[personId] || "walk";
    if (transport === "car") return { transport, x: personId === "owner" ? 33 : 27, z: -12, targetX: personId === "owner" ? 31 : 29 };
    const riders = Object.keys(TRANSPORT).filter((id) => TRANSPORT[id] === "motorcycle");
    const index = riders.indexOf(personId);
    return transport === "walk"
      ? { transport, x: personId === "luna" ? -2 : 2, z: 27, targetX: personId === "luna" ? -2 : 2 }
      : { transport, x: 26.5 + index % 3 * 3, z: -4 + Math.floor(index / 3) * 6, targetX: 27.5 + index % 3 * 3 };
  }

  function build(api) {
    const { THREE, scene, box, sphere, cylinder, label, obstacle, createDoorFrame, createChair, createMonitor, team } = api;
    const vehicles = [];
    box(74, 0.20, 67, 0x9eaf88, 3.5, -0.02, 1);
    box(14, 0.20, 40, 0x858e86, 30, 0, -1);
    box(52, 0.10, 5, 0xd6d2c2, 7, 0.05, 25.8);
    box(7, 0.10, 8, 0xd6d2c2, 0, 0.05, 29);
    for (const z of [-17, -8, 1, 10, 19]) box(0.12, 0.012, 3, 0xe5dfc8, 22.5, 0.11, z);
    for (const z of [-28, -12, 5, 22]) {
      cylinder(0.18, 0.23, 2.2, 0x8a7756, -27, 1.0, z);
      sphere(1.9, 0x78996b, -27, 3.1, z, scene, [1.1, 1.2, 1.1]);
      sphere(1.3, 0x94ad7b, -25.9, 3.2, z + 0.4);
      obstacle(-27, z, 0.7, 0.7);
    }
    for (const x of [-14, 15]) {
      cylinder(0.16, 0.20, 2.0, 0x8a7756, x, 0.9, 30);
      sphere(1.6, 0x89a579, x, 2.9, 30);
      obstacle(x, 30, 0.7, 0.7);
    }
    for (const x of [-32.8, 39.8]) box(0.12, 0.5, 66, 0xb6c3a6, x, 0.12, 1);
    box(73, 0.5, 0.12, 0xb6c3a6, 3.5, 0.12, -31.8);
    for (const [left, right] of [[-33, -4], [4, 40]]) box(right - left, 0.5, 0.12, 0xb6c3a6, (left + right) / 2, 0.12, 33.8);
    for (const x of [-4, 4]) box(0.5, 2.5, 0.5, 0x748c7b, x, 1.15, 33.8);
    const gate = label("PAWFFICE CAMPUS", 7.2, 0.6, "#748c7b", "#f5eedc");
    gate.position.set(0, 2.7, 33.8);
    box(38.8, 0.42, 12, 0xbda686, 0, -0.23, 17.2);
    box(38.6, 0.12, 12, 0xe7ddc9, 0, 0.02, 17.2);
    box(38.4, 0.02, 11.8, 0xd4ddd4, 0, 0.115, 17.2);
    box(38.8, 0.42, 12, 0xbda686, 0, -0.23, -17.2);
    box(38.6, 0.12, 12, 0xe7ddc9, 0, 0.02, -17.2);
    const roomTitle = (text, x, z, color = "#d4ddd4") => {
      const title = label(text, 4.3, 0.5, color, "#496356");
      title.rotation.x = -Math.PI / 2;
      title.position.set(x, 0.15, z);
    };
    function wall(x, z, width, depth) {
      box(width, 1.25, depth, 0xb9c9bd, x, 0.72, z);
      obstacle(x, z, width, depth);
    }
    // Lobby satu hall tanpa ruang servis di sampingnya.
    for (const x of [-19.2, 19.2]) {
      wall(x, 17.2, 0.16, 12);
      wall(x, -17.2, 0.16, 12);
      obstacle(x, 0, 0.18, 22.4);
    }
    for (const [left, right] of [[-19.2, -2.5], [2.5, 19.2]]) wall((left + right) / 2, 23.2, right - left, 0.16);
    wall(0, -23.2, 38.4, 0.16);
    for (const [left, right] of [[-19.2, -1.1], [2.1, 19.2]]) obstacle((left + right) / 2, -11.2, right - left, 0.18);
    for (const [left, right] of [[-19.2, -10.1], [-6.9, 3.2], [6.4, 19.2]]) obstacle((left + right) / 2, 11.2, right - left, 0.18);
    for (const id of ["staff", "bathroom", "prayer", "wudu"]) {
      const room = ROOMS[id];
      const door = DOORS.find((item) => item.label === ({ staff: "STAFF", bathroom: "TOILET", prayer: "MUSALA", wudu: "WUDU" })[id]);
      for (const [left, right] of [[room.minX, door.x - door.width / 2], [door.x + door.width / 2, room.maxX]]) wall((left + right) / 2, -14, right - left, 0.16);
    }
    for (const x of [-9.6, -2.6, 12.2]) wall(x, -18.6, 0.16, 9.2);
    DOORS.forEach(createDoorFrame);
    roomTitle("LOBBY & RECEPTION", 0, 21.2);
    for (const [x, z, facing] of [[-12, 14, 1], [-12, 21, -1], [11.8, 14, 1], [11.8, 21, -1]]) {
      box(6.5, 0.35, 1.3, 0x9a8b78, x, 0.43, z);
      box(6.3, 0.20, 1.2, 0xdacbb7, x, 0.69, z);
      box(6.5, 0.75, 0.2, 0xbca88b, x, 0.78, z - facing * 0.6);
      obstacle(x, z, 6.6, 1.4);
    }
    for (const x of [-12, 11.8]) {
      box(2.5, 0.10, 1.6, 0xe6d7bc, x, 0.72, 17.6);
      box(0.5, 0.60, 0.7, 0x8a9e8c, x, 0.39, 17.6);
      obstacle(x, 17.6, 2.6, 1.7);
      cylinder(0.23, 0.17, 0.25, 0xc0aa81, x, 0.91, 17.6);
      sphere(0.38, 0x87a379, x, 1.25, 17.6);
    }
    const receptionist = team.find((person) => person.operational === "reception");
    const cleaner = team.find((person) => person.operational === "cleaner");
    const desk = new THREE.Group();
    desk.position.set(receptionist.desk.x, 0, receptionist.desk.z + 1.2);
    scene.add(desk);
    box(2.8, 1.0, 0.85, 0x79988b, 0, 0.6, 0, desk);
    box(3.0, 0.12, 1.0, 0xe5d5ba, 0, 1.16, 0, desk);
    const screen = createMonitor(false, 0.7, 0.18, desk);
    const logo = label("PAWFFICE", 2.4, 0.4, "#79988b", "#f5eedc");
    logo.position.set(0, 0.65, 0.44);
    desk.add(logo);
    obstacle(desk.position.x, desk.position.z, 3.0, 1.0);
    createChair(receptionist);
    createChair(cleaner);
    box(2.0, 0.12, 1.2, 0xd5c4a8, cleaner.desk.x, 1.0, cleaner.desk.z + 1.2);
    obstacle(cleaner.desk.x, cleaner.desk.z + 1.2, 2.0, 1.2);
    for (const x of [-18, -16.8]) {
      box(0.9, 2.2, 0.65, 0x9bac9a, x, 1.2, -22.6);
      box(0.07, 0.28, 0.05, 0x53695c, x + 0.25, 1.3, -22.23);
      obstacle(x, -22.6, 1.0, 0.7);
    }
    cylinder(0.28, 0.23, 0.45, 0xb1c3b8, -11, 0.35, -21.5);
    cylinder(0.025, 0.025, 1.5, 0x897354, -11, 1.0, -21.5);
    box(0.65, 0.06, 0.23, 0xc2b590, -11, 0.16, -21.5);
    roomTitle("STAFF & CLEANING", -14.4, -15);
    for (const { ownerId, x, z } of STAFF_REST) {
      const id = ownerId;
      const person = team.find((item) => item.id === id);
      createChair(person, { position: new THREE.Vector3(x, 0, z), heading: Math.PI, kind: "staff-rest-chair" });
    }
    box(6.8, 0.02, 9.0, 0xe1e9e4, -6.1, 0.12, -18.6);
    for (const x of [-8.1, -4.2]) {
      box(2.4, 1.5, 0.10, 0xb0c2bb, x, 0.9, -20.0);
      box(0.65, 0.50, 0.75, 0xf3f4e8, x, 0.38, -21.3);
      cylinder(0.24, 0.20, 0.12, 0xe1e7dc, x, 0.69, -21.2);
      box(0.65, 0.85, 0.2, 0xf3f4e8, x, 0.70, -21.8);
      obstacle(x, -21.4, 0.9, 1.2);
    }
    roomTitle("KAMAR MANDI", -6.1, -15);
    box(6.8, 0.02, 9.0, 0xc9dbd5, 15.7, 0.12, -18.6);
    for (const x of [13.7, 15.7, 17.7]) {
      box(0.8, 0.45, 0.65, 0xdde6db, x, 0.33, -21.4);
      cylinder(0.035, 0.035, 0.25, 0x758d86, x, 1.1, -22.0);
      box(0.06, 0.06, 0.25, 0x758d86, x, 1.15, -21.9);
      obstacle(x, -21.4, 0.85, 0.8);
    }
    roomTitle("TEMPAT WUDU", 15.7, -15);
    box(14.6, 0.02, 9, 0xc6d3bb, 4.8, 0.12, -18.6);
    for (let index = 0; index < team.length; index += 1) {
      const { x, z } = facilityTarget("prayer", index);
      const mat = box(1.0, 0.025, 1.65, index % 2 ? 0x6e8c74 : 0x849b79, x, 0.15, z);
      mat.rotation.y = -2.0;
      const border = box(0.8, 0.008, 0.08, 0xd5cba9, 0, 0.02, -0.57, mat);
      border.userData.kind = "prayer-mat-border";
    }
    roomTitle("MUSALA", 4.8, -15.0, "#c6d3bb");
    roomTitle("PARKIR", 30, 15, "#858e86");
    for (const person of team) {
      const spot = parkingSpot(person.id);
      if (spot.transport === "walk") continue;
      const vehicle = new THREE.Group();
      vehicle.position.set(spot.x, 0, spot.z);
      vehicle.userData.kind = "vehicle";
      vehicle.userData.ownerId = person.id;
      scene.add(vehicle);
      if (spot.transport === "car") {
        box(2.0, 0.65, 3.5, person.accent, 0, 0.60, 0, vehicle);
        box(1.7, 0.65, 1.8, 0x9cb6b0, 0, 1.20, -0.1, vehicle);
        for (const x of [-0.95, 0.95]) for (const z of [-1.05, 1.05]) {
          const tire = cylinder(0.33, 0.33, 0.25, 0x36413c, x, 0.40, z, vehicle);
          tire.rotation.z = Math.PI / 2;
        }
        obstacle(spot.x, spot.z, 2.2, 3.7);
      } else {
        for (const z of [-0.6, 0.6]) {
          const tire = cylinder(0.27, 0.27, 0.17, 0x36413c, 0, 0.35, z, vehicle);
          tire.rotation.z = Math.PI / 2;
        }
        box(0.40, 0.30, 0.95, person.accent, 0, 0.68, 0, vehicle);
        box(0.45, 0.09, 0.55, 0x465448, 0, 0.91, 0.1, vehicle);
        box(0.70, 0.06, 0.06, 0x657f70, 0, 1.1, -0.5, vehicle);
        obstacle(spot.x, spot.z, 0.75, 1.8);
      }
      box(3.1, 0.012, 0.04, 0xe4dfc8, spot.x, 0.12, spot.z + (spot.transport === "car" ? 2.1 : 1.2));
      vehicles.push({ ownerId: person.id, root: vehicle });
    }
    return { vehicles, receptionScreen: screen };
  }

  const api = { ROOMS, DOORS, CLEANING, TRANSPORT, STAFF_REST, facilityTarget, parkingSpot, build };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalThis.PawfficeCampus = api;
})();
