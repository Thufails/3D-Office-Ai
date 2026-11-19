(() => {
  "use strict";

  const WORKER_URL = "http://127.0.0.1:8787/api/chat";
  const TEAM = [
    ["miko", "Miko", "Project Manager", "ruang lingkup, prioritas, jadwal, risiko, dan koordinasi proyek"],
    ["nori", "Nori", "System Analyst", "kebutuhan, user story, acceptance criteria, alur, dan spesifikasi sistem"],
    ["luna", "Luna", "UI/UX Designer", "riset pengguna, user flow, wireframe, aksesibilitas, dan desain visual"],
    ["kiko", "Kiko", "Frontend Developer", "HTML, CSS, JavaScript antarmuka, responsivitas, dan performa frontend"],
    ["bimo", "Bimo", "Backend Developer", "arsitektur backend, API, basis data, validasi, dan keamanan server"],
    ["piko", "Piko", "QA / Tester", "test plan, skenario positif/negatif, edge case, dan kesiapan rilis"],
    ["owner", "Oji", "Owner / Founder", "arah bisnis, nilai untuk klien, kelayakan, dan keputusan strategis"],
    ["sasa", "Sasa", "Personal Assistant / Secretary", "agenda, notulen, tindak lanjut, dan komunikasi profesional"],
    ["rani", "Rani", "Resepsionis", "penerimaan tamu, informasi kantor, dan pengaturan janji temu"],
    ["tomo", "Tomo", "Office Boy", "kenyamanan, kebersihan, rehat, dan dukungan sederhana untuk tim"],
  ];
  const histories = new Map();
  let activeId = "miko";
  let project = null;
  const MODEL_KEY = "pawffice.gemini.model";

  const byId = (id) => document.getElementById(id);

  function historyFor(id) {
    if (!histories.has(id)) histories.set(id, []);
    return histories.get(id);
  }

  function renderHistory() {
    const container = byId("ai-messages");
    container.replaceChildren();
    for (const item of historyFor(activeId)) {
      const row = document.createElement("div");
      row.className = `ai-message ${item.role}`;
      row.textContent = item.text;
      container.append(row);
    }
    container.scrollTop = container.scrollHeight;
  }

  function selectAvatar(id) {
    activeId = TEAM.some((member) => member[0] === id) ? id : "miko";
    const member = TEAM.find((item) => item[0] === activeId);
    byId("ai-avatar-select").value = activeId;
    byId("ai-panel-subtitle").textContent = `${member[1]} · ${member[2]}`;
    renderHistory();
  }

  function setOpen(open) {
    byId("ai-panel").hidden = !open;
    byId("ai-open-button").setAttribute("aria-expanded", String(open));
    if (open) byId("ai-input").focus();
  }

  function openFor(member, activeProject) {
    project = activeProject || window.PawfficeGetActiveProject?.() || null;
    const selected = member || window.PawfficeSelectedCat?.();
    selectAvatar(selected?.data?.id || selected?.id || activeId);
    byId("ai-context-note").textContent = project?.title
      ? `Konteks proyek: ${project.title} · ${project.client || "Klien belum ditentukan"}`
      : "Belum ada proyek aktif. Gemini menjawab berdasarkan role avatar.";
    setOpen(true);
  }

  function buildInstruction(member) {
    const details = project?.title
      ? `Proyek aktif: ${project.title}; klien: ${project.client || "belum ditentukan"}; jenis: ${project.kind || "website"}; metode: ${project.method || "belum dipilih"}; tujuan: ${project.goal || "belum ditentukan"}.`
      : "Belum ada proyek aktif.";

    return `Kamu adalah ${member[1]}, ${member[2]}, rekan virtual Pawffice. Fokus pada ${member[3]}. Jawab dalam Bahasa Indonesia yang jelas, ramah, praktis, dan jujur. Jangan mengaku telah mengubah file atau melakukan tindakan di luar chat. Konteks proyek: ${details}`;
  }

  async function sendMessage(event) {
    event.preventDefault();
    const input = byId("ai-input");
    const text = input.value.trim();
    if (!text) return;

    const history = historyFor(activeId);
    history.push({ role: "user", text });
    input.value = "";
    renderHistory();
    byId("ai-send").disabled = true;
    byId("ai-status").textContent = "Menghubungi Gemini lewat Worker lokal…";

    try {
      const member = TEAM.find((item) => item[0] === activeId);
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: buildInstruction(member),
          messages: history.slice(-12),
          model: byId("ai-model-select").value,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Worker merespons ${response.status}.`);
      history.push({ role: "assistant", text: result.text });
      byId("ai-status").textContent = "Gemini menjawab · riwayat chat sementara di halaman ini.";
    } catch (error) {
      history.push({ role: "assistant", text: `Belum tersambung: ${error.message}` });
      byId("ai-status").textContent = "Jalankan Worker dan isi GEMINI_API_KEY di .dev.vars.";
    } finally {
      if (history.length > 24) history.splice(0, history.length - 24);
      renderHistory();
      byId("ai-send").disabled = false;
      input.focus();
    }
  }

  function init() {
    const select = byId("ai-avatar-select");
    for (const member of TEAM) {
      const option = document.createElement("option");
      option.value = member[0];
      option.textContent = `${member[1]} · ${member[2]}`;
      select.append(option);
    }
    select.addEventListener("change", () => selectAvatar(select.value));
    const savedModel = localStorage.getItem(MODEL_KEY);
    const availableModels = [
      "gemini-3.8-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.5-flash-lite",
    ];
    if (savedModel && availableModels.includes(savedModel)) {
      byId("ai-model-select").value = savedModel;
    }
    byId("ai-model-select").addEventListener("change", () => {
      localStorage.setItem(MODEL_KEY, byId("ai-model-select").value);
    });
    byId("ai-open-button").addEventListener("click", () => openFor(null, project));
    byId("ai-profile-button").addEventListener("click", () => openFor(window.PawfficeSelectedCat?.(), project));
    byId("ai-panel-close").addEventListener("click", () => setOpen(false));
    byId("ai-form").addEventListener("submit", sendMessage);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !byId("ai-panel").hidden) setOpen(false);
    });
  }

  window.PawfficeAiPanel = { init, openFor };
})();
