/* Pusat kantor: jadwal, pengajuan lembur, absen, dan laporan sesi. */
(() => {
  "use strict";

  function mount(options) {
    const { schedule, team } = options;
    const $ = (id) => document.getElementById(id);
    const dialog = $("office-dialog");
    const content = $("office-content");
    const notice = $("office-message");
    let tab = "notifications";
    let lastSignature = "";
    const choices = new Map();
    const person = (id) => team.find((item) => item.id === id);
    const timeText = (value) => value
      ? new Date(value).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }) + " WIB"
      : "Belum tercatat";
    const statusNames = { todo: "Belum mulai", doing: "Dikerjakan", review: "Menunggu review", done: "Disetujui" };
    const otNames = { none: "Tidak mengajukan", pending: "Menunggu izin", approved: "Diizinkan", declined: "Ditolak", expired: "Kedaluwarsa", finished: "Selesai" };

    function node(tag, text, className) {
      const element = document.createElement(tag);
      if (text !== undefined) element.textContent = text;
      if (className) element.className = className;
      return element;
    }

    function button(label, action, primary = false) {
      const element = node("button", label, primary ? "project-primary" : "project-button");
      element.type = "button";
      element.addEventListener("click", action);
      return element;
    }

    function change(action) {
      try {
        action();
        options.onChange();
        notice.textContent = "Catatan kantor diperbarui. Status penyimpanan tersedia di panel quest.";
        render();
      } catch (error) {
        notice.textContent = error.message;
        refresh(true);
      }
    }

    function notifications() {
      const state = options.getState();
      content.append(button("Tandai semua sudah dibaca", () => change(() => {
        state.notifications.forEach((item) => { item.read = true; });
      })));
      content.append(node("p", "Pengajuan yang belum diputuskan tetap dihitung di badge lonceng sampai ditanggapi atau kedaluwarsa pada 17.00 WIB.", "project-muted"));
      if (!state.notifications.length) content.append(node("p", "Belum ada notifikasi. Pengajuan lembur muncul 16.30–16.50 WIB jika ada tugas tertunda dan energi mencukupi.", "project-callout"));
      const ordered = [...state.notifications].reverse().sort((a, b) => {
        const pending = (item) => item.dateKey === state.day.dateKey && item.kind === "overtime-request"
          && state.day.members.find((record) => record.id === item.memberId)?.overtime.status === "pending";
        return Number(pending(b)) - Number(pending(a));
      });
      for (const notification of ordered) {
        const member = person(notification.memberId);
        const record = state.day.members.find((item) => item.id === notification.memberId);
        const card = node("article", undefined, `project-note office-notice${notification.read ? "" : " unread"}`);
        card.append(node("h3", `${member.name} · ${member.role}`));
        card.append(node("p", `${notification.dateKey} · ${timeText(notification.createdAt)}`, "project-muted"));
        card.append(node("p", notification.text));
        const actions = node("div", undefined, "project-actions");
        actions.append(button("Lihat avatar", () => {
          notification.read = true;
          options.onChange();
          dialog.close();
          options.focusMember(member.id);
        }));
        if (notification.kind === "daily-report") actions.append(button("Baca laporan", () => { tab = "reports"; render(); }));
        if (notification.kind === "overtime-request" && notification.dateKey === state.day.dateKey) {
          card.append(node("p", `Status: ${otNames[record.overtime.status]}`, "project-callout"));
          if (record.overtime.status === "pending") {
            card.append(node("p", `Energi saat ini: ${Math.round(options.energy(member.id))}. Lembur mulai 18.00 setelah jeda istirahat.`));
            const label = node("label", undefined, "project-field");
            label.append(node("span", "Izinkan lembur sampai"));
            const select = node("select");
            for (const minute of schedule.OVERTIME_ENDS) {
              const option = node("option", `${schedule.formatMinute(minute)} WIB`);
              option.value = String(minute);
              select.append(option);
            }
            select.value = String(choices.get(member.id) || 1140);
            select.addEventListener("change", () => choices.set(member.id, Number(select.value)));
            label.append(select);
            card.append(label);
            actions.append(button("Izinkan lembur", () => change(() => {
              options.decide(member.id, "approve", Number(select.value));
            }), true));
            actions.append(button("Pulang dulu", () => change(() => options.decide(member.id, "decline"))));
          }
        }
        if (!notification.read) actions.append(button("Sudah dibaca", () => change(() => { notification.read = true; })));
        card.append(actions);
        content.append(card);
      }
    }

    function routine() {
      const state = options.getState();
      content.append(node("p", `Sekarang: ${schedule.phase(options.now()).label} · WIB`, "project-callout"));
      const list = node("dl", undefined, "office-shifts");
      for (const shift of schedule.SHIFTS) {
        list.append(node("dt", `${shift.time} WIB`), node("dd", shift.label));
      }
      content.append(list);
      content.append(node("p", "Jadwal berlaku setiap hari. Jam WIB tetap berjalan saat animasi dijeda atau dipercepat. Pengajuan tidak dijawab sampai 17.00 berarti pulang; tidak ada izin lembur otomatis.", "project-muted"));
      content.append(node("h3", "Absen simulasi hari ini"));
      content.append(node("p", "Absen dicatat saat kehadiran teramati di halaman, bukan catatan kehadiran pegawai nyata. Membuka kantor siang hari tidak membuat catatan kedatangan palsu pada pagi hari.", "project-muted"));
      for (const record of state.day.members) {
        const card = node("article", undefined, "project-note");
        card.append(node("h4", person(record.id).name));
        card.append(node("p", schedule.attendance(state, options.now(), record.id).label));
        card.append(node("p", `Masuk: ${timeText(record.checkedInAt)} · Pulang reguler: ${timeText(record.checkedOutAt)}`));
        card.append(node("p", `Lembur: ${otNames[record.overtime.status]}${record.overtime.untilMinute ? ` · batas ${schedule.formatMinute(record.overtime.untilMinute)} WIB` : ""}`));
        content.append(card);
      }
    }

    function reports() {
      const state = options.getState();
      content.append(node("p", "Laporan dirangkum mulai 16.30 WIB dari aktivitas yang tercatat. Riwayat menyimpan hari ini dan maksimal tujuh hari kunjungan sebelumnya. Aktivitas tab tertutup tidak direka ulang.", "project-muted"));
      let count = 0;
      for (const day of [state.day, ...state.history]) {
        for (const record of day.members) {
          if (!record.report) continue;
          count += 1;
          const report = record.report;
          const card = node("details", undefined, "project-note");
          card.append(node("summary", `${day.dateKey} · ${person(record.id).name} · Daily report`));
          card.append(node("p", `Dirangkum ${timeText(report.createdAt)} · ${report.projectTitle}`));
          card.append(node("p", `Absen masuk: ${timeText(record.checkedInAt)} · Pulang reguler: ${timeText(record.checkedOutAt)}`));
          card.append(node("p", `Waktu aktivitas kerja teramati: ${Math.floor(report.activeSeconds / 60)} menit. ${report.note}`));
          card.append(node("h4", "Aktivitas sesi yang tercatat"));
          const actions = node("ul");
          report.actions.forEach((action) => actions.append(node("li", `${timeText(action.at)} · ${action.text}`)));
          if (!report.actions.length) actions.append(node("li", "Belum ada tindakan tugas proyek yang tercatat pada sesi hari ini."));
          card.append(actions, node("h4", "Status tugas saat laporan dirangkum"));
          const tasks = node("ul");
          report.tasks.forEach((task) => tasks.append(node("li", `${task.title} · ${statusNames[task.status]}`)));
          if (!report.tasks.length) tasks.append(node("li", "Belum ada tugas yang dibagikan."));
          card.append(tasks);
          content.append(card);
        }
      }
      if (!count) content.append(node("p", "Daily report belum tersedia. Laporan dibuat mulai 16.30 jika ada kehadiran yang tercatat hari ini.", "project-callout"));
    }

    function render() {
      content.replaceChildren();
      for (const button of $("office-tabs").querySelectorAll("button")) {
        if (button.dataset.officeTab === tab) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      }
      ({ notifications, routine, reports })[tab]();
    }

    function refresh(force = false) {
      const state = options.getState();
      if (!state) return;
      const count = schedule.unread(state);
      $("office-badge").textContent = count > 99 ? "99+" : String(count);
      $("office-badge").hidden = count === 0;
      $("office-bell").setAttribute("aria-label", `Pusat kantor, ${count} notifikasi belum ditangani`);
      $("office-phase").textContent = schedule.phase(options.now()).label;
      $("office-project-bell").hidden = count === 0;
      $("office-project-bell").textContent = `🔔 ${count} kabar kantor`;
      const signature = JSON.stringify([schedule.phase(options.now()).id, state.day.dateKey,
        state.day.members.map((record) => [record.checkedInAt, record.checkedOutAt, record.overtime,
          record.report?.createdAt, record.overtime.status === "pending" ? Math.floor(options.energy(record.id)) : null]), state.notifications]);
      if (dialog.open && (force || signature !== lastSignature)) render();
      lastSignature = signature;
    }

    function openNotifications() {
      options.sync();
      tab = "notifications";
      render();
      notice.textContent = "";
      dialog.showModal();
    }
    $("office-bell").addEventListener("click", openNotifications);
    $("office-project-bell").addEventListener("click", openNotifications);
    $("office-routine-button").addEventListener("click", () => {
      options.sync();
      tab = "routine";
      render();
      notice.textContent = "";
      dialog.showModal();
    });
    $("office-close").addEventListener("click", () => dialog.close());
    for (const button of $("office-tabs").querySelectorAll("button")) {
      button.addEventListener("click", () => { tab = button.dataset.officeTab; render(); });
    }
    return { refresh };
  }

  globalThis.PawfficeOfficeUI = { mount };
})();
