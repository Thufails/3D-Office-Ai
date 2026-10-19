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
- Tombol bulan/matahari: ganti suasana siang dan malam.
- Tombol jeda atau Spasi: hentikan/lanjutkan waktu.
- Tombol 1×: ganti kecepatan 1×, 2×, dan 4×.
- Tombol angka 1 dan 2: pilih Miko atau Luna.

## Misi

1. Pilih kedua karakter.
2. Biarkan tim bekerja selama 30 detik waktu simulasi.
3. Tunggu karakter sampai ke coffee corner.

Setiap misi memberikan 25 office happiness. Progres diulang ketika
halaman dimuat ulang agar mudah mencoba kembali.

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
