const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../src/js/projects/project-engine.js');

const brief = () => ({
  method: 'hybrid', title: 'Company profile Studio Daun', client: 'Studio Daun',
  kind: 'Company profile', goal: 'Menjelaskan layanan studio.',
  requirements: 'Profil studio\nKontak WhatsApp', deadline: '',
});

function readyForReview(workspace, taskId) {
  P.changeTask(workspace, taskId, 'start');
  P.changeTask(workspace, taskId, 'draft');
  for (let index = 0; index < 3; index += 1) P.changeTask(workspace, taskId, 'check', index);
}

function approve(workspace, taskId) {
  readyForReview(workspace, taskId);
  P.changeTask(workspace, taskId, 'approve');
}

function approvePlan(workspace) {
  for (const feature of workspace.active.backlog) P.backlogAction(workspace, feature.id, 'approve');
  approve(workspace, 'scope');
  approve(workspace, 'analysis');
}

test('Hybrid menunggu kebutuhan disetujui serta scope dan analisis selesai sebelum iterasi', () => {
  const workspace = P.emptyWorkspace();
  const project = P.createProject(workspace, brief());
  assert.deepEqual(project.tasks.map((task) => task.id), ['scope', 'analysis']);
  assert.deepEqual(P.summary(project), { done: 0, total: 4, percent: 0, complete: false });
  readyForReview(workspace, 'scope');
  const unchanged = JSON.stringify(workspace);
  assert.throws(() => P.changeTask(workspace, 'scope', 'approve'), /kebutuhan backlog/);
  assert.equal(JSON.stringify(workspace), unchanged);
  for (const feature of project.backlog) P.backlogAction(workspace, feature.id, 'approve');
  assert.throws(() => P.startIteration(workspace, 'Terlalu cepat', [project.backlog[0].id]), /analisis awal/);
  P.changeTask(workspace, 'scope', 'approve');
  assert.ok(project.backlog.every((feature) => feature.scopeStatus === 'baseline'));
  assert.equal(P.summary(project).percent, 25);
  assert.throws(() => P.startIteration(workspace, 'Belum dianalisis', [project.backlog[0].id]));
  approve(workspace, 'analysis');
  assert.equal(P.summary(project).percent, 50);
  P.startIteration(workspace, 'Iterasi 1', [project.backlog[0].id]);
  assert.equal(project.tasks.length, 10);
  assert.deepEqual(P.blockers(project, `${project.backlog[0].id}:scope`), []);
  assert.deepEqual(P.validateWorkspace(workspace), workspace);
});

test('scope awal dikunci; tambahan membutuhkan alasan, review kebutuhan, dan persetujuan scope tersendiri', () => {
  const workspace = P.emptyWorkspace();
  const project = P.createProject(workspace, brief());
  approvePlan(workspace);
  assert.throws(() => P.saveFeature(workspace, project.backlog[0].id, project.backlog[0]), /dikunci/);
  assert.throws(() => P.backlogAction(workspace, project.backlog[0].id, 'delete'));
  const input = { title: 'Artikel', need: 'Membaca kabar studio.', priority: 'low', criteria: 'Rincian halaman dan kondisi kosong.', scopeReason: '' };
  const unchanged = JSON.stringify(workspace);
  assert.throws(() => P.saveFeature(workspace, null, input), /Alasan perubahan scope/);
  assert.equal(JSON.stringify(workspace), unchanged);
  const extra = P.saveFeature(workspace, null, { ...input, scopeReason: 'Klien ingin menerbitkan kabar bulanan.' });
  assert.equal(extra.scopeStatus, 'pending');
  assert.equal(P.summary(project).percent, 40);
  assert.throws(() => P.approveScopeChange(workspace, extra.id));
  P.backlogAction(workspace, extra.id, 'approve');
  assert.throws(() => P.startIteration(workspace, 'Scope belum disetujui', [extra.id]), /scope fitur/);
  P.approveScopeChange(workspace, extra.id);
  assert.equal(extra.scopeStatus, 'approved');
  assert.ok(extra.scopeApprovedAt);
  assert.throws(() => P.approveScopeChange(workspace, extra.id), 'persetujuan tidak berulang');
  P.saveFeature(workspace, extra.id, { ...extra, criteria: 'Kriteria hasil berubah setelah diskusi klien.' });
  assert.equal(extra.scopeStatus, 'pending');
  assert.equal(extra.approved, false);
  assert.equal(extra.scopeApprovedAt, null);
  P.backlogAction(workspace, extra.id, 'approve');
  P.approveScopeChange(workspace, extra.id);
  P.startIteration(workspace, 'Kebutuhan tambahan', [extra.id]);
  assert.deepEqual(P.validateWorkspace(workspace), workspace);
});

test('Hybrid menyelesaikan milestone dan fitur per iterasi serta memulihkan arsip/ekspor', () => {
  const workspace = P.emptyWorkspace();
  const project = P.createProject(workspace, brief());
  approvePlan(workspace);
  const featureIds = project.backlog.map((feature) => feature.id);
  P.startIteration(workspace, 'Fitur inti', featureIds);
  for (const featureId of featureIds) {
    for (const spec of P.TASKS) approve(workspace, `${featureId}:${spec.id}`);
  }
  assert.deepEqual(P.summary(project), { done: 4, total: 4, percent: 100, complete: true });
  P.closeIteration(workspace);
  P.recordMeeting(workspace);
  P.archiveActive(workspace);
  assert.deepEqual(P.validateWorkspace(workspace), workspace);
  assert.match(P.projectMarkdown(workspace.archive[0]), /Metode: Hybrid/);
  assert.match(P.projectMarkdown(workspace.archive[0]), /Scope: baseline/);
  P.resume(workspace, project.id);
  assert.equal(P.summary(workspace.active).percent, 100);
});

test('cadangan Hybrid menolak baseline palsu, scope belum disetujui, dan iterasi sebelum perencanaan', () => {
  const workspace = P.emptyWorkspace();
  const project = P.createProject(workspace, brief());
  approvePlan(workspace);
  P.startIteration(workspace, 'Fitur inti', [project.backlog[0].id]);
  const corruptions = [
    (p) => { p.backlog[0].scopeStatus = 'pending'; },
    (p) => { p.backlog[0].scopeApprovedAt = null; },
    (p) => { p.backlog[0].scopeApprovedAt = '2020-01-01T00:00:00.000Z'; },
    (p) => { p.backlog[0].scopeReason = 42; },
    (p) => { p.tasks[1].status = 'todo'; },
    (p) => { p.tasks.shift(); },
  ];
  const unchanged = JSON.stringify(workspace);
  for (const corrupt of corruptions) {
    const copy = P.clone(workspace);
    corrupt(copy.active);
    assert.throws(() => P.validateWorkspace(copy));
    assert.equal(JSON.stringify(workspace), unchanged);
  }
});
