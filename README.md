# Pawffice

Simulasi kantor 3D lokal untuk sebuah software house kecil yang menerima
proyek pembuatan sistem berbasis website. Semua aktivitas, karakter, dan
progres quest berjalan di browser tanpa backend atau koneksi AI.

## Cara membuka

Klik dua kali `3D-index.html`, lalu buka dengan Chrome atau Edge.
Semua library sudah disimpan lokal. Tidak perlu instalasi, Node.js,
backend, akun AI, atau koneksi internet untuk menjalankan simulasi.

## Tim software house

| Anggota | Role | Tanggung jawab di simulasi |
| --- | --- | --- |
| Miko | Project Manager | Menentukan lingkup dan mengatur progres proyek. |
| Nori | System Analyst | Mencatat kebutuhan klien dan alur sistem. |
| Luna | UI/UX Designer | Merancang alur penggunaan dan tampilan. |
| Kiko | Frontend Developer | Membangun halaman dan interaksi website. |
| Bimo | Backend Developer | Menyiapkan logika, jadwal, dan reservasi. |
| Piko | QA / Tester | Menguji alur booking dan menyiapkan serah-terima. |

Semua anggota divisualisasikan sebagai avatar kucing berseragam. Untuk
memilih karakter, klik kartu tim atau tekan angka 1–6.

## Kontrol

- Seret area 3D untuk memutar kamera.
- Gulir mouse atau cubit layar sentuh untuk zoom.
- Klik karakter atau kartu tim untuk memilihnya.
- Lihat lebih dekat: kamera mengikuti karakter terpilih.
- Overview atau tombol R/Escape: kembali ke kamera awal.
- Coffee break: ajak karakter terpilih ke area kopi.
- Team huddle: ajak seluruh tim berdiskusi mengelilingi meja bundar.
- Tombol bulan/matahari: ganti suasana siang dan malam secara manual.
  Pilihan manual berlaku sampai halaman dimuat ulang.
- Tombol jeda atau Spasi: hentikan/lanjutkan aktivitas karakter.
  Jam Jakarta tetap berjalan.
- Tombol 1×: ganti kecepatan aktivitas 1×, 2×, dan 4×.
  Kecepatan ini tidak mengubah jam Jakarta.
- Tombol angka 1–6: pilih anggota tim sesuai urutan kartu.

## Gerakan dan rapat

Karakter menghitung jalur yang menghindari furnitur, kursi milik karakter
lain, dan posisi karakter lain. Jika jalurnya terhalang saat berjalan,
karakter mencari rute baru. Saat benar-benar perlu menunggu, animasi kaki
ikut berhenti.

Pada Team huddle, setiap karakter menuju bangku rapatnya sendiri,
duduk menghadap meja, lalu menunggu temannya sebelum waktu diskusi dihitung.

Panel kiri bisa digulir ketika tinggi jendela tidak cukup. Cerita hari ini
tetap berada di dalam panel dan tidak menimpa toolbar bawah. Pada layar
tablet/ponsel, cerita juga ditampilkan dan dapat dibaca lewat gulir halaman.

## Quest dan proyek utama

Quest utama Pawffice adalah menyelesaikan **sistem booking online untuk
barbershop fiktif**. Progres ditampilkan sebagai persentase dan mengikuti
enam tahap kerja: Miko menentukan lingkup, Nori merangkum kebutuhan, Luna
merancang alur dan tampilan, Kiko membangun halaman, Bimo menyiapkan jadwal
serta reservasi, lalu Piko menguji hasilnya. Tahap role yang bersangkutan
maju saat ia bekerja selama 30 detik waktu simulasi. Satu tahap memberi
25 office happiness.

Tiga quest sampingan dipilih dari rotasi harian. Pilihan dan progresnya
tetap sama setelah refresh pada hari yang sama, lalu berganti saat tanggal
WIB berubah. Quest dapat meminta tim fokus, istirahat, rapat, berkolaborasi,
atau memilih rekan. Setiap quest sampingan yang selesai memberi 10 office
happiness. Progres proyek utama dan happiness berlanjut lintas hari.

Status proyek, tahap yang sedang dikerjakan, anggota tim yang dikenal,
quest harian, serta happiness disimpan otomatis di localStorage browser.
Membuka ulang halaman pada browser, profil, dan alamat yang sama memulihkan
progres. Data versi lama dimigrasikan saat tersedia. Aktivitas tidak berjalan
selama tab ditutup.

Penyimpanan berlaku di browser/profil dan alamat halaman yang sama.
Menghapus data situs, memakai mode privat, atau memindahkan file lokal
dapat menghasilkan penyimpanan yang berbeda. Perilaku localStorage untuk
file HTML yang dibuka langsung bergantung pada browser. Jika penyimpanan
ditolak, panel misi menampilkan status bahwa progres masih sementara.

## Jam Jakarta live

Jam digital, tanggal, cap waktu aktivitas, dan jarum jam dinding mengikuti
zona waktu Asia/Jakarta (WIB, UTC+7). Jam menggunakan waktu komputer dan
tidak memerlukan koneksi internet. Pastikan jam komputer sudah benar.

Pause dan tombol kecepatan hanya memengaruhi aktivitas karakter.
Saat membuka halaman, suasana otomatis mengikuti WIB: malam pukul
18.00–05.59, dan siang pukul 06.00–17.59. Tombol bulan/matahari tetap
bisa digunakan untuk mencoba suasana lain.

## Struktur file

- `3D-index.html`: struktur halaman dan tombol.
- `style.css`: warna, panel, dan tampilan responsif.
- `main.js`: data enam role, dunia 3D, animasi, navigasi, serta quest utama
  dan sampingan.
- `Three.js`: library Three.js r160 versi tidak dipadatkan.
- `THREE-LICENSE.txt`: lisensi MIT library Three.js.
- `index.html`: pintasan menuju halaman utama.

Data karakter dan quest berada di bagian atas `main.js`. Model kucing,
meja, serta furnitur dibuat dari kode; tidak membutuhkan file model
eksternal. Progres quest saat ini mengikuti aturan simulasi JavaScript.
Role belum menjalankan model AI atau mengirim permintaan API.

Library: https://threejs.org/ — https://github.com/mrdoob/three.js
