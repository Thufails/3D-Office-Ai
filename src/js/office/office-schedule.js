/* Jadwal WIB dan catatan sesi lokal; tidak menyelesaikan tugas proyek. */
(() => {
  "use strict";
  const SHIFTS = [
    { id: "arrival", start: 420, end: 540, label: "Datang & absen", time: "07.00–09.00" },
    { id: "morning", start: 540, end: 720, label: "Kerja produktif pagi", time: "09.00–12.00" },
    { id: "lunch", start: 720, end: 780, label: "Ishoma", time: "12.00–13.00" },
    { id: "afternoon", start: 780, end: 990, label: "Kerja produktif siang", time: "13.00–16.30" },
    { id: "report", start: 990, end: 1020, label: "Daily report & absen pulang", time: "16.30–17.00" },
    { id: "break", start: 1020, end: 1080, label: "Pulang / jeda sebelum lembur", time: "17.00–18.00" },
    { id: "overtime", start: 1080, end: 1260, label: "Lembur dengan izin", time: "18.00–21.00" },
  ];
  const OVERTIME_ENDS = [1140, 1200, 1260];
  const STATES = ["none", "pending", "approved", "declined", "expired", "finished"];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const minutes = (time) => time.hour * 60 + time.minute;
  const stamp = (time) => `${time.dateKey}T${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}:${String(time.second || 0).padStart(2, "0")}+07:00`;
  const formatMinute = (minute) => `${String(Math.floor(minute / 60)).padStart(2, "0")}.${String(minute % 60).padStart(2, "0")}`;
  const hash = (value) => [...value].reduce((result, char) => (result * 31 + char.charCodeAt(0)) >>> 0, 0);

  function phase(time) {
    return SHIFTS.find((shift) => minutes(time) >= shift.start && minutes(time) < shift.end)
      || { id: "closed", label: "Kantor tutup", time: "21.00–07.00" };
  }

  function createDay(dateKey, team) {
    return {
      dateKey,
      members: team.map((person, index) => ({
        id: person.id,
        arrivalMinute: 420 + index * 14 + hash(`${dateKey}:${person.id}`) % 5,
        checkedInAt: null, checkedOutAt: null, activeSeconds: 0, actions: [], report: null,
        overtime: { status: "none", requestedAt: null, untilMinute: null, reason: "", endedAt: null, endReason: "" },
      })),
    };
  }

  function create(time, team) {
    return { version: 1, day: createDay(time.dateKey, team), history: [], notifications: [] };
  }

  function notify(state, time, memberId, kind, text) {
    const dateKey = state.day.dateKey;
    const id = `${dateKey}:${memberId}:${kind}`;
    if (state.notifications.some((item) => item.id === id)) return;
    state.notifications.push({ id, dateKey, memberId, kind, text, createdAt: stamp(time), read: false });
    if (state.notifications.length > 160) state.notifications.splice(0, state.notifications.length - 160);
  }

  function member(state, memberId) {
    const record = state.day.members.find((item) => item.id === memberId);
    if (!record) throw new Error("Anggota kantor tidak ditemukan.");
    return record;
  }

  function finish(state, time, record, reason) {
    record.overtime.status = "finished";
    record.overtime.endedAt = stamp(time);
    record.overtime.endReason = reason;
    notify(state, time, record.id, "overtime-ended", reason);
  }

  function expire(state, time, record) {
    record.overtime.status = "expired";
    state.notifications.filter((item) => item.memberId === record.id && item.dateKey === state.day.dateKey
      && item.kind === "overtime-request").forEach((item) => { item.read = true; });
    notify(state, time, record.id, "overtime-expired", "Pengajuan lembur kedaluwarsa tanpa izin. Mengikuti jadwal pulang biasa.");
  }

  function tick(state, time, context) {
    const before = JSON.stringify(state);
    if (time.dateKey < state.day.dateKey) return false;
    if (state.day.dateKey !== time.dateKey) {
      for (const record of state.day.members) {
        if (record.overtime.status === "pending") expire(state, time, record);
        if (record.overtime.status === "approved") finish(state, time, record, "Jadwal lembur hari sebelumnya sudah berakhir.");
      }
      state.history.unshift(state.day);
      state.history = state.history.slice(0, 7);
      state.day = createDay(time.dateKey, context.team);
    }
    const minute = minutes(time);
    const actors = context.members || [];
    for (const record of state.day.members) {
      const actor = actors.find((item) => item.id === record.id) || {};
      if (minute >= record.arrivalMinute && minute < 1020 && !record.checkedInAt) record.checkedInAt = stamp(time);
      if (minute >= 990 && record.checkedInAt && !record.report) {
        record.report = {
          createdAt: stamp(time), projectTitle: context.projectTitle || "Belum ada proyek aktif",
          activeSeconds: record.activeSeconds, actions: clone(record.actions), tasks: clone(actor.tasks || []).slice(0, 40),
          note: "Ringkasan aktivitas yang tercatat saat halaman terbuka; status tugas bukan bukti implementasi website nyata.",
        };
        notify(state, time, record.id, "daily-report", "Daily report tersedia. Baca aktivitas sesi dan status tugas di pusat kantor.");
      }
      if (minute >= 1020 && record.checkedInAt && !record.checkedOutAt) record.checkedOutAt = stamp(time);
      if (minute >= 1020 && record.overtime.status === "pending") expire(state, time, record);
      if (record.overtime.status === "approved") {
        if (minute >= record.overtime.untilMinute) finish(state, time, record, "Lembur selesai sesuai batas izin. Saatnya pulang.");
        else if (minute >= 1080 && Number(actor.energy) <= 30) finish(state, time, record, "Lembur dihentikan karena energi rendah. Saatnya pulang dan istirahat.");
        else if (minute >= 1080 && Number(actor.energy) <= 45) notify(state, time, record.id, "low-energy", "Energi mulai rendah. Lembur akan dihentikan jika energi mencapai 30.");
      }
    }
    if (minute >= 990 && minute < 1010) {
      const candidates = [...state.day.members].sort((a, b) => hash(`${time.dateKey}:${a.id}:ot`) - hash(`${time.dateKey}:${b.id}:ot`));
      let requested = candidates.filter((record) => record.overtime.status !== "none").length;
      for (const record of candidates) {
        const actor = actors.find((item) => item.id === record.id);
        const pending = actor?.tasks?.find((task) => task.status !== "done");
        if (requested >= 3) break;
        if (!record.checkedInAt || record.overtime.status !== "none" || !pending || !(actor.energy >= 60)) continue;
        record.overtime.status = "pending";
        record.overtime.requestedAt = stamp(time);
        record.overtime.reason = `Ingin melanjutkan “${pending.title}”.`;
        notify(state, time, record.id, "overtime-request", record.overtime.reason);
        requested += 1;
      }
    }
    return before !== JSON.stringify(state);
  }

  function decide(state, time, memberId, decision, untilMinute = 1140) {
    const record = member(state, memberId);
    if (time.dateKey !== state.day.dateKey || minutes(time) < 990 || minutes(time) >= 1020
      || record.overtime.status !== "pending") throw new Error("Pengajuan sudah kedaluwarsa atau sudah ditanggapi.");
    if (!["approve", "decline"].includes(decision)) throw new Error("Keputusan lembur tidak valid.");
    if (decision === "approve" && !OVERTIME_ENDS.includes(untilMinute)) throw new Error("Pilih batas 19.00, 20.00, atau 21.00 WIB.");
    record.overtime.status = decision === "approve" ? "approved" : "declined";
    record.overtime.untilMinute = decision === "approve" ? untilMinute : null;
    state.notifications.filter((item) => item.memberId === memberId && item.dateKey === time.dateKey
      && item.kind === "overtime-request").forEach((item) => { item.read = true; });
    notify(state, time, memberId, "overtime-decision", decision === "approve"
      ? `Lembur diizinkan 18.00–${formatMinute(untilMinute)} WIB. Istirahat dahulu pada 17.00–18.00.`
      : "Pengajuan lembur ditolak. Mengikuti jadwal pulang biasa.");
    return record;
  }

  function attendance(state, time, memberId) {
    const record = member(state, memberId);
    const minute = minutes(time);
    if (time.dateKey !== state.day.dateKey || minute < record.arrivalMinute || minute >= 1260) {
      return { id: "away", label: minute < 540 ? "Belum datang" : "Sudah pulang", goal: "away" };
    }
    if (minute < 540) return { id: "prepare", label: "Hadir · persiapan kerja", goal: "prepare" };
    if (minute < 720 || (minute >= 780 && minute < 990)) return { id: "work", label: "Bekerja", goal: "work" };
    if (minute < 780) return { id: "lunch", label: "Ishoma", goal: "lounge" };
    if (minute < 1020) return { id: "report", label: record.overtime.status === "pending" ? "Daily report · menunggu izin lembur" : "Daily report & persiapan pulang", goal: "report" };
    if (record.overtime.status === "approved" && minute < record.overtime.untilMinute) {
      return minute < 1080
        ? { id: "break", label: "Jeda sebelum lembur", goal: "lounge" }
        : { id: "overtime", label: `Lembur hingga ${formatMinute(record.overtime.untilMinute)}`, goal: "work" };
    }
    return { id: "away", label: "Sudah pulang", goal: "away" };
  }

  function recordAction(state, time, memberId, action, title) {
    if (time.dateKey !== state.day.dateKey || !["start", "draft", "save", "revise", "approve"].includes(action)) return;
    const record = member(state, memberId);
    if (!record.checkedInAt || !["work", "report", "overtime", "prepare"].includes(attendance(state, time, memberId).id)) return;
    const names = { start: "Mulai", draft: "Buat draf", save: "Simpan dokumen", revise: "Revisi", approve: "Hasil disetujui" };
    record.actions.push({ at: stamp(time), text: `${names[action]}: ${title}` });
    record.actions = record.actions.slice(-20);
    if (record.report && minutes(time) < 1020) record.report.actions = clone(record.actions);
  }

  function accrue(state, time, memberId, seconds) {
    if (time.dateKey !== state.day.dateKey || !["work", "overtime"].includes(attendance(state, time, memberId).id)) return;
    const record = member(state, memberId);
    record.activeSeconds = Math.min(86400, record.activeSeconds + Math.min(2, Math.max(0, seconds)));
  }

  function unread(state) {
    const pending = new Set(state.day.members.filter((record) => record.overtime.status === "pending")
      .map((record) => `${state.day.dateKey}:${record.id}:overtime-request`));
    return state.notifications.filter((item) => !item.read || pending.has(item.id)).length;
  }

  function validate(input, team) {
    if (!input || input.version !== 1 || !Array.isArray(input.history) || input.history.length > 7
      || !Array.isArray(input.notifications) || input.notifications.length > 160) throw new Error("Catatan jadwal kantor tidak valid.");
    const validIds = team.map((person) => person.id);
    const date = (value) => {
      const parsed = typeof value === "string" ? new Date(`${value}T00:00:00Z`) : new Date(NaN);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime())
        || parsed.toISOString().slice(0, 10) !== value) throw new Error("Tanggal catatan kantor tidak valid.");
      return value;
    };
    const timestamp = (value) => {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)
        || value.length > 40 || !Number.isFinite(Date.parse(value))) throw new Error("Waktu catatan kantor tidak valid.");
      return value;
    };
    const text = (value, limit) => {
      if (typeof value !== "string" || value.length > limit) throw new Error("Isi catatan kantor tidak valid.");
      return value;
    };
    const number = (value, max) => {
      if (!Number.isFinite(value) || value < 0 || value > max) throw new Error("Angka catatan kantor tidak valid.");
      return value;
    };
    const actions = (items) => {
      if (!Array.isArray(items) || items.length > 20) throw new Error("Daftar aktivitas kantor tidak valid.");
      return items.map((item) => ({ at: timestamp(item.at), text: text(item.text, 500) }));
    };
    function day(value) {
      const dateKey = date(value?.dateKey);
      if (!Array.isArray(value.members) || value.members.length !== validIds.length) throw new Error("Daftar absensi tidak lengkap.");
      return { dateKey, members: value.members.map((record, index) => {
        if (record.id !== validIds[index] || !Number.isInteger(record.arrivalMinute)
          || record.arrivalMinute < 420 || record.arrivalMinute >= 540) throw new Error("Anggota atau jam datang tidak valid.");
        const ot = record.overtime;
        if (!ot || !STATES.includes(ot.status) || (ot.untilMinute !== null && !OVERTIME_ENDS.includes(ot.untilMinute))) throw new Error("Status lembur tidak valid.");
        if (["approved", "finished"].includes(ot.status) && !OVERTIME_ENDS.includes(ot.untilMinute)) throw new Error("Batas izin lembur tidak valid.");
        if (ot.status !== "none" && !ot.requestedAt) throw new Error("Pengajuan lembur tidak lengkap.");
        if ((record.checkedOutAt || record.report || ot.status !== "none") && !record.checkedInAt) throw new Error("Catatan pulang/laporan/lembur memerlukan absen masuk.");
        if (!["approved", "finished"].includes(ot.status) && ot.untilMinute !== null) throw new Error("Batas lembur tanpa persetujuan.");
        if (ot.status === "finished" && (!ot.endedAt || !ot.endReason)) throw new Error("Catatan akhir lembur tidak lengkap.");
        if (ot.status !== "finished" && (ot.endedAt !== null || ot.endReason !== "")) throw new Error("Catatan akhir lembur tidak sesuai status.");
        if (ot.status === "none" && (ot.requestedAt !== null || ot.reason !== "")) throw new Error("Catatan pengajuan tanpa status.");
        let report = null;
        if (record.report) {
          if (!Array.isArray(record.report.tasks) || record.report.tasks.length > 40) throw new Error("Tugas laporan tidak valid.");
          report = {
            createdAt: timestamp(record.report.createdAt), projectTitle: text(record.report.projectTitle, 120),
            activeSeconds: number(record.report.activeSeconds, 86400), actions: actions(record.report.actions),
            tasks: record.report.tasks.map((task) => {
              if (!["todo", "doing", "review", "done"].includes(task.status)) throw new Error("Status tugas laporan tidak valid.");
              return { title: text(task.title, 300), status: task.status };
            }), note: text(record.report.note, 500),
          };
        }
        return {
          id: record.id, arrivalMinute: record.arrivalMinute,
          checkedInAt: record.checkedInAt === null ? null : timestamp(record.checkedInAt),
          checkedOutAt: record.checkedOutAt === null ? null : timestamp(record.checkedOutAt),
          activeSeconds: number(record.activeSeconds, 86400), actions: actions(record.actions), report,
          overtime: {
            status: ot.status, requestedAt: ot.requestedAt === null ? null : timestamp(ot.requestedAt),
            untilMinute: ot.untilMinute, reason: text(ot.reason, 500),
            endedAt: ot.endedAt === null ? null : timestamp(ot.endedAt), endReason: text(ot.endReason, 500),
          },
        };
      }) };
    }
    const current = day(input.day);
    const history = input.history.map(day);
    if (new Set([current.dateKey, ...history.map((item) => item.dateKey)]).size !== history.length + 1
      || history.some((item) => item.dateKey >= current.dateKey)) throw new Error("Riwayat hari kantor tidak valid.");
    const ids = new Set();
    const notifications = input.notifications.map((item) => {
      if (!validIds.includes(item.memberId) || typeof item.read !== "boolean" || ids.has(item.id)
        || item.id !== `${item.dateKey}:${item.memberId}:${item.kind}`
        || !["daily-report", "overtime-request", "overtime-expired", "overtime-decision", "overtime-ended", "low-energy"].includes(item.kind)) throw new Error("Notifikasi kantor tidak valid.");
      ids.add(item.id);
      return {
        id: text(item.id, 150), dateKey: date(item.dateKey), memberId: item.memberId,
        kind: item.kind, text: text(item.text, 500), createdAt: timestamp(item.createdAt), read: item.read,
      };
    });
    return { version: 1, day: current, history, notifications };
  }

  const api = { SHIFTS, OVERTIME_ENDS, create, tick, decide, attendance, recordAction, accrue, unread, validate, phase, stamp, formatMinute };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalThis.PawfficeSchedule = api;
})();
