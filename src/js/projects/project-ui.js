/* Project Hub — antarmuka DOM lokal. Teks klien selalu memakai textContent. */
(() => {
  "use strict";

  function mount(options) {
    const { engine, team } = options;
    const $ = (id) => document.getElementById(id);
    const dialog = $("project-dialog");
    const content = $("project-content");
    const notice = $("project-message");
    const confirmationDialog = $("project-confirm");
    const statusNames = {
      todo: "Belum mulai", doing: "Dikerjakan", review: "Review", done: "Selesai",
    };
    let tab = "brief";
    let taskId = "scope";
    let dirty = false;
    let pendingImport = null;
    let importRead = 0;
    let confirmation = null;
    const workspace = options.getWorkspace;
    const member = (ownerId) => team.find((person) => person.id === ownerId);
    const definition = (id) => engine.TASKS.find((task) => task.id === id);

    function element(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    function message(text, error = false) {
      notice.textContent = text;
      notice.classList.toggle("is-error", error);
    }

    function button(text, callback, primary = false) {
      const node = element("button", primary ? "project-primary" : "project-button", text);
      node.type = "button";
      node.addEventListener("click", callback);
      return node;
    }

    function askConfirmation(settings, accept) {
      if (confirmation) return;
      confirmation = { accept, trigger: document.activeElement };
      confirmationDialog.dataset.tone = settings.tone || "normal";
      $("project-confirm-icon").textContent = settings.icon || "🐾";
      $("project-confirm-title").textContent = settings.title;
      $("project-confirm-description").textContent = settings.description;
      $("project-confirm-accept").textContent = settings.acceptLabel;
      $("project-confirm-cancel").textContent = settings.cancelLabel || "Batal";
      confirmationDialog.showModal();
      // Fokus awal selalu ke pilihan aman, bukan aksi penggantian data.
      $("project-confirm-cancel").focus();
    }

    function finishConfirmation(accepted) {
      const pending = confirmation;
      if (!pending) return;
      confirmation = null;
      if (confirmationDialog.open) confirmationDialog.close();
      if (accepted) pending.accept();
      if (dialog.open) {
        if (pending.trigger?.isConnected) pending.trigger.focus();
        else $("project-close").focus();
      }
    }

    function mayDiscard(continueAction) {
      if (!dirty) {
        continueAction();
        return;
      }
      askConfirmation({
        icon: "📝",
        title: "Drafnya belum disimpan, nih.",
        description: "Kalau kamu lanjut, perubahan draf ini akan ditinggalkan. Hasil yang sudah disimpan tetap aman.",
        acceptLabel: "Tinggalkan draf",
        cancelLabel: "Lanjut mengedit",
        tone: "warning",
      }, () => {
        dirty = false;
        continueAction();
      });
    }

    function download(filename, body, type) {
      const url = URL.createObjectURL(new Blob([body], { type }));
      const link = element("a");
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function exportProject(project) {
      const name = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 70);
      download(`pawffice-${name || "project"}.md`, engine.projectMarkdown(project), "text/markdown;charset=utf-8");
      message("Dokumen simulasi diekspor sebagai Markdown. Ini bukan source website.");
    }

    function mutate(action, change, skipDraftCheck = false) {
      const apply = () => {
        try {
          const result = change();
          dirty = false;
          options.onChange(action, result);
          render();
          message("Perubahan diterapkan. Status penyimpanan tersedia di panel quest.");
        } catch (error) {
          message(error.message, true);
        }
      };
      if (skipDraftCheck) apply();
      else mayDiscard(apply);
    }

    function field(form, labelText, name, multiline = false, value = "") {
      const label = element("label", "project-field");
      label.append(element("span", "", labelText));
      const input = element(multiline ? "textarea" : "input");
      input.name = name;
      input.id = `project-field-${name}`;
      input.value = value;
      input.required = name !== "deadline";
      label.htmlFor = input.id;
      label.append(input);
      form.append(label);
      return input;
    }

    function projectInfo(project, parent) {
      parent.append(element("h3", "project-section-title", project.title));
      parent.append(element("p", "project-muted", `${project.client} · ${project.kind} · Target: ${project.deadline || "belum ditetapkan"}`));
      parent.append(element("p", "project-goal", project.goal));
      const features = element("ul", "project-features");
      project.requirements.forEach((requirement) => features.append(element("li", "", requirement)));
      parent.append(features);
      if (project.migrated) {
        parent.append(element("p", "project-callout",
          `Proyek dari versi lama. Status selesai dipertahankan, bukan direview ulang. Sisa timer lama (${project.legacySeconds.toFixed(1)} detik) dicatat tetapi tidak mengesahkan tugas baru.`));
      }
    }

    function renderBrief() {
      const project = workspace().active;
      if (project) {
        projectInfo(project, content);
        const progress = engine.summary(project);
        content.append(element("p", "project-callout", `${progress.percent}% · ${progress.done}/${progress.total} tugas disetujui. Tidak bertambah otomatis karena waktu berjalan.`));
        const actions = element("div", "project-actions");
        actions.append(button("Buka papan tugas →", () => switchTab("board"), true));
        actions.append(button("Unduh dokumen .md", () => exportProject(project)));
        actions.append(button("Arsipkan proyek", () => {
          mayDiscard(() => askConfirmation({
            icon: "🗂️",
            title: "Simpan proyek ke arsip?",
            description: progress.complete
              ? `“${project.title}” sudah selesai. Semua dokumen dan notulen tetap tersimpan di tab Arsip.`
              : `“${project.title}” baru ${progress.percent}%. Progres dan dokumen tetap disimpan, lalu bisa dilanjutkan dari tab Arsip.`,
            acceptLabel: "Ya, arsipkan",
          }, () => mutate("archive", () => engine.archiveActive(workspace()), true)));
        }));
        content.append(actions);
        content.append(element("p", "project-muted", "Satu proyek aktif dalam satu waktu. Arsipkan proyek ini bila ingin membuat brief klien baru."));
        return;
      }

      content.append(element("h3", "project-section-title", "🌱 Brief klien baru"));
      content.append(element("p", "project-muted", "Isi kebutuhan sendiri. Pawffice tidak lagi mengunci proyek ke contoh barbershop."));
      const form = element("form", "project-form");
      field(form, "Nama proyek", "title").maxLength = 120;
      field(form, "Nama klien", "client").maxLength = 100;
      const kindLabel = element("label", "project-field");
      kindLabel.append(element("span", "", "Jenis website"));
      const select = element("select");
      select.name = "kind";
      select.required = true;
      engine.KINDS.forEach((kind) => {
        const option = element("option", "", kind);
        option.value = kind;
        select.append(option);
      });
      kindLabel.append(select);
      form.append(kindLabel);
      const deadline = field(form, "Target tanggal (opsional)", "deadline");
      deadline.type = "date";
      const goal = field(form, "Tujuan / masalah yang ingin diselesaikan", "goal", true);
      goal.maxLength = 1200;
      goal.rows = 3;
      const requirements = field(form, "Kebutuhan fitur — 1–20 baris, maksimal 240 karakter/baris", "requirements", true);
      requirements.rows = 6;
      requirements.maxLength = 4820;
      requirements.placeholder = "Contoh: halaman informasi layanan\nFormulir permintaan penawaran\nHalaman kontak";
      form.addEventListener("input", () => { dirty = true; });
      const submit = element("button", "project-primary", "Buat proyek & bagi tugas tim");
      submit.type = "submit";
      form.append(submit);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const values = Object.fromEntries(new FormData(form));
        mutate("create", () => engine.createProject(workspace(), values), true);
      });
      content.append(form);
    }

    function renderBoard() {
      const project = workspace().active;
      if (!project) {
        content.append(element("p", "project-callout", "Belum ada proyek aktif. Buat brief atau lanjutkan proyek dari arsip."));
        return;
      }
      const progress = engine.summary(project);
      content.append(element("h3", "project-section-title", `${project.title} · ${progress.percent}%`));
      content.append(element("p", "project-muted", "Pilih tugas → mulai → buat/edit dokumen → checklist review → setujui. Review dilakukan manual olehmu sebagai pengelola simulasi."));
      const board = element("div", "project-board");
      for (const status of engine.STATUSES) {
        const column = element("section", `project-column status-${status}`);
        const tasks = project.tasks.filter((task) => task.status === status);
        column.append(element("h4", "", `${statusNames[status]} · ${tasks.length}`));
        for (const task of tasks) {
          const spec = definition(task.id);
          const person = member(spec.ownerId);
          const card = button("", () => {
            mayDiscard(() => {
              taskId = task.id;
              render();
              $("task-detail-heading")?.focus();
            });
          });
          card.className = "project-task-card";
          card.setAttribute("aria-pressed", String(task.id === taskId));
          card.append(element("span", "project-task-owner", `${person.name} · ${person.role}`));
          card.append(element("strong", "", spec.title));
          const blockedBy = engine.blockers(project, task.id);
          if (blockedBy.length) {
            card.append(element("small", "project-muted", `Menunggu: ${blockedBy.map((id) => member(definition(id).ownerId).name).join(", ")}`));
          }
          column.append(card);
        }
        if (!tasks.length) column.append(element("p", "project-muted", "Belum ada tugas."));
        board.append(column);
      }
      content.append(board);
      renderTask(project);
    }

    function renderTask(project) {
      const task = project.tasks.find((item) => item.id === taskId) || project.tasks[0];
      taskId = task.id;
      const spec = definition(task.id);
      const person = member(spec.ownerId);
      const detail = element("section", "project-task-detail");
      const heading = element("h3", "project-section-title", `${person.name} · ${spec.output}`);
      heading.id = "task-detail-heading";
      heading.tabIndex = -1;
      detail.append(heading);
      detail.append(element("p", "project-muted", `Status: ${statusNames[task.status]} · Reviewer simulasi: ${task.id === "approval" ? "Owner" : "PM / Owner"}`));
      const blockedBy = engine.blockers(project, task.id);
      if (blockedBy.length) {
        detail.append(element("p", "project-callout", `Selesaikan terlebih dahulu: ${blockedBy.map((id) => definition(id).title).join("; ")}.`));
      }
      const actions = element("div", "project-actions");
      if (task.status === "todo") {
        const start = button("Mulai tugas", () => mutate("start", () => engine.changeTask(workspace(), task.id, "start")), true);
        start.disabled = blockedBy.length > 0;
        actions.append(start);
      }
      if (task.status === "doing") {
        actions.append(button(task.artifact ? "Ajukan ulang untuk review" : "Buat draf template", () => {
          mutate("draft", () => engine.changeTask(workspace(), task.id, "draft"));
        }, true));
      }
      detail.append(actions);
      if (task.artifact) {
        const label = element("label", "project-field");
        label.append(element("span", "", "Dokumen simulasi — boleh diperbaiki, bukan hasil website nyata"));
        const editor = element("textarea", "project-artifact");
        editor.value = task.artifact;
        editor.rows = 13;
        editor.maxLength = 16000;
        editor.readOnly = task.status === "done";
        label.append(editor);
        detail.append(label);
        const reviewControls = [];
        if (task.status !== "done") {
          const save = button("Simpan draf / ajukan review", () => {
            mutate("save", () => engine.changeTask(workspace(), task.id, "save", editor.value), true);
          });
          detail.append(save);
          editor.addEventListener("input", () => {
            dirty = editor.value !== task.artifact;
            reviewControls.forEach((control) => { control.disabled = dirty; });
            if (dirty) message("Draf belum disimpan. Simpan dahulu; perubahan dokumen akan mengulang checklist review.");
            else message("");
          });
        }
        if (task.status === "review") {
          const checklist = element("fieldset", "project-review");
          checklist.append(element("legend", "", "Checklist sebelum persetujuan"));
          spec.checks.forEach((check, index) => {
            const label = element("label");
            const input = element("input");
            input.type = "checkbox";
            input.checked = task.checks[index];
            input.addEventListener("change", () => mutate("check", () => engine.changeTask(workspace(), task.id, "check", index)));
            reviewControls.push(input);
            label.append(input, element("span", "", check));
            checklist.append(label);
          });
          detail.append(checklist);
          const reviewActions = element("div", "project-actions");
          const approve = button("Setujui hasil · +25 happiness", () => {
            mutate("approve", () => engine.changeTask(workspace(), task.id, "approve"));
          }, true);
          approve.disabled = !task.checks.every(Boolean);
          // Saat mengetik, jangan mengaktifkan approve yang checklist-nya belum lengkap.
          editor.addEventListener("input", () => {
            approve.disabled = dirty || !task.checks.every(Boolean);
          });
          const revise = button("Minta revisi", () => mutate("revise", () => engine.changeTask(workspace(), task.id, "revise")));
          reviewControls.push(revise);
          reviewActions.append(approve, revise);
          detail.append(reviewActions);
        }
        if (task.status === "done") {
          detail.append(element("p", "project-callout", "Hasil sudah disetujui dan dikunci agar dokumen tugas turunannya tetap konsisten."));
        }
      }
      content.append(detail);
    }

    function renderMeetings() {
      const project = workspace().active;
      content.append(element("h3", "project-section-title", "🤝 Catatan Sasa"));
      content.append(element("p", "project-muted", "Klik Team huddle di kantor. Setelah semua avatar sampai di kursi meeting, satu notulen template disimpan bersama tindak lanjut tugas. Ini bukan transkrip percakapan AI."));
      if (!project?.meetings.length) {
        content.append(element("p", "project-callout", "Belum ada notulen untuk proyek aktif."));
        return;
      }
      [...project.meetings].reverse().forEach((meeting) => {
        const card = element("article", "project-note");
        card.append(element("h4", "", new Date(meeting.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB"));
        card.append(element("p", "", meeting.note));
        const list = element("ul");
        meeting.actions.forEach((id) => {
          const spec = definition(id);
          const task = project.tasks.find((item) => item.id === id);
          list.append(element("li", "", `${member(spec.ownerId).name} · ${spec.title} · ${statusNames[task.status]}`));
        });
        card.append(list);
        content.append(card);
      });
    }

    function renderArchive() {
      content.append(element("h3", "project-section-title", "🗂️ Proyek yang pernah dikerjakan"));
      if (!workspace().archive.length) content.append(element("p", "project-callout", "Belum ada arsip. Arsipkan proyek dari tab Brief untuk menyimpannya di sini."));
      workspace().archive.forEach((project) => {
        const card = element("details", "project-note");
        const progress = engine.summary(project);
        card.append(element("summary", "", `${project.title} · ${progress.percent}% · ${project.client}`));
        projectInfo(project, card);
        const actions = element("div", "project-actions");
        actions.append(button("Unduh seluruh dokumen .md", () => exportProject(project)));
        const continueButton = button("Lanjutkan proyek ini", () => {
          mutate("resume", () => engine.resume(workspace(), project.id));
        });
        continueButton.disabled = Boolean(workspace().active);
        actions.append(continueButton);
        card.append(actions);
        card.append(element("p", "project-muted", `${project.meetings.length} notulen tersimpan. Arsipkan proyek aktif dahulu jika ingin melanjutkan proyek ini.`));
        project.tasks.forEach((task) => {
          const doc = element("details", "project-archive-document");
          doc.append(element("summary", "", `${definition(task.id).output} · ${statusNames[task.status]}`));
          doc.append(element("pre", "", task.artifact || "Belum ada dokumen."));
          card.append(doc);
        });
        content.append(card);
      });
    }

    function renderBackup() {
      content.append(element("h3", "project-section-title", "💾 Cadangkan satu kantor"));
      content.append(element("p", "project-muted", "JSON berisi proyek aktif, arsip, dokumen, notulen, quest harian, rekan yang dikenal, dan happiness. Simpan secara pribadi bila brief berisi informasi klien."));
      content.append(button("Unduh cadangan JSON", () => {
        download(`pawffice-backup-${new Date().toISOString().slice(0, 10)}.json`,
          JSON.stringify(options.makeBackup(), null, 2), "application/json");
        message("Cadangan JSON diunduh. Simpan file ini sebelum berpindah browser/alamat.");
      }, true));
      const label = element("label", "project-field");
      label.append(element("span", "", "Pilih file cadangan untuk diperiksa (maks. 16 MB)"));
      const input = element("input");
      input.type = "file";
      input.accept = ".json,application/json";
      label.append(input);
      content.append(label);
      input.addEventListener("change", async () => {
        const request = ++importRead;
        pendingImport = null;
        try {
          const file = input.files[0];
          if (!file) return;
          if (file.size > 16 * 1024 * 1024) throw new Error("File terlalu besar (maksimal 16 MB).");
          const raw = await file.text();
          if (request !== importRead || tab !== "backup" || !dialog.open) return;
          pendingImport = options.checkBackup(JSON.parse(raw));
          render();
          message("Cadangan valid. Periksa ringkasan sebelum mengganti progres.");
        } catch (error) {
          if (request !== importRead || tab !== "backup" || !dialog.open) return;
          render();
          message(`Impor dibatalkan: ${error.message}`, true);
        }
      });
      if (pendingImport) {
        const projects = pendingImport.projects;
        const preview = element("section", "project-callout");
        preview.append(element("p", "", `Proyek aktif: ${projects?.active?.title || (pendingImport.version < 3 ? "Proyek lama (akan dimigrasikan)" : "tidak ada")}`));
        preview.append(element("p", "", `Arsip: ${projects?.archive.length || 0} · Happiness: ${pendingImport.happiness || 0}`));
        preview.append(element("p", "", "Impor menggantikan seluruh progres di alamat ini, tidak menggabungkan data. Unduh cadangan kondisi sekarang terlebih dahulu."));
        preview.append(button("Ganti progres dengan cadangan ini", () => {
          askConfirmation({
            icon: "💾",
            title: "Ganti progres kantor ini?",
            description: "Seluruh progres lokal akan diganti dengan cadangan yang dipilih, bukan digabungkan. Pastikan kamu sudah mengunduh cadangan kondisi sekarang terlebih dahulu.",
            acceptLabel: "Ya, ganti progres",
            tone: "warning",
          }, () => {
            try {
              const stored = options.importProgress(pendingImport);
              pendingImport = null;
              render();
              message(stored
                ? "Cadangan berhasil dipulihkan dan disimpan."
                : "Cadangan dipulihkan di memori; browser belum bisa menyimpan. Ekspor lagi sebelum menutup tab.", !stored);
            } catch (error) {
              message(error.message, true);
            }
          });
        }));
        preview.append(button("Batal", () => { pendingImport = null; render(); }));
        content.append(preview);
      }
    }

    function render() {
      dirty = false;
      content.replaceChildren();
      for (const node of $("project-tabs").querySelectorAll("button")) {
        if (node.dataset.projectTab === tab) node.setAttribute("aria-current", "page");
        else node.removeAttribute("aria-current");
      }
      ({ brief: renderBrief, board: renderBoard, meetings: renderMeetings,
        archive: renderArchive, backup: renderBackup })[tab]();
    }

    function switchTab(next) {
      mayDiscard(() => {
        importRead += 1;
        pendingImport = null;
        tab = next;
        message("");
        render();
      });
    }

    for (const node of $("project-tabs").querySelectorAll("button")) {
      node.addEventListener("click", () => switchTab(node.dataset.projectTab));
    }
    function closeHub() {
      mayDiscard(() => {
        importRead += 1;
        pendingImport = null;
        dirty = false;
        dialog.close();
      });
    }

    $("project-close").addEventListener("click", closeHub);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeHub();
    });
    $("project-confirm-accept").addEventListener("click", () => finishConfirmation(true));
    $("project-confirm-cancel").addEventListener("click", () => finishConfirmation(false));
    $("project-confirm-close").addEventListener("click", () => finishConfirmation(false));
    confirmationDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finishConfirmation(false);
    });
    confirmationDialog.addEventListener("close", () => {
      if (!confirmationDialog.open) finishConfirmation(false);
    });
    confirmationDialog.addEventListener("click", (event) => {
      if (event.target !== confirmationDialog) return;
      const rect = confirmationDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom) {
        finishConfirmation(false);
      }
    });
    return {
      open() {
        if (dialog.open) return;
        render();
        message("");
        dialog.showModal();
      },
      refresh() {
        if (dialog.open && !dirty && !confirmation) render();
      },
    };
  }

  globalThis.PawfficeProjectUI = { mount };
})();
