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
      role: "Project Manager",
      title: "THE PLANNER",
      bio: "Penggemar to-do list, kopi hangat, dan memastikan semua ide punya tempat.",
      fur: 0xd99553,
      patch: 0xf4d9ac,
      darkFur: 0xb7703e,
      shirt: 0xf5eedc,
      pants: 0x3c5950,
      accent: 0x4c7463,
      portrait: 0xe9d7b9,
      uniform: "tie",
      partition: 0xb9c9c2,
      desk: new THREE.Vector3(-13.5, 0, -8.4),
      deskFacing: 1,
      tasks: [
        "Menyusun ruang lingkup proyek",
        "Mengatur prioritas tim",
        "Memeriksa progres proyek",
      ],
    },
    {
      id: "nori",
      name: "Nori",
      gender: "♀",
      role: "System Analyst",
      title: "THE OBSERVER",
      bio: "Teliti mendengarkan kebutuhan dan merapikannya menjadi alur sistem.",
      fur: 0xc7a873,
      patch: 0xf2e3c9,
      darkFur: 0x9a7950,
      shirt: 0xf1ead9,
      pants: 0x596a5a,
      accent: 0x65816b,
      portrait: 0xe8ddc5,
      uniform: "vest",
      partition: 0xd4d0c1,
      desk: new THREE.Vector3(-8.2, 0, -8.4),
      deskFacing: 1,
      tasks: [
        "Mencatat kebutuhan klien",
        "Menyusun alur pemesanan",
        "Merinci kebutuhan sistem",
      ],
    },
    {
      id: "luna",
      name: "Luna",
      gender: "♀",
      role: "UI/UX Designer",
      title: "THE DAYDREAMER",
      bio: "Meramu warna dan alur yang membuat website terasa nyaman digunakan.",
      fur: 0x929da3,
      patch: 0xf2ece0,
      darkFur: 0x6c777e,
      shirt: 0x849878,
      pants: 0x555d62,
      accent: 0xd99a77,
      portrait: 0xd9e2d1,
      uniform: "cardigan",
      partition: 0xb9c9c2,
      desk: new THREE.Vector3(-2.9, 0, -8.4),
      deskFacing: 1,
      tasks: [
        "Menyusun wireframe booking",
        "Memilih palet warna website",
        "Merapikan desain halaman",
      ],
    },
    {
      id: "kiko",
      name: "Kiko",
      gender: "♂",
      role: "Frontend Developer",
      title: "THE BUILDER",
      bio: "Mengubah desain menjadi halaman web yang responsif dan interaktif.",
      fur: 0xb97c55,
      patch: 0xf0d7b7,
      darkFur: 0x8b5940,
      shirt: 0xe8eee2,
      pants: 0x50645b,
      accent: 0x72917b,
      portrait: 0xe4d4bd,
      uniform: "apron",
      partition: 0xb9c9c2,
      desk: new THREE.Vector3(-13.5, 0, 0.2),
      deskFacing: -1,
      tasks: [
        "Membangun halaman pemesanan",
        "Merapikan tampilan mobile",
        "Menghubungkan tombol dan formulir",
      ],
    },
    {
      id: "bimo",
      name: "Bimo",
      gender: "♂",
      role: "Backend Developer",
      title: "THE ENGINEER",
      bio: "Menjaga data jadwal dan reservasi bekerja rapi di balik layar.",
      fur: 0x92928b,
      patch: 0xe9e2d4,
      darkFur: 0x6b6b66,
      shirt: 0xe2e9e1,
      pants: 0x47574f,
      accent: 0x728b80,
      portrait: 0xdbe2d7,
      uniform: "vest",
      partition: 0xd4d0c1,
      desk: new THREE.Vector3(-8.2, 0, 0.2),
      deskFacing: -1,
      tasks: [
        "Menyusun data jadwal",
        "Menyiapkan logika reservasi",
        "Memeriksa alur penyimpanan",
      ],
    },
    {
      id: "piko",
      name: "Piko",
      gender: "♀",
      role: "QA / Tester",
      title: "THE BUG HUNTER",
      bio: "Menguji alur booking dan memastikan detail kecil tidak terlewat.",
      fur: 0xc68f91,
      patch: 0xf4e2d8,
      darkFur: 0x986c73,
      shirt: 0xf4eadf,
      pants: 0x68665e,
      accent: 0xb77c78,
      portrait: 0xead8d0,
      uniform: "cardigan",
      partition: 0xb9c9c2,
      desk: new THREE.Vector3(-2.9, 0, 0.2),
      deskFacing: -1,
      tasks: [
        "Menguji formulir booking",
        "Mencari bug tampilan",
        "Memeriksa hasil perbaikan",
      ],
    },
    {
      id: "owner",
      name: "Oji",
      gender: "♂",
      role: "Owner / Founder",
      title: "THE FOUNDER",
      bio: "Menjaga arah software house dan meninjau hasil akhir bersama tim.",
      fur: 0x8e765f,
      patch: 0xe7d7bd,
      darkFur: 0x695542,
      shirt: 0xf2eee4,
      pants: 0x485d55,
      accent: 0x718574,
      portrait: 0xe2dacb,
      uniform: "tie",
      partition: 0xaebfb7,
      desk: new THREE.Vector3(7.5, 0, 6.4),
      deskFacing: -1,
      tasks: [
        "Menentukan arah layanan software house",
        "Meninjau keputusan proyek",
        "Menyetujui hasil sebelum diserahkan",
      ],
    },
    {
      id: "sasa",
      name: "Sasa",
      gender: "♀",
      role: "Personal Assistant / Secretary",
      title: "THE ORGANIZER",
      bio: "Mengatur agenda, komunikasi klien, dan catatan rapat agar tim tetap sinkron.",
      fur: 0xb78278,
      patch: 0xf0ddd2,
      darkFur: 0x8f615b,
      shirt: 0xf4eee3,
      pants: 0x65766b,
      accent: 0xc18c73,
      portrait: 0xead8ce,
      uniform: "cardigan",
      partition: 0xd4d0c1,
      desk: new THREE.Vector3(14.0, 0, 6.4),
      deskFacing: -1,
      tasks: [
        "Menyusun agenda kerja tim",
        "Mencatat keputusan rapat",
        "Menyiapkan kabar untuk klien",
      ],
    },
  ];

  const ROLE_DETAILS = {
    miko: {
      label: "Project Manager",
      jobdesk: [
        "Menetapkan scope, prioritas, dan jadwal proyek.",
        "Membagi pekerjaan serta memantau progres dan hambatan tim.",
        "Mengkoordinasikan review hasil dengan klien dan Owner.",
      ],
    },
    nori: {
      label: "System Analyst",
      jobdesk: [
        "Menggali kebutuhan klien dan menulis spesifikasi sistem.",
        "Menyusun alur proses, use case, dan rancangan data.",
        "Menjelaskan aturan bisnis kepada designer, developer, dan QA.",
      ],
    },
    luna: {
      label: "UI/UX Designer",
      jobdesk: [
        "Merancang user flow, wireframe, dan prototipe website.",
        "Menentukan layout, komponen, warna, dan konsistensi visual.",
        "Menyerahkan desain serta meninjau hasil implementasi UI.",
      ],
    },
    kiko: {
      label: "Frontend Dev",
      jobdesk: [
        "Mengubah desain menjadi halaman web yang responsif.",
        "Membangun formulir, navigasi, dan interaksi pengguna.",
        "Menghubungkan UI dengan API serta memperbaiki bug tampilan.",
      ],
    },
    bimo: {
      label: "Backend Dev",
      jobdesk: [
        "Merancang database dan layanan API untuk aplikasi.",
        "Menerapkan validasi data, autentikasi, dan aturan bisnis.",
        "Menjaga alur penyimpanan, integrasi, dan keandalan sistem.",
      ],
    },
    piko: {
      label: "QA / Tester",
      jobdesk: [
        "Menyusun skenario uji berdasarkan kebutuhan sistem.",
        "Menguji fungsi, tampilan, dan alur pengguna; mencatat bug.",
        "Menguji ulang perbaikan dan mengecek kesiapan serah-terima.",
      ],
    },
    owner: {
      label: "Owner / Founder",
      jobdesk: [
        "Menentukan arah bisnis, layanan, dan target software house.",
        "Meninjau kerja sama klien, sumber daya, dan keputusan penting.",
        "Memberi persetujuan atas proposal dan hasil akhir proyek.",
      ],
    },
    sasa: {
      label: "PA / Secretary",
      jobdesk: [
        "Mengatur agenda Owner, jadwal rapat, dan pengingat tim.",
        "Mencatat notulen serta menindaklanjuti keputusan rapat.",
        "Mengelola komunikasi klien dan administrasi dokumen proyek.",
      ],
    },
  };

  const OFFICE_ROOMS = {
    work: {
      name: "Ruang kerja",
      x: -8.1,
      z: -4.1,
      zoom: 1.55,
      minX: -19.2,
      maxX: 3.0,
      minZ: -11.2,
      maxZ: 3.0,
    },
    meeting: {
      name: "Ruang meeting",
      x: 11.1,
      z: -5.6,
      zoom: 2.05,
      minX: 3.0,
      maxX: 19.2,
      minZ: -11.2,
      maxZ: 0,
    },
    owner: {
      name: "Ruang Owner + PA",
      x: 11.1,
      z: 5.6,
      zoom: 2.05,
      minX: 3.0,
      maxX: 19.2,
      minZ: 0,
      maxZ: 11.2,
    },
    pantry: {
      name: "Pantry & istirahat",
      x: -8.1,
      z: 7.1,
      zoom: 1.9,
      minX: -19.2,
      maxX: 3.0,
      minZ: 3.0,
      maxZ: 11.2,
    },
  };

  const ROOM_DOORS = [
    { x: 3.0, z: -5.5, axis: "z", width: 4.0, label: "MEETING" },
    { x: 3.0, z: 7.0, axis: "z", width: 4.0, label: "OWNER + PA" },
    { x: -8.5, z: 3.0, axis: "x", width: 4.0, label: "PANTRY" },
    { x: 11.1, z: 0, axis: "x", width: 4.0, label: "MEETING / OWNER" },
  ];

  const COFFEE_TARGET = new THREE.Vector3(0, 0, 5.4);

  const MAIN_QUEST = {
    title: "Sistem booking online untuk barbershop",
    description: "Dari brief klien sampai alur reservasi siap diuji.",
    stageWorkSeconds: 30,
    stages: [
      { roleId: "miko", title: "Tentukan ruang lingkup proyek" },
      { roleId: "nori", title: "Rangkum kebutuhan pelanggan" },
      { roleId: "luna", title: "Rancang alur dan tampilan" },
      { roleId: "kiko", title: "Bangun halaman pemesanan" },
      { roleId: "bimo", title: "Siapkan jadwal dan reservasi" },
      { roleId: "piko", title: "Uji alur dan siapkan serah-terima" },
    ],
  };

  const WORKSTATION = {
    seatToDesk: 1.2,
    seatedHeight: 0.06,
  };

  const DAILY_QUEST_POOL = [
    { id: "focus", title: "Sesi fokus singkat", detail: "Biarkan tim bekerja selama 30 detik." },
    { id: "coffee", title: "Rehat kopi", detail: "Ajak satu rekan ke coffee corner." },
    { id: "huddle", title: "Sinkronisasi tim", detail: "Kumpulkan tim untuk team huddle." },
    { id: "lounge", title: "Cari inspirasi", detail: "Ajak satu rekan beristirahat sebentar." },
    { id: "collaborate", title: "Libatkan tiga role", detail: "Biarkan tiga rekan berbeda ikut bekerja." },
    { id: "project", title: "Majukan proyek", detail: "Selesaikan satu tahap quest utama." },
    { id: "meet-three", title: "Kenalan dengan rekan", detail: "Pilih tiga anggota tim yang berbeda." },
    { id: "meet-all", title: "Kenalan dengan seluruh tim", detail: "Pilih semua anggota tim." },
  ];

  const simulation = {
    paused: false,
    speed: 1,
    night: false,
    themeOverride: null,
    elapsed: 0,
    selectedId: "miko",
    seen: new Set(),
    happiness: 0,
    mainQuest: {
      stageIndex: 0,
      stageSeconds: 0,
    },
    daily: {
      dateKey: "",
      focusSeconds: 0,
      coffeeVisits: 0,
      meetingRounds: 0,
      loungeVisits: 0,
      stageCompletions: 0,
      seenToday: new Set(),
      contributors: new Set(),
      completedQuestIds: new Set(),
      meetingWasTogether: false,
    },
    coffee: false,
    events: [],
  };

  const PROGRESS_KEY = "pawffice.progress.v2";
  const LEGACY_PROGRESS_KEY = "pawffice.progress.v1";
  const JAKARTA_TIME_ZONE = "Asia/Jakarta";

  const MEETING_TABLE = {
    x: 11.1,
    z: -5.8,
    width: 8.0,
    depth: 2.7,
  };

  const MEETING_SEATS = TEAM.map((member, index) => {
    const offsets = [
      [-2.6, -2.3], [0, -2.3], [2.6, -2.3],
      [-2.6, 2.3], [0, 2.3], [2.6, 2.3],
      [-5.3, 0], [5.3, 0],
    ];
    const [x, z] = offsets[index];

    return {
      ownerId: member.id,
      x: MEETING_TABLE.x + x,
      z: MEETING_TABLE.z + z,
      heading: index < 3 ? 0 : index < 6 ? Math.PI : index === 6
        ? Math.PI / 2 : -Math.PI / 2,
    };
  });

  const PANTRY_TABLES = [{ x: -11.5, z: 7.1 }, { x: -5.6, z: 7.1 }];
  const LOUNGE_SEATS = TEAM.map((member, index) => {
    const table = PANTRY_TABLES[Math.floor(index / 4)];
    const angle = index % 4 * Math.PI / 2;
    const x = table.x + Math.sin(angle) * 1.7;
    const z = table.z + Math.cos(angle) * 1.7;
    return {
      ownerId: member.id, x, z,
      heading: Math.atan2(table.x - x, table.z - z),
    };
  });
  const LOUNGE_SPOTS = LOUNGE_SEATS.map((seat) => {
    return new THREE.Vector3(seat.x, 0, seat.z);
  });

  const jakartaPartsFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const jakartaDateFormatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const materials = new Map();
  const geometries = new Map();
  const obstacles = [];
  const cats = [];
  const steamPuffs = [];
  const windowMaterials = [];
  const lampMaterials = [];
  const wallGroups = [];
  const workspaceLabels = [];
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
  let lastMainQuestSignature = "";
  let lastSavedProgress = "";
  let lastProgressSaveAt = 0;
  let storageErrorShown = false;
  let appliedTheme = null;
  let viewportWidth = 1;
  let viewportHeight = 1;

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

  // ---------- Progres quest: simpan di browser, pulihkan saat refresh ----------

  function resetDailyProgress(dateKey) {
    simulation.daily = {
      dateKey,
      focusSeconds: 0,
      coffeeVisits: 0,
      meetingRounds: 0,
      loungeVisits: 0,
      stageCompletions: 0,
      seenToday: new Set(),
      contributors: new Set(),
      completedQuestIds: new Set(),
      meetingWasTogether: false,
    };
  }

  function progressSnapshot() {
    return {
      version: 2,
      selectedId: simulation.selectedId,
      seen: [...simulation.seen].sort(),
      happiness: simulation.happiness,
      mainQuest: {
        stageIndex: simulation.mainQuest.stageIndex,
        stageSeconds: simulation.mainQuest.stageSeconds,
      },
      daily: {
        dateKey: simulation.daily.dateKey,
        focusSeconds: simulation.daily.focusSeconds,
        coffeeVisits: simulation.daily.coffeeVisits,
        meetingRounds: simulation.daily.meetingRounds,
        loungeVisits: simulation.daily.loungeVisits,
        stageCompletions: simulation.daily.stageCompletions,
        seenToday: [...simulation.daily.seenToday].sort(),
        contributors: [...simulation.daily.contributors].sort(),
        completedQuestIds: [...simulation.daily.completedQuestIds].sort(),
      },
      coffee: simulation.coffee,
    };
  }

  function setSaveStatus(message) {
    const status = $("save-status");

    if (status) {
      status.textContent = message;
    }
  }

  function reportStorageError(error) {
    setSaveStatus("Penyimpanan browser tidak tersedia. Progres masih sementara.");

    if (!storageErrorShown) {
      storageErrorShown = true;
      console.warn("Pawffice tidak dapat menyimpan progres:", error);

      if (selected) {
        toast("Browser memblokir penyimpanan. Progres belum bisa disimpan.");
      }
    }
  }

  function loadProgress() {
    let raw;

    try {
      raw = window.localStorage.getItem(PROGRESS_KEY)
        || window.localStorage.getItem(LEGACY_PROGRESS_KEY);
    } catch (error) {
      reportStorageError(error);
      return;
    }

    if (!raw) {
      return;
    }

    try {
      const saved = JSON.parse(raw);

      if (!saved || ![1, 2].includes(saved.version)) {
        return;
      }

      const validIds = new Set(TEAM.map((member) => member.id));

      if (Array.isArray(saved.seen)) {
        simulation.seen = new Set(
          saved.seen.filter((id) => validIds.has(id))
        );
      }

      simulation.coffee = saved.coffee === true;

      if (saved.version === 2) {
        if (Number.isFinite(saved.happiness)) {
          simulation.happiness = Math.max(0, saved.happiness);
        }

        if (saved.mainQuest && Number.isFinite(saved.mainQuest.stageIndex)) {
          simulation.mainQuest.stageIndex = Math.max(
            0,
            Math.min(MAIN_QUEST.stages.length, Math.floor(saved.mainQuest.stageIndex))
          );
          const stageLimit = MAIN_QUEST.stageWorkSeconds;
          const stageSeconds = Number(saved.mainQuest.stageSeconds);
          simulation.mainQuest.stageSeconds = Number.isFinite(stageSeconds)
            ? Math.max(0, Math.min(stageLimit - 0.001, stageSeconds))
            : 0;
        }

        const today = readJakartaTime().dateKey;
        const daily = saved.daily;

        if (daily && daily.dateKey === today) {
          simulation.daily.dateKey = today;
          simulation.daily.focusSeconds = Number.isFinite(daily.focusSeconds)
            ? Math.max(0, daily.focusSeconds)
            : 0;
          simulation.daily.coffeeVisits = Math.max(0, Number(daily.coffeeVisits) || 0);
          simulation.daily.meetingRounds = Math.max(0, Number(daily.meetingRounds) || 0);
          simulation.daily.loungeVisits = Math.max(0, Number(daily.loungeVisits) || 0);
          simulation.daily.stageCompletions = Math.max(0, Number(daily.stageCompletions) || 0);
          simulation.daily.seenToday = new Set(
            Array.isArray(daily.seenToday)
              ? daily.seenToday.filter((id) => validIds.has(id))
              : []
          );
          simulation.daily.contributors = new Set(
            Array.isArray(daily.contributors)
              ? daily.contributors.filter((id) => validIds.has(id))
              : []
          );
          simulation.daily.completedQuestIds = new Set(
            Array.isArray(daily.completedQuestIds)
              ? daily.completedQuestIds.filter((id) => DAILY_QUEST_POOL.some((quest) => quest.id === id))
              : []
          );
        } else {
          resetDailyProgress(today);
        }
      } else {
        // Data versi lama tetap membawa anggota yang sudah dikenal ke versi baru.
        resetDailyProgress(readJakartaTime().dateKey);
        simulation.happiness = Array.isArray(saved.missions)
          ? saved.missions.filter(Boolean).length * 25
          : 0;
      }

      if (validIds.has(saved.selectedId)) {
        simulation.selectedId = saved.selectedId;
      }

      // Migrasikan simpanan lama tanpa mengulang hadiah quest harian.
      lastSavedProgress = saved.version === 2
        ? JSON.stringify(progressSnapshot())
        : "";
      saveProgress(true);
      setSaveStatus("Progres tersimpan di browser ini.");
    } catch (error) {
      // Data lama yang rusak tidak boleh menghentikan kantor 3D.
      console.warn("Data progres Pawffice tidak terbaca:", error);
    }
  }

  function saveProgress(force = false) {
    const now = performance.now();

    // Progres fokus disimpan paling sering sekali per detik.
    // Pemilihan karakter, misi selesai, dan penutupan tab disimpan langsung.
    if (!force && now - lastProgressSaveAt < 1000) {
      return;
    }

    lastProgressSaveAt = now;
    const payload = JSON.stringify(progressSnapshot());

    if (payload === lastSavedProgress) {
      return;
    }

    try {
      window.localStorage.setItem(PROGRESS_KEY, payload);
      lastSavedProgress = payload;
      setSaveStatus("Progres tersimpan di browser ini.");
    } catch (error) {
      reportStorageError(error);
    }
  }

  // ---------- Jam nyata WIB, terpisah dari waktu animasi ----------

  function readJakartaTime(now = new Date()) {
    const parts = Object.fromEntries(
      jakartaPartsFormatter.formatToParts(now)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );

    return {
      hour: Number(parts.hour),
      minute: Number(parts.minute),
      second: Number(parts.second),
      shortTime: `${parts.hour}:${parts.minute}`,
      clockText: `${parts.hour}:${parts.minute}:${parts.second} WIB`,
      dateKey: `${parts.year}-${parts.month}-${parts.day}`,
      dateLabel: jakartaDateFormatter.format(now).toLocaleUpperCase("id-ID"),
    };
  }

  function dateOrdinal(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  }

  function dailyQuestsForDate(dateKey) {
    const start = dateOrdinal(dateKey) % DAILY_QUEST_POOL.length;

    return [0, 1, 2].map((offset) => {
      return DAILY_QUEST_POOL[(start + offset) % DAILY_QUEST_POOL.length];
    });
  }

  function ensureDailyDate(dateKey) {
    if (simulation.daily.dateKey === dateKey) {
      return false;
    }

    resetDailyProgress(dateKey);
    lastMissionSignature = "";
    return true;
  }

  function updateLiveClock() {
    const time = readJakartaTime();
    $("clock").textContent = time.clockText;
    $("day-label").textContent = time.dateLabel;
    $("daily-quest-date").textContent = `${time.dateLabel} · WIB`;

    if (ensureDailyDate(time.dateKey)) {
      renderMissions();
      saveProgress(true);
    }

    // Jarum menit/jam juga mengikuti waktu nyata, termasuk detiknya.
    clockMinute.rotation.z = -(time.minute + time.second / 60) * Math.PI / 30;
    clockHour.rotation.z = -(time.hour % 12 + time.minute / 60) * Math.PI / 6;

    if (simulation.themeOverride === null) {
      applyTheme(time.hour >= 18 || time.hour < 6);
    }
  }

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

  function obstacle(x, z, width, depth, ownerId = null) {
    obstacles.push({ type: "box", x, z, width, depth, ownerId });
  }

  function circleObstacle(x, z, radius, ownerId = null) {
    obstacles.push({ type: "circle", x, z, radius, ownerId });
  }

  // ---------- Ruangan: lantai kayu, dinding, dan jendela ----------

  function createRoom() {
    box(38.8, 0.42, 22.8, 0xbda686, 0, -0.23, 0);
    box(38.65, 0.12, 22.65, 0xe2caa5, 0, 0.02, 0);

    for (let row = 0; row < 43; row += 1) {
      const z = -10.95 + row * 0.52;
      const color = row % 3 === 0 ? 0xddc29a : 0xe5cfac;
      box(38.4, 0.018, 0.505, color, 0, 0.087, z);

      for (let column = 0; column < 13; column += 1) {
        const x = -18.5 + column * 3.0 + (row % 2) * 1.1;
        box(0.012, 0.008, 0.49, 0xd4b98f, x, 0.101, z);
      }
    }

    const back = new THREE.Group();
    scene.add(back);
    wallGroups.push({ group: back, axis: "z" });
    box(38.5, 0.9, 0.18, 0xe8e3cf, 0, 0.55, -11.2, back);
    box(38.5, 0.3, 0.2, 0xe8e3cf, 0, 3.45, -11.2, back);
    box(38.5, 0.13, 0.26, 0xa6b09a, 0, 0.2, -11.05, back);
    box(38.5, 0.1, 0.28, 0xf8f0da, 0, 3.62, -11.2, back);
    for (const x of [-17.45, 17.45]) {
      box(3.4, 2.3, 0.18, 0xe8e3cf, x, 2.1, -11.2, back);
    }

    const sky = new THREE.MeshBasicMaterial({ color: 0xc7dcd9 });
    windowMaterials.push(sky);
    addMesh(new THREE.PlaneGeometry(31.6, 2.4), sky, [0, 2.1, -11.35], back);
    for (const x of [-15.6, -11.7, -7.8, -3.9, 0, 3.9, 7.8, 11.7, 15.6]) {
      box(0.09, 2.46, 0.17, 0xf8f0da, x, 2.1, -11.0, back);
    }
    box(31.6, 0.09, 0.16, 0xf8f0da, 0, 2.35, -10.99, back);
    box(31.7, 0.13, 0.38, 0xf8f0da, 0, 0.98, -10.96, back);
    for (const x of [-13.0, -8.0, -3.0, 2.0, 7.0, 12.0]) {
      sphere(0.66, 0x9daf94, x, 1.35, -11.21, back, [0.9, 1.4, 0.08]);
      sphere(0.48, 0xb4c4a5, x + 0.4, 1.1, -11.19, back, [1, 1.5, 0.09]);
    }

    const left = new THREE.Group();
    scene.add(left);
    wallGroups.push({ group: left, axis: "x" });
    for (const z of [-6.6, 6.6]) {
      box(0.18, 3.6, 9.2, 0xb9c4ab, -19.2, 1.87, z, left);
      box(0.25, 0.12, 9.2, 0xe7e4d2, -19.12, 0.2, z, left);
    }
    box(0.28, 0.10, 22.5, 0xd6dcc9, -19.2, 3.7, 0, left);
    box(0.18, 0.3, 4.0, 0xb9c4ab, -19.2, 3.45, 0, left);

    const wallLogo = label("pawffice.", 2.5, 0.65, "#e8e3cf", "#4b6250", back);
    wallLogo.position.set(-17.45, 2.95, -11.09);
    createPinboard(-17.45, 1.87, -11.02, back);
    createWallClock(0.5, 2.8, -11.0, back);

    const art = new THREE.Group();
    art.position.set(-19.075, 2.3, -5.0);
    art.rotation.y = Math.PI / 2;
    left.add(art);
    box(1.3, 1.6, 0.07, 0xe8d6b6, 0, 0, 0, art);
    const print = label("MAKE\nROOM", 1.13, 1.4, "#f3efdf", "#576d55", art);
    print.position.z = 0.045;
    sphere(0.28, 0xc38d67, 0, -0.28, 0.07, art, [1, 0.85, 0.07]);

    createPlant(-17.8, -9.6, 1.22);
    createPlant(17.8, -9.6, 1.05);
    createPlant(17.8, 1.5, 1.05);
    createPlant(-17.8, 9.8, 0.75);

    // Denah persegi panjang: kerja/pantry di kiri, meeting/owner di kanan.
    for (const [start, end] of [[-11.2, -7.5], [-3.5, 5.0], [9.0, 11.2]]) {
      createPartition(3.0, (start + end) / 2, 0.18, end - start);
    }
    for (const [start, end] of [[-19.2, -10.5], [-6.5, 3.0]]) {
      createPartition((start + end) / 2, 3.0, end - start, 0.18);
    }
    for (const [start, end] of [[3.0, 9.1], [13.1, 19.2]]) {
      createPartition((start + end) / 2, 0, end - start, 0.18);
    }
    ROOM_DOORS.forEach(createDoorFrame);
    createDoorFrame({ x: -19.2, z: 0, axis: "z", width: 4.0, label: "WELCOME" });

    box(0.18, 0.8, 22.4, 0xc7d1c5, 19.2, 0.5, 0);
    box(38.4, 0.8, 0.18, 0xc7d1c5, 0, 0.5, 11.2);
    box(1.3, 0.025, 3.0, 0x8d9d8c, -17.9, 0.12, 0);
    const welcome = label("WELCOME", 2.4, 0.35, "#8d9d8c", "#f5f1e5");
    welcome.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
    welcome.position.set(-17.9, 0.14, 0);

    const shadowGround = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 150),
      new THREE.ShadowMaterial({ opacity: 0.10 })
    );
    shadowGround.rotation.x = -Math.PI / 2;
    shadowGround.position.y = -0.48;
    shadowGround.receiveShadow = true;
    scene.add(shadowGround);
  }

  function createPartition(x, z, width, depth) {
    box(width, 0.88, depth, 0xd9dfd2, x, 0.59, z);
    box(width, 0.08, depth + 0.03, 0x80958b, x, 0.2, z);
    box(width, 0.06, depth, 0x80958b, x, 2.75, z);
    const glass = new THREE.MeshStandardMaterial({
      color: 0xb8cfc8,
      transparent: true,
      opacity: 0.16,
      roughness: 0.2,
      depthWrite: false,
    });
    const pane = addMesh(
      new THREE.BoxGeometry(width, 1.65, depth),
      glass,
      [x, 1.88, z]
    );
    pane.castShadow = false;
    obstacle(x, z, width, depth);
  }

  function createDoorFrame(door) {
    const alongX = door.axis === "x";
    for (const side of [-1, 1]) {
      const x = door.x + (alongX ? side * door.width / 2 : 0);
      const z = door.z + (alongX ? 0 : side * door.width / 2);
      const width = alongX ? 0.14 : 0.22;
      const depth = alongX ? 0.22 : 0.14;
      box(width, 2.65, depth, 0x80958b, x, 1.45, z);
      obstacle(x, z, width, depth);
    }
    box(alongX ? door.width + 0.14 : 0.22, 0.12,
      alongX ? 0.22 : door.width + 0.14, 0x80958b, door.x, 2.8, door.z);
    box(alongX ? door.width - 0.2 : 0.30, 0.025,
      alongX ? 0.30 : door.width - 0.2, 0xd8cbb5, door.x, 0.13, door.z);
    const sign = label(door.label, 2.1, 0.3, "#e7ede4", "#4c6458");
    sign.position.set(door.x - (alongX ? 0 : 0.14), 2.72,
      door.z + (alongX ? 0.14 : 0));
    sign.rotation.y = alongX ? 0 : -Math.PI / 2;
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

  function createMonitor(design, x, z, parent = scene) {
    const group = new THREE.Group();
    group.position.set(x, 1.0, z);
    group.userData.kind = "monitor";
    parent.add(group);
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

  function workHeading(data) {
    return data.deskFacing < 0 ? Math.PI : 0;
  }

  function createDesk(data) {
    const x = data.desk.x;
    const facing = data.deskFacing;
    // Avatar melihat ke +Z lokal; meja berada di depan titik duduknya.
    const deskZ = data.desk.z + facing * WORKSTATION.seatToDesk;
    const desk = new THREE.Group();
    desk.position.set(x, 0, deskZ);
    desk.rotation.y = workHeading(data);
    desk.userData.kind = "desk";
    desk.userData.ownerId = data.id;
    scene.add(desk);

    const wood = 0xe6d8bf;
    box(1.72, 0.15, 1.34, wood, 0, 0.98, 0, desk);
    box(1.65, 0.08, 1.26, 0xd0c2aa, 0, 0.88, 0, desk);

    box(0.10, 0.82, 1.02, 0x6e8276, -0.66, 0.51, 0, desk);
    box(0.10, 0.82, 1.02, 0x6e8276, 0.66, 0.51, 0, desk);
    // Bilik terbuka di sisi avatar; panel belakang ada di belakang monitor.
    box(1.60, 0.50, 0.065, data.partition, 0, 1.34, 0.61, desk);
    box(0.065, 0.50, 1.12, data.partition, -0.80, 1.34, 0, desk);
    box(0.065, 0.50, 1.12, data.partition, 0.80, 1.34, 0, desk);

    obstacle(x, deskZ, 1.78, 1.4);
    createMonitor(data.id === "luna", 0, -0.05, desk);
    box(0.72, 0.035, 0.25, 0xdddcd0, -0.02, 1.08, -0.43, desk);

    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 7; column += 1) {
        box(0.052, 0.013, 0.035, 0xc2c6b8,
          -0.25 + column * 0.076,
          1.105,
          -0.51 + row * 0.066,
          desk
        );
      }
    }

    sphere(0.07, 0xf2ead7, 0.31, 1.10, -0.42, desk, [0.7, 0.4, 1]);
    createMug(0.48, 1.075, -0.25, data.accent, desk);
    box(0.28, 0.045, 0.42, data.accent, 0.34, 1.08, 0.25, desk);
    box(0.25, 0.018, 0.38, 0xf6eed9, 0.34, 1.11, 0.25, desk);

    const plate = label(
      `${data.name}\n${ROLE_DETAILS[data.id].label}`,
      1.42, 0.35, "#e7ede4", "#4c6458"
    );
    plate.position.set(0, 1.36, 0.65);
    desk.add(plate);
    createChair(data);
  }

  function createChair(data, options = {}) {
    const chair = new THREE.Group();
    const position = options.position || data.desk;
    // Kursi dan avatar memakai titik dunia yang sama, tanpa rotasi induk meja.
    chair.position.copy(position);
    chair.rotation.y = options.heading ?? workHeading(data);
    chair.userData.kind = options.kind || "work-chair";
    chair.userData.ownerId = data.id;
    scene.add(chair);
    const color = options.color || 0x91a797;
    cylinder(0.08, 0.08, 0.42, 0x5c655b, 0, 0.32, 0, chair);
    box(0.72, 0.13, 0.68, color, 0, 0.56, 0, chair);
    box(0.70, 0.67, 0.12, color, 0, 0.95, -0.31, chair);

    for (let i = 0; i < 5; i += 1) {
      const angle = i * Math.PI * 2 / 5;
      const foot = box(0.09, 0.065, 0.45, 0x5c655b,
        Math.sin(angle) * 0.14,
        0.14,
        Math.cos(angle) * 0.14,
        chair
      );
      foot.rotation.y = angle;
      sphere(0.055, 0x424e45,
        Math.sin(angle) * 0.32,
        0.13,
        Math.cos(angle) * 0.32,
        chair
      );
    }

    // Pemilik boleh keluar / masuk kursinya; kucing lain perlu memutarinya.
    if (chair.userData.kind !== "work-chair") {
      circleObstacle(position.x, position.z, 0.40, data.id);
    } else {
      obstacle(position.x, position.z, 0.76, 0.80, data.id);
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
    const corner = new THREE.Group();
    corner.position.set(0, 0, 4.0);
    scene.add(corner);
    box(3.7, 0.94, 0.85, 0x91a082, 0, 0.59, 0, corner);
    box(3.85, 0.12, 0.97, 0xe2c9a5, 0, 1.10, 0, corner);

    for (const x of [-1.2, 0, 1.2]) {
      box(1.08, 0.74, 0.03, 0xa1ad91, x, 0.57, 0.445, corner);
      box(0.13, 0.035, 0.04, 0x5d7059, x + 0.28, 0.76, 0.48, corner);
    }

    box(0.62, 0.59, 0.49, 0x4b5a51, -0.8, 1.46, 0.03, corner);
    box(0.51, 0.06, 0.36, 0xb7b9a5, -0.8, 1.20, 0.17, corner);
    box(0.12, 0.06, 0.08, 0xe1d8bc, -0.8, 1.53, 0.31, corner);
    sphere(0.026, 0xb5cf96, -0.64, 1.65, 0.29, corner);
    createMug(-0.8, 1.23, 0.25, 0xeedcba, corner);
    createMug(-0.15, 1.18, 0.10, 0xbd8868, corner);
    box(0.85, 0.035, 0.46, 0x71877e, 1.0, 1.18, 0, corner);
    box(0.70, 0.025, 0.34, 0xb7c9c0, 1.0, 1.20, 0, corner);
    cylinder(0.035, 0.035, 0.35, 0x8c9e93, 1.1, 1.38, -0.28, corner);
    obstacle(0, 4.0, 3.8, 0.95);

    const coffeeLabel = label("BUT FIRST, COFFEE", 2.8, 0.4, "#e8e3cf", "#708168");
    coffeeLabel.position.set(0, 2.1, 3.15);
    for (let i = 0; i < 4; i += 1) {
      const puff = sphere(0.06, 0xf7f2df, -0.8, 1.65 + i * 0.16, 4.25);
      puff.material = new THREE.MeshBasicMaterial({
        color: 0xf7f2df,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      });
      steamPuffs.push({ mesh: puff, offset: i / 4, baseX: -0.8 });
    }

    box(1.3, 1.95, 1.2, 0xdce4d8, 1.2, 1.1, 9.8);
    box(1.18, 0.65, 0.035, 0xf0f2e8, 1.2, 1.73, 9.18);
    box(1.18, 1.08, 0.035, 0xe8ede2, 1.2, 0.80, 9.18);
    box(0.07, 0.33, 0.04, 0x758d7c, 0.73, 0.96, 9.14);
    obstacle(1.2, 9.8, 1.4, 1.3);
  }

  function createWorkRoom() {
    box(18.0, 0.022, 11.8, 0xc1cbbd, -8.2, 0.115, -4.1);
    for (const z of [-9.95, 1.75]) {
      box(17.78, 0.006, 0.025, 0xdce1d5, -8.2, 0.13, z);
    }
    const roomText = label("RUANG KERJA", 5.0, 0.5, "#c1cbbd", "#718570");
    roomText.rotation.x = -Math.PI / 2;
    roomText.position.set(-8.2, 0.14, -4.1);
    createPlant(0.5, 0.5, 1.0);
  }

  function createPantryRoom() {
    box(22.0, 0.018, 8.0, 0xe1d7c3, -8.1, 0.115, 7.1);
    box(15.0, 0.018, 5.9, 0xd0d7c4, -9.2, 0.13, 7.1);

    // Sofa panjang dan dua meja istirahat berada di dalam pantry.
    box(1.65, 0.40, 4.5, 0xa9967e, -16.7, 0.42, 7.1);
    box(1.55, 0.24, 4.1, 0xd2c2aa, -16.65, 0.68, 7.1);
    box(0.25, 0.85, 4.5, 0xb7a68e, -17.48, 0.78, 7.1);
    for (const z of [4.95, 9.25]) {
      box(1.65, 0.61, 0.22, 0xb7a68e, -16.7, 0.76, z);
    }
    for (const z of [5.8, 8.2]) {
      box(0.28, 0.51, 0.65, 0xeee4d1, -16.95, 1.02, z);
    }
    obstacle(-16.7, 7.1, 1.8, 4.7);

    for (const table of PANTRY_TABLES) {
      box(1.4, 0.10, 1.4, 0xe5d9bf, table.x, 0.95, table.z);
      cylinder(0.12, 0.22, 0.80, 0x7e9384, table.x, 0.52, table.z);
      obstacle(table.x, table.z, 1.45, 1.45);
      createMug(table.x - 0.25, 1.01, table.z, 0xf0ebdd);
    }
    for (const seat of LOUNGE_SEATS) {
      const member = TEAM.find((item) => item.id === seat.ownerId);
      createChair(member, {
        position: new THREE.Vector3(seat.x, 0, seat.z),
        heading: seat.heading,
        kind: "lounge-chair",
        color: 0x9aab90,
      });
    }

    cylinder(0.27, 0.30, 0.06, 0x596b53, -18.0, 0.15, 4.1);
    cylinder(0.025, 0.025, 2.5, 0x596b53, -18.0, 1.4, 4.1);
    const shade = cylinder(0.28, 0.47, 0.45, 0xeee0be, -18.0, 2.65, 4.1);
    shade.material = material(0xeee0be, {
      emissive: 0xe4b064,
      emissiveIntensity: 0.05,
    }).clone();
    lampMaterials.push(shade.material);
    obstacle(-18.0, 4.1, 0.45, 0.45);

    const title = label("PANTRY & REST", 4.6, 0.5, "#e1d7c3", "#7c8a72");
    title.rotation.x = -Math.PI / 2;
    title.position.set(-11.5, 0.15, 10.3);
  }

  function createMeetingRoom() {
    box(16.0, 0.018, 11.0, 0xc7d2cc, 11.1, 0.115, -5.6);
    box(12.5, 0.018, 7.6, 0xb2c0b8, MEETING_TABLE.x, 0.135, MEETING_TABLE.z);
    const tabletop = box(MEETING_TABLE.width, 0.13, MEETING_TABLE.depth,
      0xeeeae0, MEETING_TABLE.x, 0.95, MEETING_TABLE.z);
    tabletop.userData.kind = "meeting-table";
    box(7.6, 0.015, 0.55, 0xa9b8ae,
      MEETING_TABLE.x, 1.025, MEETING_TABLE.z);
    for (const offset of [-2.6, 2.6]) {
      box(0.35, 0.77, 1.9, 0x6d8277,
        MEETING_TABLE.x + offset, 0.52, MEETING_TABLE.z);
    }
    obstacle(MEETING_TABLE.x, MEETING_TABLE.z,
      MEETING_TABLE.width, MEETING_TABLE.depth);

    for (const seat of MEETING_SEATS) {
      const member = TEAM.find((item) => item.id === seat.ownerId);
      createChair(member, {
        position: new THREE.Vector3(seat.x, 0, seat.z),
        heading: seat.heading,
        kind: "meeting-chair",
        color: 0x62756c,
      });
    }
    for (const x of [-2.6, 0, 2.6]) {
      for (const z of [-0.85, 0.85]) {
        createMug(MEETING_TABLE.x + x + 0.35, 1.03,
          MEETING_TABLE.z + z, 0xe9eee6);
        box(0.52, 0.025, 0.38, 0xc9d2c5,
          MEETING_TABLE.x + x - 0.25, 1.04, MEETING_TABLE.z + z);
      }
    }

    box(6.6, 2.9, 0.12, 0x46564f, 11.1, 2.1, -11.04);
    box(6.32, 2.62, 0.04, 0xf4f3e9, 11.1, 2.1, -10.95);
    const screen = label("PAWFFICE\nTEAM MEETING", 5.8, 1.5, "#f4f3e9", "#71877a");
    screen.position.set(11.1, 2.1, -10.91);
    const title = label("RUANG MEETING", 4.6, 0.5, "#c7d2cc", "#60786c");
    title.rotation.x = -Math.PI / 2;
    title.position.set(11.1, 0.14, -1.0);
  }

  function createOwnerRoom() {
    box(16.0, 0.018, 11.0, 0xe4ddce, 11.1, 0.115, 5.6);
    box(13.5, 0.018, 7.5, 0xd3cbbb, 11.1, 0.13, 5.6);
    box(8.0, 0.9, 0.8, 0x9fac99, 11.1, 0.59, 10.0);
    box(8.12, 0.10, 0.88, 0xe6d8bf, 11.1, 1.08, 10.0);
    obstacle(11.1, 10.0, 8.1, 0.9);
    for (let index = 0; index < 6; index += 1) {
      const x = 7.75 + index * 1.34;
      box(1.24, 0.70, 0.035, 0xb5c0ab, x, 0.61, 9.58);
      box(0.14, 0.03, 0.04, 0x687e70, x + 0.3, 0.82, 9.54);
    }
    const title = label("OWNER & ASSISTANT", 5.2, 0.5, "#e4ddce", "#798477");
    title.rotation.x = -Math.PI / 2;
    title.position.set(11.1, 0.15, 1.5);
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
    root.position.y = WORKSTATION.seatedHeight;
    root.rotation.y = workHeading(data);
    root.userData.kind = "avatar";
    root.userData.ownerId = data.id;
    scene.add(root);

    sphere(0.38, data.shirt, 0, 1.02, 0, body, [1, 1.2, 0.77]);
    sphere(0.32, data.pants, 0, 0.73, -0.01, body, [1, 0.52, 0.79]);
    cylinder(0.16, 0.17, 0.13, data.patch, 0, 1.40, 0, body);

    // Kerah dan dasi dibuat dari objek terpisah agar mudah diedit.
    const collarLeft = box(0.17, 0.13, 0.045, 0xfaf4e6, -0.095, 1.34, 0.27, body);
    const collarRight = box(0.17, 0.13, 0.045, 0xfaf4e6, 0.095, 1.34, 0.27, body);
    collarLeft.rotation.z = -0.40;
    collarRight.rotation.z = 0.40;

    if (data.uniform === "tie") {
      box(0.10, 0.11, 0.045, data.accent, 0, 1.28, 0.30, body);
      const tie = box(0.12, 0.30, 0.035, data.accent, 0, 1.08, 0.30, body);
      tie.rotation.z = 0.05;
    } else if (data.uniform === "cardigan") {
      box(0.20, 0.49, 0.055, 0xf5edda, 0, 1.05, 0.283, body);

      for (const x of [-0.16, 0.16]) {
        const cord = box(0.018, 0.44, 0.023, 0xd5ab7f, x / 2, 1.12, 0.32, body);
        cord.rotation.z = x > 0 ? -0.28 : 0.28;
      }
    } else if (data.uniform === "apron") {
      box(0.44, 0.47, 0.055, data.accent, 0, 1.05, 0.29, body);
      box(0.22, 0.14, 0.025, 0xf2ead7, 0, 0.90, 0.325, body);
    } else {
      box(0.43, 0.48, 0.055, data.accent, 0, 1.05, 0.29, body);
      box(0.12, 0.46, 0.025, 0xf5edda, 0, 1.05, 0.325, body);
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

    const speechLines = {
      miko: "one paw at a time.",
      nori: "let's map the flow.",
      luna: "ideas need color.",
      kiko: "building the page.",
      bimo: "data stays tidy.",
      piko: "let's test it!",
      owner: "a clear direction.",
      sasa: "keeping us in sync.",
    };
    const speech = createSpeech(speechLines[data.id]);
    speech.position.set(0, 2.66, 0);
    root.add(speech);

    root.traverse((object) => {
      if (object.isMesh) {
        object.userData.catId = data.id;
      }
    });

    for (const leg of legs) {
      leg.rotation.x = -1.15;
    }

    for (const arm of arms) {
      arm.rotation.x = -1.0;
    }

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
      navTarget: null,
      navCooldown: 0,
      navStall: 0,
      motion: 0,
      energy: 92 - cats.length * 1.5,
      mood: 94 + (cats.length % 4),
      timer: 32 + cats.length * 3,
      workProgress: 0,
      facing: workHeading(data),
      phase: cats.length * 2.7,
      portrait: "",
    };
    cats.push(cat);
    return cat;
  }

  function renderCrewCards() {
    const list = $("team-list");
    list.replaceChildren();
    $("team-count").textContent = String(TEAM.length).padStart(2, "0");

    for (const member of TEAM) {
      const button = document.createElement("button");
      button.className = member.id === simulation.selectedId
        ? "crew-card selected"
        : "crew-card";
      button.id = `crew-${member.id}`;
      button.dataset.cat = member.id;
      button.setAttribute("aria-pressed", String(member.id === simulation.selectedId));

      const portrait = document.createElement("img");
      portrait.className = "crew-avatar";
      portrait.id = `portrait-${member.id}`;
      portrait.alt = `${member.name}, kucing kantor dengan seragam ${member.role}`;

      const info = document.createElement("span");
      info.className = "crew-info";

      const name = document.createElement("strong");
      name.textContent = member.name;

      const role = document.createElement("span");
      role.textContent = member.role;

      const state = document.createElement("span");
      state.className = "crew-state";
      state.id = `state-${member.id}`;
      state.textContent = "● Menyiapkan pekerjaan";
      info.append(name, role, state);

      const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      arrow.classList.add("crew-arrow");
      const arrowIcon = document.createElementNS("http://www.w3.org/2000/svg", "use");
      arrowIcon.setAttribute("href", "#i-arrow");
      arrow.append(arrowIcon);

      button.append(portrait, info, arrow);
      list.append(button);
    }
  }

  function renderJobdesk() {
    const list = $("jobdesk-list");
    list.replaceChildren();

    for (const member of TEAM) {
      const card = document.createElement("article");
      card.className = "jobdesk-card";
      const name = document.createElement("h3");
      name.textContent = member.name;
      const role = document.createElement("p");
      role.className = "jobdesk-role";
      role.textContent = member.role;
      const tasks = document.createElement("ul");

      for (const duty of ROLE_DETAILS[member.id].jobdesk) {
        const item = document.createElement("li");
        item.textContent = duty;
        tasks.append(item);
      }

      card.append(name, role, tasks);
      list.append(card);
    }
  }

  function createWorkspaceLabels() {
    const container = $("workspace-labels");
    container.replaceChildren();
    for (const item of workspaceLabels) {
      item.anchor.removeFromParent();
    }
    workspaceLabels.length = 0;

    for (const cat of cats) {
      const member = cat.data;
      const tag = document.createElement("div");
      tag.className = "workspace-label";
      tag.setAttribute("role", "listitem");
      tag.dataset.ownerId = member.id;
      const name = document.createElement("span");
      name.textContent = member.name;
      const role = document.createElement("strong");
      role.textContent = ROLE_DETAILS[member.id].label;
      tag.append(name, role);
      container.append(tag);

      // Satu anchor milik avatar, bukan posisi layar atau susunan label lain.
      const anchor = new THREE.Object3D();
      anchor.position.set(0, 2.65, 0);
      cat.root.add(anchor);
      workspaceLabels.push({
        element: tag,
        anchor,
        point: new THREE.Vector3(),
      });
    }
  }

  function updateWorkspaceLabels() {
    camera.updateMatrixWorld();
    const pixelsPerUnit = viewportHeight * camera.zoom
      / (camera.top - camera.bottom);
    const scale = Math.min(1.1, pixelsPerUnit / 32);

    for (const item of workspaceLabels) {
      const point = item.anchor.getWorldPosition(item.point).project(camera);
      const visible = Math.abs(point.x) <= 1
        && Math.abs(point.y) <= 1 && Math.abs(point.z) <= 1;
      item.element.hidden = !visible;

      if (!visible) {
        continue;
      }

      // Proyeksi tepat di atas avatar: tidak dijepit ke tepi atau ditata ulang.
      const x = (point.x + 1) * viewportWidth / 2;
      const y = (1 - point.y) * viewportHeight / 2;
      item.element.style.transform = [
        `translate(${x}px, ${y}px)`,
        "translate(-50%, -100%)",
        `scale(${scale})`,
      ].join(" ");
    }
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
    minX: -18.7,
    minZ: -10.7,
    step: 0.32,
    columns: 118,
    rows: 68,
    radius: 0.40,
    agentSeparation: 0.92,
    arrivalRadius: 0.10,
  };

  function blocked(x, z, mover = null, avoidCats = false) {
    if (x < -18.7 || x > 18.7 || z < -10.7 || z > 10.7) {
      return true;
    }

    const hitsFurniture = obstacles.some((item) => {
      if (mover && item.ownerId === mover.data.id) {
        return false;
      }

      if (item.type === "circle") {
        return Math.hypot(x - item.x, z - item.z)
          < item.radius + navigation.radius;
      }

      const paddedWidth = item.width / 2 + navigation.radius;
      const paddedDepth = item.depth / 2 + navigation.radius;
      return Math.abs(x - item.x) < paddedWidth
        && Math.abs(z - item.z) < paddedDepth;
    });

    if (hitsFurniture) {
      return true;
    }

    return avoidCats && mover !== null && cats.some((other) => {
      if (other === mover) {
        return false;
      }

      return Math.hypot(x - other.root.position.x, z - other.root.position.z)
        < navigation.agentSeparation;
    });
  }

  function segmentHitsCircle(start, end, x, z, radius) {
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const lengthSquared = dx * dx + dz * dz;
    const projection = lengthSquared > 0
      ? ((x - start.x) * dx + (z - start.z) * dz) / lengthSquared
      : 0;
    const t = Math.max(0, Math.min(1, projection));
    const closestX = start.x + dx * t;
    const closestZ = start.z + dz * t;
    return Math.hypot(closestX - x, closestZ - z) < radius - 0.000001;
  }

  function segmentHitsBox(start, end, item) {
    let enter = 0;
    let leave = 1;

    for (const axis of ["x", "z"]) {
      const size = axis === "x" ? item.width : item.depth;
      const halfSize = size / 2 + navigation.radius;
      const minimum = item[axis] - halfSize;
      const maximum = item[axis] + halfSize;
      const delta = end[axis] - start[axis];

      if (Math.abs(delta) < 0.0000001) {
        if (start[axis] <= minimum || start[axis] >= maximum) {
          return false;
        }

        continue;
      }

      const a = (minimum - start[axis]) / delta;
      const b = (maximum - start[axis]) / delta;
      enter = Math.max(enter, Math.min(a, b));
      leave = Math.min(leave, Math.max(a, b));

      if (enter >= leave - 0.0000001) {
        return false;
      }
    }

    return leave > 0.0000001 && enter < 1 - 0.0000001;
  }

  function segmentClear(start, end, mover = null, avoidCats = false) {
    if (blocked(end.x, end.z, mover, avoidCats)) {
      return false;
    }

    // Uji seluruh ruas secara geometris. Sampling jarang bisa melewatkan
    // sudut meja, lalu karakter tersangkut ketika langkah kecil menyentuhnya.
    for (const item of obstacles) {
      if (mover && item.ownerId === mover.data.id) {
        continue;
      }

      const hit = item.type === "circle"
        ? segmentHitsCircle(
          start, end, item.x, item.z, item.radius + navigation.radius
        )
        : segmentHitsBox(start, end, item);

      if (hit) {
        return false;
      }
    }

    if (avoidCats && mover) {
      for (const other of cats) {
        if (other !== mover && segmentHitsCircle(
          start,
          end,
          other.root.position.x,
          other.root.position.z,
          navigation.agentSeparation
        )) {
          return false;
        }
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

  function findPath(start, end, mover = null, avoidCats = false) {
    if (blocked(end.x, end.z, mover, avoidCats)) {
      return [];
    }

    if (segmentClear(start, end, mover, avoidCats)) {
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
      walkable[i] = blocked(position.x, position.z, mover, avoidCats) ? 0 : 1;
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

        if (distance < bestDistance
          && segmentClear(position, candidate, mover, avoidCats)) {
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

          if (i === route.length - 1
            || !segmentClear(previous, route[i + 1], mover, avoidCats)) {
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

        if (!segmentClear(point(current), nextPoint, mover, avoidCats)) {
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
    const seat = MEETING_SEATS.find((item) => item.ownerId === cat.data.id);
    const targets = {
      work: cat.data.desk,
      coffee: COFFEE_TARGET,
      lounge: LOUNGE_SPOTS[index % LOUNGE_SPOTS.length],
      meeting: seat ? new THREE.Vector3(seat.x, 0, seat.z) : null,
    };
    const target = targets[activity];

    if (!target) {
      return false;
    }

    let route = findPath(cat.root.position, target, cat, true);

    if (!route.length) {
      // Bedakan tujuan yang tidak terjangkau dari jalur yang hanya sedang dipakai.
      const staticRoute = findPath(cat.root.position, target, cat, false);

      if (!staticRoute.length) {
        toast(`${cat.data.name} belum menemukan jalan. Coba aktivitas lain.`);
        return false;
      }

      route = [];
    }

    cat.route = route;
    cat.navTarget = target.clone();
    cat.navCooldown = 0;
    cat.navStall = 0;
    cat.motion = 0;
    cat.mode = "walk";
    cat.activity = activity;
    cat.task = {
      work: "Kembali ke meja",
      coffee: "Menuju coffee corner",
      lounge: "Menuju pantry untuk istirahat",
      meeting: "Menuju meja diskusi",
    }[activity];
    return true;
  }

  function arrive(cat) {
    cat.route = [];
    cat.motion = 0;
    cat.navTarget = null;
    cat.navStall = 0;
    cat.mode = cat.activity;
    cat.timer = cat.mode === "work" ? 28 + Math.random() * 22 : 8 + Math.random() * 5;
    cat.task = {
      work: cat.data.tasks[Math.floor(Math.random() * cat.data.tasks.length)],
      coffee: "Menikmati kopi hangat",
      lounge: "Beristirahat di pantry",
      meeting: "Tukar ide bareng tim",
    }[cat.mode];

    if (cat.mode === "work") {
      cat.facing = workHeading(cat.data);
      cat.root.position.copy(cat.data.desk);
      cat.root.position.y = WORKSTATION.seatedHeight;
      cat.root.rotation.y = cat.facing;
    } else if (cat.mode === "coffee") {
      cat.facing = Math.PI;
      simulation.coffee = true;
      simulation.daily.coffeeVisits += 1;
      addEvent(cat.data.name, "menemukan kebahagiaan dalam secangkir kopi.");
      checkDailyMissions();
    } else if (cat.mode === "meeting") {
      const seat = MEETING_SEATS.find((item) => item.ownerId === cat.data.id);
      cat.facing = seat.heading;
      cat.root.rotation.y = seat.heading;
      cat.root.position.y = WORKSTATION.seatedHeight;
      addEvent(cat.data.name, "sudah duduk dan siap bertukar ide.");
    } else {
      const seat = LOUNGE_SEATS.find((item) => item.ownerId === cat.data.id);
      cat.facing = seat.heading;
      cat.root.rotation.y = seat.heading;
      cat.root.position.y = WORKSTATION.seatedHeight;
      simulation.daily.loungeVisits += 1;
      addEvent(cat.data.name, "istirahat sebentar. Ide juga perlu ruang.");
      checkDailyMissions();
    }
  }

  function replanRoute(cat) {
    const route = findPath(cat.root.position, cat.navTarget, cat, true);
    cat.route = route;
    cat.navCooldown = 0.45;
    return route.length > 0;
  }

  function moveCat(cat, dt) {
    const position = cat.root.position;
    const destination = cat.navTarget;
    cat.motion = 0;
    cat.navCooldown = Math.max(0, cat.navCooldown - dt);

    if (!destination) {
      return;
    }

    const remaining = Math.hypot(
      destination.x - position.x,
      destination.z - position.z
    );

    // Kedatangan ditentukan dari tujuan asli, bukan dari habisnya waypoint.
    if (remaining <= navigation.arrivalRadius
      && segmentClear(position, destination, cat, true)) {
      position.x = destination.x;
      position.z = destination.z;
      arrive(cat);
      return;
    }

    while (cat.route.length > 0) {
      const waypoint = cat.route[0];
      const gap = Math.hypot(waypoint.x - position.x, waypoint.z - position.z);

      if (gap > 0.0001) {
        break;
      }

      cat.route.shift();
    }

    if (cat.route.length === 0) {
      cat.navStall += dt;

      if (cat.navCooldown <= 0) {
        replanRoute(cat);
      }

      return;
    }

    const target = cat.route[0];
    const dx = target.x - position.x;
    const dz = target.z - position.z;
    const distance = Math.hypot(dx, dz);
    const speed = cat.data.id === "miko" ? 1.12 : 1.27;
    const step = Math.min(distance, speed * dt);

    const next = {
      x: position.x + dx / distance * step,
      z: position.z + dz / distance * step,
    };

    if (!segmentClear(position, next, cat, true)) {
      cat.navStall += dt;

      if (cat.navCooldown <= 0) {
        replanRoute(cat);
      }

      return;
    }

    position.x = next.x;
    position.z = next.z;
    cat.motion = step / Math.max(dt, 0.0001);
    cat.navStall = 0;
    cat.facing = Math.atan2(dx, dz);
  }

  // ---------- Kebutuhan karakter dan jadwal sederhana ----------

  function updateSimulation(dt) {
    if (dt <= 0) {
      return;
    }

    simulation.elapsed += dt;

    if (cats.some((cat) => cat.mode === "work")) {
      simulation.daily.focusSeconds += dt;
    }

    for (const cat of cats) {
      if (cat.mode === "walk") {
        moveCat(cat, dt);
        cat.energy = Math.max(20, cat.energy - dt * 0.12);
      } else {
        // Peserta yang datang lebih dulu duduk menunggu peserta lainnya.
        const waitingForTeam = cat.mode === "meeting" && cats.some((other) => {
          return other !== cat
            && other.activity === "meeting"
            && other.mode === "walk";
        });

        if (waitingForTeam) {
          cat.task = "Duduk menunggu teman";
        } else {
          cat.timer -= dt;

          if (cat.mode === "meeting") {
            cat.task = "Tukar ide bareng tim";
          }
        }

        if (cat.mode === "work") {
          cat.energy = Math.max(20, cat.energy - dt * 0.17);
          cat.mood = Math.max(45, cat.mood - dt * 0.025);
          cat.workProgress += dt;
          simulation.daily.contributors.add(cat.data.id);
          advanceMainQuest(cat, dt);

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

    const wholeTeamInMeeting = cats.length === TEAM.length
      && cats.every((cat) => cat.activity === "meeting" && cat.mode === "meeting");

    if (wholeTeamInMeeting && !simulation.daily.meetingWasTogether) {
      simulation.daily.meetingRounds += 1;
      addEvent("Tim", "berkumpul untuk membahas proyek utama.");
      checkDailyMissions();
    }

    simulation.daily.meetingWasTogether = wholeTeamInMeeting;
    checkDailyMissions();
  }

  function advanceMainQuest(cat, dt) {
    const stage = MAIN_QUEST.stages[simulation.mainQuest.stageIndex];

    if (!stage || stage.roleId !== cat.data.id) {
      return;
    }

    simulation.mainQuest.stageSeconds += dt;

    if (simulation.mainQuest.stageSeconds < MAIN_QUEST.stageWorkSeconds) {
      return;
    }

    simulation.mainQuest.stageIndex += 1;
    simulation.mainQuest.stageSeconds = 0;
    simulation.daily.stageCompletions += 1;
    simulation.happiness += 25;
    addEvent(cat.data.name, `menuntaskan tahap “${stage.title.toLowerCase()}”.`);

    if (simulation.mainQuest.stageIndex === MAIN_QUEST.stages.length) {
      addEvent("Pawffice", "menyelesaikan sistem booking dan siap menyerahkannya ke klien.");
      toast("Quest utama selesai! Sistem booking siap diserahkan ✧");
    } else {
      const nextStage = MAIN_QUEST.stages[simulation.mainQuest.stageIndex];
      const nextOwner = TEAM.find((member) => member.id === nextStage.roleId);
      toast(`${stage.title} selesai. Berikutnya giliran ${nextOwner.name} ✧`);
    }

    checkDailyMissions();
    saveProgress(true);
  }

  function animateCat(cat, dt) {
    const t = simulation.elapsed + cat.phase;
    const walking = cat.mode === "walk" && cat.motion > 0.02;
    const working = cat.mode === "work";
    const seated = working || cat.mode === "meeting" || cat.mode === "lounge";
    const targetY = seated
      ? WORKSTATION.seatedHeight
      : walking ? 0.105 + Math.sin(t * 12) * 0.035 : 0.10;
    const blend = 1 - Math.exp(-12 * dt);
    cat.root.position.y = THREE.MathUtils.lerp(cat.root.position.y, targetY, blend);

    if (working) {
      cat.root.position.x = cat.data.desk.x;
      cat.root.position.z = cat.data.desk.z;
      cat.facing = workHeading(cat.data);
    }

    const angle = Math.atan2(
      Math.sin(cat.facing - cat.root.rotation.y),
      Math.cos(cat.facing - cat.root.rotation.y)
    );
    cat.root.rotation.y += angle * blend;
    cat.body.rotation.z = seated ? 0 : Math.sin(t * (walking ? 10 : 1.7))
      * (walking ? 0.035 : 0.012);
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
      } else if (seated) {
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
    return readJakartaTime().shortTime;
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
    simulation.selectedId = cat.data.id;
    simulation.seen.add(cat.data.id);
    simulation.daily.seenToday.add(cat.data.id);
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

    checkDailyMissions();
    saveProgress(true);
    updateUI();
  }

  function getDailyQuestStatus(quest) {
    const daily = simulation.daily;
    const seenToday = daily.seenToday.size;

    switch (quest.id) {
      case "focus": {
        const progress = Math.min(30, Math.floor(daily.focusSeconds));
        return {
          done: daily.focusSeconds >= 30,
          detail: `Biarkan tim bekerja · ${progress}/30 dtk`,
        };
      }
      case "coffee":
        return {
          done: daily.coffeeVisits >= 1,
          detail: `Kunjungan coffee corner · ${Math.min(1, daily.coffeeVisits)}/1`,
        };
      case "huddle":
        return {
          done: daily.meetingRounds >= 1,
          detail: `Diskusi bersama tim · ${Math.min(1, daily.meetingRounds)}/1`,
        };
      case "lounge":
        return {
          done: daily.loungeVisits >= 1,
          detail: `Kunjungan area santai · ${Math.min(1, daily.loungeVisits)}/1`,
        };
      case "collaborate":
        return {
          done: daily.contributors.size >= 3,
          detail: `Role yang ikut bekerja · ${Math.min(3, daily.contributors.size)}/3`,
        };
      case "project":
        return {
          done: daily.stageCompletions >= 1,
          detail: `Tahap proyek diselesaikan · ${Math.min(1, daily.stageCompletions)}/1`,
        };
      case "meet-three":
        return {
          done: seenToday >= 3,
          detail: `Pilih rekan yang berbeda · ${Math.min(3, seenToday)}/3`,
        };
      case "meet-all":
        return {
          done: seenToday >= TEAM.length,
          detail: `Kenali seluruh anggota · ${Math.min(TEAM.length, seenToday)}/${TEAM.length}`,
        };
      default:
        return { done: false, detail: quest.detail };
    }
  }

  function checkDailyMissions() {
    let completedQuest = false;

    for (const quest of dailyQuestsForDate(simulation.daily.dateKey)) {
      const status = getDailyQuestStatus(quest);

      if (status.done && !simulation.daily.completedQuestIds.has(quest.id)) {
        simulation.daily.completedQuestIds.add(quest.id);
        simulation.happiness += 10;
        completedQuest = true;
        toast(`Quest sampingan selesai: ${quest.title} ✧`);
        addEvent("Quest", `“${quest.title}” selesai. Tim mendapat +10 happiness.`);
      }
    }

    renderMissions();
    saveProgress(completedQuest);
  }

  function renderMissions() {
    const quests = dailyQuestsForDate(
      simulation.daily.dateKey || readJakartaTime().dateKey
    );
    const signature = JSON.stringify({
      quests: quests.map((quest) => quest.id),
      completed: [...simulation.daily.completedQuestIds].sort(),
      focus: Math.floor(simulation.daily.focusSeconds),
      coffee: simulation.daily.coffeeVisits,
      meeting: simulation.daily.meetingRounds,
      lounge: simulation.daily.loungeVisits,
      stages: simulation.daily.stageCompletions,
      contributors: simulation.daily.contributors.size,
      seen: simulation.daily.seenToday.size,
      happiness: simulation.happiness,
    });

    if (signature === lastMissionSignature) {
      return;
    }

    lastMissionSignature = signature;
    const container = $("mission-list");
    container.replaceChildren();

    for (const quest of quests) {
      const status = getDailyQuestStatus(quest);
      const row = document.createElement("div");
      const checkbox = document.createElement("span");
      const content = document.createElement("div");
      const heading = document.createElement("strong");
      const description = document.createElement("p");

      const completedToday = simulation.daily.completedQuestIds.has(quest.id);
      row.className = status.done || completedToday ? "mission done" : "mission";
      checkbox.className = "mission-check";
      checkbox.innerHTML = '<svg><use href="#i-check"/></svg>';
      heading.textContent = quest.title;
      description.textContent = completedToday && !status.done
        ? "Selesai hari ini"
        : status.detail;
      content.append(heading, description);
      row.append(checkbox, content);
      container.append(row);
    }

    const completed = quests.filter((quest) => {
      return simulation.daily.completedQuestIds.has(quest.id);
    }).length;
    $("mission-total").textContent = `${completed} / ${quests.length}`;
    $("happiness").textContent = `+${simulation.happiness}`;
  }

  function renderMainQuest() {
    const stages = MAIN_QUEST.stages;
    const stageIndex = simulation.mainQuest.stageIndex;
    const currentStage = stages[stageIndex];
    const stageProgress = currentStage
      ? Math.min(1, simulation.mainQuest.stageSeconds / MAIN_QUEST.stageWorkSeconds)
      : 0;
    const percent = Math.min(100, Math.round(
      ((stageIndex + stageProgress) / stages.length) * 100
    ));
    const signature = `${stageIndex}:${Math.floor(simulation.mainQuest.stageSeconds)}:${percent}`;

    if (signature === lastMainQuestSignature) {
      return;
    }

    lastMainQuestSignature = signature;
    $("main-quest-percent").textContent = `${percent}%`;
    $("main-quest-fill").style.width = `${percent}%`;
    $("main-quest-progressbar").setAttribute("aria-valuenow", String(percent));
    $("main-quest-stage-count").textContent = currentStage
      ? `Tahap ${stageIndex + 1} dari ${stages.length} · ${Math.floor(stageProgress * 100)}% tahap ini`
      : `Semua ${stages.length} tahap selesai`;
    $("main-quest-stage").textContent = currentStage
      ? currentStage.title
      : "Proyek siap diserahkan ke klien";

    const owner = currentStage
      ? TEAM.find((member) => member.id === currentStage.roleId)
      : null;
    $("main-quest-owner").textContent = owner
      ? `${owner.name} · ${owner.role}`
      : "Tim Pawffice · proyek selesai";

    const list = $("main-quest-steps");
    list.replaceChildren();

    stages.forEach((stage, index) => {
      const member = TEAM.find((person) => person.id === stage.roleId);
      const item = document.createElement("li");
      item.className = index < stageIndex
        ? "quest-step done"
        : index === stageIndex
          ? "quest-step current"
          : "quest-step";
      item.textContent = `${member.name} · ${stage.title}`;
      list.append(item);
    });
  }

  function updateUI() {
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

    renderMainQuest();
    renderMissions();
  }

  // ---------- Kamera orbit: seret, zoom, fokus, dan kembali ----------

  function resize() {
    const bounds = $("scene").getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const aspect = width / height;
    const viewHeight = Math.max(30.0, 47.0 / aspect);
    viewportWidth = width;
    viewportHeight = height;
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

    const radius = 50;
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
    updateRoomButtons("overview");
  }

  function updateRoomButtons(activeId) {
    for (const id of ["overview", ...Object.keys(OFFICE_ROOMS)]) {
      const button = $(`room-${id}`);
      const active = id === activeId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }
    $("room-current-name").textContent = activeId === "overview"
      ? "Semua ruangan" : OFFICE_ROOMS[activeId].name;
    $("location-menu").open = false;
  }

  function focusRoom(id) {
    const room = OFFICE_ROOMS[id];
    orbit.follow = false;
    orbit.goalTheta = 0.62;
    orbit.goalPhi = 0.90;
    orbit.goalZoom = room.zoom;
    orbit.goalTarget.set(room.x, 0.8, room.z);
    updateRoomButtons(id);
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
    toast(simulation.paused
      ? "Aktivitas dijeda. Jam WIB tetap berjalan."
      : "Para meng kembali beraktivitas."
    );
  }

  function applyTheme(night) {
    if (appliedTheme === night) {
      return;
    }

    appliedTheme = night;
    simulation.night = night;
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
      ? "THE STUDIO · NIGHT LIGHT · WIB"
      : "THE STUDIO · DAYLIGHT · WIB";
  }

  function toggleTheme() {
    // Pilihan manual berlaku sampai halaman dimuat ulang.
    simulation.themeOverride = !simulation.night;
    applyTheme(simulation.themeOverride);
    toast(simulation.night ? "Lampu hangat, suasana malam." : "Selamat datang kembali, matahari.");
  }

  function installButtons() {
    for (const cat of cats) {
      $(`crew-${cat.data.id}`).addEventListener("click", () => selectCat(cat));
    }

    $("home-button").addEventListener("click", resetCamera);
    $("pause-button").addEventListener("click", togglePause);
    $("theme-button").addEventListener("click", toggleTheme);
    $("room-overview").addEventListener("click", resetCamera);
    for (const id of Object.keys(OFFICE_ROOMS)) {
      $(`room-${id}`).addEventListener("click", () => focusRoom(id));
    }

    const jobdeskDialog = $("jobdesk-dialog");
    $("jobdesk-button").addEventListener("click", () => jobdeskDialog.showModal());
    $("jobdesk-close").addEventListener("click", () => jobdeskDialog.close());
    jobdeskDialog.addEventListener("click", (event) => {
      if (event.target !== jobdeskDialog) {
        return;
      }
      const rect = jobdeskDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom) {
        jobdeskDialog.close();
      }
    });

    $("focus-button").addEventListener("click", () => {
      orbit.follow = true;
      orbit.goalZoom = 3.5;
      orbit.goalTheta = 0.28;
      orbit.goalPhi = 1.16;
      toast(`Kenalan lebih dekat dengan ${selected.data.name}. Overview untuk kembali.`);
    });

    $("speed-button").addEventListener("click", () => {
      const speeds = [1, 2, 4];
      simulation.speed = speeds[(speeds.indexOf(simulation.speed) + 1) % speeds.length];
      $("speed-button").textContent = `${simulation.speed}×`;
      toast(`Kecepatan aktivitas ${simulation.speed}×. Jam WIB tetap waktu nyata.`);
    });

    $("coffee-button").addEventListener("click", () => {
      const moved = navigate(selected, "coffee");

      if (moved) {
        toast(simulation.paused
          ? `Coffee break ${selected.data.name} siap. Lanjutkan waktu agar mulai berjalan.`
          : `${selected.data.name} menuju coffee corner. Ambil jeda sebentar!`
        );
        addEvent(selected.data.name, "mengambil jeda kopi sebentar.");
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
          : "Saatnya tukar ide di ruang meeting."
        );
        addEvent("Tim", "menjadwalkan diskusi kecil.");
      }
    });

    document.addEventListener("keydown", (event) => {
      const tag = event.target.tagName;

      if (jobdeskDialog.open) {
        return;
      }

      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || event.target.isContentEditable) {
        return;
      }

      if (event.code === "Space" && !["BUTTON", "A", "SUMMARY"].includes(tag)) {
        event.preventDefault();
        togglePause();
      } else if (event.key.toLowerCase() === "r" || event.key === "Escape") {
        resetCamera();
      } else if (event.key.toLowerCase() === "j") {
        jobdeskDialog.showModal();
      } else if (/^[1-8]$/.test(event.key)) {
        const index = Number(event.key) - 1;

        if (cats[index]) {
          selectCat(cats[index]);
        }
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
    updateWorkspaceLabels();

    selectionRing.position.set(selected.root.position.x, 0.135, selected.root.position.z);
    selectionRing.material.opacity = 0.55 + Math.sin(simulation.elapsed * 2) * 0.10;

    for (const puff of steamPuffs) {
      const phase = (simulation.elapsed * 0.35 + puff.offset) % 1;
      puff.mesh.position.y = 1.50 + phase * 0.70;
      puff.mesh.position.x = puff.baseX + Math.sin(phase * 5) * 0.05;
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
    loadProgress();

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
    sunlight.shadow.camera.left = -30;
    sunlight.shadow.camera.right = 30;
    sunlight.shadow.camera.top = 30;
    sunlight.shadow.camera.bottom = -30;
    sunlight.shadow.normalBias = 0.035;
    sunlight.shadow.bias = -0.0002;
    sunlight.shadow.radius = 3;
    scene.add(sunlight);

    const fill = new THREE.DirectionalLight(0xdde8d1, 0.65);
    fill.position.set(6, 5, -4);
    scene.add(fill);
    const warmLamp = new THREE.PointLight(0xffcb85, 9, 6, 2);
    warmLamp.position.set(-18.0, 2.4, 4.1);
    scene.add(warmLamp);

    createRoom();
    createWorkRoom();
    createPantryRoom();
    createMeetingRoom();
    createOwnerRoom();
    TEAM.forEach(createDesk);
    createCoffeeCorner();
    TEAM.forEach(createCat);
    renderCrewCards();
    renderJobdesk();
    createWorkspaceLabels();
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

    updateLiveClock();
    selectCat(cats.find((cat) => cat.data.id === simulation.selectedId) || cats[0]);
    addEvent("Miko", "menyusun rencana proyek website booking.");
    addEvent("Nori", "membaca brief klien dan mencatat kebutuhan.");
    addEvent("Luna", "menyiapkan kanvas desain untuk website.");
    installCameraControls();
    installButtons();
    resize();
    updateCamera(1);
    new ResizeObserver(resize).observe($("scene"));

    // Jam nyata berjalan sendiri, termasuk saat aktivitas karakter dijeda.
    window.setInterval(updateLiveClock, 1000);
    window.addEventListener("pagehide", () => saveProgress(true));

    document.addEventListener("visibilitychange", () => {
      clock.getDelta();

      if (document.hidden) {
        saveProgress(true);
      } else {
        updateLiveClock();
      }
    });
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
