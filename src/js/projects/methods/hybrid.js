/* Hybrid — rencana awal disahkan, lalu fitur dikerjakan dalam iterasi. */
(() => {
  "use strict";
  const helper = typeof module !== "undefined" && module.exports
    ? require("./iterative.js") : globalThis.PawfficeIterative;
  const locked = (project) => project.tasks.some((task) => task.id === "scope" && task.status === "done");

  const method = {
    id: "hybrid",
    name: "Hybrid",
    iterative: true,
    planningIds: ["scope", "analysis"],
    description: "Sepakati scope dan analisis awal, lalu kerjakan fitur dalam iterasi. Tambahan kebutuhan setelah scope disahkan memerlukan persetujuan perubahan scope.",
    suggest(requirements, makeId) {
      return helper.suggest(requirements, makeId).map((feature) => ({
        ...feature, scopeStatus: "draft", scopeReason: "", scopeApprovedAt: null,
      }));
    },
    createActions(context) {
      return {
        ...helper.createActions(context),
        approveScopeChange(workspace, featureId) {
          const project = workspace.active;
          if (project?.method !== "hybrid" || !locked(project)) throw new Error("Sahkan scope awal terlebih dahulu.");
          const feature = project.backlog.find((item) => item.id === featureId);
          if (!feature || feature.iterationId || feature.scopeStatus !== "pending"
            || !feature.approved || !feature.scopeReason.trim()) {
            throw new Error("Review kebutuhan dan alasan perubahan sebelum menyetujui scope tambahan.");
          }
          feature.scopeStatus = "approved";
          feature.scopeApprovedAt = context.now();
          project.updatedAt = feature.scopeApprovedAt;
          return feature;
        },
      };
    },
    prepareFeature(project, feature, input, text) {
      if (feature?.scopeStatus === "baseline") throw new Error("Kebutuhan scope awal sudah dikunci. Tambahkan fitur lanjutan untuk perubahan.");
      return locked(project)
        ? { scopeStatus: "pending", scopeReason: text(input.scopeReason, 1000, "Alasan perubahan scope"), scopeApprovedAt: null }
        : { scopeStatus: "draft", scopeReason: "", scopeApprovedAt: null };
    },
    beforeBacklogAction(project, feature, action) {
      if (action === "delete" && feature.scopeStatus === "baseline") {
        throw new Error("Fitur dalam scope awal tidak dapat dihapus. Catat perubahan sebagai fitur lanjutan.");
      }
    },
    beforeIteration(project, features) {
      if (!method.planningIds.every((id) => project.tasks.some((task) => task.id === id && task.status === "done"))) {
        throw new Error("Selesaikan review scope dan analisis awal sebelum memulai iterasi Hybrid.");
      }
      if (features.some((feature) => !["baseline", "approved"].includes(feature.scopeStatus))) {
        throw new Error("Setujui perubahan scope fitur terlebih dahulu.");
      }
    },
    beforeApprove(project, task) {
      if (task.id === "scope" && (!project.backlog.length || project.backlog.some((feature) => !feature.approved))) {
        throw new Error("Review dan setujui seluruh kebutuhan backlog sebelum mengesahkan scope awal.");
      }
    },
    afterApprove(project, task) {
      if (task.id !== "scope") return;
      for (const feature of project.backlog) {
        Object.assign(feature, { scopeStatus: "baseline", scopeApprovedAt: task.updatedAt });
      }
    },
    dependencies(definition, task) {
      if (!task.featureId) return definition.dependsOn;
      return task.baseId === "scope" ? ["analysis"]
        : definition.dependsOn.map((id) => `${task.featureId}:${id}`);
    },
    summarize(project) {
      const planningDone = project.tasks.filter((task) => !task.featureId && task.status === "done").length;
      const accepted = project.backlog.filter((feature) => project.tasks.some((task) => {
        return task.featureId === feature.id && task.baseId === "approval" && task.status === "done";
      })).length;
      const done = planningDone + accepted;
      const total = method.planningIds.length + project.backlog.length;
      return { done, total, percent: Math.round(done / total * 100), complete: project.backlog.length > 0 && done === total };
    },
    validateFeature(feature, project, date) {
      const status = feature.scopeStatus;
      if (!["draft", "baseline", "pending", "approved"].includes(status)
        || typeof feature.scopeReason !== "string" || feature.scopeReason.length > 1000) {
        throw new Error("Status atau alasan perubahan scope tidak valid.");
      }
      const isLocked = locked(project);
      if ((!isLocked && status !== "draft") || (isLocked && status === "draft")) {
        throw new Error("Scope fitur tidak konsisten dengan rencana awal.");
      }
      const approvedAt = ["baseline", "approved"].includes(status)
        ? date(feature.scopeApprovedAt, "Waktu persetujuan scope") : null;
      if (["pending", "approved"].includes(status) && !feature.scopeReason.trim()) throw new Error("Alasan perubahan scope belum diisi.");
      if (["baseline", "approved"].includes(status) && !feature.approved) throw new Error("Scope disahkan sebelum kebutuhan direview.");
      if (feature.iterationId && !["baseline", "approved"].includes(status)) throw new Error("Fitur iterasi belum disetujui scopenya.");
      if (status === "baseline" && approvedAt !== project.tasks.find((task) => task.id === "scope").updatedAt) {
        throw new Error("Waktu pengesahan baseline tidak sesuai.");
      }
      return { scopeStatus: status, scopeReason: feature.scopeReason.trim(), scopeApprovedAt: approvedAt };
    },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = method;
  else (globalThis.PawfficeMethods ||= {}).hybrid = method;
})();
