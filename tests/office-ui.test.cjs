const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const S = require('../src/js/office/office-schedule.js');

class Element {
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.listeners = {}; this.dataset = {}; this.attributes = {}; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  set textContent(text) { this.text = String(text); this.children = []; }
  get textContent() { return (this.text || '') + this.children.map((node) => node.textContent).join(''); }
  setAttribute(key, value) { this.attributes[key] = value; }
  removeAttribute(key) { delete this.attributes[key]; }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  async emit(type) { for (const callback of this.listeners[type] || []) await callback({ target: this, preventDefault() {} }); }
  async click() { if (!this.disabled) await this.emit('click'); }
  showModal() { this.open = true; }
  close() { this.open = false; }
  querySelectorAll(tag) { return this.children.flatMap((node) => [ ...(node.tagName === tag.toUpperCase() ? [node] : []), ...node.querySelectorAll(tag) ]); }
}

function setup() {
  const team = ['miko', 'luna'].map((id) => ({ id, name: id, role: 'Office role' }));
  let now = { dateKey: '2026-11-06', hour: 16, minute: 30, second: 0 };
  const state = S.create(now, team);
  const context = { team, members: team.map((person) => ({ id: person.id, energy: 80, tasks: [{ title: '<img src=x>', status: 'doing' }] })) };
  S.tick(state, now, context);
  const elements = {};
  for (const id of ['office-dialog', 'office-content', 'office-message', 'office-tabs', 'office-badge', 'office-bell', 'office-project-bell', 'office-phase', 'office-routine-button', 'office-close']) elements[id] = new Element();
  for (const tab of ['notifications', 'routine', 'reports']) {
    const button = new Element('button');
    button.dataset.officeTab = tab;
    elements['office-tabs'].append(button);
  }
  const document = { getElementById: (id) => elements[id], createElement: (tag) => new Element(tag) };
  const browser = vm.createContext({ document });
  vm.runInContext(fs.readFileSync(require.resolve('../src/js/office/office-ui.js'), 'utf8'), browser);
  let writes = 0;
  let focused = null;
  const hub = browser.PawfficeOfficeUI.mount({
    schedule: S, team, getState: () => state, now: () => now,
    sync: () => S.tick(state, now, context), energy: () => 80,
    decide: (id, decision, until) => { S.tick(state, now, context); S.decide(state, now, id, decision, until); },
    onChange: () => { writes += 1; hub.refresh(); },
    focusMember: (id) => { focused = id; },
  });
  const content = elements['office-content'];
  const button = (label) => {
    const result = content.querySelectorAll('button').find((node) => node.textContent === label);
    assert.ok(result, `Tombol tidak ditemukan: ${label}`);
    return result;
  };
  return { state, elements, content, button, hub,
    setTime(value) { now = { ...now, ...value }; S.tick(state, now, context); hub.refresh(); },
    get writes() { return writes; }, get focused() { return focused; } };
}

test('lonceng, badge, batas izin dan penolakan bekerja lewat pusat kantor tanpa popup browser', async () => {
  const ui = setup();
  ui.hub.refresh();
  assert.equal(ui.elements['office-badge'].hidden, false);
  await ui.elements['office-bell'].click();
  assert.equal(ui.elements['office-dialog'].open, true);
  assert.equal(ui.content.querySelectorAll('img').length, 0, 'teks tugas tidak dieksekusi sebagai HTML');
  const select = ui.content.querySelectorAll('select')[0];
  select.value = '1260';
  await select.emit('change');
  await ui.button('Izinkan lembur').click();
  const approved = ui.state.day.members.find((record) => record.overtime.status === 'approved');
  assert.ok(approved);
  assert.equal(approved.overtime.untilMinute, 1260);
  await ui.button('Pulang dulu').click();
  assert.equal(ui.state.day.members.filter((record) => record.overtime.status === 'declined').length, 1);
  assert.ok(ui.writes >= 2);
  await ui.button('Tandai semua sudah dibaca').click();
  assert.equal(ui.elements['office-badge'].hidden, true);
});

test('membaca notifikasi tidak mengizinkan lembur, pengajuan kedaluwarsa dan laporan tetap dapat dibaca', async () => {
  const ui = setup();
  await ui.elements['office-bell'].click();
  await ui.button('Tandai semua sudah dibaca').click();
  assert.equal(ui.elements['office-badge'].textContent, '2', 'pengajuan yang belum diputuskan tetap terlihat');
  ui.setTime({ hour: 17, minute: 0 });
  assert.ok(ui.state.day.members.every((record) => record.overtime.status === 'expired'));
  assert.equal(ui.content.querySelectorAll('button').some((node) => node.textContent === 'Izinkan lembur'), false);
  await ui.button('Baca laporan').click();
  assert.match(ui.content.textContent, /Status tugas saat laporan dirangkum/);
  assert.match(ui.content.textContent, /Belum ada tindakan tugas proyek/);
  await ui.elements['office-close'].click();
  assert.equal(ui.elements['office-dialog'].open, false);
  await ui.elements['office-routine-button'].click();
  assert.match(ui.content.textContent, /07.00–09.00/);
  assert.match(ui.content.textContent, /Absen simulasi hari ini/);
  const participant = ui.content.querySelectorAll('input')[0];
  participant.checked = true;
  await participant.emit('change');
  assert.deepEqual(ui.state.settings.prayerParticipants, ['miko']);
});

test('klik Lihat avatar menutup pusat kantor dan meneruskan pilihan anggota', async () => {
  const ui = setup();
  await ui.elements['office-bell'].click();
  await ui.button('Lihat avatar').click();
  assert.equal(ui.elements['office-dialog'].open, false);
  assert.ok(['miko', 'luna'].includes(ui.focused));
});
