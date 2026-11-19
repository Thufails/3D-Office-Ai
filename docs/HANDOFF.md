# Serah-terima pengembangan Pawffice

Diperbarui: **19 November 2026**.
Baseline kode yang diperiksa: commit `8c2e100` (6 November 2026,
`feat: add some actor`). Integrasi Gemini lokal sedang dikerjakan pada
19 November 2026; working tree berisi perubahan fitur dan dokumentasi.
Commit tersebut adalah acuan pemeriksaan, bukan instruksi untuk checkout/reset.

Dokumen ini menyimpan keadaan terakhir dan keputusan proyek agar pengembangan
dapat dilanjutkan dari akun/chat baru. Baca [AGENTS.md](../AGENTS.md) untuk aturan
kerja, [README](../README.md) untuk penggunaan, dan [changelog](CHANGELOG.md)
untuk urutan perubahan. Cocokkan catatan dengan kode sebelum bertindak.

## Tujuan proyek dan batas saat ini

Pawffice adalah kantor software house 3D lokal dengan avatar kucing berpakaian
kantor. Tim mensimulasikan pengerjaan proyek website klien melalui brief,
tugas, dokumen, review, notulen, dan arsip.

Gemini sekarang diakses lewat Cloudflare Worker lokal (`worker/index.js`).
Panel samping memilih satu dari 10 avatar dan mengirim konteks proyek aktif.
Worker membaca key dari `.dev.vars`; chat memerlukan Worker aktif dan API key.
Dokumen proyek dan notulen utama tetap berupa template simulasi di Project Hub.
Contoh “Sistem booking online untuk barbershop” merupakan proyek klien lama
di dalam simulasi. Instalasi baru tidak wajib memulai dengan contoh tersebut.

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

### Agen Gemini melalui Worker lokal

- `src/js/ai/ai-panel.js` menampilkan panel samping dengan pemilih sepuluh avatar,
  konteks proyek, riwayat sementara per avatar, serta Gemini 3.8 Flash,
  Gemini 3.1 Pro Preview, dan Gemini 3.5 Flash-Lite.
- Tombol di header membuka chat dengan avatar terpilih; tombol di kartu profil
  langsung membuka chat untuk avatar tersebut. Escape dan tombol × menutup panel.
- `worker/index.js` menjadi perantara Gemini API. Browser tidak menerima API key.
- Salin `.dev.vars.example` menjadi `.dev.vars`, isi `GEMINI_API_KEY`, lalu jalankan
  `npx wrangler dev --local --port 8787`. Buka aplikasi dari Live Server pada
  localhost/127.0.0.1; Worker mengizinkan origin loopback HTTP lokal.
- `.dev.vars`, `.env`, dan `.wrangler/` diabaikan Git. Untuk Worker terbitan, masukkan key
  sebagai secret melalui Cloudflare, bukan di repository.
- Riwayat percakapan disimpan di memori tab dan hilang saat halaman ditutup.
- API key belum dibuat/dikonfigurasi dan Worker belum dijalankan, jadi respons
  Gemini belum dapat dicoba. Tampilan dan tombol tutup panel belum diverifikasi
  lewat browser pada sesi ini. CSS panel chat kini mempertahankan tinggi bubble,
  menyediakan area gulir, dan memakai panel hampir penuh layar sempit; render
  browser tetap perlu dicek. Error panel juga membedakan model padat/limit/key
  dari Worker tak terjangkau agar tidak menyuruh menyalakan Worker saat upstream Gemini gagal.

### Penyimpanan dan kompatibilitas

`src/js/main.js` menyimpan snapshot `pawffice.progress.v3`:
proyek, progres harian/quest, kantor, dan data simulasi lain.
Fallback v2/v1 dipertahankan. State proyek dan kantor masing-masing berversi 1.

Impor JSON divalidasi sebelum mengganti state. Simpanan rusak memblokir autosave
agar data mentah tidak langsung hilang. Migrasi delapan avatar menambahkan staf
operasional tanpa mengarang absen/laporan hari sebelumnya.

## Keputusan yang perlu dipertahankan

- Tidak membuat editor bangunan ala The Sims; pengguna memilih model sekarang.
- Worker lokal hanya menjadi perantara aman untuk chat Gemini; tidak menambah
  eksekusi tugas proyek otomatis. Jangan mengekspos API key ke browser.
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

Itu hasil historis, bukan pengujian ulang pada sesi 19 November.
Tes memakai DOM tiruan dan model Three.js tanpa render WebGL nyata.
Pemeriksaan visual di browser atas denah kampus terakhir belum terkonfirmasi.

Pada 19 November 2026, percobaan lama berupa modal Gemini pernah tertutup oleh
label/render kantor dan tombol silang tidak berfungsi. Integrasi itu diganti
dengan panel samping DOM biasa, kontrol tutup ×/Escape, dan perantara Worker.
Pembaruan ini belum diperiksa secara visual di browser.

## Pekerjaan terbuka / ide berikutnya

1. Buat key di Google AI Studio, isi `.dev.vars`, jalankan Wrangler, lalu coba
   respons model dan tutup panel di browser. Jangan kirim key lewat chat.
2. Periksa panel pada viewport kecil dan pastikan kantor 3D tetap terlihat.
3. Jika dibutuhkan, pertimbangkan streaming jawaban Gemini pada iterasi lain.
4. Konversi metode pada proyek berjalan dan alur formal perubahan scope
   Waterfall belum tersedia. Agen eksekusi pembuatan website masih rencana masa depan.

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
