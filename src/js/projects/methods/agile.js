/* Agile — backlog yang direview pengelola dan iterasi berbasis fitur. */
(() => {
  "use strict";
  const helper = typeof module !== "undefined" && module.exports
    ? require("./iterative.js") : globalThis.PawfficeIterative;

  const method = {
    id: "agile",
    iterative: true,
    createActions: helper.createActions,
    name: "Agile",
    description: "Review backlog usulan Nori, atur prioritas bersama Miko, lalu pilih fitur untuk satu iterasi. Hasil setiap fitur direview sebelum diterima.",
    suggest: helper.suggest,
    // Semua dependensi hanya berlaku di fitur yang sama, bukan seluruh proyek.
    dependencies(definition, task) {
      return definition.dependsOn.map((id) => `${task.featureId}:${id}`);
    },
    summarize(project) {
      const done = project.backlog.filter((feature) => {
        return project.tasks.some((task) => task.featureId === feature.id
          && task.baseId === "approval" && task.status === "done");
      }).length;
      const total = project.backlog.length;
      return {
        done,
        total,
        percent: total ? Math.round(done / total * 100) : 0,
        complete: total > 0 && done === total,
      };
    },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = method;
  else (globalThis.PawfficeMethods ||= {}).agile = method;
})();
