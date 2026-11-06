const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const P = require('../src/js/projects/project-engine.js');

// DOM kecil untuk menguji handler/state; bukan pengganti pemeriksaan visual browser.
class Node {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.dataset = {};
    this.value = '';
    this.open = false;
    this.classList = { toggle() {} };
  }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  set textContent(value) { this.text = String(value); this.children = []; }
  get textContent() { return (this.text || '') + this.children.map((child) => child.textContent || '').join(''); }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  async emit(name, overrides = {}) {
    const event = { target: this, preventDefault() {}, ...overrides };
    for (const callback of this.listeners[name] || []) await callback(event);
  }
  click() {
    if (!this.disabled) {
      this.focus();
      return this.emit('click');
    }
  }
  querySelectorAll(tag) {
    return this.children.flatMap((child) => [
      ...(child.tagName === tag.toUpperCase() ? [child] : []),
      ...(child.querySelectorAll ? child.querySelectorAll(tag) : []),
    ]);
  }
  showModal() { this.open = true; }
  close() { this.open = false; }
  focus() { if (this.ownerDocument) this.ownerDocument.activeElement = this; }
  get isConnected() {
    const find = (node) => node === this || node.children.some((child) => find(child));
    return this.ownerDocument ? find(this.ownerDocument.body) : false;
  }
  getBoundingClientRect() { return { left: 20, top: 20, right: 440, bottom: 360 }; }
  remove() {}
  reportValidity() { return true; }
}

function setup() {
  const body = new Node('body');
  const elements = {};
  for (const id of ['project-dialog', 'project-tabs', 'project-content', 'project-close', 'project-message']) {
    elements[id] = new Node(id === 'project-dialog' ? 'dialog' : 'div');
    elements[id].id = id;
    body.append(elements[id]);
  }
  for (const tab of ['brief', 'backlog', 'board', 'meetings', 'archive', 'backup']) {
    const button = new Node('button');
    button.dataset.projectTab = tab;
    elements['project-tabs'].append(button);
  }
  const confirmationTags = {
    'project-confirm': 'dialog',
    'project-confirm-title': 'h2',
    'project-confirm-description': 'p',
    'project-confirm-icon': 'span',
    'project-confirm-accept': 'button',
    'project-confirm-cancel': 'button',
    'project-confirm-close': 'button',
  };
  for (const [id, tag] of Object.entries(confirmationTags)) {
    elements[id] = new Node(tag);
    elements[id].id = id;
    if (id === 'project-confirm') body.append(elements[id]);
    else elements['project-confirm'].append(elements[id]);
  }
  const document = {
    body,
    activeElement: body,
    createElement(tag) {
      const node = new Node(tag);
      node.ownerDocument = this;
      return node;
    },
    getElementById(id) {
      return Object.values(elements).find((node) => node.id === id)
        || body.querySelectorAll('h3').find((node) => node.id === id);
    },
  };
  const assignDocument = (node) => {
    node.ownerDocument = document;
    node.children.forEach(assignDocument);
  };
  assignDocument(body);
  const context = vm.createContext({
    document, Blob,
    URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
    window: { confirm() { throw new Error('Native browser confirmation is forbidden.'); }, setTimeout() {} },
    FormData: class {
      constructor(form) {
        this.values = ['input', 'textarea', 'select'].flatMap((tag) => form.querySelectorAll(tag))
          .filter((field) => field.name).map((field) => [field.name, field.value]);
      }
      [Symbol.iterator]() { return this.values[Symbol.iterator](); }
    },
  });
  vm.runInContext(fs.readFileSync(require.resolve('../src/js/projects/project-ui.js'), 'utf8'), context);
  const workspace = P.emptyWorkspace();
  const team = P.TASKS.map((task) => ({ id: task.ownerId, name: task.ownerId, role: task.ownerId }));
  const calls = [];
  let imports = 0;
  const hub = context.PawfficeProjectUI.mount({
    engine: P, team,
    getWorkspace: () => workspace,
    onChange(action) { calls.push(action); },
    makeBackup() { return { format: 'pawffice-backup', version: 1 }; },
    checkBackup(input) {
      if (input.format !== 'pawffice-backup') throw new Error('Bukan cadangan Pawffice.');
      return { version: 3, projects: P.validateWorkspace(input.projects), happiness: 10 };
    },
    importProgress() { imports += 1; return true; },
  });
  const content = elements['project-content'];
  const button = (prefix) => {
    const result = content.querySelectorAll('button').find((node) => node.textContent.startsWith(prefix));
    assert.ok(result, `button ${prefix} not found`);
    return result;
  };
  const tab = (name) => elements['project-tabs'].children.find((node) => node.dataset.projectTab === name).click();
  return { hub, elements, content, workspace, calls, button, tab, context,
    document, get imports() { return imports; } };
}

test('Project Hub membuat brief, memindah tugas, menjaga draf, review, arsip dan resume', async () => {
  const ui = setup();
  ui.hub.open();
  assert.equal(ui.elements['project-dialog'].open, true);
  const form = ui.content.querySelectorAll('form')[0];
  const values = {
    title: '<img src=x onerror=alert(1)>', client: 'Studio Daun', kind: 'Company profile',
    goal: 'Menerima pertanyaan klien melalui website.', requirements: 'Profil\nKontak', deadline: '',
  };
  for (const field of ['input', 'textarea', 'select'].flatMap((tag) => form.querySelectorAll(tag))) {
    field.value = values[field.name];
  }
  await form.emit('submit');
  assert.equal(ui.workspace.active.tasks.length, 8);
  assert.equal(ui.workspace.active.title, values.title);
  assert.equal(ui.content.querySelectorAll('img').length, 0, 'teks klien tidak menjadi HTML');
  await ui.tab('board');
  await ui.button('Mulai tugas').click();
  await ui.button('Buat draf template').click();
  assert.equal(ui.workspace.active.tasks[0].status, 'review');
  assert.equal(ui.button('Setujui hasil').disabled, true);
  const editor = ui.content.querySelectorAll('textarea')[0];
  const oldDocument = ui.workspace.active.tasks[0].artifact;
  editor.value += '\nCatatan yang belum disimpan.';
  await editor.emit('input');
  assert.ok(ui.content.querySelectorAll('input').every((input) => input.disabled));
  ui.hub.refresh();
  assert.equal(ui.content.querySelectorAll('textarea')[0], editor, 'refresh tidak menghapus draf');
  await ui.tab('brief');
  assert.equal(ui.elements['project-confirm'].open, true);
  assert.equal(ui.document.activeElement, ui.elements['project-confirm-cancel']);
  await ui.elements['project-confirm-cancel'].click();
  assert.equal(ui.content.querySelectorAll('textarea')[0], editor, 'navigasi dibatalkan saat draf ditahan');
  await ui.button('Simpan draf').click();
  assert.notEqual(ui.workspace.active.tasks[0].artifact, oldDocument);
  for (let index = 0; index < 3; index += 1) {
    await ui.content.querySelectorAll('input')[index].emit('change');
  }
  assert.equal(ui.button('Setujui hasil').disabled, false);
  await ui.button('Setujui hasil').click();
  assert.equal(ui.workspace.active.tasks[0].status, 'done');
  assert.equal(ui.calls.filter((action) => action === 'approve').length, 1);
  assert.equal(ui.content.querySelectorAll('textarea')[0].readOnly, true);
  await ui.tab('brief');
  await ui.button('Arsipkan proyek').click();
  assert.notEqual(ui.workspace.active, null, 'arsip belum boleh berubah sebelum persetujuan');
  assert.equal(ui.elements['project-confirm'].open, true);
  const original = ui.content.children[0];
  ui.hub.refresh();
  assert.equal(ui.content.children[0], original, 'refresh ditahan selama konfirmasi');
  await ui.elements['project-confirm-accept'].click();
  assert.equal(ui.workspace.active, null);
  await ui.tab('archive');
  assert.equal(ui.workspace.archive.length, 1);
  await ui.button('Lanjutkan proyek ini').click();
  assert.equal(ui.workspace.active.tasks[0].status, 'done');
  assert.equal(ui.workspace.archive.length, 0);
});

test('alur UI Agile: pilih metode, edit backlog, setujui, pilih iterasi, dan review hasil fitur', async () => {
  const ui = setup();
  ui.hub.open();
  const form = ui.content.querySelectorAll('form')[0];
  const values = {
    title: 'Website Daun', client: 'Studio Daun', method: 'agile', kind: 'Company profile',
    goal: 'Mengenalkan layanan studio.', requirements: 'Profil studio\nKontak WhatsApp', deadline: '',
  };
  for (const field of ['input', 'textarea', 'select'].flatMap((tag) => form.querySelectorAll(tag))) {
    field.value = values[field.name];
  }
  await form.emit('submit');
  assert.equal(ui.workspace.active.method, 'agile');
  assert.equal(ui.workspace.active.tasks.length, 0);
  await ui.tab('backlog');
  await ui.button('Edit fitur').click();
  const editForm = ui.content.querySelectorAll('form')[0];
  const criteria = editForm.querySelectorAll('textarea').find((field) => field.name === 'criteria');
  criteria.value = 'Profil mencatat identitas, layanan, dan jalur kontak.';
  await criteria.emit('input');
  await editForm.emit('input'); // DOM tiruan tidak melakukan bubbling otomatis.
  ui.hub.refresh();
  assert.ok(ui.content.querySelectorAll('form')[0] === editForm, 'refresh menjaga draf backlog');
  await ui.tab('board');
  assert.equal(ui.elements['project-confirm'].open, true);
  await ui.elements['project-confirm-cancel'].click();
  await editForm.emit('submit');
  assert.equal(ui.workspace.active.backlog[0].criteria, criteria.value);
  await ui.button('Setujui kebutuhan').click();
  const iterationForm = ui.content.querySelectorAll('form')[0];
  const choice = iterationForm.querySelectorAll('input').find((input) => input.type === 'checkbox');
  choice.checked = true;
  await choice.emit('change');
  await iterationForm.emit('submit');
  assert.equal(ui.workspace.active.tasks.length, 8);
  assert.equal(ui.workspace.active.iterations.length, 1);
  assert.equal(ui.button('Tutup iterasi').disabled, true);
  await ui.tab('board');
  await ui.button('Mulai tugas').click();
  await ui.button('Buat draf template').click();
  const featureId = ui.workspace.active.backlog[0].id;
  assert.equal(ui.workspace.active.tasks[0].id, `${featureId}:scope`);
  assert.match(ui.content.textContent, /Profil studio/);
  for (let index = 0; index < 3; index += 1) await ui.content.querySelectorAll('input')[index].emit('change');
  await ui.button('Setujui hasil').click();
  assert.equal(ui.calls.filter((action) => action === 'approve').length, 1);
  assert.equal(P.summary(ui.workspace.active).percent, 0, 'satu tugas belum sama dengan penerimaan fitur');
  await ui.tab('backlog');
  await ui.button('Tambah fitur').click();
  const addForm = ui.content.querySelectorAll('form')[0];
  const extra = { title: 'Artikel', need: 'Membaca kabar studio.', priority: 'low', criteria: 'Daftar artikel dan kondisi kosong dirinci.' };
  for (const field of ['input', 'textarea', 'select'].flatMap((tag) => addForm.querySelectorAll(tag))) field.value = extra[field.name];
  await addForm.emit('submit');
  assert.equal(ui.workspace.active.backlog.length, 3);
  assert.equal(ui.workspace.active.iterations.length, 1, 'fitur baru tidak menyusup ke iterasi aktif');
  for (const spec of P.TASKS.slice(1)) {
    const id = `${featureId}:${spec.id}`;
    P.changeTask(ui.workspace, id, 'start');
    P.changeTask(ui.workspace, id, 'draft');
    for (let index = 0; index < 3; index += 1) P.changeTask(ui.workspace, id, 'check', index);
    P.changeTask(ui.workspace, id, 'approve');
  }
  ui.hub.refresh();
  assert.equal(ui.button('Tutup iterasi').disabled, false);
  await ui.button('Tutup iterasi').click();
  await ui.button('Setujui kebutuhan').click();
  const secondIterationForm = ui.content.querySelectorAll('form')[0];
  secondIterationForm.querySelectorAll('input').find((input) => input.type === 'checkbox').checked = true;
  await secondIterationForm.emit('submit');
  await ui.tab('board');
  const iterationSelect = ui.content.querySelectorAll('select')[0];
  assert.equal(iterationSelect.value, ui.workspace.active.iterations[1].id, 'iterasi baru langsung menjadi pilihan papan');
  iterationSelect.value = ui.workspace.active.iterations[0].id;
  await iterationSelect.emit('change');
  assert.match(ui.content.textContent, /Profil studio/);
  assert.doesNotMatch(ui.content.textContent, /Rangkum kebutuhan sistem · Kontak WhatsApp/);
  assert.deepEqual(P.validateWorkspace(ui.workspace), ui.workspace);
});

test('impor harus lolos validasi, preview dan konfirmasi sebelum mengganti state', async () => {
  const ui = setup();
  ui.hub.open();
  await ui.tab('backup');
  let input = ui.content.querySelectorAll('input')[0];
  input.files = [{ size: 20, async text() { return '{broken-json'; } }];
  await input.emit('change');
  assert.equal(ui.imports, 0);
  assert.match(ui.elements['project-message'].textContent, /Impor dibatalkan/);
  input = ui.content.querySelectorAll('input')[0];
  input.files = [{ size: 20, async text() { return JSON.stringify({ format: 'pawffice-backup', projects: P.emptyWorkspace() }); } }];
  await input.emit('change');
  assert.equal(ui.imports, 0, 'preview belum boleh mengimpor');
  await ui.button('Ganti progres').click();
  await ui.elements['project-confirm-cancel'].click();
  assert.equal(ui.imports, 0);
  await ui.button('Ganti progres').click();
  assert.equal(ui.elements['project-confirm'].dataset.tone, 'warning');
  await ui.elements['project-confirm-accept'].click();
  assert.equal(ui.imports, 1);
  assert.match(ui.elements['project-message'].textContent, /berhasil/);
});

test('file terlalu besar ditolak dan pembacaan impor yang terlambat tidak menghapus form baru', async () => {
  const ui = setup();
  ui.hub.open();
  await ui.tab('backup');
  let input = ui.content.querySelectorAll('input')[0];
  input.files = [{ size: 17 * 1024 * 1024, async text() { throw new Error('Seharusnya tidak dibaca'); } }];
  await input.emit('change');
  assert.match(ui.elements['project-message'].textContent, /terlalu besar/);
  input = ui.content.querySelectorAll('input')[0];
  let finishRead;
  input.files = [{ size: 30, text() { return new Promise((resolve) => { finishRead = resolve; }); } }];
  const loading = input.emit('change');
  await ui.tab('brief');
  const title = ui.content.querySelectorAll('input').find((node) => node.name === 'title');
  title.value = 'Draf yang tidak boleh hilang';
  finishRead('{"format":"pawffice-backup"}');
  await loading;
  assert.equal(ui.content.querySelectorAll('input').find((node) => node.name === 'title'), title);
  assert.equal(title.value, 'Draf yang tidak boleh hilang');
  assert.equal(ui.imports, 0);
});

test('Escape, tombol tutup, backdrop dan batal tidak menjalankan arsip; fokus kembali', async () => {
  const ui = setup();
  P.createProject(ui.workspace, {
    title: '<b>Proyek aman</b>', client: 'Klien', kind: 'Company profile',
    goal: 'Menyajikan informasi layanan.', requirements: ['Kontak'], deadline: '',
  });
  ui.hub.open();
  for (const cancel of ['project-confirm-close', 'project-confirm-cancel', 'escape', 'backdrop']) {
    const trigger = ui.button('Arsipkan proyek');
    await trigger.click();
    assert.match(ui.elements['project-confirm-description'].textContent, /<b>Proyek aman<\/b>/);
    assert.equal(ui.elements['project-confirm'].querySelectorAll('b').length, 0);
    if (cancel === 'escape') await ui.elements['project-confirm'].emit('cancel');
    else if (cancel === 'backdrop') {
      await ui.elements['project-confirm'].emit('click', { clientX: 0, clientY: 0 });
    } else await ui.elements[cancel].click();
    assert.equal(ui.elements['project-confirm'].open, false);
    assert.ok(ui.workspace.active);
    assert.equal(ui.document.activeElement, trigger);
  }
  await ui.button('Arsipkan proyek').click();
  await ui.elements['project-confirm-accept'].click();
  await ui.elements['project-confirm-accept'].click();
  assert.equal(ui.workspace.archive.length, 1, 'klik persetujuan dua kali tidak menggandakan tindakan');
  assert.equal(ui.calls.filter((action) => action === 'archive').length, 1);
});

test('menutup Hub dengan draf kotor memakai modal dan Escape hanya membatalkan konfirmasi', async () => {
  const ui = setup();
  ui.hub.open();
  const form = ui.content.querySelectorAll('form')[0];
  await form.emit('input');
  let prevented = false;
  await ui.elements['project-dialog'].emit('cancel', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(ui.elements['project-confirm'].open, true);
  await ui.elements['project-confirm'].emit('cancel');
  assert.equal(ui.elements['project-dialog'].open, true);
  assert.equal(ui.content.querySelectorAll('form')[0], form);
  await ui.elements['project-close'].click();
  await ui.elements['project-confirm-accept'].click();
  assert.equal(ui.elements['project-dialog'].open, false);
  assert.equal(ui.elements['project-confirm'].open, false);
});
