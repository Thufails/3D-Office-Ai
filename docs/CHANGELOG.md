# 🐾 Catatan pengembangan Pawffice

## 6 November 2026 · Pilihan metode dan backlog Agile

- Brief proyek baru memiliki pilihan Waterfall atau Agile. Hybrid belum tersedia.
- Modul metode dipisah ke `src/js/projects/methods/waterfall.js` dan `agile.js`.
- Waterfall memakai delapan tugas untuk seluruh proyek dengan prasyarat review.
- Agile membuat usulan backlog dari kebutuhan brief. Saran Nori/Miko berbasis
  template lokal dan harus direview pengguna, tanpa panggilan AI.
- Backlog mendukung tambah, edit, label prioritas, naik/turun urutan, persetujuan
  kebutuhan, dan hapus dengan modal konfirmasi.
- Satu iterasi aktif berisi 1–5 fitur yang sudah disetujui. Masing-masing fitur
  memiliki delapan tugas dokumen untuk tim; dependensi berlaku per fitur.
- Fitur dalam iterasi dikunci; kebutuhan baru tetap dapat ditambahkan ke backlog.
- Iterasi ditutup setelah semua hasilnya disetujui. Papan tugas bisa menampilkan
  iterasi lama maupun aktif.
- Progres Agile menghitung fitur diterima dibanding seluruh fitur backlog.
  Perubahan cakupan dapat mengubah persentase tanpa menghapus hasil yang ada.
- Metode, backlog, iterasi, dan dokumen masuk penyimpanan, arsip, JSON dan Markdown.
- Simpanan tanpa metode dibaca sebagai Alur lama, tanpa mengulang hadiah atau
  mengubah status tugas. Kunci localStorage tetap `pawffice.progress.v3`.
- README memuat panduan mencoba Agile, batas fitur, struktur modul, dan tes.
- Konversi metode setelah proyek dibuat, Hybrid, dan alur formal perubahan scope
  Waterfall belum termasuk tahap ini.

## 4 November 2026 · Project Hub lokal

### 🗂️ Penataan struktur folder

- Kode aplikasi dikelompokkan ke `src/css/` dan `src/js/`; kode Project Hub
  berada di `src/js/projects/`.
- Three.js dan lisensinya dipindahkan ke `vendor/three/`.
- Banner lokal berada di `assets/images/`.
- Changelog, ringkasan Word, dan catatan rencana berada di `docs/`.
- Skrip bantu Word berada di `tools/docs/`; hasil QA lokal diabaikan oleh Git.
- Path pada HTML, README, pesan pemuatan, dan tes mengikuti lokasi baru.
- Alamat halaman `3D-index.html` dan kunci penyimpanan progres tidak berubah.
- README memuat pohon folder dan penjelasan tanggung jawab setiap kelompok.
- Logika metode Waterfall, Agile, dan Hybrid belum diimplementasikan.

### 🪟 Revisi modal konfirmasi

- Popup konfirmasi bawaan browser diganti modal custom Pawffice.
- Berlaku untuk arsip proyek, impor pengganti progres, dan meninggalkan draf.
- Pesan, ikon, dan tombol menyesuaikan tindakan; tema mengikuti siang/malam.
- Fokus awal ke tombol batal. Escape, ×, dan klik backdrop membatalkan.
- Refresh panel ditahan selama konfirmasi agar referensi tindakan tetap stabil.
- Pengujian mencakup pembatalan, fokus, perlindungan draf, dan klik ganda.

### 🌱 Ditambahkan

- Brief klien dengan judul, nama klien, jenis website, tujuan, 1–20 kebutuhan,
  dan target tanggal opsional.
- Project Hub di sidebar kiri dan panel proyek, serta shortcut **P**.
- Papan tugas empat status: Belum mulai, Dikerjakan, Review, Selesai.
- Delapan tugas: scope PM, analisis, rancangan UI/UX, rencana FE, rencana BE,
  skenario QA, paket serah-terima PA, dan review akhir Owner.
- Prasyarat tugas. Backend bisa mulai setelah analisis; QA menunggu FE dan BE.
- Draf dokumen berbasis template brief, editor teks, checklist review,
  permintaan revisi, dan persetujuan manual.
- Notulen template Sasa setelah seluruh tim tiba di ruang meeting.
  Tindak lanjut mengacu ke tugas yang belum selesai, bukan tugas duplikat.
- Arsip proyek selesai maupun parsial; proyek arsip bisa dilanjutkan.
- Unduhan Markdown berisi hasil kerja dan notulen proyek.
- Cadangan JSON, validasi penuh, preview, dan konfirmasi sebelum impor.
- Tes aturan proyek, handler UI, migrasi, dan integrasi model kantor.

### 📋 Diubah

- Progres proyek dihitung dari jumlah tugas disetujui, **bukan timer 30 detik**.
- Proyek baru tidak harus barbershop. Contoh lama hanya ikut migrasi progres.
- Tugas Owner dan PA ikut menjadi bagian penyelesaian proyek.
- Aktivitas pada kartu avatar mengikuti status tugas ketika mereka bekerja.
- Persetujuan satu tugas memberi +25 happiness sekali; tidak ada hadiah ulang
  saat reload, migrasi, atau melanjutkan arsip.
- Penyimpanan berpindah ke `pawffice.progress.v3`, dengan migrasi dari v1/v2.
  Kunci penyimpanan lama tidak dihapus.
- README menjelaskan alur baru, batas simulasi, migrasi, backup, dan cara tes.

### 🛠️ Diperbaiki

- Quest harian Majukan proyek yang tidak bisa dikerjakan setelah proyek selesai
  atau saat belum ada proyek aktif diganti tanpa mengacak dua quest lainnya.
- Data simpanan yang tidak valid tidak otomatis ditimpa progres kosong.
- File impor yang salah ditolak sebelum state kantor berubah.
- Draf yang sedang diedit tidak dihapus oleh refresh panel otomatis.
- Perubahan dokumen mengulang checklist; hasil final dikunci agar dependensi
  tugas lain tidak menggunakan dokumen yang berubah diam-diam.
- Notulen hanya dicatat satu kali per kedatangan lengkap tim, bukan setiap frame.

### 🧶 Batas yang tetap berlaku

- Tidak ada backend, API AI, biaya model, atau layanan eksternal baru.
- Dokumen adalah template simulasi; belum membuat website, desain gambar,
  database, API, maupun menjalankan QA terhadap aplikasi nyata.
- Review dilakukan oleh pengguna; memilih avatar bukan autentikasi reviewer.
- Satu proyek aktif; maksimal 100 arsip dan 100 notulen per proyek.
- Impor JSON mengganti seluruh progres lokal, bukan menggabungkannya.
  Unduh backup kondisi sekarang sebelum mengimpor.
- Posisi avatar, kamera, dan waktu animasi bukan bagian cadangan proyek.
- Pengujian DOM/model tidak menggantikan pemeriksaan visual browser.

## 20 Oktober 2026 · Fondasi kantor

- Delapan avatar, empat ruangan, meja meeting panjang, dan pantry.
- Penataan meja/kursi, navigasi karakter, font UI, dan menu lokasi kantor.
- Jam WIB, siang/malam, progres tersimpan, dan rotasi quest harian.
- Label role mengikuti avatar dan kamera tanpa reflow anti-tumpuk.
- Banner README lokal bertema kucing kantor.
