const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('../src/js/office/office-schedule.js');
const P = require('../src/js/office/prayer-times.js');
const Campus = require('../src/js/office/office-campus.js');
const team = ['miko', 'nori', 'luna', 'kiko', 'bimo', 'piko', 'owner', 'sasa'].map((id) => ({ id }));
team.push({ id: 'rani', operational: 'reception' }, { id: 'tomo', operational: 'cleaner' });
const at = (hour, minute = 0) => ({ dateKey: '2026-11-06', hour, minute, second: 0 });
const context = { team, members: team.map((person) => ({ id: person.id, energy: 90, tasks: [] })) };

test('shift operasional: OB membersihkan sebelum kantor buka dan resepsionis mulai 07.00', () => {
  const state = S.create(at(5), team);
  S.tick(state, at(5), context);
  assert.equal(S.attendance(state, at(5), 'tomo').goal, 'clean');
  assert.equal(S.attendance(state, at(5, 40), 'tomo').targetIndex, 4);
  assert.equal(S.attendance(state, at(5), 'miko').goal, 'away');
  assert.equal(S.attendance(state, at(7), 'rani').goal, 'reception');
  S.tick(state, at(13, 30), context);
  assert.ok(state.day.members.find((record) => record.id === 'tomo').report);
  S.tick(state, at(14), context);
  assert.equal(S.attendance(state, at(14), 'tomo').goal, 'away');
  assert.equal(S.attendance(state, at(14), 'rani').goal, 'reception');
  assert.deepEqual(S.validate(state, team), state);
});

test('migrasi absen delapan avatar mempertahankan data dan menambahkan dua staf tanpa riwayat fiktif', () => {
  const oldTeam = team.slice(0, 8);
  const state = S.create(at(9), oldTeam);
  S.tick(state, at(9), { team: oldTeam });
  const unchanged = JSON.stringify(state);
  delete state.settings;
  const migrated = S.validate(state, team);
  assert.equal(migrated.day.members.length, 10);
  assert.deepEqual(migrated.day.members.slice(0, 8), state.day.members);
  assert.ok(migrated.day.members.slice(8).every((record) => !record.checkedInAt && !record.report));
  assert.deepEqual(migrated.settings.prayerParticipants, []);
  assert.equal(JSON.stringify({ ...state, settings: { prayerParticipants: [] } }), unchanged);
});

test('estimasi salat berubah menurut tanggal dan salat tidak dimulai sebelum waktunya', () => {
  const november = P.calculate('2026-11-06');
  const february = P.calculate('2026-02-06');
  assert.ok(november.dhuhr > 660 && november.dhuhr < 780);
  assert.ok(november.asr > november.dhuhr + 120 && november.asr < 990);
  assert.notEqual(november.dhuhr, february.dhuhr);
  assert.throws(() => P.calculate('2026-02-30'));
  const state = S.create(at(9), team);
  S.tick(state, at(9), context);
  const start = Math.max(720, november.dhuhr);
  assert.equal(S.attendance(state, at(Math.floor(start / 60), start % 60), 'miko').goal, 'lounge');
  S.setPrayerParticipant(state, 'miko', true);
  assert.equal(S.attendance(state, at(Math.floor(start / 60), start % 60), 'miko').goal, 'wudu');
  assert.equal(S.attendance(state, at(Math.floor((start + 2) / 60), (start + 2) % 60), 'miko').goal, 'prayer');
  assert.equal(S.attendance(state, at(Math.floor((start + 8) / 60), (start + 8) % 60), 'miko').goal, 'lounge');
  assert.equal(S.attendance(state, at(Math.floor(november.asr / 60), november.asr % 60), 'miko').goal, 'wudu');
  S.setPrayerParticipant(state, 'tomo', true);
  assert.equal(S.attendance(state, at(Math.floor(november.asr / 60), november.asr % 60), 'tomo').goal, 'away');
  assert.deepEqual(S.validate(state, team), state);
});

test('pilihan ibadah dan fasilitas tetap terpisah dari persetujuan proyek dan izin lembur', () => {
  const state = S.create(at(9), team);
  S.tick(state, at(9), context);
  S.setPrayerParticipant(state, 'luna', true);
  assert.deepEqual(state.settings.prayerParticipants, ['luna']);
  assert.equal(S.attendance(state, at(10), 'miko').goal, 'bathroom');
  assert.equal(state.day.members[0].overtime.status, 'none');
  const copy = JSON.parse(JSON.stringify(state));
  copy.settings.prayerParticipants.push('unknown');
  assert.throws(() => S.validate(copy, team));
});

test('parkir mempunyai kepemilikan stabil serta mencakup mobil, motor, dan pejalan kaki', () => {
  assert.equal(Campus.parkingSpot('miko').transport, 'car');
  assert.equal(Campus.parkingSpot('tomo').transport, 'motorcycle');
  assert.equal(Campus.parkingSpot('luna').transport, 'walk');
  assert.equal(Object.values(Campus.TRANSPORT).filter((kind) => kind !== 'walk').length, 8);
  assert.equal(Campus.CLEANING.length, 12);
  for (const room of Object.values(Campus.ROOMS)) {
    assert.ok(room.minX < room.maxX && room.minZ < room.maxZ);
  }
});

test('lobby khusus luas, parkir di samping, halaman lega, dan musala diapit fasilitas pendukung', () => {
  const { lobby, staff, bathroom, prayer, wudu, parking, grounds } = Campus.ROOMS;
  assert.ok((lobby.maxX - lobby.minX) * (lobby.maxZ - lobby.minZ) > 400);
  assert.ok(staff.maxZ < lobby.minZ && bathroom.maxZ < lobby.minZ);
  assert.equal(bathroom.maxX, prayer.minX);
  assert.equal(prayer.maxX, wudu.minX);
  assert.equal(bathroom.minZ, prayer.minZ);
  assert.equal(wudu.maxZ, prayer.maxZ);
  assert.ok(parking.minX > lobby.maxX);
  const ratio = (grounds.maxX - grounds.minX) / (grounds.maxZ - grounds.minZ);
  assert.ok(ratio > 0.8 && ratio < 1.4);
});
