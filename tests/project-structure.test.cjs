const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('alamat halaman utama tetap; stylesheet dan skrip lokal terhubung berurutan', () => {
  const html = read('3D-index.html');
  const scripts = [...html.matchAll(/<script\s+defer\s+src="([^"]+)"/g)]
    .map((match) => match[1]);
  assert.deepEqual(scripts, [
    'vendor/three/Three.js',
    'src/js/projects/methods/waterfall.js',
    'src/js/projects/methods/iterative.js',
    'src/js/projects/methods/agile.js',
    'src/js/projects/methods/hybrid.js',
    'src/js/projects/project-engine.js',
    'src/js/projects/project-ui.js',
    'src/js/office/office-schedule.js',
    'src/js/office/office-ui.js',
    'src/js/main.js',
  ]);
  const stylesheet = html.match(/<link\s+rel="stylesheet"\s+href="([^"]+)"/)[1];
  assert.equal(stylesheet, 'src/css/style.css');
  for (const name of [...scripts, stylesheet]) {
    assert.ok(fs.existsSync(path.join(root, name)), `Referensi hilang: ${name}`);
  }
  assert.match(read('index.html'), /url=3D-index\.html/);
});

test('gambar dan tautan dokumentasi lokal mengarah ke file yang tersedia', () => {
  const readme = read('README.md');
  const image = readme.match(/src="([^"]+)"/)[1];
  assert.equal(image, 'assets/images/readme-banner.svg');
  assert.ok(fs.existsSync(path.join(root, image)));
  for (const match of readme.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^https?:\/\//.test(target) || target.startsWith('#')) continue;
    assert.ok(fs.existsSync(path.join(root, target)), `Tautan lokal rusak: ${target}`);
  }
  for (const name of [
    'docs/notes/Catatan Pengembangan AI.txt',
    'tools/docs/build-summary.py',
    'vendor/three/THREE-LICENSE.txt',
  ]) {
    assert.ok(fs.existsSync(path.join(root, name)), `File kelompok hilang: ${name}`);
  }
});

test('kode lama tidak diduplikasi di root dan penyimpanan tetap memakai kunci v3', () => {
  for (const name of ['main.js', 'style.css', 'project-engine.js', 'project-ui.js', 'Three.js']) {
    assert.equal(fs.existsSync(path.join(root, name)), false, `Duplikat di root: ${name}`);
  }
  assert.match(read('src/js/main.js'), /const PROGRESS_KEY = "pawffice\.progress\.v3"/);
  assert.match(read('README.md'), /Susunan folder proyek/);
});
