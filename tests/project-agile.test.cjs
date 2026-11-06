const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../src/js/projects/project-engine.js');
const fs = require('node:fs');
const vm = require('node:vm');

const brief = (method = 'agile') => ({
  method, title: 'Company profile Studio Daun', client: 'Studio Daun',
  kind: 'Company profile', goal: 'Menjelaskan layanan dan menerima pertanyaan.',
  requirements: 'Profil studio\nKontak WhatsApp', deadline: '',
});

function approve(workspace, taskId) {
  for (const action of ['start', 'draft']) P.changeTask(workspace, taskId, action);
  for (let index = 0; index < 3; index += 1) P.changeTask(workspace, taskId, 'check', index);
  P.changeTask(workspace, taskId, 'approve');
}

function begin(workspace, feature) {
  P.backlogAction(workspace, feature.id, 'approve');
  return P.startIteration(workspace, 'Iterasi pertama', [feature.id]);
}

test('Agile menyarankan backlog dari brief, tetapi tidak memulai fitur sebelum review dan pilihan pengguna', () => {
  const workspace = P.emptyWorkspace();
  assert.throws(() => P.createProject(workspace, brief('unknown')));
  assert.throws(() => P.createProject(workspace, brief('__proto__')));
  const project = P.createProject(workspace, brief());
  assert.equal(project.tasks.length, 0);
  assert.equal(project.backlog.length, 2);
  assert.ok(project.backlog.every((feature) => !feature.approved));
  const first = project.backlog[0];
  const unchanged = JSON.stringify(workspace);
  assert.throws(() => P.startIteration(workspace, 'Iterasi 1', [first.id]));
  assert.equal(JSON.stringify(workspace), unchanged);
  P.backlogAction(workspace, first.id, 'approve');
  P.saveFeature(workspace, first.id, { ...first, criteria: 'Alur profil mencakup layanan, identitas, dan kontak.' });
  assert.equal(first.approved, false, 'edit kebutuhan membatalkan persetujuan sebelumnya');
  begin(workspace, first);
  assert.equal(project.tasks.length, 8);
  assert.equal(P.definition(project, `${first.id}:analysis`).ownerId, 'nori');
  assert.throws(() => P.saveFeature(workspace, first.id, first));
  assert.throws(() => P.backlogAction(workspace, first.id, 'delete'));
  assert.throws(() => P.startIteration(workspace, 'Iterasi ganda', [first.id]));
  assert.throws(() => P.closeIteration(workspace));
  assert.deepEqual(P.validateWorkspace(workspace), workspace);
});

test('urutan backlog dapat diubah, ditambah dan dihapus tanpa menyentuh pekerjaan aktif', () => {
  const workspace = P.emptyWorkspace();
  const project = P.createProject(workspace, brief());
  const firstId = project.backlog[0].id;
  P.backlogAction(workspace, firstId, 'down');
  assert.equal(project.backlog[1].id, firstId);
  const extra = P.saveFeature(workspace, null, {
    title: 'Portofolio', need: 'Pengunjung melihat karya studio.',
    priority: 'low', criteria: 'Daftar karya dan alur detail dijelaskan.',
  });
  assert.equal(project.backlog.length, 3);
  assert.throws(() => P.saveFeature(workspace, extra.id, { ...extra, criteria: '' }));
  P.backlogAction(workspace, extra.id, 'delete');
  assert.equal(project.backlog.length, 2);
  assert.deepEqual(P.validateWorkspace(workspace), workspace);
});

test('dua fitur dalam iterasi punya prasyarat sendiri; progres menghitung penerimaan fitur, bukan waktu/tugas', () => {
  const workspace = P.emptyWorkspace();
  const project = P.createProject(workspace, brief());
  for (const feature of project.backlog) P.backlogAction(workspace, feature.id, 'approve');
  const [first, second] = project.backlog;
  P.startIteration(workspace, 'Fitur inti', [first.id, second.id]);
  approve(workspace, `${second.id}:scope`);
  assert.equal(P.summary(project).percent, 0);
  assert.deepEqual(P.blockers(project, `${first.id}:analysis`), [`${first.id}:scope`]);
  assert.deepEqual(P.blockers(project, `${second.id}:analysis`), []);
  const template = project.tasks.find((task) => task.id === `${second.id}:scope`).artifact;
  assert.match(template, /Kontak WhatsApp/);
  assert.doesNotMatch(template, /Fitur: Profil studio/);
  for (const spec of P.TASKS) approve(workspace, `${first.id}:${spec.id}`);
  assert.deepEqual(P.summary(project), { done: 1, total: 2, percent: 50, complete: false });
  for (const spec of P.TASKS.slice(1)) approve(workspace, `${second.id}:${spec.id}`);
  assert.equal(P.summary(project).percent, 100);
  P.closeIteration(workspace);
  assert.ok(project.iterations[0].closedAt);
  const extra = P.saveFeature(workspace, null, {
    title: 'Artikel', need: 'Membaca kabar studio.', priority: 'low', criteria: 'Daftar artikel dan kondisi kosong tercatat.',
  });
  assert.equal(P.summary(project).percent, 67, 'cakupan baru menambah penyebut progres');
  begin(workspace, extra);
  assert.equal(project.tasks.length, 24);
  const note = P.recordMeeting(workspace);
  assert.equal(note.actions.length, 8);
  assert.match(P.projectMarkdown(project), /Backlog fitur/);
  assert.match(P.projectMarkdown(project), /Fitur inti/);
  const snapshot = P.clone(workspace);
  assert.deepEqual(P.validateWorkspace(snapshot), workspace);
  P.archiveActive(workspace);
  assert.deepEqual(P.validateWorkspace(workspace), workspace);
  P.resume(workspace, project.id);
  assert.deepEqual(workspace.active.tasks, snapshot.active.tasks);
  assert.deepEqual(workspace.active.iterations, snapshot.active.iterations);
});

test('cadangan menolak relasi backlog/iterasi/tugas palsu sebelum memutasi data', () => {
  const workspace = P.emptyWorkspace();
  const project = P.createProject(workspace, brief());
  begin(workspace, project.backlog[0]);
  const cases = [
    (p) => { p.method = 'hybrid'; },
    (p) => { p.backlog[0].approved = false; },
    (p) => { p.backlog[0].iterationId = 'missing'; },
    (p) => { p.backlog.push(P.clone(p.backlog[0])); },
    (p) => { p.iterations[0].featureIds.push(p.backlog[0].id); },
    (p) => { p.iterations[0].closedAt = new Date().toISOString(); },
    (p) => { p.tasks[0].featureId = 'other'; },
    (p) => { p.tasks[0].baseId = 'approval'; },
    (p) => { p.tasks.pop(); },
    (p) => { p.tasks[1].status = 'doing'; },
    (p) => { p.backlog[0].priority = 'unknown'; },
  ];
  const original = JSON.stringify(workspace);
  for (const corrupt of cases) {
    const copy = P.clone(workspace);
    corrupt(copy.active);
    assert.throws(() => P.validateWorkspace(copy));
    assert.equal(JSON.stringify(workspace), original);
  }
});

test('save lama tanpa metode menjadi Alur lama dan tidak diubah menjadi Agile', () => {
  const workspace = P.emptyWorkspace();
  P.createProject(workspace, brief('waterfall'));
  approve(workspace, 'scope');
  const old = P.clone(workspace);
  for (const key of ['method', 'backlog', 'iterations']) delete old.active[key];
  const restored = P.validateWorkspace(old);
  assert.equal(restored.active.method, 'legacy');
  assert.equal(P.methodName(restored.active), 'Alur lama');
  assert.deepEqual(restored.active.tasks, workspace.active.tasks);
  assert.equal(old.active.method, undefined);
});

test('modul metode dapat di-link sebagai skrip browser lokal tanpa require atau bundler', () => {
  const context = vm.createContext({});
  for (const file of ['methods/waterfall.js', 'methods/iterative.js', 'methods/agile.js', 'methods/hybrid.js', 'project-engine.js']) {
    const path = require.resolve(`../src/js/projects/${file}`);
    vm.runInContext(fs.readFileSync(path, 'utf8'), context);
  }
  const engine = context.PawfficeProjects;
  const workspace = engine.emptyWorkspace();
  const project = engine.createProject(workspace, brief());
  assert.equal(project.method, 'agile');
  assert.equal(project.backlog.length, 2);
  assert.equal(engine.validateWorkspace(workspace).active.backlog.length, 2);
});
