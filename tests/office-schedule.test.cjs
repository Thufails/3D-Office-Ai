const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../src/js/office/office-schedule.js');
const team = ['miko', 'nori', 'luna', 'kiko', 'bimo', 'piko', 'owner', 'sasa'].map((id) => ({ id }));
const time = (hour, minute = 0, dateKey = '2026-11-06') => ({ dateKey, hour, minute, second: 0 });
const context = (energy = 85) => ({
  team, projectTitle: 'Website Studio Daun',
  members: team.map((person) => ({ id: person.id, energy, tasks: [{ title: 'Rancangan halaman layanan', status: 'doing' }] })),
});
const setup = () => {
  const state = S.create(time(9), team);
  S.tick(state, time(9), context());
  return state;
};
const pending = (state) => state.day.members.filter((record) => record.overtime.status === 'pending');

test('batas setiap jadwal WIB tepat termasuk 16.30, 17.00, 18.00 dan 21.00', () => {
  for (const [hour, minute, expected] of [
    [6, 59, 'closed'], [7, 0, 'arrival'], [8, 59, 'arrival'], [9, 0, 'morning'],
    [11, 59, 'morning'], [12, 0, 'lunch'], [13, 0, 'afternoon'], [16, 29, 'afternoon'],
    [16, 30, 'report'], [17, 0, 'break'], [18, 0, 'overtime'], [20, 59, 'overtime'], [21, 0, 'closed'],
  ]) assert.equal(S.phase(time(hour, minute)).id, expected);
});

test('kedatangan bertahap stabil; membuka siang hari tidak mengarang absen pagi', () => {
  const state = S.create(time(6, 59), team);
  assert.deepEqual(state, S.create(time(6, 59), team));
  S.tick(state, time(6, 59), context());
  assert.ok(state.day.members.every((record) => record.checkedInAt === null));
  const first = state.day.members[0];
  S.tick(state, time(7, first.arrivalMinute - 420), context());
  assert.ok(first.checkedInAt);
  assert.equal(state.day.members[1].checkedInAt, null);
  const openedLate = S.create(time(14, 12), team);
  S.tick(openedLate, time(14, 12), context());
  assert.ok(openedLate.day.members.every((record) => record.checkedInAt.includes('14:12')));
  const openedNight = S.create(time(19), team);
  S.tick(openedNight, time(19), context());
  assert.ok(openedNight.day.members.every((record) => !record.checkedInAt && !record.report));
});

test('daily report memakai tindakan nyata dan waktu sesi; tidak mengubah status tugas', () => {
  const state = setup();
  const ctx = context();
  const beforeTasks = JSON.stringify(ctx.members);
  S.recordAction(state, time(10), 'miko', 'start', 'Scope proyek');
  S.accrue(state, time(10), 'miko', 10000);
  assert.equal(state.day.members[0].activeSeconds, 2, 'delta observasi dibatasi; tidak menambah jam offline');
  S.tick(state, time(16, 30), ctx);
  const report = state.day.members[0].report;
  assert.match(report.actions[0].text, /Mulai: Scope proyek/);
  assert.equal(state.day.members[1].report.actions.length, 0);
  assert.equal(report.tasks[0].status, 'doing');
  assert.equal(JSON.stringify(ctx.members), beforeTasks);
  S.recordAction(state, time(16, 40), 'miko', 'save', 'Scope proyek');
  assert.equal(report.actions.length, 2);
  const reportCount = state.notifications.filter((notice) => notice.kind === 'daily-report').length;
  S.tick(state, time(16, 40), ctx);
  assert.equal(state.notifications.filter((notice) => notice.kind === 'daily-report').length, reportCount);
  assert.deepEqual(S.validate(state, team), state);
});

test('pengajuan hanya 16.30–16.50, perlu energi dan tugas, maksimal tiga tanpa spam', () => {
  const state = setup();
  S.tick(state, time(16, 29), context());
  assert.equal(pending(state).length, 0);
  S.tick(state, time(16, 30), context(40));
  assert.equal(pending(state).length, 0);
  S.tick(state, time(16, 31), context());
  assert.equal(pending(state).length, 3);
  const first = pending(state)[0];
  S.decide(state, time(16, 32), first.id, 'decline');
  const count = state.notifications.length;
  S.tick(state, time(16, 40), context());
  assert.equal(state.notifications.length, count);
  assert.equal(first.overtime.status, 'declined');
  const late = setup();
  S.tick(late, time(16, 50), context());
  assert.equal(pending(late).length, 0);
  const finished = context();
  finished.members.forEach((actor) => { actor.tasks[0].status = 'done'; });
  const noWork = setup();
  S.tick(noWork, time(16, 30), finished);
  assert.equal(pending(noWork).length, 0);
});

test('lembur harus diizinkan, jeda 17–18, batas pilihan divalidasi, berhenti tepat batas', () => {
  const state = setup();
  S.tick(state, time(16, 30), context());
  const record = pending(state)[0];
  const before = JSON.stringify(state);
  assert.throws(() => S.decide(state, time(16, 35), record.id, 'approve', 1320));
  assert.equal(JSON.stringify(state), before);
  S.decide(state, time(16, 35), record.id, 'approve', 1260);
  assert.throws(() => S.decide(state, time(16, 36), record.id, 'approve', 1260));
  S.tick(state, time(17), context());
  assert.equal(S.attendance(state, time(17), record.id).id, 'break');
  assert.ok(record.checkedOutAt, 'absen reguler tetap dicatat');
  S.tick(state, time(18), context());
  assert.equal(S.attendance(state, time(18), record.id).id, 'overtime');
  S.tick(state, time(21), context());
  assert.equal(record.overtime.status, 'finished');
  assert.equal(S.attendance(state, time(21), record.id).id, 'away');
  assert.deepEqual(S.validate(state, team), state);
});

test('izin diam tidak dianggap setuju; refresh dan keputusan terlambat tidak menghidupkan pengajuan', () => {
  let state = setup();
  S.tick(state, time(16, 30), context());
  const recordId = pending(state)[0].id;
  state = S.validate(JSON.parse(JSON.stringify(state)), team);
  S.tick(state, time(17), context());
  const record = state.day.members.find((item) => item.id === recordId);
  assert.equal(record.overtime.status, 'expired');
  const before = JSON.stringify(state);
  assert.throws(() => S.decide(state, time(17), recordId, 'approve', 1140));
  assert.equal(JSON.stringify(state), before);
  S.tick(state, time(18), context());
  assert.equal(S.attendance(state, time(18), recordId).id, 'away');
  assert.equal(state.notifications.filter((notice) => notice.memberId === recordId && notice.kind === 'overtime-request').length, 1);
});

test('notifikasi energi rendah hanya sekali, energi 30 menghentikan lembur', () => {
  const state = setup();
  S.tick(state, time(16, 30), context());
  const record = pending(state)[0];
  S.decide(state, time(16, 35), record.id, 'approve', 1200);
  S.tick(state, time(18), context(44));
  S.tick(state, time(18, 1), context(43));
  assert.equal(state.notifications.filter((notice) => notice.memberId === record.id && notice.kind === 'low-energy').length, 1);
  S.tick(state, time(18, 2), context(30));
  assert.equal(record.overtime.status, 'finished');
  assert.match(record.overtime.endReason, /energi rendah/);
});

test('pergantian hari tidak membawa izin, riwayat dibatasi dan impor rusak ditolak tanpa mutasi', () => {
  const state = setup();
  S.tick(state, time(16, 30), context());
  const id = pending(state)[0].id;
  S.decide(state, time(16, 40), id, 'approve', 1260);
  S.tick(state, time(9, 0, '2026-11-07'), context());
  assert.ok(state.day.members.every((record) => record.overtime.status === 'none'));
  assert.equal(state.history[0].members.find((record) => record.id === id).overtime.status, 'finished');
  for (let date = 8; date <= 18; date += 1) S.tick(state, time(9, 0, `2026-11-${String(date).padStart(2, '0')}`), context());
  assert.equal(state.history.length, 7);
  assert.deepEqual(S.validate(state, team), state);
  const unchanged = JSON.stringify(state);
  for (const corrupt of [
    (copy) => { copy.day.members[0].id = 'unknown'; },
    (copy) => { copy.day.members[0].overtime.status = 'hacked'; },
    (copy) => { copy.day.members[0].overtime.untilMinute = 2000; },
    (copy) => { copy.day.members[0].activeSeconds = -1; },
    (copy) => { copy.day.dateKey = '2026-02-30'; },
  ]) {
    const copy = JSON.parse(unchanged);
    corrupt(copy);
    assert.throws(() => S.validate(copy, team));
    assert.equal(JSON.stringify(state), unchanged);
  }
});
