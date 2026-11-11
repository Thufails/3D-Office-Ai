# Panduan agen — Pawffice

Berlaku untuk seluruh repository. Baca panduan ini saat melanjutkan proyek,
termasuk ketika akun atau riwayat chat berganti. Instruksi pengguna terbaru
dan instruksi sistem tetap didahulukan.

## Mulai bekerja

1. Baca [konteks terakhir](docs/HANDOFF.md).
2. Baca bagian README yang terkait dan [changelog](docs/CHANGELOG.md).
3. Periksa direktori aktif, status Git, dan kode yang relevan sebelum mengubahnya.
   Catatan serah-terima dapat tertinggal; cocokkan dengan implementasi.
4. Lanjutkan permintaan pengguna saat ini. Daftar ide di dokumen bukan izin
   untuk mengimplementasikan semua fitur sekaligus.

Lokasi lokal saat panduan dibuat: `D:\Koding\3D-Office-Ai`.
`D:\Koding\Office Ai 3D` adalah lokasi lama; jangan mengubahnya.
Jika proyek dipindahkan, gunakan root repository yang benar, bukan path lama.

## Cara bekerja dengan pemilik proyek

- Gunakan bahasa Indonesia yang jelas dan santai.
- Jika pengguna meminta “diskusi dulu”, diskusikan tanpa mengedit file.
  Jika sudah meminta eksekusi, kerjakan perubahan yang diizinkan langsung
  di folder proyek dan jelaskan hasilnya.
- Tulis kode ke bawah dengan indentasi dan baris yang mudah dibaca.
  Hindari kode minified, fungsi satu baris yang panjang, dan penataan melebar.
  Ikuti gaya file yang sedang diedit.
- Pertahankan perubahan lokal pengguna. Jangan mereset, menimpa, atau
  menghapus pekerjaan lain demi merapikan proyek.
- Jangan commit, push, atau deploy kecuali diminta.
- Simpan keputusan teknis dan status pekerjaan; jangan menyalin seluruh
  percakapan, kredensial, token, atau informasi akun ke repository.

## Identitas dan batas produk

Pawffice adalah simulasi kantor software house 3D dengan avatar kucing.
Aplikasi memakai HTML, CSS, JavaScript biasa, dan Three.js lokal.
Buka `3D-index.html` langsung atau gunakan Live Server. Node diperlukan
untuk tes pengembangan, bukan untuk menjalankan aplikasi di browser.

- Pertahankan model kantor isometrik yang dapat diputar dan di-zoom.
  Pengguna membatalkan ide editor bangunan ala The Sims.
- Belum ada backend atau integrasi model AI. Dokumen proyek dan notulen
  adalah template simulasi, bukan hasil agen AI atau website yang sudah dibuat.
- Contoh barbershop adalah proyek klien di dalam simulasi, bukan identitas
  aplikasi. Jangan menjadikan Pawffice aplikasi khusus barbershop.
- README harus ringkas di depan; panduan panjang dan jobdesk berada dalam
  `<details>` yang tertutup secara default.

## Peta kode

| File / folder | Tanggung jawab |
| --- | --- |
| `3D-index.html`, `index.html` | Halaman utama dan pengarah; pertahankan alamat masuk |
| `src/css/style.css` | Tema, ukuran teks, layout, dialog |
| `src/js/main.js` | Data avatar, model 3D, kursi, navigasi, kamera, quest, simpanan, integrasi modul |
| `src/js/projects/project-engine.js` | Aturan/data proyek, validasi, dokumen, arsip, ekspor |
| `src/js/projects/project-ui.js` | Project Hub, formulir, backlog, review, dialog |
| `src/js/projects/methods/` | Waterfall, Agile, Hybrid; operasi bersama di iterative.js |
| `src/js/office/office-campus.js` | Fasilitas, posisi/target, parkir, kendaraan, rute bersih-bersih |
| `src/js/office/office-schedule.js` | Aturan WIB, absen, laporan, lembur, ibadah, migrasi |
| `src/js/office/office-ui.js` | Lonceng, notifikasi, pusat kantor |
| `src/js/office/prayer-times.js` | Estimasi lokal Zuhur/Asar Jakarta |
| `vendor/three/` | Library dan lisensi; jangan edit untuk perubahan fitur biasa |
| `tests/` | Tes Node, DOM tiruan, dan integrasi tanpa render browser |

Skrip menggunakan IIFE/global browser; beberapa modul juga mengekspor CommonJS
untuk tes. Pertahankan urutan `defer` di HTML: Three.js → waterfall →
iterative → agile → hybrid → engine → project UI → prayer times → campus →
schedule → office UI → main. Jangan menambahkan build system tanpa kebutuhan.

## Invarian yang perlu dijaga

- Ada delapan role proyek dan dua staf operasional. `PROJECT_TEAM` mengecualikan
  staf operasional. Jangan mengubah delapan tugas proyek atau kursi rapat tim
  menjadi sepuluh hanya karena jumlah seluruh avatar bertambah.
- Avatar duduk harus berbagi koordinat dunia dan arah yang tepat dengan kursinya.
  Periksa posisi kursi, meja, dan monitor bersama ketika menata ruangan.
- Label role mengikuti anchor dunia avatar setiap frame. Jangan menggesernya
  dengan algoritma anti-tumpang-tindih yang membuat label menunjuk avatar lain.
- Perubahan denah harus menyelaraskan geometri, obstacle, pintu, target aktivitas,
  jalur berjalan, dan kamera. Avatar di luar kantor tidak boleh menghalangi
  rute atau dapat diklik sebagai penghuni yang terlihat.
- Navigasi memakai A*, pemeriksaan tabrakan, indeks obstacle, dan cache peta.
  Cache saat ini mengasumsikan furnitur statis; perubahan posisi obstacle
  harus menginvalidasi indeks/peta, bukan hanya menghitung jumlah obstacle.
- Jam kantor memakai `Asia/Jakarta`, terpisah dari pause/kecepatan animasi.
  Jangan menciptakan absen, pekerjaan, atau laporan offline yang tidak teramati.
- Rutinitas dan timer tidak boleh menyetujui tugas proyek secara otomatis.
  Lembur memerlukan keputusan pengguna; ibadah merupakan pilihan per avatar.
- Gunakan dialog konfirmasi Pawffice, bukan `window.confirm`, `alert`, atau
  `prompt`. Render input klien sebagai teks, misalnya dengan `textContent`.

## Penyimpanan dan kompatibilitas

Kunci utama adalah `pawffice.progress.v3`, dengan fallback v2/v1.
Jangan mengganti kunci atau menghapus localStorage untuk memperbaiki bug.
Pertahankan progres, arsip, dokumen, quest, dan migrasi simpanan lama.
Validasi seluruh impor sebelum mengganti state; simpanan rusak tidak boleh
langsung ditimpa autosave.

Progres browser bergantung pada profil dan origin. `file://`, `localhost`,
`127.0.0.1`, serta port berbeda tidak boleh diasumsikan berbagi simpanan.
Gunakan ekspor/impor JSON Project Hub untuk perpindahan lingkungan.
File panduan ini menyimpan konteks pengembangan, bukan isi localStorage.

## Pengujian

Jalankan dari root proyek, pilih yang sesuai perubahan:

- Dokumentasi/path: `node --test tests/project-structure.test.cjs`.
- Engine/metode/UI proyek:
  `node --test tests/project-engine.test.cjs tests/project-agile.test.cjs tests/project-hybrid.test.cjs tests/project-ui.test.cjs tests/project-structure.test.cjs`.
- Jadwal/fasilitas/UI kantor:
  `node --test tests/office-campus.test.cjs tests/office-schedule.test.cjs tests/office-ui.test.cjs`.
- Integrasi UI/label/geometri tanpa simulasi berjalan penuh:
  `node tests/office-integration.cjs --ui-only`.
- Regresi penuh gerak, penyimpanan, jadwal, dan kampus:
  `node tests/office-integration.cjs --campus`.

Tes menggunakan Node bawaan; tidak ada `npm test` atau instalasi paket aplikasi.
Perubahan visual tetap membutuhkan pengecekan di browser bila tersedia.
Tes DOM/geometri tidak membuktikan hasil render WebGL sudah benar.
Laporkan tes yang benar-benar dijalankan dan keterbatasannya; jangan menyebut
hasil historis sebagai pengujian ulang pada sesi baru.

## Menutup pekerjaan

- Jelaskan file yang berubah, perilaku baru, dan hasil pemeriksaan.
- Perbarui `docs/HANDOFF.md` setelah perubahan bermakna: tanggal, kondisi terbaru,
  keputusan, pekerjaan belum selesai, dan bukti pengujian.
- Tambahkan changelog untuk perubahan yang perlu dilacak; selaraskan README
  jika penggunaan, struktur, atau fitur berubah.
- Pisahkan “sudah diterapkan”, “belum diverifikasi”, dan “ide berikutnya”.
  Konteks harus bisa dipakai agen baru tanpa membaca riwayat chat.
