# Pawffice

Kantor 3D lokal dengan dua karakter kucing berseragam kantor.

## Cara membuka

Klik dua kali `3D-index.html`, lalu buka dengan Chrome atau Edge.
Semua library sudah disimpan lokal. Tidak perlu instalasi, Node.js,
backend, akun AI, atau koneksi internet untuk menjalankan simulasi.

## Penghuni

- Miko: kucing oren, kemeja krem, dasi hijau, dan kacamata.
  Perannya Project Coordinator.
- Luna: kucing abu-abu, cardigan hijau, dan kartu pegawai.
  Perannya Visual Designer.

## Kontrol

- Seret area 3D untuk memutar kamera.
- Gulir mouse atau cubit layar sentuh untuk zoom.
- Klik karakter atau kartu tim untuk memilihnya.
- Lihat lebih dekat: kamera mengikuti karakter terpilih.
- Overview atau tombol R/Escape: kembali ke kamera awal.
- Coffee break: ajak kedua karakter ke area kopi.
- Team huddle: ajak keduanya berdiskusi di meja bundar.
- Tombol bulan/matahari: ganti suasana siang dan malam secara manual.
  Pilihan manual berlaku sampai halaman dimuat ulang.
- Tombol jeda atau Spasi: hentikan/lanjutkan aktivitas karakter.
  Jam Jakarta tetap berjalan.
- Tombol 1×: ganti kecepatan aktivitas 1×, 2×, dan 4×.
  Kecepatan ini tidak mengubah jam Jakarta.
- Tombol angka 1 dan 2: pilih Miko atau Luna.

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

## Misi

1. Pilih kedua karakter.
2. Biarkan tim bekerja selama 30 detik waktu simulasi.
3. Tunggu karakter sampai ke coffee corner.

Setiap misi memberikan 25 office happiness. Progres pengenalan karakter,
durasi fokus, kunjungan kopi, serta karakter terpilih disimpan otomatis
di localStorage browser. Saat refresh, progres dimuat kembali dan hadiah
tidak diberikan ulang. Misi tidak otomatis direset ketika tanggal berganti.

Progres fokus disimpan setiap detik, dan langsung disimpan ketika misi
selesai atau halaman ditinggalkan. Aktivitas yang tidak berjalan selama
tab ditutup tidak dihitung sebagai progres tambahan.

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
- `main.js`: data karakter, dunia 3D, animasi, jalur jalan, dan misi.
- `Three.js`: library Three.js r160 versi tidak dipadatkan.
- `THREE-LICENSE.txt`: lisensi MIT library Three.js.
- `index.html`: pintasan menuju halaman utama.

Data karakter berada di konstanta TEAM di bagian atas `main.js`.
Model kucing serta furnitur dibuat dari kode; tidak membutuhkan file
model eksternal. Semua aktivitas saat ini mengikuti aturan simulasi
JavaScript. Belum ada model AI atau pemanggilan API.

Library: https://threejs.org/ — https://github.com/mrdoob/three.js
