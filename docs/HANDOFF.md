# Serah-terima pengembangan Pawffice

Diperbarui: **11 November 2026**.
Snapshot kode saat pemeriksaan: commit `8c2e100` (6 November 2026,
`feat: add some actor`); working tree bersih sebelum penambahan panduan ini.
Commit tersebut adalah acuan pemeriksaan, bukan instruksi untuk checkout/reset.

Dokumen ini menyimpan keadaan terakhir dan keputusan proyek agar pengembangan
dapat dilanjutkan dari akun/chat baru. Baca [AGENTS.md](../AGENTS.md) untuk aturan
kerja, [README](../README.md) untuk penggunaan, dan [changelog](CHANGELOG.md)
untuk urutan perubahan. Cocokkan catatan dengan kode sebelum bertindak.

## Tujuan proyek dan batas saat ini

Pawffice adalah kantor software house 3D lokal dengan avatar kucing berpakaian
kantor. Tim mensimulasikan pengerjaan proyek website klien melalui brief,
tugas, dokumen, review, notulen, dan arsip.

Saat ini belum ada model AI/API, backend, atau eksekusi pembuatan website nyata.
Draf dokumen/notulen berasal dari template lokal. Contoh “Sistem booking online
untuk barbershop” merupakan proyek klien lama di dalam simulasi. Instalasi baru
tidak wajib memulai dengan contoh tersebut.

## Yang sudah diterapkan

### Tim dan tata kantor

| Avatar | Role | Kelompok |
| --- | --- | --- |
| Miko | Project Manager | Proyek |
| Nori | System Analyst | Proyek |
| Luna | UI/UX Designer | Proyek |
| Kiko | Frontend Developer | Proyek |
| Bimo | Backend Developer | Proyek |
| Piko | QA / Tester | Proyek |
| Oji | Owner / Founder | Proyek |
| Sasa | Personal Assistant / Secretary | Proyek |
| Rani | Resepsionis | Operasional |
| Tomo | Office Boy | Operasional |

Tim proyek mempunyai delapan tugas/role; Rani dan Tomo tidak menambah tahap
pengerjaan proyek. Jobdesk lengkap tersedia di README dan antarmuka kantor.

- Model tetap isometrik satu lantai, dengan orbit/zoom dan pilihan lokasi.
- Bangunan kompak sekitar 38,4 × 46,4 unit di halaman sekitar 73 × 66 unit.
  Parkir di sisi kanan, dengan dua mobil, enam motor, dan dua pejalan kaki.
- Enam meja tim utama ditata dua baris: PM/analisis/UI-UX serta FE/BE/QA.
  Owner dan PA memiliki ruang tersendiri. Ada ruang kerja, ruang meeting
  dengan meja panjang, ruang owner, dan pantry/istirahat.
- Lobby khusus yang besar menempati bagian depan: penerimaan, empat sofa,
  dan dua meja tunggu. Tidak dibagi dengan ruangan servis.
- Blok belakang berisi ruang staf, kamar mandi, musala, dan wudu.
  Musala diapit kamar mandi serta wudu; masing-masing diakses dari koridor.
- Kendaraan terlihat mengikuti kehadiran pemiliknya. Kedatangan/kepulangan
  melalui target parkir dan lobby; belum ada animasi mengemudi atau NPC tamu.
- Posisi avatar/kursi dan label role memakai koordinat dunia. Label diproyeksikan
  setiap frame dan disembunyikan ketika avatar tidak terlihat.
- Navigasi memakai A*, obstacle furnitur, jarak antar-avatar, indeks area
  obstacle, dan cache peta untuk menghindari perlambatan pada halaman besar.

### Project Hub dan metode

Brief diisi pengguna: nama proyek/klien, jenis website, tujuan, kebutuhan,
metode, dan target tanggal opsional. Satu proyek aktif; proyek dapat diarsipkan
dan dilanjutkan. Tersedia ekspor Markdown serta cadangan/pemulihan JSON.

| Metode | Aturan utama |
| --- | --- |
| Waterfall | Delapan tugas untuk seluruh proyek; tahapan menunggu hasil prasyarat yang disetujui. FE/BE dapat berjalan paralel setelah prasyaratnya terpenuhi. |
| Agile | Kebutuhan brief menjadi usulan backlog berbasis template. Pengguna mengedit, memprioritaskan, dan menyetujui fitur, lalu memilih 1–5 fitur per iterasi. |
| Hybrid | Scope PM dan analisis awal disahkan dahulu, lalu fitur dikerjakan dalam iterasi. Tambahan scope memerlukan alasan dan pengesahan terpisah. |

Metode berada di file JS terpisah dalam `src/js/projects/methods/`;
`iterative.js` menyediakan operasi backlog/iterasi bersama.
Satu iterasi aktif pada satu waktu; tiap fitur iterasi mempunyai delapan tugas.

- Tugas berjalan `todo → doing → review → done`.
  Dokumen dan seluruh pemeriksaan review diperlukan sebelum disetujui.
  Mengubah draf mereset cek review; dokumen disetujui dikunci.
- Progres Waterfall berasal dari tugas disetujui. Agile menghitung fitur
  diterima dibanding seluruh backlog. Hybrid menambahkan dua milestone
  baseline pada perhitungan fitur. Tambahan scope bisa menurunkan persentase
  tanpa menghapus pekerjaan yang telah selesai.
- Proyek simpanan lama memakai “Alur lama”; metode tidak dikonversi diam-diam.
  Contoh lama yang sudah 100% tetap selesai tanpa memberi hadiah ulang.
- Rapat menghasilkan notulen template setelah delapan anggota proyek tiba
  di kursinya. Ini belum transkrip rapat AI.
- Konfirmasi arsip/impor/perubahan scope memakai dialog custom aplikasi.

### Rutinitas dan waktu WIB

| Waktu | Perilaku |
| --- | --- |
| 07.00–09.00 | Datang bertahap, absen, persiapan |
| 09.00–12.00 | Kerja pagi |
| 12.00–13.00 | Ishoma |
| 13.00–16.30 | Kerja siang |
| 16.30–17.00 | Laporan dan persiapan pulang |
| 17.00–18.00 | Pulang / jeda sebelum lembur |
| 18.00–21.00 | Hanya avatar dengan izin lembur, maksimal 21.00 |

- Rani bertugas 07.00–17.00. Tomo membersihkan dua belas titik pada
  05.00–07.00, lalu siaga sampai 14.00.
- Lembur diajukan 16.30–16.50 jika ada tugas tertunda dan energi minimal 60.
  Maksimal tiga pemohon berbeda/hari; pengguna memilih batas 19/20/21.
  Tanpa keputusan sampai 17.00, pengajuan kedaluwarsa dan avatar pulang.
  Energi rendah memunculkan kabar, lalu mengakhiri lembur pada batas minimum.
- Lonceng, badge, toast, balon avatar, dan kabar di Project Hub menandai
  notifikasi. Keputusan lembur belum terjawab tetap terlihat sebagai pending.
- Ada jeda kamar mandi. Partisipasi ibadah dipilih per avatar dan default-nya
  kosong. Avatar berwudu lalu salat Zuhur/Asar bergiliran.
- Waktu salat dihitung lokal berdasarkan tanggal/koordinat Jakarta
  (NOAA dan Asar faktor 1), berlabel estimasi simulasi, bukan jadwal resmi.
- Jam nyata tidak dipercepat oleh kontrol animasi. Absen/laporan hanya dari
  aktivitas yang teramati ketika halaman terbuka, tanpa pekerjaan offline.
  Retensi mencakup hari ini dan tujuh hari kunjungan sebelumnya.
- Rutinitas visual tidak menyetujui tugas. Project Hub tetap bisa dibuka
  di luar jam kerja.

### Penyimpanan dan kompatibilitas

`src/js/main.js` menyimpan snapshot `pawffice.progress.v3`:
proyek, progres harian/quest, kantor, dan data simulasi lain.
Fallback v2/v1 dipertahankan. State proyek dan kantor masing-masing berversi 1.

Impor JSON divalidasi sebelum mengganti state. Simpanan rusak memblokir autosave
agar data mentah tidak langsung hilang. Migrasi delapan avatar menambahkan staf
operasional tanpa mengarang absen/laporan hari sebelumnya.

## Keputusan yang perlu dipertahankan

- Tidak membuat editor bangunan ala The Sims; pengguna memilih model sekarang.
- Tidak menambahkan backend, framework, atau API AI hanya untuk merapikan kode.
- Label role tidak boleh berpindah ke avatar lain saat kamera diputar/zoom.
- Lobby luas khusus penerimaan; kamar mandi/wudu dekat musala di blok belakang.
- README ringkas, materi teknis panjang disimpan dalam details tertutup.
- `3D-index.html` dan kunci simpanan dipertahankan agar akses/progres lama aman.
- Dokumen Word di folder docs adalah ringkasan lama, mendahului fitur metode
  dan kampus terbaru; jangan menggunakannya sebagai spesifikasi terkini.

## Verifikasi dan batas bukti

Catatan sesi pengembangan 6 November 2026 menyebut **44 tes unit/DOM/struktur**
lulus serta `node tests/office-integration.cjs --campus` lulus.
Cakupannya mencakup metode, simpanan, label/geometri, rute rapat/istirahat,
dua belas titik OB, fasilitas/ibadah, dan kepulangan seluruh avatar.

Itu hasil historis, bukan pengujian ulang pada 11 November.
Tes memakai DOM tiruan dan model Three.js tanpa render WebGL nyata.
Pemeriksaan visual di browser atas denah kampus terakhir belum terkonfirmasi.

Sesi 11 November hanya menambahkan panduan transisi dan tautan dokumentasi.
Pemeriksaan sesi ini:

- `node --test tests/project-structure.test.cjs`: **4/4 lulus**.
- Tautan lokal AGENTS/HANDOFF dan encoding UTF-8 diperiksa: valid.
- `git diff --check`: tidak ada kesalahan whitespace pada perubahan terlacak.
- Suite aplikasi penuh dan render browser tidak dijalankan ulang untuk
  perubahan dokumentasi ini.

## Pekerjaan terbuka / ide berikutnya

1. Periksa render nyata: framing kampus, label saat orbit/zoom, posisi kursi,
   pencahayaan, keterbacaan UI, dan perpindahan sepuluh avatar.
2. Jika muncul rute tersangkut, periksa pintu/obstacle/target bersama.
   Jika furnitur kelak dapat dipindahkan, tambahkan invalidasi cache navigasi.
3. Konversi metode pada proyek berjalan dan alur formal perubahan scope
   Waterfall belum tersedia.
4. Integrasi agen AI, hasil website nyata, serta NPC tamu/animasi kendaraan
   masih kemungkinan pengembangan, bukan fitur yang sudah selesai.

Belum ada permintaan untuk mengeksekusi semua ide di atas.
Tugas sesi ini adalah menyiapkan konteks transisi akun.

## Melanjutkan dari akun/chat baru

1. Buka folder repository yang benar. File panduan ikut tersimpan di folder;
   riwayat chat lama tidak perlu disalin seluruhnya.
2. Minta agen membaca AGENTS dan HANDOFF, lalu mencocokkan dengan kode serta Git.
3. Untuk progres simulasi, gunakan browser/profil/origin yang sama.
   Jika berpindah, ekspor JSON melalui Project Hub → Cadangan di lingkungan
   asal, lalu impor di lingkungan baru. Jangan berasumsi source code membawa
   isi localStorage atau login akun membawa progres permainan.
4. Setelah perubahan bermakna, perbarui dokumen ini dan hasil tes yang nyata.
   Jika ingin catatan ikut klona Git, sertakan file panduan dalam commit.

Contoh pesan awal:

> Baca AGENTS.md dan docs/HANDOFF.md pada proyek ini. Periksa kondisi kode
> dan Git, lalu jelaskan posisi terakhir pengembangannya. Kerjakan hanya
> permintaan yang aku berikan berikutnya; ide di handoff belum otomatis
> menjadi instruksi implementasi.

Mekanisme instruksi proyek:
[panduan resmi AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
