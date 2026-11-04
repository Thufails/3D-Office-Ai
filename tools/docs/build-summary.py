from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUT = PROJECT_ROOT / "docs" / "Ringkasan_Fitur_dan_Alur_Pawffice.docx"
doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(0.65)
section.bottom_margin = Inches(0.65)
section.left_margin = Inches(0.75)
section.right_margin = Inches(0.75)
section.footer_distance = Inches(0.28)

for name in ["Normal", "Title", "Heading 1", "Heading 2", "List Bullet"]:
    style = doc.styles[name]
    style.font.name = "Calibri"
    style.font.color.rgb = RGBColor(0, 0, 0)
    fonts = style.element.get_or_add_rPr().get_or_add_rFonts()
    fonts.set(qn("w:ascii"), "Calibri")
    fonts.set(qn("w:hAnsi"), "Calibri")
normal = doc.styles["Normal"]
normal.font.size = Pt(11)
normal.paragraph_format.line_spacing = 1.08
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.widow_control = True
doc.styles["Title"].font.size = Pt(25)
doc.styles["Title"].font.bold = True
doc.styles["Title"].paragraph_format.space_after = Pt(8)
doc.styles["Heading 1"].font.size = Pt(14)
doc.styles["Heading 1"].font.bold = True
doc.styles["Heading 1"].paragraph_format.space_before = Pt(14)
doc.styles["Heading 1"].paragraph_format.space_after = Pt(6)
doc.styles["Heading 1"].paragraph_format.keep_with_next = True


def paragraph(text, bold=False):
    p = doc.add_paragraph()
    p.add_run(text).bold = bold
    return p


def heading(number, text):
    doc.add_heading(f"{number} {text}", level=1)


def bullet(text):
    p = doc.add_paragraph(text, style="List Bullet")
    p.paragraph_format.space_after = Pt(4)


def table(headers, rows, widths):
    result = doc.add_table(rows=1, cols=len(headers))
    result.alignment = WD_TABLE_ALIGNMENT.CENTER
    result.autofit = False
    for column, width in zip(result.columns, widths):
        column.width = Inches(width)
    borders = OxmlElement("w:tblBorders")
    for edge in ["top", "left", "bottom", "right", "insideH", "insideV"]:
        border = OxmlElement(f"w:{edge}")
        for key, value in {"val": "single", "sz": "5", "color": "D9D9D9"}.items():
            border.set(qn(f"w:{key}"), value)
        borders.append(border)
    result._tbl.tblPr.append(borders)
    for index, values in enumerate([headers, *rows]):
        row = result.rows[0] if index == 0 else result.add_row()
        row._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))
        if index == 0:
            row._tr.get_or_add_trPr().append(OxmlElement("w:tblHeader"))
        for col, (cell, value) in enumerate(zip(row.cells, values)):
            cell.width = Inches(widths[col])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            margins = OxmlElement("w:tcMar")
            for edge in ["top", "left", "bottom", "right"]:
                item = OxmlElement(f"w:{edge}")
                item.set(qn("w:w"), "95")
                item.set(qn("w:type"), "dxa")
                margins.append(item)
            cell._tc.get_or_add_tcPr().append(margins)
            shade = OxmlElement("w:shd")
            shade.set(qn("w:fill"), "E7EDF3" if index == 0 else ("F5F7F9" if index % 2 == 0 else "FFFFFF"))
            cell._tc.tcPr.append(shade)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.03
            run = p.add_run(value)
            run.font.name = "Calibri"
            run.font.size = Pt(10)
            run.font.bold = index == 0
            run.font.color.rgb = RGBColor(0, 0, 0)
    paragraph("").paragraph_format.space_after = Pt(0)


doc.core_properties.title = "Ringkasan Fitur dan Alur Pawffice"
doc.core_properties.subject = "Delapan bagian panduan Project Hub dan struktur file proyek"
doc.core_properties.author = "Pawffice"
doc.add_paragraph("Ringkasan Fitur dan Alur Pawffice", style="Title")
paragraph("Panduan pengembangan lokal  |  4 November 2026")
paragraph("Pawffice kini memiliki Project Hub untuk mengelola proyek klien, tugas delapan role, dokumen, rapat, dan arsip. Ringkasan ini menjelaskan cara memakai fitur baru serta hubungan file yang menjalankannya. Seluruh proses tetap lokal dan hasil kerja masih berupa dokumen simulasi, belum website yang dibuat AI.")

heading(1, "Project Hub dan papan Kanban")
paragraph("Buka Project Hub dari panel kiri, panel proyek, atau tombol P. Lima tabnya adalah Brief, Papan tugas, Notulen, Arsip, dan Cadangan. Kantor 3D menampilkan aktivitas tim, sedangkan Project Hub mengelola pekerjaannya.")
paragraph("Papan tugas bergaya Kanban dengan empat kolom: Belum mulai, Dikerjakan, Review, dan Selesai. Angka delapan mengacu pada jumlah tugas dan penanggung jawabnya. Perubahan status memakai tombol; belum ada drag and drop atau batas pekerjaan berjalan.")

heading(2, "Brief proyek klien")
paragraph("Isi nama proyek, nama klien, jenis website, tujuan, 1 sampai 20 kebutuhan fitur, serta target tanggal opsional. Pilihannya meliputi company profile, reservasi, toko online, dashboard atau sistem internal, dan website lainnya.")
paragraph("Setelah brief dibuat, aturan lokal membentuk delapan tugas standar. Proyek tidak lagi harus barbershop; contoh itu hanya dibawa dari progres lama. Hanya satu proyek aktif diperbolehkan. Target tanggal masih berupa catatan, belum penjadwal otomatis.")

heading(3, "Pembagian tugas delapan role")
table(["Aktor dan role", "Hasil simulasi", "Prasyarat"], [
    ["Miko\nProject Manager", "Scope dan rencana kerja", "Tidak ada"],
    ["Nori\nSystem Analyst", "Spesifikasi kebutuhan", "Scope Miko"],
    ["Luna\nUI UX Designer", "Rancangan halaman dan alur tertulis", "Analisis Nori"],
    ["Kiko\nFrontend Developer", "Rencana implementasi frontend", "Rancangan Luna"],
    ["Bimo\nBackend Developer", "Rancangan data dan layanan", "Analisis Nori"],
    ["Piko\nQA dan Tester", "Skenario dan checklist pengujian", "Rencana FE dan BE"],
    ["Sasa\nPA dan Secretary", "Ringkasan serah terima", "Dokumen QA"],
    ["Oji\nOwner", "Review akhir dan persetujuan simulasi", "Dokumen Sasa"],
], [1.6, 3.35, 2.05])
paragraph("Sesudah analisis, Bimo dapat bekerja paralel dengan jalur Luna dan Kiko. QA baru dapat dimulai setelah FE dan BE disetujui. Tugas yang terblokir tetap terlihat beserta keterangannya.")

doc.add_page_break()
heading(4, "Pengerjaan tugas dan perhitungan progres")
for text in [
    "Pilih kartu dan klik Mulai tugas jika prasyaratnya sudah selesai.",
    "Klik Buat draf template untuk menyusun dokumen awal dari brief.",
    "Perbaiki teks dan simpan untuk mengajukannya ke Review.",
    "Periksa seluruh checklist lalu klik Setujui hasil. Jika belum sesuai, pilih Minta revisi.",
]:
    bullet(text)
paragraph("Review dilakukan manual oleh pengguna sebagai pengelola simulasi. Memilih avatar tertentu bukan autentikasi reviewer. Perubahan dokumen mengulang checklist; dokumen final dikunci agar acuan tugas berikutnya tetap konsisten.")
paragraph("Persentase dihitung dari jumlah tugas disetujui dibagi delapan: 2 tugas menjadi 25 persen, 4 tugas 50 persen, dan 8 tugas 100 persen. Timer kerja 30 detik tidak lagi menyelesaikan proyek otomatis. Setiap tugas yang disetujui memberi 25 happiness sekali saja.")

heading(5, "Bentuk hasil kerja dan batas simulasi")
paragraph("Hasil kerja adalah dokumen teks berbasis template yang dapat diedit. Isinya mencakup scope, spesifikasi, rancangan UI UX tertulis, rencana frontend, rancangan data backend, skenario QA, serah terima, dan catatan Owner.")
paragraph("Belum ada file website klien yang dibuat otomatis, gambar desain final, API yang berjalan, atau pengujian aplikasi nyata. Tidak ada panggilan AI. Seluruh hasil dan notulen proyek dapat diunduh sebagai file Markdown dengan ekstensi .md.")

heading(6, "Rapat dan notulen Sasa")
paragraph("Klik Team huddle agar para avatar menuju ruang meeting. Satu notulen template disimpan setelah seluruh tim tiba di kursinya, bukan segera saat tombol ditekan dan bukan setiap frame animasi.")
paragraph("Tab Notulen menampilkan proyek, progres saat rapat, dan tindak lanjut terhadap tugas yang belum selesai. Tindak lanjut merujuk ke kartu yang sudah ada, sehingga tidak membuat tugas duplikat. Catatan ini bukan transkrip AI; rapat tidak langsung menyelesaikan tugas atau menaikkan persentase proyek.")

heading(7, "Arsip penyimpanan dan cadangan")
bullet("Arsip menyimpan proyek selesai maupun parsial. Proyek dapat dilanjutkan ketika tidak ada proyek aktif lain.")
bullet("localStorage menyimpan progres otomatis pada browser, profil, dan alamat yang sama. Migrasi memakai pawffice.progress.v3 tanpa menghapus kunci v1 dan v2.")
bullet("Cadangan JSON memuat proyek aktif, arsip, dokumen, notulen, quest, anggota yang dikenal, dan happiness. Kamera serta posisi avatar tidak ikut dicadangkan.")
paragraph("Impor memeriksa file, menampilkan ringkasan, lalu meminta konfirmasi. Impor mengganti seluruh progres, bukan menggabungkannya. Unduh cadangan kondisi sekarang terlebih dahulu. File tidak valid ditolak sebelum progres berubah; batas impor 16 MB.")
paragraph("Proyek lama yang sudah 100 persen tetap dibawa sebagai selesai dengan catatan migrasi. Quest Majukan proyek diganti jika tidak ada proyek yang bisa dimajukan. Konfirmasi arsip, impor, dan meninggalkan draf memakai modal custom; Escape, tombol batal, tombol tutup, atau klik di luar modal membatalkan tindakan.")

doc.add_page_break()
heading(8, "File baru dan hubungan antarkomponen")
paragraph("Aturan proyek dipisahkan dari antarmuka agar pengembangan tidak menumpuk di main.js. Berikut fungsi file baru yang mendukung Project Hub.")
table(["File baru", "Tanggung jawab"], [
    ["project-engine.js", "Aturan brief, delapan tugas, prasyarat, status, template, notulen, arsip, migrasi, dan validasi data. Tidak mengurus tampilan."],
    ["project-ui.js", "Form Project Hub, kartu tugas, editor, checklist, notulen, arsip, ekspor impor, dan modal konfirmasi custom."],
    ["CHANGELOG.md", "Catatan penambahan, perubahan, perbaikan, dan batas fitur."],
    ["tests/\nproject-engine.test.cjs", "Tes aturan tugas, prasyarat, migrasi, arsip, dan penolakan data cacat."],
    ["tests/\nproject-ui.test.cjs", "Tes handler form dan tombol, perlindungan draf, impor, konfirmasi, dan fokus memakai DOM tiruan."],
    ["tests/\noffice-integration.cjs", "Tes model gerak kantor, label, notulen rapat, migrasi, penyimpanan, dan hadiah."],
], [2.35, 4.65])
paragraph("File lama yang diperbarui", bold=True)
bullet("3D-index.html memuat tombol dan struktur Project Hub, modal konfirmasi, serta dua skrip baru.")
bullet("style.css mengatur papan tugas, editor, arsip, modal siang malam, dan jarak tombol Buka Project Hub dari daftar tugas.")
bullet("main.js menghubungkan proyek dengan avatar, quest harian, happiness, dan penyimpanan otomatis.")
bullet("README.md menjadi panduan cara pakai, batas simulasi, migrasi, backup, dan tes.")
paragraph("Alur ketika tugas disetujui", bold=True)
paragraph("Tombol di project-ui.js meminta project-engine.js memeriksa syarat. Jika lolos, status berubah. main.js memperbarui progres dan happiness, kemudian menyimpan data serta memperbarui tampilan.")
paragraph("Cara mulai mencoba", bold=True)
paragraph("Refresh tab yang sama, buka Project Hub atau tekan P. Jika proyek lama sudah selesai, arsipkan dahulu lalu isi brief klien baru. Jalankan satu tugas dari Mulai hingga disetujui untuk melihat alur lengkapnya.")
paragraph("Node.js hanya diperlukan untuk menjalankan tes pengembangan, tidak untuk membuka kantor. Tes DOM dan model membantu memeriksa logika, tetapi tidak menggantikan pemeriksaan visual di browser.")

footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run("Pawffice  |  Halaman ").font.size = Pt(9)
field = OxmlElement("w:fldSimple")
field.set(qn("w:instr"), "PAGE")
footer._p.append(field)
doc.save(OUTPUT)
print(OUTPUT)
print(f"Sections: 8 | Tables: {len(doc.tables)} | Bytes: {OUTPUT.stat().st_size}")
