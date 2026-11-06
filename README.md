<p align="center"><img src="assets/images/readme-banner.svg" alt="Pawffice, kantor kucing 3D" width="1200"></p>

# 🐾 Pawffice

Kantor software house 3D lokal dengan **10 avatar kucing**, rutinitas WIB, dan simulasi pengelolaan proyek website.

🟢 Three.js lokal · 🏢 Satu lantai · 🐱 8 role proyek + 2 operasional

## 🚀 Menjalankan

Buka `3D-index.html` di Chrome/Edge, atau gunakan alamat Live Server yang biasa dipakai. Tidak perlu instalasi, backend, atau akun AI.

**Gunakan browser, profil, dan alamat yang sama** agar progres tetap terbaca. `file://`, `localhost`, dan `127.0.0.1` memiliki penyimpanan berbeda. Refresh dengan **Ctrl + Shift + R** setelah memperbarui kode.

## 🏢 Yang tersedia

- Bangunan satu lantai yang kompak, halaman luas berpohon, serta parkir mobil/motor di sisi kanan.
- Lobby besar khusus penerimaan dengan empat kelompok sofa dan dua meja tunggu; ruang staf dan fasilitas servis berada di blok belakang.
- Musala diapit kamar mandi dan tempat wudu, dengan akses terpisah dari koridor.
- Kendaraan milik avatar mengikuti kehadiran; datang melalui lobby dan kembali ke kendaraan saat pulang.
- **Rani — resepsionis** menjaga penerimaan 07.00–17.00. **Tomo — OB** membersihkan ruangan 05.00–07.00, lalu siaga sampai 14.00.
- Project Hub dengan metode **Waterfall, Agile, dan Hybrid**, dokumen, review, arsip, serta backup JSON.
- Jam WIB, ishoma, daily report, pengajuan lembur dengan notifikasi, dan penyimpanan lokal.

## ◷ Jadwal utama WIB

| Waktu | Aktivitas |
| --- | --- |
| 07.00–09.00 | Datang dan absen masuk |
| 09.00–12.00 | Kerja pagi |
| 12.00–13.00 | Ishoma |
| 13.00–16.30 | Kerja siang |
| 16.30–17.00 | Daily report dan persiapan pulang |
| 17.00–18.00 | Pulang / jeda sebelum lembur |
| 18.00–21.00 | Lembur berizin, maksimal pukul 21.00 |

🔔 Pengajuan lembur muncul 16.30–16.50 jika ada tugas tertunda dan energi cukup. Kamu dapat mengizinkan sampai 19.00, 20.00, atau 21.00. Tanpa jawaban sampai 17.00, avatar pulang.

🕌 Pilih avatar yang mengikuti kegiatan ibadah lewat **Jadwal & absen WIB**. Waktu Zuhur/Asar dihitung berdasarkan tanggal dan Jakarta, ditandai sebagai **estimasi simulasi**, bukan jadwal adzan resmi.

## 🎮 Kontrol

| Kontrol | Fungsi |
| --- | --- |
| Seret / scroll | Putar / zoom kamera |
| Lokasi kantor | Fokus ke ruangan atau parkir |
| P / J | Project Hub / jobdesk tim |
| 1–8, 9, 0 | Pilih tim proyek, Rani, Tomo |
| Spasi / R | Pause / kembali ke overview |
| 🔔 / Jadwal & absen WIB | Notifikasi, jadwal, absen, laporan, dan pilihan ibadah |

Proyek masih menghasilkan **dokumen template simulasi**. Role belum menjalankan AI, membuat website nyata, atau menyelesaikan tugas otomatis lewat timer. Project Hub bisa dikelola kapan saja.

<details>
<summary>📚 Buka panduan lengkap, jobdesk, struktur folder, dan detail teknis</summary>


## 🌱 Mulai dari Project Hub

Klik **📋 Project Hub** di panel kiri, tombol **Buka Project Hub** pada panel
proyek, atau tekan **P**. Area dokumen dibuka terpisah dari kantor 3D.

| Tab | Yang bisa dilakukan |
| --- | --- |
| 🌱 **Brief** | Isi nama proyek, klien, jenis website, metode, tujuan, fitur, dan target tanggal opsional. |
| 🌿 **Backlog & iterasi** | Agile/Hybrid: review usulan fitur, atur prioritas, dan pilih pekerjaan iterasi. |
| 📋 **Papan tugas** | Mulai tugas, buat draf template, edit dokumen, lalu review hasil. |
| 🤝 **Notulen** | Baca catatan Sasa dan tindak lanjut yang mengacu ke tugas tim. |
| 🗂️ **Arsip** | Simpan proyek selesai/berjalan, baca dokumen, dan lanjutkan proyek lama. |
| 💾 **Cadangan** | Ekspor seluruh progres sebagai JSON atau pulihkan cadangan yang valid. |

Satu proyek aktif dalam satu waktu. Untuk klien baru, arsipkan proyek aktif
dahulu. Arsip parsial tidak menghapus hasil kerja dan dapat dilanjutkan.
Instalasi baru dimulai tanpa proyek; contoh barbershop hanya dibawa jika ada
progres dari versi lama. Brief memuat 1–20 kebutuhan, satu kebutuhan per baris.

### 🧭 Pilih cara kerja tim

| Metode | Perilaku saat membuat proyek |
| --- | --- |
| 🪜 **Waterfall** | Delapan tugas untuk seluruh proyek. Tiap tahap menunggu hasil prasyarat yang sudah disetujui; BE dapat berjalan paralel setelah analisis. |
| 🌿 **Agile** | Setiap baris kebutuhan menjadi usulan backlog. Kamu mereview kebutuhan, mengatur prioritas, dan memilih fitur untuk iterasi. |
| 🧩 **Hybrid** | Sahkan scope dan analisis awal dahulu, kemudian kerjakan fitur dalam iterasi. Tambahan scope membutuhkan alasan dan persetujuan. |

Metode dipilih saat membuat brief. Belum ada konversi metode pada proyek
yang sudah dibuat; arsipkan dan buat brief baru bila ingin mencoba metode lain.
Simpanan lama diberi label **Alur lama**. Dokumen, status tugas, arsip, dan
persentasenya tetap mengikuti alur semula.

### 🌿 Dari brief ke backlog Agile

1. Buat brief baru dan pilih **Agile**. Isi fitur yang dibutuhkan, satu per baris.
2. Buka **Backlog & iterasi**. Nori menyusun usulan dari setiap kebutuhan;
   Miko memberi saran awal berupa prioritas tinggi untuk fitur pertama.
   Saran memakai template lokal, belum analisis AI.
3. Klik **Edit fitur** untuk mengubah nama, kebutuhan pengguna, prioritas,
   dan kriteria penerimaan. Kamu juga bisa **Tambah fitur** sendiri.
4. Atur nomor urut memakai **↑ Naik / ↓ Turun**, lalu klik **Setujui kebutuhan**.
   Label Tinggi/Sedang/Rendah membantu penilaian; nomor urut adalah urutan
   pengerjaan yang kamu tentukan. Mengedit fitur mengulang persetujuan kebutuhan.
5. Beri nama iterasi dan pilih **1–5 fitur** yang sudah disetujui.
   Klik **Mulai iterasi pilihan** untuk membagikan pekerjaan.
6. Di **Papan tugas**, selesaikan dokumen dan review tiap fitur. Pada versi awal
   ini, setiap fitur memiliki delapan tugas template untuk delapan role.
   Prasyarat berlaku dalam fitur yang sama; fitur lain tidak harus selesai dulu.
7. Setelah seluruh hasil fitur diterima, klik **Tutup iterasi** di tab backlog.
   Review urutan kebutuhan lagi, kemudian pilih fitur untuk iterasi berikutnya.

Satu iterasi aktif dalam satu waktu, maksimal **40 fitur per proyek**.
Papan tugas memiliki pilihan iterasi agar dokumen iterasi sebelumnya tetap
bisa dibaca. Fitur diterima setelah tugas review akhir Owner disetujui.

Kamu berperan sebagai pengelola yang memutuskan kebutuhan, prioritas, dan
penerimaan hasil. Fitur dalam iterasi dikunci agar dokumen turunannya konsisten.
Perubahan baru dapat masuk sebagai fitur lanjutan di backlog, tanpa otomatis
menginterupsi pekerjaan aktif. Fitur yang belum masuk iterasi dapat diedit
atau dihapus; penghapusan memakai modal konfirmasi Pawffice.

Ini implementasi awal alur Agile untuk dokumen simulasi. Belum ada estimasi
kapasitas otomatis, story point, durasi sprint, atau implementasi website oleh AI.

### 🧩 Hybrid dengan rencana awal dan iterasi

1. Pilih **Hybrid** pada brief baru. Review backlog usulan Nori dan setujui
   kebutuhan awal seperti pada Agile.
2. Buka **Papan tugas** dan selesaikan dokumen **scope PM**. Persetujuan scope
   memerlukan seluruh kebutuhan awal sudah direview dan disetujui.
3. Saat scope disahkan, kebutuhan awal menjadi **baseline yang dikunci**.
   Selesaikan **analisis awal Nori** sebelum iterasi pertama dapat dimulai.
4. Pilih 1–5 fitur dari baseline untuk iterasi. Kerjakan delapan dokumen tiap
   fitur, lakukan review, lalu tutup iterasi setelah hasilnya diterima.
5. Jika muncul kebutuhan tambahan, klik **Tambah fitur** dan isi **alasan
   perubahan / tambahan scope**. Review kebutuhan, lalu gunakan **Setujui
   perubahan scope**. Modal menampilkan rincian dan alasan sebelum pengesahan.
6. Fitur tambahan yang telah disetujui bisa dipilih untuk iterasi berikutnya.
   Mengeditnya sebelum masuk iterasi mengulang review kebutuhan dan persetujuan
   scope. Fitur baseline dan fitur dalam iterasi tetap dikunci.

Kamu bertindak sebagai pengelola/Owner simulasi saat menyetujui perubahan scope;
memilih avatar bukan autentikasi atau persetujuan AI. Pada tahap ini semua
tambahan kebutuhan setelah baseline memerlukan persetujuan, tanpa klasifikasi
otomatis perubahan kecil/besar. Alasan dan waktu pengesahan tersimpan pada
fitur serta disertakan di cadangan dan dokumen Markdown.

Progres Hybrid menghitung **dua milestone rencana awal + fitur diterima**
dibagi **dua milestone + seluruh fitur backlog**. Contoh: proyek dua fitur
memiliki empat milestone. Scope dan analisis selesai berarti 50%; dua fitur
diterima berarti 100%. Menambah fitur baru dapat menurunkan persentase.
Pilihan **Rencana awal** di papan tugas membuka kembali dokumen perencanaan.

### 📋 Alur tugas yang menghasilkan dokumen

**Belum mulai → Dikerjakan → Review → Selesai.**

1. Pilih kartu tugas dan klik **Mulai tugas** jika prasyaratnya selesai.
2. Klik **Buat draf template**. Isi dokumen dibuat dari brief secara lokal.
3. Perbaiki teks bila perlu, lalu **Simpan draf / ajukan review**.
4. Periksa seluruh checklist sebelum **Setujui hasil**.
5. Bila belum sesuai, gunakan **Minta revisi**. Dokumen yang berubah mengulang
   checklist review; dokumen final dikunci agar tugas turunannya konsisten.

Review dilakukan **manual oleh pengguna sebagai pengelola simulasi**.
Pemilihan avatar tidak menjadi autentikasi reviewer. Draf yang belum disimpan
tidak dihapus oleh refresh otomatis panel; keluar tab/dialog meminta konfirmasi.
Konfirmasi memakai modal Pawffice bertema sage/cream, bukan popup browser.
Arsip proyek, penggantian progres, dan meninggalkan draf memiliki pesan serta
tombol sesuai tindakan. Fokus awal berada pada tombol batal; Escape, tombol ×,
atau klik backdrop membatalkan tanpa menerapkan tindakan tersebut.

> 🪄 Hasilnya adalah **dokumen template simulasi**, bukan website, desain gambar,
> API yang sudah berjalan, atau bukti pengujian nyata. Dokumen QA secara eksplisit
> menyatakan pengujian belum dijalankan pada website nyata. Belum ada panggilan AI.

## 🐾 Kenalan dengan tim

| Anggota | Role | Tanggung jawab di simulasi |
| --- | --- | --- |
| 📋 **Miko** | Project Manager | Menentukan lingkup dan mengatur progres proyek. |
| 🔎 **Nori** | System Analyst | Mencatat kebutuhan klien dan alur sistem. |
| 🎨 **Luna** | UI/UX Designer | Merancang alur penggunaan dan tampilan. |
| 🧩 **Kiko** | Frontend Developer | Membangun halaman dan interaksi website. |
| 🗄️ **Bimo** | Backend Developer | Menyiapkan logika, jadwal, dan reservasi. |
| 🧪 **Piko** | QA / Tester | Menguji alur booking dan menyiapkan serah-terima. |
| 👑 **Oji** | Owner / Founder | Menentukan arah layanan dan meninjau keputusan proyek. |
| 🗓️ **Sasa** | Personal Assistant / Secretary | Mengatur agenda, komunikasi klien, dan catatan rapat. |
| 🛎️ **Rani** | Receptionist | Menjaga lobby, buku tamu, dan penerimaan. |
| 🧹 **Tomo** | Office Boy | Membersihkan ruangan dan membantu operasional. |

Semua anggota divisualisasikan sebagai avatar kucing berseragam. Untuk
memilih karakter, klik kartu tim atau tekan angka 1–8; angka 9 memilih Rani dan 0 memilih Tomo.

Tombol **Lihat jobdesk tim** (atau J) membuka seluruh tanggung jawab tanpa
perlu memilih avatar. Label nama/role menempel di atas avatar dan mengikuti
gerakan serta kamera, tanpa dipindah untuk menghindari label lain. Ukurannya
mengikuti zoom dengan batas saat close-up. Avatar di luar pandangan tidak
meninggalkan label di tepi layar. Papan role fisik tetap ada di setiap bilik.
Untuk membaca detail saat zoom terlalu jauh, gunakan daftar jobdesk tim.

<details>
  <summary>📚 Buka jobdesk lengkap delapan role proyek</summary>

### Siapa mengerjakan apa?

- **Miko — Project Manager:** menetapkan scope, prioritas, dan jadwal;
  membagi pekerjaan serta memantau hambatan; mengkoordinasikan review klien.
- **Nori — System Analyst:** menggali kebutuhan dan spesifikasi;
  menyusun proses, use case, dan rancangan data; menjelaskan aturan bisnis.
- **Luna — UI/UX Designer:** merancang user flow, wireframe, dan prototipe;
  menentukan komponen visual; menyerahkan dan meninjau implementasi desain.
- **Kiko — Frontend Developer:** membangun halaman responsif;
  mengerjakan interaksi pengguna; menghubungkan UI ke API dan memperbaiki bug.
- **Bimo — Backend Developer:** merancang database dan API;
  menerapkan validasi, autentikasi, dan aturan bisnis; menjaga integrasi data.
- **Piko — QA / Tester:** menyusun skenario uji; menguji dan mencatat bug;
  menguji ulang perbaikan serta memeriksa kesiapan serah-terima.
- **Oji — Owner / Founder:** menentukan arah bisnis dan layanan;
  meninjau klien, sumber daya, dan keputusan penting; menyetujui proposal/hasil.
- **Sasa — Personal Assistant / Secretary:** mengatur agenda dan pengingat;
  mencatat serta menindaklanjuti rapat; mengelola komunikasi dan dokumen klien.

Jobdesk ini menjelaskan peran aktor dalam simulasi dan arah pengembangan
software house; kegiatan coding dan pengujian proyek masih berupa simulasi.

</details>

## 🎮 Kontrol kecil, banyak cerita

- Seret area 3D untuk memutar kamera.
- Gulir mouse atau cubit layar sentuh untuk zoom.
- Klik karakter atau kartu tim untuk memilihnya.
- Lihat lebih dekat: kamera mengikuti karakter terpilih.
- Overview atau tombol R/Escape: kembali ke kamera awal.
- Coffee break: ajak karakter terpilih ke area kopi.
- Team huddle: ajak seluruh tim berdiskusi di meja meeting panjang.
- Tombol bulan/matahari: ganti suasana siang dan malam secara manual.
  Pilihan manual berlaku sampai halaman dimuat ulang.
- Tombol jeda atau Spasi: hentikan/lanjutkan aktivitas karakter.
  Jam Jakarta tetap berjalan.
- Tombol 1×: ganti kecepatan aktivitas 1×, 2×, dan 4×.
  Kecepatan ini tidak mengubah jam Jakarta.
- Tombol angka 1–8: pilih role proyek. Angka 9/0 memilih Rani/Tomo.
- Lihat jobdesk tim atau tombol J: buka tanggung jawab sepuluh role.
  Tutup dengan tombol ×, Escape, atau klik di luar daftar.
- Project Hub atau tombol P: kelola brief, tugas, hasil kerja, arsip, dan cadangan.
  Saat mengisi form atau membuka dialog, shortcut kantor tidak mengganggu input.
- Menu **Lokasi kantor** di panel kiri: pilih Semua ruangan, Ruang kerja,
  Meeting, Owner + PA, atau Pantry & istirahat. Menu menutup setelah dipilih.

UI memakai font sans-serif lokal (Aptos/Segoe UI/system font), dengan teks
utama 14–15 px dan keterangan kecil minimal 12 px. Tidak perlu mengunduh
font dari internet. Pilihan lokasi tidak menutupi area 3D.

## 🏡 Keliling kantor

| Ruangan | Posisi | Kegiatan |
| --- | --- | --- |
| 💻 **Ruang kerja** | Kiri belakang | PM, analis, designer, FE, BE, dan QA bekerja. |
| 🤝 **Meeting** | Kanan belakang | Delapan rekan rapat di meja panjang. |
| 🌿 **Owner + PA** | Kanan depan | Oji dan Sasa mengatur arah serta agenda tim. |
| ☕ **Pantry & istirahat** | Kiri depan | Ngopi, duduk santai, dan mengisi energi. |
| 🛎️ **Lobby** | Hall depan tersendiri | Resepsionis, empat sofa, dan dua meja tunggu. |
| 🧹 **Ruang staf** | Blok belakang | Locker, alat kebersihan, dan istirahat staf. |
| 🚻 **Kamar mandi / wudu** | Kedua sisi musala | Jeda fasilitas dan persiapan ibadah. |
| 🕌 **Musala** | Blok belakang, tengah | Kegiatan ibadah per avatar yang dipilih. |
| 🅿️ **Parkir** | Samping kanan | Mobil, motor, dan akses pejalan kaki. |
| 🌳 **Halaman** | Sekeliling gedung | Taman, pepohonan, jalur akses, dan gerbang. |

Enam meja produksi tersusun simetris dalam dua baris berisi tiga bilik.
Baris pertama berisi PM (Miko), System Analyst (Nori), dan UI/UX Designer
(Luna). Baris kedua berisi Frontend (Kiko), Backend (Bimo), dan QA (Piko).
Gedung berukuran sekitar 38,4 × 46,4 unit, dengan lahan 73 × 66 unit yang
lebih mendekati persegi. Lobby menempati seluruh hall depan, fasilitas servis
berada di belakang, dan parkir di kanan. Empat ruangan inti tetap berada di tengah:
ruang kerja di kiri belakang, pantry di kiri depan, ruang meeting di kanan
belakang, dan ruang Owner + PA di kanan depan. Meja Oji dan Sasa berada di
ruang Owner. Setiap ruangan diperluas, dengan jarak bilik dan lorong lega.
Monitor dan keyboard lurus mengikuti meja; kursi dan avatar berbagi titik
duduk serta arah hadap yang sama. Panel bilik memakai sage dan sand lembut.
Pantry adalah ruangan khusus berisi coffee corner, kulkas, sofa panjang,
dan dua meja istirahat dengan delapan kursi. Avatar yang beristirahat duduk
di kursi pantry masing-masing. Ruang meeting memiliki meja panjang delapan
kursi (tiga pada tiap sisi panjang dan satu pada tiap ujung), layar presentasi,
dan lorong di sekeliling meja. Ruang Owner punya dua meja dan lemari penyimpanan.

Karakter menghitung jalur yang menghindari dinding, furnitur, kursi milik karakter
lain, dan posisi karakter lain. Jika jalurnya terhalang saat berjalan,
karakter mencari rute baru. Saat benar-benar perlu menunggu, animasi kaki
ikut berhenti.

Pada Team huddle, setiap karakter melewati pintu menuju kursi rapatnya sendiri,
duduk menghadap meja, lalu menunggu temannya sebelum waktu diskusi dihitung.
Setelah seluruh tim berkumpul, Sasa menyimpan satu notulen template untuk
pertemuan tersebut pada proyek aktif. Catatan berisi progres dan tindak lanjut
ke tugas yang belum selesai; status tugas pada daftar tindak lanjut mengikuti
papan tugas. Ini bukan transkrip percakapan AI. Notulen juga ikut diarsipkan
dan disertakan dalam unduhan dokumen proyek.

Panel kiri bisa digulir ketika tinggi jendela tidak cukup. Cerita hari ini
tetap berada di dalam panel dan tidak menimpa toolbar bawah. Pada layar
tablet/ponsel, cerita juga ditampilkan dan dapat dibaca lewat gulir halaman.

## 🎯 Dari brief sampai siap diuji

Proyek utama mengikuti **brief klien yang kamu buat**, bukan satu judul
yang dikunci di kode. Pada Waterfall/Alur lama, progres adalah tugas berstatus
**Selesai** dibagi delapan tugas. Pada Agile, progres adalah **fitur diterima
dibagi seluruh fitur backlog**, termasuk fitur yang belum masuk iterasi.
Menambah cakupan bisa menurunkan persentase; menghapus fitur yang belum
dikerjakan juga mengubah total cakupan. Tugas yang selesai tetap tersimpan.
Backlog kosong belum dianggap proyek selesai.

Pada Hybrid, persentase menghitung dua milestone rencana awal dan fitur yang
diterima; rumusnya ditampilkan pada panel proyek dan tab backlog.

Waktu duduk, kecepatan simulasi, dan timer 30 detik tidak lagi
menyelesaikan tugas proyek secara otomatis. Setiap persetujuan tugas memberi
25 happiness sekali; migrasi, reload, dan melanjutkan arsip tidak memberi ulang hadiah.

Tahapan berikut berlaku untuk seluruh proyek Waterfall/Alur lama, atau
diulang dalam masing-masing fitur pada Agile:

| Tahap | Penanggung jawab | Fokus |
| :---: | --- | --- |
| 1 | 📋 Miko | Scope proyek dan rencana kerja. |
| 2 | 🔎 Nori | Spesifikasi kebutuhan setelah scope disetujui. |
| 3 | 🎨 Luna | Rancangan UI/UX tertulis setelah analisis. |
| 4 | 🧩 Kiko | Rencana frontend setelah rancangan UI/UX. |
| 5 | 🗄️ Bimo | Rencana backend setelah analisis; bisa paralel dengan desain/FE. |
| 6 | 🧪 Piko | Skenario uji setelah rencana FE dan BE disetujui. |
| 7 | 🗓️ Sasa | Ringkasan serah-terima setelah dokumen QA. |
| 8 | 👑 Oji | Review akhir dan persetujuan simulasi. |

Tiga quest sampingan dipilih dari rotasi harian. Pilihan dan progresnya
tetap sama setelah refresh pada hari yang sama, lalu berganti saat tanggal
WIB berubah. Quest dapat meminta tim fokus, istirahat, rapat, berkolaborasi,
atau memilih rekan. Setiap quest sampingan yang selesai memberi 10 office
happiness. Progres proyek utama dan happiness berlanjut lintas hari.
Quest **Majukan proyek** berarti menyetujui satu tugas. Jika tidak ada proyek
aktif atau semua tugas sudah selesai dan quest itu belum dapat dipenuhi,
quest tersebut diganti dengan kegiatan harian lain. Dua pilihan lain tetap
stabil; quest yang sudah selesai tidak ditarik atau diberi hadiah ulang.

### 💾 Progres tidak perlu mulai dari nol

Brief, pilihan metode, backlog, iterasi, tugas, dokumen, notulen, arsip, anggota tim yang dikenal,
quest harian, serta happiness disimpan otomatis di localStorage browser.
Membuka ulang halaman pada browser, profil, dan alamat yang sama memulihkan
progres. Data versi lama dimigrasikan saat tersedia. Aktivitas tidak berjalan
selama tab ditutup.

Penyimpanan baru memakai `pawffice.progress.v3`; simpanan v1/v2 tidak dihapus.
Tahap lama yang sudah selesai dibawa ke tugas baru. Proyek lama yang sudah
100% tetap 100%, disertai catatan bahwa status berasal dari simulasi timer lama.
Sisa detik tahap lama dicatat di brief, bukan dipakai untuk mengesahkan dokumen.
Pada proyek parsial, persentase mengikuti delapan tugas baru; jumlah tahap
lama yang sudah selesai tetap dipertahankan. Jika simpanan rusak, aplikasi
tidak otomatis menimpanya dengan data kosong.

### 💾 Ekspor, impor, dan unduh hasil

- **Brief / Arsip → Unduh dokumen .md:** seluruh hasil kerja dan notulen proyek.
- **Cadangan → Unduh cadangan JSON:** simpanan proyek aktif, arsip, quest,
  anggota yang dikenal, dan happiness. Posisi kamera/avatar bukan bagian backup.
- **Cadangan → pilih JSON:** format dan isi divalidasi sebelum preview ditampilkan.
  File yang salah tidak menyentuh progres aktif. Batas impor adalah 16 MB.
- **Ganti progres:** perlu konfirmasi karena mengganti seluruh simpanan lokal,
  bukan menggabungkan data. Unduh cadangan kondisi sekarang terlebih dahulu.
- Jika browser menolak penyimpanan atau kapasitasnya habis, data masih ada di
  memori tab; ekspor JSON sebelum menutupnya. Simpan backup secara pribadi
  bila brief atau dokumen memuat informasi klien.

Batas pengaman saat ini: 100 arsip dan 100 notulen per proyek. Tidak ada data
yang dikirim ke server. Jam, animasi, dan pilihan suasana bukan hasil proyek.

Penyimpanan berlaku di browser/profil dan alamat halaman yang sama.
Menghapus data situs, memakai mode privat, atau memindahkan file lokal
dapat menghasilkan penyimpanan yang berbeda. Perilaku localStorage untuk
file HTML yang dibuka langsung bergantung pada browser. Jika penyimpanan
ditolak, panel misi menampilkan status bahwa progres masih sementara.

## 🕰️ Satu kantor, satu jam Jakarta

### ◷ Rutinitas kantor WIB

Klik **Jadwal & absen WIB** di panel kiri untuk melihat jadwal dan kehadiran
simulasi. Lonceng **🔔** di header membuka notifikasi, pengajuan lembur, dan
daily report. Saat Project Hub terbuka, tombol kabar kantor ikut muncul jika
ada notifikasi yang perlu dilihat.

| Waktu WIB | Kegiatan avatar |
| --- | --- |
| 07.00–09.00 | Datang bertahap, absen masuk, dan persiapan di meja. |
| 09.00–12.00 | Kerja produktif pagi. |
| 12.00–13.00 | Ishoma di pantry. |
| 13.00–16.30 | Kerja produktif siang. |
| 16.30–17.00 | Daily report dan persiapan absen pulang. |
| 17.00–18.00 | Pulang; avatar berizin lembur beristirahat di pantry. |
| 18.00–21.00 | Lembur hanya untuk avatar yang telah mendapat izin. |
| 21.00–07.00 | Kantor tutup dan avatar tidak berada di kantor. |

Jadwal berlaku **setiap hari**. Jam WIB tetap mengikuti waktu nyata ketika
animasi dijeda atau dipercepat. Avatar yang sedang dijeda menyelesaikan gerak
pulangnya setelah animasi dilanjutkan. Tombol kopi/meeting mengikuti jam
produktif atau lembur berizin; ishoma dan jadwal pulang tidak ditimpa tombol itu.
Project Hub tetap bisa kamu kelola kapan saja; jadwal mengatur rutinitas avatar.

Avatar masuk melalui area pintu, meninggalkan kantor saat pulang, dan tidak
menghalangi jalur setelah tidak terlihat. Monitor meredup saat meja kosong,
lampu meja menyala saat ditempati, dan pencahayaan malam menyesuaikan keberadaan
avatar. Label di atas avatar menampilkan status rutinitasnya.

### 🔔 Pengajuan lembur

- Pengajuan muncul pada **16.30–16.50 WIB** jika avatar mempunyai tugas proyek
  yang belum selesai dan energi minimal 60. Maksimal tiga avatar berbeda
  mengajukan dalam satu hari; penolakan tidak memicu pengajuan ulang.
- Toast, badge lonceng, dan balon ucapan avatar membantu menandai pengajuan.
  **Lihat avatar** menyorot pemohon jika masih berada di kantor.
- Pilih **Izinkan lembur** sampai **19.00, 20.00, atau 21.00 WIB**, atau
  **Pulang dulu**. Pengajuan tidak dijawab hingga 17.00 menjadi kedaluwarsa.
  Membaca notifikasi tidak berarti memberi izin.
- Lembur dimulai pukul 18.00 setelah jeda. Energi 45 atau kurang memunculkan
  peringatan; pada energi 30 atau kurang lembur dihentikan. Batas izin yang
  dipilih dan pukul 21.00 juga mengakhiri lembur.
- Izin, penolakan, kedaluwarsa, dan notifikasi tersimpan setelah refresh.
  Izin hari sebelumnya tidak dibawa ke hari baru. Belum ada tugas proyek berarti
  belum ada alasan pengajuan; buat brief/iterasi dahulu untuk membagikan tugas.

### 📝 Absen dan daily report

Absen merupakan **catatan simulasi yang teramati saat halaman terbuka**.
Membuka kantor pukul 14.00 mencatat kehadiran saat itu, bukan mengarang jam
masuk pagi. Membuka halaman pertama kali malam hari tidak membuat absen atau
laporan pekerjaan fiktif. Tidak ada aktivitas proyek yang dijalankan saat
halaman ditutup.

Mulai 16.30, laporan mengambil nama proyek, waktu aktivitas kerja yang teramati,
20 tindakan tugas terakhir yang tercatat, serta snapshot status tugas tiap role.
Jika tidak ada tindakan tugas, laporan menyatakannya. Snapshot status dibedakan
dari aktivitas yang benar-benar dilakukan pada sesi itu. Timer laporan tidak
menyelesaikan tugas, membuat hasil AI, atau menyetujui pekerjaan.

Pusat kantor menyimpan laporan hari ini dan maksimal tujuh hari kunjungan
sebelumnya. Cadangan JSON Project Hub juga membawa jadwal, absensi, laporan,
izin lembur, serta notifikasi. Simpanan lama tanpa data jadwal tetap bisa dibaca.

Jam digital, tanggal, cap waktu aktivitas, dan jarum jam dinding mengikuti
zona waktu Asia/Jakarta (WIB, UTC+7). Jam menggunakan waktu komputer dan
tidak memerlukan koneksi internet. Pastikan jam komputer sudah benar.

Pause dan tombol kecepatan hanya memengaruhi aktivitas karakter.
Saat membuka halaman, suasana otomatis mengikuti WIB: malam pukul
18.00–05.59, dan siang pukul 06.00–17.59. Tombol bulan/matahari tetap
bisa digunakan untuk mencoba suasana lain.

| 🌤️ Siang | 🌙 Malam |
| :---: | :---: |
| 06.00–17.59 WIB | 18.00–05.59 WIB |

## 🧰 Di balik meja

### 🗂️ Susunan folder proyek

```text
3D-Office-Ai/
├── 3D-index.html                          # Halaman utama tetap di alamat lama
├── index.html                             # Pintasan ke 3D-index.html
├── README.md                              # Panduan proyek dan penggunaan
├── .gitattributes                         # Normalisasi file teks Git
├── .gitignore                             # Abaikan file sementara dan hasil QA
├── src/
│   ├── css/
│   │   └── style.css                      # Tema dan layout responsif
│   └── js/
│       ├── main.js                        # Kantor 3D dan penghubung aplikasi
│       ├── office/
│       │   ├── office-schedule.js          # Aturan WIB, absen, laporan, dan lembur
│       │   ├── office-ui.js                # Lonceng dan pusat kantor
│       │   ├── office-campus.js            # Model fasilitas dan parkir
│       │   └── prayer-times.js             # Estimasi waktu salat Jakarta
│       └── projects/
│           ├── project-engine.js          # Aturan dan data proyek
│           ├── project-ui.js              # Antarmuka Project Hub
│           └── methods/
│               ├── waterfall.js          # Prasyarat alur bertahap
│               ├── iterative.js          # Bantuan operasi backlog/iterasi bersama
│               ├── agile.js              # Aturan iterasi dan progres fitur
│               └── hybrid.js             # Rencana awal dan persetujuan scope
├── vendor/
│   └── three/
│       ├── Three.js                       # Library Three.js lokal
│       └── THREE-LICENSE.txt              # Lisensi library
├── assets/
│   └── images/
│       └── readme-banner.svg              # Ilustrasi dokumentasi
├── docs/
│   ├── CHANGELOG.md                        # Riwayat pengembangan
│   ├── Ringkasan_Fitur_dan_Alur_Pawffice.docx
│   └── notes/
│       └── Catatan Pengembangan AI.txt     # Catatan rencana pengembangan
├── tests/
│   ├── project-engine.test.cjs             # Tes aturan proyek
│   ├── project-agile.test.cjs              # Tes fitur, iterasi, dan kompatibilitas
│   ├── project-hybrid.test.cjs             # Tes rencana awal dan perubahan scope
│   ├── office-schedule.test.cjs            # Tes batas waktu, absen, laporan, izin
│   ├── office-ui.test.cjs                  # Tes lonceng dan keputusan lembur
│   ├── office-campus.test.cjs              # Tes shift, ibadah, migrasi, transportasi
│   ├── project-ui.test.cjs                 # Tes handler dan modal UI
│   ├── project-structure.test.cjs          # Tes path dan struktur proyek
│   └── office-integration.cjs              # Tes integrasi dan gerak kantor
└── tools/
    └── docs/
        └── build-summary.py               # Alat bantu pembuatan dokumen Word
```

Folder `tools/docs/.qa/` dapat berisi hasil pemeriksaan dokumen lokal dan
diabaikan oleh Git. Folder `.git/` adalah metadata repositori, bukan kode aplikasi.

### 🧩 Fungsi tiap kelompok

| Kelompok | Isi dan tanggung jawab |
| --- | --- |
| `src/css/` | Warna, font, panel, dialog, dan tampilan responsif. |
| `src/js/main.js` | Avatar, ruangan, animasi, navigasi, kamera, quest harian, serta penyimpanan dan integrasi Project Hub. |
| `src/js/projects/` | Aturan brief, dependensi, hasil kerja, migrasi, validasi, serta antarmuka pengelolaan proyek. |
| `src/js/office/` | Jadwal WIB, catatan absen dan aktivitas sesi, daily report, pengajuan lembur, dan pusat notifikasi. |
| `vendor/three/` | Library pihak ketiga beserta lisensinya; terpisah dari kode yang kita kembangkan. |
| `assets/images/` | Gambar dan ilustrasi lokal. |
| `docs/` | Dokumentasi, ringkasan Word, dan catatan pengembangan. |
| `tests/` | Pengujian aturan, handler UI, struktur file, dan model kantor. |
| `tools/docs/` | Skrip bantu dokumentasi; tidak dimuat saat kantor dibuka. |

Halaman utama **tidak dipindahkan**: tetap buka `3D-index.html` pada browser,
profil, host, dan port yang sama. Penataan folder tidak mengubah kunci localStorage
atau mereset proyek. Tidak ada backend, bundler, atau instalasi baru.

HTML memuat file dengan urutan: library Three.js, modul Waterfall, bantuan
iterasi bersama, Agile, Hybrid, engine proyek, UI proyek, modul jadwal dan UI kantor,
kemudian `main.js`. Path stylesheet, gambar README, lisensi, dan tes sudah
disesuaikan ke lokasi baru. Jangan membuka file JavaScript sebagai halaman utama.

Data karakter dan quest berada di bagian atas `src/js/main.js`. Model kucing,
meja, serta furnitur dibuat dari kode; tidak membutuhkan file model
eksternal. Progres quest saat ini mengikuti aturan simulasi JavaScript.
Role belum menjalankan model AI atau mengirim permintaan API.

### 🧩 Pembagian logika metode

`src/js/projects/methods/waterfall.js` mengatur dependensi tahap.
`agile.js` mengatur usulan backlog, dependensi per fitur, serta progres Agile.
`hybrid.js` mengatur dua milestone rencana awal, penguncian baseline,
persetujuan tambahan scope, dependensi, dan progres Hybrid.
`iterative.js` menyediakan operasi backlog dan iterasi yang digunakan kedua
metode; modul ini memanggil aturan khusus metode sebelum mengubah state.
`project-engine.js` menghubungkan metode dengan data proyek, dokumen, review,
validasi cadangan, dan arsip. `project-ui.js` menangani tampilan dan input.

Alur persetujuan perubahan scope secara formal pada Waterfall masih
pengembangan berikutnya. Saat ini revisi dokumen dilakukan sebelum persetujuan;
hasil yang sudah disetujui dikunci.

### 🧪 Pemeriksaan pengembangan (opsional)

Node.js **hanya untuk menjalankan tes**, tidak diperlukan untuk membuka kantor.
Tidak ada paket tambahan atau proses build yang harus diinstal.

```powershell
node --test tests/project-engine.test.cjs tests/project-agile.test.cjs tests/project-hybrid.test.cjs tests/project-ui.test.cjs tests/project-structure.test.cjs
node --test tests/office-campus.test.cjs tests/office-schedule.test.cjs tests/office-ui.test.cjs
node tests/office-integration.cjs
```

Untuk memeriksa integrasi proyek dan penyimpanan tanpa mengulang simulasi
perjalanan avatar, jalankan `node tests/office-integration.cjs --projects-only`.
Untuk menguji gerak datang, ishoma, pulang, dan lembur tanpa mengulang seluruh
skenario perjalanan lama, gunakan `node tests/office-integration.cjs --schedule-only`.

Tes UI memakai DOM tiruan untuk memeriksa handler/state dan tes kantor memakai
model Three.js tanpa rendering. Keduanya bukan pengganti pemeriksaan visual
browser untuk tata letak, fokus keyboard, dan interaksi sentuh.

Banner memakai SVG lokal dan ikon dokumentasi memakai emoji, tanpa layanan
badge atau gambar eksternal. Warnanya tetap tampil saat dibaca offline.

Estimasi waktu salat menggunakan rumus posisi matahari [NOAA](https://gml.noaa.gov/grad/solcalc/solareqns.PDF)
dan definisi Asar faktor 1 dari [PrayTimes](https://praytimes.org/docs/calculation).
Lokasi simulasi Jakarta, dengan margin dua menit; perhitungan berlangsung lokal.

📦 Library: [Three.js](https://threejs.org/) ·
[Repositori Three.js](https://github.com/mrdoob/three.js) ·
[Lisensi library](vendor/three/THREE-LICENSE.txt) ·
[Catatan pengembangan](docs/CHANGELOG.md) ·
[Ringkasan Word](docs/Ringkasan_Fitur_dan_Alur_Pawffice.docx)

---

<p align="center">
  🐾 <strong>One paw at a time.</strong><br>
  Kerja pelan-pelan, kopi tetap hangat. ☕
</p>

</details>
