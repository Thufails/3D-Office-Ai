const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');
const root = require('node:path').resolve(__dirname, '..');
const Projects = require(`${root}/src/js/projects/project-engine.js`);
const Schedule = require(`${root}/src/js/office/office-schedule.js`);
const Campus = require(`${root}/src/js/office/office-campus.js`);
const THREE = require(`${root}/vendor/three/Three.js`);
const viewport = { width: 1000, height: 700 };
const surfaceOffset = { left: 0, top: 0 };

function element() {
  return {
    children: [],
    listeners: {},
    attributes: {},
    open: false,
    style: {},
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    append(...items) { this.children.push(...items); },
    replaceChildren(...items) { this.children = items; },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    showModal() { this.open = true; },
    close() { this.open = false; },
    getBoundingClientRect() {
      return {
        ...viewport,
        ...surfaceOffset,
        right: surfaceOffset.left + viewport.width,
        bottom: surfaceOffset.top + viewport.height,
      };
    },
    getContext() {
      return new Proxy({}, {
        get(target, key) { return target[key] || (() => {}); },
      });
    },
  };
}

const elements = new Map();
const storage = new Map();
const localStorage = {
  getItem(key) { return storage.get(key) || null; },
  setItem(key, value) { storage.set(key, value); },
};
const documentListeners = {};
let projectHubOptions;
const context = vm.createContext({
  THREE,
  window: {
    THREE, localStorage, devicePixelRatio: 1,
    PawfficeProjects: Projects,
    PawfficeSchedule: Schedule,
    PawfficeCampus: Campus,
    PawfficeOfficeUI: { mount() { return { refresh() {} }; } },
    PawfficeProjectUI: {
      mount(options) {
        projectHubOptions = options;
        return { refresh() {}, open() {} };
      },
    },
  },
  document: {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    createElement: element,
    createElementNS: element,
    addEventListener(name, fn) { documentListeners[name] = fn; },
  },
  console,
  performance,
  setTimeout() { return 1; },
  clearTimeout() {},
});

const source = fs.readFileSync(`${root}/src/js/main.js`, 'utf8');
assert.equal(source.split('    boot();').length, 2);
const instrumented = source.replace('    boot();', `
    globalThis.office = {
      TEAM, PROJECT_TEAM, cats, simulation, MEETING_SEATS, LOUNGE_SEATS, LOUNGE_SPOTS, COFFEE_TARGET,
      Campus, facilityState, createCampus,
      ROLE_DETAILS, OFFICE_ROOMS, ROOM_DOORS, MEETING_TABLE, orbit,
      workspaceLabels, updateCamera,
      get camera() { return camera; },
      findPath, blocked, navigate, moveCat, animateCat,
      obstacles, nearbyObstacles, segmentHitsBox, segmentHitsCircle,
      progressSnapshot, loadProgress, saveProgress, renderCrewCards,
      restoreProgress, validateProgress, dailyQuestsForDate, readJakartaTime,
      updateSimulation, updateUI, renderMainQuest, resetDailyProgress, installProjectHub,
      syncOfficeSchedule, applyOfficeRoutine, officeContext,
      renderJobdesk, createWorkspaceLabels, updateWorkspaceLabels, installButtons,
      initializeCamera() {
        camera = new THREE.OrthographicCamera(-16, 16, 12, -12, 0.1, 180);
        renderer = { setSize() {}, setPixelRatio() {} };
        resize();
        updateCamera(1);
      },
      get scene() { return scene; },
      initialize() {
        scene = new THREE.Scene();
        resetDailyProgress(readJakartaTime().dateKey);
        createRoom();
        createWorkRoom();
        createPantryRoom();
        createMeetingRoom();
        createOwnerRoom();
        PROJECT_TEAM.forEach(createDesk);
        createCoffeeCorner();
        createCampus();
        TEAM.forEach(createCat);
        selected = cats[0];
        scene.updateMatrixWorld(true);
      }
    };
`);
const traced = process.argv.includes('--trace-routes')
  ? instrumented.replace('let route = findPath(cat.root.position, target, cat, true);',
    'console.log("NAV", cat.data.id, activity); const routeStarted = performance.now(); let route = findPath(cat.root.position, target, cat, true); console.log("ROUTE", cat.data.id, Math.round(performance.now() - routeStarted), route.length);')
  : instrumented;
vm.runInContext(traced, context, { filename: 'src/js/main.js' });
const office = context.office;
office.initialize();
office.simulation.projects = Projects.migrateLegacy({ stageIndex: 0 });
office.renderCrewCards();
office.renderJobdesk();
office.createWorkspaceLabels();
office.installButtons();
office.initializeCamera();
office.updateWorkspaceLabels();

assert.equal(office.TEAM.length, 10);
assert.equal(elements.get('team-list').children.length, 10);
assert.deepEqual(Array.from(office.TEAM.slice(0, 3), (x) => x.id),
  ['miko', 'nori', 'luna']);
assert.deepEqual(Array.from(office.TEAM.slice(3, 6), (x) => x.id),
  ['kiko', 'bimo', 'piko']);
assert.equal(office.MEETING_SEATS.length, 8);
assert.equal(Object.keys(office.OFFICE_ROOMS).length, 11);
const rooms = Object.values(office.OFFICE_ROOMS);
const officeWidth = Math.max(...rooms.map((x) => x.maxX))
  - Math.min(...rooms.map((x) => x.minX));
const officeDepth = Math.max(...rooms.map((x) => x.maxZ))
  - Math.min(...rooms.map((x) => x.minZ));
assert.ok(officeWidth / officeDepth > 0.8 && officeWidth / officeDepth < 1.4, 'campus is broad rather than elongated');
for (const room of Object.values(office.OFFICE_ROOMS).filter((room) => !Object.values(Campus.ROOMS).includes(room))) {
  assert.ok((room.maxX - room.minX) * (room.maxZ - room.minZ) > 170,
    `${room.name}: room is too small`);
}
const pantry = office.OFFICE_ROOMS.pantry;
for (const seat of office.LOUNGE_SEATS) {
  assert.ok(seat.x > pantry.minX && seat.x < pantry.maxX
    && seat.z > pantry.minZ && seat.z < pantry.maxZ, 'rest seat outside pantry');
}
assert.ok(office.COFFEE_TARGET.x > pantry.minX && office.COFFEE_TARGET.x < pantry.maxX
  && office.COFFEE_TARGET.z > pantry.minZ && office.COFFEE_TARGET.z < pantry.maxZ);
assert.ok(office.MEETING_TABLE.width / office.MEETING_TABLE.depth > 2.5,
  'meeting table is long and rectangular');
assert.equal(office.scene.children.filter((x) => x.userData.kind === 'lounge-chair').length, 8);
assert.equal(elements.get('jobdesk-list').children.length, 10);
for (const card of elements.get('jobdesk-list').children) {
  assert.equal(card.children[2].children.length, 3);
}
assert.equal(elements.get('workspace-labels').children.length, 10);
assert.ok(elements.get('workspace-labels').children.every((x) => !x.hidden));
elements.get('jobdesk-button').listeners.click();
assert.equal(elements.get('jobdesk-dialog').open, true);
elements.get('jobdesk-close').listeners.click();
assert.equal(elements.get('jobdesk-dialog').open, false);
documentListeners.keydown({ target: { tagName: 'DIV' }, key: 'j', code: 'KeyJ' });
assert.equal(elements.get('jobdesk-dialog').open, true);
elements.get('jobdesk-close').listeners.click();
for (const id of Object.keys(office.OFFICE_ROOMS)) {
  elements.get(`room-${id}`).listeners.click();
  assert.equal(office.orbit.goalTarget.x, office.OFFICE_ROOMS[id].x);
  assert.equal(office.orbit.goalTarget.z, office.OFFICE_ROOMS[id].z);
  assert.equal(elements.get('room-current-name').textContent, office.OFFICE_ROOMS[id].name);
  assert.equal(elements.get('location-menu').open, false);
}
elements.get('room-overview').listeners.click();
const html = fs.readFileSync(`${root}/3D-index.html`, 'utf8');
const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
assert.equal(new Set(htmlIds).size, htmlIds.length, 'duplicate HTML ids');
for (const match of source.matchAll(/\$\("([^"]+)"\)/g)) {
  assert.ok(htmlIds.includes(match[1]), `missing DOM id ${match[1]}`);
}
assert.ok(html.indexOf('class="room-navigation"') < html.indexOf('class="world"'),
  'location navigation must be outside the 3D viewport');
const css = fs.readFileSync(`${root}/src/css/style.css`, 'utf8');
assert.ok(!/Georgia/.test(css), 'UI headings use the new sans-serif font');
for (const match of css.matchAll(/font-size:\s*(\d+)px/g)) {
  assert.ok(Number(match[1]) >= 12, `small UI text: ${match[0]}`);
}
assert.equal(office.blocked(3.0, 1.0), true, 'vertical room divider is solid');
assert.equal(office.blocked(-15, 3.0), true, 'work/pantry wall is solid');
assert.equal(office.blocked(6, 0), true, 'meeting/owner wall is solid');
for (const door of office.ROOM_DOORS) {
  assert.equal(office.blocked(door.x, door.z), false, `${door.label} doorway is open`);
}
console.log('PASS: larger rectangular 4-room office, long meeting table, 8 pantry seats, readable UI and sidebar location menu.');

function checkLabelAnchors() {
  office.updateWorkspaceLabels();
  const labels = elements.get('workspace-labels').children;
  for (let index = 0; index < office.cats.length; index += 1) {
    const cat = office.cats[index];
    const label = labels[index];
    const expected = cat.root.localToWorld(new THREE.Vector3(0, 2.65, 0))
      .project(office.camera);
    const visible = Math.abs(expected.x) <= 1
      && Math.abs(expected.y) <= 1 && Math.abs(expected.z) <= 1;
    assert.equal(label.hidden, !visible, `${cat.data.id}: incorrect visibility`);
    assert.equal(label.dataset.ownerId, cat.data.id);
    assert.equal(label.children[0].textContent, cat.data.name);
    assert.equal(label.children[1].textContent, office.ROLE_DETAILS[cat.data.id].label);
    assert.equal(office.workspaceLabels[index].anchor.parent, cat.root);
    if (!visible) continue;
    const match = label.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);
    assert.ok(match);
    const x = Number(match[1]);
    const y = Number(match[2]);
    assert.ok(Math.abs(x - (expected.x + 1) * viewport.width / 2) < 1e-7,
      `${cat.data.id}: label drifted horizontally`);
    assert.ok(Math.abs(y - (1 - expected.y) * viewport.height / 2) < 1e-7,
      `${cat.data.id}: label drifted vertically`);
    const scale = Number(label.style.transform.match(/scale\(([\d.]+)\)/)[1]);
    const expectedScale = Math.min(1.1, viewport.height * office.camera.zoom
      / (office.camera.top - office.camera.bottom) / 32);
    assert.ok(Math.abs(scale - expectedScale) < 1e-10);
  }
}

let cameraCases = 0;
for (const [width, height] of [[1000, 700], [700, 500], [390, 390], [320, 390]]) {
  Object.assign(viewport, { width, height });
  office.initializeCamera();
  office.orbit.follow = false;
  office.orbit.goalTarget.set(0, 0.8, 0);
  for (const zoom of [0.55, 1, 2.2, 4]) {
    for (const theta of [-0.7, 0.62, 1.3]) {
      for (const phi of [0.45, 1.2]) {
        office.orbit.goalZoom = zoom;
        office.orbit.goalTheta = theta;
        office.orbit.goalPhi = phi;
        office.updateCamera(10);
        checkLabelAnchors();
        cameraCases += 1;
      }
    }
  }
}
console.log(`PASS: all labels stay on their own avatar with correct roles across ${cameraCases} zoom/rotation/viewport combinations.`);

Object.assign(viewport, { width: 1000, height: 700 });
office.orbit.goalZoom = 1;
office.orbit.goalTheta = 0.62;
office.orbit.goalPhi = 0.9;
office.initializeCamera();
office.updateCamera(10);
checkLabelAnchors();
const beforeScroll = elements.get('workspace-labels').children.map((x) => x.style.transform);
Object.assign(surfaceOffset, { left: 342, top: -500 });
office.initializeCamera();
checkLabelAnchors();
assert.deepEqual(elements.get('workspace-labels').children.map((x) => x.style.transform),
  beforeScroll, 'page scroll offset must not move labels within the scene');

const moving = office.cats[1];
const savedPosition = moving.root.position.clone();
moving.root.position.copy(office.COFFEE_TARGET);
checkLabelAnchors();
assert.notEqual(elements.get('workspace-labels').children[1].style.transform, beforeScroll[1]);
moving.root.position.x = 1000;
checkLabelAnchors();
assert.equal(elements.get('workspace-labels').children[1].hidden, true);
for (let index = 0; index < office.cats.length; index += 1) {
  if (index === 1) continue;
  assert.equal(elements.get('workspace-labels').children[index].style.transform,
    beforeScroll[index], 'another avatar must not rearrange this label');
}
moving.root.position.copy(savedPosition);
checkLabelAnchors();
const oldAnchors = office.workspaceLabels.map((x) => x.anchor);
office.createWorkspaceLabels();
checkLabelAnchors();
assert.ok(oldAnchors.every((anchor) => anchor.parent === null));
assert.match(css, /transform-origin: center bottom/);
assert.ok(fs.existsSync(`${root}/assets/images/readme-banner.svg`));
assert.match(fs.readFileSync(`${root}/README.md`, 'utf8'), /assets\/images\/readme-banner\.svg/);
console.log('PASS: scrolling, moving avatars, offscreen labels and label recreation do not shift other roles; local README banner is linked.');
for (let index = 0; index < 180; index += 1) {
  const start = { x: -31 + (index * 7.13) % 69, z: -30 + (index * 3.71) % 62 };
  const end = { x: start.x + (index % 7 - 3) * 1.1, z: start.z + (index % 5 - 2) * 1.2 };
  const candidates = office.nearbyObstacles(start.x, start.z, end.x, end.z);
  for (const obstacle of office.obstacles) {
    const hit = obstacle.type === 'circle'
      ? office.segmentHitsCircle(start, end, obstacle.x, obstacle.z, obstacle.radius + 0.4)
      : office.segmentHitsBox(start, end, obstacle);
    assert.ok(!hit || candidates.includes(obstacle), 'spatial index missed a collision checked by the exact geometry');
  }
}
console.log('PASS: spatial obstacle lookup preserves exact collision candidates across 180 campus segments.');
if (process.argv.includes('--ui-only')) process.exit(0);

function getObject(kind, ownerId) {
  return office.scene.children.find((object) => {
    return object.userData.kind === kind && object.userData.ownerId === ownerId;
  });
}

function checkSeated(cat) {
  office.scene.updateMatrixWorld(true);
  const chair = getObject('work-chair', cat.data.id);
  const desk = getObject('desk', cat.data.id);
  const position = cat.root.getWorldPosition(new THREE.Vector3());
  const chairPosition = chair.getWorldPosition(new THREE.Vector3());
  assert.ok(Math.hypot(position.x - chairPosition.x,
    position.z - chairPosition.z) < 1e-8, `${cat.data.id}: avatar misses chair`);
  assert.ok(Math.abs(cat.root.rotation.y - chair.rotation.y) < 1e-8,
    `${cat.data.id}: avatar faces away from chair`);
  const heading = new THREE.Vector3(0, 0, 1)
    .applyQuaternion(cat.root.getWorldQuaternion(new THREE.Quaternion()));
  const offset = desk.position.clone().sub(cat.root.position);
  offset.y = 0;
  assert.ok(Math.abs(offset.dot(heading) - 1.2) < 1e-8,
    `${cat.data.id}: desk is not in front of avatar`);
  const monitor = desk.children.find((x) => x.userData.kind === 'monitor');
  assert.equal(monitor.rotation.y, 0, `${cat.data.id}: monitor is tilted`);
  const pelvisBottom = position.y + 0.73 - 0.32 * 0.52;
  assert.ok(Math.abs(pelvisBottom - (0.56 + 0.13 / 2)) < 0.01,
    `${cat.data.id}: avatar floats above seat`);
}

for (let tick = 0; tick < 60; tick += 1) {
  for (const cat of office.cats) office.animateCat(cat, 1 / 60);
}
for (const cat of office.cats.filter((cat) => !cat.data.operational)) checkSeated(cat);
console.log('PASS: all 8 avatars share chair coordinates, face their desks, and have straight monitors.');

const projectCats = office.cats.filter((cat) => !cat.data.operational);
if (!process.argv.includes('--projects-only') && !process.argv.includes('--schedule-only')) {
  for (const cat of projectCats.filter((cat) => !cat.data.operational)) {
    const targets = [cat.data.desk, office.COFFEE_TARGET,
      office.LOUNGE_SPOTS[projectCats.indexOf(cat)]];
    const meeting = office.MEETING_SEATS.find((x) => x.ownerId === cat.data.id);
    targets.push(new THREE.Vector3(meeting.x, 0, meeting.z));
    for (const target of targets) {
      assert.equal(office.blocked(target.x, target.z, cat, false), false,
        `${cat.data.id}: destination intersects furniture ${target.toArray()}`);
      assert.ok(office.findPath(cat.data.desk, target, cat, false).length,
        `${cat.data.id}: destination unreachable ${target.toArray()}`);
    }
  }
  console.log('PASS: all 32 work/coffee/lounge/meeting destinations are clear and reachable.');

  function finishWalking(cats, label) {
    const limit = 2400;
    let tick = 0;
    for (; tick < limit && cats.some((cat) => cat.mode === 'walk'); tick += 1) {
      for (const cat of cats) {
        if (cat.mode === 'walk') office.moveCat(cat, 0.05);
        office.animateCat(cat, 0.05);
      }
    }
    const stuck = cats.filter((cat) => cat.mode === 'walk').map((cat) => ({
      id: cat.data.id,
      position: cat.root.position.toArray(),
      target: cat.navTarget?.toArray(),
    }));
    assert.equal(stuck.length, 0, `${label}: stuck agents ${JSON.stringify(stuck)}`);
  }

  for (const activity of ['coffee', 'lounge']) {
    for (const cat of projectCats) {
      assert.ok(office.navigate(cat, activity), `${cat.data.id}: start ${activity}`);
      finishWalking([cat], `${cat.data.id} ${activity}`);
      assert.equal(cat.mode, activity);
      if (activity === 'lounge') {
        const chair = getObject('lounge-chair', cat.data.id);
        assert.ok(Math.hypot(cat.root.position.x - chair.position.x,
          cat.root.position.z - chair.position.z) < 1e-8);
        assert.ok(Math.abs(cat.root.rotation.y - chair.rotation.y) < 1e-8);
      }
      assert.ok(office.navigate(cat, 'work'));
      finishWalking([cat], `${cat.data.id} return from ${activity}`);
      checkSeated(cat);
    }
  }
  console.log('PASS: every avatar walks to coffee/lounge and returns exactly onto its chair.');

  for (const cat of projectCats) assert.ok(office.navigate(cat, 'meeting'));
  finishWalking(projectCats, 'all-team meeting');
  assert.ok(projectCats.every((cat) => cat.mode === 'meeting'));
  office.updateSimulation(0.01);
  assert.equal(office.simulation.projects.active.meetings.length, 1);
  office.updateSimulation(0.01);
  assert.equal(office.simulation.projects.active.meetings.length, 1,
    'one gathering must not create duplicate minutes every frame');
  for (const cat of projectCats) {
    const chair = getObject('meeting-chair', cat.data.id);
    assert.ok(Math.hypot(cat.root.position.x - chair.position.x,
      cat.root.position.z - chair.position.z) < 1e-8);
    assert.ok(Math.abs(cat.root.rotation.y - chair.rotation.y) < 1e-8);
  }
  for (const cat of projectCats) assert.ok(office.navigate(cat, 'work'));
  finishWalking(projectCats, 'return from meeting');
  for (const cat of projectCats) checkSeated(cat);
  console.log('PASS: all 8 avatars attend the meeting together and return to their chairs.');

  for (const cat of projectCats) assert.ok(office.navigate(cat, 'lounge'));
  finishWalking(projectCats, 'all-team pantry visit');
  assert.ok(projectCats.every((cat) => cat.mode === 'lounge'));
  for (const cat of projectCats) assert.ok(office.navigate(cat, 'work'));
  finishWalking(projectCats, 'return from pantry');
  for (const cat of projectCats) checkSeated(cat);
  console.log('PASS: all 8 avatars rest in the pantry together and return to work.');
}


const legacy = {
  version: 2,
  selectedId: 'luna',
  seen: ['miko', 'luna'],
  happiness: 100,
  mainQuest: { stageIndex: 3, stageSeconds: 17.4 },
  coffee: true,
};
office.restoreProgress(legacy);
assert.equal(office.simulation.projects.active.tasks.filter((task) => task.status === 'done').length, 3);
assert.equal(office.simulation.projects.active.legacySeconds, 17.4);
assert.equal(office.simulation.happiness, 100);
assert.equal(office.simulation.selectedId, 'luna');
assert.equal(legacy.version, 2);
storage.delete('pawffice.progress.v3');
storage.set('pawffice.progress.v2', JSON.stringify(legacy));
office.loadProgress();
assert.equal(storage.get('pawffice.progress.v2'), JSON.stringify(legacy),
  'v2 original must remain available after migration');
office.saveProgress(true);
const saved = JSON.parse(storage.get('pawffice.progress.v3'));
assert.equal(saved.version, 3);
office.simulation.projects = Projects.emptyWorkspace();
office.loadProgress();
assert.equal(office.simulation.projects.active.legacySeconds, 17.4);
assert.equal(office.simulation.happiness, 100);
const beforeInvalid = JSON.stringify(office.progressSnapshot());
assert.throws(() => office.restoreProgress({ ...saved, projects: { version: 99 } }));
assert.equal(JSON.stringify(office.progressSnapshot()), beforeInvalid);

office.simulation.projects = Projects.migrateLegacy({ stageIndex: 6 });
office.resetDailyProgress(office.readJakartaTime().dateKey);
office.simulation.daily.questIds = ['project', 'focus', 'coffee'];
assert.equal(office.dailyQuestsForDate(office.simulation.daily.dateKey).length, 3);
assert.equal(office.simulation.daily.questIds.includes('project'), false);
const fixedQuests = JSON.stringify(office.simulation.daily.questIds);
office.dailyQuestsForDate(office.simulation.daily.dateKey);
assert.equal(JSON.stringify(office.simulation.daily.questIds), fixedQuests);

office.simulation.projects = Projects.migrateLegacy({ stageIndex: 0 });
const beforeTimer = JSON.stringify(office.simulation.projects.active.tasks);
for (const cat of office.cats) { cat.mode = 'work'; cat.timer = 1e6; }
office.updateSimulation(31);
assert.equal(JSON.stringify(office.simulation.projects.active.tasks), beforeTimer,
  'working for 30 seconds must no longer complete project tasks');
office.saveProgress(true);
const validSnapshot = office.progressSnapshot();
storage.set('pawffice.progress.v3', '{broken-json');
office.loadProgress();
office.saveProgress(true);
assert.equal(storage.get('pawffice.progress.v3'), '{broken-json',
  'corrupt storage must not be silently overwritten');
office.restoreProgress(validSnapshot);
office.saveProgress(true);
assert.equal(JSON.parse(storage.get('pawffice.progress.v3')).version, 3);
office.installProjectHub();
const backup = projectHubOptions.makeBackup();
assert.equal(backup.format, 'pawffice-backup');
const checked = projectHubOptions.checkBackup(backup);
assert.equal(checked.version, 3);
assert.throws(() => projectHubOptions.checkBackup({ format: 'unknown', version: 1 }));
assert.equal(projectHubOptions.importProgress(checked), true,
  'import must report success even when selectCat already saved the same payload');
office.resetDailyProgress(office.readJakartaTime().dateKey);
office.simulation.daily.questIds = ['coffee', 'lounge', 'meet-all'];
const happinessBeforeApproval = office.simulation.happiness;
Projects.changeTask(office.simulation.projects, 'scope', 'start');
Projects.changeTask(office.simulation.projects, 'scope', 'draft');
for (let index = 0; index < 3; index += 1) {
  Projects.changeTask(office.simulation.projects, 'scope', 'check', index);
}
const approved = Projects.changeTask(office.simulation.projects, 'scope', 'approve');
projectHubOptions.onChange('approve', approved);
assert.equal(office.simulation.happiness, happinessBeforeApproval + 25);
office.loadProgress();
assert.equal(office.simulation.happiness, happinessBeforeApproval + 25,
  'reloading an approved task must not give another reward');
console.log('PASS: v2-to-v3 migration, v3 persistence, atomic validation, impossible daily quest replacement, manual-only task progress and corrupt-save protection.');

office.simulation.projects = Projects.emptyWorkspace();
const agileProject = Projects.createProject(office.simulation.projects, {
  method: 'agile', title: 'Company profile Studio Daun', client: 'Studio Daun',
  kind: 'Company profile', goal: 'Mengenalkan layanan dan kontak studio.',
  requirements: 'Profil studio\nKontak WhatsApp', deadline: '',
});
projectHubOptions.onChange('create', agileProject);
office.updateUI();
assert.match(elements.get('main-quest-stage').textContent, /backlog/);
assert.match(elements.get('main-quest-stage-count').textContent, /0 dari 2 fitur/);
assert.match(elements.get('state-miko').textContent, /Menunggu rencana iterasi/);
const agileFeature = agileProject.backlog[0];
Projects.backlogAction(office.simulation.projects, agileFeature.id, 'approve');
const agileIteration = Projects.startIteration(office.simulation.projects, 'Iterasi 1', [agileFeature.id]);
projectHubOptions.onChange('iteration', agileIteration);
const agileTaskId = `${agileFeature.id}:scope`;
Projects.changeTask(office.simulation.projects, agileTaskId, 'start');
Projects.changeTask(office.simulation.projects, agileTaskId, 'draft');
for (let index = 0; index < 3; index += 1) Projects.changeTask(office.simulation.projects, agileTaskId, 'check', index);
const happinessBeforeAgile = office.simulation.happiness;
const agileApproved = Projects.changeTask(office.simulation.projects, agileTaskId, 'approve');
projectHubOptions.onChange('approve', agileApproved);
office.updateUI();
assert.equal(office.simulation.happiness, happinessBeforeAgile + 25);
assert.match(elements.get('main-quest-stage-count').textContent, /0 dari 2 fitur/);
assert.match(elements.get('main-quest-stage').textContent, /Rangkum kebutuhan sistem.*Profil studio/);
const agileBackup = projectHubOptions.checkBackup(projectHubOptions.makeBackup());
assert.equal(agileBackup.projects.active.backlog.length, 2);
assert.equal(agileBackup.projects.active.iterations.length, 1);
office.loadProgress();
assert.equal(office.simulation.projects.active.tasks[0].status, 'done');
assert.equal(office.simulation.projects.active.method, 'agile');
assert.equal(office.simulation.happiness, happinessBeforeAgile + 25);
assert.equal(projectHubOptions.importProgress(agileBackup), true);
console.log('PASS: Agile integrates with office focus, avatar role labels, per-feature rewards, v3 reload and backup import without progress reset.');

office.simulation.projects = Projects.emptyWorkspace();
const hybridProject = Projects.createProject(office.simulation.projects, {
  method: 'hybrid', title: 'Company profile Studio Daun', client: 'Studio Daun',
  kind: 'Company profile', goal: 'Mengenalkan layanan studio.', requirements: 'Profil studio', deadline: '',
});
projectHubOptions.onChange('create', hybridProject);
office.updateUI();
assert.match(elements.get('main-quest-stage-count').textContent, /0 dari 3 milestone/);
assert.match(elements.get('main-quest-description').textContent, /Hybrid/);
Projects.backlogAction(office.simulation.projects, hybridProject.backlog[0].id, 'approve');
for (const taskId of ['scope', 'analysis']) {
  Projects.changeTask(office.simulation.projects, taskId, 'start');
  Projects.changeTask(office.simulation.projects, taskId, 'draft');
  for (let index = 0; index < 3; index += 1) Projects.changeTask(office.simulation.projects, taskId, 'check', index);
  const done = Projects.changeTask(office.simulation.projects, taskId, 'approve');
  projectHubOptions.onChange('approve', done);
}
const scopeExtra = Projects.saveFeature(office.simulation.projects, null, {
  title: 'Kontak WhatsApp', need: 'Pengunjung menghubungi studio.', priority: 'high',
  criteria: 'Alur tombol dan tujuan kontak dirinci.', scopeReason: 'Permintaan tambahan setelah scope awal.',
});
Projects.backlogAction(office.simulation.projects, scopeExtra.id, 'approve');
const beforeScopeApproval = office.simulation.happiness;
projectHubOptions.onChange('scope-change', Projects.approveScopeChange(office.simulation.projects, scopeExtra.id));
assert.equal(office.simulation.happiness, beforeScopeApproval, 'scope approval is not a task completion reward');
const hybridIteration = Projects.startIteration(office.simulation.projects, 'Fitur tambahan', [scopeExtra.id]);
projectHubOptions.onChange('iteration', hybridIteration);
office.updateUI();
assert.match(elements.get('main-quest-stage-count').textContent, /2 dari 4 milestone/);
assert.match(elements.get('main-quest-rule').textContent, /scope, analisis awal, dan fitur/);
const hybridBackup = projectHubOptions.checkBackup(projectHubOptions.makeBackup());
assert.equal(hybridBackup.projects.active.backlog[1].scopeStatus, 'approved');
office.loadProgress();
assert.equal(office.simulation.projects.active.method, 'hybrid');
assert.equal(office.simulation.projects.active.backlog[0].scopeStatus, 'baseline');
assert.equal(projectHubOptions.importProgress(hybridBackup), true);
console.log('PASS: Hybrid milestones, scope-change decisions, actor labels and v3 reload/backup integrate with the office.');

const officeTimeAt = (hour, minute = 0) => ({ dateKey: '2026-11-06', hour, minute, second: 0 });
office.simulation.office = null;
office.syncOfficeSchedule(officeTimeAt(4, 59), true);
assert.ok(office.cats.every((cat) => !cat.root.visible && cat.mode === 'away'));
const arrivalMinute = office.simulation.office.day.members[0].arrivalMinute;
office.syncOfficeSchedule(officeTimeAt(7, arrivalMinute - 420));
assert.equal(office.cats[0].root.visible, true);
assert.ok(office.cats.slice(1).filter((cat) => !cat.data.operational).every((cat) => !cat.root.visible));
office.cats[1].root.position.set(0, 0, 26);
assert.equal(office.blocked(0, 26, office.cats[0], true), false,
  'hidden avatars must not obstruct navigation');

function finishRoutineWalking(label) {
  console.log(`CHECK: ${label}`);
  for (let step = 0; step < 2400 && office.cats.some((cat) => cat.mode === 'walk'); step += 1) {
    for (const cat of office.cats) {
      if (cat.mode === 'walk') office.moveCat(cat, 0.05);
      office.animateCat(cat, 0.05);
    }
  }
  const stuck = office.cats.filter((cat) => cat.mode === 'walk').map((cat) => ({
    id: cat.data.id, position: cat.root.position.toArray(), target: cat.navTarget?.toArray(),
  }));
  assert.equal(stuck.length, 0, `${label}: ${JSON.stringify(stuck)}`);
}

if (!process.argv.includes('--projects-only')) {
  finishRoutineWalking('morning arrival from entrance');
  assert.equal(office.cats[0].mode, 'prepare');
}
office.syncOfficeSchedule(officeTimeAt(9), true);
assert.ok(office.cats.filter((cat) => !cat.data.operational).every((cat) => cat.root.visible && cat.mode === 'work'));
assert.equal(office.cats.find((cat) => cat.data.id === 'rani').mode, 'reception');
const tasksBeforeRoutine = JSON.stringify(office.simulation.projects);
office.syncOfficeSchedule(officeTimeAt(12));
assert.ok(office.cats.every((cat) => cat.activity === 'lounge'));
assert.equal(office.navigate(office.cats[0], 'meeting'), false, 'ishoma must not be overwritten by manual meeting');
if (!process.argv.includes('--projects-only')) {
  finishRoutineWalking('ishoma');
  assert.ok(office.cats.every((cat) => cat.mode === 'lounge'));
  office.syncOfficeSchedule(officeTimeAt(13));
  finishRoutineWalking('return after ishoma');
  assert.ok(office.cats.filter((cat) => !cat.data.operational).every((cat) => cat.mode === 'work'));
}
office.cats.forEach((cat) => { cat.energy = 90; });
office.syncOfficeSchedule(officeTimeAt(16, 30), true);
assert.ok(office.cats.filter((cat) => cat.data.id !== 'tomo').every((cat) => cat.mode === 'report'));
assert.ok(office.simulation.office.day.members.every((record) => record.report));
const requests = office.simulation.office.day.members.filter((record) => record.overtime.status === 'pending');
assert.equal(requests.length, 3);
const overtimeId = requests[0].id;
Schedule.decide(office.simulation.office, officeTimeAt(16, 40), overtimeId, 'approve', 1260);
office.syncOfficeSchedule(officeTimeAt(17));
assert.equal(office.cats.find((cat) => cat.data.id === overtimeId).activity, 'lounge');
assert.ok(office.cats.filter((cat) => cat.data.id !== overtimeId).every((cat) => cat.activity === 'exit' || !cat.root.visible));
if (!process.argv.includes('--projects-only')) {
  finishRoutineWalking('regular departure and overtime break');
  assert.ok(office.cats.filter((cat) => cat.data.id !== overtimeId).every((cat) => !cat.root.visible));
  office.syncOfficeSchedule(officeTimeAt(18));
  finishRoutineWalking('start overtime');
  assert.equal(office.cats.find((cat) => cat.data.id === overtimeId).mode, 'work');
}
assert.equal(JSON.stringify(office.simulation.projects), tasksBeforeRoutine, 'routine must never approve or create project tasks');
office.syncOfficeSchedule(officeTimeAt(21));
if (!process.argv.includes('--projects-only')) {
  finishRoutineWalking('last overtime departure');
  assert.ok(office.cats.every((cat) => !cat.root.visible));
}
const officeSnapshot = office.progressSnapshot();
assert.deepEqual(office.validateProgress(officeSnapshot).office, officeSnapshot.office);
const beforeInvalidOffice = JSON.stringify(office.progressSnapshot());
const invalidOffice = JSON.parse(beforeInvalidOffice);
invalidOffice.office.day.members[0].overtime.untilMinute = 1500;
assert.throws(() => office.restoreProgress(invalidOffice));
assert.equal(JSON.stringify(office.progressSnapshot()), beforeInvalidOffice);
console.log('PASS: WIB attendance, report, overtime permission/expiry, hidden avatars, unchanged project tasks, and validated schedule backup.');

if (process.argv.includes('--campus')) {
  office.simulation.office = null;
  office.syncOfficeSchedule(officeTimeAt(5), true);
  const cleaner = office.cats.find((cat) => cat.data.id === 'tomo');
  assert.ok(cleaner.root.visible && office.cats.filter((cat) => cat !== cleaner).every((cat) => !cat.root.visible));
  for (let index = 0; index < Campus.CLEANING.length; index += 1) {
    office.syncOfficeSchedule(officeTimeAt(5 + Math.floor(index / 6), index % 6 * 10));
    finishRoutineWalking(`cleaning ${Campus.CLEANING[index].room}`);
    assert.equal(cleaner.mode, 'clean');
    assert.ok(Math.hypot(cleaner.root.position.x - Campus.CLEANING[index].x,
      cleaner.root.position.z - Campus.CLEANING[index].z) < 1e-8);
  }
  assert.equal(office.simulation.office.day.members.find((record) => record.id === 'tomo').actions.length, 12);
  office.syncOfficeSchedule(officeTimeAt(9), true);
  const miko = office.cats[0];
  for (const activity of ['bathroom', 'wudu', 'prayer']) {
    assert.ok(office.navigate(miko, activity, true));
    finishRoutineWalking(`facility ${activity}`);
    assert.equal(miko.mode, activity);
  }
  Schedule.setPrayerParticipant(office.simulation.office, 'miko', true);
  const noon = Math.max(720, Schedule.prayerTimes('2026-11-06').dhuhr);
  office.syncOfficeSchedule(officeTimeAt(Math.floor(noon / 60), noon % 60));
  assert.equal(miko.activity, 'wudu');
  finishRoutineWalking('scheduled wudu and staff breaks');
  office.syncOfficeSchedule(officeTimeAt(Math.floor((noon + 2) / 60), (noon + 2) % 60));
  finishRoutineWalking('scheduled prayer');
  assert.equal(miko.mode, 'prayer');
  office.syncOfficeSchedule(officeTimeAt(13), true);
  assert.ok(office.facilityState.vehicles.filter((vehicle) => vehicle.root.visible).length > 0);
  for (const cat of office.cats) assert.ok(office.navigate(cat, 'exit', true));
  finishRoutineWalking('parking departures');
  assert.ok(office.cats.every((cat) => !cat.root.visible));
  office.applyOfficeRoutine(officeTimeAt(21), true);
  assert.ok(office.facilityState.vehicles.every((vehicle) => !vehicle.root.visible));
  console.log('PASS: OB reaches all cleaning rooms, bathroom/wudu/musala paths work, prayer routing and all parking departures succeed.');
}
