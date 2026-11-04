const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../src/js/projects/project-engine.js');

const brief = () => ({
  title: 'Website studio tanaman',
  client: 'Studio Daun',
  kind: 'Company profile',
  goal: 'Menjelaskan layanan studio dan menerima pertanyaan pelanggan.',
  requirements: 'Profil studio\nKatalog layanan\nFormulir kontak',
  deadline: '2026-12-01',
});

function approve(workspace, taskId) {
  P.changeTask(workspace, taskId, 'start');
  P.changeTask(workspace, taskId, 'draft');
  for (let check = 0; check < 3; check += 1) {
    P.changeTask(workspace, taskId, 'check', check);
  }
  P.changeTask(workspace, taskId, 'approve');
}

test('brief divalidasi sebelum membuat delapan tugas', () => {
  const workspace = P.emptyWorkspace();
  assert.throws(() => P.createProject(workspace, { ...brief(), title: '' }));
  assert.equal(workspace.active, null);
  assert.throws(() => P.createProject(workspace, { ...brief(), deadline: '2026-02-30' }));
  const project = P.createProject(workspace, brief());
  assert.equal(project.tasks.length, 8);
  assert.equal(new Set(P.TASKS.map((task) => task.ownerId)).size, 8);
  assert.equal(project.requirements.length, 3);
  assert.equal(P.summary(project).percent, 0);
  assert.throws(() => P.createProject(workspace, brief()));
});

test('tugas memerlukan prasyarat, dokumen, dan seluruh checklist review', () => {
  const workspace = P.emptyWorkspace();
  P.createProject(workspace, brief());
  const before = JSON.stringify(workspace);
  assert.throws(() => P.changeTask(workspace, 'qa', 'start'));
  assert.equal(JSON.stringify(workspace), before);
  P.changeTask(workspace, 'scope', 'start');
  assert.equal(P.summary(workspace.active).percent, 0);
  P.changeTask(workspace, 'scope', 'draft');
  assert.match(workspace.active.tasks[0].artifact, /Studio Daun/);
  assert.match(workspace.active.tasks[0].artifact, /TEMPLATE SIMULASI/);
  assert.throws(() => P.changeTask(workspace, 'scope', 'approve'));
  P.changeTask(workspace, 'scope', 'check', 0);
  P.changeTask(workspace, 'scope', 'save', 'Draf scope yang diperbaiki untuk Studio Daun.');
  assert.ok(workspace.active.tasks[0].checks.every((value) => !value));
  assert.throws(() => P.changeTask(workspace, 'scope', 'check', -1));
  P.changeTask(workspace, 'scope', 'revise');
  assert.equal(workspace.active.tasks[0].status, 'doing');
  P.changeTask(workspace, 'scope', 'draft');
  assert.match(workspace.active.tasks[0].artifact, /Draf scope yang diperbaiki/);
  for (let index = 0; index < 3; index += 1) P.changeTask(workspace, 'scope', 'check', index);
  P.changeTask(workspace, 'scope', 'approve');
  assert.equal(P.summary(workspace.active).done, 1);
  assert.throws(() => P.changeTask(workspace, 'scope', 'approve'));
  assert.throws(() => P.changeTask(workspace, 'scope', 'save', 'Mengubah hasil final'));
});

test('BE boleh paralel dengan desain; QA menunggu FE dan BE', () => {
  const workspace = P.emptyWorkspace();
  P.createProject(workspace, brief());
  approve(workspace, 'scope');
  approve(workspace, 'analysis');
  assert.deepEqual(P.blockers(workspace.active, 'backend'), []);
  assert.deepEqual(P.blockers(workspace.active, 'frontend'), ['design']);
  approve(workspace, 'backend');
  assert.deepEqual(P.blockers(workspace.active, 'qa'), ['frontend']);
  for (const taskId of ['design', 'frontend', 'qa', 'handover', 'approval']) approve(workspace, taskId);
  assert.deepEqual(P.summary(workspace.active), { done: 8, total: 8, percent: 100, complete: true });
  assert.deepEqual(P.validateWorkspace(workspace), workspace);
});

test('notulen mengacu ke tugas; arsip parsial bisa dilanjutkan tanpa kehilangan hasil', () => {
  const workspace = P.emptyWorkspace();
  assert.equal(P.recordMeeting(workspace), null);
  const project = P.createProject(workspace, brief());
  approve(workspace, 'scope');
  const note = P.recordMeeting(workspace);
  assert.equal(note.actions.includes('scope'), false);
  assert.equal(note.actions.length, 7);
  const projectId = project.id;
  const artifact = project.tasks[0].artifact;
  P.archiveActive(workspace);
  assert.equal(workspace.active, null);
  assert.equal(workspace.archive[0].meetings.length, 1);
  assert.deepEqual(P.validateWorkspace(workspace), workspace);
  P.resume(workspace, projectId);
  assert.equal(workspace.archive.length, 0);
  assert.equal(workspace.active.tasks[0].artifact, artifact);
  assert.equal(workspace.active.meetings[0].id, note.id);
  assert.match(P.projectMarkdown(workspace.active), /Notulen rapat/);
});

test('migrasi mempertahankan tahap lama dan proyek 100% tanpa hadiah ulang', () => {
  for (let stageIndex = 0; stageIndex <= 6; stageIndex += 1) {
    const workspace = P.migrateLegacy({ stageIndex, stageSeconds: 17.5 });
    assert.equal(P.summary(workspace.active).done, stageIndex === 6 ? 8 : stageIndex);
    assert.equal(workspace.active.legacySeconds, 17.5);
    assert.equal(workspace.active.migrated, true);
    assert.deepEqual(P.validateWorkspace(workspace), workspace);
  }
  assert.equal(P.summary(P.migrateLegacy({ stageIndex: 6 }).active).percent, 100);
});

test('cadangan cacat ditolak; objek input tidak dimutasi oleh validator', () => {
  const workspace = P.emptyWorkspace();
  P.createProject(workspace, brief());
  const copy = P.clone(workspace);
  assert.deepEqual(P.validateWorkspace(copy), workspace);
  assert.deepEqual(copy, workspace);
  const invalidCases = [
    (data) => { data.version = 99; },
    (data) => { data.active.tasks[0].status = 'done'; },
    (data) => { data.active.tasks[1].status = 'doing'; },
    (data) => { data.active.tasks[0].checks = [true]; },
    (data) => { data.active.meetings = [{ id: 'bad', actions: ['unknown'], note: 'x', createdAt: 'x' }]; },
    (data) => { data.archive.push({ ...data.active, archivedAt: new Date().toISOString() }); },
    (data) => { data.active.requirements = []; },
    (data) => { data.active.tasks = []; },
  ];
  for (const corrupt of invalidCases) {
    const data = P.clone(workspace);
    corrupt(data);
    assert.throws(() => P.validateWorkspace(data));
    assert.deepEqual(workspace, copy);
  }
});
