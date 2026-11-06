/* Pawffice Projects — aturan proyek lokal, tanpa DOM, backend, atau AI. */
(() => {
  "use strict";

  const TASKS = [
    {
      id: "scope", ownerId: "miko", title: "Susun scope dan rencana kerja",
      dependsOn: [], output: "Scope proyek",
      checks: ["Tujuan sesuai brief", "Batas pekerjaan jelas", "Tahapan kerja tercatat"],
    },
    {
      id: "analysis", ownerId: "nori", title: "Rangkum kebutuhan sistem",
      dependsOn: ["scope"], output: "Spesifikasi kebutuhan",
      checks: ["Kebutuhan klien tercakup", "Alur pengguna dijelaskan", "Kriteria penerimaan jelas"],
    },
    {
      id: "design", ownerId: "luna", title: "Rancang halaman dan user flow",
      dependsOn: ["analysis"], output: "Rancangan UI/UX tertulis",
      checks: ["Daftar halaman tersedia", "Alur utama sesuai kebutuhan", "Responsivitas dipertimbangkan"],
    },
    {
      id: "frontend", ownerId: "kiko", title: "Susun rencana implementasi frontend",
      dependsOn: ["design"], output: "Rencana frontend",
      checks: ["Komponen mengikuti rancangan", "State formulir dirinci", "Integrasi dan aksesibilitas dicatat"],
    },
    {
      id: "backend", ownerId: "bimo", title: "Susun rancangan data dan layanan",
      dependsOn: ["analysis"], output: "Rencana backend",
      checks: ["Entitas data dicatat", "Validasi dan otorisasi dibahas", "Kontrak layanan direncanakan"],
    },
    {
      id: "qa", ownerId: "piko", title: "Siapkan skenario uji dan catatan QA",
      dependsOn: ["frontend", "backend"], output: "Checklist pengujian",
      checks: ["Skenario utama tercakup", "Kasus gagal ikut dirancang", "Hasil nyata tidak diklaim sudah diuji"],
    },
    {
      id: "handover", ownerId: "sasa", title: "Siapkan paket serah-terima",
      dependsOn: ["qa"], output: "Ringkasan serah-terima",
      checks: ["Dokumen tim dirangkum", "Pekerjaan lanjutan dicatat", "Agenda review klien tersedia"],
    },
    {
      id: "approval", ownerId: "owner", title: "Review akhir dan persetujuan simulasi",
      dependsOn: ["handover"], output: "Catatan review Owner",
      checks: ["Hasil dibandingkan dengan brief", "Batas simulasi dijelaskan", "Keputusan akhir dicatat"],
    },
  ];
  const STATUSES = ["todo", "doing", "review", "done"];
  const KINDS = ["Company profile", "Booking / reservasi", "Toko online", "Dashboard / sistem internal", "Website lainnya"];
  const methods = typeof module !== "undefined" && module.exports
    ? {
      waterfall: require("./methods/waterfall.js"), agile: require("./methods/agile.js"),
      hybrid: require("./methods/hybrid.js"),
    }
    : globalThis.PawfficeMethods;
  if (!methods?.waterfall || !methods?.agile || !methods?.hybrid) throw new Error("Modul metode proyek belum lengkap.");
  const METHODS = Object.values(methods);
  const PRIORITIES = { high: "Tinggi", normal: "Sedang", low: "Rendah" };
  const isIterative = (project) => methods[project?.method]?.iterative === true;
  const planningDefinitions = (method) => TASKS.filter((task) => methods[method]?.planningIds?.includes(task.id));
  const progressUnit = (project) => project?.method === "hybrid" ? "milestone disetujui"
    : project?.method === "agile" ? "fitur diterima" : "tugas disetujui";
  const progressRule = (project) => project?.method === "hybrid"
    ? "Progres = (scope, analisis awal, dan fitur diterima) / seluruh milestone. Tambahan scope dapat mengubah persentase."
    : project?.method === "agile"
      ? "Progres = fitur diterima / seluruh backlog. Perubahan cakupan dapat mengubah persentase."
      : "Progres berdasarkan tugas yang disetujui, bukan timer.";
  let sequence = 0;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const id = () => globalThis.crypto?.randomUUID?.()
    || `project-${Date.now().toString(36)}-${++sequence}-${Math.random().toString(36).slice(2, 9)}`;

  function text(value, limit, label, required = true) {
    if (typeof value !== "string" || value.length > limit || (required && !value.trim())) {
      throw new Error(`${label} tidak valid atau terlalu panjang.`);
    }
    return value.trim();
  }

  function date(value, label) {
    const result = text(value, 40, label);
    if (!/^\d{4}-\d{2}-\d{2}T/.test(result) || !Number.isFinite(Date.parse(result))) {
      throw new Error(`${label} bukan tanggal yang valid.`);
    }
    return result;
  }

  function brief(input) {
    const kind = text(input.kind, 60, "Jenis website");
    if (!KINDS.includes(kind)) throw new Error("Pilih jenis website yang tersedia.");
    const requirements = typeof input.requirements === "string"
      ? input.requirements.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      : input.requirements;
    if (!Array.isArray(requirements) || requirements.length < 1 || requirements.length > 20) {
      throw new Error("Isi 1–20 kebutuhan, satu kebutuhan per baris.");
    }
    const deadline = text(input.deadline || "", 10, "Target tanggal", false);
    const deadlineDate = new Date(`${deadline}T00:00:00Z`);
    if (deadline && (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)
      || !Number.isFinite(deadlineDate.getTime())
      || deadlineDate.toISOString().slice(0, 10) !== deadline)) {
      throw new Error("Target tanggal tidak valid.");
    }
    return {
      title: text(input.title, 120, "Nama proyek"),
      client: text(input.client, 100, "Nama klien"),
      kind,
      goal: text(input.goal, 1200, "Tujuan proyek"),
      requirements: requirements.map((line) => text(line, 240, "Kebutuhan")),
      deadline,
    };
  }

  function emptyWorkspace() {
    return { version: 1, active: null, archive: [] };
  }

  function createProject(workspace, input) {
    if (workspace.active) throw new Error("Arsipkan proyek aktif sebelum membuat proyek baru.");
    const metadata = brief(input);
    const method = input.method || "waterfall";
    if (!Object.hasOwn(methods, method)) throw new Error("Pilih metode yang tersedia.");
    const project = {
      ...metadata,
      id: id(),
      createdAt: now(),
      updatedAt: now(),
      archivedAt: null,
      migrated: false,
      legacySeconds: 0,
      method,
      backlog: methods[method].iterative ? methods[method].suggest(metadata.requirements, id) : [],
      iterations: [],
      tasks: (methods[method].iterative ? planningDefinitions(method) : TASKS).map((definition) => ({
        id: definition.id,
        status: "todo",
        artifact: "",
        checks: definition.checks.map(() => false),
        updatedAt: null,
      })),
      meetings: [],
    };
    workspace.active = project;
    return project;
  }

  function summary(project) {
    if (isIterative(project)) return methods[project.method].summarize(project);
    const done = project ? project.tasks.filter((task) => task.status === "done").length : 0;
    return {
      done,
      total: TASKS.length,
      percent: Math.round(done / TASKS.length * 100),
      complete: done === TASKS.length,
    };
  }

  function blockers(project, taskId) {
    const spec = definition(project, taskId);
    const task = project.tasks.find((item) => item.id === taskId);
    if (!spec || !task) throw new Error("Tugas tidak dikenal.");
    const dependencies = (methods[project.method] || methods.waterfall).dependencies(spec, task);
    return dependencies.filter((dependency) => {
      return project.tasks.find((task) => task.id === dependency)?.status !== "done";
    });
  }

  function artifactTemplate(project, taskId) {
    const spec = definition(project, taskId);
    const task = project.tasks.find((item) => item.id === taskId);
    const feature = project.backlog?.find((item) => item.id === task?.featureId);
    const features = feature
      ? `Fitur: ${feature.title}\nKebutuhan: ${feature.need}\nKriteria penerimaan: ${feature.criteria}`
      : (project.method === "hybrid" ? project.backlog
        .filter((item) => ["draft", "baseline"].includes(item.scopeStatus))
        .map((item) => `${item.title}: ${item.need}\nKriteria: ${item.criteria}`)
        : project.requirements).map((item, index) => `${index + 1}. ${item}`).join("\n");
    const sections = {
      scope: ["Dalam lingkup", features, "Di luar lingkup", "Belum termasuk implementasi/deployment nyata atau integrasi AI.",
        "Rencana", isIterative(project) && feature
          ? "Dalam iterasi terpilih, rinci kebutuhan fitur → desain → rencana FE/BE → QA → catatan serah-terima → penerimaan fitur. Review prioritas backlog sebelum iterasi berikutnya."
          : project.method === "hybrid"
            ? "Sahkan scope dan analisis awal → pilih fitur iterasi → review per fitur. Tambahan kebutuhan setelah scope disahkan memerlukan alasan dan persetujuan perubahan scope."
            : "Analisis → desain → rencana FE dan BE → QA → serah-terima → review Owner."],
      analysis: ["Kebutuhan fungsional", features, "Alur utama", "Pengunjung membuka halaman → menggunakan fitur utama → menerima konfirmasi/status.",
        "Kriteria penerimaan", "Periksa setiap kebutuhan bersama klien; catat input, output, dan kondisi gagal."],
      design: ["Halaman yang perlu dirancang", "Beranda, halaman fitur utama, formulir, konfirmasi, dan keadaan kosong/error.",
        "Arah visual", "Layout responsif, hierarki heading jelas, kontras memadai, fokus keyboard terlihat.",
        "Kebutuhan acuan", features, "Catatan", "Ini rancangan tertulis, belum gambar wireframe atau desain final."],
      frontend: ["Komponen", "Navigasi, daftar/kartu informasi, formulir, pesan validasi, loading, serta konfirmasi.",
        "State dan integrasi", "Rancang state kosong/loading/sukses/gagal. Sepakati kontrak data dengan Backend.",
        "Acuan fitur", features, "Pekerjaan berikutnya", "Implementasikan dan uji komponen pada proyek website nyata."],
      backend: ["Rancangan data", "Tentukan entitas pengguna, data inti layanan, dan catatan transaksi sesuai brief.",
        "Rancangan layanan", "Rinci operasi baca/tambah/ubah data, validasi input, otorisasi, dan penanganan kesalahan.",
        "Kebutuhan acuan", features, "Pekerjaan berikutnya", "Tetapkan skema dan kontrak endpoint sebelum implementasi nyata."],
      qa: ["Skenario yang perlu diuji", features, "Kasus tambahan", "Input kosong/tidak valid, data ganda, akses tanpa izin, mobile, dan navigasi keyboard.",
        "Status eksekusi", "BELUM DIJALANKAN pada website nyata. Catat expected/actual, langkah reproduksi, dan hasil retest saat implementasi tersedia."],
      handover: ["Paket dokumen", project.tasks.filter((task) => task.status === "done")
        .filter((item) => !feature || item.featureId === feature.id)
        .map((item) => `- ${definition(project, item.id).output}`).join("\n"),
        "Agenda klien", "Review tujuan, demonstrasi hasil jika tersedia, daftar pekerjaan tersisa, dan jadwal tindak lanjut.",
        "Batas serah-terima", "Paket saat ini hanya dokumen simulasi; belum source website siap deploy."],
      approval: ["Keputusan Owner", "Draf: tinjau kelengkapan dokumen terhadap tujuan dan kebutuhan klien.",
        "Kebutuhan acuan", features, "Catatan persetujuan", "Persetujuan di Pawffice berlaku untuk alur simulasi, bukan bukti website nyata sudah selesai atau lolos uji."],
    };
    return [
      `# ${spec.output}`,
      `Metode: ${methodName(project)}`,
      `Proyek: ${project.title}`,
      `Klien: ${project.client}`,
      `Jenis: ${project.kind}`,
      `Tujuan: ${project.goal}`,
      `Target: ${project.deadline || "Belum ditetapkan"}`,
      "",
      "TEMPLATE SIMULASI LOKAL — bukan hasil AI atau implementasi terverifikasi.",
      "Edit dan review dokumen ini sesuai kebutuhan proyek.",
      "",
      ...sections[task.baseId || taskId],
    ].join("\n\n");
  }

  function changeTask(workspace, taskId, action, value) {
    const project = workspace.active;
    if (!project) throw new Error("Belum ada proyek aktif.");
    const task = project.tasks.find((item) => item.id === taskId);
    const spec = definition(project, taskId);
    if (!task || !spec) throw new Error("Tugas tidak dikenal.");
    if (blockers(project, taskId).length) throw new Error("Selesaikan tugas prasyarat terlebih dahulu.");

    if (action === "start" && task.status === "todo") {
      task.status = "doing";
    } else if (action === "draft" && task.status === "doing") {
      task.artifact = task.artifact || artifactTemplate(project, taskId);
      task.status = "review";
      task.checks.fill(false);
    } else if (action === "save" && ["doing", "review"].includes(task.status)) {
      const content = text(value, 16000, "Hasil kerja");
      if (content !== task.artifact) task.checks.fill(false);
      task.artifact = content;
      task.status = "review";
    } else if (action === "check" && task.status === "review") {
      if (!Number.isInteger(value) || value < 0 || value >= task.checks.length) {
        throw new Error("Checklist tidak valid.");
      }
      task.checks[value] = !task.checks[value];
    } else if (action === "revise" && task.status === "review") {
      task.status = "doing";
      task.checks.fill(false);
    } else if (action === "approve" && task.status === "review") {
      if (!task.artifact.trim() || !task.checks.every(Boolean)) {
        throw new Error("Selesaikan seluruh checklist review sebelum menyetujui hasil.");
      }
      methods[project.method]?.beforeApprove?.(project, task);
      task.status = "done";
    } else {
      throw new Error("Perubahan status ini tidak tersedia.");
    }
    task.updatedAt = now();
    project.updatedAt = task.updatedAt;
    if (action === "approve") methods[project.method]?.afterApprove?.(project, task);
    return task;
  }

  function methodName(project) {
    return project?.method === "legacy" || !project?.method
      ? "Alur lama" : methods[project.method]?.name || "Metode tidak dikenal";
  }

  function definition(project, taskId) {
    const task = project?.tasks.find((item) => item.id === taskId);
    const base = TASKS.find((item) => item.id === (task?.baseId || taskId));
    if (!base) return null;
    const feature = project?.backlog?.find((item) => item.id === task?.featureId);
    return { ...base, title: feature ? `${base.title} · ${feature.title}` : base.title };
  }

  const iterativeActions = Object.fromEntries(METHODS.filter((method) => method.iterative).map((method) => [
    method.id, method.createActions({ text, id, now, TASKS, PRIORITIES, method }),
  ]));
  const featureInput = iterativeActions.agile.featureInput;
  const { saveFeature, backlogAction, startIteration, closeIteration, approveScopeChange } = Object.fromEntries(
    ["saveFeature", "backlogAction", "startIteration", "closeIteration", "approveScopeChange"].map((action) => [
      action, (workspace, ...args) => {
        const handler = iterativeActions[workspace.active?.method]?.[action];
        if (!handler) throw new Error("Aksi ini tidak tersedia untuk metode proyek aktif.");
        return handler(workspace, ...args);
      },
    ]),
  );

  function recordMeeting(workspace) {
    const project = workspace.active;
    if (!project) return null;
    if (project.meetings.length >= 100) {
      throw new Error("Batas 100 notulen per proyek tercapai; ekspor catatan yang ada.");
    }
    const pending = project.tasks.filter((task) => task.status !== "done");
    const meeting = {
      id: id(),
      createdAt: now(),
      note: isIterative(project) && !pending.length && !summary(project).complete
        ? `Tim meninjau backlog ${project.title}. Review kebutuhan, tentukan prioritas, dan rencanakan iterasi berikutnya. Belum semua fitur diterima.`
        : pending.length
        ? `Tim meninjau ${project.title}. Progres ${summary(project).percent}%. Tindak lanjut mengikuti tugas yang belum selesai; urutan prasyarat tetap berlaku.`
        : `Tim meninjau kelengkapan dokumen ${project.title}. Semua tugas simulasi selesai; paket siap diarsipkan.`,
      actions: pending.map((task) => task.id),
    };
    project.meetings.push(meeting);
    project.updatedAt = meeting.createdAt;
    return meeting;
  }

  function archiveActive(workspace) {
    if (!workspace.active) throw new Error("Tidak ada proyek untuk diarsipkan.");
    if (workspace.archive.length >= 100) throw new Error("Batas 100 arsip tercapai. Ekspor cadangan sebelum melanjutkan.");
    const project = workspace.active;
    project.archivedAt = now();
    project.updatedAt = project.archivedAt;
    workspace.archive.unshift(project);
    workspace.active = null;
    return project;
  }

  function resume(workspace, projectId) {
    if (workspace.active) throw new Error("Arsipkan proyek aktif sebelum melanjutkan arsip lain.");
    const index = workspace.archive.findIndex((project) => project.id === projectId);
    if (index < 0) throw new Error("Arsip tidak ditemukan.");
    workspace.active = workspace.archive.splice(index, 1)[0];
    workspace.active.archivedAt = null;
    workspace.active.updatedAt = now();
    return workspace.active;
  }

  function migrateLegacy(legacy = {}) {
    const workspace = emptyWorkspace();
    const project = createProject(workspace, {
      title: "Sistem booking online untuk barbershop",
      client: "Klien barbershop (contoh lama)",
      kind: "Booking / reservasi",
      goal: "Dari brief klien sampai rancangan alur reservasi siap direview.",
      requirements: ["Informasi layanan", "Pemilihan jadwal", "Formulir dan konfirmasi reservasi"],
      deadline: "",
    });
    project.migrated = true;
    project.method = "legacy";
    project.legacySeconds = Math.min(29.999, Math.max(0, Number(legacy.stageSeconds) || 0));
    const completed = Math.min(6, Math.max(0, Math.floor(Number(legacy.stageIndex) || 0)));
    for (const [index, task] of project.tasks.entries()) {
      if (index < completed || completed === 6) {
        task.status = "done";
        task.checks.fill(true);
        task.artifact = `${artifactTemplate(project, task.id)}\n\nCATATAN MIGRASI: status selesai dibawa dari timer versi lama, bukan verifikasi hasil nyata.`;
        task.updatedAt = now();
      }
    }
    return workspace;
  }

  function validateWorkspace(input) {
    if (!input || input.version !== 1 || !Array.isArray(input.archive) || input.archive.length > 100) {
      throw new Error("Format data proyek tidak valid.");
    }
    const ids = new Set();
    function project(value, archived) {
      if (!value || typeof value !== "object") throw new Error("Data proyek tidak lengkap.");
      const metadata = brief(value);
      const method = value.method === undefined ? "legacy" : value.method;
      if (method !== "legacy" && !Object.hasOwn(methods, method)) throw new Error("Metode proyek tidak valid.");
      const backlog = [];
      const iterations = [];
      if (isIterative({ method })) {
        if (!Array.isArray(value.backlog) || value.backlog.length > 40
          || !Array.isArray(value.iterations) || value.iterations.length > 40) {
          throw new Error("Data backlog atau iterasi tidak valid.");
        }
        const featureIds = new Set();
        for (const feature of value.backlog) {
          const featureId = text(feature?.id, 100, "ID fitur");
          if (featureIds.has(featureId) || featureId.includes(":")) throw new Error("ID fitur ganda/tidak valid.");
          featureIds.add(featureId);
          if (typeof feature.approved !== "boolean") throw new Error("Persetujuan backlog tidak valid.");
          backlog.push({
            id: featureId, ...featureInput(feature), approved: feature.approved,
            iterationId: feature.iterationId === null ? null : text(feature.iterationId, 100, "ID iterasi fitur"),
          });
        }
        const iterationIds = new Set();
        const assigned = new Set();
        let openCount = 0;
        for (const iteration of value.iterations) {
          const iterationId = text(iteration?.id, 100, "ID iterasi");
          if (iterationIds.has(iterationId)) throw new Error("ID iterasi ganda.");
          iterationIds.add(iterationId);
          if (!Array.isArray(iteration.featureIds) || !iteration.featureIds.length
            || iteration.featureIds.length > 5 || new Set(iteration.featureIds).size !== iteration.featureIds.length) {
            throw new Error("Daftar fitur iterasi tidak valid.");
          }
          for (const featureId of iteration.featureIds) {
            const feature = backlog.find((item) => item.id === featureId);
            if (!feature || assigned.has(featureId) || !feature.approved || feature.iterationId !== iterationId) {
              throw new Error("Relasi fitur dan iterasi tidak konsisten.");
            }
            assigned.add(featureId);
          }
          if (iteration.closedAt === null) openCount += 1;
          else if (openCount) throw new Error("Urutan penutupan iterasi tidak valid.");
          iterations.push({
            id: iterationId, title: text(iteration.title, 100, "Nama iterasi"),
            featureIds: [...iteration.featureIds], createdAt: date(iteration.createdAt, "Waktu iterasi"),
            closedAt: iteration.closedAt === null ? null : date(iteration.closedAt, "Waktu penutupan iterasi"),
          });
        }
        if (openCount > 1 || backlog.some((feature) => feature.iterationId && !assigned.has(feature.id))) {
          throw new Error("Iterasi aktif/penugasan fitur tidak valid.");
        }
      } else if ((value.backlog?.length || 0) || (value.iterations?.length || 0)) {
        throw new Error("Backlog iteratif tersedia di Agile dan Hybrid.");
      }
      const projectId = text(value.id, 100, "ID proyek");
      if (ids.has(projectId)) throw new Error("ID proyek ganda ditemukan.");
      ids.add(projectId);
      const specs = isIterative({ method })
        ? [...planningDefinitions(method), ...iterations.flatMap((iteration) => iteration.featureIds.flatMap((featureId) => TASKS.map((spec) => ({
          ...spec, id: `${featureId}:${spec.id}`, baseId: spec.id, featureId,
        }))))] : TASKS;
      if (!Array.isArray(value.tasks) || value.tasks.length !== specs.length) {
        throw new Error("Daftar tugas tidak lengkap.");
      }
      const tasks = specs.map((definition, index) => {
        const task = value.tasks[index];
        if (!task || task.id !== definition.id || !STATUSES.includes(task.status)
          || !Array.isArray(task.checks) || task.checks.length !== definition.checks.length
          || task.checks.some((check) => typeof check !== "boolean")) {
          throw new Error("Status atau checklist tugas tidak valid.");
        }
        const artifact = text(task.artifact, 16000, "Hasil kerja", false);
        if (["review", "done"].includes(task.status) && !artifact) {
          throw new Error("Tugas review/selesai harus memiliki hasil kerja.");
        }
        if (task.status === "done" && !task.checks.every(Boolean)) {
          throw new Error("Tugas selesai memiliki checklist yang belum lengkap.");
        }
        return {
          id: task.id, status: task.status, artifact,
          ...(definition.featureId ? { baseId: definition.baseId, featureId: definition.featureId } : {}),
          checks: [...task.checks],
          updatedAt: task.updatedAt === null ? null : date(task.updatedAt, "Waktu tugas"),
        };
      });
      const result = {
        ...metadata,
        id: projectId,
        createdAt: date(value.createdAt, "Waktu pembuatan"),
        updatedAt: date(value.updatedAt, "Waktu pembaruan"),
        archivedAt: archived ? date(value.archivedAt, "Waktu arsip") : null,
        migrated: value.migrated === true,
        legacySeconds: Math.min(29.999, Math.max(0, Number(value.legacySeconds) || 0)),
        method, backlog, iterations,
        tasks,
        meetings: [],
      };
      if (methods[method]?.validateFeature) {
        backlog.forEach((feature, index) => Object.assign(feature, methods[method].validateFeature(value.backlog[index], result, date)));
        if (tasks.find((task) => task.id === "scope")?.status === "done"
          && !backlog.some((feature) => feature.scopeStatus === "baseline")) {
          throw new Error("Baseline scope awal tidak ditemukan.");
        }
        for (const iteration of iterations) {
          methods[method].beforeIteration(result, backlog.filter((feature) => iteration.featureIds.includes(feature.id)));
        }
      }
      for (const task of tasks) {
        if (task.featureId) {
          const original = value.tasks.find((item) => item.id === task.id);
          if (original.baseId !== task.baseId || original.featureId !== task.featureId) {
            throw new Error("Referensi fitur tugas tidak valid.");
          }
        }
        if (task.status !== "todo" && blockers(result, task.id).length) {
          throw new Error("Urutan prasyarat tugas tidak konsisten.");
        }
      }
      if (iterations.some((iteration) => iteration.closedAt && tasks.some((task) => {
        return iteration.featureIds.includes(task.featureId) && task.status !== "done";
      }))) throw new Error("Iterasi ditutup sebelum hasil disetujui.");
      if (!Array.isArray(value.meetings) || value.meetings.length > 100) {
        throw new Error("Daftar notulen tidak valid.");
      }
      const meetingIds = new Set();
      result.meetings = value.meetings.map((meeting) => {
        const meetingId = text(meeting.id, 100, "ID rapat");
        if (meetingIds.has(meetingId)) throw new Error("ID rapat ganda.");
        meetingIds.add(meetingId);
        if (!Array.isArray(meeting.actions) || meeting.actions.length > tasks.length
          || meeting.actions.some((taskId) => !tasks.some((task) => task.id === taskId))) {
          throw new Error("Tindak lanjut rapat tidak valid.");
        }
        return {
          id: meetingId,
          createdAt: date(meeting.createdAt, "Waktu rapat"),
          note: text(meeting.note, 2000, "Catatan rapat"),
          actions: [...new Set(meeting.actions)],
        };
      });
      return result;
    }
    return {
      version: 1,
      active: input.active === null ? null : project(input.active, false),
      archive: input.archive.map((item) => project(item, true)),
    };
  }

  function projectMarkdown(project) {
    return [
      `# ${project.title}`,
      `Klien: ${project.client}\nJenis: ${project.kind}\nTujuan: ${project.goal}`,
      `Metode: ${methodName(project)}`,
      `Progres simulasi: ${summary(project).percent}%`,
      "Dokumen template lokal — bukan bukti implementasi website atau hasil AI.",
      ...(isIterative(project) ? [
        "## Backlog fitur",
        ...project.backlog.map((feature, index) => `${index + 1}. ${feature.title} · ${PRIORITIES[feature.priority]}\nKebutuhan: ${feature.need}\nKriteria: ${feature.criteria}\nDisetujui: ${feature.approved ? "ya" : "belum"}${feature.scopeStatus ? `\nScope: ${feature.scopeStatus}\nAlasan tambahan scope: ${feature.scopeReason || "Bagian rencana awal"}\nWaktu persetujuan scope: ${feature.scopeApprovedAt || "Belum disetujui"}` : ""}`),
        "## Iterasi",
        ...project.iterations.map((iteration) => `${iteration.title} · ${iteration.closedAt ? "ditutup" : "aktif"}`),
      ] : []),
      ...project.tasks.map((task) => {
        const spec = definition(project, task.id);
        return `## ${spec.title} (${task.status})\n\n${task.artifact || "Belum ada hasil kerja."}`;
      }),
      "## Notulen rapat",
      ...project.meetings.map((meeting) => `${meeting.createdAt}\n\n${meeting.note}\n\n${meeting.actions
        .map((taskId) => `- ${definition(project, taskId).title}`).join("\n")}`),
    ].join("\n\n");
  }

  const api = {
    TASKS, KINDS, STATUSES, METHODS, PRIORITIES, definition, methodName,
    saveFeature, backlogAction, startIteration, closeIteration, approveScopeChange,
    isIterative, progressUnit, progressRule,
    clone, emptyWorkspace, createProject, summary,
    blockers, changeTask, recordMeeting, archiveActive, resume,
    migrateLegacy, validateWorkspace, projectMarkdown,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalThis.PawfficeProjects = api;
})();
