# PRD: Sistem Digital Sahabat Belajar

**Versi:** 0.2 (draft untuk diskusi dengan klien, belum final)
**Tanggal:** 8 November 2026
**Sumber:** company profile Sahabat Belajar (PDF, 20 slide) dan diskusi awal dengan pengembang

> Dokumen ini berisi asumsi yang perlu dikonfirmasi saat discovery. Bagian yang ditandai **[Keputusan klien]** belum bisa dikerjakan sebelum klien memutuskan.

---

## 1. Ringkasan

Sahabat Belajar adalah lembaga bimbingan belajar dengan layanan privat dan semi-privat (2-5 siswa), secara online (Zoom/Google Meet) maupun home visit. Ada dua segmen:

- **K-12:** pembelajar sekolah.
- **Program lanjutan:** persiapan CPNS/BUMN/PPPK, S2/S3 dan beasiswa, TOEFL/IELTS, kepenulisan ilmiah.

Produk ini adalah **aplikasi web** untuk mengelola operasional (pendaftar, jadwal, kuota, pembayaran, honor tutor) dan mewujudkan janji "pembelajaran berbasis data" di company profile (placement test, simulasi CAT, grafik performa, evaluasi real-time).

## 2. Latar Belakang dan Masalah

*Asumsi dari company profile, perlu dikonfirmasi.*

- Calon siswa masuk lewat WhatsApp/Instagram tanpa pencatatan terpusat.
- Jadwal tutor-siswa, absensi, dan sisa kuota dicatat manual (kemungkinan bentrok dan salah hitung).
- Pembayaran dan honor tutor direkap manual tiap akhir periode.
- Hasil belajar dan tryout belum tersaji sebagai grafik perkembangan.
- Fitur yang dijanjikan di profil (placement test, simulasi CAT, evaluasi real-time) belum didukung platform.

## 3. Tujuan dan Indikator Keberhasilan

**Tujuan**

1. Semua calon siswa dan siswa tercatat di satu sistem.
2. Penjadwalan, absensi, kuota, dan pembayaran berjalan tanpa rekap manual.
3. Siswa mendapat tes awal, tryout, dan laporan perkembangan yang terukur.
4. Citra profesional lewat website dan pendaftaran online.

**Indikator** *(angka target ditetapkan bersama klien saat discovery)*

- Persentase lead yang tercatat dan ditindaklanjuti.
- Waktu rekap bulanan (kuota, pembayaran, honor) dibanding sebelum sistem.
- Persentase sesi yang tercatat absensi dan jurnalnya.
- Jumlah siswa yang memakai tryout dan placement test (setelah Fase 2).

## 4. Peran Pengguna

| Peran | Deskripsi | Fase |
|---|---|---|
| Calon siswa/orang tua (publik) | Melihat program, paket, dan mendaftar | 1 |
| Admin/Owner | Akses penuh, laporan, pengaturan | 1 |
| Staf admin/CS | Mengelola pendaftaran, jadwal, pembayaran | 1 |
| Tutor | Melihat jadwal, mengisi absensi dan jurnal, memberi nilai | 1 |
| Siswa | Mengikuti tes dan tryout, melihat hasil dan jadwal | 2-3 |
| Orang tua | Memantau perkembangan anak, tagihan | 3 |

## 5. Ruang Lingkup

| Fase | Isi |
|---|---|
| **0** | Discovery, alur bisnis, kontrak, prioritas |
| **1 (MVP)** | Website publik dan lead, data master, penjadwalan, absensi dan jurnal, paket dan kuota, pembayaran manual, rekap honor tutor |
| **2** | Bank soal, mesin tryout/CAT, placement test, laporan dan grafik perkembangan, akun siswa |
| **3** | Portal siswa/orang tua, review dokumen tulisan, payment gateway, pengingat otomatis |

**Di luar lingkup (saat ini):** aplikasi mobile native, platform kelas live sendiri (kelas tetap memakai Zoom/Google Meet), pembuatan konten soal dan materi, perangkat keras.

## 6. Alur Utama

1. Calon siswa mengisi form atau menghubungi lewat WhatsApp, lead tercatat.
2. Admin menindaklanjuti dan mengatur placement test (Fase 2) atau konsultasi.
3. Siswa didaftarkan, memilih program, model kelas, dan paket.
4. Pembayaran dicatat, paket dan kuota aktif.
5. Admin menjadwalkan sesi dengan tutor yang sesuai.
6. Sesi berlangsung, tutor mengisi absensi dan jurnal, kuota berkurang.
7. Evaluasi/postest dan tryout berkala, hasil masuk laporan perkembangan.
8. Akhir periode: rekap honor tutor dan laporan ke orang tua.

## 7. Kebutuhan Fungsional

Prioritas: **Wajib** harus ada saat peluncuran, **Penting** sangat dianjurkan, **Opsional** bisa ditunda.

### Modul A: Website Publik dan Lead (Fase 1)

| ID | Kebutuhan | Prioritas | Kriteria terima |
|---|---|---|---|
| A1 | Halaman beranda, tentang, program dan sub-program, model kelas, paket, kontak | Wajib | Semua halaman tampil benar di ponsel dan desktop |
| A2 | Form pendaftaran/konsultasi (nama, kontak, program diminati, jenjang, model kelas) | Wajib | Pengiriman form membuat lead baru di admin dalam hitungan detik |
| A3 | Tombol WhatsApp dengan pesan templat | Wajib | Tombol membuka WhatsApp dengan teks awal terisi |
| A4 | Manajemen lead dengan status (baru, dihubungi, ikut placement, daftar, batal) dan catatan tindak lanjut | Wajib | Admin dapat mengubah status dan melihat riwayatnya |

### Modul B: Data Master (Fase 1)

| ID | Kebutuhan | Prioritas | Kriteria terima |
|---|---|---|---|
| B1 | Siswa: profil, jenjang, kontak orang tua, status | Wajib | Tambah, ubah, cari, dan nonaktifkan siswa |
| B2 | Tutor: profil, keahlian, ketersediaan, tarif honor per sesi | Wajib | Tarif honor hanya terlihat oleh admin dan tutor bersangkutan |
| B3 | Program, sub-program, model kelas (privat/semi-privat, online/home visit) | Wajib | Admin dapat mengelola daftar program |
| B4 | Paket: custom, berbasis waktu (1/3/6 bulan), berbasis kuota (5/10 pertemuan); durasi default 90 menit | Wajib | Paket dapat dibuat dan diaktifkan tanpa bantuan pengembang |
| B5 | Impor data siswa awal dari CSV | Wajib | File CSV contoh terimpor tanpa duplikat, kesalahan baris dilaporkan |

### Modul C: Penjadwalan dan Sesi (Fase 1)

| ID | Kebutuhan | Prioritas | Kriteria terima |
|---|---|---|---|
| C1 | Membuat sesi: tutor, siswa/kelompok, waktu, model, tautan Zoom/Meet atau alamat | Wajib | Sesi tampil di jadwal tutor dan siswa |
| C2 | Deteksi bentrok jadwal tutor dan siswa | Wajib | Sesi yang beririsan ditolak dengan pesan yang jelas |
| C3 | Sesi berulang mingguan | Penting | Satu aturan membuat banyak sesi, dapat diubah satu per satu |
| C4 | Penjadwalan ulang dan pembatalan dengan alasan tercatat | Wajib | Riwayat perubahan tersimpan |
| C5 | Kelas semi-privat 2-5 peserta | Wajib | Peserta ke-6 ditolak |
| C6 | Absensi per sesi dan jurnal pertemuan (materi, catatan, tugas) | Wajib | Tutor dapat mengisi dari ponsel; sesi tanpa absensi ditandai |

### Modul D: Paket, Kuota, dan Pembayaran (Fase 1)

| ID | Kebutuhan | Prioritas | Kriteria terima |
|---|---|---|---|
| D1 | Penetapan paket ke siswa dan pengurangan kuota otomatis | Wajib | Kuota berkurang tepat satu saat sesi ditandai terlaksana |
| D2 | Peringatan kuota hampir habis atau masa berlaku berakhir | Wajib | Daftar peringatan tampil di admin (ambang dapat diatur) |
| D3 | Pencatatan pembayaran manual (nominal, tanggal, bukti, status) | Wajib | Bukti dapat diunggah; status lunas/sebagian/belum |
| D4 | Riwayat dan status pembayaran per siswa | Wajib | Admin melihat sisa tagihan per paket |
| D5 | Payment gateway: tagihan, webhook, rekonsiliasi | Opsional (Fase 3) | Pembayaran online memperbarui status otomatis |

### Modul E: Honor Tutor (Fase 1)

| ID | Kebutuhan | Prioritas | Kriteria terima |
|---|---|---|---|
| E1 | Rekap sesi terlaksana per tutor per periode | Penting | Rekap cocok dengan hitungan manual pembanding |
| E2 | Perhitungan honor otomatis dan ekspor | Penting | Ekspor ke spreadsheet/PDF |

### Modul F: Tryout dan Simulasi CAT (Fase 2)

| ID | Kebutuhan | Prioritas | Kriteria terima |
|---|---|---|---|
| F1 | Bank soal berkategori (SKD: TWK/TIU/TKP; TKD BUMN; TOEFL; tes bakat skolastik; mapel K-12) | Wajib | Soal dapat ditambah, diubah, dan dinonaktifkan |
| F2 | Impor soal massal dari CSV/spreadsheet | Wajib | Format contoh disediakan; kesalahan baris dilaporkan |
| F3 | Paket tryout dengan durasi dan aturan skoring per jenis tes | Wajib | Aturan skoring berupa konfigurasi, bukan tertanam di kode |
| F4 | Mesin ujian: timer di server, navigasi soal, tandai ragu, simpan jawaban otomatis, lanjut jika koneksi putus | Wajib | Menutup browser lalu membuka kembali melanjutkan dari jawaban terakhir dengan sisa waktu benar |
| F5 | Skoring otomatis dan halaman pembahasan | Wajib | Skor sesuai perhitungan manual contoh uji |

### Modul G: Placement Test dan Laporan (Fase 2)

| ID | Kebutuhan | Prioritas | Kriteria terima |
|---|---|---|---|
| G1 | Placement test dengan peta kemampuan per kategori | Penting | Hasil menampilkan kategori terlemah |
| G2 | Grafik perkembangan skor per siswa | Penting | Menampilkan semua percobaan berurutan waktu |
| G3 | Laporan berkala cetak/PDF untuk orang tua | Penting | Dapat dicetak satu klik |
| G4 | Laporan lanjutan dan ekspor | Opsional (Fase 3) | Ekspor ke spreadsheet |

### Modul H: Portal Siswa dan Orang Tua (Fase 2-3)

| ID | Kebutuhan | Prioritas | Kriteria terima |
|---|---|---|---|
| H1 | Akun siswa minimal: login, ikut tes, melihat hasil (Fase 2) | Wajib | Siswa hanya melihat data miliknya |
| H2 | Portal: jadwal, nilai, tagihan, tautan rekaman, materi (Fase 3) | Penting | Data tampil sesuai peran |
| H3 | Orang tua memantau lebih dari satu anak | Penting | Orang tua hanya melihat anaknya |

### Modul I: Review Dokumen (Fase 3)

| ID | Kebutuhan | Prioritas | Kriteria terima |
|---|---|---|---|
| I1 | Siswa mengunggah draf (esai, motivation letter, bagian skripsi) | Penting | File tersimpan per versi |
| I2 | Mentor memberi komentar dan menandai tahap (drafting, editing, proofreading) | Penting | Riwayat versi dan komentar terlihat |

### Lainnya

| ID | Kebutuhan | Prioritas | Fase |
|---|---|---|---|
| X1 | Dashboard ringkas admin (sesi hari ini, kuota hampir habis, lead baru) | Opsional | 1 |
| X2 | Pengingat otomatis WhatsApp/email (jadwal, kuota, tagihan) | Opsional | 3 |

## 8. Aturan Bisnis

- **BR-1:** Kuota berkurang satu saat sesi ditandai terlaksana, bukan saat dijadwalkan. Perlakuan peserta izin/alpa **[Keputusan klien]**.
- **BR-2:** Jadwal ditolak bila tutor atau siswa sudah punya sesi yang beririsan waktu.
- **BR-3:** Kelas semi-privat maksimal 5 peserta; kuota tiap peserta dihitung sendiri.
- **BR-4:** Paket berbasis waktu berakhir pada tanggal akhir; paket berbasis kuota habis saat kuota terpakai sama dengan kuota total. Ambang peringatan dapat diatur.
- **BR-5:** Durasi default sesi 90 menit.
- **BR-6:** Honor tutor dihitung dari sesi terlaksana dan tarif tutor. Rumus final **[Keputusan klien]**.
- **BR-7:** Kebijakan pembatalan (kuota hangus atau diganti) dan masa berlaku paket **[Keputusan klien]**.
- **BR-8:** Data siswa anak: persetujuan orang tua dicatat saat pendaftaran; akses data dibatasi sesuai peran.
- **BR-9:** Timer tryout dihitung server; jawaban tersimpan otomatis; ujian dikumpulkan otomatis saat waktu habis.
- **BR-10:** Aturan skoring tiap jenis tes disimpan sebagai konfigurasi. Detail resmi tiap jenis tes diverifikasi saat Fase 2.

## 9. Model Data (usulan)

Nama tabel dan kolom bersifat usulan dan disesuaikan dengan template admin.

**Fase 1**

| Entitas | Kolom utama |
|---|---|
| users | id, name, email, phone, password_hash, role, is_active |
| leads | id, name, phone, email, program_interest, level, class_model, source, status, notes, assigned_to |
| students | id, user_id, lead_id, name, level, school, parent_name, parent_phone, parent_consent_at, status |
| tutors | id, user_id, name, phone, expertise, rate_per_session, status |
| programs | id, name, category, description, is_active |
| packages | id, name, type (custom/time/quota), duration_months, quota_sessions, session_minutes, price, is_active |
| student_packages | id, student_id, package_id, program_id, quota_total, quota_used, start_date, end_date, status |
| payments | id, student_package_id, amount, paid_at, method, proof_file, status, notes |
| sessions | id, tutor_id, program_id, class_type, mode, start_at, end_at, meeting_link, address, status, recurrence_id, cancel_reason |
| session_participants | id, session_id, student_id, student_package_id, attendance, quota_deducted |
| session_journals | id, session_id, topic, notes, homework |
| tutor_payouts | id, tutor_id, period_start, period_end, total_sessions, total_amount, status |

**Fase 2**

| Entitas | Kolom utama |
|---|---|
| questions | id, category, subcategory, type, text, options, answer_key, weight_rules, explanation, difficulty, is_active |
| tests | id, name, type, duration_minutes, scoring_rules |
| test_questions | test_id, question_id, position |
| test_attempts | id, test_id, student_id, started_at, deadline_at, submitted_at, score, status |
| attempt_answers | attempt_id, question_id, answer, flagged, time_spent |

**Fase 3**

| Entitas | Kolom utama |
|---|---|
| documents, document_versions, document_comments | id, student_id, title, version_no, file, status, comment |
| invoices | id, student_package_id, amount, due_date, gateway_ref, status |

## 10. Arsitektur

```
Pengguna (browser, HTTPS)
  Calon siswa/ortu | Admin/staf | Tutor | Siswa (F2-3)
          |
+---------v----------------------------------------------------+
| Aplikasi web (satu kode, satu server)                        |
| [Website publik] [Panel admin & tutor] [Ujian F2] [Portal F3]|
+--------------------------------------------------------------+
| Modul bisnis: Lead | Master | Jadwal & absensi | Kuota & bayar|
|               Honor | Soal & skor (F2) | Laporan (F2) | Pengingat |
+---------+----------------+------------------+----------------+
          |                |                  |
      Database        Penyimpanan file    Tugas terjadwal
          
Layanan luar: Zoom/Meet (tautan), WhatsApp (tautan; API di F3),
              Email, Payment gateway (F3)
```

**Pendekatan**

- Aplikasi dibangun custom penuh; panel admin memakai template yang sudah dimiliki pengembang.
- Satu aplikasi dengan modul terpisah per fitur (monolit modular), satu database relasional.
- Fase 1 tanpa integrasi berbayar: WhatsApp lewat tautan templat, pembayaran dicatat manual.
- Kelas live tetap di Zoom/Google Meet; sistem hanya menyimpan tautan dan rekaman.

**Keputusan teknis yang masih terbuka (diisi pengembang)**

| Hal | Catatan |
|---|---|
| Bahasa dan framework | Mengikuti stack dan template admin yang dikuasai |
| Database | Relasional (mis. PostgreSQL atau MySQL), migrasi terversi |
| Penyimpanan file | Disk server atau object storage; akses lewat tautan bertanda tangan |
| Hosting | VPS atau PaaS hemat biaya; domain milik klien |
| Tugas terjadwal | Cron atau antrian ringan |
| Pengiriman email | Penyedia email transaksional |

**Lingkungan dan operasional**

- Dua lingkungan: uji (staging) dan produksi; data klien asli hanya di produksi.
- HTTPS, kata sandi ter-hash, log audit untuk perubahan pembayaran dan nilai.
- Cadangan database harian ke luar server; pemulihan diuji sebelum peluncuran.
- Dokumentasi: panduan pemasangan untuk pengembang dan panduan singkat untuk admin.

## 11. Hak Akses

| Modul | Admin | Staf | Tutor | Siswa | Orang tua |
|---|---|---|---|---|---|
| Lead | Kelola | Kelola | - | - | - |
| Data master | Kelola | Kelola (tanpa tarif honor) | Lihat siswanya | Profil sendiri | Profil anak |
| Jadwal | Kelola | Kelola | Lihat, ubah status sesinya | Lihat | Lihat (F3) |
| Absensi dan jurnal | Kelola | Lihat | Kelola sesinya | Lihat | Lihat (F3) |
| Paket dan pembayaran | Kelola | Kelola | - | Lihat | Lihat (F3) |
| Honor | Kelola | Lihat | Lihat miliknya | - | - |
| Soal dan tryout | Kelola | Lihat | Sesuai keputusan klien | Ikut tes, lihat hasil | Lihat hasil (F3) |

## 12. Kebutuhan Non-Fungsional

- **Keamanan:** akses berbasis peran, kata sandi ter-hash, pembatasan percobaan login, log audit untuk data keuangan dan nilai.
- **Privasi:** data siswa anak-anak dilindungi, persetujuan orang tua, kebijakan privasi sesuai UU Pelindungan Data Pribadi.
- **Performa:** tryout stabil untuk peserta bersamaan (jumlah target ditentukan bersama klien).
- **Penggunaan:** responsif di ponsel, mudah dioperasikan admin non-teknis, bahasa antarmuka Indonesia.
- **Pemeliharaan:** kode terdokumentasi, lingkungan uji terpisah dari produksi, tes otomatis untuk aturan bisnis kuota, bentrok jadwal, honor, dan skoring.

## 13. Fase, Prioritas, dan Estimasi

Estimasi memakai kapasitas sekitar 14 jam per minggu dan sudah memperhitungkan template admin yang ada. Angka berupa rentang jam kerja bersih dan belum termasuk waktu menunggu keputusan klien.

### Ringkasan

| Fase | Isi | Jam kerja | Durasi |
|---|---|---|---|
| 0 | Discovery | 8-10 | 1 minggu |
| 1 | Fondasi (MVP) | 130-170 | 9-12 minggu |
| 2 | Tryout dan laporan | 128-170 | 9-12 minggu |
| 3 | Portal dan otomatisasi | 98-132 | 7-10 minggu |
| **Total** | | **364-482** | **26-35 minggu (6-8 bulan)** |

### Fase 1: Fondasi (MVP)

| Fitur | Modul | Prioritas | Jam |
|---|---|---|---|
| Setup proyek, login berbasis peran, adaptasi template admin, jalur deploy | Fondasi | Wajib | 14-18 |
| Website publik responsif | A | Wajib | 18-24 |
| Form pendaftaran dan manajemen lead | A | Wajib | 8-10 |
| Data master siswa, tutor, program, paket | B | Wajib | 12-16 |
| Penjadwalan sesi (termasuk berulang) dan deteksi bentrok | C | Wajib | 18-24 |
| Absensi dan jurnal pertemuan | C | Wajib | 8-10 |
| Paket, kuota otomatis, peringatan kuota | D | Wajib | 10-14 |
| Pencatatan pembayaran manual dan status | D | Wajib | 8-10 |
| Rekap honor tutor dan ekspor | E | Penting | 8-10 |
| Dashboard ringkas admin | X1 | Opsional | 8-10 |
| Impor data awal, pengujian, perbaikan, peluncuran, pelatihan dan panduan admin | Fondasi | Wajib | 18-24 |
| **Total Fase 1** | | | **130-170** |

### Fase 2: Tryout dan Laporan

| Fitur | Modul | Prioritas | Jam |
|---|---|---|---|
| Bank soal berkategori dan impor CSV | F | Wajib | 22-28 |
| Paket tryout dan aturan skoring per jenis tes | F | Wajib | 16-22 |
| Mesin ujian (timer server, navigasi, tandai ragu, simpan otomatis, lanjut jika putus) | F | Wajib | 28-36 |
| Skoring otomatis dan pembahasan | F | Wajib | 14-18 |
| Placement test dengan peta kemampuan | G | Penting | 10-14 |
| Laporan dan grafik perkembangan per siswa, cetak/PDF | G | Penting | 16-22 |
| Akun siswa minimal | H | Wajib | 10-14 |
| Uji beban sederhana, perbaikan, panduan | Fondasi | Wajib | 12-16 |
| **Total Fase 2** | | | **128-170** |

### Fase 3: Portal dan Otomatisasi (indikatif)

| Fitur | Modul | Prioritas | Jam |
|---|---|---|---|
| Portal siswa dan orang tua | H | Penting | 28-36 |
| Alur review dokumen | I | Penting | 26-34 |
| Payment gateway | D | Opsional | 20-28 |
| Pengingat otomatis WhatsApp/email | X2 | Opsional | 14-20 |
| Laporan lanjutan dan ekspor | G | Opsional | 10-14 |
| **Total Fase 3** | | | **98-132** |

### Jika waktu mepet

- Dashboard ringkas (8-10 jam) dan sesi berulang (bagian dari penjadwalan) menyusul setelah peluncuran.
- Rekap honor sementara berupa ekspor data sesi ke spreadsheet.
- Laporan Fase 2 cukup berupa halaman grafik dulu, versi cetak/PDF menyusul.
- Menambah kapasitas menjadi sekitar 18 jam per minggu memangkas Fase 1 menjadi sekitar 7-9 minggu.

## 14. Jadwal dan Jalur

Dua jalur yang bisa dipilih klien:

| Jalur | Isi | Selesai (perkiraan, batas atas) |
|---|---|---|
| **A: Operasional** | Fase 0 + Fase 1 tanpa dashboard ringkas | sekitar minggu ke-13 (3 bulan) |
| **B: Operasional + tryout awal** | Jalur A + Fase 2 inti | sekitar minggu ke-22 (5 bulan) |

**Milestone yang bisa dicoba klien (perkiraan)**

| Minggu | Hasil |
|---|---|
| 5 | Website dan pendaftaran online mulai jalan |
| 9 | Data siswa, tutor, jadwal, dan absensi bisa dicoba |
| 11 | Sisa pertemuan, pembayaran, dan honor tutor siap |
| 13 | Sistem mulai dipakai sehari-hari (Jalur A selesai) |
| 22 | Tryout awal bisa dipakai siswa (Jalur B selesai) |

Demo singkat tiap dua minggu agar klien bisa memberi masukan sambil jalan. Seluruh sistem (Fase 0-3) sekitar minggu ke-35 di batas atas.

## 15. Kriteria Penerimaan MVP (Jalur A)

- Admin dapat menambah siswa, tutor, paket, dan jadwal tanpa bantuan pengembang.
- Jadwal bentrok terdeteksi dan kuota berkurang otomatis setelah sesi ditandai terlaksana.
- Form pendaftaran dari website tercatat sebagai lead di admin.
- Rekap honor tutor satu periode dapat diekspor dan sesuai hitungan manual pembanding.
- Dipakai dengan data nyata minimal satu siklus (satu bulan atau satu paket) tanpa kendala besar.
- Admin sudah mendapat pelatihan dan panduan singkat.

## 16. Risiko dan Asumsi

**Asumsi**

- Klien menyediakan aset brand final (kontak, domain, media sosial, logo); di profil saat ini masih ada placeholder (`08xxx`, `@xxxx`, `reallygreatsite.com`).
- Klien bertanggung jawab atas isi bank soal dan materi, termasuk hak ciptanya.
- Klien dan staf siap dilatih dan memakai sistem sehari-hari.

**Risiko**

| Risiko | Mitigasi |
|---|---|
| Perubahan lingkup | Perubahan di luar PRD melalui change request; kunci lingkup per fase |
| Adopsi rendah | Pelatihan admin dan panduan singkat; mulai dari alur yang paling menyakitkan |
| Estimasi mesin ujian dan skoring paling tidak pasti | Sisakan buffer; uji dengan peserta sungguhan sebelum dipakai |
| Kapasitas 14 jam per minggu; satu minggu terlewat menggeser jadwal | Jadwal dengan toleransi; demo tiap dua minggu |
| Kebijakan belum diputuskan (pembatalan, honor, masa berlaku paket) | Selesaikan di minggu pertama; modul kuota dan honor menunggu keputusan |
| Data anak di bawah umur | Persetujuan orang tua, hak akses ketat, kebijakan privasi |
| Hak cipta soal | Soal disiapkan dan dijamin klien |

## 17. Pertanyaan Terbuka untuk Klien

1. Jumlah siswa dan tutor aktif saat ini dan target 12 bulan ke depan?
2. Mana yang lebih mendesak: merapikan operasional (jadwal, kuota, pembayaran) atau tryout dulu?
3. Segmen mana yang diprioritaskan untuk didigitalkan lebih dulu?
4. Alat apa yang dipakai sekarang untuk pendaftaran, jadwal, absensi, dan pembayaran?
5. Siapa yang akan mengoperasikan sistem, dan bagaimana kemampuan digitalnya?
6. Bank soal sudah ada? Siapa yang menyusun dan memperbarui?
7. Skema tarif paket dan honor tutor (per sesi, per jam, tetap)?
8. Kebijakan pembatalan dan perlakuan izin/alpa terhadap kuota?
9. Pembayaran online perlu sejak awal atau cukup manual dulu?
10. Domain apa yang dipakai (tetap subdomain atau domain sendiri)?
11. Batas anggaran dan target peluncuran?
12. Apakah perlu laporan ke orang tua, dan seperti apa formatnya?

## 18. Keputusan yang Perlu Disepakati Sebelum Mulai

| Keputusan | Pemilik |
|---|---|
| Jalur A atau B | Klien |
| Kebijakan pembatalan, izin/alpa, masa berlaku paket | Klien |
| Rumus honor tutor | Klien |
| Penyedia bank soal dan jenis tes yang diprioritaskan | Klien |
| Stack teknis dan hosting | Pengembang |
| Pembagian pembayaran per milestone dan jumlah revisi | Klien dan pengembang |
