/* Operasi backlog bersama; aturan khusus dipasok oleh tiap metode. */
(() => {
  "use strict";
  const helper = {
    createActions({ text, id, now, TASKS, PRIORITIES, method }) {
      function iterativeProject(workspace) {
        const project = workspace.active;
        if (!project || project.method !== method.id) throw new Error("Metode backlog proyek tidak sesuai.");
        return project;
      }

      function featureInput(input) {
        if (!Object.hasOwn(PRIORITIES, input.priority)) throw new Error("Prioritas tidak valid.");
        return {
          title: text(input.title, 120, "Nama fitur"),
          need: text(input.need, 1200, "Kebutuhan fitur"),
          priority: input.priority,
          criteria: text(input.criteria, 1600, "Kriteria penerimaan"),
        };
      }

      function saveFeature(workspace, featureId, input) {
        const project = iterativeProject(workspace);
        const values = featureInput(input);
        const feature = project.backlog.find((item) => item.id === featureId);
        if (featureId && !feature) throw new Error("Fitur tidak ditemukan.");
        if (feature?.iterationId) throw new Error("Fitur yang masuk iterasi dikunci. Tambahkan kebutuhan baru sebagai fitur lanjutan.");
        if (!feature && project.backlog.length >= 40) throw new Error("Maksimal 40 fitur per proyek.");
        const extra = method.prepareFeature?.(project, feature, input, text) || {};
        const result = feature || { id: id(), iterationId: null };
        Object.assign(result, values, extra, { approved: false });
        if (!feature) project.backlog.push(result);
        project.updatedAt = now();
        return result;
      }

      function backlogAction(workspace, featureId, action) {
        const project = iterativeProject(workspace);
        const index = project.backlog.findIndex((item) => item.id === featureId);
        const feature = project.backlog[index];
        if (!feature || feature.iterationId) throw new Error("Hanya backlog yang belum masuk iterasi dapat diubah.");
        method.beforeBacklogAction?.(project, feature, action);
        if (action === "approve") feature.approved = true;
        else if (action === "delete") project.backlog.splice(index, 1);
        else if (["up", "down"].includes(action)) {
          const target = index + (action === "up" ? -1 : 1);
          if (target < 0 || target >= project.backlog.length) throw new Error("Fitur sudah di batas urutan.");
          [project.backlog[index], project.backlog[target]] = [project.backlog[target], feature];
        } else throw new Error("Aksi backlog tidak tersedia.");
        project.updatedAt = now();
        return feature;
      }

      function startIteration(workspace, name, featureIds) {
        const project = iterativeProject(workspace);
        const title = text(name, 100, "Nama iterasi");
        if (project.iterations.some((item) => !item.closedAt)) throw new Error("Selesaikan dan tutup iterasi aktif dahulu.");
        if (!Array.isArray(featureIds) || !featureIds.length || featureIds.length > 5
          || new Set(featureIds).size !== featureIds.length) throw new Error("Pilih 1–5 fitur berbeda untuk satu iterasi.");
        const features = featureIds.map((featureId) => project.backlog.find((item) => item.id === featureId));
        if (features.some((item) => !item || !item.approved || item.iterationId)) {
          throw new Error("Pilih fitur yang sudah disetujui dan belum masuk iterasi.");
        }
        method.beforeIteration?.(project, features);
        if (project.iterations.length >= 40) throw new Error("Batas iterasi tercapai.");
        const iteration = { id: id(), title, featureIds: [...featureIds], createdAt: now(), closedAt: null };
        for (const feature of features) {
          feature.iterationId = iteration.id;
          for (const spec of TASKS) {
            project.tasks.push({
              id: `${feature.id}:${spec.id}`, baseId: spec.id, featureId: feature.id,
              status: "todo", artifact: "", checks: spec.checks.map(() => false), updatedAt: null,
            });
          }
        }
        project.iterations.push(iteration);
        project.updatedAt = now();
        return iteration;
      }

      function closeIteration(workspace) {
        const project = iterativeProject(workspace);
        const iteration = project.iterations.find((item) => !item.closedAt);
        if (!iteration) throw new Error("Tidak ada iterasi aktif.");
        if (project.tasks.some((task) => iteration.featureIds.includes(task.featureId) && task.status !== "done")) {
          throw new Error("Review dan setujui seluruh hasil fitur sebelum menutup iterasi.");
        }
        iteration.closedAt = now();
        project.updatedAt = iteration.closedAt;
        return iteration;
      }
      return { featureInput, saveFeature, backlogAction, startIteration, closeIteration };
    },
    suggest(requirements, makeId) {
      return requirements.map((requirement, index) => ({
        id: makeId(),
        title: requirement.slice(0, 120),
        need: requirement,
        priority: index === 0 ? "high" : "normal",
        criteria: `Kebutuhan “${requirement}” dijelaskan dalam dokumen, termasuk alur utama dan kondisi gagal yang relevan.`,
        approved: false,
        iterationId: null,
      }));
    },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = helper;
  else globalThis.PawfficeIterative = helper;
})();
