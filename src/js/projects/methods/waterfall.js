/* Waterfall — tahapan tetap dengan prasyarat hasil review. */
(() => {
  "use strict";

  const method = {
    id: "waterfall",
    name: "Waterfall",
    description: "Sepakati brief, lalu selesaikan tahapan dan review secara berurutan. FE dan BE bisa paralel setelah prasyaratnya siap.",
    dependencies(definition) {
      return definition.dependsOn;
    },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = method;
  else (globalThis.PawfficeMethods ||= {}).waterfall = method;
})();
